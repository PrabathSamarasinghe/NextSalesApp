"use client"
import React, { useEffect, useState, createContext, ReactNode } from 'react';

// Create context outside the component
export const UserContext = createContext(null);

interface Props {
  children: ReactNode;
}

const AuthenticationProvider: React.FC<Props> = ({ children }) => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const response = await fetch("/api/admin/auth");
        const data = await response.json();
        setRole(data.decoded.role);
      } catch (error) {
        console.error("Error fetching user:", error);
        setRole(null);
      }
    };
    checkRole();
  }, []);

  return (
    <UserContext.Provider value={role}>
      {children}
    </UserContext.Provider>
  );
};

export default AuthenticationProvider;
