import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="privacy-page">
      <nav className="privacy-nav">
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

      <div className="privacy-content">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: November 2024</p>

        <section>
          <h2>Introduction</h2>
          <p>
            WatchWhistle ("we", "our", or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your 
            information when you use our mobile application and website.
          </p>
        </section>

        <section>
          <h2>Information We Collect</h2>
          
          <h3>Personal Information</h3>
          <p>When you sign in to WatchWhistle using Google OAuth, we collect:</p>
          <ul>
            <li>Your email address</li>
            <li>Your name</li>
            <li>Your profile picture</li>
          </ul>

          <h3>Usage Information</h3>
          <p>We collect information about how you use WatchWhistle:</p>
          <ul>
            <li>TV shows you add to your favorites</li>
            <li>Episodes you mark as watched</li>
            <li>Ratings you give to shows</li>
            <li>Your notification preferences</li>
          </ul>

          <h3>Technical Information</h3>
          <ul>
            <li>Device type and operating system</li>
            <li>Browser type and version</li>
            <li>IP address</li>
            <li>Usage timestamps</li>
          </ul>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain the WatchWhistle service</li>
            <li>Authenticate your account and manage sessions</li>
            <li>Track your favorite shows and episode progress</li>
            <li>Send you notifications about new episodes</li>
            <li>Personalize your experience</li>
            <li>Improve our services and develop new features</li>
            <li>Respond to your support requests</li>
          </ul>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <p>WatchWhistle uses the following third-party services:</p>
          
          <h3>Google OAuth</h3>
          <p>
            We use Google OAuth for authentication. When you sign in with Google, 
            you're subject to Google's Privacy Policy. We only receive your basic 
            profile information (email, name, picture) that you authorize.
          </p>

          <h3>TVMaze API</h3>
          <p>
            We use TVMaze API to retrieve TV show information, episode data, and 
            air dates. TVMaze does not collect your personal information through 
            our use of their API.
          </p>

          <h3>MongoDB Database</h3>
          <p>
            We store your data securely in a MongoDB database. Your data is encrypted 
            in transit and at rest.
          </p>
        </section>

        <section>
          <h2>Data Sharing and Disclosure</h2>
          <p>We do NOT sell, trade, or rent your personal information to third parties.</p>
          <p>We may share your information only in the following circumstances:</p>
          <ul>
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and prevent fraud</li>
            <li>With service providers who help us operate our service (under strict confidentiality agreements)</li>
          </ul>
        </section>

        <section>
          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information:
          </p>
          <ul>
            <li>HTTPS encryption for all data transmission</li>
            <li>Secure authentication using Google OAuth</li>
            <li>Encrypted database storage</li>
            <li>Regular security updates and monitoring</li>
          </ul>
          <p>
            However, no method of transmission over the internet is 100% secure. 
            While we strive to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Request correction of inaccurate data</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Data Portability:</strong> Request your data in a portable format</li>
            <li><strong>Withdraw Consent:</strong> Stop using our service at any time</li>
          </ul>
          <p>
            To exercise these rights, contact us at: <a href="mailto:support@watchwhistle.com">support@watchwhistle.com</a>
          </p>
        </section>

        <section>
          <h2>Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active. 
            If you delete your account, we will delete your personal information within 
            30 days, except where we are required to retain it for legal purposes.
          </p>
        </section>

        <section>
          <h2>Children's Privacy</h2>
          <p>
            WatchWhistle is not intended for children under 13 years of age. We do not 
            knowingly collect personal information from children under 13. If you believe 
            we have collected information from a child under 13, please contact us immediately.
          </p>
        </section>

        <section>
          <h2>International Users</h2>
          <p>
            WatchWhistle is available worldwide. Your information may be stored and 
            processed in any country where we maintain facilities. By using our service, 
            you consent to the transfer of information to countries outside your country 
            of residence.
          </p>
        </section>

        <section>
          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of 
            any changes by posting the new Privacy Policy on this page and updating the 
            "Last Updated" date. You are advised to review this Privacy Policy periodically 
            for any changes.
          </p>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, 
            please contact us at:
          </p>
          <p>
            <strong>Email:</strong> <a href="mailto:support@watchwhistle.com">support@watchwhistle.com</a>
          </p>
          <p>
            <strong>App:</strong> WatchWhistle<br/>
            <strong>Website:</strong> https://watchnotify.preview.emergentagent.com
          </p>
        </section>
      </div>

      <style jsx>{`
        .privacy-page {
          min-height: 100vh;
          background: #f9fafb;
        }

        .privacy-nav {
          background: white;
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

        .privacy-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 48px 32px;
          background: white;
          margin-top: 32px;
          margin-bottom: 32px;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        h1 {
          font-size: 42px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
          font-family: 'Space Grotesk', sans-serif;
        }

        .last-updated {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 32px;
        }

        section {
          margin-bottom: 40px;
        }

        h2 {
          font-size: 28px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 16px;
          margin-top: 32px;
          font-family: 'Space Grotesk', sans-serif;
        }

        h3 {
          font-size: 20px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
          margin-top: 20px;
        }

        p {
          font-size: 16px;
          color: #4b5563;
          line-height: 1.8;
          margin-bottom: 16px;
        }

        ul {
          margin-left: 24px;
          margin-bottom: 16px;
        }

        li {
          font-size: 16px;
          color: #4b5563;
          line-height: 1.8;
          margin-bottom: 8px;
        }

        a {
          color: #ef4444;
          text-decoration: none;
          font-weight: 500;
        }

        a:hover {
          text-decoration: underline;
        }

        strong {
          color: #1f2937;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .privacy-nav {
            padding: 12px 16px;
          }

          .logo span {
            display: none;
          }

          .nav-spacer {
            display: none;
          }

          .privacy-content {
            padding: 32px 20px;
            margin: 16px;
          }

          h1 {
            font-size: 32px;
          }

          h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;
