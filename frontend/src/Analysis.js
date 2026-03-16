import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Analysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, jobRole } = location.state || {};

  const [showCongrats, setShowCongrats] = React.useState(false);
  const [animatedScore, setAnimatedScore] = React.useState(0);

  // ✅ All hooks before early return
  React.useEffect(() => {
    if (!result) return;
    const { score } = result;
    if (score === 100) setShowCongrats(true);
    let start = 0;
    const step = Math.ceil(score / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(start);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [result]);

  if (!result) {
    return (
      <p className="text-center mt-20">
        No analysis data found. Please upload a resume first.
      </p>
    );
  }

  const { resumeSkills, requiredSkills, missingSkills, score } = result;

  const getScoreInfo = (s) => {
    if (s >= 80) return { color: "#4a9e6a", bg: "#f0faf4", label: "Excellent" };
    if (s >= 60) return { color: "#4a8fa8", bg: "#f0f8fa", label: "Good" };
    if (s >= 40) return { color: "#c4882a", bg: "#fdf6ec", label: "Fair" };
    return       { color: "#c46a6a", bg: "#fdf2f2", label: "Needs Work" };
  };
  const scoreInfo = getScoreInfo(score);
  const matchedSkills = requiredSkills.filter((s) => !missingSkills.includes(s));

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7f5", position: "relative", overflowX: "hidden" }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)}  }
        @keyframes scaleIn {
          from { opacity:0; transform:scale(0.96) translateY(14px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes ringDraw {
          from { stroke-dashoffset: 314; }
          to   { stroke-dashoffset: var(--ring-end); }
        }
        @keyframes barGrow {
          from { width:0%; }
          to   { width:var(--bar-w); }
        }

        .orb-a { animation: floatA 8s ease-in-out infinite; }
        .orb-b { animation: floatB 10s ease-in-out 2s infinite; }

        .fade-up  { animation: fadeUp  0.65s cubic-bezier(0.16,1,0.3,1) both; }
        .card-1   { animation: scaleIn 0.55s cubic-bezier(0.16,1,0.3,1) 0.08s both; }
        .card-2   { animation: scaleIn 0.55s cubic-bezier(0.16,1,0.3,1) 0.18s both; }
        .card-3   { animation: scaleIn 0.55s cubic-bezier(0.16,1,0.3,1) 0.28s both; }
        .card-4   { animation: scaleIn 0.55s cubic-bezier(0.16,1,0.3,1) 0.38s both; }
        .card-5   { animation: scaleIn 0.55s cubic-bezier(0.16,1,0.3,1) 0.48s both; }

        .score-ring { animation: ringDraw 1.1s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
        .bar-fill   { animation: barGrow  1s   cubic-bezier(0.16,1,0.3,1) 0.4s  both; }

        .s-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid #e4eae0;
          box-shadow: 0 2px 16px rgba(0,0,0,0.04);
          transition: box-shadow 0.25s ease, transform 0.25s ease;
        }
        .s-card:hover {
          box-shadow: 0 6px 28px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .pill {
          display:inline-flex; align-items:center; gap:5px;
          border-radius:99px; padding:4px 11px;
          font-size:12px; font-weight:500;
          transition: transform 0.18s ease;
          cursor: default;
        }
        .pill:hover { transform: translateY(-2px); }

        .pill-green  { background:#f0faf4; border:1.5px solid #9ed4b0; color:#2e7a4a; }
        .pill-amber  { background:#fdf6ec; border:1.5px solid #e8c07a; color:#7a4e10; }
        .pill-blue   { background:#f0f5ff; border:1.5px solid #a8c0f0; color:#2a4a8a; }

        .seg-bar-item {
          flex:1; height:100%; transition: opacity 0.2s;
          opacity: 0.8; cursor:default;
        }
        .seg-bar-item:hover { opacity:1; }

        .main-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:14px 40px; border-radius:12px;
          background:#4a8fa8; color:#fff;
          font-weight:700; font-size:15px; border:none; cursor:pointer;
          box-shadow: 0 6px 20px rgba(74,143,168,0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .main-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(74,143,168,0.4);
        }

        .divider { height:1px; background:#edf0eb; margin:16px 0; }

        .icon-box {
          width:38px; height:38px; border-radius:10px;
          display:flex; align-items:center; justify-content:center; font-size:17px;
          flex-shrink:0;
        }
      `}</style>

      {/* ── Very subtle orbs, much less prominent ── */}
      <div className="orb-a" style={{
        position:"absolute", top:-80, left:-80,
        width:320, height:320, borderRadius:"50%",
        background:"rgba(183,210,183,0.18)", filter:"blur(60px)",
        pointerEvents:"none",
      }} />
      <div className="orb-b" style={{
        position:"absolute", bottom:0, right:-60,
        width:280, height:280, borderRadius:"50%",
        background:"rgba(183,199,220,0.15)", filter:"blur(60px)",
        pointerEvents:"none",
      }} />

      <main style={{ maxWidth:1080, margin:"0 auto", padding:"36px 24px 60px" }}>

        {/* ══════════════════════════════════════
            HEADER BOX  ← new boxed header
        ══════════════════════════════════════ */}
        <div className="fade-up s-card" style={{
          padding:"24px 28px", marginBottom:24,
          display:"flex", alignItems:"center",
          justifyContent:"space-between", flexWrap:"wrap", gap:16,
          borderLeft:"4px solid #B7C7A1",
        }}>
          <div>
            {/* Breadcrumb */}
            <div style={{ display:"flex", alignItems:"center", gap:6,
              fontSize:12, color:"#9aaa8a", marginBottom:6 }}>
              <span style={{ cursor:"pointer", transition:"color 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.color="#4a7a3a"}
                onMouseLeave={e=>e.currentTarget.style.color="#9aaa8a"}
                onClick={()=>navigate("/analyze")}>
                Home
              </span>
              <span>›</span>
              <span style={{ color:"#5a7a4a", fontWeight:600 }}>Skill Gap Report</span>
            </div>

            <h1 style={{ fontSize:30, fontWeight:800, color:"#1a2a1a",
              letterSpacing:"-0.02em", lineHeight:1.2 }}>
              Skill Gap Analysis
            </h1>

            <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <span style={{
                display:"inline-flex", alignItems:"center", gap:5,
                background:"#f4f8f0", border:"1px solid #c4d8a8",
                borderRadius:99, padding:"3px 12px",
                fontSize:12, fontWeight:600, color:"#4a6a32",
              }}>🎯 {jobRole}</span>

              <span style={{
                display:"inline-flex", alignItems:"center", gap:5,
                background: scoreInfo.bg,
                border:`1px solid ${scoreInfo.color}55`,
                borderRadius:99, padding:"3px 12px",
                fontSize:12, fontWeight:600, color: scoreInfo.color,
              }}>
                {score}% Match · {scoreInfo.label}
              </span>
            </div>
          </div>

          <button
            onClick={()=>navigate("/analyze")}
            style={{
              display:"flex", alignItems:"center", gap:6,
              background:"#f8faf6", border:"1px solid #d4e0cc",
              borderRadius:10, padding:"9px 18px",
              fontSize:13, fontWeight:600, color:"#4a6a3a",
              cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap",
            }}
            onMouseEnter={e=>{e.currentTarget.style.background="#edf5e6"; e.currentTarget.style.borderColor="#B7C7A1";}}
            onMouseLeave={e=>{e.currentTarget.style.background="#f8faf6"; e.currentTarget.style.borderColor="#d4e0cc";}}
          >
            ← Analyze Another
          </button>
        </div>

        {/* ══════════════════════════════════════
            SCORE BANNER
        ══════════════════════════════════════ */}
        <div className="card-1 s-card" style={{
          padding:"28px 32px", marginBottom:20,
          background:"#fff",
          borderTop:`3px solid ${scoreInfo.color}`,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:32, flexWrap:"wrap" }}>

            {/* Ring */}
            <div style={{ position:"relative", width:110, height:110, flexShrink:0 }}>
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="46"
                  fill="none" stroke="#f0f0ee" strokeWidth="9" />
                <circle
                  className="score-ring"
                  cx="55" cy="55" r="46"
                  fill="none" stroke={scoreInfo.color} strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray="289"
                  strokeDashoffset={289 - (289 * score) / 100}
                  transform="rotate(-90 55 55)"
                  style={{"--ring-end": 289 - (289 * score) / 100}}
                />
              </svg>
              <div style={{
                position:"absolute", inset:0,
                display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center",
              }}>
                <span style={{ fontSize:24, fontWeight:800, color:scoreInfo.color, lineHeight:1 }}>
                  {animatedScore}%
                </span>
                <span style={{ fontSize:9, color:"#bbb", fontWeight:600, marginTop:2, letterSpacing:"0.06em" }}>
                  MATCH
                </span>
              </div>
            </div>

            {/* Text */}
            <div style={{ flex:1, minWidth:200 }}>
              <p style={{ fontSize:19, fontWeight:800, color:"#1a2a1a", marginBottom:6 }}>
                {score >= 80 ? "You're almost there! 🚀" :
                 score >= 60 ? "Good progress! 💪" :
                 score >= 40 ? "Keep learning! 📚" : "Let's get started! 🎯"}
              </p>
              <p style={{ fontSize:13, color:"#6a7a6a", lineHeight:1.75, maxWidth:500, marginBottom:16 }}>
                Your resume matches{" "}
                <strong style={{ color:scoreInfo.color }}>{matchedSkills.length} of {requiredSkills.length}</strong>{" "}
                required skills for <strong>{jobRole}</strong>.
                {missingSkills.length > 0
                  ? ` Upskill in ${missingSkills.length} area${missingSkills.length > 1 ? "s" : ""} to improve your score.`
                  : " You have every required skill — excellent!"}
              </p>

              {/* Bar */}
              <div style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:11, color:"#9aaa8a", fontWeight:500 }}>Overall Match</span>
                  <span style={{ fontSize:11, fontWeight:700, color:scoreInfo.color }}>{score}%</span>
                </div>
                <div style={{ width:"100%", height:7, background:"#edeee9", borderRadius:99, overflow:"hidden" }}>
                  <div className="bar-fill" style={{
                    height:"100%", borderRadius:99,
                    background:scoreInfo.color,
                    "--bar-w":`${score}%`,
                  }} />
                </div>
              </div>

              {/* Stats */}
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                {[
                  { val:resumeSkills.length,  label:"Found",   color:"#4a9e6a", bg:"#f0faf4" },
                  { val:matchedSkills.length,  label:"Matched", color:"#4a8fa8", bg:"#f0f5fa" },
                  { val:missingSkills.length,  label:"Missing", color:"#c4882a", bg:"#fdf6ec" },
                ].map((s,i) => (
                  <div key={i} style={{
                    background:s.bg, borderRadius:10,
                    padding:"6px 14px", textAlign:"center", minWidth:72,
                  }}>
                    <div style={{ fontSize:18, fontWeight:800, color:s.color }}>{s.val}</div>
                    <div style={{ fontSize:10, color:"#9aaa8a", fontWeight:600 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            THREE SKILL CARDS
        ══════════════════════════════════════ */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:16 }}
          className="grid-3">
          <style>{`
            @media(max-width:768px){
              .grid-3 { grid-template-columns:1fr !important; }
            }
          `}</style>

          {/* Resume Skills */}
          <div className="card-2 s-card" style={{ padding:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div className="icon-box" style={{ background:"#f4faf6", border:"1px solid #b8ddc4" }}>📄</div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:"#1a2a1a" }}>Resume Skills</div>
                <div style={{ fontSize:11, color:"#9aaa8a" }}>{resumeSkills.length} detected</div>
              </div>
            </div>
            <div className="divider" />
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {resumeSkills.map(skill => (
                <span key={skill} className="pill pill-green">
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#4a9e6a", flexShrink:0 }} />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="card-3 s-card" style={{
            padding:24,
            borderColor: missingSkills.length === 0 ? "#b8ddc4" : "#e8c87a",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div className="icon-box" style={{ background:"#fdf8ee", border:"1px solid #e8c87a" }}>⚡</div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:"#1a2a1a" }}>Missing Skills</div>
                <div style={{ fontSize:11, color:"#aa8830" }}>
                  {missingSkills.length === 0 ? "Perfect match!" : `${missingSkills.length} to work on`}
                </div>
              </div>
            </div>
            <div className="divider" />
            {missingSkills.length === 0
              ? <div style={{ textAlign:"center", padding:"18px 0", color:"#4a9e6a", fontSize:13, fontWeight:600 }}>
                  🎉 You have all required skills!
                </div>
              : <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {missingSkills.map(skill => (
                    <span key={skill} className="pill pill-amber">
                      <span style={{ width:6, height:6, borderRadius:"50%", background:"#c4882a", flexShrink:0 }} />
                      {skill}
                    </span>
                  ))}
                </div>
            }
          </div>

          {/* Required Skills */}
          <div className="card-4 s-card" style={{ padding:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div className="icon-box" style={{ background:"#f2f5fd", border:"1px solid #b0c4f0" }}>🎯</div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:"#1a2a1a" }}>Required Skills</div>
                <div style={{ fontSize:11, color:"#6a7aaa" }}>{requiredSkills.length} for {jobRole}</div>
              </div>
            </div>
            <div className="divider" />
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {requiredSkills.map(skill => {
                const matched = !missingSkills.includes(skill);
                return (
                  <span key={skill} className={`pill ${matched ? "pill-green" : "pill-amber"}`}>
                    {matched ? "✓" : "○"} {skill}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            BREAKDOWN BAR
        ══════════════════════════════════════ */}
        <div className="card-5 s-card" style={{ padding:24, marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div className="icon-box" style={{ background:"#f4f8f0", border:"1px solid #c4d8a8" }}>📊</div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#1a2a1a" }}>Match Breakdown</div>
              <div style={{ fontSize:11, color:"#9aaa8a" }}>
                {matchedSkills.length} matched · {missingSkills.length} missing
              </div>
            </div>
          </div>
          <div className="divider" />

          {/* Segmented bar */}
          <div style={{ display:"flex", gap:3, height:12, borderRadius:99, overflow:"hidden", marginBottom:10 }}>
            {requiredSkills.map((skill, i) => (
              <div key={i} title={skill} className="seg-bar-item"
                style={{ background: !missingSkills.includes(skill) ? "#4a9e6a" : "#e8c07a" }} />
            ))}
          </div>

          <div style={{ display:"flex", gap:18 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#4a7a5a" }}>
              <div style={{ width:10, height:10, borderRadius:2, background:"#4a9e6a" }} />
              Matched ({matchedSkills.length})
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#7a5a20" }}>
              <div style={{ width:10, height:10, borderRadius:2, background:"#e8c07a" }} />
              Missing ({missingSkills.length})
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            SINGLE CENTERED BUTTON
        ══════════════════════════════════════ */}
        <div style={{ display:"flex", justifyContent:"center" }}>
          <button
            className="main-btn"
            onClick={() => navigate("/learning-path", { state: { result, jobRole } })}
          >
             Generate Learning Path
          </button>
        </div>

      </main>

      {/* ══════════════════════════════════════
          CONGRATULATIONS POPUP
      ══════════════════════════════════════ */}
      {showCongrats && (
        <div style={{
          position:"fixed", inset:0, zIndex:50,
          display:"flex", alignItems:"center", justifyContent:"center",
          background:"rgba(0,0,0,0.4)", backdropFilter:"blur(4px)",
        }}>
          <div style={{
            background:"#fff", borderRadius:20,
            padding:"40px 36px", maxWidth:400, width:"90%",
            textAlign:"center",
            boxShadow:"0 24px 60px rgba(0,0,0,0.14)",
            border:"1.5px solid #b8ddc4",
            animation:"scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            <div style={{ fontSize:44, marginBottom:12 }}>🎉</div>
            <h2 style={{ fontSize:21, fontWeight:800, color:"#1a4a2a", marginBottom:8 }}>
              Congratulations!
            </h2>
            <p style={{ fontSize:15, fontWeight:600, color:"#1a2a1a", marginBottom:8 }}>
              You are 100% Interview Ready!
            </p>
            <p style={{ fontSize:13, color:"#6a7a6a", lineHeight:1.75, marginBottom:28 }}>
              You have all the required skills for <strong>{jobRole}</strong>.
              Walk into your next interview with full confidence.
            </p>
            <div style={{ display:"flex", justifyContent:"center", gap:10 }}>
              <button onClick={() => setShowCongrats(false)} style={{
                padding:"10px 20px", borderRadius:10,
                background:"#f4f8f0", border:"1px solid #c4d8a8",
                color:"#4a6a3a", fontWeight:600, cursor:"pointer", fontSize:13,
              }}>Close</button>
              <button onClick={() => { setShowCongrats(false); navigate("/interview", { state:{ jobRole } }); }}
                style={{
                  padding:"10px 22px", borderRadius:10,
                  background:"#4a9e6a", color:"#fff",
                  fontWeight:700, cursor:"pointer", fontSize:13, border:"none",
                  boxShadow:"0 4px 14px rgba(74,158,106,0.3)",
                }}>
                🎤 Start Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;