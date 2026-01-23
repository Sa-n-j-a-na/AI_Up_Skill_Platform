import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const InterviewSimulation = () => {
  const location = useLocation();
  const jobRole = location.state?.jobRole || "Software Engineer";

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Ask FIRST interview question automatically
  useEffect(() => {
    const startInterview = async () => {
      try {
        const res = await fetch("http://localhost:5000/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobRole,
            messages: [], // empty = first question
          }),
        });

        const data = await res.json();

        // ✅ SAFETY CHECK: only add message if reply exists
        if (data.reply) {
          setMessages([
            {
              role: "assistant",
              content: data.reply,
            },
          ]);
        }
      } catch (err) {
        setMessages([
          {
            role: "assistant",
            content: "⚠️ Unable to start interview.",
          },
        ]);
      }
    };

    startInterview();
  }, [jobRole]);

  // 🔹 Send user answer and get next question + feedback
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

      // ✅ SAFETY CHECK: prevent empty assistant messages
      if (data.reply) {
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: data.reply },
        ]);
      }
    } catch (err) {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "⚠️ Interview service unavailable.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex justify-center items-center p-6">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-primary mb-4">
          🎤 Interview Simulation
        </h2>

        <div className="h-96 overflow-y-auto border rounded p-4 mb-4 bg-gray-50 dark:bg-gray-800">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-3 whitespace-pre-line ${
                msg.role === "assistant"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-green-700 dark:text-green-300 text-right"
              }`}
            >
              <b>{msg.role === "assistant" ? "Interviewer: " : "You: "}</b>
              {msg.content}
            </div>

          ))}

          {loading && (
            <p className="text-center text-gray-500">Thinking...</p>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer..."
            className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSimulation;
