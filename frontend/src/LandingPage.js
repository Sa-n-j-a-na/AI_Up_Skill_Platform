import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [visibleCards, setVisibleCards] = useState([]);
  const cardRefs = useRef([]);

  // Cards fade+rise in when they scroll into view
  useEffect(() => {
    const observers = cardRefs.current.map((ref, i) => {
      if (!ref) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleCards((prev) => [...new Set([...prev, i])]);
          }
        },
        { threshold: 0.15 }
      );
      obs.observe(ref);
      return obs;
    });
    return () => observers.forEach((obs) => obs && obs.disconnect());
  }, []);

  const cards = [
    {
      icon: "📄",
      title: "Resume Analysis",
      desc: "Upload your resume and receive a structured overview of your technical and professional skills, organized clearly for evaluation.",
      border: "#B7C7A1",
      iconBg: "#f0f7ec",
      gradient: "#B7C7A1",
    },
    {
      icon: "🔍",
      title: "Skill Gap Analysis",
      desc: "Compare your existing skills with industry job role requirements and instantly identify the areas that need improvement.",
      border: "#90caf9",
      iconBg: "#e8f4fe",
      gradient: "#90caf9",
    },
    {
      icon: "🗺️",
      title: "Personalized Learning Path",
      desc: "Get curated course recommendations, mini-project ideas, and a structured roadmap tailored to your career goals.",
      border: "#f48fb1",
      iconBg: "#fdeef4",
      gradient: "#f48fb1",
    },
    {
      icon: "📈",
      title: "Progress Tracking",
      desc: "Monitor your completion status and see your readiness score improve as you complete recommended tasks.",
      border: "#ffe082",
      iconBg: "#fffbf0",
      gradient: "#ffe082",
    },
    {
      icon: "🎤",
      title: "Interview Simulation",
      desc: "Practice real-time interview questions with AI-driven feedback to strengthen your confidence before the actual interview.",
      border: "#ce93d8",
      iconBg: "#f8f0fb",
      gradient: "#ce93d8",
    },
    {
      icon: "🤖",
      title: "Study Assistant",
      desc: "Ask questions and get clear concept explanations, examples, and structured study guides powered by AI — anytime you need.",
      border: "#80deea",
      iconBg: "#edfbfd",
      gradient: "#80deea",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-gray-800 relative overflow-hidden">

      <style>{`
        /* ── Orb gentle float ── */
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-18px) scale(1.03); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-12px) scale(1.02); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-22px) scale(1.04); }
        }
        @keyframes floatD {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-14px) scale(1.02); }
        }
        .orb-a { animation: floatA 7s ease-in-out infinite; }
        .orb-b { animation: floatB 9s ease-in-out 1.5s infinite; }
        .orb-c { animation: floatC 8s ease-in-out 0.8s infinite; }
        .orb-d { animation: floatD 10s ease-in-out 2s infinite; }

        /* ── Hero text fade up ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-h1  { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
        .hero-para { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.30s both; }
        .hero-btn { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.45s both; }

        /* ── Shimmer on hero title ── */
        @keyframes shimmer {
          0%   { background-position: -500px 0; }
          100% { background-position:  500px 0; }
        }
        .shimmer-word {
          background: linear-gradient(
            90deg,
            #ffffff 0%,
            #cfe8d5 35%,
            #9ac5f4 55%,
            #ffffff 100%
          );
          background-size: 500px auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }

        /* ── Section heading fade in ── */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .section-title { animation: fadeIn 0.7s ease both; }

        /* ── Card scroll-in ── */
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(32px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
        .card-visible {
          animation: cardIn 0.55s cubic-bezier(0.16,1,0.3,1) both;
        }
        .card-hidden { opacity: 0; }

        /* ── Card hover ── */
        .skill-card {
          transition: transform 0.28s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.28s ease;
          cursor: default;
        }
        .skill-card:hover {
          transform: translateY(-7px) scale(1.02);
          box-shadow: 0 20px 48px rgba(0,0,0,0.09);
        }

        /* ── Icon bounce on card hover ── */
        .skill-card:hover .card-icon {
          animation: iconBounce 0.45s cubic-bezier(0.36,0.07,0.19,0.97);
        }
        @keyframes iconBounce {
          0%,100% { transform: translateY(0); }
          30%      { transform: translateY(-6px); }
          60%      { transform: translateY(-2px); }
        }

        /* ── Accent line expand on hover ── */
        .accent-line {
          height: 3px;
          border-radius: 99px;
          opacity: 0.6;
          margin-top: 18px;
          width: 40%;
          transition: width 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.3s;
        }
        .skill-card:hover .accent-line {
          width: 100%;
          opacity: 0.9;
        }

        /* ── Soft pulse on CTA button ── */
        @keyframes pulseSoft {
          0%, 100% { box-shadow: 0 0 0 0 rgba(183,199,161,0.45); }
          50%       { box-shadow: 0 0 0 8px rgba(183,199,161,0); }
        }
        .cta-pulse {
          animation: pulseSoft 2.8s ease-in-out infinite;
          transition: background 0.2s, transform 0.2s;
        }
        .cta-pulse:hover {
          background: #A3B18A !important;
          transform: translateY(-2px);
          animation: none;
          box-shadow: 0 8px 24px rgba(163,177,138,0.4);
        }

        /* ── Insight section bullet checkmarks ── */
        .check-bullet {
          transition: transform 0.2s ease;
        }
        .check-bullet:hover { transform: scale(1.15); }
      `}</style>

      {/* ===== Aesthetic Pastel Orbs ===== */}
      <div className="orb-a absolute -top-40 -left-40 w-[400px] h-[400px] bg-pink-200 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      <div className="orb-b absolute top-20 right-[-150px] w-[350px] h-[350px] bg-blue-200 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      <div className="orb-c absolute bottom-20 left-20 w-[300px] h-[300px] bg-green-200 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      <div className="orb-d absolute bottom-[-150px] right-40 w-[400px] h-[400px] bg-purple-200 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

      {/* ================= HEADER ================= */}
      <header className="relative z-10">
        <div className="flex items-center justify-between px-12 py-6">
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
            <h2 className="text-2xl font-bold tracking-tight">SkillUp</h2>
          </div>

          <button
            onClick={() => navigate("/analyze")}
            className="cta-pulse h-11 px-6 rounded-lg bg-[#B7C7A1] text-[#0f1c25] font-bold shadow-lg"
          >
            Get Started
          </button>
        </div>
        <div className="w-full border-b border-gray-300"></div>
      </header>

      {/* ================= HERO ================= */}
      <div className="w-full py-5">
        <div
          className="min-h-[520px] flex items-end bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1552581234-26160f608093')",
          }}
        >
          <div className="px-20 pb-12 max-w-[700px]">
            <h1 className="hero-h1 text-5xl font-black leading-tight tracking-[-0.03em] text-white">
              Unlock Your{" "}
              <span className="shimmer-word">Career Potential</span>
            </h1>

            {/* ✅ Plain static text — typewriter fully removed */}
            <p className="hero-para mt-4 text-gray-200 text-lg">
              Drop your resume, find out exactly where you stand, and get a
              personalized roadmap to bridge the gap — powered by AI built for
              your career.
            </p>

            <button
              onClick={() => navigate("/analyze")}
              className="hero-btn cta-pulse mt-6 h-12 px-6 rounded-lg bg-[#B7C7A1] text-[#0f1c25] font-bold shadow-lg"
            >
              Analyze My Skills
            </button>
          </div>
        </div>
      </div>

      {/* ================= AI INSIGHT SECTION ================= */}
      <section className="relative w-full py-24 bg-white overflow-hidden">
        <div className="orb-b absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-blue-200 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
        <div className="orb-a absolute -top-20 -right-20 w-[300px] h-[300px] bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
        <div className="orb-c absolute -bottom-20 right-0 w-[350px] h-[350px] bg-purple-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-16 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-[#0f1c25] leading-tight">
              Get AI-Driven Career Insights in Minutes
            </h2>

            <p className="mt-6 text-gray-600 text-lg leading-relaxed">
              SkillUp turns your resume into a career action plan — pinpointing
              the exact skills you're missing, building a personalized learning
              roadmap, and preparing you for interviews with AI-powered simulations.
            </p>

            <ul className="mt-8 space-y-4 text-gray-700">
              {[
                "Instant breakdown of your strengths and skill gaps",
                "Accurate comparison against real-world job role skill requirements",
                "Structured learning roadmap with recommended courses and projects",
                "AI-powered interview simulation with real-time question and feedback",
              ].map((text, i) => (
                <li key={i} className="check-bullet flex items-start gap-3">
                  <span
                    style={{
                      minWidth: 22, height: 22, borderRadius: "50%",
                      background: "#f0f7ec", border: "1.5px solid #B7C7A1",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginTop: 2, flexShrink: 0,
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="#6a9a5a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

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
        <h2 className="section-title text-4xl font-bold text-center">
          How SkillUp Works
        </h2>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <div
              key={i}
              ref={(el) => (cardRefs.current[i] = el)}
              className={`skill-card bg-white rounded-2xl p-7 border-[1.5px] ${
                visibleCards.includes(i) ? "card-visible" : "card-hidden"
              }`}
              style={{
                borderColor: card.border,
                animationDelay: visibleCards.includes(i)
                  ? `${(i % 3) * 0.12}s`
                  : "0s",
              }}
            >
              <div
                className="card-icon"
                style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: card.iconBg,
                  border: `1.5px solid ${card.border}`,
                  display: "flex", alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22, marginBottom: 16,
                }}
              >
                {card.icon}
              </div>

              <h3 className="font-bold text-[#0f1c25] text-base mb-2">
                {card.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {card.desc}
              </p>

              <div
                className="accent-line"
                style={{
                  background: `linear-gradient(90deg, ${card.gradient}, transparent)`,
                }}
              />
            </div>
          ))}
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