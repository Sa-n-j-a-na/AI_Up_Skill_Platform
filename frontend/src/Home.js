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

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-btn {
          0%,100% { box-shadow: 0 12px 24px rgba(163,177,138,0.38); }
          50%      { box-shadow: 0 12px 34px rgba(163,177,138,0.58); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes glowPulse {
          0%,100% {
            box-shadow:
              0 30px 80px rgba(0,0,0,0.13),
              0 0 0 1.5px rgba(210,190,140,0.55),
              0 0 18px 4px rgba(230,210,160,0.28),
              0 0 40px 8px rgba(200,185,140,0.14);
          }
          50% {
            box-shadow:
              0 30px 80px rgba(0,0,0,0.13),
              0 0 0 1.5px rgba(220,200,150,0.75),
              0 0 24px 6px rgba(230,215,170,0.38),
              0 0 48px 10px rgba(210,195,150,0.18);
          }
        }
        @keyframes shimmerTitle {
          0%   { background-position: -500px 0; }
          100% { background-position:  500px 0; }
        }

        .fade-1 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .fade-2 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.18s both; }
        .fade-3 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.30s both; }
        .fade-4 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.42s both; }

        .card-glow {
          animation: glowPulse 4s ease-in-out infinite;
        }

        .skillup-title {
          background: linear-gradient(
            90deg,
            #1f2a1f 0%,
            #5a7a4a 30%,
            #9ac5f4 55%,
            #d6c8f7 70%,
            #1f2a1f 100%
          );
          background-size: 500px auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerTitle 5s linear infinite;
        }

        .upload-zone {
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .upload-zone:hover {
          background: rgba(183,199,161,0.40) !important;
          border-color: #8da87a !important;
        }

        .role-input {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .role-input:focus {
          outline: none;
          border-color: #B7C7A1 !important;
          box-shadow: 0 0 0 3px rgba(183,199,161,0.25);
        }

        .analyze-btn {
          transition: background 0.2s ease, transform 0.18s ease, box-shadow 0.2s ease;
          animation: pulse-btn 2.8s ease-in-out infinite;
        }
        .analyze-btn:hover:not(:disabled) {
          background: #8D9977 !important;
          transform: translateY(-2px);
          animation: none;
          box-shadow: 0 16px 36px rgba(163,177,138,0.50) !important;
        }
        .analyze-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .analyze-btn:disabled {
          opacity: 0.8;
          cursor: not-allowed;
          animation: none;
        }
        .spin { animation: spin 0.85s linear infinite; }
      `}</style>

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

            <div className="fade-1 flex items-center justify-center gap-3 mb-3">
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

              <h1 className="text-3xl font-bold skillup-title">
                SkillUp
              </h1>
            </div>

            <h2 className="fade-2 text-3xl md:text-4xl font-extrabold text-gray-900">
              Analyze Your Resume
            </h2>

            <p className="fade-3 mt-2 font-bold text-gray-600">
              Upload your resume and enter your desired job role to get started.
            </p>
          </div>

          {/* ===== Card ===== */}
          <div className="card-glow fade-4 relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_30px_80px_rgba(0,0,0,0.15)] p-8 space-y-6">

            {/* Upload Resume */}
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resume
              </label>

              <label className="upload-zone flex flex-col items-center justify-center rounded-2xl
                border-2 border-dashed border-[#B7C7A1]
                bg-[#B7C7A1]/30
                p-10 cursor-pointer transition hover:bg-[#B7C7A1]/40">

                <span className="text-gray-700 text-sm">
                  {resume ? `✓  ${resume.name}` : "Upload a file or drag and drop"}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {resume ? "Click to change file" : "PDF, DOCX up to 10MB"}
                </span>

                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
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
                className="role-input w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B7C7A1]"
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="analyze-btn group relative w-full overflow-hidden rounded-2xl py-4 font-bold text-white
                bg-[#A3B18A]
                shadow-[0_12px_24px_rgba(183,199,161,0.35)]
                transition-all duration-300
                hover:bg-[#8D9977]
                hover:shadow-lg
                disabled:bg-[#A3B18A]">

              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Analyzing...
                </span>
              ) : "Analyze"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;