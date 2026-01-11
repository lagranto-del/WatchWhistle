import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Mail, Bug, HelpCircle, ArrowLeft } from 'lucide-react';

const Support = () => {
  const navigate = useNavigate();

  return (
    <div className="support-page">
      {/* Header */}
      <nav className="support-nav">
        <button 
          className="back-btn" 
          onClick={() => navigate('/')}
          data-testid="back-button"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="logo" onClick={() => navigate('/')}>
          <Tv size={28} color="#ef4444" />
          <span>WatchWhistle</span>
        </div>
        <div className="nav-spacer"></div>
      </nav>

      <div className="support-content">
        <div className="support-header">
          <h1 data-testid="support-title">WatchWhistle Support</h1>
          <p data-testid="support-subtitle">We're here to help you track your favorite TV shows</p>
        </div>

        <div className="support-sections">
          {/* Contact Section */}
          <div className="support-card" data-testid="contact-section">
            <div className="card-icon">
              <Mail size={32} />
            </div>
            <h2>Contact Us</h2>
            <p>Have a question or need help? Reach out to us:</p>
            <a href="mailto:support@watchwhistle.com" className="contact-link">
              support@watchwhistle.com
            </a>
            <p className="response-time">We typically respond within 24-48 hours</p>
          </div>

          {/* FAQ Section */}
          <div className="support-card" data-testid="faq-section">
            <div className="card-icon">
              <HelpCircle size={32} />
            </div>
            <h2>Frequently Asked Questions</h2>
            
            <div className="faq-item">
              <h3>How do I add a TV show to my favorites?</h3>
              <p>Click "Search Shows" from the dashboard, search for your show, then click "Add to Favorites".</p>
            </div>

            <div className="faq-item">
              <h3>How do I mark an episode as watched?</h3>
              <p>On the dashboard or show details page, click the "Mark as Watched" button next to any episode. You can undo within 5 seconds if you click by mistake!</p>
            </div>

            <div className="faq-item">
              <h3>How do I rate a show?</h3>
              <p>Go to the show's details page and click on the stars (1-10) to rate it. Your rating is saved automatically.</p>
            </div>

            <div className="faq-item">
              <h3>Can I use WatchWhistle on my iPhone?</h3>
              <p>Yes! Open the app in Safari, tap the Share button, and select "Add to Home Screen" to use it like a native app.</p>
            </div>

            <div className="faq-item">
              <h3>How do notifications work?</h3>
              <p>You'll receive in-app notifications when new episodes of your favorite shows are airing. Look for the bell icon with a red badge!</p>
            </div>

            <div className="faq-item">
              <h3>Is WatchWhistle free?</h3>
              <p>Yes! WatchWhistle is completely free to use.</p>
            </div>
          </div>

          {/* Bug Report Section */}
          <div className="support-card" data-testid="bug-section">
            <div className="card-icon">
              <Bug size={32} />
            </div>
            <h2>Report a Bug</h2>
            <p>Found an issue? Help us improve WatchWhistle by reporting bugs:</p>
            
            <div className="bug-report-info">
              <p><strong>Please include:</strong></p>
              <ul>
                <li>What you were trying to do</li>
                <li>What happened instead</li>
                <li>Your device type (iPhone, Android, Computer)</li>
                <li>Your browser (Safari, Chrome, etc.)</li>
                <li>Screenshots if possible</li>
              </ul>
            </div>

            <a href="mailto:support@watchwhistle.com?subject=Bug Report" className="contact-link">
              Email Bug Report
            </a>
          </div>

          {/* Feature Request Section */}
          <div className="support-card">
            <h2>Feature Requests</h2>
            <p>Have an idea to make WatchWhistle better? We'd love to hear it!</p>
            <a href="mailto:support@watchwhistle.com?subject=Feature Request" className="contact-link">
              Suggest a Feature
            </a>
          </div>

          {/* Privacy & Terms */}
          <div className="support-card">
            <h2>Legal & Privacy</h2>
            <p><strong>Privacy:</strong> We respect your privacy. We only collect the information needed to provide our service (email, show preferences).</p>
            <p><strong>Data Usage:</strong> Your data is used solely to personalize your experience and send you notifications about your favorite shows.</p>
            <p><strong>Third-party Services:</strong> We use Google OAuth for authentication and TVMaze API for show information.</p>
            <p><strong>Data Deletion:</strong> Contact us at support@watchwhistle.com to delete your account and data.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .support-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          padding-bottom: 48px;
        }

        .support-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: transparent;
          border: none;
          border-radius: 12px;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          font-family: 'Inter', sans-serif;
        }

        .back-btn:hover {
          background: #f3f4f6;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #ef4444;
          font-size: 22px;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer;
        }

        .nav-spacer {
          width: 100px;
        }

        .support-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 48px 32px;
        }

        .support-header {
          text-align: center;
          margin-bottom: 48px;
          color: white;
        }

        .support-header h1 {
          font-size: clamp(36px, 5vw, 48px);
          font-weight: 700;
          margin-bottom: 12px;
        }

        .support-header p {
          font-size: 18px;
          opacity: 0.9;
        }

        .support-sections {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .support-card {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .card-icon {
          width: 64px;
          height: 64px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ef4444;
          margin-bottom: 24px;
        }

        .support-card h2 {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 16px;
        }

        .support-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .support-card p {
          font-size: 16px;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .contact-link {
          display: inline-block;
          padding: 12px 24px;
          background: #ef4444;
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          transition: background-color 0.2s;
          margin-top: 8px;
        }

        .contact-link:hover {
          background: #dc2626;
        }

        .response-time {
          font-size: 14px !important;
          color: #9ca3af !important;
          margin-top: 12px;
        }

        .faq-item {
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .faq-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .bug-report-info {
          background: #f9fafb;
          padding: 20px;
          border-radius: 12px;
          margin: 16px 0;
        }

        .bug-report-info ul {
          margin-top: 12px;
          padding-left: 24px;
        }

        .bug-report-info li {
          color: #6b7280;
          margin-bottom: 8px;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .support-nav {
            padding: 12px 16px;
          }

          .logo span {
            display: none;
          }

          .nav-spacer {
            display: none;
          }

          .support-content {
            padding: 24px 16px;
          }

          .support-card {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Support;
