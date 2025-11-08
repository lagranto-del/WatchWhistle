import React from 'react';
import { Tv, Bell, Star, Search } from 'lucide-react';

const LandingPage = () => {
  const handleLogin = () => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
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
            onClick={handleLogin}
            data-testid="login-button"
          >
            Sign In with Google
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
          <button 
            className="btn btn-primary btn-large" 
            onClick={handleLogin}
            data-testid="get-started-button"
          >
            Get Started Free
          </button>
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
          padding: 60px 100px;
          margin-bottom: 60px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9);
          position: relative;
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
          font-size: clamp(48px, 8vw, 72px);
          font-weight: 700;
          color: #ef4444;
          margin: 0;
          line-height: 1.1;
          text-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
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

        .btn-large {
          padding: 16px 48px;
          font-size: 18px;
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
      `}</style>
    </div>
  );
};

export default LandingPage;
