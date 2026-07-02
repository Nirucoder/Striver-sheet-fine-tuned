import GoogleSignInButton from "./GoogleSignInButton.jsx";

export default function AuthPage() {
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

        <div style={S.btnWrap}>
          <GoogleSignInButton showOneTap />
        </div>

        <div style={S.dots}>
          {["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe"].map((c, i) => (
            <div key={i} style={S.dot(c)} />
          ))}
        </div>

        <div style={S.footer}>
          Your progress is saved on this device and synced to
          <br />
          the cloud automatically while you&apos;re signed in.
        </div>
      </div>
    </div>
  );
}
