import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-gray-800 relative overflow-hidden">

      {/* ===== Aesthetic Pastel Orbs ===== */}
      <div className="absolute -top-40 -left-40 w-[400px] h-[400px] bg-pink-200 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute top-20 right-[-150px] w-[350px] h-[350px] bg-blue-200 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute bottom-20 left-20 w-[300px] h-[300px] bg-green-200 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute bottom-[-150px] right-40 w-[400px] h-[400px] bg-purple-200 rounded-full blur-3xl opacity-40"></div>

      {/* ================= HEADER ================= */}
    <header className="relative z-10">

    <div className="flex items-center justify-between px-12 py-6">
        {/* LEFT: Logo */}
        <div className="flex items-center gap-3">

        <svg viewBox="0 0 24 24" className="w-7 h-7">
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

        <h2 className="text-2xl font-bold tracking-tight">
            SkillUp
        </h2>
        </div>

        {/* RIGHT: Get Started Button */}
        <button
        onClick={() => navigate("/analyze")}
        className="h-11 px-6 rounded-lg bg-[#B7C7A1] text-[#0f1c25] font-bold shadow-lg hover:bg-[#A3B18A] transition"
        >
        Get Started
        </button>

    </div>

    {/* Divider */}
    <div className="w-full border-b border-gray-300"></div>

    </header>


      {/* ================= HERO ================= */}
      {/* HERO */}
      <div className="w-full py-10">
        <div
          className="min-h-[520px] flex items-end bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1552581234-26160f608093')",
          }}
        >
          <div className="px-20 pb-12 max-w-[700px]">
            <h1 className="text-5xl font-black leading-tight tracking-[-0.03em] text-white">
              Unlock Your Career Potential
            </h1>

            <p className="mt-4 text-gray-200 text-lg">
              Upload your resume and instantly discover your missing skills,
              personalized learning roadmap, and interview readiness score —
              powered by intelligent AI models.
            </p>

            <button
              onClick={() => navigate("/analyze")}
              className="mt-6 h-12 px-6 rounded-lg bg-[#B7C7A1] text-[#0f1c25] font-bold shadow-lg hover:bg-[#A3B18A] transition"
            >
              Analyze My Skills
            </button>
          </div>
        </div>
      </div>
          
      {/* ================= AI INSIGHT SECTION ================= */}
      <section className="relative w-full py-24 bg-white overflow-hidden">

        {/* Soft Background Orbs */}
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-blue-200 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-blue-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute -bottom-20 right-0 w-[350px] h-[350px] bg-purple-100 rounded-full blur-3xl opacity-40"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-16 grid md:grid-cols-2 gap-16 items-center">

          {/* LEFT CONTENT */}
          <div>
            <h2 className="text-4xl font-bold text-[#0f1c25] leading-tight">
              Get AI-Driven Career Insights in Minutes
            </h2>

            <p className="mt-6 text-gray-600 text-lg leading-relaxed">
              SkillUp transforms your resume into actionable intelligence —
              identifying skill gaps, evaluating job readiness, and building
              a personalized learning roadmap powered by intelligent AI models.
            </p>

            <ul className="mt-8 space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-[#B7C7A1] font-bold text-xl">•</span>
                <span>Clear identification of your strengths and missing skills</span>
              </li>

              <li className="flex items-start gap-3">
                <span className="text-[#B7C7A1] font-bold text-xl">•</span>
                <span>Instant comparison with industry job role requirements</span>
              </li>

              <li className="flex items-start gap-3">
                <span className="text-[#B7C7A1] font-bold text-xl">•</span>
                <span>Personalized learning path and interview preparation guidance</span>
              </li>
            </ul>
          </div>

          {/* RIGHT IMAGE */}
          <div>
            <img
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df"
              alt="AI Career Analysis"
              className="rounded-xl shadow-xl w-full object-cover"
            />
          </div>

        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="px-16 pt-16 pb-24 relative z-10">
        <h2 className="text-4xl font-bold text-center">
        How SkillUp Works
        </h2>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
            
          {/* Resume Analysis */}
          <div className="bg-white rounded-xl shadow-md p-6 border">
            <h3 className="font-bold text-lg mb-2">
              Resume Analysis
            </h3>
            <p className="text-gray-600 text-sm">
              Upload your resume and receive a structured overview of your
              technical and professional skills, organized clearly for evaluation.
            </p>
          </div>

          {/* Skill Gap Analysis */}
          <div className="bg-white rounded-xl shadow-md p-6 border">
            <h3 className="font-bold text-lg mb-2">
              Skill Gap Analysis
            </h3>
            <p className="text-gray-600 text-sm">
              Compare your existing skills with industry job role requirements
              and instantly identify the areas that need improvement.
            </p>
          </div>

          {/* Learning Path */}
          <div className="bg-white rounded-xl shadow-md p-6 border">
            <h3 className="font-bold text-lg mb-2">
              Personalized Learning Path
            </h3>
            <p className="text-gray-600 text-sm">
              Get curated course recommendations, mini-project ideas,
              and a structured roadmap tailored to your career goals.
            </p>
          </div>

          {/* Progress Tracking */}
          <div className="bg-white rounded-xl shadow-md p-6 border">
            <h3 className="font-bold text-lg mb-2">
              Progress Tracking
            </h3>
            <p className="text-gray-600 text-sm">
              Monitor your completion status and see your readiness score
              improve as you complete recommended tasks.
            </p>
          </div>

          {/* Interview Simulation */}
          <div className="bg-white rounded-xl shadow-md p-6 border">
            <h3 className="font-bold text-lg mb-2">
              Interview Simulation
            </h3>
            <p className="text-gray-600 text-sm">
              Practice real-time interview questions with AI-driven feedback
              to strengthen your confidence before the actual interview.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 text-gray-500 text-sm border-t">
        © 2026 SkillUp — AI Career Preparation Platform
      </footer>
    </div>
  );
};

export default LandingPage;
