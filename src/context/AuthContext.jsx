import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchCurrentUser,
  signInWithGoogle,
  signOut as apiSignOut,
  migrateLegacySession,
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
    (async () => {
      // 1) Prefer an existing durable cookie session.
      let current = await fetchCurrentUser();
      // 2) Otherwise attempt a one-time migration from the legacy
      //    token-in-localStorage scheme (preserves all local progress).
      if (!current) {
        current = await migrateLegacySession();
      }
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
