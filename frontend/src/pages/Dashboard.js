import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../App';
import { Tv, Search, Bell, LogOut, Calendar, Clock, Check } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [upcomingEpisodes, setUpcomingEpisodes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);

  // Whistle sound effect using Web Audio API
  const playWhistle = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Whistle sound: sweep from 800Hz to 1200Hz
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.3);
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.type = 'sine';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [upcomingRes, notifRes, favRes] = await Promise.all([
        api.get('/episodes/upcoming'),
        api.get('/notifications'),
        api.get('/shows/favorites')
      ]);
      
      setUpcomingEpisodes(upcomingRes.data);
      
      // Check for new notifications and play whistle
      const newNotifications = notifRes.data;
      const currentUnreadCount = newNotifications.filter(n => !n.read).length;
      
      if (!loading && currentUnreadCount > previousUnreadCount && currentUnreadCount > 0) {
        playWhistle();
        toast.success(`${currentUnreadCount} new notification${currentUnreadCount > 1 ? 's' : ''}!`);
      }
      
      setPreviousUnreadCount(currentUnreadCount);
      setNotifications(newNotifications);
      setFavorites(favRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const markAsWatched = async (episodeId) => {
    try {
      await api.put(`/episodes/${episodeId}/watched`, { watched: true });
      toast.success('Episode marked as watched');
      loadData();
    } catch (error) {
      console.error('Failed to mark as watched:', error);
      toast.error('Failed to update episode');
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      loadData();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <nav className="dashboard-nav">
        <div className="nav-left">
          <div className="logo" onClick={() => navigate('/dashboard')} data-testid="home-logo">
            <Tv size={28} color="#ef4444" />
            <span>WatchWhistle</span>
          </div>
        </div>
        <div className="nav-right">
          <button 
            className="nav-btn" 
            onClick={() => navigate('/search')}
            data-testid="search-button"
          >
            <Search size={20} />
            <span>Search Shows</span>
          </button>
          <button 
            className="nav-btn notification-btn" 
            onClick={() => {
              if (unreadCount > 0 && !showNotifications) {
                playWhistle();
              }
              setShowNotifications(!showNotifications);
            }}
            data-testid="notifications-button"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge" data-testid="notification-count">{unreadCount}</span>
            )}
          </button>
          <div className="user-menu">
            <img src={user.picture} alt={user.name} className="user-avatar" data-testid="user-avatar" />
            <button 
              className="nav-btn" 
              onClick={onLogout}
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
            {notifications.length === 0 ? (
              <p className="empty-state">No notifications yet</p>
            ) : (
              notifications.map(notif => (
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
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="welcome-section" data-testid="welcome-section">
          <h1>Welcome back, {user.name}!</h1>
          <p>Here's what's coming up next</p>
        </div>

        {/* Upcoming Episodes */}
        <section className="section" data-testid="upcoming-section">
          <h2 className="section-title">
            <Calendar size={24} />
            Upcoming Episodes
          </h2>
          {upcomingEpisodes.length === 0 ? (
            <div className="empty-state-card">
              <Tv size={48} />
              <p>No upcoming episodes</p>
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/search')}
                data-testid="add-shows-button"
              >
                Add Shows to Track
              </button>
            </div>
          ) : (
            <div className="episodes-grid">
              {upcomingEpisodes.map(episode => (
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
                      onClick={() => markAsWatched(episode.id)}
                      data-testid={`mark-watched-${episode.id}`}
                    >
                      <Check size={16} />
                      Mark as Watched
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Favorite Shows */}
        <section className="section" data-testid="favorites-section">
          <h2 className="section-title">
            <Tv size={24} />
            Your Shows ({favorites.length})
          </h2>
          {favorites.length === 0 ? (
            <div className="empty-state-card">
              <Search size={48} />
              <p>No shows in your library yet</p>
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/search')}
                data-testid="search-shows-button"
              >
                Search for Shows
              </button>
            </div>
          ) : (
            <div className="shows-grid">
              {favorites.map(show => (
                <div 
                  key={show.id} 
                  className="show-card"
                  onClick={() => navigate(`/show/${show.id}`)}
                  data-testid={`show-${show.id}`}
                >
                  {show.image_url && (
                    <img src={show.image_url} alt={show.name} className="show-image" />
                  )}
                  <div className="show-info">
                    <h3>{show.name}</h3>
                    {show.user_rating && (
                      <div className="rating" data-testid={`rating-${show.id}`}>
                        ⭐ {show.user_rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
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
          top: 72px;
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

        .empty-state-card {
          background: white;
          border-radius: 16px;
          padding: 64px 32px;
          text-align: center;
          color: #6b7280;
        }

        .empty-state-card svg {
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-state-card p {
          font-size: 18px;
          margin-bottom: 24px;
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
          font-size: 14px;
          color: #fbbf24;
          font-weight: 600;
        }

        @media (max-width: 768px) {
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
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
