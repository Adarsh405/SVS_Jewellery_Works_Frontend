
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ProtectedRoute.css";

const API_URL = "https://svs-jewellery-works-backend.onrender.com";

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const verifyUser = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/verify`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!mounted) return;

        setAuthenticated(
          response.ok && data.authenticated
        );
      } catch (error) {
        console.error("Verify error:", error);

        if (mounted) {
          setAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    };

    verifyUser();

    return () => {
      mounted = false;
    };
  }, []);

  if (checking) {
    return <SVSLoader />;
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

const SVSLoader = () => {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercentage((prev) => {
        if (prev >= 95) return 95;

        const increment =
          prev < 40 ? 3 :
          prev < 75 ? 1.5 : 0.5;

        return Math.min(
          95,
          prev + increment
        );
      });
    }, 90);

    return () => clearInterval(interval);
  }, []);

  const messages = [
    "Preparing your luxury experience",
    "Securing your jewellery collection",
    "Verifying administrator credentials",
    "Connecting to SVS secure systems",
    "Almost ready..."
  ];

  const messageIndex = Math.min(
    Math.floor(percentage / 20),
    messages.length - 1
  );

  return (
    <div className="svs-loader">
      <div className="loader-glow glow-one"></div>
      <div className="loader-glow glow-two"></div>

      <div className="svs-loader-content">

        <div className="svs-logo-wrapper">

          <div className="svs-orbit orbit-one"></div>
          <div className="svs-orbit orbit-two"></div>

          <div className="svs-logo">
            <span>SVS</span>
            <div className="logo-line"></div>
            <small>JEWELLERY</small>
          </div>

        </div>

        <h2 className="loader-heading">
          Welcome to <span>SVS</span>
        </h2>

        <p className="loader-subheading">
          A World of Elegance & Trust
        </p>

        <div className="loader-progress-section">

          <div className="loader-percentage">
            <span>{Math.floor(percentage)}</span>
            <small>%</small>
          </div>

          <div className="loader-progress-track">
            <div
              className="loader-progress-fill"
              style={{
                width: `${percentage}%`
              }}
            ></div>
          </div>

        </div>

        <p className="loader-message" key={messageIndex}>
          {messages[messageIndex]}
        </p>

        <div className="loader-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="loader-footer">
          <span>✦</span>
          SECURE ADMIN ACCESS
          <span>✦</span>
        </div>

      </div>
    </div>
  );
};

export default ProtectedRoute;
