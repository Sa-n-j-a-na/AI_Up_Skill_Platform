import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [resume, setResume] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => setResume(e.target.files[0]);
  const handleRoleChange = (e) => setJobRole(e.target.value);
  const navigate = useNavigate();
  const handleAnalyze = async () => {
    if (!resume || !jobRole) {
      alert("Please upload a resume and enter a job role.");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("file", resume);
    formData.append("job_role", jobRole);

    try {
      const res = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      // Navigate to Analysis page with state
      navigate("/analysis", { state: { result: data, jobRole } });
    } catch (err) {
      console.error(err);
      alert("Error analyzing resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl mx-auto space-y-8 text-center">
          <div>
            <div className="flex justify-center items-center gap-3 mb-4">
              <svg
                className="h-10 w-10 text-primary"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                  fill="currentColor"
                />
              </svg>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SkillUp</h1>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              Analyze Your Resume
            </h2>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
              Upload your resume and enter your desired job role to get started.
            </p>
          </div>

          <div className="bg-white dark:bg-background-dark/50 p-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg space-y-6">
            <div className="space-y-6">
              {/* Resume Upload */}
              <div>
                <label
                  htmlFor="resume-upload"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left mb-1"
                >
                  Upload Resume
                </label>
                <div className="mt-1 flex justify-center px-6 pt-10 pb-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary dark:hover:border-primary transition-colors">
                  <div className="space-y-1 text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500">
                      upload_file
                    </span>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center gap-1">
                      <label
                        htmlFor="resume-upload"
                        className="relative cursor-pointer bg-transparent rounded font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                      >
                        <span>Upload a file</span>
                        <input
                          id="resume-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p>or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">PDF, DOCX up to 10MB</p>
                  </div>
                </div>
                {resume && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Selected file: {resume.name}
                  </p>
                )}
              </div>

              {/* Job Role Input */}
              <div>
                <label
                  htmlFor="job-role"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left mb-1"
                >
                  Desired Job Role
                </label>
                <input
                  id="job-role"
                  type="text"
                  value={jobRole}
                  onChange={handleRoleChange}
                  placeholder="e.g., Senior Product Manager"
                  className="mt-1 block w-full px-3 py-3 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-background-light dark:bg-gray-900 text-gray-900 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Analyze Button */}
            <div className="pt-4">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-opacity"
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className="mt-6 text-left">
                <h2 className="font-bold text-lg">Resume Skills:</h2>
                <p>{result.resumeSkills?.join(", ")}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
