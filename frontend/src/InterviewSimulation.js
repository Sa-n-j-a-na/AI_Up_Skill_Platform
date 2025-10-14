import React, { useState } from "react";
import OpenAI from "openai";

const InterviewSimulation = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Welcome to your Interview Simulation! Which job role are you interviewing for?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY, // store in .env file
    dangerouslyAllowBrowser: true, // only for demo; in production use backend proxy
  });

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a professional interviewer. Ask one question at a time. After each user answer, give short feedback and move to the next question." },
          ...newMessages,
        ],
      });

      const reply = completion.choices[0].message.content;
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: "assistant", content: "⚠️ Error: Unable to connect to AI." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center py-10">
      <div className="w-full max-w-3xl bg-white dark:bg-background-dark p-6 rounded-lg shadow-md border">
        <h2 className="text-2xl font-bold mb-4 text-center text-primary">🎤 Interview Simulation</h2>
        <div className="h-96 overflow-y-auto border p-4 rounded mb-4 bg-gray-50 dark:bg-gray-800">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-3 ${
                msg.role === "assistant" ? "text-blue-600 dark:text-blue-400" : "text-green-700 dark:text-green-300 text-right"
              }`}
            >
              <b>{msg.role === "assistant" ? "Interviewer: " : "You: "}</b>
              {msg.content}
            </div>
          ))}
          {loading && <p className="text-center text-gray-500">Thinking...</p>}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer..."
            className="flex-grow border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSimulation;
