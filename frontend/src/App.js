import { useEffect, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import SearchShows from "./pages/SearchShows";
import ShowDetails from "./pages/ShowDetails";
import Support from "./pages/Support";
import Marketing from "./pages/Marketing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DemoPreview from "./pages/DemoPreview";
import "./App.css";

// Capacitor imports with error handling - wrapped in IIFE for better error handling
let StatusBar, Style, SplashScreen;
const initCapacitor = () => {
  try {
    const statusBarModule = require('@capacitor/status-bar');
    StatusBar = statusBarModule.StatusBar;
    Style = statusBarModule.Style;
    const splashModule = require('@capacitor/splash-screen');
    SplashScreen = splashModule.SplashScreen;
  } catch (e) {
    // Running on web or iPad/iPhone without Capacitor plugins
    console.log('Capacitor plugins not available, running in web mode');
  }
};
initCapacitor();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
  timeout: 10000, // Reduced to 10 second timeout for faster failure
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingAuth, setProcessingAuth] = useState(false);
  const [initError, setInitError] = useState(false);

  const checkAuth = useCallback(async () => {
    // Safety timeout - never stay in loading state more than 8 seconds
    const safetyTimeout = setTimeout(() => {
      console.log('Safety timeout triggered - forcing load completion');
      setLoading(false);
      setProcessingAuth(false);
    }, 8000);

    try {
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
          // Not authenticated - this is normal, not an error
          console.log('User not authenticated');
        }
      }
    } catch (error) {
      console.error("Init error:", error);
      setInitError(true);
    } finally {
      clearTimeout(safetyTimeout);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Hide splash screen immediately - with error handling
    const hideSplash = async () => {
      try {
        if (SplashScreen && typeof SplashScreen.hide === 'function') {
          await SplashScreen.hide();
        }
      } catch (e) {
        console.log('Splash screen hide failed:', e);
      }
    };
    hideSplash();

    // Configure status bar for iOS - with better error handling
    const configureStatusBar = async () => {
      try {
        if (StatusBar && Style && typeof StatusBar.setStyle === 'function') {
          await StatusBar.setStyle({ style: Style.Light });
          if (typeof StatusBar.setBackgroundColor === 'function') {
            await StatusBar.setBackgroundColor({ color: '#ef4444' });
          }
        }
      } catch (e) {
        console.log('Status bar config failed:', e);
      }
    };
    configureStatusBar();

    // Start auth check
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Show loading with better UX - includes branding so it doesn't look like just a red screen
  if (loading || processingAuth) {
    return (
      <div className="loading-container" data-testid="loading-screen">
        <div className="loading-brand">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
            <polyline points="17 2 12 7 7 2"></polyline>
          </svg>
          <h1 className="loading-title">WatchWhistle</h1>
        </div>
        <div className="loader"></div>
        <p>Loading your shows...</p>
      </div>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="loading-container" data-testid="error-screen">
        <div className="loading-brand">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
            <polyline points="17 2 12 7 7 2"></polyline>
          </svg>
          <h1 className="loading-title">WatchWhistle</h1>
        </div>
        <p>Having trouble connecting...</p>
        <button 
          className="btn btn-outline" 
          onClick={() => window.location.reload()}
          style={{ marginTop: '20px' }}
        >
          Try Again
        </button>
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
        <Route
          path="/demo"
          element={<DemoPreview />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
