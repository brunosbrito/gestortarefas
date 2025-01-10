import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Index";
import Users from "./pages/Users";
import Obras from "./pages/Obras";
import OrdensServico from "./pages/obras/os";
import Atividades from "./pages/obras/os/atividades";
import RegistroPonto from "./pages/RegistroPonto";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/obras" element={<Obras />} />
        <Route path="/obras/os" element={<OrdensServico />} />
        <Route path="/obras/os/atividades" element={<Atividades />} />
        <Route path="/ponto" element={<RegistroPonto />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;