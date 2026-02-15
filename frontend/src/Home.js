import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [resume, setResume] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (e) => setResume(e.target.files[0]);
  const handleRoleChange = (e) => setJobRole(e.target.value);

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
      navigate("/analysis", { state: { result: data, jobRole } });
    } catch (err) {
      alert("Error analyzing resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6efe8] font-display text-gray-800">

      {/* ===== Layered textured background ===== */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ffe9f0] via-[#f3e8dd] to-[#efe1d3]" />
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_15%,#ffffff_0%,transparent_45%),radial-gradient(circle_at_80%_25%,#ffffff_0%,transparent_50%)]" />

      {/* ===== Decorative corners ===== */}
      <svg className="absolute top-0 left-0 w-64 opacity-20" viewBox="0 0 200 200">
        <path
          fill="#7fb77e"
          d="M42.5,-56.4C54.6,-46.5,63.2,-33.6,66.7,-19.2C70.2,-4.7,68.6,11.2,61.2,23.8C53.8,36.3,40.6,45.6,26.2,53.3C11.8,61.1,-3.8,67.3,-18.6,63.7C-33.4,60.2,-47.4,46.9,-56.1,31.8C-64.9,16.8,-68.4,-0.1,-64.2,-15.4C-60.1,-30.6,-48.3,-44.2,-34.2,-54C-20.1,-63.9,-10.1,-70.1,2.5,-73.5C15,-76.9,30.1,-77.4,42.5,-56.4Z"
          transform="translate(100 100)"
        />
      </svg>

      <svg className="absolute bottom-0 right-0 w-64 opacity-20" viewBox="0 0 200 200">
        <path
          fill="#9ac5f4"
          d="M34.9,-53.3C47.2,-45.4,60.4,-40.1,65.7,-29.7C71,-19.3,68.4,-3.9,62.8,8.5C57.1,20.8,48.4,30.2,38.1,40.5C27.8,50.8,15.9,62,-0.4,62.5C-16.7,63,-33.5,52.9,-43.5,39.4C-53.5,25.9,-56.7,9.1,-55.5,-7.1C-54.3,-23.3,-48.6,-38.8,-37.8,-47.7C-27,-56.7,-13.5,-59.1,-0.3,-58.6C12.9,-58.1,25.8,-54.3,34.9,-53.3Z"
          transform="translate(100 100)"
        />
      </svg>

      {/* ===== Main content ===== */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-xl text-center">

          {/* ===== Header ===== */}
          <div className="mb-8">

            <div className="flex items-center justify-center gap-3 mb-3">
              
              {/* SVG Icon */}
              <svg viewBox="0 0 24 24" className="w-8 h-8">
                <defs>
                  <linearGradient id="gemGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#9ac5f4" />
                    <stop offset="50%" stopColor="#d6c8f7" />
                    <stop offset="100%" stopColor="#cfe8d5" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z"
                  fill="url(#gemGradient)"
                />
              </svg>

              {/* SkillUp Text */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                SkillUp
              </h1>

            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              Analyze Your Resume
            </h2>

            <p className="mt-2 font-bold text-gray-600">
              Upload your resume and enter your desired job role to get started.
            </p>
          </div>

          {/* ===== Card ===== */}
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_30px_80px_rgba(0,0,0,0.15)] p-8 space-y-6">

            {/* Upload Resume */}
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resume
              </label>

              <label className="flex flex-col items-center justify-center rounded-2xl
                border-2 border-dashed border-[#B7C7A1]
                bg-[#B7C7A1]/30
                p-10 cursor-pointer transition hover:bg-[#B7C7A1]/40">

                <span className="text-gray-700 text-sm">
                  Upload a file or drag and drop
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PDF, DOCX up to 10MB
                </span>

                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {resume && (
                <p className="mt-2 text-xs text-gray-500">
                  Selected file: {resume.name}
                </p>
              )}
            </div>

            {/* Job Role */}
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desired Job Role
              </label>
              <input
                type="text"
                value={jobRole}
                onChange={handleRoleChange}
                placeholder="e.g., Full Stack Developer"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B7C7A1]"
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl py-4 font-bold text-white
                bg-[#A3B18A]
                shadow-[0_12px_24px_rgba(183,199,161,0.35)]
                transition-all duration-300
                hover:bg-[#8D9977]
                hover:shadow-lg
                disabled:bg-[#A3B18A]">

              {loading ? "Analyzing..." : "Analyze"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
