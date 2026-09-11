import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = "https://svs-jewellery-backend.onrender.com";

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/verify`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        console.log("Verify status:", response.status);

        const data = await response.json();

        console.log("Verify response:", data);

        if (response.ok && data.authenticated) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }

      } catch (error) {
        console.error("Verify error:", error);
        setAuthenticated(false);
      } finally {
        setChecking(false);
      }
    };

    verifyUser();
  }, []);

  if (checking) {
    return <div>Checking authentication...</div>;
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;