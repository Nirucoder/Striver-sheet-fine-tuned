import { useState } from "react";
import { supabase } from "./supabase.js";

export default function AuthPage({ onAuth }) {
  const [mode, setMode]         = useState("signin");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!supabase) { setMsg({ err: "Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY." }); return; }
    setLoading(true); setMsg(null);
    try {
      if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.session);
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } }
        });
        if (error) throw error;
        if (data.session) onAuth(data.session);
        else setMsg({ ok: "Check your email for a confirmation link, then sign in." });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });
        if (error) throw error;
        setMsg({ ok: "Password reset link sent — check your email." });
      }
    } catch (err) {
      setMsg({ err: err.message });
    }
    setLoading(false);
  }

  async function handleGoogle() {
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
    if (error) { setMsg({ err: error.message }); setLoading(false); }
  }

  const S = {
    page:   { minHeight:"100vh", background:"#080a0f", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',system-ui,sans-serif" },
    card:   { background:"#0f1117", border:"1px solid #1e2030", borderRadius:16, padding:"40px 36px", width:"100%", maxWidth:400, boxShadow:"0 32px 80px rgba(0,0,0,0.7)" },
    logo:   { fontSize:26, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.02em", marginBottom:4 },
    sub:    { fontSize:13, color:"#475569", marginBottom:32 },
    lbl:    { fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6, display:"block" },
    inp:    { width:"100%", padding:"11px 14px", background:"#1a1d2e", border:"1px solid #2d3154", borderRadius:9, color:"#e2e8f0", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:14, fontFamily:"inherit", transition:"border-color 0.15s" },
    btn:    (primary) => ({
      width:"100%", padding:"12px", borderRadius:9, fontSize:14, fontWeight:600, cursor:"pointer",
      background: primary ? "linear-gradient(135deg,#6366f1,#818cf8)" : "#1a1d2e",
      color: primary ? "#fff" : "#94a3b8",
      border: primary ? "none" : "1px solid #2d3154",
      marginBottom: 10, transition:"opacity 0.15s", opacity: loading ? 0.6 : 1
    }),
    gBtn:   { width:"100%", padding:"11px", borderRadius:9, fontSize:13, fontWeight:600, cursor:"pointer",
      background:"#0f1117", color:"#e2e8f0", border:"1px solid #2d3154", marginBottom:18, display:"flex", alignItems:"center", justifyContent:"center", gap:10 },
    divider:{ display:"flex", alignItems:"center", gap:12, margin:"4px 0 18px", color:"#334155", fontSize:12 },
    line:   { flex:1, height:1, background:"#1e2030" },
    link:   { color:"#818cf8", cursor:"pointer", textDecoration:"none", fontSize:13 },
    msgOk:  { background:"rgba(52,211,153,0.08)", border:"1px solid #065f46", borderRadius:8, padding:"10px 14px", color:"#34d399", fontSize:13, marginBottom:16, lineHeight:1.5 },
    msgErr: { background:"rgba(248,113,113,0.08)", border:"1px solid #7f1d1d", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:13, marginBottom:16, lineHeight:1.5 },
    tabs:   { display:"flex", marginBottom:28, background:"#0a0b0d", borderRadius:9, padding:3, border:"1px solid #1a1d2e" },
    tab:    (active) => ({ flex:1, padding:"8px", textAlign:"center", fontSize:13, fontWeight:600, borderRadius:7, cursor:"pointer",
      background: active ? "#1e1b4b" : "none", color: active ? "#a5b4fc" : "#475569", border:"none", transition:"all 0.15s" }),
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>StudyOS</div>
        <div style={S.sub}>SRM KTR · Striver A2Z Sheet + COA</div>

        {mode !== "forgot" && (
          <div style={S.tabs}>
            <button style={S.tab(mode==="signin")} onClick={() => { setMode("signin"); setMsg(null); }}>Sign In</button>
            <button style={S.tab(mode==="signup")} onClick={() => { setMode("signup"); setMsg(null); }}>Sign Up</button>
          </div>
        )}

        {mode === "forgot" && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", marginBottom:4 }}>Reset Password</div>
            <div style={{ fontSize:12, color:"#64748b" }}>Enter your email and we'll send a reset link</div>
          </div>
        )}

        {msg?.ok  && <div style={S.msgOk}>{msg.ok}</div>}
        {msg?.err && <div style={S.msgErr}>{msg.err}</div>}

        {/* Google OAuth */}
        {mode !== "forgot" && (
          <>
            <button style={S.gBtn} onClick={handleGoogle} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
              Continue with Google
            </button>
            <div style={S.divider}><div style={S.line}/><span>or</span><div style={S.line}/></div>
          </>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <label style={S.lbl}>Full Name</label>
              <input style={S.inp} type="text" placeholder="Your name" value={name}
                onChange={e => setName(e.target.value)} required />
            </>
          )}
          <label style={S.lbl}>Email</label>
          <input style={S.inp} type="email" placeholder="you@example.com" value={email}
            onChange={e => setEmail(e.target.value)} required autoFocus />

          {mode !== "forgot" && (
            <>
              <label style={S.lbl}>Password</label>
              <input style={S.inp} type="password" placeholder={mode==="signup" ? "Min 6 characters" : "Your password"} value={password}
                onChange={e => setPassword(e.target.value)} required minLength={mode==="signup"?6:1} />
            </>
          )}

          <button type="submit" style={S.btn(true)} disabled={loading}>
            {loading ? "Please wait…" : mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
          </button>
        </form>

        <div style={{ textAlign:"center", fontSize:13, color:"#475569", marginTop:4 }}>
          {mode === "signin" && <>
            <span onClick={() => { setMode("forgot"); setMsg(null); }} style={S.link}>Forgot password?</span>
          </>}
          {mode === "forgot" && <>
            <span onClick={() => { setMode("signin"); setMsg(null); }} style={S.link}>← Back to sign in</span>
          </>}
        </div>
      </div>
    </div>
  );
}
