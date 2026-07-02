import { createContext, useState } from "react";

type AuthContextType = {
  user: {
    id: number;
    study_class_id: number | null;
    name: string;
    email: string;
    role: string;
  } | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {


  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(null);

  

}
