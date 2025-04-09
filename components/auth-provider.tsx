// components/auth-provider.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import Sidebar from "./sidebar";

export function AuthProvider({ children, initialAuth }: { children: ReactNode, initialAuth: boolean }) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);

  useEffect(() => {
    // Sync auth state between server and client
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <>
      {isAuthenticated && <Sidebar />}
      {children}
    </>
  );
}