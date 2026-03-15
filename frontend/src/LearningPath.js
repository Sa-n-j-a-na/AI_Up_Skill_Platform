import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Confetti from "react-confetti";

/* 🎉 SVG Congrats board */
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

const LearningPath = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { result, jobRole } = location.state || {};
  const { missingSkills = [], score: initialScore = 0 } = result || {};

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
        const generated = [];
        rm.forEach((item) => {
          generated.push({ label: `${item.skill} – Course`, completed: false });
          generated.push({ label: `${item.skill} – Mini Project`, completed: false });
        });
        setTasks(generated);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [missingSkills]);

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
    if (updatedScore === 100) {
      setShowCongrats(true);
      setRunConfetti(true);
      setTimeout(() => setFadeCongrats(true), 6000);
      setTimeout(() => setShowCongrats(false), 7500);
      setTimeout(() => setRunConfetti(false), 18000);
    }
  }, [updatedScore]);

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

        .page-title {
          color: #1a2a1a;
        }

        .score-num {
          color: #4a8fa8;
        }

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

          <div className="flex gap-3">
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
          <h3 className="text-lg font-bold mb-4 text-gray-800">📊 Progress Dashboard</h3>

          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Resume Score</p>
          <p className="text-4xl font-bold score-num mb-4">{updatedScore}%</p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-3 rounded-full mb-1 overflow-hidden">
            <div
              className="progress-bar h-3 rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mb-5">
            {completedCount} of {totalTasks} tasks completed
          </p>

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

          <h2 className="text-3xl font-extrabold mb-2 page-title">
            Your Personalized Learning Path
          </h2>
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

          {!loading && roadmap.map((item, idx) => (
            <div
              key={idx}
              className="roadmap-card bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-md mb-5"
              style={{ animationDelay: `${idx * 0.07}s` }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                <h3 className="text-xl font-bold text-gray-900">{item.skill}</h3>
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
                <p className="text-sm font-semibold text-gray-700 mb-1">🛠 Mini Project</p>
                <p className="text-sm text-gray-600 leading-relaxed">{item.mini_project}</p>
              </div>
            </div>
          ))}
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
    </div>
  );
};

export default LearningPath;