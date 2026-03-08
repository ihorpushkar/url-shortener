import { useState } from "react";

const WORKER_URL = import.meta.env.VITE_WORKER_URL || "http://localhost:8787";

export default function StatsPanel({ initialCode }) {
  const [code, setCode] = useState(initialCode || "");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    if (!code.trim()) return setError("Введіть короткий код");
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${WORKER_URL}/api/stats/${code}`);
      if (!res.ok) throw new Error("Код не знайдено");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stats-wrapper">
      <div className="hero">
        <h1>Статис<br /><em>тика</em></h1>
        <p className="subtitle">Кліки · Країни · Дати</p>
      </div>

      <div className="card">
        <div className="input-row">
          <div className="input-wrap">
            <span className="input-prefix">snip.dev/</span>
            <input
              className="code-input"
              placeholder="abc123"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchStats()}
            />
          </div>
          <button className="search-btn" onClick={fetchStats} disabled={loading}>
            {loading ? <span className="spinner" /> : "Знайти →"}
          </button>
        </div>
        {error && <div className="error-msg"><span>⚠</span> {error}</div>}
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card big">
            <span className="stat-num">{stats.totalClicks ?? 0}</span>
            <span className="stat-label">Всього кліків</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{stats.uniqueCountries ?? 0}</span>
            <span className="stat-label">Країн</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{stats.clicksToday ?? 0}</span>
            <span className="stat-label">Сьогодні</span>
          </div>

          <div className="stat-card wide">
            <span className="stat-label">Оригінальний URL</span>
            <a href={stats.originalUrl} target="_blank" rel="noreferrer" className="original-url">
              {stats.originalUrl}
            </a>
          </div>

          {stats.recentClicks?.length > 0 && (
            <div className="stat-card wide">
              <span className="stat-label" style={{marginBottom: '12px', display:'block'}}>Останні кліки</span>
              <div className="clicks-list">
                {stats.recentClicks.map((click, i) => (
                  <div key={i} className="click-row">
                    <span className="click-country">{click.country || "🌍 Unknown"}</span>
                    <span className="click-time">{new Date(click.timestamp).toLocaleString("uk-UA")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .stats-wrapper { padding-bottom: 40px; }
        .hero { margin-bottom: 40px; }
        .hero h1 {
          font-size: clamp(42px, 8vw, 64px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -2px;
        }
        .hero h1 em { font-style: normal; color: var(--accent2); }
        .subtitle {
          margin-top: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: var(--muted);
        }
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          margin-bottom: 24px;
        }
        .input-row { display: flex; gap: 10px; }
        .input-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          background: var(--surface2);
          border: 1.5px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }
        .input-wrap:focus-within { border-color: var(--accent2); }
        .input-prefix {
          padding: 0 8px 0 14px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: var(--muted);
        }
        .code-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          padding: 14px 14px 14px 0;
        }
        .code-input::placeholder { color: #444; }
        .search-btn {
          background: var(--accent2);
          color: #0a0a0a;
          border: none;
          border-radius: 8px;
          padding: 0 20px;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          min-width: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .search-btn:hover:not(:disabled) { background: #ffd54f; }
        .search-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .error-msg { margin-top: 10px; font-size: 13px; color: #ff6b6b; display: flex; gap: 6px; }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid #444;
          border-top-color: var(--accent2);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .stat-card.big { border-color: var(--accent2); }
        .stat-card.wide { grid-column: span 3; }
        .stat-num {
          font-size: 36px;
          font-weight: 800;
          color: var(--accent2);
          letter-spacing: -1px;
          line-height: 1;
        }
        .stat-label { font-size: 12px; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .original-url {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: var(--accent);
          text-decoration: none;
          word-break: break-all;
          margin-top: 6px;
          display: block;
        }
        .original-url:hover { text-decoration: underline; }
        .clicks-list { display: flex; flex-direction: column; gap: 8px; }
        .click-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--surface2); border-radius: 6px; }
        .click-country { font-size: 13px; }
        .click-time { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--muted); }

        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .stat-card.wide { grid-column: span 2; }
          .input-row { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
