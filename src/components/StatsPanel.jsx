import { useState } from "react";

const WORKER_URL = import.meta.env.VITE_WORKER_URL || "http://localhost:8787";

export default function StatsPanel({ initialCode }) {
  const [code, setCode] = useState(initialCode || "");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    if (!code.trim()) return setError("Enter a short code");
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${WORKER_URL}/api/stats/${code}`);
      if (!res.ok) throw new Error("Code not found");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="analytics-wrapper">
      {/* TOP SECTION - title */}
      <header className="analytics-hero animate-in" style={{ animationDelay: "0ms" }}>
        <div className="analytics-title">
          <span className="analytics-title-text">ANALYTICS_</span>
          <span className="analytics-cursor" />
        </div>
      </header>

      {/* INPUT SECTION - terminal line */}
      <section className="terminal-card animate-in" style={{ animationDelay: "100ms" }}>
        <div className="terminal-header">
          <span className="terminal-dot red" />
          <span className="terminal-dot amber" />
          <span className="terminal-dot green" />
          <span className="terminal-label">snip@dev:~/analytics</span>
        </div>

        <div className="terminal-body">
          <div className="terminal-prompt">
            <span className="prompt-symbol">$</span>
            <span className="prompt-path"> snip.dev/</span>
            <input
              className="terminal-input"
              placeholder="your_code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchStats()}
            />
            <button
              className="terminal-execute-btn"
              onClick={fetchStats}
              disabled={loading}
            >
              {loading ? <span className="terminal-spinner" /> : "EXECUTE →"}
            </button>
          </div>

          {error && (
            <div className="terminal-error-line">
              <span className="error-prefix">[ERR]</span>
              <span>{error}</span>
            </div>
          )}
        </div>
      </section>

      {/* STATS SECTION */}
      {stats && (
        <section className="analytics-content animate-in" style={{ animationDelay: "200ms" }}>
          {/* Metric cards */}
          <div className="metrics-grid">
            <div className="metric-card metric-total">
              <div className="metric-label">Total clicks</div>
              <div className="metric-value">
                {stats.totalClicks ?? 0}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Unique countries</div>
              <div className="metric-value">
                {stats.uniqueCountries ?? 0}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Clicks today</div>
              <div className="metric-value">
                {stats.clicksToday ?? 0}
              </div>
            </div>
          </div>

          {/* URL DISPLAY */}
          <div className="url-block animate-in" style={{ animationDelay: "250ms" }}>
            <div className="url-header">
              <span className="url-label">Original URL</span>
              <span className="url-redirect">→ REDIRECT</span>
            </div>
            <a
              href={stats.originalUrl}
              target="_blank"
              rel="noreferrer"
              className="url-mono"
            >
              {stats.originalUrl}
            </a>
          </div>

          {/* RECENT CLICKS TABLE */}
          {stats.recentClicks?.length > 0 && (
            <div className="recent-block animate-in" style={{ animationDelay: "300ms" }}>
              <div className="recent-header">
                <span className="recent-title">Recent clicks</span>
              </div>

              <div className="recent-table">
                <div className="recent-row recent-head-row">
                  <span className="col-index">#</span>
                  <span className="col-country">COUNTRY</span>
                  <span className="col-time">TIME</span>
                </div>

                {stats.recentClicks.map((click, i) => (
                  <div
                    key={i}
                    className="recent-row recent-data-row"
                    style={{ animationDelay: `${(i + 1) * 90}ms` }}
                  >
                    <span className="col-index">{i + 1}</span>
                    <span className="col-country">
                      {click.country || "UNKNOWN"}
                    </span>
                    <span className="col-time">
                      {new Date(click.timestamp).toLocaleString("uk-UA")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <style>{`
        .analytics-wrapper {
          padding-bottom: 40px;
        }

        /* Shared animations */
        .animate-in {
          opacity: 0;
          transform: translateY(8px);
          animation: fadeInUp 0.4s ease forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* TOP SECTION */
        .analytics-hero {
          margin-bottom: 32px;
          max-width: 680px;
          margin-left: auto;
          margin-right: auto;
        }

        .analytics-title {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: "Syne", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: clamp(40px, 8vw, 72px);
          font-weight: 800;
          letter-spacing: -3px;
          text-transform: uppercase;
          width: auto;
          max-width: 100%;
        }

        .analytics-title-text {
          color: var(--accent);
        }

        .analytics-cursor {
          width: 0.8ch;
          height: 1.1em;
          background: var(--accent2);
          display: inline-block;
          transform: translateY(2px);
          animation: cursorBlink 1s steps(2, start) infinite;
        }

        @keyframes cursorBlink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }

        /* TERMINAL CARD */
        .terminal-card {
          background: var(--surface);
          border-radius: 12px;
          border: 1px solid var(--border);
          overflow: hidden;
          margin-bottom: 24px;
        }

        .terminal-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: linear-gradient(90deg, #050505, #101010);
          border-bottom: 1px solid #181818;
          font-family: "JetBrains Mono", monospace;
          font-size: 13px;
          color: var(--muted);
        }

        .terminal-dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
        }
        .terminal-dot.red { background: #ff5f57; }
        .terminal-dot.amber { background: #ffbd2e; }
        .terminal-dot.green { background: #28ca41; }

        .terminal-label {
          margin-left: 6px;
        }

        .terminal-body {
          padding: 20px;
          font-family: "JetBrains Mono", monospace;
          font-size: 13px;
          color: var(--text);
        }

        .terminal-prompt {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .prompt-symbol {
          color: var(--accent2);
        }

        .prompt-path {
          color: var(--muted);
          white-space: nowrap;
        }

        .terminal-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          color: var(--text);
          font-family: "JetBrains Mono", monospace;
          font-size: 14px;
          padding: 6px 4px;
          min-width: 0;
        }

        .terminal-input::placeholder {
          color: #444;
        }

        .terminal-execute-btn {
          border: 1.5px solid var(--accent);
          background: transparent;
          color: var(--accent);
          font-family: "JetBrains Mono", monospace;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
        }

        .terminal-execute-btn:hover:not(:disabled) {
          background: var(--accent);
          color: #0a0a0a;
          transform: translateY(-1px);
        }

        .terminal-execute-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .terminal-spinner {
          width: 14px;
          height: 14px;
          border-radius: 999px;
          border: 2px solid #333;
          border-top-color: var(--accent2);
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .terminal-error-line {
          margin-top: 10px;
          display: flex;
          gap: 8px;
          align-items: center;
          font-size: 12px;
          color: #ff6b6b;
        }

        .error-prefix {
          color: #ff6b6b;
          font-weight: 600;
        }

        /* METRICS GRID */
        .analytics-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .metric-card {
          position: relative;
          padding: 16px 16px 18px 16px;
          background: radial-gradient(circle at top left, #181818 0, var(--surface2) 40%, #050505 100%);
          border-radius: 12px;
          border: 1px solid var(--border);
          overflow: hidden;
          font-family: "JetBrains Mono", monospace;
        }

        .metric-card::before {
          content: "";
          position: absolute;
          inset: -40%;
          background-image: repeating-linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.06),
            rgba(255, 255, 255, 0.06) 1px,
            transparent 1px,
            transparent 3px
          );
          opacity: 0;
          mix-blend-mode: soft-light;
          pointer-events: none;
        }

        .metric-card:hover::before {
          opacity: 1;
          animation: scanLines 2s linear infinite;
        }

        @keyframes scanLines {
          from {
            transform: translateY(-10%);
          }
          to {
            transform: translateY(10%);
          }
        }

        .metric-card::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border-left: 3px solid transparent;
        }

        .metric-total::after {
          border-left-color: var(--accent2);
        }

        .metric-label {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 10px;
        }

        .metric-value {
          font-size: clamp(26px, 5vw, 34px);
          font-weight: 700;
          color: var(--accent2);
        }

        /* URL BLOCK */
        .url-block {
          background: var(--surface2);
          border-radius: 10px;
          border: 1px solid var(--border);
          padding: 14px 14px 12px 14px;
          font-family: "JetBrains Mono", monospace;
        }

        .url-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .url-label {
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .url-redirect {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent2);
        }

        .url-mono {
          display: block;
          font-size: 12px;
          color: var(--accent);
          text-decoration: none;
          word-break: break-all;
        }

        .url-mono:hover {
          text-decoration: underline;
        }

        /* RECENT CLICKS TABLE */
        .recent-block {
          background: var(--surface2);
          border-radius: 10px;
          border: 1px solid var(--border);
          padding: 14px;
          font-family: "JetBrains Mono", monospace;
        }

        .recent-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .recent-title {
          font-family: "Syne", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 14px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .recent-table {
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .recent-row {
          display: grid;
          grid-template-columns: 40px 1.2fr 1.8fr;
          padding: 8px 10px;
          align-items: center;
          font-size: 11px;
        }

        .recent-head-row {
          background: #050505;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.16em;
        }

        .recent-data-row {
          background: rgba(10, 10, 10, 0.96);
          animation: rowFadeIn 0.35s ease forwards;
          opacity: 0;
          transform: translateY(4px);
        }

        .recent-data-row:nth-of-type(even) {
          background: rgba(16, 16, 16, 0.96);
        }

        @keyframes rowFadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .col-index {
          color: var(--muted);
        }

        .col-country {
          font-weight: 500;
        }

        .col-time {
          color: var(--muted);
          font-size: 10px;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          /* Tablet: title & layout */
          .analytics-hero {
            max-width: 680px;
            margin-inline: auto;
          }

          .analytics-title {
            font-size: 52px;
            letter-spacing: -3px;
          }

          .analytics-wrapper {
            padding-bottom: 32px;
          }

          /* Tablet: stats grid 2 columns */
          .metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .terminal-card {
            width: 100%;
          }

          .terminal-body {
            padding: 20px;
          }

          .terminal-prompt {
            flex-wrap: wrap;
            align-items: flex-start;
          }

          .terminal-execute-btn {
            margin-left: auto;
            margin-top: 8px;
          }

          .recent-row {
            grid-template-columns: 26px 0.9fr 1.8fr;
          }
        }

        @media (max-width: 480px) {
          /* Mobile: compact title */
          .analytics-title {
            font-size: 36px;
            letter-spacing: -3px;
          }

          .analytics-wrapper {
            padding-bottom: 24px;
          }

          /* Mobile: terminal full width & stacked input */
          .terminal-card {
            width: 100%;
          }

          .terminal-body {
            padding: 16px;
          }

          .terminal-prompt {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .terminal-execute-btn {
            width: 100%;
            justify-content: center;
            margin-left: 0;
          }

          /* Mobile: stats cards stacked */
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
