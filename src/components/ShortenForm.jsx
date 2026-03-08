import { useState } from "react";

// 🔧 Змініть на ваш Worker URL після деплою
const WORKER_URL = import.meta.env.VITE_WORKER_URL || "http://localhost:8787";

export default function ShortenForm({ onShortened }) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const isValidUrl = (str) => {
    try { new URL(str); return true; }
    catch { return false; }
  };

  const handleShorten = async () => {
    setError(null);
    if (!url.trim()) return setError("Введіть URL");
    if (!isValidUrl(url)) return setError("Невалідний URL — додайте https://");

    setLoading(true);
    try {
      const res = await fetch(`${WORKER_URL}/api/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Помилка сервера");
      const data = await res.json();
      setResult(data);
      onShortened?.(data.shortCode);
    } catch (e) {
      setError(e.message || "Щось пішло не так");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setUrl("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="form-wrapper">
      <div className="hero">
        <h1>Скороти<br /><em>будь-який</em> URL</h1>
        <p className="subtitle">Cloudflare KV · миттєво · безкоштовно</p>
      </div>

      {!result ? (
        <div className="card">
          <div className="input-row">
            <div className={`input-wrap ${error ? "has-error" : ""}`}>
              <span className="input-prefix">https://</span>
              <input
                type="text"
                placeholder="your-very-long-url.com/with/path?and=params"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleShorten()}
                className="url-input"
              />
            </div>
            <button
              className={`shorten-btn ${loading ? "loading" : ""}`}
              onClick={handleShorten}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : "Скоротити →"}
            </button>
          </div>

          {error && (
            <div className="error-msg">
              <span>⚠</span> {error}
            </div>
          )}

          <div className="hints">
            <span className="hint">↵ Enter для відправки</span>
            <span className="hint">Підтримує будь-який https:// URL</span>
          </div>
        </div>
      ) : (
        <div className="card result-card">
          <div className="result-label">Готово!</div>

          <div className="result-url-block">
            <span className="result-url">{result.shortUrl}</span>
            <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={handleCopy}>
              {copied ? "✓ Скопійовано" : "Копіювати"}
            </button>
          </div>

          <div className="result-meta">
            <div className="meta-item">
              <span className="meta-label">Оригінал</span>
              <span className="meta-value truncate">{url}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Код</span>
              <span className="meta-value mono">{result.shortCode}</span>
            </div>
          </div>

          <div className="result-actions">
            <a href={`/stats/${result.shortCode}`} className="stats-link">
              Переглянути статистику →
            </a>
            <button className="reset-btn" onClick={handleReset}>
              + Скоротити ще
            </button>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        .form-wrapper { padding-bottom: 40px; }

        .hero { margin-bottom: 40px; }

        .hero h1 {
          font-size: clamp(42px, 8vw, 64px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -2px;
          color: var(--text);
        }

        .hero h1 em {
          font-style: normal;
          color: var(--accent);
          position: relative;
        }

        .subtitle {
          margin-top: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: var(--muted);
          letter-spacing: 0.5px;
        }

        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
        }

        .input-row {
          display: flex;
          gap: 10px;
          align-items: stretch;
        }

        .input-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          background: var(--surface2);
          border: 1.5px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          transition: border-color 0.15s;
        }

        .input-wrap:focus-within { border-color: var(--accent); }
        .input-wrap.has-error { border-color: #ff4444; }

        .input-prefix {
          padding: 0 10px 0 14px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: var(--muted);
          white-space: nowrap;
          user-select: none;
        }

        .url-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          padding: 14px 14px 14px 0;
          min-width: 0;
        }

        .url-input::placeholder { color: #444; }

        .shorten-btn {
          background: var(--accent);
          color: #0a0a0a;
          border: none;
          border-radius: 8px;
          padding: 0 20px;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 130px;
          justify-content: center;
        }

        .shorten-btn:hover:not(:disabled) { background: #d9ff4a; transform: translateY(-1px); }
        .shorten-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .shorten-btn.loading { background: var(--surface2); color: var(--muted); }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid #444;
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .error-msg {
          margin-top: 10px;
          font-size: 13px;
          color: #ff6b6b;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .hints {
          margin-top: 14px;
          display: flex;
          gap: 16px;
        }

        .hint {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #444;
        }

        /* Result card */
        .result-card { animation: slideUp 0.3s ease; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .result-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 16px;
        }

        .result-url-block {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px 16px;
          margin-bottom: 20px;
        }

        .result-url {
          flex: 1;
          font-family: 'JetBrains Mono', monospace;
          font-size: 15px;
          font-weight: 500;
          color: var(--accent);
          letter-spacing: -0.3px;
        }

        .copy-btn {
          background: var(--accent);
          color: #0a0a0a;
          border: none;
          border-radius: 6px;
          padding: 8px 14px;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .copy-btn.copied { background: #4ade80; }
        .copy-btn:hover:not(.copied) { background: #d9ff4a; }

        .result-meta {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }

        .meta-item { display: flex; gap: 12px; align-items: baseline; }

        .meta-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          min-width: 60px;
        }

        .meta-value {
          font-size: 13px;
          color: #aaa;
        }

        .meta-value.truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 400px;
        }

        .meta-value.mono { font-family: 'JetBrains Mono', monospace; color: var(--text); }

        .result-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .stats-link {
          font-size: 13px;
          color: var(--accent);
          text-decoration: none;
          font-weight: 700;
        }

        .stats-link:hover { text-decoration: underline; }

        .reset-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted);
          border-radius: 6px;
          padding: 8px 14px;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
        }

        .reset-btn:hover { border-color: var(--text); color: var(--text); }

        @media (max-width: 480px) {
          .input-row { flex-direction: column; }
          .shorten-btn { padding: 14px; }
          .result-url-block { flex-direction: column; align-items: stretch; }
        }
      `}</style>
    </div>
  );
}
