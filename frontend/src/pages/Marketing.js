import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Bell, Star, Search, Check, Calendar, Users, Smartphone, Zap } from 'lucide-react';

const Marketing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="marketing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <nav className="navbar">
          <div className="logo" onClick={() => navigate('/')}>
            <Tv size={32} color="#ef4444" />
            <span>WatchWhistle</span>
          </div>
          <div className="nav-buttons">
            <button className="btn btn-outline" onClick={() => navigate('/support')}>
              Support
            </button>
            <button className="btn btn-primary" onClick={handleGetStarted}>
              Get Started
            </button>
          </div>
        </nav>

        <div className="hero-content">
          <h1 className="hero-title">Never Miss Another Episode</h1>
          <p className="hero-subtitle">
            Track all your favorite TV shows in one place. Get notified when new episodes air.
            Rate, review, and keep your watchlist organized.
          </p>
          <button className="btn btn-large btn-primary" onClick={handleGetStarted}>
            Start Tracking
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Everything You Need to Track Your Shows</h2>
          <p>A complete TV show tracking solution built for binge-watchers</p>
        </div>

        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">
              <Search size={32} />
            </div>
            <h3>Massive Show Database</h3>
            <p>Search from thousands of TV shows. From current hits to classic series, we've got them all.</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <Bell size={32} />
            </div>
            <h3>Smart Notifications</h3>
            <p>Get alerted when new episodes of your favorite shows air. Never miss a premiere again.</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <Check size={32} />
            </div>
            <h3>Track Your Progress</h3>
            <p>Mark episodes as watched and keep track of where you are in each series.</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <Star size={32} />
            </div>
            <h3>Rate & Review</h3>
            <p>Rate shows on a 10-star scale. Remember which shows you loved and which to skip.</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <Calendar size={32} />
            </div>
            <h3>Upcoming Episodes</h3>
            <p>See all upcoming episodes from your shows in one organized timeline.</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <Smartphone size={32} />
            </div>
            <h3>Works Everywhere</h3>
            <p>Use on iPhone, Android, or any browser. Add to your home screen like a native app.</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="section-header">
          <h2>Why Choose WatchWhistle?</h2>
        </div>

        <div className="benefits-container">
          <div className="benefit-card">
            <Zap className="benefit-icon" size={40} />
            <h3>Simple & Fast</h3>
            <p>No complicated setup. Sign in with Google and start tracking in seconds.</p>
          </div>

          <div className="benefit-card">
            <Users className="benefit-icon" size={40} />
            <h3>Full Access</h3>
            <p>All features included. No hidden fees, no premium tiers, no surprises.</p>
          </div>

          <div className="benefit-card">
            <Tv className="benefit-icon" size={40} />
            <h3>Beautiful Design</h3>
            <p>Gorgeous interface inspired by movie theaters. Tracking shows has never looked this good.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Get started in 3 simple steps</p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Sign Up Free</h3>
            <p>Create your account in seconds with Google sign-in. No complicated forms.</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Add Your Shows</h3>
            <p>Search for your favorite TV shows and add them to your personalized watchlist.</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Never Miss an Episode</h3>
            <p>Get notified when new episodes air. Track your progress and rate your favorites.</p>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="social-proof-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">10,000+</div>
            <div className="stat-label">TV Shows</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100%</div>
            <div className="stat-label">Free Forever</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">⭐⭐⭐⭐⭐</div>
            <div className="stat-label">User Rated</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Tracking?</h2>
          <p>Join WatchWhistle today and never miss another episode of your favorite shows.</p>
          <button className="btn btn-large btn-primary" onClick={handleGetStarted}>
            Get Started Free
          </button>
          <p className="cta-note">Takes less than 30 seconds • No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <Tv size={28} color="#ef4444" />
              <span>WatchWhistle</span>
            </div>
            <p>Track your favorite TV shows and never miss an episode.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
              <a href="/support" onClick={(e) => { e.preventDefault(); navigate('/support'); }}>Support</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="/support">Privacy Policy</a>
              <a href="/support">Terms of Service</a>
            </div>
            <div className="footer-column">
              <h4>Contact</h4>
              <a href="mailto:support@watchwhistle.com">support@watchwhistle.com</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 WatchWhistle. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        .marketing-page {
          min-height: 100vh;
          background: #ffffff;
        }

        /* Hero Section */
        .hero-section {
          min-height: 100vh;
          background-image: url('https://images.unsplash.com/photo-1643553517154-24eb7fd86437?q=80&w=2000');
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%);
          z-index: 1;
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 48px;
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
          cursor: pointer;
        }

        .nav-buttons {
          display: flex;
          gap: 16px;
        }

        .btn {
          padding: 12px 28px;
          border-radius: 50px;
          border: none;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          font-family: 'Space Grotesk', sans-serif;
        }

        .btn:hover {
          transform: translateY(-2px);
        }

        .btn-primary {
          background: #ef4444;
          color: white;
        }

        .btn-primary:hover {
          background: #dc2626;
          box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
        }

        .btn-outline {
          background: transparent;
          border: 2px solid white;
          color: white;
        }

        .btn-outline:hover {
          background: white;
          color: #ef4444;
        }

        .btn-large {
          padding: 18px 48px;
          font-size: 18px;
        }

        .hero-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 48px 24px;
          position: relative;
          z-index: 2;
        }

        .hero-title {
          font-size: clamp(40px, 8vw, 72px);
          font-weight: 700;
          color: white;
          margin-bottom: 24px;
          line-height: 1.1;
          max-width: 900px;
        }

        .hero-subtitle {
          font-size: clamp(18px, 3vw, 24px);
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 48px;
          max-width: 700px;
          line-height: 1.6;
        }

        .hero-note {
          margin-top: 16px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        /* Features Section */
        .features-section {
          padding: 120px 48px;
          background: white;
        }

        .section-header {
          text-align: center;
          margin-bottom: 64px;
        }

        .section-header h2 {
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 16px;
        }

        .section-header p {
          font-size: 20px;
          color: #6b7280;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 48px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-item {
          text-align: center;
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ef4444;
          margin: 0 auto 24px;
        }

        .feature-item h3 {
          font-size: 24px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .feature-item p {
          font-size: 16px;
          color: #6b7280;
          line-height: 1.6;
        }

        /* Benefits Section */
        .benefits-section {
          padding: 120px 48px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .benefits-section .section-header h2 {
          color: white;
        }

        .benefits-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 48px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .benefit-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          transition: transform 0.3s;
        }

        .benefit-card:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.15);
        }

        .benefit-icon {
          color: white;
          margin-bottom: 24px;
        }

        .benefit-card h3 {
          font-size: 24px;
          font-weight: 600;
          color: white;
          margin-bottom: 12px;
        }

        .benefit-card p {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
        }

        /* How It Works Section */
        .how-it-works-section {
          padding: 120px 48px;
          background: #f9fafb;
        }

        .steps-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
          flex-wrap: wrap;
        }

        .step-card {
          flex: 1;
          min-width: 250px;
          background: white;
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .step-number {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 700;
          margin: 0 auto 24px;
        }

        .step-card h3 {
          font-size: 22px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .step-card p {
          font-size: 16px;
          color: #6b7280;
          line-height: 1.6;
        }

        .step-arrow {
          font-size: 48px;
          color: #ef4444;
          font-weight: 300;
        }

        /* Social Proof Section */
        .social-proof-section {
          padding: 80px 48px;
          background: white;
        }

        .stats-container {
          display: flex;
          justify-content: center;
          gap: 80px;
          flex-wrap: wrap;
          max-width: 1000px;
          margin: 0 auto;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 48px;
          font-weight: 700;
          color: #ef4444;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 18px;
          color: #6b7280;
        }

        /* CTA Section */
        .cta-section {
          padding: 120px 48px;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        }

        .cta-content {
          text-align: center;
          max-width: 700px;
          margin: 0 auto;
        }

        .cta-content h2 {
          font-size: clamp(36px, 6vw, 56px);
          font-weight: 700;
          color: white;
          margin-bottom: 24px;
        }

        .cta-content p {
          font-size: 20px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 40px;
        }

        .cta-note {
          margin-top: 16px !important;
          font-size: 14px !important;
          color: rgba(255, 255, 255, 0.7) !important;
        }

        /* Footer */
        .footer {
          background: #1a1a1a;
          padding: 60px 48px 24px;
          color: white;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto 48px;
          gap: 48px;
          flex-wrap: wrap;
        }

        .footer-brand {
          max-width: 300px;
        }

        .footer-brand .logo {
          margin-bottom: 16px;
        }

        .footer-brand p {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
        }

        .footer-links {
          display: flex;
          gap: 64px;
        }

        .footer-column h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          color: white;
        }

        .footer-column a {
          display: block;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          margin-bottom: 12px;
          transition: color 0.2s;
        }

        .footer-column a:hover {
          color: #ef4444;
        }

        .footer-bottom {
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.5);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .navbar {
            padding: 16px 24px;
          }

          .features-section,
          .benefits-section,
          .how-it-works-section,
          .cta-section {
            padding: 60px 24px;
          }

          .step-arrow {
            display: none;
          }

          .footer {
            padding: 40px 24px 24px;
          }

          .footer-links {
            flex-direction: column;
            gap: 32px;
          }
        }
      `}</style>
    </div>
  );
};

export default Marketing;
