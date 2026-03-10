import { useState } from "react";

// 🔧 Change to your Worker URL after deployment
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
    if (!url.trim()) return setError("Enter a URL");
    if (!isValidUrl(url)) return setError("Invalid URL — add https://");

    setLoading(true);
    try {
      const res = await fetch(`${WORKER_URL}/api/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setResult(data);
      onShortened?.(data.shortCode);
    } catch (e) {
      setError(e.message || "Something went wrong");
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
    <div className="shorten-wrapper">
      {/* TITLE SECTION */}
      <header className="shorten-hero animate-in" style={{ animationDelay: "0ms" }}>
        <div className="shorten-hero-main">
          <div className="shorten-title">
            <span className="shorten-title-text">SHORTEN_</span>
            <span className="shorten-cursor" />
          </div>
          <p className="shorten-subtitle">
            url-shortener@cloudflare:~/workers
          </p>
        </div>
      </header>

      {/* INPUT SECTION - terminal window */}
      {!result && (
        <section className="shorten-terminal-card animate-in" style={{ animationDelay: "100ms" }}>
          <div className="terminal-header">
            <span className="terminal-dot red" />
            <span className="terminal-dot amber" />
            <span className="terminal-dot green" />
            <span className="terminal-label">worker@cloudflare:~/shorten</span>
          </div>

          <div className="terminal-body">
            <div className={`terminal-line ${error ? "has-error" : ""}`}>
              <span className="prompt-symbol">$</span>
              <span className="prompt-path"> https://</span>
              <input
                type="text"
                className="terminal-input-url"
                placeholder="paste URL here"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleShorten()}
              />
              <button
                className="terminal-short-btn"
                onClick={handleShorten}
                disabled={loading}
              >
                {loading ? <span className="terminal-spinner" /> : "SHORTEN →"}
              </button>
            </div>

            {error && (
              <div className="terminal-error-line">
                <span className="error-prefix">✗ ERROR:</span>
                <span>{error}</span>
              </div>
            )}

            <div className="terminal-hints">
              <span className="hint">↵ ENTER to execute</span>
              <span className="hint">expects full URL with protocol</span>
            </div>
          </div>
        </section>
      )}

      {/* RESULT SECTION - terminal output */}
      {result && (
        <section className="result-terminal animate-in" style={{ animationDelay: "150ms" }}>
          <div className="result-header">
            <span className="result-prefix">$</span>
            <span className="result-command"> snip shorten</span>
          </div>

          <div className="result-success-line">
            <span className="success-icon">✓</span>
            <span className="success-text">SUCCESS</span>
          </div>

          <div className="result-short-url">
            <span className="short-label">SHORT URL</span>
            <div className="short-url-row">
              <span className="short-url">{result.shortUrl}</span>
              <button
                className={`copy-btn ${copied ? "copied" : ""}`}
                onClick={handleCopy}
              >
                {copied ? "COPIED" : "COPY"}
              </button>
            </div>
          </div>

          <div className="result-logs">
            <div className="result-log-line">
              <span className="log-prefix">&gt;</span>
              <span className="log-label"> ORIGINAL:</span>
              <span className="log-value truncate">{url}</span>
            </div>
            <div className="result-log-line">
              <span className="log-prefix">&gt;</span>
              <span className="log-label"> CODE:</span>
              <span className="log-value mono">{result.shortCode}</span>
            </div>
            <div className="result-log-line">
              <span className="log-prefix">&gt;</span>
              <span className="log-label"> EXPIRES:</span>
              <span className="log-value mono">90 days</span>
            </div>
          </div>

          <div className="result-actions">
            <a
              href={`/stats/${result.shortCode}`}
              className="terminal-action-btn secondary"
            >
              $ stats --code {result.shortCode}
            </a>
            <button
              className="terminal-action-btn"
              onClick={handleReset}
            >
              + new URL
            </button>
          </div>
        </section>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        .shorten-wrapper {
          padding-bottom: 40px;
        }

        /* Shared fade-in animation */
        .animate-in {
          opacity: 0;
          transform: translateY(8px);
          animation: fadeInUp 0.35s ease forwards;
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

        /* TITLE SECTION */
        .shorten-hero {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 28px;
          max-width: 680px;
          margin-left: auto;
          margin-right: auto;
        }

        .shorten-hero-main {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .shorten-title {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: "Syne", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 800;
          font-size: clamp(40px, 8vw, 72px);
          letter-spacing: -3px;
          text-transform: uppercase;
          width: auto;
          max-width: 100%;
        }

        .shorten-title-text {
          color: var(--accent);
        }

        .shorten-cursor {
          width: 0.8ch;
          height: 1.1em;
          background: var(--accent2);
          display: inline-block;
          transform: translateY(1px);
          animation: cursorBlink 1s steps(2, start) infinite;
        }

        @keyframes cursorBlink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }

        .shorten-subtitle {
          margin-top: 6px;
          font-family: "JetBrains Mono", monospace;
          font-size: 13px;
          color: var(--muted);
        }

        /* TERMINAL CARD */
        .shorten-terminal-card {
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

        .terminal-line {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
        }

        .terminal-line.has-error {
          border-bottom: 1px solid rgba(239, 68, 68, 0.5);
        }

        .prompt-symbol {
          color: var(--accent2);
        }

        .prompt-path {
          color: var(--muted);
          white-space: nowrap;
        }

        .terminal-input-url {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          color: var(--text);
          font-family: "JetBrains Mono", monospace;
          font-size: 14px;
          padding: 4px 4px;
          min-width: 0;
        }

        .terminal-input-url::placeholder {
          color: #444;
        }

        .terminal-short-btn {
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

        .terminal-short-btn:hover:not(:disabled) {
          background: var(--accent);
          color: #0a0a0a;
          transform: translateY(-1px);
        }

        .terminal-short-btn:disabled {
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
          color: #f97373;
        }

        .error-prefix {
          font-weight: 600;
        }

        .terminal-hints {
          margin-top: 12px;
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .hint {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          color: #444;
        }

        /* RESULT TERMINAL */
        .result-terminal {
          margin-top: 10px;
          background: radial-gradient(circle at top left, #161616 0, var(--surface2) 35%, #050505 100%);
          border-radius: 12px;
          border: 1px solid var(--border);
          padding: 16px 18px 18px;
          font-family: "JetBrains Mono", monospace;
          font-size: 13px;
          color: var(--text);
          animation-name: slideUpResult, fadeInUp;
          animation-duration: 0.35s, 0.35s;
          animation-timing-function: ease, ease;
          animation-fill-mode: forwards, forwards;
        }

        @keyframes slideUpResult {
          from {
            transform: translateY(14px);
          }
          to {
            transform: translateY(0);
          }
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 10px;
        }

        .result-prefix {
          color: var(--accent2);
        }

        .result-command {
          color: var(--muted);
        }

        .result-success-line {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #4ade80;
          font-weight: 500;
          margin-bottom: 14px;
        }

        .success-icon {
          font-size: 14px;
        }

        .success-text {
          letter-spacing: 0.18em;
          font-size: 11px;
        }

        .result-short-url {
          margin-bottom: 14px;
        }

        .short-label {
          display: block;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 6px;
        }

        .short-url-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          background: rgba(10, 10, 10, 0.9);
          border: 1px solid var(--border);
        }

        .short-url {
          flex: 1;
          font-size: 15px;
          font-weight: 500;
          color: var(--accent);
          word-break: break-all;
        }

        .copy-btn {
          background: var(--accent2);
          color: #0a0a0a;
          border: none;
          border-radius: 6px;
          padding: 8px 14px;
          font-family: "Syne", sans-serif;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .copy-btn:hover:not(.copied) {
          background: #e9ff6c;
        }

        .copy-btn.copied {
          background: #4ade80;
          color: #022c22;
        }

        .result-logs {
          margin-top: 4px;
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .result-log-line {
          display: flex;
          gap: 6px;
          align-items: baseline;
          font-size: 12px;
        }

        .log-prefix {
          color: var(--muted);
        }

        .log-label {
          color: var(--muted);
        }

        .log-value {
          color: #d4d4d4;
        }

        .log-value.mono {
          font-family: "JetBrains Mono", monospace;
          color: var(--accent2);
        }

        .log-value.truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }

        .result-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 4px;
        }

        .terminal-action-btn {
          border-radius: 999px;
          border: 1px solid var(--accent2);
          background: transparent;
          color: var(--accent2);
          padding: 8px 16px;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
        }

        .terminal-action-btn.secondary {
          border-color: var(--border);
          color: var(--muted);
          background: rgba(10, 10, 10, 0.8);
        }

        .terminal-action-btn:hover {
          background: var(--accent2);
          color: #000;
          transform: translateY(-1px);
          box-shadow: 0 0 0 1px rgba(200, 241, 53, 0.3), 0 16px 30px rgba(0, 0, 0, 0.8);
        }

        .terminal-action-btn.secondary:hover {
          background: rgba(200, 241, 53, 0.1);
          color: var(--accent2);
          box-shadow: none;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .shorten-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .shorten-title {
            font-size: 52px;
            letter-spacing: -3px;
          }

          .shorten-wrapper {
            padding-bottom: 32px;
          }

          .terminal-body {
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          .shorten-title {
            font-size: 36px;
            letter-spacing: -3px;
          }

          .shorten-terminal-card {
            margin-bottom: 18px;
          }

          .terminal-line {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .terminal-short-btn {
            width: 100%;
            justify-content: center;
            margin-left: 0;
            margin-top: 8px;
          }

          .short-url-row {
            flex-direction: column;
            align-items: stretch;
          }

          .result-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}
