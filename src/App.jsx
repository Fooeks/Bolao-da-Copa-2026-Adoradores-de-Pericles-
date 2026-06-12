import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Agenda from "./pages/Agenda";
import Participante from "./pages/Participante";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/participante/:id" element={<Participante />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;