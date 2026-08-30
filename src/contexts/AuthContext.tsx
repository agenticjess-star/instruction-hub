import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { client } from "@/integrations/neon/client";

// Structural session/user types compatible with the Supabase-shaped adapter
// returned by @neondatabase/neon-js (SupabaseAuthAdapter).
export interface AuthUser {
  id: string;
  email?: string;
  [key: string]: unknown;
}

export interface AuthSession {
  user: AuthUser;
  [key: string]: unknown;
}

type AuthContextType = {
  session: AuthSession | null;
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession as AuthSession | null);
      setUser((nextSession?.user as AuthUser) ?? null);
      setLoading(false);
    });

    client.auth.getSession().then(({ data: { session: current } }) => {
      setSession(current as AuthSession | null);
      setUser((current?.user as AuthUser) ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await client.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
