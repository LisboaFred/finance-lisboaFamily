import { createContext, useContext, useState, useEffect } from "react";

type AuthContextType = {
  isLogged: boolean;
  login: (token: string, user: object) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLogged, setIsLogged] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    // Atualiza estado ao mudar token em outras abas/janelas
    const syncLogin = () => setIsLogged(!!localStorage.getItem("token"));
    window.addEventListener("storage", syncLogin);
    return () => window.removeEventListener("storage", syncLogin);
  }, []);

  function login(token: string) {
    localStorage.setItem("token", token);
    setIsLogged(true);
  }
  function logout() {
    localStorage.removeItem("token");
    setIsLogged(false);
  }

  return (
    <AuthContext.Provider value={{ isLogged, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return context;
}
