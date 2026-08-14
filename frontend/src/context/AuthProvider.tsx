import { useCallback, useEffect, useMemo, useState } from "react";
import { api, setAccessToken, setAuthLostHandler } from "@/api/client";
import type { User } from "@/shared/types";
import { AuthContext, type AuthState } from "./auth-context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On load, try to trade the refresh cookie for a fresh access token. A
  // failure here just means "not signed in" — it isn't an error worth showing.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = await api.auth.restore();
      if (cancelled) return;
      if (token) {
        try {
          const me = await api.auth.me();
          if (!cancelled) setUser(me);
        } catch {
          setAccessToken(null);
        }
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // If a refresh ever fails mid-session, drop back to signed-out cleanly.
  useEffect(() => {
    setAuthLostHandler(() => {
      setAccessToken(null);
      setUser(null);
    });
    return () => setAuthLostHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user: signedIn } = await api.auth.login({
      email,
      password,
    });
    setAccessToken(accessToken);
    setUser(signedIn);
  }, []);

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      const { accessToken, user: created } = await api.auth.register(input);
      setAccessToken(accessToken);
      setUser(created);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
