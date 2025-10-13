import React from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";  // add this at top

const Analysis = () => {
  const location = useLocation();
  const { result, jobRole } = location.state || {};
  const navigate = useNavigate();

  if (!result) {
    return <p className="text-center mt-20">No analysis data found. Please upload a resume first.</p>;
  }
  const handleGenerateLearningPath = () => {
  navigate("/learning-path", {
    state: {
      result,   // sends skills, missing skills, score
      jobRole,
    },
  });
};
  const { resumeSkills, requiredSkills, missingSkills, score } = result;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Skill Gap Analysis Dashboard
              </h1>
              <p className="mt-1 text-base text-gray-500 dark:text-gray-400">{jobRole || "Software Engineer Role"}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Resume Score</p>
              <p className="text-4xl font-bold text-primary">{score || 0}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Resume Skills */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark/50 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Resume Skills</h2>
              <ul className="space-y-3">
                {resumeSkills?.map((skill) => (
                  <li key={skill} className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                    <span className="material-symbols-outlined text-green-500 mr-2">check_circle</span> {skill}
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Skills */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark/50 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Required Job Skills</h2>
              <ul className="space-y-3">
                {requiredSkills?.map((skill) => (
                  <li key={skill} className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 mr-2">label</span> {skill}
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Skills */}
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 dark:bg-yellow-500/20 p-6">
              <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-4">Missing Skills</h2>
              <ul className="space-y-3">
                {missingSkills?.map((skill) => (
                  <li key={skill} className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                    <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 mr-2">warning</span> {skill}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <button
  onClick={handleGenerateLearningPath}
  className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition-transform transform hover:scale-105"
>
  Generate Learning Path
</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analysis;
