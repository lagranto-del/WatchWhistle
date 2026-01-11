import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Search, Bell, LogOut, Calendar, Clock, Check, Star, ArrowLeft, Eye } from 'lucide-react';
import { toast, Toaster } from 'sonner';

// Demo data - Popular TV shows for screenshots
const DEMO_USER = {
  id: 'demo-user',
  name: 'Demo User',
  email: 'demo@watchwhistle.app',
  picture: 'https://ui-avatars.com/api/?name=Demo+User&background=ef4444&color=fff&size=128'
};

const DEMO_SHOWS = [
  {
    id: 'show-1',
    tvmaze_id: 169,
    name: 'Breaking Bad',
    image_url: 'https://static.tvmaze.com/uploads/images/medium_portrait/501/1253519.jpg',
    genres: ['Drama', 'Crime', 'Thriller'],
    rating: 9.5,
    user_rating: 10,
    premiered: '2008-01-20',
    status: 'Ended',
    summary: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.'
  },
  {
    id: 'show-2',
    tvmaze_id: 82,
    name: 'Game of Thrones',
    image_url: 'https://static.tvmaze.com/uploads/images/medium_portrait/498/1245274.jpg',
    genres: ['Drama', 'Adventure', 'Fantasy'],
    rating: 9.3,
    user_rating: 9,
    premiered: '2011-04-17',
    status: 'Ended',
    summary: 'Nine noble families fight for control over the lands of Westeros.'
  },
  {
    id: 'show-3',
    tvmaze_id: 66,
    name: 'The Big Bang Theory',
    image_url: 'https://static.tvmaze.com/uploads/images/medium_portrait/173/433868.jpg',
    genres: ['Comedy'],
    rating: 8.1,
    user_rating: 8,
    premiered: '2007-09-24',
    status: 'Ended',
    summary: 'A woman who moves into an apartment across the hall from two brilliant but socially awkward physicists.'
  },
  {
    id: 'show-4',
    tvmaze_id: 73,
    name: 'The Walking Dead',
    image_url: 'https://static.tvmaze.com/uploads/images/medium_portrait/424/1061900.jpg',
    genres: ['Drama', 'Action', 'Horror'],
    rating: 8.2,
    user_rating: 8.5,
    premiered: '2010-10-31',
    status: 'Ended',
    summary: 'Sheriff Deputy Rick Grimes wakes up from a coma to find a post-apocalyptic world dominated by zombies.'
  },
  {
    id: 'show-5',
    tvmaze_id: 1,
    name: 'Under the Dome',
    image_url: 'https://static.tvmaze.com/uploads/images/medium_portrait/81/202627.jpg',
    genres: ['Drama', 'Science-Fiction', 'Thriller'],
    rating: 6.5,
    user_rating: 7,
    premiered: '2013-06-24',
    status: 'Ended',
    summary: 'An invisible and mysterious force field descends upon a small actual town.'
  },
  {
    id: 'show-6',
    tvmaze_id: 2,
    name: 'Person of Interest',
    image_url: 'https://static.tvmaze.com/uploads/images/medium_portrait/163/407679.jpg',
    genres: ['Action', 'Crime', 'Science-Fiction'],
    rating: 8.8,
    user_rating: 9,
    premiered: '2011-09-22',
    status: 'Ended',
    summary: 'A billionaire software-genius creates a Machine that can predict violent crimes.'
  }
];

const DEMO_UPCOMING_EPISODES = [
  {
    id: 'ep-1',
    show_id: 'show-new-1',
    show_name: 'Stranger Things',
    show_image: 'https://static.tvmaze.com/uploads/images/medium_portrait/449/1122762.jpg',
    season: 5,
    number: 1,
    name: 'Chapter One: The Crawl',
    airdate: '2025-01-15'
  },
  {
    id: 'ep-2',
    show_id: 'show-new-2',
    show_name: 'The Last of Us',
    show_image: 'https://static.tvmaze.com/uploads/images/medium_portrait/446/1115274.jpg',
    season: 2,
    number: 3,
    name: 'Endure and Survive',
    airdate: '2025-01-18'
  },
  {
    id: 'ep-3',
    show_id: 'show-new-3',
    show_name: 'House of the Dragon',
    show_image: 'https://static.tvmaze.com/uploads/images/medium_portrait/536/1340900.jpg',
    season: 3,
    number: 1,
    name: 'Fire and Blood',
    airdate: '2025-01-20'
  },
  {
    id: 'ep-4',
    show_id: 'show-new-4',
    show_name: 'Wednesday',
    show_image: 'https://static.tvmaze.com/uploads/images/medium_portrait/439/1097693.jpg',
    season: 2,
    number: 1,
    name: 'Return to Nevermore',
    airdate: '2025-01-22'
  }
];

const DEMO_NOTIFICATIONS = [
  {
    id: 'notif-1',
    show_name: 'Stranger Things',
    message: '🎬 New episode of Stranger Things airs tomorrow!',
    read: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'notif-2',
    show_name: 'The Last of Us',
    message: '📺 The Last of Us S2E3 is now available to watch',
    read: false,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'notif-3',
    show_name: 'House of the Dragon',
    message: '🐉 House of the Dragon Season 3 premiere next week!',
    read: true,
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
];

const DemoPreview = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [watchedEpisodes, setWatchedEpisodes] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsWatched = (episodeId, episodeName, showName) => {
    setWatchedEpisodes([...watchedEpisodes, episodeId]);
    toast.success(`Marked "${showName} - ${episodeName}" as watched`, {
      duration: 3000
    });
  };

  const markNotificationRead = (notifId) => {
    setNotifications(notifications.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    ));
  };

  const exitDemo = () => {
    navigate('/');
  };

  return (
    <div className="dashboard">
      <Toaster position="top-right" richColors />
      
      {/* Demo Banner */}
      <div className="demo-banner">
        <Eye size={16} />
        <span>Preview Mode - Explore WatchWhistle features</span>
        <button className="demo-exit-btn" onClick={exitDemo}>
          <ArrowLeft size={16} />
          Exit Preview
        </button>
      </div>

      {/* Header */}
      <nav className="dashboard-nav">
        <div className="nav-left">
          <div className="logo" data-testid="home-logo">
            <Tv size={28} color="#ef4444" />
            <span>WatchWhistle</span>
          </div>
        </div>
        <div className="nav-right">
          <button 
            className="nav-btn"
            onClick={() => toast.info('Search feature - Sign in to search for shows!')}
            data-testid="search-button"
          >
            <Search size={20} />
            <span>Search Shows</span>
          </button>
          <button 
            className="nav-btn notification-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
            data-testid="notifications-button"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge" data-testid="notification-count">{unreadCount}</span>
            )}
          </button>
          <div className="user-menu">
            <img src={DEMO_USER.picture} alt={DEMO_USER.name} className="user-avatar" data-testid="user-avatar" />
            <button 
              className="nav-btn" 
              onClick={exitDemo}
              data-testid="logout-button"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="notifications-panel" data-testid="notifications-panel">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <button 
              className="close-btn" 
              onClick={() => setShowNotifications(false)}
              data-testid="close-notifications"
            >
              ×
            </button>
          </div>
          <div className="notifications-list">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                onClick={() => markNotificationRead(notif.id)}
                data-testid={`notification-${notif.id}`}
              >
                <div className="notification-content">
                  <p className="notification-message">{notif.message}</p>
                  <p className="notification-time">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="welcome-section" data-testid="welcome-section">
          <h1>Welcome back, {DEMO_USER.name}!</h1>
          <p>Here's what's coming up next</p>
        </div>

        {/* Upcoming Episodes */}
        <section className="section" data-testid="upcoming-section">
          <h2 className="section-title">
            <Calendar size={24} />
            Upcoming Episodes
          </h2>
          <div className="episodes-grid">
            {DEMO_UPCOMING_EPISODES.filter(ep => !watchedEpisodes.includes(ep.id)).map(episode => (
              <div key={episode.id} className="episode-card" data-testid={`episode-${episode.id}`}>
                {episode.show_image && (
                  <img src={episode.show_image} alt={episode.show_name} className="episode-image" />
                )}
                <div className="episode-info">
                  <h3 className="show-name">{episode.show_name}</h3>
                  <p className="episode-title">
                    S{episode.season}E{episode.number} - {episode.name}
                  </p>
                  <div className="episode-meta">
                    <span className="airdate">
                      <Clock size={16} />
                      {new Date(episode.airdate).toLocaleDateString()}
                    </span>
                  </div>
                  <button 
                    className="btn btn-success btn-sm" 
                    onClick={() => markAsWatched(episode.id, episode.name, episode.show_name)}
                    data-testid={`mark-watched-${episode.id}`}
                  >
                    <Check size={16} />
                    Mark as Watched
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Favorite Shows */}
        <section className="section" data-testid="favorites-section">
          <h2 className="section-title">
            <Tv size={24} />
            Your Shows ({DEMO_SHOWS.length})
          </h2>
          <div className="shows-grid">
            {DEMO_SHOWS.map(show => (
              <div 
                key={show.id} 
                className="show-card"
                onClick={() => toast.info(`${show.name} - Sign in to view full details!`)}
                data-testid={`show-${show.id}`}
              >
                {show.image_url && (
                  <img src={show.image_url} alt={show.name} className="show-image" />
                )}
                <div className="show-info">
                  <h3>{show.name}</h3>
                  {show.user_rating && (
                    <div className="rating" data-testid={`rating-${show.id}`}>
                      <Star size={14} fill="#fbbf24" color="#fbbf24" />
                      {show.user_rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        .demo-banner {
          background: linear-gradient(90deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 500;
        }

        .demo-exit-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          margin-left: 16px;
          transition: background 0.2s;
        }

        .demo-exit-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          padding-bottom: 48px;
        }

        .dashboard-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-left, .nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
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

        .nav-btn {
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

        .nav-btn:hover {
          background: #f3f4f6;
        }

        .notification-btn {
          position: relative;
        }

        .notification-badge {
          position: absolute;
          top: 4px;
          right: 12px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #ef4444;
        }

        .notifications-panel {
          position: fixed;
          top: 110px;
          right: 32px;
          width: 400px;
          max-height: 600px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
          z-index: 200;
          overflow: hidden;
        }

        .notifications-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notifications-header h3 {
          font-size: 18px;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 28px;
          color: #9ca3af;
          cursor: pointer;
          line-height: 1;
        }

        .notifications-list {
          max-height: 540px;
          overflow-y: auto;
        }

        .notification-item {
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .notification-item:hover {
          background: #f9fafb;
        }

        .notification-item.unread {
          background: #eff6ff;
        }

        .notification-message {
          font-size: 14px;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .notification-time {
          font-size: 12px;
          color: #9ca3af;
        }

        .dashboard-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 48px 32px;
        }

        .welcome-section {
          margin-bottom: 48px;
          color: white;
        }

        .welcome-section h1 {
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 700;
          margin-bottom: 8px;
        }

        .welcome-section p {
          font-size: 18px;
          opacity: 0.9;
        }

        .section {
          margin-bottom: 48px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 24px;
          color: white;
        }

        .episodes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .episode-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .episode-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }

        .episode-image {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }

        .episode-info {
          padding: 20px;
        }

        .show-name {
          font-size: 16px;
          font-weight: 600;
          color: #ef4444;
          margin-bottom: 8px;
        }

        .episode-title {
          font-size: 14px;
          color: #1f2937;
          margin-bottom: 12px;
        }

        .episode-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .airdate {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #6b7280;
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .shows-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 24px;
        }

        .show-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .show-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }

        .show-image {
          width: 100%;
          height: 280px;
          object-fit: cover;
        }

        .show-info {
          padding: 16px;
        }

        .show-info h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          color: #fbbf24;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .demo-banner {
            flex-wrap: wrap;
            text-align: center;
            padding: 10px 16px;
            font-size: 12px;
          }

          .demo-exit-btn {
            margin-left: 0;
            margin-top: 8px;
          }

          .dashboard-nav {
            padding: 12px 16px;
          }

          .nav-btn span {
            display: none;
          }

          .dashboard-content {
            padding: 24px 16px;
          }

          .notifications-panel {
            right: 16px;
            left: 16px;
            width: auto;
            top: 150px;
          }
        }

        /* iPad specific */
        @media (min-width: 768px) and (max-width: 1024px) {
          .shows-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .episodes-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default DemoPreview;
