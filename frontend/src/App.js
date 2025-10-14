import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Analysis from "./Analysis";
import LearningPath from "./LearningPath";
import InterviewSimulation from "./InterviewSimulation";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/learning-path" element={<LearningPath />} />
        <Route path="/interview-simulation" element={<InterviewSimulation />} />
      </Routes>
    </Router>
  );
}

export default App;
