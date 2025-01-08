import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Index";
import Users from "./pages/Users";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
      </Routes>
    </Router>
  );
}

export default App;