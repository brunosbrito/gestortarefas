import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./integrations/supabase/client";
import Dashboard from "./pages/Index";
import Users from "./pages/Users";
import Login from "./pages/Login";
import { Toaster } from "@/components/ui/toaster";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/"
          element={session ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/users"
          element={session ? <Users /> : <Navigate to="/login" />}
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;