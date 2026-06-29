import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import AuthPage from "./AuthPage.jsx";
import { getStoredSession } from "./authUtils.js";

function Root() {
  const [session, setSession] = useState(() => getStoredSession());

  if (!session) return <AuthPage onAuth={setSession} />;
  return <App session={session} setSession={setSession} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
