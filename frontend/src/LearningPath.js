import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LearningPath = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Data from Analysis page
  const { result } = location.state || {};
  const { missingSkills = [] } = result || {};

  // Backend roadmap
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);

  // Progress tasks
  const [tasks, setTasks] = useState([]);

  // Fetch learning path from backend
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

        // Build checklist tasks from roadmap
        const generatedTasks = [];
        rm.forEach((item) => {
          generatedTasks.push({
            label: `${item.skill} – Course`,
            completed: false,
          });
          generatedTasks.push({
            label: `${item.skill} – Mini Project`,
            completed: false,
          });
        });

        setTasks(generatedTasks);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching learning path:", err);
        setLoading(false);
      });
  }, [missingSkills]);

  // Toggle checkbox
  const toggleTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };

  // ===== CORRECT SCORE & PROGRESS LOGIC =====
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;

  const progressPercent =
    totalTasks === 0
      ? 0
      : Math.round((completedCount / totalTasks) * 100);

  // Resume score is SAME as progress (correct logic)
  const updatedScore = progressPercent;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-gray-800 dark:text-gray-200">
      {/* Top bar */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => navigate("/interview-simulation")}
          className="px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90"
        >
          🎤 Start Interview Simulation
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== LEFT: Learning Content ===== */}
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

        {/* ===== RIGHT: Progress Dashboard ===== */}
        <div className="bg-white dark:bg-background-dark/60 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow h-fit">
          <h3 className="text-xl font-bold mb-4">📊 Progress Dashboard</h3>

          <p className="text-sm text-gray-500">Resume Score</p>
          <p className="text-3xl font-bold text-primary mb-4">
            {updatedScore}%
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-300 dark:bg-gray-700 h-3 rounded-full mb-2">
            <div
              className="bg-primary h-3 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-sm text-gray-500 mb-4">
            {completedCount} of {totalTasks} tasks completed
          </p>

          {/* Checklist */}
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
                <p
                  className={`${
                    task.completed ? "line-through text-gray-400" : ""
                  }`}
                >
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
