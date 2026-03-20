import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

// ─────────────────────────────────────────────────────────────
// FIX 1: TTS voice cache — populated once after voiceschanged fires
// ─────────────────────────────────────────────────────────────
let _cachedVoice = null;
function getPreferredVoice() {
  if (_cachedVoice) return _cachedVoice;
  const voices = window.speechSynthesis?.getVoices() || [];
  _cachedVoice = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      (v.name.includes("Google") ||
        v.name.includes("Samantha") ||
        v.name.includes("Karen") ||
        v.name.includes("Daniel"))
  ) || voices.find((v) => v.lang.startsWith("en")) || null;
  return _cachedVoice;
}
// Prime the cache as soon as voices are available
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    _cachedVoice = null; // reset so next call rebuilds
    getPreferredVoice();
  };
}

// ─────────────────────────────────────────────────────────────
// FIX 2: sessionStorage helpers
// ─────────────────────────────────────────────────────────────
const SESSION_KEY = (jobRole, personaId) =>
  `skillup_iv_${(jobRole || "default").replace(/\s+/g, "_").toLowerCase()}_${personaId}`;

function loadSession(jobRole, personaId) {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY(jobRole, personaId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveSession(jobRole, personaId, messages) {
  try { sessionStorage.setItem(SESSION_KEY(jobRole, personaId), JSON.stringify(messages)); } catch {}
}
function clearSession(jobRole, personaId) {
  try { sessionStorage.removeItem(SESSION_KEY(jobRole, personaId)); } catch {}
}

// ─────────────────────────────────────────────────────────────
// FIX 3: PDF transcript export (used by report card)
// ─────────────────────────────────────────────────────────────
function exportTranscriptPDF({ jobRole, persona, messages, summary }) {
  const personaLabel = persona.charAt(0).toUpperCase() + persona.slice(1);
  const questionsAnswered = messages.filter((m) => m.role === "user").length;
  const rows = messages
    .filter((m) => m.role !== "system")
    .map((m) => {
      const isUser = m.role === "user";
      return `<div class="msg-row ${isUser ? "ur" : "ar"}">
        <div class="av">${isUser ? "👤" : "🤖"}</div>
        <div class="bub ${isUser ? "ub" : "ab"}">
          <div class="lbl">${isUser ? "You" : `PrepBot (${personaLabel})`}</div>
          <div>${m.content.replace(/\n/g, "<br/>")}</div>
        </div>
      </div>`;
    }).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <title>SkillUp Interview Report — ${jobRole}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',sans-serif;background:#f8faf6;color:#1a2a1a;padding:40px}
    .header{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #B7C7A1;padding-bottom:18px;margin-bottom:24px}
    .logo{display:flex;align-items:center;gap:10px}
    .logo h1{font-size:22px;font-weight:800}
    .chips{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px}
    .chip{background:#fff;border:1px solid #e4eae0;border-radius:10px;padding:8px 14px;font-size:12px}
    .chip b{color:#4a8fa8;font-size:16px;display:block}
    .chip label{color:#9aaa8a;font-size:10px}
    .summary-box{background:linear-gradient(135deg,#f0f7ec,#e8f4fd);border:1px solid #c8ddc0;border-radius:14px;padding:20px 24px;margin-bottom:28px}
    .summary-box h2{font-size:15px;font-weight:800;margin-bottom:8px;color:#1a2a1a}
    .summary-box p{font-size:13px;color:#3a5a3a;line-height:1.65;white-space:pre-wrap}
    .transcript-title{font-size:14px;font-weight:800;color:#1a2a1a;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #e4eae0}
    .msg-row{display:flex;gap:10px;margin-bottom:16px;align-items:flex-start}
    .ur{flex-direction:row-reverse}
    .av{font-size:18px;flex-shrink:0;margin-top:2px}
    .bub{max-width:75%;padding:11px 15px;border-radius:13px;font-size:13px;line-height:1.6}
    .ab{background:#f0f7ec;border:1px solid #c8ddc0;border-top-left-radius:3px}
    .ub{background:#f0f5ff;border:1px solid #b0c4f0;border-top-right-radius:3px;text-align:right}
    .lbl{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;color:#9aaa8a}
    .ub .lbl{color:#6a8aba}
    .footer{margin-top:32px;border-top:1px solid #e4eae0;padding-top:12px;font-size:11px;color:#9aaa8a;display:flex;justify-content:space-between}
    @media print{body{background:#fff;padding:24px}}
  </style></head><body>
  <div class="header">
    <div class="logo">
      <svg width="26" height="26" viewBox="0 0 24 24"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9ac5f4"/><stop offset="50%" stop-color="#d6c8f7"/><stop offset="100%" stop-color="#cfe8d5"/></linearGradient></defs><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" fill="url(#g)"/></svg>
      <h1>SkillUp — Interview Report</h1>
    </div>
  </div>
  <div class="chips">
    <div class="chip"><b>${jobRole}</b><label>Role</label></div>
    <div class="chip"><b>${personaLabel}</b><label>Interviewer Style</label></div>
    <div class="chip"><b>${questionsAnswered}</b><label>Questions Answered</label></div>
    <div class="chip"><b>${new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</b><label>Date</label></div>
  </div>
  ${summary ? `<div class="summary-box"><h2>📋 AI Performance Summary</h2><p>${summary}</p></div>` : ""}
  <div class="transcript-title">📝 Full Transcript</div>
  ${rows}
  <div class="footer"><span>SkillUp — AI Career Preparation Platform</span><span>${new Date().toLocaleString("en-IN")}</span></div>
  </body></html>`;

  const w = window.open("", "_blank", "width=900,height=700");
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 600);
}

// ─────────────────────────────────────────────────────────────
// PERSONA SELECTION CARD (unchanged)
// ─────────────────────────────────────────────────────────────
const PERSONAS = [
  { id: "friendly", label: "Friendly", desc: "Warm & encouraging", color: "#4caf82", light: "#f0fdf6", border: "#b6e8cc" },
  { id: "balanced", label: "Balanced", desc: "Professional & fair", color: "#5b8dee", light: "#f0f5ff", border: "#bdd0f8" },
  { id: "strict",   label: "Strict",   desc: "Intense & rigorous",  color: "#ef5b5b", light: "#fff5f5", border: "#fbc8c8" },
];

const WatercolorIllustration = () => (
  <svg viewBox="0 0 320 380" xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", maxWidth: 260, filter: "drop-shadow(0 8px 24px rgba(76,130,100,0.18))" }}>
    <defs>
      <filter id="wc1" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="2" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="wc2" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="8" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="soft"><feGaussianBlur stdDeviation="1.2"/></filter>
      <radialGradient id="skyWash" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#e8f4f0" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#c8e6d8" stopOpacity="0.6"/>
      </radialGradient>
      <linearGradient id="deskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#d4a96a" stopOpacity="0.85"/>
        <stop offset="100%" stopColor="#b8855a" stopOpacity="0.9"/>
      </linearGradient>
      <radialGradient id="skinWash" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#f5c9a0" stopOpacity="0.95"/>
        <stop offset="100%" stopColor="#e8a87c" stopOpacity="0.85"/>
      </radialGradient>
      <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7eb8d4" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#5a9abf" stopOpacity="0.85"/>
      </linearGradient>
      <radialGradient id="hairWash" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#5c4033" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#3e2723" stopOpacity="0.8"/>
      </radialGradient>
      <linearGradient id="plantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#81c784" stopOpacity="0.85"/>
        <stop offset="100%" stopColor="#4caf50" stopOpacity="0.75"/>
      </linearGradient>
      <radialGradient id="lampGrad" cx="50%" cy="0%" r="100%">
        <stop offset="0%" stopColor="#fff9c4" stopOpacity="0.95"/>
        <stop offset="100%" stopColor="#f9a825" stopOpacity="0.7"/>
      </radialGradient>
      <linearGradient id="paperGrad" x1="0%" y1="0%" x2="5%" y2="100%">
        <stop offset="0%" stopColor="#fffde7" stopOpacity="0.95"/>
        <stop offset="100%" stopColor="#fff9c4" stopOpacity="0.85"/>
      </linearGradient>
      <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
        <stop offset="60%" stopColor="transparent"/>
        <stop offset="100%" stopColor="#c8e6c9" stopOpacity="0.35"/>
      </radialGradient>
    </defs>
    <ellipse cx="160" cy="200" rx="170" ry="200" fill="url(#skyWash)" filter="url(#soft)"/>
    <ellipse cx="60" cy="320" rx="90" ry="55" fill="#a5d6a7" opacity="0.28" filter="url(#wc1)"/>
    <ellipse cx="260" cy="80" rx="75" ry="55" fill="#b3e5fc" opacity="0.22" filter="url(#wc2)"/>
    <ellipse cx="200" cy="300" rx="80" ry="50" fill="#ffe0b2" opacity="0.20" filter="url(#wc1)"/>
    <ellipse cx="90" cy="100" rx="60" ry="45" fill="#f8bbd0" opacity="0.18" filter="url(#wc2)"/>
    <rect x="40" y="238" width="240" height="18" rx="4" fill="url(#deskGrad)" filter="url(#wc1)"/>
    <rect x="52" y="256" width="12" height="60" rx="3" fill="#b8855a" opacity="0.7"/>
    <rect x="256" y="256" width="12" height="60" rx="3" fill="#b8855a" opacity="0.7"/>
    <ellipse cx="160" cy="262" rx="110" ry="6" fill="#8d6e4a" opacity="0.15"/>
    <rect x="95" y="190" width="105" height="50" rx="5" fill="#455a64" opacity="0.88" filter="url(#wc2)"/>
    <rect x="98" y="193" width="99" height="44" rx="3" fill="#eceff1" opacity="0.92"/>
    <rect x="104" y="200" width="55" height="3" rx="1.5" fill="#90a4ae" opacity="0.7"/>
    <rect x="104" y="207" width="40" height="3" rx="1.5" fill="#80cbc4" opacity="0.6"/>
    <rect x="104" y="214" width="50" height="3" rx="1.5" fill="#90a4ae" opacity="0.5"/>
    <rect x="104" y="221" width="35" height="3" rx="1.5" fill="#a5d6a7" opacity="0.6"/>
    <rect x="104" y="228" width="45" height="3" rx="1.5" fill="#90a4ae" opacity="0.4"/>
    <rect x="85" y="238" width="130" height="6" rx="3" fill="#37474f" opacity="0.75" filter="url(#wc1)"/>
    <rect x="58" y="220" width="50" height="22" rx="3" fill="url(#paperGrad)" filter="url(#wc2)" transform="rotate(-4,83,231)"/>
    <rect x="60" y="224" width="30" height="2" rx="1" fill="#bcaaa4" opacity="0.5" transform="rotate(-4,75,225)"/>
    <rect x="60" y="229" width="25" height="2" rx="1" fill="#bcaaa4" opacity="0.4" transform="rotate(-4,72,230)"/>
    <rect x="60" y="234" width="28" height="2" rx="1" fill="#bcaaa4" opacity="0.35" transform="rotate(-4,74,235)"/>
    <rect x="118" y="232" width="38" height="5" rx="2.5" fill="#ef9a9a" opacity="0.85" transform="rotate(-8,137,234)"/>
    <polygon points="118,230 113,234 118,237" fill="#e53935" opacity="0.7" transform="rotate(-8,115.5,233.5)"/>
    <rect x="238" y="212" width="28" height="26" rx="4" fill="#8d6e4a" opacity="0.72" filter="url(#wc1)"/>
    <rect x="241" y="208" width="22" height="6" rx="2" fill="#795548" opacity="0.6"/>
    <ellipse cx="252" cy="196" rx="14" ry="18" fill="url(#plantGrad)" filter="url(#wc2)" transform="rotate(-10,252,196)"/>
    <ellipse cx="262" cy="200" rx="10" ry="14" fill="#66bb6a" opacity="0.7" filter="url(#wc1)" transform="rotate(15,262,200)"/>
    <ellipse cx="242" cy="202" rx="9" ry="12" fill="#81c784" opacity="0.65" filter="url(#wc2)" transform="rotate(-20,242,202)"/>
    <path d="M252,238 Q252,215 252,196" stroke="#558b2f" strokeWidth="1.5" fill="none" opacity="0.5"/>
    <rect x="130" y="160" width="62" height="78" rx="8" fill="#b0bec5" opacity="0.35" filter="url(#wc1)"/>
    <ellipse cx="160" cy="200" rx="28" ry="36" fill="url(#shirtGrad)" filter="url(#wc2)"/>
    <path d="M148,170 Q160,178 172,170 Q165,185 155,185 Z" fill="#e3f2fd" opacity="0.8"/>
    <path d="M134,185 Q120,200 118,225" stroke="url(#shirtGrad)" strokeWidth="16" strokeLinecap="round" fill="none" filter="url(#wc1)"/>
    <ellipse cx="116" cy="230" rx="10" ry="7" fill="url(#skinWash)" filter="url(#wc2)"/>
    <path d="M186,185 Q196,205 194,228" stroke="url(#shirtGrad)" strokeWidth="16" strokeLinecap="round" fill="none" filter="url(#wc1)"/>
    <ellipse cx="192" cy="232" rx="10" ry="7" fill="url(#skinWash)" filter="url(#wc2)"/>
    <rect x="153" y="155" width="14" height="18" rx="6" fill="url(#skinWash)" filter="url(#wc1)"/>
    <ellipse cx="160" cy="138" rx="28" ry="30" fill="url(#skinWash)" filter="url(#wc2)"/>
    <ellipse cx="160" cy="118" rx="28" ry="16" fill="url(#hairWash)" filter="url(#wc1)"/>
    <ellipse cx="138" cy="130" rx="10" ry="18" fill="url(#hairWash)" filter="url(#wc2)"/>
    <ellipse cx="182" cy="130" rx="10" ry="18" fill="url(#hairWash)" filter="url(#wc1)"/>
    <ellipse cx="151" cy="135" rx="4" ry="4.5" fill="#fff" opacity="0.95"/>
    <ellipse cx="169" cy="135" rx="4" ry="4.5" fill="#fff" opacity="0.95"/>
    <circle cx="152" cy="136" r="2.5" fill="#4e342e"/>
    <circle cx="170" cy="136" r="2.5" fill="#4e342e"/>
    <circle cx="153" cy="134.5" r="0.8" fill="#fff" opacity="0.9"/>
    <circle cx="171" cy="134.5" r="0.8" fill="#fff" opacity="0.9"/>
    <path d="M153,146 Q160,152 167,146" stroke="#c68642" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7"/>
    <path d="M147,130 Q152,127 156,130" stroke="#5c4033" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.75"/>
    <path d="M164,130 Q168,127 173,130" stroke="#5c4033" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.75"/>
    <rect x="58" y="180" width="7" height="58" rx="3" fill="#9e9e9e" opacity="0.6" filter="url(#wc1)"/>
    <rect x="55" y="236" width="14" height="4" rx="2" fill="#757575" opacity="0.5"/>
    <path d="M62,180 Q72,160 88,155" stroke="#9e9e9e" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.6" filter="url(#wc2)"/>
    <ellipse cx="92" cy="152" rx="18" ry="10" fill="url(#lampGrad)" filter="url(#wc1)" transform="rotate(-20,92,152)"/>
    <ellipse cx="92" cy="165" rx="22" ry="14" fill="#fff9c4" opacity="0.18" filter="url(#soft)"/>
    <rect x="195" y="218" width="20" height="22" rx="4" fill="#ef9a9a" opacity="0.75" filter="url(#wc2)"/>
    <path d="M215,224 Q224,224 224,229 Q224,234 215,234" stroke="#e57373" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>
    <path d="M200,216 Q202,210 200,205" stroke="#bdbdbd" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.45"/>
    <path d="M206,215 Q208,208 206,203" stroke="#bdbdbd" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.35"/>
    <rect x="0" y="0" width="320" height="380" fill="url(#vignette)"/>
  </svg>
);

function PersonaSplitCard({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  const [chosen, setChosen]   = useState(null);
  const handlePick = (p) => { setChosen(p.id); setTimeout(() => onSelect(p), 460); };

  return (
    <>
      <style>{`
        @keyframes splitCardIn { from{opacity:0;transform:scale(0.95) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes cardGlow {
          0%,100%{box-shadow:0 40px 90px rgba(0,0,0,0.30),0 0 0 1px rgba(255,255,255,0.12),0 0 24px 4px rgba(160,210,180,0.18),0 0 60px 10px rgba(120,190,150,0.10)}
          50%    {box-shadow:0 40px 90px rgba(0,0,0,0.30),0 0 0 1.5px rgba(255,255,255,0.22),0 0 36px 8px rgba(160,210,180,0.30),0 0 80px 18px rgba(120,190,150,0.16)}
        }
        .ps-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(15,20,30,0.55);backdrop-filter:blur(8px);padding:20px;font-family:'Nunito','Segoe UI',sans-serif}
        .ps-card{display:flex;width:100%;max-width:760px;min-height:450px;border-radius:22px;overflow:hidden;animation:splitCardIn 0.45s cubic-bezier(0.16,1,0.3,1) both,cardGlow 3.5s ease-in-out 0.5s infinite}
        .ps-left{flex:1 1 55%;background:#ffffff;padding:38px 34px 32px;display:flex;flex-direction:column;justify-content:center}
        .ps-heading{font-size:30px;font-weight:900;color:#111827;margin:0 0 6px;line-height:1.2;letter-spacing:-0.02em}
        .ps-sub{font-size:12.5px;color:#6b7280;margin:0 0 22px;line-height:1.55}
        .ps-row{display:flex;align-items:center;gap:13px;padding:12px 14px;border-radius:13px;border:1.5px solid #e5e7eb;cursor:pointer;margin-bottom:9px;transition:all 0.2s cubic-bezier(0.34,1.3,0.64,1);background:#fff;position:relative;overflow:hidden;user-select:none}
        .ps-row:last-of-type{margin-bottom:0}
        .ps-row:hover{transform:translateX(5px);box-shadow:0 5px 18px rgba(0,0,0,0.07)}
        .ps-row.ps-chosen{transform:scale(0.96);opacity:0.65;pointer-events:none}
        .ps-accent-bar{position:absolute;left:0;top:16%;bottom:16%;width:3px;border-radius:0 3px 3px 0;transition:background 0.18s ease}
        .ps-color-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;transition:transform 0.2s ease}
        .ps-row:hover .ps-color-dot{transform:scale(1.3)}
        .ps-row-label{font-size:14px;font-weight:800;margin:0;line-height:1;transition:color 0.15s ease}
        .ps-row-desc{font-size:11.5px;color:#9ca3af;margin:3px 0 0;line-height:1.3}
        .ps-arrow{margin-left:auto;font-size:17px;flex-shrink:0;transition:color 0.15s ease,transform 0.2s ease;color:#d1d5db;font-style:normal}
        .ps-row:hover .ps-arrow{transform:translateX(4px)}
        .ps-hint{font-size:10.5px;color:#c4c9d4;text-align:center;margin-top:14px;letter-spacing:0.04em}
        .ps-right{flex:0 0 42%;background:linear-gradient(155deg,#f4faf5 0%,#e2f3e6 35%,#cce8d2 65%,#b8dfbf 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:28px 24px;position:relative;overflow:hidden}
        .ps-deco1{position:absolute;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,0.22);top:-70px;right:-70px;pointer-events:none}
        .ps-deco2{position:absolute;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,0.15);bottom:-50px;left:-50px;pointer-events:none}
        .ps-wc-wrap{position:relative;z-index:1}
        .ps-caption{font-size:12.5px;font-weight:700;color:#2d6a4f;text-align:center;line-height:1.65;font-style:italic;position:relative;z-index:1;max-width:190px}
        .ps-tag{font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#40916c;font-weight:800;position:relative;z-index:1;background:rgba(255,255,255,0.55);padding:4px 12px;border-radius:100px;border:1px solid rgba(255,255,255,0.7)}
        @media(max-width:580px){.ps-right{display:none}.ps-left{padding:28px 22px}}
      `}</style>
      <div className="ps-overlay">
        <div className="ps-card">
          <div className="ps-left">
            <h2 className="ps-heading">Pick your<br />Interviewer Style</h2>
            <p className="ps-sub">Choose the mode that fits your prep goal today.</p>
            {PERSONAS.map((p) => (
              <div key={p.id}
                className={`ps-row${chosen === p.id ? " ps-chosen" : ""}`}
                style={{ borderColor: hovered === p.id ? p.border : "#e5e7eb", background: hovered === p.id ? p.light : "#fff" }}
                onMouseEnter={() => setHovered(p.id)} onMouseLeave={() => setHovered(null)} onClick={() => handlePick(p)}
              >
                <div className="ps-accent-bar" style={{ background: hovered === p.id ? p.color : "transparent" }} />
                <div className="ps-color-dot" style={{ background: p.color, opacity: hovered === p.id ? 1 : 0.45 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="ps-row-label" style={{ color: hovered === p.id ? p.color : "#111827" }}>{p.label}</p>
                  <p className="ps-row-desc">{p.desc}</p>
                </div>
                <span className="ps-arrow" style={{ color: hovered === p.id ? p.color : "#d1d5db" }}>›</span>
              </div>
            ))}
            <p className="ps-hint">Select a style to continue →</p>
          </div>
          <div className="ps-right">
            <div className="ps-deco1" /><div className="ps-deco2" />
            <div className="ps-wc-wrap"><WatercolorIllustration /></div>
            <p className="ps-caption">"Every expert was once<br />a nervous beginner."</p>
            <span className="ps-tag">Your interview awaits</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// REPORT CARD MODAL — compact, scrollable, uniform buttons
// ─────────────────────────────────────────────────────────────
function ReportCard({ jobRole, persona, messages, cachedSummary, onSummaryReady, onClose, onRestart }) {
  const [summary, setSummary]             = useState(cachedSummary || "");
  const [summaryLoading, setSummaryLoading] = useState(!cachedSummary);
  const [pdfLoading, setPdfLoading]       = useState(false);

  const questionsAnswered = messages.filter((m) => m.role === "user").length;
  const personaLabel = persona.label;

  useEffect(() => {
    // Already have a cached summary — skip the API call entirely
    if (cachedSummary) return;

    const userTurns = messages.filter((m) => m.role === "user");

    if (userTurns.length === 0) {
      const msg = "The interview ended before any answers were given. No performance data to evaluate.";
      setSummary(msg);
      onSummaryReady(msg);
      setSummaryLoading(false);
      return;
    }

    const prompt = `You are reviewing a mock interview for ${jobRole}.

The candidate answered ${userTurns.length} question(s).

Here are ONLY the candidate's answers:
${userTurns.map((m, i) => `Answer ${i + 1}: ${m.content}`).join("\n\n")}

Rules:
- Write EXACTLY 2 sentences. No more, no less.
- Base your review ONLY on the candidate's answers above. Ignore the interviewer's questions completely.
- If the candidate only gave a self-introduction or answered just 1 question, say that explicitly — do not pretend a full interview happened.
- Sentence 1: One honest, specific observation about what the candidate actually said. No generic praise.
- Sentence 2: Verdict — "Overall: Ready.", "Overall: Almost Ready.", or "Overall: Needs More Prep." — with one word of reason.
- Do NOT fabricate details. Do NOT reference anything the candidate did not say.`;

    fetch("http://localhost:5000/study-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
    })
      .then((r) => r.json())
      .then((d) => {
        const reply = d.reply || "Unable to generate summary.";
        setSummary(reply);
        onSummaryReady(reply); // cache in parent
      })
      .catch(() => {
        const err = "Unable to generate summary — backend unavailable.";
        setSummary(err);
        onSummaryReady(err);
      })
      .finally(() => setSummaryLoading(false));
  }, []); // eslint-disable-line

  const handleDownload = () => {
    setPdfLoading(true);
    setTimeout(() => {
      exportTranscriptPDF({ jobRole, persona: persona.id, messages, summary });
      setPdfLoading(false);
    }, 200);
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(10,15,25,0.60)", backdropFilter:"blur(10px)",
      padding:20, fontFamily:"'Nunito','Segoe UI',sans-serif",
    }}>
      <style>{`
        @keyframes rcIn{from{opacity:0;transform:scale(0.93) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes rcGlow{0%,100%{box-shadow:0 32px 80px rgba(0,0,0,0.32),0 0 0 1px rgba(255,255,255,0.12)}50%{box-shadow:0 32px 80px rgba(0,0,0,0.32),0 0 0 1.5px rgba(255,255,255,0.22),0 0 32px 8px rgba(160,210,180,0.20)}}
        @keyframes shimmerBar{0%{background-position:-300px 0}100%{background-position:300px 0}}
        @keyframes spinLoader{to{transform:rotate(360deg)}}
        @keyframes statPop{from{opacity:0;transform:translateY(8px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        .rc-card{animation:rcIn 0.4s cubic-bezier(0.16,1,0.3,1) both,rcGlow 4s ease-in-out 0.4s infinite;width:100%;max-width:460px;background:#fff;border-radius:22px;overflow:hidden;display:flex;flex-direction:column;max-height:90vh}
        .rc-body{overflow-y:auto;flex:1}
        .rc-body::-webkit-scrollbar{width:3px}
        .rc-body::-webkit-scrollbar-thumb{background:#d0d8c8;border-radius:99px}
        .rc-stat{animation:statPop 0.35s cubic-bezier(0.16,1,0.3,1) both}
        .rc-stat:nth-child(1){animation-delay:0.08s}
        .rc-stat:nth-child(2){animation-delay:0.16s}
        .rc-stat:nth-child(3){animation-delay:0.24s}
        .rc-shimmer{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:300px 100%;animation:shimmerBar 1.2s ease-in-out infinite;border-radius:7px;height:12px;margin-bottom:7px}
        .rc-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 20px;border-radius:10px;font-weight:700;font-size:12.5px;cursor:pointer;transition:all 0.2s ease;border:1.5px solid #c4d8a8;background:rgba(255,255,255,0.85);color:#4a6a3a}
        .rc-btn:hover:not(:disabled){background:#f0f7ec;border-color:#8D9977;transform:translateY(-1px);box-shadow:0 4px 14px rgba(141,153,119,0.22)}
        .rc-btn:disabled{opacity:0.65;cursor:not-allowed}
        .rc-btn.primary{background:#A3B18A;color:#fff;border-color:#A3B18A;box-shadow:0 4px 14px rgba(163,177,138,0.30)}
        .rc-btn.primary:hover:not(:disabled){background:#8D9977;border-color:#8D9977;box-shadow:0 6px 18px rgba(163,177,138,0.42)}
      `}</style>

      <div className="rc-card">

        {/* Header — compact */}
        <div style={{background:"linear-gradient(135deg,#f0f7ff 0%,#e8f4ea 50%,#f5eeff 100%)",padding:"20px 22px 16px",borderBottom:"1px solid rgba(183,199,161,0.35)",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div>
              <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.7)",border:"1px solid rgba(183,199,161,0.5)",borderRadius:100,padding:"2px 10px",fontSize:9.5,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",color:"#5a7a4a",marginBottom:6}}>
                📋 Interview Complete
              </div>
              <h2 style={{fontSize:18,fontWeight:900,color:"#111827",letterSpacing:"-0.02em",margin:0,lineHeight:1.2}}>Your Report Card</h2>
              <p style={{fontSize:11,color:"#6b7280",marginTop:3}}>
                🎯 {jobRole} · <span style={{color:persona.color,fontWeight:700}}>{personaLabel} Mode</span>
              </p>
            </div>
            <button onClick={onClose} style={{background:"none",border:"none",fontSize:17,color:"#9ca3af",cursor:"pointer",padding:"4px 6px",borderRadius:8,transition:"color 0.2s",lineHeight:1}}
              onMouseEnter={e=>e.currentTarget.style.color="#374151"} onMouseLeave={e=>e.currentTarget.style.color="#9ca3af"}>✕</button>
          </div>

          {/* Stats — 3 compact chips */}
          <div style={{display:"flex",gap:8}}>
            {[
              {val:questionsAnswered, label:"Questions", color:"#5b8dee", bg:"#f0f5ff", border:"#bdd0f8"},
              {val:messages.filter(m=>m.role==="assistant").length, label:"AI Responses", color:"#4caf82", bg:"#f0fdf6", border:"#b6e8cc"},
              {val:persona.label, label:"Style", color:persona.color, bg:persona.light, border:persona.border},
            ].map((s,i)=>(
              <div key={i} className="rc-stat" style={{flex:1,background:s.bg,border:`1.5px solid ${s.border}`,borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:900,color:s.color,lineHeight:1}}>{s.val}</div>
                <div style={{fontSize:9,color:"#9ca3af",fontWeight:600,marginTop:3}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="rc-body" style={{padding:"18px 22px"}}>
          {/* AI Summary */}
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
            <div style={{width:24,height:24,borderRadius:7,background:"linear-gradient(135deg,#f0f7ec,#e8f4fd)",border:"1px solid #c8ddc0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>🤖</div>
            <span style={{fontSize:12,fontWeight:800,color:"#1a2a1a"}}>AI Performance Summary</span>
          </div>
          <div style={{background:"linear-gradient(135deg,#f8fbf8,#f2f7f1)",border:"1px solid #e0ead8",borderRadius:12,padding:"14px 16px",minHeight:70}}>
            {summaryLoading ? (
              <div>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10,color:"#9aaa8a",fontSize:11}}>
                  <svg style={{animation:"spinLoader 0.9s linear infinite",flexShrink:0}} width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(163,177,138,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#A3B18A" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Generating review…
                </div>
                <div className="rc-shimmer" style={{width:"88%"}}/>
                <div className="rc-shimmer" style={{width:"70%"}}/>
                <div className="rc-shimmer" style={{width:"78%"}}/>
              </div>
            ) : (
              <p style={{fontSize:12.5,color:"#2a3a2a",lineHeight:1.7,margin:0}}>{summary}</p>
            )}
          </div>
        </div>

        {/* Footer buttons — all same style */}
        <div style={{padding:"12px 22px 18px",display:"flex",gap:8,justifyContent:"flex-end",borderTop:"1px solid rgba(183,199,161,0.25)",flexShrink:0}}>
          <button className="rc-btn" onClick={onRestart}>New Interview</button>
          <button className="rc-btn" onClick={onClose}>Continue Interview</button>
          <button className="rc-btn primary" onClick={handleDownload} disabled={pdfLoading||summaryLoading}>
            {pdfLoading
              ? <svg style={{animation:"spinLoader 0.9s linear infinite"}} width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
              : <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 3v13M8 12l4 4 4-4M5 20h14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            }
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
const InterviewSimulation = () => {
  const location = useLocation();
  const jobRole  = location.state?.jobRole || "Software Engineer";

  const [selectedPersona, setSelectedPersona] = useState(null);
  const [messages, setMessages]               = useState([]);
  const [input, setInput]                     = useState("");
  const [loading, setLoading]                 = useState(false);
  const [showPopup, setShowPopup]             = useState(true);
  const [showReport, setShowReport]           = useState(false);
  // Cache summary in parent so reopening report card doesn't re-fetch
  const [cachedSummary, setCachedSummary]     = useState(null);

  // ── Voice input ──
  const [isListening, setIsListening]       = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError, setVoiceError]         = useState("");
  const recognitionRef = useRef(null);

  // ── TTS ──
  const [isMuted, setIsMuted]       = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const isMutedRef = useRef(isMuted);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  const bottomRef = useRef(null);

  // ── FIX 1: speak() uses pre-cached voice ──
  const speak = useCallback((text) => {
    if (!ttsSupported || isMutedRef.current) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[✅💡⚠️🎤❓💬😊]/gu, "").replace(/\*+/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate   = 0.95;
    utterance.pitch  = 1.0;
    utterance.volume = 1.0;
    // Use the module-level cached voice (already loaded via voiceschanged)
    const voice = getPreferredVoice();
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend   = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [ttsSupported]);

  const stopSpeaking = useCallback(() => {
    if (ttsSupported) { window.speechSynthesis.cancel(); setIsSpeaking(false); }
  }, [ttsSupported]);

  const toggleMute = useCallback(() => {
    if (!isMutedRef.current) stopSpeaking();
    setIsMuted((prev) => !prev);
  }, [stopSpeaking]);

  useEffect(() => () => { if (ttsSupported) window.speechSynthesis.cancel(); }, [ttsSupported]);

  // ── Voice input setup ──
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceSupported(false); return; }
    setVoiceSupported(true);
    const recognition = new SR();
    recognition.continuous     = false;
    recognition.interimResults = true;
    recognition.lang           = "en-US";
    recognition.onresult = (e) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setInput(t);
    };
    recognition.onerror = (e) => {
      const m = { "not-allowed": "Microphone access denied. Please allow microphone permission.", "no-speech": "No speech detected. Please try again.", "network": "Network error. Please check your connection.", "audio-capture": "No microphone found on this device." };
      setVoiceError(m[e.error] || `Voice error: ${e.error}`);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, []);

  const toggleVoice = useCallback(() => {
    if (!recognitionRef.current) return;
    setVoiceError("");
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else             { setInput(""); recognitionRef.current.start(); setIsListening(true); }
  }, [isListening]);

  // ── FIX 2: Restore session when persona is selected ──
  useEffect(() => {
    if (!selectedPersona) return;
    const saved = loadSession(jobRole, selectedPersona.id);
    if (saved && saved.length > 0) {
      setMessages(saved);
      return; // don't fetch first question — we have history
    }
    // No saved session — fetch first question
    (async () => {
      try {
        const res  = await fetch("http://localhost:5000/interview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobRole, persona: selectedPersona.id, messages: [] }) });
        const data = await res.json();
        if (data.reply) {
          const initial = [{ role: "assistant", content: data.reply }];
          setMessages(initial);
          saveSession(jobRole, selectedPersona.id, initial);
        }
      } catch { setMessages([{ role: "assistant", content: "⚠️ Unable to start interview." }]); }
    })();
  }, [selectedPersona, jobRole]);

  // ── FIX 2: Save session on every message change ──
  useEffect(() => {
    if (selectedPersona && messages.length > 0) {
      saveSession(jobRole, selectedPersona.id, messages);
    }
  }, [messages, selectedPersona, jobRole]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // Stable refs for popup-dismiss speak effect
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  const speakRef = useRef(speak);
  useEffect(() => { speakRef.current = speak; }, [speak]);

  useEffect(() => {
    if (showPopup) return;
    const msgs = messagesRef.current;
    if (msgs.length === 1 && msgs[0].role === "assistant") {
      speakRef.current(msgs[0].content);
    }
  }, [showPopup]);

  // ── Send message ──
  const sendMessage = async () => {
    if (!input.trim()) return;
    if (isListening && recognitionRef.current) { recognitionRef.current.stop(); setIsListening(false); }
    stopSpeaking();
    const updated = [...messages, { role: "user", content: input }];
    setMessages(updated); setInput(""); setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/interview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobRole, persona: selectedPersona?.id || "balanced", messages: updated }) });
      const data = await res.json();
      if (data.reply) {
        const withReply = [...updated, { role: "assistant", content: data.reply }];
        setMessages(withReply);
        speak(data.reply);
      }
    } catch { setMessages([...updated, { role: "assistant", content: "⚠️ Interview service unavailable." }]); }
    finally   { setLoading(false); }
  };

  // ── NEW: Restart handler ──
  const handleRestart = () => {
    if (selectedPersona) clearSession(jobRole, selectedPersona.id);
    setMessages([]);
    setShowReport(false);
    setSelectedPersona(null);
    setShowPopup(true);
    setCachedSummary(null);
  };

  if (!selectedPersona) return <PersonaSplitCard onSelect={setSelectedPersona} />;

  const closePopup = () => { setShowPopup(false); };

  const PersonaBadge = () => (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"2px 10px", borderRadius:100, background:selectedPersona.light, border:`1px solid ${selectedPersona.border}`, fontSize:11, fontWeight:700, color:selectedPersona.color, marginBottom:3, verticalAlign:"middle" }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:selectedPersona.color, display:"inline-block" }}/>
      {selectedPersona.label} Mode
    </span>
  );

  const MuteButton = () => (
    <button onClick={toggleMute}
      title={isMuted ? "Unmute interviewer voice" : "Mute interviewer voice"}
      style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:100, cursor:"pointer", fontSize:11, fontWeight:700, transition:"all 0.2s ease", flexShrink:0, background: isMuted ? "#fee2e2" : "#f0fdf6", border: `1px solid ${isMuted ? "#fca5a5" : "#b6e8cc"}`, color: isMuted ? "#ef4444" : "#4caf82" }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {isMuted ? (<><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>) : (<><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></>)}
      </svg>
      {isMuted ? "Muted" : isSpeaking ? "Speaking…" : "Voice On"}
    </button>
  );

  return (
    <div className="relative min-h-screen overflow-hidden font-display text-gray-800">
      <style>{`
        @keyframes floatSoft{0%,100%{transform:translateY(0px)}50%{transform:translateY(-8px)}}
        @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dotBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        @keyframes glowPulse{0%,100%{box-shadow:0 20px 50px rgba(0,0,0,0.08),0 0 0 1px rgba(210,190,140,0.25),0 0 14px 2px rgba(220,205,160,0.10)}50%{box-shadow:0 20px 50px rgba(0,0,0,0.08),0 0 0 1px rgba(220,200,150,0.42),0 0 20px 4px rgba(230,215,170,0.15)}}
        @keyframes pulse-send{0%,100%{box-shadow:0 4px 14px rgba(163,177,138,0.35)}50%{box-shadow:0 4px 22px rgba(163,177,138,0.55)}}
        @keyframes popupIn{from{opacity:0;transform:scale(0.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes micPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}
        @keyframes micRipple{0%{transform:scale(1);opacity:0.7}100%{transform:scale(1.8);opacity:0}}
        @keyframes speakPulse{0%,100%{box-shadow:0 2px 10px rgba(100,120,220,0.08)}50%{box-shadow:0 0 16px 4px rgba(76,175,130,0.22)}}
        @keyframes robotFloat{0%,100%{transform:translateY(0px)}50%{transform:translateY(-6px)}}
        @keyframes eyeBlink{0%,90%,100%{transform:scaleY(1)}95%{transform:scaleY(0.08)}}
        @keyframes antennaPulse{0%,100%{fill:#A3B18A}50%{fill:#5b8dee}}
        @keyframes speakRing{0%{transform:scale(1);opacity:0.5}100%{transform:scale(1.75);opacity:0}}
        @keyframes mouthBounce{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.5)}}
        @keyframes panelGlow{0%,100%{box-shadow:0 4px 24px rgba(163,177,138,0.15)}50%{box-shadow:0 4px 32px rgba(91,141,238,0.22)}}
        @keyframes endBtnPulse{0%,100%{box-shadow:0 4px 14px rgba(239,91,91,0.25)}50%{box-shadow:0 4px 22px rgba(239,91,91,0.45)}}
        .robot-panel{animation:panelGlow 4s ease-in-out infinite}
        .robot-float{animation:robotFloat 3s ease-in-out infinite}
        .robot-eye{transform-origin:center;animation:eyeBlink 4s ease-in-out infinite}
        .robot-eye-r{transform-origin:center;animation:eyeBlink 4s ease-in-out 0.2s infinite}
        .antenna-dot{animation:antennaPulse 1s ease-in-out infinite}
        .speak-ring{animation:speakRing 1.1s ease-out infinite}
        .speak-ring-2{animation:speakRing 1.1s ease-out 0.4s infinite}
        .mouth-talk{transform-origin:center;animation:mouthBounce 0.25s ease-in-out infinite}
        .main-card{animation:glowPulse 5s ease-in-out infinite}
        .msg-bubble{animation:msgIn 0.3s cubic-bezier(0.16,1,0.3,1) both}
        .msg-speaking{animation:msgIn 0.3s cubic-bezier(0.16,1,0.3,1) both,speakPulse 1.6s ease-in-out infinite}
        .send-btn{transition:background 0.2s ease,transform 0.18s ease;animation:pulse-send 2.8s ease-in-out infinite}
        .send-btn:hover:not(:disabled){background:#8F9D78!important;transform:translateY(-1px);animation:none;box-shadow:0 8px 20px rgba(163,177,138,0.45)}
        .send-btn:disabled{opacity:0.7;cursor:not-allowed;animation:none}
        .chat-input{transition:border-color 0.2s ease,box-shadow 0.2s ease}
        .chat-input:focus{outline:none;border-color:#B7C7A1!important;box-shadow:0 0 0 3px rgba(183,199,161,0.22)}
        .voice-btn{position:relative;transition:transform 0.18s ease,background 0.2s ease;flex-shrink:0}
        .voice-btn:hover:not(:disabled){transform:scale(1.08)}
        .voice-btn:disabled{opacity:0.4;cursor:not-allowed}
        .voice-btn.listening{animation:micPulse 1.2s ease-in-out infinite;background:#ef4444!important;border-color:#ef4444!important}
        .mic-ripple{position:absolute;inset:-4px;border-radius:50%;border:2px solid rgba(239,68,68,0.5);animation:micRipple 1.2s ease-out infinite;pointer-events:none}
        .popup-card{animation:popupIn 0.4s cubic-bezier(0.16,1,0.3,1) both}
        .dot-1{animation:dotBounce 1.2s ease-in-out infinite 0s}
        .dot-2{animation:dotBounce 1.2s ease-in-out infinite 0.2s}
        .dot-3{animation:dotBounce 1.2s ease-in-out infinite 0.4s}
        .chat-scroll::-webkit-scrollbar{width:4px}
        .chat-scroll::-webkit-scrollbar-track{background:transparent}
        .chat-scroll::-webkit-scrollbar-thumb{background:#d8e4d0;border-radius:99px}
        .popup-li{display:flex;align-items:center;gap:8px;font-size:13px;color:#4a5a48;padding:7px 0;border-bottom:1px solid rgba(183,199,161,0.2)}
        .popup-li:last-child{border-bottom:none}
        /* NEW: end interview button */
        .end-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:10px;border:1.5px solid #fbc8c8;background:#fff5f5;color:#ef5b5b;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s ease;animation:endBtnPulse 3s ease-in-out infinite;flex-shrink:0}
        .end-btn:hover{background:#fee2e2;border-color:#ef5b5b;transform:translateY(-1px);animation:none;box-shadow:0 4px 14px rgba(239,91,91,0.28)}
        /* NEW: saved session dot */
        @keyframes savedPulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .iv-saved-dot{width:6px;height:6px;border-radius:50%;background:#4caf82;display:inline-block;animation:savedPulse 2.5s ease-in-out infinite}
      `}</style>

      <div className="absolute inset-0 bg-gradient-to-br from-[#f6f8f4] via-[#eef3ed] to-[#e6eee5]" />
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,#f3c1e8,transparent_70%)] opacity-30" />
      <div className="absolute top-1/3 -right-40 w-[460px] h-[460px] rounded-full bg-[radial-gradient(circle,#d6c8f7,transparent_70%)] opacity-30" />
      <div className="absolute bottom-0 left-1/4 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,#cfe8d5,transparent_70%)] opacity-30" />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-6xl flex items-stretch">

          {/* ── ROBOT AVATAR SIDE PANEL (100% unchanged) ── */}
          <div className="flex-shrink-0" style={{ width:220, minHeight:480, borderRadius:"28px 0 0 28px", background:"linear-gradient(160deg,#f0f7ff 0%,#e8f4ea 40%,#f5eeff 100%)", border:"1.5px solid rgba(255,255,255,0.9)", borderRight:"none", boxShadow: isSpeaking ? "0 8px 40px rgba(91,141,238,0.22),0 2px 12px rgba(163,177,138,0.15),inset 0 1px 0 rgba(255,255,255,0.9)" : "0 8px 32px rgba(163,177,138,0.14),0 2px 8px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,0.9)", backdropFilter:"blur(16px)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", padding:"24px 16px 20px", position:"relative", overflow:"hidden", transition:"box-shadow 0.4s ease" }}>
            <div style={{position:"absolute",top:-40,right:-30,width:130,height:130,borderRadius:"50%",background:"radial-gradient(circle,rgba(163,177,138,0.18) 0%,transparent 70%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:-30,left:-20,width:110,height:110,borderRadius:"50%",background:"radial-gradient(circle,rgba(91,141,238,0.14) 0%,transparent 70%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",top:"40%",right:-10,width:80,height:80,borderRadius:"50%",background:"radial-gradient(circle,rgba(239,154,154,0.10) 0%,transparent 70%)",pointerEvents:"none"}}/>
            <div style={{width:"100%",textAlign:"center",zIndex:1}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:100,padding:"4px 12px",fontSize:10,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",color:"#5b7a6a",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:isSpeaking?"#4caf82":"#90a4ae",display:"inline-block",transition:"background 0.3s ease",boxShadow:isSpeaking?"0 0 6px rgba(76,175,130,0.8)":"none"}}/>
                {isSpeaking?"Live":"Ready"}
              </div>
            </div>
            <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",width:180,height:200,zIndex:1}}>
              {isSpeaking&&(<>
                <div className="speak-ring" style={{position:"absolute",width:155,height:155,borderRadius:"50%",border:"1.5px solid rgba(91,141,238,0.35)",pointerEvents:"none"}}/>
                <div className="speak-ring-2" style={{position:"absolute",width:155,height:155,borderRadius:"50%",border:"1.5px solid rgba(163,177,138,0.40)",pointerEvents:"none"}}/>
              </>)}
              <div style={{position:"absolute",width:140,height:140,borderRadius:"50%",background:isSpeaking?"radial-gradient(circle,rgba(91,141,238,0.12) 0%,rgba(163,177,138,0.08) 60%,transparent 100%)":"radial-gradient(circle,rgba(163,177,138,0.10) 0%,transparent 70%)",transition:"background 0.5s ease"}}/>
              <svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" className={isSpeaking?"":"robot-float"} style={{width:160,height:190,filter:"drop-shadow(0 8px 24px rgba(91,130,180,0.22)) drop-shadow(0 2px 6px rgba(0,0,0,0.10))"}}>
                <defs>
                  <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#e8eef5"/><stop offset="100%" stopColor="#cdd8e8"/></linearGradient>
                  <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#dde8f5"/><stop offset="100%" stopColor="#c5d4e8"/></linearGradient>
                  <linearGradient id="eyeGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#a8d8ff"/><stop offset="100%" stopColor="#5b9ee8"/></linearGradient>
                  <linearGradient id="eyeGradG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#b8f0d8"/><stop offset="100%" stopColor="#4caf82"/></linearGradient>
                  <linearGradient id="armGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#d0dcea"/><stop offset="100%" stopColor="#b8cade"/></linearGradient>
                  <filter id="robotGlow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  <radialGradient id="screenGrad" cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#f0f8ff" stopOpacity="0.95"/><stop offset="100%" stopColor="#ddeeff" stopOpacity="0.7"/></radialGradient>
                </defs>
                <line x1="60" y1="3" x2="60" y2="16" stroke="#90a4ae" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="60" y1="8" x2="50" y2="4" stroke="#90a4ae" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="49" cy="3.5" r="3" fill="#b0bec5" className="antenna-dot"/>
                <circle cx="60" cy="3" r="5" fill="url(#eyeGrad)" className="antenna-dot" filter="url(#robotGlow)"/>
                <circle cx="60" cy="2" r="2" fill="white" opacity="0.7"/>
                <rect x="18" y="16" width="84" height="58" rx="18" fill="url(#headGrad)" stroke="#c8d8ec" strokeWidth="1"/>
                <rect x="22" y="20" width="76" height="50" rx="14" fill="url(#screenGrad)"/>
                <rect x="28" y="22" width="30" height="6" rx="3" fill="white" opacity="0.45"/>
                <rect x="26" y="30" width="26" height="24" rx="8" fill="#1e3a5a" opacity="0.85"/>
                <rect x="68" y="30" width="26" height="24" rx="8" fill="#1e3a5a" opacity="0.85"/>
                <ellipse cx="39" cy="42" rx="9" ry="9" fill={isSpeaking?"url(#eyeGradG)":"url(#eyeGrad)"} className="robot-eye" style={{transition:"fill 0.4s ease"}}/>
                <ellipse cx="81" cy="42" rx="9" ry="9" fill={isSpeaking?"url(#eyeGradG)":"url(#eyeGrad)"} className="robot-eye-r" style={{transition:"fill 0.4s ease"}}/>
                <circle cx="39" cy="42" r="4.5" fill="#0a2a4a" opacity="0.9"/>
                <circle cx="81" cy="42" r="4.5" fill="#0a2a4a" opacity="0.9"/>
                <circle cx="41.5" cy="39.5" r="2" fill="white" opacity="0.9"/>
                <circle cx="83.5" cy="39.5" r="2" fill="white" opacity="0.9"/>
                <circle cx="37" cy="44" r="1" fill="white" opacity="0.4"/>
                <circle cx="79" cy="44" r="1" fill="white" opacity="0.4"/>
                {isSpeaking&&(<>
                  <ellipse cx="39" cy="42" rx="11" ry="11" fill="none" stroke="#4caf82" strokeWidth="1.5" opacity="0.5" style={{animation:"speakRing 1.2s ease-out infinite"}}/>
                  <ellipse cx="81" cy="42" rx="11" ry="11" fill="none" stroke="#4caf82" strokeWidth="1.5" opacity="0.5" style={{animation:"speakRing 1.2s ease-out 0.2s infinite"}}/>
                </>)}
                <ellipse cx="22" cy="52" rx="6" ry="3.5" fill="#f48fb1" opacity="0.28"/>
                <ellipse cx="98" cy="52" rx="6" ry="3.5" fill="#f48fb1" opacity="0.28"/>
                <rect x="32" y="59" width="56" height="11" rx="5.5" fill="#1e3a5a" opacity="0.75"/>
                {isSpeaking?([0,1,2,3,4,5,6].map((i)=>(<rect key={i} x={35+i*7} y="61" width="4" height="7" rx="2" fill={i%2===0?"#81D4FA":"#80cbc4"} style={{transformOrigin:`${37+i*7}px 64.5px`,animation:`mouthBounce 0.${2+i%3}s ease-in-out ${i*0.06}s infinite`}}/>))):(<path d="M 38 64 Q 60 70 82 64" stroke="#81D4FA" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8"/>)}
                <rect x="8" y="28" width="10" height="22" rx="5" fill="url(#headGrad)" stroke="#c8d8ec" strokeWidth="1"/>
                <rect x="102" y="28" width="10" height="22" rx="5" fill="url(#headGrad)" stroke="#c8d8ec" strokeWidth="1"/>
                <circle cx="13" cy="39" r="3" fill={isSpeaking?"#4caf82":"#90a4ae"} style={{transition:"fill 0.3s ease"}} className={isSpeaking?"antenna-dot":""}/>
                <circle cx="107" cy="39" r="3" fill={isSpeaking?"#5b8dee":"#90a4ae"} style={{transition:"fill 0.3s ease"}} className={isSpeaking?"antenna-dot":""}/>
                <rect x="47" y="74" width="26" height="12" rx="6" fill="#b0bec5" stroke="#c8d8ec" strokeWidth="0.8"/>
                <rect x="52" y="76" width="5" height="8" rx="2.5" fill="#90a4ae" opacity="0.6"/>
                <rect x="60" y="76" width="5" height="8" rx="2.5" fill="#90a4ae" opacity="0.6"/>
                <rect x="14" y="86" width="92" height="56" rx="20" fill="url(#bodyGrad)" stroke="#c0d0e4" strokeWidth="1"/>
                <rect x="18" y="90" width="84" height="48" rx="16" fill="url(#screenGrad)"/>
                <rect x="24" y="93" width="32" height="7" rx="3.5" fill="white" opacity="0.35"/>
                <rect x="28" y="103" width="64" height="28" rx="10" fill="#1e3a5a" opacity="0.12"/>
                {isSpeaking?(<path d="M 32 117 Q 37 107 42 117 Q 47 127 52 117 Q 57 107 62 117 Q 67 127 72 117 Q 77 107 82 117 Q 87 127 88 117" stroke="#5b8dee" strokeWidth="2" fill="none" strokeLinecap="round" style={{animation:"mouthBounce 0.4s ease-in-out infinite"}}/>):(<>{[0,1,2,3].map(i=>(<line key={i} x1="32" y1={107+i*6} x2="88" y2={107+i*6} stroke="#90a4ae" strokeWidth="0.8" opacity="0.3"/>))}{[0,1,2,3,4,5,6].map(i=>(<line key={i} x1={32+i*8} y1="107" x2={32+i*8} y2="131" stroke="#90a4ae" strokeWidth="0.8" opacity="0.3"/>))}</>)}
                {[0,1,2,3,4].map((i)=>(<circle key={i} cx={36+i*12} cy="136" r="4" fill={isSpeaking?["#A3B18A","#5b8dee","#ef9a9a","#80cbc4","#f9a825"][i]:"#b0bec5"} style={isSpeaking?{animation:`antennaPulse 0.5s ease-in-out ${i*0.1}s infinite`}:{transition:"fill 0.3s ease"}}/>))}
                <rect x="-2" y="92" width="16" height="36" rx="8" fill="url(#armGrad)" stroke="#c0d0e4" strokeWidth="0.8"/>
                <rect x="106" y="92" width="16" height="36" rx="8" fill="url(#armGrad)" stroke="#c0d0e4" strokeWidth="0.8"/>
                <circle cx="6" cy="94" r="5" fill="#c8d8ec"/>
                <circle cx="114" cy="94" r="5" fill="#c8d8ec"/>
                <ellipse cx="6" cy="130" rx="8" ry="6" fill="url(#headGrad)" stroke="#c8d8ec" strokeWidth="0.8"/>
                <ellipse cx="114" cy="130" rx="8" ry="6" fill="url(#headGrad)" stroke="#c8d8ec" strokeWidth="0.8"/>
                <rect x="1" y="134" width="4" height="8" rx="2" fill="#b0bec5"/>
                <rect x="6" y="135" width="4" height="7" rx="2" fill="#b0bec5"/>
                <rect x="11" y="136" width="3" height="6" rx="1.5" fill="#b0bec5"/>
                <rect x="109" y="134" width="4" height="8" rx="2" fill="#b0bec5"/>
                <rect x="114" y="135" width="4" height="7" rx="2" fill="#b0bec5"/>
                <rect x="119" y="136" width="3" height="6" rx="1.5" fill="#b0bec5"/>
              </svg>
            </div>
            <div style={{textAlign:"center",zIndex:1,width:"100%"}}>
              <div style={{fontSize:14,fontWeight:900,color:"#2d4a6a",letterSpacing:"-0.01em",lineHeight:1}}>PREPBOT</div>
              <div style={{fontSize:10,color:"#7a9ab8",fontWeight:600,marginTop:3,letterSpacing:"0.06em",textTransform:"uppercase"}}>
                {isSpeaking?"Speaking now…":`${selectedPersona.label} Interviewer`}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:3,height:28,zIndex:1,width:"100%"}}>
              {[4,7,5,9,6,8,4,7,5].map((h,i)=>(<div key={i} style={{width:3,borderRadius:3,background:isSpeaking?`linear-gradient(to top,${selectedPersona.color},#5b8dee)`:"linear-gradient(to top,#d1dde8,#b8cad8)",height:isSpeaking?`${h*3}px`:"6px",transition:"height 0.15s ease,background 0.3s ease",animation:isSpeaking?`mouthBounce 0.${3+i%4}s ease-in-out ${i*0.05}s infinite`:"none",transformOrigin:"bottom"}}/>))}
            </div>
            {ttsSupported&&(<div style={{zIndex:1}}><MuteButton/></div>)}
            <svg viewBox="0 0 220 480" xmlns="http://www.w3.org/2000/svg" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}}>
              {[[30,40],[180,70],[20,200],[195,160],[40,380],[175,340],[100,420],[160,430]].map(([x,y],i)=>(<circle key={i} cx={x} cy={y} r={i%3===0?2:1.2} fill={["#5b8dee","#A3B18A","#ef9a9a","#80cbc4"][i%4]} opacity={isSpeaking?0.5:0.2} style={isSpeaking?{animation:`antennaPulse ${0.8+i*0.15}s ease-in-out ${i*0.1}s infinite`}:{transition:"opacity 0.4s ease"}}/>))}
              <path d="M 8 8 L 22 8 M 8 8 L 8 22" stroke="#A3B18A" strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
              <path d="M 212 8 L 198 8 M 212 8 L 212 22" stroke="#5b8dee" strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
              <path d="M 8 472 L 22 472 M 8 472 L 8 458" stroke="#ef9a9a" strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
              <path d="M 212 472 L 198 472 M 212 472 L 212 458" stroke="#80cbc4" strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
            </svg>
          </div>

          {/* ── CHAT CARD ── */}
          <div className="flex-1 min-w-0">
          <div className="main-card bg-white/80 backdrop-blur-xl p-6" style={{borderRadius:"0 28px 28px 0",border:"2px solid #cfd4df",borderLeft:"1px solid rgba(205,212,223,0.5)"}}>

            {/* Header */}
            <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4,flexWrap:"wrap",gap:8}}>
              <PersonaBadge />
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {/* End Interview button */}
                {messages.length >= 1 && (
                  <button className="end-btn" onClick={() => { stopSpeaking(); setShowReport(true); }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>
                    End Interview
                  </button>
                )}
              </div>
            </div>

            <h1 className="text-center text-xl font-semibold text-gray-900">Interview Simulation</h1>
            <p className="text-center text-sm font-bold text-gray-500 mb-5">
              Role: <span className="font-bold">{jobRole}</span>
            </p>

            {/* Chat */}
            <div className="chat-scroll h-80 overflow-y-auto rounded-2xl p-4 mb-4 space-y-4"
              style={{background:"linear-gradient(160deg,#f8fbf8,#f2f7f1)",border:"1px solid #e0ead8",boxShadow:"inset 0 2px 10px rgba(0,0,0,0.03)"}}>
              {messages.map((msg, idx) => {
                const isLastAI = msg.role==="assistant" && idx===messages.length-1;
                return (
                  <div key={idx}
                    className={msg.role==="assistant"?`${isLastAI&&isSpeaking?"msg-speaking":"msg-bubble"} max-w-[85%] whitespace-pre-line text-sm leading-relaxed mr-auto rounded-2xl rounded-tl-none px-4 py-3`:"msg-bubble max-w-[85%] whitespace-pre-line text-sm leading-relaxed ml-auto rounded-2xl rounded-tr-none px-4 py-3 text-right"}
                    style={msg.role==="assistant"?{background:"linear-gradient(135deg,#eef3ff,#e8f0ff)",color:"#2a3a8a",border:"1px solid #d4dcf8"}:{background:"linear-gradient(135deg,#e8f4ea,#dff0e2)",color:"#1a5a2a",border:"1px solid #b8ddc4",boxShadow:"0 2px 10px rgba(60,140,80,0.08)"}}
                  >
                    <span className="block font-semibold mb-1" style={{fontSize:11,opacity:0.65,letterSpacing:"0.05em"}}>{msg.role==="assistant"?"AI COACH":"YOU"}</span>
                    {msg.content}
                  </div>
                );
              })}
              {loading&&(
                <div className="mr-auto rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1" style={{background:"linear-gradient(135deg,#eef3ff,#e8f0ff)",border:"1px solid #d4dcf8",width:"fit-content"}}>
                  <span className="dot-1 inline-block w-2 h-2 rounded-full bg-blue-400"/>
                  <span className="dot-2 inline-block w-2 h-2 rounded-full bg-blue-400"/>
                  <span className="dot-3 inline-block w-2 h-2 rounded-full bg-blue-400"/>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {voiceError&&(
              <div className="mb-3 px-4 py-2 rounded-xl text-sm text-red-700 flex items-center gap-2" style={{background:"#fff0f0",border:"1px solid #fecaca"}}>
                <span>⚠️</span><span>{voiceError}</span>
                <button onClick={()=>setVoiceError("")} className="ml-auto text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
            )}
            {isListening&&(
              <div className="mb-3 px-4 py-2 rounded-xl text-sm flex items-center gap-2" style={{background:"#fff5f5",border:"1px solid #fca5a5"}}>
                <span className="dot-1 inline-block w-2 h-2 rounded-full bg-red-400"/>
                <span className="dot-2 inline-block w-2 h-2 rounded-full bg-red-400"/>
                <span className="dot-3 inline-block w-2 h-2 rounded-full bg-red-400"/>
                <span className="text-red-600 font-medium ml-1">Listening… speak now</span>
                <span className="ml-auto text-xs text-red-400">Click 🎤 to stop</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <input type="text" value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&sendMessage()} placeholder={isListening?"Listening... speak now 🎤":"Type your answer or use the mic"} className="chat-input flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none"/>
              {voiceSupported&&(
                <button onClick={toggleVoice} disabled={loading} title={isListening?"Stop recording":"Start voice input"} className={`voice-btn w-12 h-12 rounded-xl flex items-center justify-center border-2 ${isListening?"listening bg-red-500 border-red-500 text-white":"bg-white border-gray-300 text-gray-600 hover:border-[#B7C7A1] hover:text-[#5a7a4a]"}`}>
                  {isListening&&<span className="mic-ripple"/>}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
                </button>
              )}
              <button onClick={sendMessage} disabled={loading} className="send-btn px-6 py-3 rounded-xl bg-[#A3B18A] text-white font-medium">Send</button>
            </div>
            {!voiceSupported&&<p className="mt-2 text-xs text-gray-400 text-center">🎤 Voice input is not supported in this browser. Try Chrome or Edge.</p>}
          </div>
          </div>
        </div>
      </div>

      {/* Welcome Popup (unchanged) */}
      {showPopup&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="popup-card relative w-full max-w-md rounded-2xl bg-gradient-to-br from-[#eef3ff] via-[#f0f7f3] to-[#e8f4ea] border border-[#cfd4df] shadow-[0_25px_60px_rgba(0,0,0,0.2)] p-6 pt-10">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center border border-[#cfd4df]" style={{animation:"floatSoft 2.5s ease-in-out infinite"}}>
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="47" y="10" width="6" height="15" rx="2" fill="#78909C"/><circle cx="50" cy="10" r="4" fill="#FF5252"/>
                <rect x="25" y="25" width="50" height="50" rx="10" fill="#B0BEC5"/>
                <rect x="35" y="35" width="30" height="20" rx="5" fill="#546E7A"/>
                <circle cx="43" cy="45" r="4" fill="#81D4FA"/><circle cx="57" cy="45" r="4" fill="#81D4FA"/>
                <rect x="42" y="60" width="16" height="4" rx="2" fill="#FF5252"/>
                <rect x="15" y="35" width="10" height="30" rx="5" fill="#78909C"/><rect x="75" y="35" width="10" height="30" rx="5" fill="#78909C"/>
                <rect x="35" y="75" width="10" height="15" rx="3" fill="#78909C"/><rect x="55" y="75" width="10" height="15" rx="3" fill="#78909C"/>
              </svg>
            </div>
            <button onClick={closePopup} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">✕</button>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Welcome!</h2>
            <p className="text-sm text-gray-700 mb-3">You're about to begin a simulated interview.</p>
            <ul className="mb-4" style={{padding:0}}>
              {[{icon:"💬",text:"Answer naturally and honestly"},{icon:"❓",text:"One question is asked at a time"},{icon:"✅",text:"You'll receive short feedback"},{icon:"🎤",text:"Use the mic button for voice input"}].map((item,i)=><li key={i} className="popup-li">{item.icon} {item.text}</li>)}
            </ul>
            <div className="text-right">
              <button onClick={closePopup} className="send-btn px-4 py-2 rounded-lg bg-[#A3B18A] text-white font-medium hover:bg-[#8F9D78] transition">Start Interview</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Report Card Modal */}
      {showReport && (
        <ReportCard
          jobRole={jobRole}
          persona={selectedPersona}
          messages={messages}
          cachedSummary={cachedSummary}
          onSummaryReady={setCachedSummary}
          onClose={() => setShowReport(false)}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};

export default InterviewSimulation;