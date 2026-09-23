import React, { useState } from "react";
import RegistrationWizard from "./RegistrationWizard.jsx";
import LoginPage from "./LoginPage.jsx";

export default function AuthScreen({ onAuthenticated, onDemoLogin }) {
  // Core Principle: Register-First, Then Login. Default view is "register"
  const [view, setView] = useState("register"); // "register" | "login"

  if (view === "register") {
    return (
      <RegistrationWizard
        onAuthenticated={onAuthenticated}
        onDemoLogin={onDemoLogin}
        onSwitchToLogin={() => setView("login")}
      />
    );
  }

  return (
    <LoginPage
      onAuthenticated={onAuthenticated}
      onDemoLogin={onDemoLogin}
      onSwitchToRegister={() => setView("register")}
    />
  );
}
