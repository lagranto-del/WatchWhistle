import React, { useState, useEffect } from 'react';
import { Tv, Bell, Star, Search } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://watchnotify.emergent.host';

const LandingPage = () => {
  const [showAppleSignIn, setShowAppleSignIn] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  useEffect(() => {
    // Only show Apple Sign In on iOS devices
    setShowAppleSignIn(Capacitor.getPlatform() === 'ios');
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // Haptics not available on web
    }
    
    const redirectUrl = `${window.location.origin}/dashboard`;
    const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    
    // Use Safari View Controller on iOS, regular browser on web
    if (Capacitor.getPlatform() === 'ios') {
      await Browser.open({ 
        url: authUrl,
        presentationStyle: 'popover'
      });
    } else {
      window.location.href = authUrl;
    }
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
            data-testid="nav-signin-button"
          >
            Sign In
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
            <button 
              className="btn btn-primary btn-large" 
              onClick={handleGoogleLogin}
              data-testid="google-signin-button"
            >
              <svg className="btn-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            {showAppleSignIn && (
              <button 
                className="btn btn-apple btn-large" 
                onClick={handleAppleSignIn}
                disabled={isAppleLoading}
                data-testid="apple-signin-button"
              >
                <svg className="btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                {isAppleLoading ? 'Signing in...' : 'Continue with Apple'}
              </button>
            )}
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
            <h3>Search & Add Shows</h3>
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
          margin-bottom: 60px;
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
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: clamp(18px, 3vw, 24px);
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 48px;
          max-width: 600px;
        }

        .auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          max-width: 400px;
        }

        .btn-icon {
          margin-right: 8px;
        }

        .btn-large {
          padding: 16px 48px;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .btn-apple {
          background: #000;
          color: white;
          border: none;
        }

        .btn-apple:hover {
          background: #1a1a1a;
        }

        .btn-apple:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .features-section {
          padding: 120px 24px;
          background: white;
        }

        .features-title {
          text-align: center;
          font-size: clamp(36px, 6vw, 48px);
          font-weight: 700;
          margin-bottom: 64px;
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
            padding: 40px 30px;
            margin-bottom: 40px;
          }

          .theater-screen::before {
            width: 30px;
            height: 30px;
          }

          .hero-heading {
            font-size: 24px;
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
