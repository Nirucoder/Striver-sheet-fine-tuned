import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import AuthPage from "./AuthPage.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

function FullScreenSplash({ label }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0b0d",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        color: "#475569",
        fontFamily: "'DM Sans','Inter',sans-serif",
      }}
    >
      <img src="/pwa-512x512.png" alt="StudyOS" style={{ width: 48, height: 48, opacity: 0.9 }} />
      <div style={{ fontSize: 13 }}>{label}</div>
    </div>
  );
}

function Root() {
  const { status } = useAuth();

  if (status === "loading") return <FullScreenSplash label="Restoring your session…" />;
  if (status === "unauthenticated") return <AuthPage />;
  return <App />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>
);
