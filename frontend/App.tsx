import React from "react";
import { Auth } from "./Auth";
import { Intro } from "./Intro";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

function App() {
  return (
    <Router>
      <Auth />
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/upload" element={<div>upload</div>} />
      </Routes>
    </Router>
  );
}

export default App;
