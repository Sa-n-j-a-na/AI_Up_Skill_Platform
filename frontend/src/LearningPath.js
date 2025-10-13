import React, { useState } from "react";
import { useLocation } from "react-router-dom";

const LearningPath = () => {
  const location = useLocation();
  const { result } = location.state || {};
  const { resumeSkills = [], requiredSkills = [], missingSkills = [], score = 0 } = result || {};

  // Create tasks dynamically from missing skills
  const initialTasks = missingSkills.length > 0
    ? missingSkills.map(skill => ({
        title: `Learn ${skill}`,
        type: "Course",
        points: 10,
        completed: false,
      }))
    : [
        { title: "No missing skills! You’re job ready 🎉", type: "Congrats", points: 0, completed: true },
      ];

  const [tasks, setTasks] = useState(initialTasks);

  // --- Progress tracking ---
  const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);
  const completedPoints = tasks.reduce((sum, t) => sum + (t.completed ? t.points : 0), 0);
  const progressPercent =
    totalPoints === 0
      ? score
      : Math.min(100, Math.round(score + (completedPoints / totalPoints) * (100 - score)));

  const toggleTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index].completed = !newTasks[index].completed;
    setTasks(newTasks);
  };

  // ✅ Missing JSX return (added below)
  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen text-content-light dark:text-content-dark flex flex-col">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Your Personalized Learning Path</h2>
            <p className="mt-4 text-lg text-subtle-light dark:text-subtle-dark">
              Complete these tasks to improve your resume score.
            </p>
          </div>

          {/* Task list */}
          <div className="space-y-4">
            {tasks.map((task, idx) => (
              <div
                key={idx}
                className={`bg-white dark:bg-background-dark p-4 rounded-lg border border-border-light dark:border-border-dark flex items-center space-x-4 ${
                  task.completed ? "opacity-70" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(idx)}
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div className="flex-grow">
                  <h4 className={`font-semibold ${task.completed ? "line-through text-subtle-light" : ""}`}>
                    {task.title}
                  </h4>
                  <p className={`text-sm ${task.completed ? "line-through text-subtle-light" : "text-subtle-light dark:text-subtle-dark"}`}>
                    {task.type}
                  </p>
                </div>
                <span className={`text-sm font-medium ${task.completed ? "text-green-500" : "text-primary"}`}>
                  {task.completed ? "Completed" : `+${task.points} pts`}
                </span>
              </div>
            ))}
          </div>

          {/* Progress section */}
          <div className="text-center mt-10">
            <h3 className="text-xl font-bold mb-2">Resume Score</h3>
            <p className="text-4xl font-bold text-primary">{progressPercent}%</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearningPath;
