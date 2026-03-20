import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Confetti from "react-confetti";

// ─────────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────────
const STORAGE_KEY = (jobRole) => `skillup_tasks_${(jobRole || "default").replace(/\s+/g, "_").toLowerCase()}`;

function loadTasks(jobRole) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(jobRole));
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveTasks(jobRole, tasks) {
  try {
    localStorage.setItem(STORAGE_KEY(jobRole), JSON.stringify(tasks));
  } catch {}
}

// ─────────────────────────────────────────────
// PDF Export helper (pure JS, no extra deps)
// ─────────────────────────────────────────────
function exportLearningPathPDF({ jobRole, roadmap, tasks, score }) {
  const completedCount = tasks.filter((t) => t.completed).length;

  // Build HTML string for the printable page
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>SkillUp — Learning Path — ${jobRole}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #f8faf6;
      color: #1a2a1a;
      padding: 40px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #B7C7A1;
      padding-bottom: 18px;
      margin-bottom: 28px;
    }
    .logo { display:flex; align-items:center; gap:10px; }
    .logo-gem {
      width: 28px; height: 28px;
    }
    .logo h1 { font-size:22px; font-weight:800; color:#1a2a1a; }
    .badge {
      background: #f0f7ec;
      border: 1.5px solid #B7C7A1;
      border-radius: 99px;
      padding: 4px 14px;
      font-size: 12px;
      font-weight: 700;
      color: #4a6a32;
    }
    .meta {
      display: flex;
      gap: 16px;
      margin-bottom: 28px;
      flex-wrap: wrap;
    }
    .meta-card {
      background: white;
      border: 1px solid #e4eae0;
      border-radius: 12px;
      padding: 10px 18px;
      font-size: 13px;
    }
    .meta-card span { font-weight:700; color:#4a8fa8; font-size:18px; display:block; }
    .meta-card label { color:#9aaa8a; font-size:11px; }
    .skill-block {
      background: white;
      border: 1px solid #e4eae0;
      border-radius: 14px;
      padding: 20px 24px;
      margin-bottom: 18px;
      page-break-inside: avoid;
    }
    .skill-title {
      font-size: 16px;
      font-weight: 800;
      color: #1a2a1a;
      margin-bottom: 6px;
    }
    .time-badge {
      display: inline-block;
      background: #f0f7ec;
      border: 1px solid #c4d8a8;
      border-radius: 99px;
      padding: 2px 10px;
      font-size: 11px;
      font-weight: 600;
      color: #4a6a32;
      margin-bottom: 12px;
    }
    .section-label {
      font-size: 12px;
      font-weight: 700;
      color: #6a7a6a;
      margin-bottom: 6px;
      margin-top: 12px;
    }
    .course-item {
      font-size: 13px;
      color: #3a6abf;
      margin-bottom: 4px;
      padding-left: 12px;
    }
    .project-box {
      background: linear-gradient(135deg,#f0f7ec,#e8f4fd);
      border: 1px solid #d4e8d0;
      border-radius: 10px;
      padding: 12px 14px;
      font-size: 13px;
      color: #2a4a2a;
      margin-top: 10px;
    }
    .task-section {
      margin-top: 32px;
      page-break-before: auto;
    }
    .task-section h2 {
      font-size: 16px;
      font-weight: 800;
      margin-bottom: 12px;
      color: #1a2a1a;
    }
    .task-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border: 1px solid #e4eae0;
      border-radius: 10px;
      margin-bottom: 6px;
      font-size: 13px;
    }
    .task-row.done { color: #9aaa8a; text-decoration: line-through; background:#f8faf6; }
    .task-row.done .chk { background:#8D9977; border-color:#8D9977; }
    .chk {
      width: 16px; height: 16px; border-radius: 4px;
      border: 2px solid #c0c8b8;
      display: inline-flex; align-items:center; justify-content:center;
      flex-shrink:0;
    }
    .footer {
      margin-top: 36px;
      border-top: 1px solid #e4eae0;
      padding-top: 14px;
      font-size: 11px;
      color: #9aaa8a;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { background: white; padding: 24px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <svg class="logo-gem" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#9ac5f4"/>
            <stop offset="50%" stop-color="#d6c8f7"/>
            <stop offset="100%" stop-color="#cfe8d5"/>
          </linearGradient>
        </defs>
        <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" fill="url(#g)"/>
      </svg>
      <h1>SkillUp</h1>
    </div>
    <span class="badge">🎯 ${jobRole}</span>
  </div>

  <div class="meta">
    <div class="meta-card"><span>${score}%</span><label>Resume Match Score</label></div>
    <div class="meta-card"><span>${roadmap.length}</span><label>Skills to Learn</label></div>
    <div class="meta-card"><span>${completedCount}/${tasks.length}</span><label>Tasks Completed</label></div>
    <div class="meta-card"><span>${new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</span><label>Generated On</label></div>
  </div>

  ${roadmap.map((item) => `
  <div class="skill-block">
    <div class="skill-title">${item.skill}</div>
    <span class="time-badge">⏱ ${item.estimated_time}</span>
    <div class="section-label">📚 Recommended Courses</div>
    ${item.recommended_courses.map((c) => `
      <div class="course-item">▸ ${c.title} — <span style="color:#777">${c.url}</span></div>
    `).join("")}
    <div class="project-box">
      <div class="section-label" style="margin-top:0;margin-bottom:4px">Mini Project</div>
      ${item.mini_project}
    </div>
  </div>
  `).join("")}

  <div class="task-section">
    <h2>✅ Progress Checklist</h2>
    ${tasks.map((t) => `
    <div class="task-row ${t.completed ? "done" : ""}">
      <div class="chk">${t.completed ? `<svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ""}</div>
      ${t.label}
    </div>
    `).join("")}
  </div>

  <div class="footer">
    <span>SkillUp — AI Career Preparation Platform</span>
    <span>Generated ${new Date().toLocaleString("en-IN")}</span>
  </div>
</body>
</html>`;

  const printWin = window.open("", "_blank", "width=900,height=700");
  printWin.document.write(html);
  printWin.document.close();
  printWin.focus();
  setTimeout(() => {
    printWin.print();
  }, 600);
}

// ─────────────────────────────────────────────
// CongratsBoard (unchanged)
// ─────────────────────────────────────────────
const CongratsBoard = ({ fading, onStartInterview }) => {
  return (
    <div
      className={`fixed top-6 left-6 z-[9999] transition-opacity duration-1000 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex gap-4 bg-white rounded-xl shadow-2xl border border-green-400 px-6 py-4 max-w-md">
        <svg viewBox="0 0 100 100" className="w-16 h-16 shrink-0">
          <rect x="47" y="10" width="6" height="15" rx="2" fill="#78909C" />
          <circle cx="50" cy="10" r="4" fill="#FF5252" />
          <rect x="25" y="25" width="50" height="50" rx="10" fill="#B0BEC5" />
          <rect x="35" y="35" width="30" height="20" rx="5" fill="#546E7A" />
          <circle cx="43" cy="45" r="4" fill="#81D4FA" />
          <circle cx="57" cy="45" r="4" fill="#81D4FA" />
          <rect x="42" y="60" width="16" height="4" rx="2" fill="#FF5252" />
          <rect x="15" y="35" width="10" height="30" rx="5" fill="#78909C" />
          <rect x="75" y="35" width="10" height="30" rx="5" fill="#78909C" />
          <rect x="35" y="75" width="10" height="15" rx="3" fill="#78909C" />
          <rect x="55" y="75" width="10" height="15" rx="3" fill="#78909C" />
        </svg>
        <div>
          <h2 className="text-lg font-bold text-green-600 mb-1">🎉 Congratulations!</h2>
          <p className="font-semibold mb-1">You are 100% Interview Ready!</p>
          <p className="text-sm text-gray-600 mb-3">
            You have completed all recommended courses and mini-projects.
          </p>
          <button
            onClick={onStartInterview}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
          >
            🎤 Start Interview
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const LearningPath = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { result, jobRole } = location.state || {};
  const { missingSkills = [], score: initialScore = 0 } = result || {};

  // ── NEW: support single-skill deep-link from Analysis page ──
  const focusSkill = location.state?.focusSkill || null;

  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [showCongrats, setShowCongrats] = useState(false);
  const [fadeCongrats, setFadeCongrats] = useState(false);
  const [runConfetti, setRunConfetti] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showHelper, setShowHelper] = useState(false);
  const [helperMessages, setHelperMessages] = useState([]);
  const [helperInput, setHelperInput] = useState("");
  const [helperLoading, setHelperLoading] = useState(false);

  // ── NEW: PDF export loading state ──
  const [pdfLoading, setPdfLoading] = useState(false);

  // ── NEW: toast notification ──
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);

  // ── Guard: confetti fires ONCE — persisted in sessionStorage per role ──
  const congratsKey = React.useMemo(
    () => `skillup_congrats_fired_${(jobRole || "default").replace(/\s+/g, "_").toLowerCase()}`,
    [jobRole]
  );
  const congratsFiredRef = useRef(
    sessionStorage.getItem(congratsKey) === "true"
  );

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3000);
  };

  // ─────────────────────────────────────────────
  // Fetch roadmap — then restore or build tasks
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetch("http://localhost:5000/learning-path", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ missingSkills }),
    })
      .then((res) => res.json())
      .then((data) => {
        const rm = data.roadmap || [];
        setRoadmap(rm);

        // ── NEW: try to restore saved tasks ──
        const saved = loadTasks(jobRole);
        if (saved && saved.length > 0) {
          // merge saved completion state onto freshly built labels
          const freshLabels = [];
          rm.forEach((item) => {
            freshLabels.push(`${item.skill} – Course`);
            freshLabels.push(`${item.skill} – Mini Project`);
          });
          const merged = freshLabels.map((label) => {
            const found = saved.find((s) => s.label === label);
            return { label, completed: found ? found.completed : false };
          });
          setTasks(merged);
        } else {
          const generated = [];
          rm.forEach((item) => {
            generated.push({ label: `${item.skill} – Course`, completed: false });
            generated.push({ label: `${item.skill} – Mini Project`, completed: false });
          });
          setTasks(generated);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [missingSkills, jobRole]);

  // ─────────────────────────────────────────────
  // NEW: persist tasks to localStorage on every change
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (tasks.length > 0) {
      saveTasks(jobRole, tasks);
    }
  }, [tasks, jobRole]);

  // ─────────────────────────────────────────────
  // NEW: scroll to focused skill card if deep-linked
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (focusSkill && !loading) {
      setTimeout(() => {
        const el = document.getElementById(`skill-card-${focusSkill.replace(/\s+/g, "-").toLowerCase()}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
    }
  }, [focusSkill, loading]);

  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  const sendHelperMessage = async () => {
    if (!helperInput.trim()) return;
    const updated = [...helperMessages, { role: "user", content: helperInput }];
    setHelperMessages(updated);
    setHelperInput("");
    setHelperLoading(true);
    try {
      const res = await fetch("http://localhost:5000/study-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobRole: "Study Assistant", messages: updated }),
      });
      const data = await res.json();
      if (data.reply) {
        setHelperMessages([...updated, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setHelperMessages([...updated, { role: "assistant", content: "⚠️ AI unavailable." }]);
    } finally {
      setHelperLoading(false);
    }
  };

  // ── NEW: PDF export handler ──
  const handleExportPDF = () => {
    setPdfLoading(true);
    setTimeout(() => {
      exportLearningPathPDF({ jobRole, roadmap, tasks, score: updatedScore });
      setPdfLoading(false);
      showToast("PDF opened in new tab — use Print → Save as PDF", "success");
    }, 200);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;

  const progressPercent =
    totalTasks === 0
      ? initialScore
      : Math.min(
          100,
          Math.round(initialScore + (completedCount / totalTasks) * (100 - initialScore))
        );

  const updatedScore = progressPercent;

  useEffect(() => {
    if (updatedScore === 100 && !congratsFiredRef.current) {
      congratsFiredRef.current = true;
      sessionStorage.setItem(congratsKey, "true");
      setShowCongrats(true);
      setRunConfetti(true);
      setTimeout(() => setFadeCongrats(true), 6000);
      setTimeout(() => setShowCongrats(false), 7500);
      setTimeout(() => setRunConfetti(false), 18000);
    }
  }, [updatedScore, congratsKey]);

  const status = (() => {
    if (updatedScore >= 100) return { title: "🎉 Congratulations!", message: "You are 100% interview ready!", badge: "🏆 Fully Interview Ready" };
    if (updatedScore >= 85)  return { title: "🔥 Almost There!", message: "You are interview ready.", badge: "✅ Interview Ready" };
    if (updatedScore >= 70)  return { title: "💪 Great Progress!", message: "You are in interview preparation stage.", badge: "🎯 Interview Prep Stage" };
    if (updatedScore >= 50)  return { title: "📘 Skill Building Phase", message: "Continue learning missing skills.", badge: "🧠 Skill Building" };
    if (updatedScore >= 30)  return { title: "🚀 Getting Started", message: "Foundation started.", badge: "📚 Foundation Stage" };
    return { title: "🧩 Learning Mode", message: "Start your learning journey.", badge: "🌱 Beginner Stage" };
  })();

  return (
    <div className="h-screen flex flex-col bg-[#f5f7f6] text-gray-800 relative overflow-hidden">

      <style>{`
        @keyframes floatA {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-16px); }
        }
        @keyframes floatB {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes cardIn {
          from { opacity:0; transform:translateY(20px) scale(0.98); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes pulse-ai {
          0%,100% { box-shadow: 0 0 0 0 rgba(214,200,247,0.6); }
          50%      { box-shadow: 0 0 0 10px rgba(214,200,247,0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes toastIn {
          from { opacity:0; transform:translateY(12px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity:1; transform:translateY(0) scale(1); }
          to   { opacity:0; transform:translateY(8px) scale(0.96); }
        }

        .orb-a { animation: floatA 7s ease-in-out infinite; }
        .orb-b { animation: floatB 9s ease-in-out 1.5s infinite; }

        .roadmap-card {
          animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .roadmap-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.10) !important;
        }
        .roadmap-card.focused-skill {
          border-color: #4a8fa8 !important;
          box-shadow: 0 0 0 3px rgba(74,143,168,0.18), 0 16px 40px rgba(0,0,0,0.10) !important;
        }

        .task-row {
          transition: background 0.18s ease, transform 0.18s ease;
        }
        .task-row:hover {
          background: #e8f0e3 !important;
          transform: translateX(3px);
        }

        .ai-btn {
          animation: pulse-ai 2.5s ease-in-out infinite;
          transition: transform 0.2s ease;
        }
        .ai-btn:hover {
          transform: scale(1.12);
          animation: none;
          box-shadow: 0 8px 24px rgba(214,200,247,0.55);
        }

        .nav-btn {
          transition: background 0.2s ease, transform 0.18s ease;
        }
        .nav-btn:hover {
          transform: translateY(-1px);
        }

        .page-title { color: #1a2a1a; }
        .score-num  { color: #4a8fa8; }

        .progress-bar {
          background: linear-gradient(90deg, #8D9977, #9ac5f4, #d6c8f7);
        }

        .course-link {
          transition: color 0.2s ease, padding-left 0.2s ease;
        }
        .course-link:hover {
          color: #3a7abf !important;
          padding-left: 4px;
        }

        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #d0d8c8; border-radius: 99px; }

        .content-scroll::-webkit-scrollbar { width: 5px; }
        .content-scroll::-webkit-scrollbar-track { background: transparent; }
        .content-scroll::-webkit-scrollbar-thumb { background: #d0d8c8; border-radius: 99px; }

        /* ── NEW: PDF export button ── */
        .pdf-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 8px 18px; border-radius: 10px; border: 1.5px solid #c4d8a8;
          background: rgba(255,255,255,0.85); color: #4a6a3a;
          font-weight: 700; font-size: 13px; cursor: pointer;
          transition: all 0.2s ease;
        }
        .pdf-btn:hover:not(:disabled) {
          background: #f0f7ec; border-color: #8D9977;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(141,153,119,0.25);
        }
        .pdf-btn:disabled { opacity:0.65; cursor:not-allowed; }

        /* ── NEW: Reset progress button ── */
        .reset-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 8px; border: 1px solid #e4d8c8;
          background: transparent; color: #aa7a5a;
          font-size: 11px; font-weight: 600; cursor: pointer;
          transition: all 0.18s ease;
        }
        .reset-btn:hover {
          background: #fdf6ec; border-color: #c4882a; color: #c4882a;
        }

        /* ── NEW: Toast ── */
        .skillup-toast {
          position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
          z-index: 99999;
          background: rgba(255,255,255,0.97);
          border: 1px solid #B7C7A1;
          border-radius: 12px;
          padding: 11px 22px;
          font-size: 13px; font-weight: 600; color: #2a4a2a;
          box-shadow: 0 8px 28px rgba(0,0,0,0.12);
          animation: toastIn 0.3s cubic-bezier(0.16,1,0.3,1) both;
          white-space: nowrap;
          pointer-events: none;
        }

        /* ── NEW: saved indicator dot ── */
        @keyframes savedPulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.4; }
        }
        .saved-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #8D9977;
          display: inline-block;
          animation: savedPulse 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* ── Background orbs ── */}
      <div className="orb-a absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-[#d6c8f7] rounded-full opacity-40 blur-3xl z-0 pointer-events-none" />
      <div className="orb-b absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-[#cfe8d5] rounded-full opacity-40 blur-3xl z-0 pointer-events-none" />

      {/* ── HEADER ── */}
      <header
        className="relative z-10 shadow-sm"
        style={{
          background: "rgba(229,231,235,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 text-2xl hover:text-gray-900 transition"
            >
              ☰
            </button>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
                <defs>
                  <linearGradient id="gemGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#9ac5f4" />
                    <stop offset="50%" stopColor="#d6c8f7" />
                    <stop offset="100%" stopColor="#cfe8d5" />
                  </linearGradient>
                </defs>
                <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" fill="url(#gemGrad)" />
              </svg>
              <h2 className="text-xl font-bold text-gray-800">SkillUp</h2>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={() => navigate(`/hiring-calendar?role=${jobRole}`)}
              className="nav-btn px-4 py-2 bg-[#8D9977] text-white rounded-lg text-sm font-semibold shadow-sm"
            >
              Find Jobs
            </button>
            <button
              onClick={() => navigate("/interview-simulation", { state: { jobRole } })}
              className="nav-btn px-4 py-2 bg-[#8D9977] text-white rounded-lg text-sm font-semibold shadow-sm"
            >
              Interview Simulation
            </button>
          </div>
        </div>
      </header>

      {/* ── Confetti ── */}
      {runConfetti && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={500} gravity={0.3} recycle={false} />
        </div>
      )}

      {showCongrats && (
        <CongratsBoard fading={fadeCongrats} onStartInterview={() => navigate("/interview-simulation", { state: { jobRole } })} />
      )}

      {/* ── MAIN ── */}
      <div className="flex flex-1 overflow-hidden relative z-20">

        {/* ── SIDEBAR ── */}
        <div
          className={`bg-white/80 backdrop-blur-md border-r border-gray-200 transition-all duration-300 h-full shrink-0 sidebar-scroll ${
            sidebarOpen ? "w-[360px] p-6 overflow-y-auto" : "w-0 p-0 overflow-hidden border-r-0"
          }`}
        >
          {/* ── NEW: auto-save indicator ── */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">📊 Progress Dashboard</h3>
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, color:"#9aaa8a", fontWeight:600 }}>
              <span className="saved-dot" />
              Auto-saved
            </div>
          </div>

          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Resume Score</p>
          <p className="text-4xl font-bold score-num mb-4">{updatedScore}%</p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-3 rounded-full mb-1 overflow-hidden">
            <div
              className="progress-bar h-3 rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mb-2">
            {completedCount} of {totalTasks} tasks completed
          </p>

          {/* ── NEW: reset progress button ── */}
          <button
            className="reset-btn mb-4"
            onClick={() => {
              const reset = tasks.map((t) => ({ ...t, completed: false }));
              setTasks(reset);
              // Clear the congrats flag so they can earn it again
              congratsFiredRef.current = false;
              sessionStorage.removeItem(congratsKey);
              showToast("Progress reset", "info");
            }}
          >
            ↺ Reset Progress
          </button>

          {/* Status card */}
          <div
            className="mt-2 p-4 rounded-xl border shadow-sm mb-5"
            style={{
              background: "linear-gradient(135deg, #f0f7ec, #e8f4fd)",
              borderColor: "#c8ddc0",
            }}
          >
            <p className="font-bold text-gray-800">{status.title}</p>
            <p className="text-sm text-gray-600 mt-1">{status.message}</p>
            <span
              className="inline-block text-xs mt-2 font-semibold px-3 py-1 rounded-full"
              style={{ background: "rgba(183,199,161,0.3)", color: "#4a6a3a", border: "1px solid #B7C7A1" }}
            >
              {status.badge}
            </span>
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            {tasks.map((task, idx) => (
              <div
                key={idx}
                onClick={() => toggleTask(idx)}
                className="task-row flex items-center gap-3 bg-gray-50 border border-gray-100 p-3 rounded-xl cursor-pointer"
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  border: `2px solid ${task.completed ? "#8D9977" : "#c0c8b8"}`,
                  background: task.completed ? "#8D9977" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}>
                  {task.completed && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <p className={`text-sm ${task.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                  {task.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="flex-1 px-10 py-8 overflow-y-auto content-scroll transition-all duration-300">

          <div className="flex items-start justify-between mb-2 flex-wrap gap-3">
            <h2 className="text-3xl font-extrabold page-title">
              Your Personalized Learning Path
            </h2>
            {/* ── NEW: inline export button (also shows on main content) ── */}
            <button
              onClick={handleExportPDF}
              disabled={pdfLoading || loading || roadmap.length === 0}
              className="pdf-btn"
              style={{ marginTop:4 }}
            >
              {pdfLoading ? "Generating..." : "Export as PDF"}
            </button>
          </div>

          {jobRole && (
            <p className="text-sm text-gray-400 mb-7 font-medium">
              Tailored for{" "}
              <span style={{
                background: "#f0f7ec", border: "1px solid #B7C7A1",
                borderRadius: 99, padding: "2px 10px",
                fontSize: 12, fontWeight: 600, color: "#4a6a32",
              }}>
                🎯 {jobRole}
              </span>
              {/* ── NEW: show focus indicator if deep-linked from Analysis ── */}
              {focusSkill && (
                <span style={{
                  marginLeft: 8, background: "#f0f5ff", border: "1px solid #a8c0f0",
                  borderRadius: 99, padding: "2px 10px",
                  fontSize: 12, fontWeight: 600, color: "#2a4a8a",
                }}>
                  🔍 Focused: {focusSkill}
                </span>
              )}
            </p>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-gray-400 mt-16 justify-center">
              <svg style={{ animation: "spin 0.9s linear infinite" }} width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#d0d8c8" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#8D9977" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <span className="text-sm font-medium">Building your learning path...</span>
            </div>
          )}

          {!loading && roadmap.map((item, idx) => {
            const isFocused = focusSkill && focusSkill.toLowerCase() === item.skill.toLowerCase();
            return (
              <div
                key={idx}
                id={`skill-card-${item.skill.replace(/\s+/g, "-").toLowerCase()}`}
                className={`roadmap-card bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-md mb-5 ${isFocused ? "focused-skill" : ""}`}
                style={{ animationDelay: `${idx * 0.07}s` }}
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">{item.skill}</h3>
                    {isFocused && (
                      <span style={{ fontSize:10, fontWeight:700, color:"#2a4a8a", background:"#f0f5ff", border:"1px solid #a8c0f0", borderRadius:99, padding:"2px 8px" }}>
                        📍 From Analysis
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "#5a7a4a",
                    background: "#f0f7ec", border: "1px solid #c4d8a8",
                    borderRadius: 99, padding: "3px 10px",
                  }}>
                    ⏱ {item.estimated_time}
                  </span>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#e8eee4,transparent)", margin: "12px 0" }} />

                {/* Courses */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">📚 Recommended Courses</p>
                  <ul className="space-y-1 ml-1">
                    {item.recommended_courses.map((course, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span style={{ color: "#8D9977", marginTop: 2, fontSize: 12 }}>▸</span>
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="course-link text-sm text-blue-600 underline-offset-2 hover:text-blue-800"
                        >
                          {course.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mini project */}
                <div
                  className="rounded-xl p-4"
                  style={{ background: "linear-gradient(135deg,#f0f7ec,#e8f4fd)", border: "1px solid #d4e8d0" }}
                >
                  <p className="text-sm font-semibold text-gray-700 mb-1">Mini Project</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.mini_project}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Floating AI Button ── */}
      <button
        onClick={() => setShowHelper(!showHelper)}
        className="ai-btn fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center"
        style={{ boxShadow: "0 8px 28px rgba(214,200,247,0.5)" }}
      >
        <svg viewBox="0 0 100 100" className="w-10 h-10">
          <rect x="47" y="10" width="6" height="15" rx="2" fill="#78909C" />
          <circle cx="50" cy="10" r="4" fill="#FF5252" />
          <rect x="25" y="25" width="50" height="50" rx="10" fill="#B0BEC5" />
          <rect x="35" y="35" width="30" height="20" rx="5" fill="#546E7A" />
          <circle cx="43" cy="45" r="4" fill="#81D4FA" />
          <circle cx="57" cy="45" r="4" fill="#81D4FA" />
          <rect x="42" y="60" width="16" height="4" rx="2" fill="#FF5252" />
          <rect x="15" y="35" width="10" height="30" rx="5" fill="#78909C" />
          <rect x="75" y="35" width="10" height="30" rx="5" fill="#78909C" />
          <rect x="35" y="75" width="10" height="15" rx="3" fill="#78909C" />
          <rect x="55" y="75" width="10" height="15" rx="3" fill="#78909C" />
        </svg>
      </button>

      {/* ── Doubt Assistant Chat ── */}
      {showHelper && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl p-4 flex flex-col"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(214,200,247,0.5)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(214,200,247,0.3)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#8D9977",
              boxShadow: "0 0 6px #8D9977",
            }} />
            <h3 className="text-sm font-semibold text-gray-800">Doubt Assistant</h3>
          </div>

          <div className="flex-1 overflow-y-auto text-sm space-y-2 mb-3 max-h-60 sidebar-scroll">
            {helperMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl text-sm ${
                  msg.role === "assistant"
                    ? "bg-purple-50 text-purple-800 border border-purple-100"
                    : "bg-pink-50 text-pink-800 text-right border border-pink-100"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {helperLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-xs p-2">
                <svg style={{ animation: "spin 0.9s linear infinite" }} width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#d0d0d0" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#8D9977" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Thinking...
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={helperInput}
              onChange={(e) => setHelperInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendHelperMessage()}
              placeholder="Ask your doubt..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 bg-gray-50"
            />
            <button
              onClick={sendHelperMessage}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-gray-800 transition hover:opacity-80"
              style={{ background: "linear-gradient(135deg,#d6c8f7,#cfe8d5)", border: "1px solid rgba(214,200,247,0.5)" }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* ── NEW: Toast notification ── */}
      {toast && (
        <div className="skillup-toast">
          {toast.type === "success" ? "✅" : "ℹ️"} {toast.msg}
        </div>
      )}
    </div>
  );
};

export default LearningPath;