import { useState } from "react";
import { LoginPage } from "@/pages/LoginPage";
import { HomePage } from "@/pages/HomePage";
import { getStoredUser, logoutService } from "@/services/auth.service";
import type { AuthUser } from "@/types/auth";

function App() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());

  function handleLoginSuccess(userData: AuthUser) {
    setUser(userData);
  }

  function handleLogout() {
    logoutService();
    setUser(null);
  }

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <HomePage user={user} onLogout={handleLogout} />;
}

export default App;
