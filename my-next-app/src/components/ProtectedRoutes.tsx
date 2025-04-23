import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [oneAdmin, setOneAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Track both promises to know when both are complete
    let authChecked = false;
    let adminChecked = false;

    // Check authentication status
    api.get("/admin/check/Login", { withCredentials: true })
      .then((res) => {
        setIsAuthenticated(res?.status === 200);
      })
      .catch((error) => {
        console.error("Error checking login status:", error);
        setIsAuthenticated(false);
      })
      .finally(() => {
        authChecked = true;
        if (authChecked && adminChecked) setIsLoading(false);
      });

    // Check if admin exists
    api.get("/admin/checkOneAdmin", { withCredentials: true })
      .then((response) => {
        setOneAdmin(response?.data?.hasOneAdmin || false);
      })
      .catch((error) => {
        console.error("Error checking for one admin:", error);
        setOneAdmin(false);
      })
      .finally(() => {
        adminChecked = true;
        if (authChecked && adminChecked) setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to signup if no admin exists
  if (oneAdmin === false) {
    return <Navigate to="/signup" />;
  }

  // Redirect to login if not authenticated
  if (isAuthenticated === false ) {
    return <Navigate to="/" />;
  }

  if(isAuthenticated && oneAdmin === true) {
    
  }

  // If authenticated and admin exists, render the protected routes
  return <Outlet />;
};

export default ProtectedRoutes;