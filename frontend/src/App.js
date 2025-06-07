// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./routes/Landing";
import Profile from "./routes/Profile";
import ProductDescription from "./routes/ProductDescription";
import ListItemAuction from "./routes/ListItemAuction";
import OrderSummary from "./routes/OrderSummary";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/product/:id" element={<ProductDescription />} />
        <Route path="/list-auction" element={<ListItemAuction />} />
         <Route path="/order/:id" element={<OrderSummary />} />
      </Routes>
    </Router>
  );
}

export default App;
