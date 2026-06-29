import { useEffect, useRef } from "react";
import { CLIENT_ID, buildSession } from "./authUtils.js";

export default function GoogleReSignIn({ onAuth }) {
  const btnRef = useRef(null);

  useEffect(() => {
    if (!CLIENT_ID) return;

    const handleCredential = ({ credential }) => {
      const session = buildSession(credential);
      localStorage.setItem("studyos_user", JSON.stringify(session));
      onAuth(session);
    };

    const init = () => {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      if (btnRef.current) {
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: "filled_black",
          size: "medium",
          shape: "pill",
          text: "signin_with",
          width: 280,
        });
      }
    };

    if (window.google?.accounts?.id) {
      init();
      return;
    }

    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = init;
    document.head.appendChild(s);
    return () => {
      try {
        document.head.removeChild(s);
      } catch {}
    };
  }, [onAuth]);

  return <div ref={btnRef} style={{ display: "flex", justifyContent: "center", marginTop: 8 }} />;
}
