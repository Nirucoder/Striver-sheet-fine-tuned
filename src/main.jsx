import { Component, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import AuthPage from "./AuthPage.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(err) {
    return { error: err };
  }
  componentDidCatch(err, info) {
    console.error("[StudyOS ErrorBoundary]", err, info?.componentStack);
  }
  render() {
    if (this.state.error) {
      const msg = this.state.error?.message || String(this.state.error);
      const stack = this.state.error?.stack || "";
      return (
        <div style={{
          minHeight: "100vh",
          background: "#0a0b0d",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
          fontFamily: "'DM Sans','Inter',sans-serif",
        }}>
          <div style={{
            maxWidth: 600,
            width: "100%",
            background: "#0f1117",
            border: "1px solid #7f1d1d",
            borderRadius: 16,
            padding: "28px 24px",
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#f87171", marginBottom: 8 }}>
              ⚠ Something went wrong
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16, lineHeight: 1.6 }}>
              StudyOS hit an unexpected error. Please share the details below so it can be fixed.
            </div>
            <div style={{
              background: "#0a0b0d",
              border: "1px solid #1e2030",
              borderRadius: 8,
              padding: "12px 14px",
              fontSize: 12,
              color: "#fca5a5",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: 300,
              overflowY: "auto",
              marginBottom: 20,
            }}>
              {msg}{stack ? "\n\n" + stack : ""}
            </div>
            <button
              onClick={() => { this.setState({ error: null }); window.location.reload(); }}
              style={{
                padding: "10px 20px",
                background: "#818cf8",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
      <ErrorBoundary>
        <Root />
      </ErrorBoundary>
    </AuthProvider>
  </StrictMode>
);
