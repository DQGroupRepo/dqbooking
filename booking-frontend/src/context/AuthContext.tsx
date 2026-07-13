import {
  createContext,
  useState,
  ReactNode
} from "react";

import { Vendor } from "../types/Vendor";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<
    React.SetStateAction<User | null>
  >;
}

export const AuthContext =
  createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] =
    useState<User | null>(null);

  return (
    <AuthContext.Provider
      value={{ user, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};