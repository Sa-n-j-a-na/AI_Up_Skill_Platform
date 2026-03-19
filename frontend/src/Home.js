import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const JOB_ROLES = [
  { value: "Software Engineer",         label: "Software Engineer" },
  { value: "Frontend Developer",        label: "Frontend Developer" },
  { value: "Backend Developer",         label: "Backend Developer" },
  { value: "Full Stack Developer",      label: "Full Stack Developer" },
  { value: "Data Scientist",            label: "Data Scientist" },
  { value: "Machine Learning Engineer", label: "Machine Learning Engineer" },
  { value: "DevOps Engineer",           label: "DevOps Engineer" },
  { value: "Cloud Engineer",            label: "Cloud Engineer" },
  { value: "Cybersecurity Analyst",     label: "Cybersecurity Analyst" },
  { value: "Database Administrator",    label: "Database Administrator" },
  { value: "System Administrator",      label: "System Administrator" },
  { value: "AI Engineer",               label: "AI Engineer" },
  { value: "Blockchain Developer",      label: "Blockchain Developer" },
  { value: "Game Developer",            label: "Game Developer" },
  { value: "UI/UX Designer",            label: "UI/UX Designer" },
  { value: "Mobile App Developer",      label: "Mobile App Developer" },
  { value: "Data Engineer",             label: "Data Engineer" },
  { value: "Network Engineer",          label: "Network Engineer" },
  { value: "QA Engineer",               label: "QA Engineer" },
  { value: "Embedded Systems Engineer", label: "Embedded Systems Engineer" },
];

// ── Allowed file types ──
const ALLOWED_TYPES = ["application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_SIZE_MB = 10;

const Home = () => {
  const [resume, setResume]         = useState(null);
  const [jobRole, setJobRole]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [open, setOpen]             = useState(false);
  const [search, setSearch]         = useState("");
  const [fileError, setFileError]   = useState("");   // ← validation error

  const dropdownRef = useRef(null);
  const navigate    = useNavigate();

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const filteredRoles = JOB_ROLES.filter((r) =>
    r.label.toLowerCase().includes(search.toLowerCase())
  );

  // ── File validation ──
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileError("");

    // Check extension
    const name = file.name.toLowerCase();
    const validExt = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));

    // Check MIME type (belt-and-suspenders with extension)
    const validType = ALLOWED_TYPES.includes(file.type) || validExt;

    // Check size
    const sizeMB = file.size / (1024 * 1024);

    if (!validType) {
      setFileError(
        "Invalid file format. Please upload your resume as a PDF document (.pdf)."
      );
      e.target.value = "";
      return;
    }

    if (sizeMB > MAX_SIZE_MB) {
      setFileError(
        `File size exceeds the ${MAX_SIZE_MB}MB limit. Please upload a smaller file.`
      );
      e.target.value = "";
      return;
    }

    setResume(file);
  };

  const handleAnalyze = async () => {
    if (!resume || !jobRole) {
      alert("Please upload a resume and select a job role.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", resume);
    formData.append("job_role", jobRole);
    try {
      const res  = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      navigate("/analysis", { state: { result: data, jobRole } });
    } catch {
      alert("Error analyzing resume. Please try again.");
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
        @keyframes spin { to { transform: rotate(360deg); } }
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
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes errorIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fade-1 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .fade-2 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.18s both; }
        .fade-3 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.30s both; }
        .fade-4 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.42s both; }

        .card-glow { animation: glowPulse 4s ease-in-out infinite; }

        /* ── SkillUp title — plain black ── */
        .skillup-title {
          color: #111827;
        }

        .upload-zone { transition: background 0.2s ease, border-color 0.2s ease; }
        .upload-zone:hover {
          background: rgba(183,199,161,0.40) !important;
          border-color: #8da87a !important;
        }
        .upload-zone.has-error {
          border-color: #f87171 !important;
          background: rgba(254,202,202,0.18) !important;
        }

        .role-trigger { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .role-trigger:hover  { border-color: #B7C7A1; }
        .role-trigger.active {
          border-color: #B7C7A1;
          box-shadow: 0 0 0 3px rgba(183,199,161,0.25);
        }

        .role-panel { animation: dropIn 0.18s ease both; }
        .role-panel::-webkit-scrollbar       { width: 4px; }
        .role-panel::-webkit-scrollbar-thumb { background: #B7C7A1; border-radius: 99px; }
        .role-panel::-webkit-scrollbar-track { background: transparent; }

        .role-search:focus { outline: none; }

        .role-option { transition: background 0.13s ease, padding-left 0.13s ease; cursor: pointer; }
        .role-option:hover       { background: rgba(183,199,161,0.28); padding-left: 20px; }
        .role-option.is-selected { background: rgba(183,199,161,0.42); font-weight: 600; color: #2d4a1e; }

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
        .analyze-btn:active:not(:disabled) { transform: translateY(0); }
        .analyze-btn:disabled { opacity: 0.8; cursor: not-allowed; animation: none; }
        .spin { animation: spin 0.85s linear infinite; }

        /* ── File error banner ── */
        .file-error-banner {
          animation: errorIn 0.22s ease both;
          display: flex; align-items: flex-start; gap: 8px;
          background: #fff5f5;
          border: 1px solid #fca5a5;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 13px;
          color: #b91c1c;
          line-height: 1.5;
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ffe9f0] via-[#f3e8dd] to-[#efe1d3]" />
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_15%,#ffffff_0%,transparent_45%),radial-gradient(circle_at_80%_25%,#ffffff_0%,transparent_50%)]" />

      {/* Decorative corners */}
      <svg className="absolute top-0 left-0 w-64 opacity-20" viewBox="0 0 200 200">
        <path fill="#7fb77e" d="M42.5,-56.4C54.6,-46.5,63.2,-33.6,66.7,-19.2C70.2,-4.7,68.6,11.2,61.2,23.8C53.8,36.3,40.6,45.6,26.2,53.3C11.8,61.1,-3.8,67.3,-18.6,63.7C-33.4,60.2,-47.4,46.9,-56.1,31.8C-64.9,16.8,-68.4,-0.1,-64.2,-15.4C-60.1,-30.6,-48.3,-44.2,-34.2,-54C-20.1,-63.9,-10.1,-70.1,2.5,-73.5C15,-76.9,30.1,-77.4,42.5,-56.4Z" transform="translate(100 100)" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-64 opacity-20" viewBox="0 0 200 200">
        <path fill="#9ac5f4" d="M34.9,-53.3C47.2,-45.4,60.4,-40.1,65.7,-29.7C71,-19.3,68.4,-3.9,62.8,8.5C57.1,20.8,48.4,30.2,38.1,40.5C27.8,50.8,15.9,62,-0.4,62.5C-16.7,63,-33.5,52.9,-43.5,39.4C-53.5,25.9,-56.7,9.1,-55.5,-7.1C-54.3,-23.3,-48.6,-38.8,-37.8,-47.7C-27,-56.7,-13.5,-59.1,-0.3,-58.6C12.9,-58.1,25.8,-54.3,34.9,-53.3Z" transform="translate(100 100)" />
      </svg>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-xl text-center">

          {/* Header */}
          <div className="mb-8">
            <div className="fade-1 flex items-center justify-center gap-3 mb-3">
              <svg viewBox="0 0 24 24" className="w-8 h-8">
                <defs>
                  <linearGradient id="gemGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%"   stopColor="#9ac5f4" />
                    <stop offset="50%"  stopColor="#d6c8f7" />
                    <stop offset="100%" stopColor="#cfe8d5" />
                  </linearGradient>
                </defs>
                <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z" fill="url(#gemGradient)" />
              </svg>
              {/* ── Plain gradient title, shimmer animation removed ── */}
              <h1 className="text-3xl font-bold skillup-title">SkillUp</h1>
            </div>
            <h2 className="fade-2 text-3xl md:text-4xl font-extrabold text-gray-900">
              Analyze Your Resume
            </h2>
            <p className="fade-3 mt-2 font-bold text-gray-600">
              Upload your resume and select your desired job role to get started.
            </p>
          </div>

          {/* Card */}
          <div className="card-glow fade-4 relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_30px_80px_rgba(0,0,0,0.15)] p-8 space-y-6">

            {/* ── Upload Resume ── */}
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resume
              </label>
              <label className={`upload-zone flex flex-col items-center justify-center rounded-2xl
                border-2 border-dashed border-[#B7C7A1] bg-[#B7C7A1]/30
                p-10 cursor-pointer transition ${fileError ? "has-error" : ""}`}>
                <span className="text-gray-700 text-sm">
                  {resume ? `✓  ${resume.name}` : "Upload a file or drag and drop"}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {resume ? "Click to change file" : "PDF (.pdf) | Max 10MB"}
                </span>
                <input type="file" className="hidden"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange} />
              </label>

              {/* ── Professional error banner ── */}
              {fileError && (
                <div className="file-error-banner mt-3">
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{flexShrink:0,marginTop:1}}>
                    <circle cx="10" cy="10" r="9" stroke="#f87171" strokeWidth="1.8"/>
                    <line x1="10" y1="6" x2="10" y2="11" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round"/>
                    <circle cx="10" cy="14" r="1" fill="#f87171"/>
                  </svg>
                  <span>{fileError}</span>
                </div>
              )}
            </div>

            {/* ── Dropdown ── */}
            <div className="text-left" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desired Job Role
              </label>

              <div
                onClick={() => { setOpen((o) => !o); setSearch(""); }}
                className={`role-trigger w-full rounded-xl border border-gray-300
                  bg-white px-4 py-3 flex items-center justify-between cursor-pointer
                  ${open ? "active" : ""}`}
              >
                <span className={`text-sm ${jobRole ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                  {jobRole || "Select a job role"}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", flexShrink: 0 }}>
                  <path d="M2 4l4 4 4-4" stroke="#8da87a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {open && (
                <div className="role-panel absolute z-50 mt-1 rounded-xl border border-[#B7C7A1]
                  bg-white shadow-[0_8px_28px_rgba(0,0,0,0.10)] overflow-hidden"
                  style={{ width: "calc(100% - 4rem)" }}>
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-[#e8f0e0]"
                    style={{ background: "rgba(183,199,161,0.12)" }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <circle cx="5.5" cy="5.5" r="4" stroke="#8da87a" strokeWidth="1.5" />
                      <path d="M9 9l2.5 2.5" stroke="#8da87a" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search roles..." autoFocus
                      className="role-search flex-1 text-sm text-gray-700 bg-transparent placeholder-gray-400" />
                    {search && (
                      <button onClick={() => setSearch("")}
                        className="text-gray-300 hover:text-gray-500 text-xs leading-none">✕</button>
                    )}
                  </div>

                  <div className="role-panel overflow-y-auto" style={{ maxHeight: "160px" }}>
                    {filteredRoles.length > 0 ? (
                      <>
                        {filteredRoles.map((role) => (
                          <div key={role.value}
                            onMouseDown={() => { setJobRole(role.value); setOpen(false); setSearch(""); }}
                            className={`role-option px-4 py-2 text-sm text-gray-700 ${jobRole === role.value ? "is-selected" : ""}`}>
                            {role.label}
                          </div>
                        ))}
                        <div style={{ height: "6px" }} />
                      </>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-400">No roles found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Analyze Button ── */}
            <button onClick={handleAnalyze} disabled={loading || !!fileError}
              className="analyze-btn group relative w-full overflow-hidden rounded-2xl py-4 font-bold text-white
                bg-[#A3B18A] shadow-[0_12px_24px_rgba(183,199,161,0.35)]
                transition-all duration-300 hover:bg-[#8D9977] hover:shadow-lg disabled:bg-[#A3B18A]">
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