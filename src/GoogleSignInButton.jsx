import { useEffect, useRef, useState } from "react";
import { useAuth } from "./context/AuthContext.jsx";

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let gsiScriptPromise = null;

/**
 * Loads the Google Identity Services script exactly once and resolves when
 * `window.google.accounts.id` is available.
 */
function loadGsiScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gsiScriptPromise) return gsiScriptPromise;
  gsiScriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      gsiScriptPromise = null;
      reject(new Error("Failed to load Google sign-in."));
    };
    document.head.appendChild(s);
  });
  return gsiScriptPromise;
}

/**
 * Shared Google sign-in button. Renders the official GSI button, exchanges the
 * returned credential for an app session through AuthProvider, and reports any
 * error. Used by both the full-page login and the in-app re-sign-in prompt so
 * the Google wiring lives in exactly one place.
 */
export default function GoogleSignInButton({
  buttonOptions,
  showOneTap = false,
  onError,
  onSignedIn,
}) {
  const btnRef = useRef(null);
  const { signIn } = useAuth();
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      const msg = "VITE_GOOGLE_CLIENT_ID is not set.";
      setError(msg);
      onError?.(msg);
      return;
    }

    let cancelled = false;

    const handleCredential = async ({ credential }) => {
      try {
        const user = await signIn(credential);
        onSignedIn?.(user);
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          onError?.(e.message);
        }
      }
    };

    loadGsiScript()
      .then(() => {
        if (cancelled || !btnRef.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: "signin_with",
          logo_alignment: "left",
          width: 320,
          ...buttonOptions,
        });
        if (showOneTap) window.google.accounts.id.prompt();
        setReady(true);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
          onError?.(e.message);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {!ready && !error && (
        <div style={{ color: "#475569", fontSize: 13, marginBottom: 12 }}>Loading…</div>
      )}
      <div ref={btnRef} style={{ display: "flex", justifyContent: "center" }} />
      {error && (
        <div
          style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid #7f1d1d",
            borderRadius: 8,
            padding: "10px 14px",
            color: "#f87171",
            fontSize: 12,
            marginTop: 16,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
