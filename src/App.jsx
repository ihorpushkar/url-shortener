import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams } from "react-router-dom";
import ShortenForm from "./components/ShortenForm";
import StatsPanel from "./components/StatsPanel";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [lastCode, setLastCode] = useState(null);

  const isStats = location.pathname.startsWith("/stats");

  return (
    <div className="app">
      <div className="noise" />

      <header>
        <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <span className="logo-icon">⌁</span>
          <span className="logo-text">snip</span>
          <span className="logo-dot">.dev</span>
        </div>
        <nav>
          <button
            className={`tab-btn ${!isStats ? "active" : ""}`}
            onClick={() => navigate("/")}
          >
            Shorten
          </button>
          <button
            className={`tab-btn ${isStats ? "active" : ""}`}
            onClick={() => navigate(lastCode ? `/stats/${lastCode}` : "/stats")}
          >
            Analytics
          </button>
        </nav>
      </header>

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <ShortenForm
                onShortened={(code) => {
                  setLastCode(code);
                }}
                onStatsClick={(code) => {
                  setLastCode(code);
                  navigate(`/stats/${code}`);
                }}
              />
            }
          />
          <Route path="/stats" element={<StatsPanel initialCode={null} />} />
          <Route path="/stats/:code" element={<StatsPanelWithCode />} />
        </Routes>
      </main>

      <footer>
        <span>Built with Cloudflare Workers + KV + D1</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0a0a0a;
          --surface: #111111;
          --surface2: #1a1a1a;
          --border: #2a2a2a;
          --accent: #c8f135;
          --accent2: #f1c835;
          --text: #f0f0f0;
          --muted: #666;
          --radius: 12px;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'Syne', sans-serif;
          min-height: 100vh;
        }

        .noise {
          position: fixed; inset: 0; pointer-events: none; z-index: 100;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .app {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 24px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32px 0 48px;
        }

        .logo {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .logo-icon { color: var(--accent); margin-right: 2px; }
        .logo-text { color: var(--text); }
        .logo-dot { color: var(--accent); }

        nav { display: flex; gap: 4px; background: var(--surface); padding: 4px; border-radius: 8px; border: 1px solid var(--border); }

        .tab-btn {
          background: transparent;
          border: none;
          color: var(--muted);
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .tab-btn.active {
          background: var(--accent);
          color: #0a0a0a;
        }

        .tab-btn:not(.active):hover { color: var(--text); }

        main { flex: 1; }

        footer {
          padding: 32px 0;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}

function StatsPanelWithCode() {
  const { code } = useParams();
  return <StatsPanel initialCode={code} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
