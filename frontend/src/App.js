// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./routes/Landing";
import Profile from "./routes/Profile";
import ProductDescription from "./components/ProductDescription";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/product/:id" element={<ProductDescription />} />
      </Routes>
    </Router>
  );
}

export default App;
