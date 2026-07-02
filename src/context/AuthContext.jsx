import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchCurrentUser,
  signInWithGoogle,
  signOut as apiSignOut,
} from "../services/authService.js";

const AuthContext = createContext(null);

/**
 * AuthProvider owns all auth state. It bootstraps once on mount by asking the
 * server who the current user is (via the session cookie), so a fresh page load
 * or a returning visitor is restored without any client-side token handling.
 *
 * status: "loading" | "authenticated" | "unauthenticated"
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    // Remove any legacy client-stored identity from the old token-in-localStorage scheme.
    try {
      localStorage.removeItem("studyos_user");
    } catch {}
    (async () => {
      const current = await fetchCurrentUser();
      if (cancelled) return;
      setUser(current);
      setStatus(current ? "authenticated" : "unauthenticated");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (credential) => {
    const nextUser = await signInWithGoogle(credential);
    setUser(nextUser);
    setStatus("authenticated");
    return nextUser;
  }, []);

  const signOut = useCallback(async () => {
    await apiSignOut();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ user, status, signIn, signOut }),
    [user, status, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
