import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const months = [
  { name: "January",   icon: "ac_unit",         color: "#93c5fd" },
  { name: "February",  icon: "snowing",          color: "#f9a8d4" },
  { name: "March",     icon: "potted_plant",     color: "#6ee7b7" },
  { name: "April",     icon: "local_florist",    color: "#f9a8d4" },
  { name: "May",       icon: "sunny",            color: "#fcd34d" },
  { name: "June",      icon: "light_mode",       color: "#67e8f9" },
  { name: "July",      icon: "waves",            color: "#fb923c" },
  { name: "August",    icon: "icecream",         color: "#a78bfa" },
  { name: "September", icon: "eco",              color: "#fb923c" },
  { name: "October",   icon: "celebration",      color: "#4ade80" },
  { name: "November",  icon: "checkroom",        color: "#d97706" },
  { name: "December",  icon: "holiday_village",  color: "#34d399" },
];

// ─────────────────────────────────────────────
// NEW: sessionStorage cache helpers
// Key is role-specific so different roles don't
// share stale data, but the same role within a
// session is fetched only once.
// ─────────────────────────────────────────────
const CACHE_KEY = (role) =>
  `skillup_hiring_${role.trim().toLowerCase().replace(/\s+/g, "_")}`;

function getCached(role) {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY(role));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setCache(role, data) {
  try {
    sessionStorage.setItem(CACHE_KEY(role), JSON.stringify(data));
  } catch {}
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const HiringCalendar = () => {
  const location = useLocation();
  const params   = new URLSearchParams(location.search);
  const jobRole  = params.get("role") || "software engineer";

  const [calendarData,  setCalendarData]  = useState({});
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  const detailsRef = useRef(null);

  useEffect(() => {
    // ── NEW: check cache first ──
    const cached = getCached(jobRole);
    if (cached) {
      setCalendarData(cached);
      setLoading(false);
      return;
    }

    // Cache miss — fetch from API
    setLoading(true);
    setError(null);

    fetch(`http://localhost:5000/hiring-calendar?role=${encodeURIComponent(jobRole)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          const cal = data.calendar || {};
          setCalendarData(cal);
          // ── NEW: save to sessionStorage ──
          setCache(jobRole, cal);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch hiring data.");
        setLoading(false);
      });
  }, [jobRole]);

  useEffect(() => {
    if (selectedMonth && detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedMonth]);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" rel="stylesheet"/>

      <div style={{ minHeight:"100vh", background:"linear-gradient(to bottom right, #e0e7ff, #f3e8ff, #e0f2fe)", fontFamily:"'Nunito','Segoe UI',sans-serif", position:"relative", overflowX:"hidden" }}>

        <style>{`
          @keyframes hcFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
          @keyframes hcCardIn { from{opacity:0;transform:scale(0.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
          @keyframes hcSpin   { to { transform:rotate(360deg); } }
          @keyframes hcOrb1   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
          @keyframes hcOrb2   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
          @keyframes hcGlow {
            0%,100% { box-shadow:0 20px 50px rgba(0,0,0,0.08),0 0 0 1px rgba(210,190,140,0.3),0 0 16px 3px rgba(220,205,160,0.12); }
            50%      { box-shadow:0 20px 50px rgba(0,0,0,0.08),0 0 0 1px rgba(220,200,150,0.55),0 0 22px 5px rgba(230,215,170,0.18); }
          }
          @keyframes pulseDot {
            0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(163,177,138,0.6)}
            50%    {opacity:0.7;box-shadow:0 0 0 4px rgba(163,177,138,0)}
          }

          .hc-glow-card {
            background: rgba(255,255,255,0.72);
            backdrop-filter: blur(18px);
            border-radius: 28px;
            border: 1px solid rgba(255,255,255,0.75);
            animation: hcGlow 4s ease-in-out infinite;
          }

          .hc-month-btn {
            background: rgba(255,255,255,0.78);
            border-radius: 20px;
            border: 1.5px solid rgba(255,255,255,0.9);
            padding: 22px 12px 18px;
            cursor: pointer;
            display: flex; flex-direction: column; align-items: center; gap: 10px;
            box-shadow: 0 2px 14px rgba(0,0,0,0.06);
            position: relative; overflow: hidden;
            transition: all 0.28s cubic-bezier(0.34,1.3,0.64,1);
            animation: hcFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
          }
          .hc-month-btn::after {
            content:""; position:absolute; bottom:0; left:0; right:0; height:3px;
            border-radius:0 0 20px 20px;
            background: var(--ma); opacity:0; transition:opacity 0.2s ease;
          }
          .hc-month-btn:hover {
            transform: translateY(-6px) scale(1.04);
            box-shadow: 0 14px 36px rgba(0,0,0,0.11);
            border-color: var(--ma);
            background: rgba(255,255,255,0.97);
          }
          .hc-month-btn:hover::after  { opacity:1; }
          .hc-month-btn.sel {
            transform: translateY(-6px) scale(1.05);
            border-color: var(--ma);
            background: rgba(255,255,255,0.97);
            box-shadow: 0 0 0 3px rgba(163,177,138,0.22), 0 18px 40px rgba(0,0,0,0.11);
          }
          .hc-month-btn.sel::after { opacity:1; }

          .hc-job-card {
            background: rgba(255,255,255,0.82);
            border-radius: 15px;
            border: 1px solid rgba(255,255,255,0.9);
            padding: 15px 20px;
            display: flex; justify-content:space-between; align-items:center; gap:16px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            transition: all 0.22s ease;
            animation: hcCardIn 0.4s cubic-bezier(0.16,1,0.3,1) both;
          }
          .hc-job-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 28px rgba(0,0,0,0.09);
            border-color: #B7C7A1;
          }

          .hc-apply-btn {
            padding:8px 18px; border-radius:10px; border:none;
            font-weight:800; font-size:12.5px; cursor:pointer;
            text-decoration:none; display:inline-block; white-space:nowrap;
            background:#A3B18A; color:#fff;
            box-shadow:0 4px 12px rgba(163,177,138,0.32);
            transition:all 0.2s ease;
          }
          .hc-apply-btn:hover {
            background:#8D9977; transform:translateY(-2px);
            box-shadow:0 8px 20px rgba(163,177,138,0.42);
          }

          .hc-month-btn:nth-child(1) {animation-delay:0.02s}
          .hc-month-btn:nth-child(2) {animation-delay:0.04s}
          .hc-month-btn:nth-child(3) {animation-delay:0.06s}
          .hc-month-btn:nth-child(4) {animation-delay:0.08s}
          .hc-month-btn:nth-child(5) {animation-delay:0.10s}
          .hc-month-btn:nth-child(6) {animation-delay:0.12s}
          .hc-month-btn:nth-child(7) {animation-delay:0.14s}
          .hc-month-btn:nth-child(8) {animation-delay:0.16s}
          .hc-month-btn:nth-child(9) {animation-delay:0.18s}
          .hc-month-btn:nth-child(10){animation-delay:0.20s}
          .hc-month-btn:nth-child(11){animation-delay:0.22s}
          .hc-month-btn:nth-child(12){animation-delay:0.24s}

          .hc-job-card:nth-child(1){animation-delay:0.03s}
          .hc-job-card:nth-child(2){animation-delay:0.07s}
          .hc-job-card:nth-child(3){animation-delay:0.11s}
          .hc-job-card:nth-child(4){animation-delay:0.15s}
          .hc-job-card:nth-child(5){animation-delay:0.19s}
          .hc-job-card:nth-child(6){animation-delay:0.23s}

          .hc-spin { animation: hcSpin 0.9s linear infinite; }
          .hc-dot  { animation: pulseDot 1.8s ease-in-out infinite; }

          .hc-scroll::-webkit-scrollbar       { width:4px; }
          .hc-scroll::-webkit-scrollbar-track { background:transparent; }
          .hc-scroll::-webkit-scrollbar-thumb { background:#B7C7A1; border-radius:99px; }

          .material-symbols-outlined {
            font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 48;
          }

          /* NEW: cache badge */
          .hc-cache-badge {
            display: inline-flex; align-items:center; gap:5px;
            background: rgba(240,247,236,0.9); border:1px solid #B7C7A1;
            border-radius:99px; padding:3px 10px;
            font-size:10px; font-weight:700; color:#4a6a3a;
          }
        `}</style>

        <div style={{ position:"relative", zIndex:1, maxWidth:1060, margin:"0 auto", padding:"32px 24px 40px" }}>

          {/* ── Header ── */}
          <div style={{ textAlign:"center", marginBottom:26, animation:"hcFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.78)", border:"1px solid rgba(183,199,161,0.6)", borderRadius:100, padding:"4px 14px", fontSize:11, fontWeight:700, color:"#5a7a4a", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:14, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
              <span className="hc-dot" style={{ width:7, height:7, borderRadius:"50%", background:"#A3B18A", display:"inline-block" }}/>
              Live Hiring Data · 2026
            </div>

            <h1 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:900, color:"#1a2a1a", letterSpacing:"-0.03em", lineHeight:1.1, margin:"0 0 10px" }}>
              Hiring Calendar
            </h1>
            <p style={{ fontSize:14, color:"#7a6a58", maxWidth:420, margin:"0 auto 10px", lineHeight:1.65, fontWeight:500 }}>
              Discover peak hiring seasons and prepare at the right time.
            </p>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.8)", border:"1.5px solid #d4e0cc", borderRadius:100, padding:"5px 14px", fontSize:12.5, fontWeight:700, color:"#4a6a3a", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                🎯 {jobRole}
              </div>

            </div>
            <p style={{ fontSize:12, color:"#b0a898", marginTop:10, letterSpacing:"0.03em" }}>
              Click any month to view active listings
            </p>
          </div>

          {/* ── Main glassmorphism card ── */}
          <div className="hc-glow-card" style={{ padding:"26px 24px 22px" }}>

            {/* Loading */}
            {loading && (
              <div style={{ textAlign:"center", padding:"40px 0" }}>
                <svg className="hc-spin" width="34" height="34" viewBox="0 0 24 24" fill="none" style={{ margin:"0 auto 10px", display:"block" }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(163,177,138,0.3)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#A3B18A" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                <p style={{ color:"#9aaa8a", fontSize:13, fontWeight:600 }}>Loading hiring data…</p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div style={{ textAlign:"center", padding:"36px 0" }}>
                <p style={{ color:"#c46a6a", fontSize:14, fontWeight:600 }}>⚠️ {error}</p>
              </div>
            )}

            {/* ── Month grid ── */}
            {!loading && !error && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                {months.map((month) => {
                  const hasData    = !!(calendarData[month.name]?.length);
                  const count      = calendarData[month.name]?.length || 0;
                  const isSelected = selectedMonth === month.name;
                  return (
                    <button
                      key={month.name}
                      onClick={() => setSelectedMonth(isSelected ? null : month.name)}
                      className={`hc-month-btn${isSelected ? " sel" : ""}`}
                      style={{ "--ma": month.color }}
                    >
                      {hasData && (
                        <div style={{ position:"absolute", top:9, right:10, width:7, height:7, borderRadius:"50%", background:month.color, boxShadow:`0 0 6px ${month.color}` }}/>
                      )}
                      <span className="material-symbols-outlined" style={{ fontSize:48, color:month.color, lineHeight:1 }}>
                        {month.icon}
                      </span>
                      <span style={{ fontSize:12, fontWeight:800, color:"#3a3530", letterSpacing:"0.04em", textTransform:"uppercase" }}>
                        {month.name}
                      </span>
                      <span style={{ fontSize:10.5, fontWeight:700, color: hasData ? month.color : "#c0b8ae" }}>
                        {hasData ? `${count} listing${count > 1 ? "s" : ""}` : "—"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Job listings ── */}
          {selectedMonth && !loading && !error && (
            <div ref={detailsRef} style={{ marginTop:18, animation:"hcFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>

              <div className="hc-glow-card" style={{ padding:"16px 22px", marginBottom:10, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span className="material-symbols-outlined" style={{ fontSize:24, color: months.find(m=>m.name===selectedMonth)?.color }}>
                    {months.find(m=>m.name===selectedMonth)?.icon}
                  </span>
                  <div>
                    <h2 style={{ fontSize:17, fontWeight:900, color:"#1a2a1a", margin:0, letterSpacing:"-0.01em" }}>
                      {selectedMonth} Openings
                    </h2>
                    <p style={{ fontSize:11.5, color:"#9aaa8a", margin:0, fontWeight:500 }}>
                      {calendarData[selectedMonth]?.length
                        ? `${calendarData[selectedMonth].length} listing${calendarData[selectedMonth].length > 1 ? "s" : ""} for "${jobRole}"`
                        : `No listings found in ${selectedMonth}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMonth(null)}
                  style={{ padding:"6px 14px", borderRadius:10, border:"1.5px solid #e0dcd4", background:"rgba(255,255,255,0.8)", fontSize:12, fontWeight:700, color:"#7a6a58", cursor:"pointer", transition:"all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="#B7C7A1"; e.currentTarget.style.color="#4a6a3a"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="#e0dcd4"; e.currentTarget.style.color="#7a6a58"; }}
                >
                  ✕ Close
                </button>
              </div>

              {calendarData[selectedMonth]?.length > 0 ? (
                <div className="hc-scroll" style={{ display:"flex", flexDirection:"column", gap:10, maxHeight:340, overflowY:"auto", paddingRight:4 }}>
                  {calendarData[selectedMonth].map((item, i) => (
                    <div key={i} className="hc-job-card" style={{ animationDelay:`${i*0.05}s` }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                          <div style={{ width:32, height:32, borderRadius:8, background:"rgba(183,199,161,0.2)", border:"1px solid rgba(183,199,161,0.38)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize:17, color:"#A3B18A" }}>business</span>
                          </div>
                          <div>
                            <div style={{ fontSize:14, fontWeight:800, color:"#1a2a1a", lineHeight:1 }}>{item.company}</div>
                            <div style={{ fontSize:11.5, color:"#7a6a58", marginTop:1.5 }}>{item.role}</div>
                          </div>
                        </div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                          {item.location && (
                            <span style={{ fontSize:10.5, fontWeight:600, color:"#5a6a58", background:"rgba(163,177,138,0.14)", border:"1px solid rgba(163,177,138,0.28)", borderRadius:100, padding:"2px 8px" }}>📍 {item.location}</span>
                          )}
                          {item.category && (
                            <span style={{ fontSize:10.5, fontWeight:600, color:"#5a6a8a", background:"rgba(183,199,220,0.16)", border:"1px solid rgba(183,199,220,0.32)", borderRadius:100, padding:"2px 8px" }}>{item.category}</span>
                          )}
                          {item.salary && item.salary !== "Not disclosed" && (
                            <span style={{ fontSize:10.5, fontWeight:600, color:"#4a7a4a", background:"rgba(163,177,138,0.14)", border:"1px solid rgba(163,177,138,0.28)", borderRadius:100, padding:"2px 8px" }}>{item.salary}</span>
                          )}
                        </div>
                      </div>
                      <a href={item.apply_link} target="_blank" rel="noopener noreferrer" className="hc-apply-btn">
                        Apply →
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:"32px 24px", background:"rgba(255,255,255,0.65)", borderRadius:16, border:"1.5px dashed #d8d4cc" }}>
                  <span className="material-symbols-outlined" style={{ fontSize:34, color:"#c0b8ae", display:"block", marginBottom:6 }}>search</span>
                  <p style={{ fontSize:14, fontWeight:700, color:"#7a6a58", margin:"0 0 4px" }}>No listings available</p>
                  <p style={{ fontSize:12, color:"#b0a898", margin:0 }}>Try a different month or job role.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default HiringCalendar;