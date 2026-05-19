import { useState } from "react";
import { LoginForm } from "./components/LoginFormEnhanced";
import { DashboardLayout } from "./components/DashboardLayout";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  const handleLogin = (role: string) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("");
  };

  return (
    <>
      {isLoggedIn ? (
        <DashboardLayout userRole={userRole} onLogout={handleLogout} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
      <Toaster />
    </>
  );
}