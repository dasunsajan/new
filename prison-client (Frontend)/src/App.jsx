import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

function Layout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-slate-50 min-h-screen min-w-0">{children}</div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/prisoners" element={<Navigate to="/dashboard?type=prisoner" replace />} />
        <Route path="/staff" element={<Navigate to="/dashboard?type=staff" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;