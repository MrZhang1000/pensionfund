import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Capture from "@/pages/Capture";
import Result from "@/pages/Result";
import MarkerEditor from "@/pages/MarkerEditor";
import History from "@/pages/History";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/capture" element={<Capture />} />
        <Route path="/result" element={<Result />} />
        <Route path="/edit" element={<MarkerEditor />} />
        <Route path="/edit/:id" element={<MarkerEditor />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}
