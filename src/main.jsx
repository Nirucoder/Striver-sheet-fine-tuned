import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import AuthPage from './AuthPage.jsx'

function Root() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/user", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(user => {
        if (user) {
          setSession({
            name: [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || "User",
            email: user.email,
            picture: user.profile_image_url,
            sub: user.id,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:"#080a0f", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ color:"#475569", fontFamily:"'Inter',system-ui,sans-serif", fontSize:14 }}>Loading…</div>
      </div>
    );
  }

  if (!session) return <AuthPage onAuth={setSession} />;
  return <App session={session} setSession={setSession} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
