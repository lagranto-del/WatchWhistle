import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Bell, Star, Search, Eye } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { SignInWithApple } from '@capacitor-community/apple-sign-in';
import { GenericOAuth2 } from '@capacitor-community/generic-oauth2';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [showAppleSignIn, setShowAppleSignIn] = useState(false);

  useEffect(() => {
    // Only show Apple Sign In on iOS devices
    setShowAppleSignIn(Capacitor.getPlatform() === 'ios');
  }, []);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // Haptics not available on web
    }
    
    // Check if running on iOS native app
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      try {
        // Use ASWebAuthenticationSession via GenericOAuth2 for in-app authentication
        // This is the Apple-approved method for OAuth
        const oauth2Options = {
          appId: "emergent-google-oauth",
          authorizationBaseUrl: "https://auth.emergentagent.com/",
          accessTokenEndpoint: "",
          scope: "email profile",
          responseType: "token",
          pkceEnabled: false,
          web: {
            redirectUrl: window.location.origin + "/dashboard",
            windowTarget: "_self"
          },
          ios: {
            appId: "emergent-google-oauth",
            responseType: "token",
            redirectUrl: "com.tillywatchwhistle://callback",
            // This ensures ASWebAuthenticationSession is used
            siwaUseScope: true,
          }
        };

        const result = await GenericOAuth2.authenticate(oauth2Options);
        
        if (result && result.access_token_response) {
          // Handle the OAuth response
          const sessionId = result.access_token_response.session_id || result.access_token;
          
          if (sessionId) {
            // Exchange session for our app's auth
            const response = await axios.post(`${API_URL}/api/auth/session`, {}, {
              headers: { "X-Session-ID": sessionId }
            });
            
            if (response.data.user) {
              window.location.href = '/dashboard';
            }
          }
        }
      } catch (error) {
        console.error('OAuth error:', error);
        // Fallback to web-based auth flow
        const redirectUrl = `${window.location.origin}/dashboard`;
        const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
        window.location.href = authUrl;
      }
    } else {
      // Web platform - use standard redirect
      const redirectUrl = `${window.location.origin}/dashboard`;
      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
      window.location.href = authUrl;
    }
    
    // Reset loading state after a short delay
    setTimeout(() => setIsLoading(false), 3000);
  };

  const handleAppleSignIn = async () => {
    if (isAppleLoading) return;
    setIsAppleLoading(true);
    
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
      
      const result = await SignInWithApple.authorize({
        clientId: 'com.tillywatchwhistle',
        redirectURI: `${API_URL}/api/auth/apple-callback`,
        scopes: 'email name',
        state: Math.random().toString(36).substring(7),
        nonce: Math.random().toString(36).substring(7),
      });

      if (result.response && result.response.identityToken) {
        // Send to backend for verification
        const response = await axios.post(`${API_URL}/api/auth/apple-signin`, {
          identityToken: result.response.identityToken,
          user: result.response.user,
          email: result.response.email,
          fullName: result.response.fullName,
        });

        if (response.data.token) {
          // Store auth token and redirect
          localStorage.setItem('authToken', response.data.token);
          window.location.href = '/dashboard';
        }
      }
    } catch (error) {
      console.error('Apple Sign In error:', error);
      // Show user-friendly error
      if (error.message && error.message.includes('canceled')) {
        // User cancelled - do nothing
      } else {
        alert('Sign in with Apple failed. Please try Google Sign In or Preview the app.');
      }
    } finally {
      setIsAppleLoading(false);
    }
  };

  const handlePreviewApp = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Haptics not available on web
    }
    // Navigate to a preview/demo dashboard
    navigate('/marketing');
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="theater-overlay"></div>
        <nav className="navbar">
          <div className="logo">
            <Tv size={32} color="#ef4444" />
            <span>WatchWhistle</span>
          </div>
          <button 
            className="btn btn-outline" 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            data-testid="nav-signin-button"
          >
            {isLoading ? 'Loading...' : 'Sign In'}
          </button>
        </nav>

        <div className="hero-content">
          <div className="theater-screen">
            <h1 data-testid="hero-title" className="screen-title">WatchWhistle</h1>
          </div>
          <h2 className="hero-heading">Never Miss Your Favorite Shows</h2>
          <p className="hero-subtitle" data-testid="hero-subtitle">
            Track your favorite TV shows and get notified when new episodes air
          </p>
          
          <div className="auth-buttons">
            {/* Google Sign In Button */}
            <button 
              className="btn btn-primary btn-large" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              data-testid="google-signin-button"
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="btn-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Apple Sign In Button - Only shows on iOS */}
            {showAppleSignIn && (
              <button 
                className="btn btn-apple btn-large" 
                onClick={handleAppleSignIn}
                disabled={isAppleLoading}
                data-testid="apple-signin-button"
              >
                {isAppleLoading ? (
                  <>
                    <span className="loading-spinner dark"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    Continue with Apple
                  </>
                )}
              </button>
            )}

            {/* Preview App Button */}
            <button 
              className="btn btn-outline-light btn-large" 
              onClick={handlePreviewApp}
              data-testid="preview-app-button"
            >
              <Eye size={20} className="btn-icon" />
              Preview App
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="features-title" data-testid="features-title">Everything You Need</h2>
        <div className="features-grid">
          <div className="feature-card" data-testid="feature-search">
            <div className="feature-icon">
              <Search size={32} color="#ef4444" />
            </div>
            <h3>Search &amp; Add Shows</h3>
            <p>Easily find and add your favorite TV shows from a vast database</p>
          </div>

          <div className="feature-card" data-testid="feature-notifications">
            <div className="feature-icon">
              <Bell size={32} color="#ef4444" />
            </div>
            <h3>Smart Notifications</h3>
            <p>Get notified when new episodes of your shows are about to air</p>
          </div>

          <div className="feature-card" data-testid="feature-tracking">
            <div className="feature-icon">
              <Tv size={32} color="#ef4444" />
            </div>
            <h3>Track Episodes</h3>
            <p>Mark episodes as watched and keep track of your progress</p>
          </div>

          <div className="feature-card" data-testid="feature-rating">
            <div className="feature-icon">
              <Star size={32} color="#ef4444" />
            </div>
            <h3>Rate Shows</h3>
            <p>Rate your favorite shows and keep a personalized watchlist</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          background: #0a0a0a;
        }

        .hero-section {
          min-height: 100vh;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          background-image: url('https://images.unsplash.com/photo-1643553517154-24eb7fd86437?q=80&w=2000');
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .theater-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%);
          z-index: 1;
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 0;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
          font-size: 24px;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
        }

        .hero-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .theater-screen {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          border: 8px solid #333;
          border-radius: 8px;
          padding: 40px 20px;
          margin-bottom: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9);
          position: relative;
          width: 100%;
          max-width: 800px;
          box-sizing: border-box;
        }

        .theater-screen::before {
          content: '';
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 40px;
          background: #ef4444;
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
        }

        .screen-title {
          font-size: clamp(36px, 10vw, 64px);
          font-weight: 700;
          color: #ef4444;
          margin: 0;
          line-height: 1.1;
          text-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .hero-heading {
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 700;
          color: white;
          margin-bottom: 16px;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: clamp(16px, 3vw, 20px);
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 32px;
          max-width: 600px;
        }

        .auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 400px;
        }

        .btn-icon {
          margin-right: 8px;
        }

        .btn-large {
          padding: 16px 32px;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          border-radius: 50px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #ef4444;
          color: white;
          border: none;
        }

        .btn-primary:hover {
          background: #dc2626;
          transform: translateY(-2px);
        }

        .btn-apple {
          background: #000;
          color: white;
          border: none;
        }

        .btn-apple:hover {
          background: #1a1a1a;
          transform: translateY(-2px);
        }

        .btn-outline-light {
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.5);
        }

        .btn-outline-light:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: white;
          transform: translateY(-2px);
        }

        .btn-large:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
        }

        .loading-spinner.dark {
          border-color: rgba(255,255,255,0.3);
          border-top-color: white;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .features-section {
          padding: 100px 24px;
          background: white;
        }

        .features-title {
          text-align: center;
          font-size: clamp(32px, 6vw, 44px);
          font-weight: 700;
          margin-bottom: 56px;
          color: #1a1a1a;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card {
          background: white;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s, box-shadow 0.3s;
          border: 1px solid #f3f4f6;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(239, 68, 68, 0.15);
        }

        .feature-icon {
          width: 64px;
          height: 64px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .feature-card h3 {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #1a1a1a;
        }

        .feature-card p {
          color: #6b7280;
          line-height: 1.6;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 16px 0;
          }

          .logo {
            font-size: 18px;
          }

          .logo svg {
            width: 24px;
            height: 24px;
          }

          .btn-outline {
            padding: 8px 16px;
            font-size: 14px;
          }

          .theater-screen {
            padding: 30px 20px;
            margin-bottom: 30px;
          }

          .theater-screen::before {
            width: 30px;
            height: 30px;
            top: -25px;
          }

          .hero-heading {
            font-size: 22px;
          }

          .hero-subtitle {
            font-size: 14px;
            margin-bottom: 24px;
          }

          .auth-buttons {
            gap: 10px;
          }

          .btn-large {
            padding: 14px 24px;
            font-size: 15px;
          }

          .features-section {
            padding: 60px 16px;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
