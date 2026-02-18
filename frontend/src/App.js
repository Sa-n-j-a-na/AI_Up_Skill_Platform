import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import Home from "./Home";
import Analysis from "./Analysis";
import LearningPath from "./LearningPath";
import InterviewSimulation from "./InterviewSimulation";
import HiringCalendar from "./HiringCalendar";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analyze" element={<Home />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/learning-path" element={<LearningPath />} />
        <Route path="/interview-simulation" element={<InterviewSimulation />} />
        <Route path="/hiring-calendar" element={<HiringCalendar />} />
      </Routes>
    </Router>
  );
}

export default App;
