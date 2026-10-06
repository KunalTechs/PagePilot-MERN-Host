import React, { useState } from "react";
import { PlayCircle, ExternalLink, Key } from "lucide-react";
import PagePilotDemo from "../components/PagePilotDemo";

/**
 * DemosShowcasePage Component
 * Dedicated page showcasing PagePilot interactive product demos.
 */
export default function DemosShowcasePage() {
  const [demoIdInput, setDemoIdInput] = useState("6abfe7886aff17c1c69b629b");

  return (
    <div
      style={{ maxWidth: "1100px", margin: "2.5rem auto", padding: "0 1.5rem" }}
    >
      {/* Header */}
      <div
        className="glass-panel"
        style={{
          padding: "2rem 2.5rem",
          borderRadius: "20px",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#60a5fa",
            fontWeight: 600,
            fontSize: "0.9rem",
            marginBottom: "0.5rem",
          }}
        >
          <PlayCircle size={18} />
          <span>PagePilot Interactive Demos</span>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "2.2rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          Product Demos & Feature Walkthroughs
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1rem",
            maxWidth: "750px",
          }}
        >
          Interactive presentation slideshows embedded cleanly via
          zero-dependency responsive iframes.
        </p>
      </div>

      {/* Demo ID Configuration Bar */}
      <div
        className="glass-panel"
        style={{
          padding: "1.5rem 2rem",
          borderRadius: "16px",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#60a5fa",
            fontWeight: 600,
            fontSize: "0.95rem",
            marginBottom: "0.75rem",
          }}
        >
          <Key size={16} /> Enter Demo Record ID (did)
        </div>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.875rem",
            marginBottom: "1rem",
          }}
        >
          Copy your Demo Record ID from PagePilot Admin (Demos &rarr; Embed /
          Share Link &rarr; did parameter) and paste it below:
        </p>
        <div style={{ display: "flex", gap: "0.75rem", maxWidth: "600px" }}>
          <input
            type="text"
            value={demoIdInput}
            onChange={(e) => setDemoIdInput(e.target.value.trim())}
            placeholder="Paste Demo ID (did) here..."
            style={{
              flex: 1,
              background: "#1f2937",
              border: "1px solid var(--border-glass)",
              color: "#fff",
              padding: "0.65rem 1rem",
              borderRadius: "8px",
              fontSize: "0.9rem",
            }}
          />
        </div>
      </div>

      {/* Demo Player Showcase */}
      <div
        className="glass-panel"
        style={{ padding: "2rem", borderRadius: "16px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            paddingBottom: "1rem",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 600, margin: 0 }}>
              Live Product Presentation
            </h3>
            <span
              style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}
            >
              Self-contained slideshow &bull; Zero DOM dependency
            </span>
          </div>
          {demoIdInput && (
            <a
              href={`https://pagepilot-demo-viewer-prod.web.app/?tid=6336128a251dcbda38bd8fe1&did=${demoIdInput}&type=demo&status=live`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.8rem",
                padding: "0.4rem 0.8rem",
              }}
            >
              Full Page View <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Embedded Interactive Demo Component */}
        <PagePilotDemo demoId={demoIdInput} />
      </div>
    </div>
  );
}
