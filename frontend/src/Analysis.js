import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Analysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, jobRole } = location.state || {};

  const [showCongrats, setShowCongrats] = React.useState(false);
  const [animatedScore, setAnimatedScore] = React.useState(0);

  // ── Score card category animations ──
  const [animatedCategories, setAnimatedCategories] = React.useState({
    skillsMatch: 0,
    skillDepth: 0,
    completeness: 0,
    jobReadiness: 0,
  });

  // ✅ All hooks before early return
  React.useEffect(() => {
    if (!result) return;
    const { score } = result;
    if (score === 100) setShowCongrats(true);

    // Animate overall score ring
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

  // ── Animate score card category bars ──
  React.useEffect(() => {
    if (!result) return;
    const { score, resumeSkills } = result;

    // Compute category scores
    const skillsMatch   = score; // same as overall match %
    const skillDepth    = Math.min(100, Math.round((resumeSkills.length / 15) * 100)); // more skills = deeper
    const completeness  = resumeSkills.length >= 5
      ? Math.min(100, Math.round(60 + (resumeSkills.length / 20) * 40))
      : Math.round((resumeSkills.length / 5) * 60);
    const jobReadiness  = Math.round(
      (skillsMatch * 0.5) + (skillDepth * 0.25) + (completeness * 0.25)
    );

    const targets = { skillsMatch, skillDepth, completeness, jobReadiness };

    // Animate each bar
    let frame = 0;
    const totalFrames = 45;
    const interval = setInterval(() => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setAnimatedCategories({
        skillsMatch:  Math.round(targets.skillsMatch  * ease),
        skillDepth:   Math.round(targets.skillDepth   * ease),
        completeness: Math.round(targets.completeness * ease),
        jobReadiness: Math.round(targets.jobReadiness * ease),
      });
      if (frame >= totalFrames) clearInterval(interval);
    }, 22);

    return () => clearInterval(interval);
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
    return             { color: "#c46a6a", bg: "#fdf2f2", label: "Needs Work" };
  };
  const scoreInfo   = getScoreInfo(score);
  const matchedSkills = requiredSkills.filter((s) => !missingSkills.includes(s));

  // ── Score Card helpers ──
  const getCategoryColor = (val) => {
    if (val >= 80) return { bar: "#4a9e6a", text: "#2e7a4a", bg: "#f0faf4", badge: "Excellent" };
    if (val >= 60) return { bar: "#4a8fa8", text: "#2a5a7a", bg: "#f0f5fa", badge: "Good" };
    if (val >= 40) return { bar: "#c4882a", text: "#7a4e10", bg: "#fdf6ec", badge: "Fair" };
    return               { bar: "#c46a6a", text: "#7a2a2a", bg: "#fdf2f2", badge: "Low" };
  };

  const overallScoreCard = Math.round(
    (animatedCategories.skillsMatch  * 0.50) +
    (animatedCategories.skillDepth   * 0.20) +
    (animatedCategories.completeness * 0.15) +
    (animatedCategories.jobReadiness * 0.15)
  );

  const categories = [
    {
      key:   "skillsMatch",
      label: "Skills Match",
      icon:  "🎯",
      val:   animatedCategories.skillsMatch,
      desc:  "How well your skills match the job requirements",
    },
    {
      key:   "skillDepth",
      label: "Skill Depth",
      icon:  "📚",
      val:   animatedCategories.skillDepth,
      desc:  "Breadth and volume of skills detected in your resume",
    },
    {
      key:   "completeness",
      label: "Profile Completeness",
      icon:  "📋",
      val:   animatedCategories.completeness,
      desc:  "How complete your skill profile appears to recruiters",
    },
    {
      key:   "jobReadiness",
      label: "Job Readiness",
      icon:  "🚀",
      val:   animatedCategories.jobReadiness,
      desc:  "Overall readiness score combining all categories",
    },
  ];

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
        @keyframes scoreCardIn {
          from { opacity:0; transform:translateY(20px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes bigRingDraw {
          from { stroke-dashoffset: 408; }
          to   { stroke-dashoffset: var(--big-ring-end); }
        }
        @keyframes shimmerBadge {
          0%   { background-position: -200px 0; }
          100% { background-position:  200px 0; }
        }

        .orb-a { animation: floatA 8s ease-in-out infinite; }
        .orb-b { animation: floatB 10s ease-in-out 2s infinite; }

        .fade-up  { animation: fadeUp  0.65s cubic-bezier(0.16,1,0.3,1) both; }
        .card-1   { animation: scaleIn 0.55s cubic-bezier(0.16,1,0.3,1) 0.08s both; }
        .card-2   { animation: scaleIn 0.55s cubic-bezier(0.16,1,0.3,1) 0.18s both; }
        .card-3   { animation: scaleIn 0.55s cubic-bezier(0.16,1,0.3,1) 0.28s both; }
        .card-4   { animation: scaleIn 0.55s cubic-bezier(0.16,1,0.3,1) 0.38s both; }
        .card-5   { animation: scaleIn 0.55s cubic-bezier(0.16,1,0.3,1) 0.48s both; }

        /* Score Card gets its own staggered animation */
        .card-scorecard { animation: scoreCardIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.55s both; }

        .score-ring { animation: ringDraw 1.1s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
        .big-score-ring { animation: bigRingDraw 1.4s cubic-bezier(0.16,1,0.3,1) 0.6s both; }
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

        /* ── Score Card specific ── */
        .sc-category-bar {
          height: 8px;
          border-radius: 99px;
          background: #edeee9;
          overflow: hidden;
          flex: 1;
        }
        .sc-category-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.05s linear;
        }
        .sc-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 99px;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }
        .sc-grade-ring {
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.10));
        }
        .sc-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e4eae0, transparent);
          margin: 18px 0;
        }
      `}</style>

      {/* ── Very subtle orbs ── */}
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

        {/* ══════════ HEADER ══════════ */}
        <div className="fade-up s-card" style={{
          padding:"24px 28px", marginBottom:24,
          display:"flex", alignItems:"center",
          justifyContent:"space-between", flexWrap:"wrap", gap:16,
          borderLeft:"4px solid #B7C7A1",
        }}>
          <div>
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

        {/* ══════════ SCORE BANNER ══════════ */}
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

        {/* ══════════ THREE SKILL CARDS ══════════ */}
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

        {/* ══════════ MATCH BREAKDOWN ══════════ */}
        <div className="card-5 s-card" style={{ padding:24, marginBottom:20 }}>
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

        {/* ══════════════════════════════════════════════════════
            ✨ AI RESUME SCORE CARD  — NEW SECTION
        ══════════════════════════════════════════════════════ */}
        <div className="card-scorecard s-card" style={{
          padding: "28px 32px",
          marginBottom: 28,
          background: "linear-gradient(135deg, #fafcf8 0%, #f5f8ff 50%, #faf8ff 100%)",
          borderTop: "3px solid #7c9fd4",
          position: "relative",
          overflow: "hidden",
        }}>

          {/* Subtle background orb */}
          <div style={{
            position:"absolute", top:-60, right:-60,
            width:220, height:220, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(124,159,212,0.08), transparent 70%)",
            pointerEvents:"none",
          }} />

          {/* Section header */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <div className="icon-box" style={{ background:"#eef3ff", border:"1px solid #b0c4f0", fontSize:18 }}>
              🏆
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:800, color:"#1a2a3a" }}>AI Resume Score Card</div>
              <div style={{ fontSize:11, color:"#8a9aaa" }}>Comprehensive profile evaluation across 4 dimensions</div>
            </div>
            {/* Overall score badge */}
            <div style={{ marginLeft:"auto", textAlign:"center" }}>
              <div style={{
                background: getCategoryColor(overallScoreCard).bg,
                border: `1.5px solid ${getCategoryColor(overallScoreCard).bar}55`,
                borderRadius: 12, padding: "6px 16px",
              }}>
                <div style={{ fontSize:22, fontWeight:900, color: getCategoryColor(overallScoreCard).bar, lineHeight:1 }}>
                  {overallScoreCard}
                </div>
                <div style={{ fontSize:9, color:"#9aaa8a", fontWeight:700, letterSpacing:"0.06em", marginTop:2 }}>
                  OVERALL
                </div>
              </div>
            </div>
          </div>

          <div className="sc-divider" />

          {/* Main layout: big ring + categories */}
          <div style={{ display:"flex", gap:32, alignItems:"center", flexWrap:"wrap" }}>

            {/* ── Big Score Ring ── */}
            <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
              <div style={{ position:"relative", width:130, height:130 }} className="sc-grade-ring">
                <svg width="130" height="130" viewBox="0 0 130 130">
                  {/* Track */}
                  <circle cx="65" cy="65" r="54"
                    fill="none" stroke="#edeee9" strokeWidth="10" />
                  {/* Fill */}
                  <circle
                    className="big-score-ring"
                    cx="65" cy="65" r="54"
                    fill="none"
                    stroke={getCategoryColor(overallScoreCard).bar}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray="339"
                    strokeDashoffset={339 - (339 * overallScoreCard) / 100}
                    transform="rotate(-90 65 65)"
                    style={{ "--big-ring-end": 339 - (339 * overallScoreCard) / 100 }}
                  />
                  {/* Tick marks */}
                  {[0,25,50,75].map((pct, i) => {
                    const angle = (pct / 100) * 360 - 90;
                    const rad   = (angle * Math.PI) / 180;
                    const x1 = 65 + 48 * Math.cos(rad);
                    const y1 = 65 + 48 * Math.sin(rad);
                    const x2 = 65 + 56 * Math.cos(rad);
                    const y2 = 65 + 56 * Math.sin(rad);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#dde3d8" strokeWidth="1.5" />;
                  })}
                </svg>
                <div style={{
                  position:"absolute", inset:0,
                  display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center",
                }}>
                  <span style={{
                    fontSize:30, fontWeight:900, lineHeight:1,
                    color: getCategoryColor(overallScoreCard).bar,
                  }}>
                    {overallScoreCard}
                  </span>
                  <span style={{ fontSize:10, color:"#aaa", fontWeight:700, letterSpacing:"0.06em", marginTop:2 }}>
                    / 100
                  </span>
                </div>
              </div>

              {/* Grade label */}
              <span className="sc-badge" style={{
                background: getCategoryColor(overallScoreCard).bg,
                color: getCategoryColor(overallScoreCard).text,
                border: `1px solid ${getCategoryColor(overallScoreCard).bar}44`,
                fontSize:11,
              }}>
                {getCategoryColor(overallScoreCard).badge} Profile
              </span>
            </div>

            {/* ── Category Bars ── */}
            <div style={{ flex:1, minWidth:220, display:"flex", flexDirection:"column", gap:16 }}>
              {categories.map((cat) => {
                const ci = getCategoryColor(cat.val);
                return (
                  <div key={cat.key}>
                    {/* Label row */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <span style={{ fontSize:14 }}>{cat.icon}</span>
                        <div>
                          <span style={{ fontSize:13, fontWeight:700, color:"#1a2a1a" }}>{cat.label}</span>
                          <span style={{ fontSize:10, color:"#9aaa8a", marginLeft:6 }}>{cat.desc}</span>
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:7, flexShrink:0 }}>
                        <span className="sc-badge" style={{
                          background: ci.bg,
                          color: ci.text,
                          border: `1px solid ${ci.bar}44`,
                        }}>
                          {ci.badge}
                        </span>
                        <span style={{ fontSize:13, fontWeight:800, color: ci.bar, minWidth:32, textAlign:"right" }}>
                          {cat.val}%
                        </span>
                      </div>
                    </div>

                    {/* Bar */}
                    <div className="sc-category-bar">
                      <div
                        className="sc-category-fill"
                        style={{
                          width: `${cat.val}%`,
                          background: `linear-gradient(90deg, ${ci.bar}aa, ${ci.bar})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sc-divider" />

          {/* Bottom insight strip */}
          <div style={{
            background: "rgba(255,255,255,0.7)",
            borderRadius: 12,
            padding: "12px 16px",
            border: "1px solid #e8eef8",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ fontSize:18 }}>
              {overallScoreCard >= 80 ? "🌟" : overallScoreCard >= 60 ? "💡" : overallScoreCard >= 40 ? "📈" : "🎯"}
            </span>
            <p style={{ fontSize:13, color:"#4a5a6a", lineHeight:1.6, margin:0 }}>
              {overallScoreCard >= 80
                ? `Outstanding profile! Your resume is highly competitive for ${jobRole}. Focus on the missing skills to reach 100%.`
                : overallScoreCard >= 60
                ? `Good foundation for ${jobRole}. Strengthening your missing skills and adding more projects will push your score higher.`
                : overallScoreCard >= 40
                ? `Your profile has potential for ${jobRole}. Follow the learning path to close skill gaps and boost your score significantly.`
                : `Your profile needs focused development for ${jobRole}. Start with the recommended learning path to build a strong foundation.`
              }
            </p>
          </div>
        </div>
        {/* ══════════ END AI RESUME SCORE CARD ══════════ */}

        {/* ══════════ GENERATE LEARNING PATH BUTTON ══════════ */}
        <div style={{ display:"flex", justifyContent:"center" }}>
          <button
            className="main-btn"
            onClick={() => navigate("/learning-path", { state: { result, jobRole } })}
          >
             Generate Learning Path
          </button>
        </div>

      </main>

      {/* ══════════ CONGRATULATIONS POPUP ══════════ */}
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