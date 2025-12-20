import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import SearchShows from "./pages/SearchShows";
import ShowDetails from "./pages/ShowDetails";
import Support from "./pages/Support";
import Marketing from "./pages/Marketing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import "./App.css";

// Capacitor imports with error handling
let StatusBar, Style, SplashScreen;
try {
  const statusBarModule = require('@capacitor/status-bar');
  StatusBar = statusBarModule.StatusBar;
  Style = statusBarModule.Style;
  const splashModule = require('@capacitor/splash-screen');
  SplashScreen = splashModule.SplashScreen;
} catch (e) {
  // Running on web, Capacitor not available
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
  timeout: 15000, // 15 second timeout
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingAuth, setProcessingAuth] = useState(false);

  useEffect(() => {
    // Configure status bar for iOS
    const configureStatusBar = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#ef4444' });
      } catch (e) {
        // Status bar not available on web
      }
    };
    configureStatusBar();

    const checkAuth = async () => {
      // Check for session_id in URL fragment
      const hash = window.location.hash;
      if (hash && hash.includes("session_id=")) {
        setProcessingAuth(true);
        const sessionId = hash.split("session_id=")[1].split("&")[0];
        
        try {
          const response = await api.post("/auth/session", {}, {
            headers: { "X-Session-ID": sessionId }
          });
          
          setUser(response.data.user);
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error("Auth error:", error);
        } finally {
          setProcessingAuth(false);
        }
      } else {
        // Check existing session
        try {
          const response = await api.get("/auth/me");
          setUser(response.data);
        } catch (error) {
          // Not authenticated
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading || processingAuth) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" /> : <LandingPage />
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/search"
          element={
            user ? (
              <SearchShows user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/show/:showId"
          element={
            user ? (
              <ShowDetails user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/support"
          element={<Support />}
        />
        <Route
          path="/marketing"
          element={<Marketing />}
        />
        <Route
          path="/privacy"
          element={<PrivacyPolicy />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
