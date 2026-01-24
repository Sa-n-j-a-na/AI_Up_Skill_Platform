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
          setMessages([
            { role: "assistant", content: data.reply },
          ]);
        }
      } catch {
        setMessages([
          { role: "assistant", content: "⚠️ Unable to start interview." },
        ]);
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

    const updatedMessages = [
      ...messages,
      { role: "user", content: input },
    ];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole,
          messages: updatedMessages,
        }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: data.reply },
        ]);
      }
    } catch {
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "⚠️ Interview service unavailable." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-display text-gray-800">

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

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl
            border-2 border-[#cfd4df]
            shadow-[0_20px_50px_rgba(0,0,0,0.1)]
            p-6">

            {/* Header */}
            <h1 className="text-center text-xl font-semibold text-gray-900">
              Interview Simulation
            </h1>
            <p className="text-center text-sm font-bold text-gray-500 mb-5">
              Role: <span className="font-bold">{jobRole}</span>
            </p>

            {/* Chat box */}
            <div className="h-80 overflow-y-auto rounded-2xl p-4
              bg-[#fafafa] mb-4 space-y-4 border">

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-[85%] whitespace-pre-line text-sm leading-relaxed
                    ${
                      msg.role === "assistant"
                        ? "mr-auto bg-[#EEF3FF] text-blue-800 rounded-2xl rounded-tl-none px-4 py-3"
                        : "ml-auto bg-[#E8F4EA] text-green-800 rounded-2xl rounded-tr-none px-4 py-3 text-right"
                    }`}
                >
                  <span className="block font-semibold mb-1">
                    {msg.role === "assistant" ? "AI Coach" : "You"}
                  </span>
                  {msg.content}
                </div>
              ))}

              {loading && (
                <div className="mr-auto bg-[#EEF3FF] text-blue-800
                  rounded-2xl rounded-tl-none px-4 py-3 text-sm flex gap-1">
                  <span className="animate-bounce">•</span>
                  <span className="animate-bounce delay-100">•</span>
                  <span className="animate-bounce delay-200">•</span>
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
                placeholder="Type your answer..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-[#A3B18A]"
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="px-6 py-3 rounded-xl
                  bg-[#A3B18A] text-white font-medium
                  hover:bg-[#8F9D78]
                  transition"
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

            <div className="relative w-full max-w-md rounded-2xl
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
            {/* Custom SVG Doll */}
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
              You’re about to begin a simulated interview.
            </p>

            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1 mb-4">
              <li>Answer naturally and honestly</li>
              <li>One question is asked at a time</li>
              <li>You’ll receive short feedback</li>
            </ul>

            <div className="text-right">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 rounded-lg
                  bg-[#A3B18A] text-white font-medium
                  hover:bg-[#8F9D78]
                  transition"
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
