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
          <h2 className="text-lg font-bold text-green-600 mb-1">
            🎉 Congratulations!
          </h2>
          <p className="font-semibold mb-1">
            You are 100% Interview Ready!
          </p>
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
    if (updatedScore >= 100)
      return {
        title: "🎉 Congratulations!",
        message: "You are 100% interview ready!",
        badge: "🏆 Fully Interview Ready",
      };
    if (updatedScore >= 85)
      return {
        title: "🔥 Almost There!",
        message: "You are interview ready.",
        badge: "✅ Interview Ready",
      };
    if (updatedScore >= 70)
      return {
        title: "💪 Great Progress!",
        message: "You are in interview preparation stage.",
        badge: "🎯 Interview Prep Stage",
      };
    if (updatedScore >= 50)
      return {
        title: "📘 Skill Building Phase",
        message: "Continue learning missing skills.",
        badge: "🧠 Skill Building",
      };
    if (updatedScore >= 30)
      return {
        title: "🚀 Getting Started",
        message: "Foundation started.",
        badge: "📚 Foundation Stage",
      };
    return {
      title: "🧩 Learning Mode",
      message: "Start your learning journey.",
      badge: "🌱 Beginner Stage",
    };
  })();

  return (
    <div className="h-screen flex flex-col bg-[#f5f7f6] text-gray-800 relative overflow-hidden">

      {/* Background Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-[#d6c8f7] rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-[#cfe8d5] rounded-full opacity-20 blur-3xl"></div>

      {/* HEADER */}
      <header className="bg-[#e5e7eb] shadow-sm relative z-10">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-700 text-2xl"
            >
              ☰
            </button>
            <h2 className="text-xl font-bold">SkillUp</h2>
          </div>

          <div className="flex gap-4">
            <button className="px-4 py-2 bg-[#8D9977] text-white rounded-lg hover:bg-[#7C8669] transition">
              Find Jobs
            </button>
            <button
              onClick={() =>
                navigate("/interview-simulation", { state: { jobRole } })
              }
              className="px-4 py-2 bg-[#8D9977] text-white rounded-lg hover:bg-[#7C8669] transition"
            >
              Interview Simulation
            </button>
          </div>
        </div>
      </header>

      {runConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}

      {showCongrats && (
        <CongratsBoard
          fading={fadeCongrats}
          onStartInterview={() =>
            navigate("/interview-simulation", { state: { jobRole } })
          }
        />
      )}

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden relative z-10">

        {/* SIDEBAR */}
        <div
          className={`bg-white/80 backdrop-blur-md border-r border-gray-200 p-6 overflow-y-auto transition-all duration-300 h-full ${
            sidebarOpen
              ? "w-[360px]"
              : "w-0 p-0 overflow-hidden border-r-0"
          }`}
        >
          <h3 className="text-xl font-bold mb-4">📊 Progress Dashboard</h3>

          <p className="text-sm text-gray-500">Resume Score</p>
          <p className="text-3xl font-bold text-primary mb-4">
            {updatedScore}%
          </p>

          <div className="w-full bg-gray-300 h-3 rounded-full mb-2">
            <div
              className="bg-gradient-to-r from-[#8D9977] to-[#9ac5f4] h-3 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-sm text-gray-500 mb-4">
            {completedCount} of {totalTasks} tasks completed
          </p>

          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-sm">
            <p className="font-bold text-black-700">
              {status.title}
            </p>
            <p className="text-sm mt-1">
              {status.message}
            </p>
            <p className="text-xs mt-2 font-semibold">
              {status.badge}
            </p>
          </div>

          <br />

          <div className="space-y-3">
            {tasks.map((task, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(idx)}
                />
                <p className={task.completed ? "line-through text-gray-400" : ""}>
                  {task.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 px-10 py-8 overflow-y-auto transition-all duration-300">
          <h2 className="text-3xl font-extrabold mb-6">
            Your Personalized Learning Path
          </h2>

          {!loading &&
            roadmap.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition mb-6"
              >
                <h3 className="text-2xl font-bold text-gray-900">
                  {item.skill}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  ⏱ {item.estimated_time}
                </p>

                <div className="mt-4">
                  <p className="font-semibold mb-1">Recommended Courses:</p>
                  <ul className="list-disc ml-6 space-y-1">
                    {item.recommended_courses.map((course, i) => (
                      <li key={i}>
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {course.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  <p className="font-semibold mb-1">Mini Project:</p>
                  <p>{item.mini_project}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
