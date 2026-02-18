import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Analysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, jobRole } = location.state || {};
  const [showCongrats, setShowCongrats] = React.useState(false);
  const { resumeSkills, requiredSkills, missingSkills, score } = result;
  React.useEffect(() => {
  if (score === 100) {
    setShowCongrats(true);
  }
}, [score]);

  if (!result) {
    return (
      <p className="text-center mt-20">
        No analysis data found. Please upload a resume first.
      </p>
    );
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf5ff] via-[#f3e8ff] to-[#e0f2fe] p-6">

      {/* ===== Soft background orbs ===== */}
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full
        bg-[radial-gradient(circle,#f3c1e8,transparent_70%)] opacity-30" />

      <div className="absolute top-1/4 -right-40 w-[450px] h-[450px] rounded-full
        bg-[radial-gradient(circle,#d6c8f7,transparent_70%)] opacity-30" />

      <div className="absolute bottom-0 left-1/4 w-[420px] h-[420px] rounded-full
        bg-[radial-gradient(circle,#cfe8d5,transparent_70%)] opacity-30" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        {/* ===== Header ===== */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Skill Gap Analysis Dashboard
            </h1>
            <p className="mt-1 font-bold text-gray-500">
              {jobRole}
            </p>
          </div>

          {/* Resume Score (Pastel Blue) */}
          <div className="text-right">
            <p className="text-sm font-bold text-gray-500">Resume Score</p>
            <p className="text-4xl font-bold text-[#59A3AC]">
              {score}%
            </p>
          </div>
        </div>

        {/* ===== Cards ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Resume Skills */}
          <div className="bg-white rounded-xl p-6
            outline outline-2 outline-[#A3B18A]
            outline-offset-0
            shadow-[0_10px_25px_rgba(163,177,138,0.25)]">
            <h2 className="text-xl font-semibold mb-4">
              Your Resume Skills
            </h2>
            <ul className="space-y-2">
              {resumeSkills.map((skill) => (
                <li key={skill} className="flex items-center gap-2 text-sm">
                  <span className="text-[#A3B18A]">✔</span>
                  {skill}
                </li>
              ))}
            </ul>
          </div>

          {/* Skill Gap Summary */}
          <div className="bg-white rounded-xl p-6
            outline outline-2 outline-[#A3B18A]
            outline-offset-0
            shadow-[0_10px_25px_rgba(163,177,138,0.25)]">
            <h2 className="text-xl font-semibold mb-4">
              Skill Gap Summary
            </h2>

            <p className="text-sm text-gray-500 mb-2">
              Overall Match
            </p>

            <div className="w-full h-3 bg-gray-200 rounded-full mb-4">
              <div
                className="h-3 rounded-full bg-[#A3B18A]"
                style={{ width: `${score}%` }}
              />
            </div>

            <p className="font-medium mb-2">
              Missing Skills
            </p>

            <ul className="space-y-2">
              {missingSkills.map((skill) => (
                <li key={skill} className="flex items-center gap-2 text-sm">
                  <span className="text-yellow-600">⚠</span>
                  {skill}
                </li>
              ))}
            </ul>
          </div>

          {/* Required Skills */}
          <div className="bg-white rounded-xl p-6
            outline outline-2 outline-[#A3B18A]
            outline-offset-0
            shadow-[0_10px_25px_rgba(163,177,138,0.25)]">
            <h2 className="text-xl font-semibold mb-4">
              Required Job Skills
            </h2>
            <ul className="space-y-2">
              {requiredSkills.map((skill) => (
                <li key={skill} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">•</span>
                  {skill}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ===== Button (Pastel Blue) ===== */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() =>
              navigate("/learning-path", {
                state: { result, jobRole },
              })
            }
            className="px-8 py-3 rounded-lg
              bg-[#59A3AC] text-white font-semibold
              shadow-[0_8px_20px_rgba(140,185,240,0.4)]
              hover:bg-[#3878A1]
              transition"
          >
            Generate Learning Path
          </button>
        </div>
        {/* 🎉 100% Congratulations Popup */}
{showCongrats && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="bg-white dark:bg-background-dark rounded-xl p-8 max-w-md w-full text-center shadow-2xl border border-green-400">
      <h2 className="text-2xl font-bold text-green-600 mb-3">
        🎉 Congratulations!
      </h2>

      <p className="text-lg font-semibold mb-2">
        You are 100% Interview Ready!
      </p>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        You have completed all recommended courses and mini-projects. You can confidently attend interviews.
      </p>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowCongrats(false)}
          className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700"
        >
          Close
        </button>

        <button
          onClick={() => {
            setShowCongrats(false);
            navigate("/interview-simulation", {
              state: { jobRole },
            });
          }}
          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          🎤 Start Interview
        </button>
      </div>
    </div>
  </div>
)}

      </main>
    </div>
  );
};

export default Analysis;
