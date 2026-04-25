import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Capture from "@/pages/Capture";
import Result from "@/pages/Result";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/capture" element={<Capture />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </Router>
  );
}
