import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const InterviewSimulation = () => {
  const location = useLocation();
  const jobRole = location.state?.jobRole || "Software Engineer";

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(true);

  const bottomRef = useRef(null);

  // 🔹 Ask FIRST interview question automatically
  useEffect(() => {
    const startInterview = async () => {
      try {
        const res = await fetch("http://localhost:5000/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobRole,
            messages: [],
          }),
        });
        const data = await res.json();
        if (data.reply) {
          setMessages([{ role: "assistant", content: data.reply }]);
        }
      } catch {
        setMessages([{ role: "assistant", content: "⚠️ Unable to start interview." }]);
      }
    };
    startInterview();
  }, [jobRole]);

  // 🔹 Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 🔹 Send message
  const sendMessage = async () => {
    if (!input.trim()) return;
    const updatedMessages = [...messages, { role: "user", content: input }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobRole, messages: updatedMessages }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages([...updatedMessages, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages([...updatedMessages, { role: "assistant", content: "⚠️ Interview service unavailable." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-display text-gray-800">

      <style>{`
        @keyframes floatSoft {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes msgIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes dotBounce {
          0%,80%,100% { transform: translateY(0); }
          40%          { transform: translateY(-6px); }
        }

        /* 🔧 ONLY CHANGE: glow values softened — ring thinner, spread smaller, opacity lower */
        @keyframes glowPulse {
          0%,100% {
            box-shadow:
              0 20px 50px rgba(0,0,0,0.08),
              0 0 0 1px rgba(210,190,140,0.25),
              0 0 14px 2px rgba(220,205,160,0.10);
          }
          50% {
            box-shadow:
              0 20px 50px rgba(0,0,0,0.08),
              0 0 0 1px rgba(220,200,150,0.42),
              0 0 20px 4px rgba(230,215,170,0.15);
          }
        }

        @keyframes pulse-send {
          0%,100% { box-shadow: 0 4px 14px rgba(163,177,138,0.35); }
          50%      { box-shadow: 0 4px 22px rgba(163,177,138,0.55); }
        }
        @keyframes popupIn {
          from { opacity:0; transform:scale(0.95) translateY(10px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }

        .main-card { animation: glowPulse 5s ease-in-out infinite; }

        .msg-bubble { animation: msgIn 0.3s cubic-bezier(0.16,1,0.3,1) both; }

        .send-btn {
          transition: background 0.2s ease, transform 0.18s ease;
          animation: pulse-send 2.8s ease-in-out infinite;
        }
        .send-btn:hover:not(:disabled) {
          background: #8F9D78 !important;
          transform: translateY(-1px);
          animation: none;
          box-shadow: 0 8px 20px rgba(163,177,138,0.45);
        }
        .send-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          animation: none;
        }

        .chat-input {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .chat-input:focus {
          outline: none;
          border-color: #B7C7A1 !important;
          box-shadow: 0 0 0 3px rgba(183,199,161,0.22);
        }

        .popup-card { animation: popupIn 0.4s cubic-bezier(0.16,1,0.3,1) both; }

        .dot-1 { animation: dotBounce 1.2s ease-in-out infinite 0s; }
        .dot-2 { animation: dotBounce 1.2s ease-in-out infinite 0.2s; }
        .dot-3 { animation: dotBounce 1.2s ease-in-out infinite 0.4s; }

        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #d8e4d0; border-radius: 99px; }

        .popup-li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #4a5a48;
          padding: 7px 0;
          border-bottom: 1px solid rgba(183,199,161,0.2);
        }
        .popup-li:last-child { border-bottom: none; }
      `}</style>

      {/* ===== Background ===== */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f6f8f4] via-[#eef3ed] to-[#e6eee5]" />

      {/* ===== Pastel Orbs ===== */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full
        bg-[radial-gradient(circle,#f3c1e8,transparent_70%)] opacity-30" />
      <div className="absolute top-1/3 -right-40 w-[460px] h-[460px] rounded-full
        bg-[radial-gradient(circle,#d6c8f7,transparent_70%)] opacity-30" />
      <div className="absolute bottom-0 left-1/4 w-[420px] h-[420px] rounded-full
        bg-[radial-gradient(circle,#cfe8d5,transparent_70%)] opacity-30" />

      {/* ===== Main Card ===== */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-4xl">

          <div className="main-card bg-white/80 backdrop-blur-xl rounded-3xl
            border-2 border-[#cfd4df]
            p-6">

            {/* Header */}
            <h1 className="text-center text-xl font-semibold text-gray-900">
              Interview Simulation
            </h1>
            <p className="text-center text-sm font-bold text-gray-500 mb-5">
              Role: <span className="font-bold">{jobRole}</span>
            </p>

            {/* Chat box */}
            <div className="chat-scroll h-80 overflow-y-auto rounded-2xl p-4
              mb-4 space-y-4"
              style={{
                background: "linear-gradient(160deg,#f8fbf8,#f2f7f1)",
                border: "1px solid #e0ead8",
                boxShadow: "inset 0 2px 10px rgba(0,0,0,0.03)",
              }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`msg-bubble max-w-[85%] whitespace-pre-line text-sm leading-relaxed
                    ${
                      msg.role === "assistant"
                        ? "mr-auto rounded-2xl rounded-tl-none px-4 py-3"
                        : "ml-auto rounded-2xl rounded-tr-none px-4 py-3 text-right"
                    }`}
                  style={msg.role === "assistant" ? {
                    background: "linear-gradient(135deg,#eef3ff,#e8f0ff)",
                    color: "#2a3a8a",
                    border: "1px solid #d4dcf8",
                    boxShadow: "0 2px 10px rgba(100,120,220,0.08)",
                  } : {
                    background: "linear-gradient(135deg,#e8f4ea,#dff0e2)",
                    color: "#1a5a2a",
                    border: "1px solid #b8ddc4",
                    boxShadow: "0 2px 10px rgba(60,140,80,0.08)",
                  }}
                >
                  <span className="block font-semibold mb-1" style={{ fontSize: 11, opacity: 0.65, letterSpacing: "0.05em" }}>
                    {msg.role === "assistant" ? "AI COACH" : "YOU"}
                  </span>
                  {msg.content}
                </div>
              ))}

              {loading && (
                <div className="mr-auto rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1"
                  style={{
                    background: "linear-gradient(135deg,#eef3ff,#e8f0ff)",
                    border: "1px solid #d4dcf8",
                    width: "fit-content",
                  }}
                >
                  <span className="dot-1 inline-block w-2 h-2 rounded-full bg-blue-400" />
                  <span className="dot-2 inline-block w-2 h-2 rounded-full bg-blue-400" />
                  <span className="dot-3 inline-block w-2 h-2 rounded-full bg-blue-400" />
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your answer..."
                className="chat-input flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="send-btn px-6 py-3 rounded-xl bg-[#A3B18A] text-white font-medium"
              >
                Send
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ===== Welcome Popup ===== */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center
          bg-black/30 backdrop-blur-sm">

          <div className="popup-card relative w-full max-w-md rounded-2xl
            bg-gradient-to-br from-[#eef3ff] via-[#f0f7f3] to-[#e8f4ea]
            border border-[#cfd4df]
            shadow-[0_25px_60px_rgba(0,0,0,0.2)]
            p-6 pt-10">

            {/* Animated Doll */}
            <div
              className="absolute -top-10 left-1/2 -translate-x-1/2
                w-20 h-20 rounded-full bg-white
                shadow-md flex items-center justify-center
                border border-[#cfd4df]"
              style={{ animation: "floatSoft 2.5s ease-in-out infinite" }}
            >
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="47" y="10" width="6" height="15" rx="2" fill="#78909C" />
                <circle cx="50" cy="10" r="4" fill="#FF5252" />
                <rect x="25" y="25" width="50" height="50" rx="10" fill="#B0BEC5" />
                <rect x="35" y="35" width="30" height="20" rx="5" fill="#546E7A" />
                <circle cx="43" cy="45" r="4" fill="#81D4FA" />
                <circle cx="57" cy="45" r="4" fill="#81D4FA" />
                <rect x="42" y="60" width="16" height="4" rx="2" fill="#FF5252" />
                <rect x="15" y="35" width="10" height="30" rx="5" fill="#78909C" />
                <rect x="75" y="35" width="10" height="30" rx="5" fill="#78909C" />
                <rect x="35" y="75" width="10" height="15" rx="3" fill="#78909C" />
                <rect x="55" y="75" width="10" height="15" rx="3" fill="#78909C" />
              </svg>
            </div>

            {/* Close */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome!
            </h2>

            <p className="text-sm text-gray-700 mb-3">
              You're about to begin a simulated interview.
            </p>

            <ul className="mb-4" style={{ padding: 0 }}>
              {[
                { icon: "💬", text: "Answer naturally and honestly" },
                { icon: "❓", text: "One question is asked at a time" },
                { icon: "✅", text: "You'll receive short feedback" },
              ].map((item, i) => (
                <li key={i} className="popup-li">{item.icon} {item.text}</li>
              ))}
            </ul>

            <div className="text-right">
              <button
                onClick={() => setShowPopup(false)}
                className="send-btn px-4 py-2 rounded-lg bg-[#A3B18A] text-white font-medium hover:bg-[#8F9D78] transition"
              >
                Start Interview
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSimulation;