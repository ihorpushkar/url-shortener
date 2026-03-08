const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://snip.dev',
]
const ALLOWED_METHODS = 'GET, POST, OPTIONS'

function getCorsHeaders(origin) {
  if (!origin) {
    // Non-browser or same-origin navigation (no CORS required)
    return {}
  }
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return null
  }
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': ALLOWED_METHODS,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

function jsonResponse(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  })
}

function getClientIp(request) {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    'unknown'
  )
}

async function checkRateLimit(env, request) {
  const ip = getClientIp(request)
  const key = `rate:${ip}`

  const current = await env.URL_STORE.get(key)
  const count = current ? parseInt(current, 10) || 0 : 0

  if (count >= 10) {
    return false
  }

  await env.URL_STORE.put(key, String(count + 1), { expirationTtl: 60 })
  return true
}

function generateCode(length = 8) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const randomBytes = new Uint8Array(length)
  crypto.getRandomValues(randomBytes)

  let result = ''
  for (let i = 0; i < length; i++) {
    const idx = randomBytes[i] % chars.length
    result += chars[idx]
  }
  return result
}

async function generateUniqueCode(env) {
  for (let i = 0; i < 5; i++) {
    const code = generateCode(8)
    const existing = await env.URL_STORE.get(code)
    if (!existing) return code
  }
  throw new Error('Failed to generate unique short code')
}

function isValidUrl(url) {
  if (typeof url !== 'string') return false
  if (!url.startsWith('https://') && !url.startsWith('http://')) return false
  try {
    // eslint-disable-next-line no-new
    new URL(url)
    return true
  } catch {
    return false
  }
}

async function handleShorten(request, env, corsHeaders) {
  if (!(await checkRateLimit(env, request))) {
    return jsonResponse(
      { error: 'Too many requests, slow down' },
      429,
      corsHeaders,
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400, corsHeaders)
  }

  const url = body?.url
  if (!isValidUrl(url)) {
    return jsonResponse(
      { error: 'Invalid URL. Must start with http:// or https://.' },
      400,
      corsHeaders,
    )
  }

  const code = await generateUniqueCode(env)

  await env.URL_STORE.put(code, url, {
    expirationTtl: 60 * 60 * 24 * 90, // 90 days
  })

  const shortUrl = `https://snip.dev/${code}`

  return jsonResponse({ shortCode: code, shortUrl }, 200, corsHeaders)
}

async function recordClick(env, request, code) {
  const country = request.headers.get('CF-IPCountry') || 'unknown'

  try {
    await env.DB.prepare(
      'INSERT INTO clicks (code, timestamp, country) VALUES (?1, datetime("now"), ?2)',
    )
      .bind(code, country)
      .run()
  } catch (err) {
    // Swallow DB errors so redirects still work
    console.error('Error recording click', err)
  }
}

async function handleRedirect(request, env, code) {
  const originalUrl = await env.URL_STORE.get(code)
  if (!originalUrl) {
    return jsonResponse({ error: 'Not found' }, 404)
  }

  // Fire-and-forget logging of the click
  env.ctx?.waitUntil?.(recordClick(env, request, code))

  return Response.redirect(originalUrl, 301)
}

async function getStats(env, code) {
  const db = env.DB

  const totalRow = await db
    .prepare('SELECT COUNT(*) AS count FROM clicks WHERE code = ?1')
    .bind(code)
    .first()

  const todayRow = await db
    .prepare(
      'SELECT COUNT(*) AS count FROM clicks WHERE code = ?1 AND date(timestamp) = date("now")',
    )
    .bind(code)
    .first()

  const uniqueCountriesRow = await db
    .prepare(
      'SELECT COUNT(DISTINCT country) AS count FROM clicks WHERE code = ?1',
    )
    .bind(code)
    .first()

  const recent = await db
    .prepare(
      'SELECT code, timestamp, country FROM clicks WHERE code = ?1 ORDER BY timestamp DESC LIMIT 10',
    )
    .bind(code)
    .all()

  return {
    totalClicks: totalRow?.count ?? 0,
    clicksToday: todayRow?.count ?? 0,
    uniqueCountries: uniqueCountriesRow?.count ?? 0,
    recentClicks: recent?.results ?? [],
  }
}

async function handleStats(env, code, corsHeaders) {
  const originalUrl = await env.URL_STORE.get(code)

  if (!originalUrl) {
    return jsonResponse({ error: 'Not found' }, 404, corsHeaders)
  }

  try {
    const stats = await getStats(env, code)
    return jsonResponse(
      {
        code,
        originalUrl,
        ...stats,
      },
      200,
      corsHeaders,
    )
  } catch (err) {
    console.error('Error fetching stats', err)
    return jsonResponse({ error: 'Internal server error' }, 500, corsHeaders)
  }
}

export default {
  /**
   * @param {Request} request
   * @param {Record<string, any>} env
   * @param {ExecutionContext} ctx
   */
  async fetch(request, env, ctx) {
    // Attach ctx to env so helpers can access waitUntil without threading it everywhere
    env.ctx = ctx

    const url = new URL(request.url)
    const pathname = url.pathname
    const method = request.method.toUpperCase()
    const origin = request.headers.get('Origin')
    const corsHeaders = getCorsHeaders(origin)

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      if (!corsHeaders && origin) {
        return new Response('Forbidden', { status: 403 })
      }
      return new Response(null, {
        status: 204,
        headers: corsHeaders || {},
      })
    }

    // Reject disallowed origins for CORS-aware requests
    if (origin && !corsHeaders) {
      return jsonResponse({ error: 'Forbidden origin' }, 403)
    }

    if (method === 'POST' && pathname === '/api/shorten') {
      return handleShorten(request, env, corsHeaders || {})
    }

    if (method === 'GET' && pathname.startsWith('/api/stats/')) {
      const code = pathname.replace('/api/stats/', '').trim()
      if (!code) {
        return jsonResponse({ error: 'Missing code' }, 400, corsHeaders || {})
      }
      return handleStats(env, code, corsHeaders || {})
    }

    if (method === 'GET') {
      // Redirect handler for /:code (ignore / and /favicon.ico)
      if (pathname === '/' || pathname === '/favicon.ico') {
        return jsonResponse({ message: 'URL Shortener Worker' }, 200, {
          ...corsHeaders,
        })
      }

      const code = pathname.slice(1) // remove leading '/'
      if (!code) {
        return jsonResponse({ error: 'Not found' }, 404, corsHeaders || {})
      }

      return handleRedirect(request, env, code)
    }

    return jsonResponse({ error: 'Not found' }, 404, corsHeaders || {})
  },
}

