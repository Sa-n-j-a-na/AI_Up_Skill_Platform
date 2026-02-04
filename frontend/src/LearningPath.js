import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Confetti from "react-confetti";

/* 🎉 SVG Congrats board (REPLACES popup, nothing else) */
const CongratsBoard = ({ fading, onStartInterview }) => {
  return (
    <div
      className={`fixed top-6 left-6 z-[9999] transition-opacity duration-1000 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex gap-4 bg-white rounded-xl shadow-2xl border border-green-400 px-6 py-4 max-w-md">

        {/* SVG Doll */}
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

        {/* SAME POPUP CONTENT */}
        <div>
          <h2 className="text-lg font-bold text-green-600 mb-1">
            🎉 Congratulations!
          </h2>

          <p className="font-semibold mb-1">
            You are 100% Interview Ready!
          </p>

          <p className="text-sm text-gray-600 mb-3">
            You have completed all recommended courses and mini-projects.
            You can confidently attend interviews.
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

  /* Fetch learning path */
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

  /* ===== SCORE LOGIC (UNCHANGED) ===== */
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

  /* 🎉 Celebration trigger */
  useEffect(() => {
      if (updatedScore === 100) {
        setShowCongrats(true);
        setRunConfetti(true);

        // Start fade a bit later
        setTimeout(() => setFadeCongrats(true), 6000);

        // Remove board after fade
        setTimeout(() => setShowCongrats(false), 7500);

        // Confetti lasts 10 seconds more
        setTimeout(() => setRunConfetti(false), 18000);
      }
    }, [updatedScore]);


  /* Status message logic (UNCHANGED) */
  const getStatusMessage = (score) => {
    if (score >= 100)
      return {
        title: "🎉 Congratulations!",
        message: "You are 100% interview ready! You can confidently attend interviews now.",
        badge: "🏆 Fully Interview Ready",
      };
    if (score >= 85)
      return {
        title: "🔥 Almost There!",
        message: "You are interview ready. Start applying and practicing interviews.",
        badge: "✅ Interview Ready",
      };
    if (score >= 70)
      return {
        title: "💪 Great Progress!",
        message: "You are in interview preparation stage. Focus on mock interviews.",
        badge: "🎯 Interview Prep Stage",
      };
    if (score >= 50)
      return {
        title: "📘 Skill Building Phase",
        message: "Strong foundation building. Continue learning missing skills.",
        badge: "🧠 Skill Building",
      };
    if (score >= 30)
      return {
        title: "🚀 Getting Started",
        message: "Foundation started. Keep learning and growing.",
        badge: "📚 Foundation Stage",
      };
    return {
      title: "🧩 Learning Mode",
      message: "Start your learning journey to become interview ready.",
      badge: "🌱 Beginner Stage",
    };
  };

  const status = getStatusMessage(updatedScore);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-gray-800 dark:text-gray-200">

      {/* 🎊 CONFETTI */}
      {runConfetti && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={500}
            gravity={0.3}
            recycle={false}
          />
        </div>
      )}

      {/* SVG Congrats Board */}
      {showCongrats && (
        <CongratsBoard
          fading={fadeCongrats}
          onStartInterview={() =>
            navigate("/interview-simulation", { state: { jobRole } })
          }
        />
      )}

      {/* ===== EVERYTHING BELOW IS YOUR ORIGINAL DASHBOARD ===== */}

      <div className="flex justify-end p-4">
        <button
          onClick={() =>
            navigate("/interview-simulation", { state: { jobRole } })
          }
          className="px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90"
        >
          🎤 Start Interview Simulation
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-3xl font-bold">
            Your Personalized Learning Path
          </h2>

          {loading && (
            <p className="text-gray-500">Loading learning recommendations...</p>
          )}

          {!loading &&
            roadmap.map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-background-dark/60 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow"
              >
                <h3 className="text-2xl font-bold text-primary">
                  {item.skill}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  ⏱ Estimated time: {item.estimated_time}
                </p>

                <div className="mt-4">
                  <p className="font-semibold mb-1">📘 Recommended Courses</p>
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
                  <p className="font-semibold mb-1">🛠 Mini Project</p>
                  <p>{item.mini_project}</p>
                </div>
              </div>
            ))}
        </div>

        {/* RIGHT */}
        <div className="bg-white dark:bg-background-dark/60 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow h-fit">
          <h3 className="text-xl font-bold mb-4">📊 Progress Dashboard</h3>

          <p className="text-sm text-gray-500">Resume Score</p>
          <p className="text-3xl font-bold text-primary mb-4">
            {updatedScore}%
          </p>

          <div className="w-full bg-gray-300 dark:bg-gray-700 h-3 rounded-full mb-2">
            <div
              className="bg-primary h-3 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-sm text-gray-500 mb-4">
            {completedCount} of {totalTasks} tasks completed
          </p>

          <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700">
            <p className="font-bold text-green-700 dark:text-green-300">
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
                className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 p-3 rounded"
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
      </div>
    </div>
  );
};

export default LearningPath;
