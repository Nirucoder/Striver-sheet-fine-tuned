import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import AuthPage from './AuthPage.jsx'

function Root() {
  const [session, setSession] = useState(() => {
    try { const u = localStorage.getItem("studyos_user"); return u ? JSON.parse(u) : null; }
    catch { return null; }
  });

  if (!session) return <AuthPage onAuth={setSession} />;
  return <App session={session} setSession={setSession} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
