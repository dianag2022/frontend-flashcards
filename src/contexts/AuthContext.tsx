"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { SignInResponse } from "@/types/api";

interface AuthUser {
  uid: string;
  email: string;
  role: SignInResponse["role"];
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string, redirectTo?: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: (redirectTo?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function persistSession(response: SignInResponse) {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idToken: response.idToken,
      refreshToken: response.refreshToken,
      user: {
        uid: response.uid,
        email: response.email,
        role: response.role,
      },
    }),
  });
}

async function applyAuthResponse(
  response: SignInResponse,
  setUser: (u: AuthUser) => void,
  setToken: (t: string) => void,
) {
  await persistSession(response);
  setUser({
    uid: response.uid,
    email: response.email,
    role: response.role,
  });
  setToken(response.idToken);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = (await res.json()) as {
            user: AuthUser;
            idToken: string;
          };
          setUser(data.user);
          setToken(data.idToken);
        }
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const signIn = useCallback(
    async (email: string, password: string, redirectTo = "/admin") => {
      const response = await api.signIn({ email, password });
      await applyAuthResponse(response, setUser, setToken);
      router.push(redirectTo);
    },
    [router],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      let response = await fetch("/api/auth/sign-up-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 409) {
        response = await fetch("/api/auth/promote-to-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "No se pudo crear la cuenta.");
      }

      await applyAuthResponse(data as SignInResponse, setUser, setToken);
      router.push("/admin");
    },
    [router],
  );

  const signOut = useCallback(
    async (redirectTo = "/admin/login") => {
      if (token) {
        try {
          await api.signOut(token);
        } catch {
          // ignore sign-out errors
        }
      }
      await fetch("/api/auth/session", { method: "DELETE" });
      setUser(null);
      setToken(null);
      router.push(redirectTo);
    },
    [router, token],
  );

  const value = useMemo(
    () => ({ user, token, loading, signIn, signUp, signOut }),
    [user, token, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
