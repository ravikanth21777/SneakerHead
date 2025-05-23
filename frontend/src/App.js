// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./routes/Landing";
// import other pages as you build them

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
