import { useEffect, useRef, useState } from "react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function decodeJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

export default function AuthPage({ onAuth }) {
  const btnRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) {
      setError("VITE_GOOGLE_CLIENT_ID is not set.");
      return;
    }

    const handleCredential = ({ credential }) => {
      const user = decodeJwt(credential);
      const session = {
        name: user.name,
        email: user.email,
        picture: user.picture,
        sub: user.sub,
        token: credential,
      };
      localStorage.setItem("studyos_user", JSON.stringify(session));
      onAuth(session);
    };

    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      setReady(true);
    };
    s.onerror = () => setError("Failed to load Google sign-in.");
    document.head.appendChild(s);
    return () => {
      try {
        document.head.removeChild(s);
      } catch {}
    };
  }, [onAuth]);

  useEffect(() => {
    if (ready && btnRef.current) {
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text: "signin_with",
        logo_alignment: "left",
        width: 320,
      });
      window.google.accounts.id.prompt();
    }
  }, [ready]);

  const S = {
    page: {
      minHeight: "100vh",
      background: "#080a0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter',system-ui,sans-serif",
    },
    card: {
      background: "#0f1117",
      border: "1px solid #1e2030",
      borderRadius: 20,
      padding: "48px 40px",
      width: "100%",
      maxWidth: 400,
      boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
      textAlign: "center",
    },
    logo: {
      fontSize: 30,
      fontWeight: 800,
      color: "#f1f5f9",
      letterSpacing: "-0.02em",
      marginBottom: 6,
    },
    badge: {
      display: "inline-block",
      fontSize: 11,
      color: "#818cf8",
      background: "rgba(129,140,248,0.1)",
      border: "1px solid rgba(129,140,248,0.2)",
      borderRadius: 20,
      padding: "3px 10px",
      marginBottom: 32,
    },
    h2: { fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 },
    p: { fontSize: 13, color: "#475569", marginBottom: 36, lineHeight: 1.7 },
    btnWrap: { display: "flex", justifyContent: "center", marginBottom: 24 },
    err: {
      background: "rgba(248,113,113,0.08)",
      border: "1px solid #7f1d1d",
      borderRadius: 8,
      padding: "10px 14px",
      color: "#f87171",
      fontSize: 12,
      marginTop: 20,
    },
    dots: { display: "flex", justifyContent: "center", gap: 6, marginTop: 12 },
    dot: (c) => ({ width: 6, height: 6, borderRadius: "50%", background: c }),
    footer: { marginTop: 28, fontSize: 11, color: "#334155", lineHeight: 1.6 },
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>StudyOS</div>
        <div style={S.badge}>SRM KTR · Striver A2Z + COA + Maths + OS</div>

        <div style={S.h2}>Welcome back</div>
        <div style={S.p}>
          Sign in to access your progress, sync across
          <br />
          devices, and track your DSA journey.
        </div>

        {!ready && !error && (
          <div style={{ color: "#475569", fontSize: 13, marginBottom: 20 }}>Loading…</div>
        )}

        <div style={S.btnWrap}>
          <div ref={btnRef} />
        </div>

        {error && <div style={S.err}>{error}</div>}

        <div style={S.dots}>
          {["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe"].map((c, i) => (
            <div key={i} style={S.dot(c)} />
          ))}
        </div>

        <div style={S.footer}>
          Your progress is saved locally and synced to
          <br />
          the cloud when Cloud Sync is enabled.
        </div>
      </div>
    </div>
  );
}
