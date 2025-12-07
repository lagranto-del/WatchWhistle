import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../App';
import { ArrowLeft, Tv, Star, Trash2, Check, Share2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';

const ShowDetails = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { showId } = useParams();
  const [show, setShow] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [ratingHover, setRatingHover] = useState(0);

  useEffect(() => {
    loadShowData();
  }, [showId]);

  const loadShowData = async () => {
    try {
      const [favoritesRes, episodesRes] = await Promise.all([
        api.get('/shows/favorites'),
        api.get(`/shows/${showId}/episodes`)
      ]);

      const currentShow = favoritesRes.data.find(s => s.id === showId);
      setShow(currentShow);
      setEpisodes(episodesRes.data);
    } catch (error) {
      console.error('Failed to load show data:', error);
      toast.error('Failed to load show data');
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (rating) => {
    try {
      await api.put(`/shows/favorites/${showId}/rating`, { rating });
      toast.success('Rating saved!');
      loadShowData();
    } catch (error) {
      console.error('Failed to save rating:', error);
      toast.error('Failed to save rating');
    }
  };

  const toggleWatched = async (episodeId, currentStatus, episodeName) => {
    const newStatus = !currentStatus;
    
    try {
      await api.put(`/episodes/${episodeId}/watched`, { watched: newStatus });
      
      // Show toast with undo option
      if (newStatus) {
        toast.success(`Marked "${episodeName}" as watched`, {
          duration: 5000,
          action: {
            label: 'Undo',
            onClick: () => undoWatchStatus(episodeId, episodeName)
          }
        });
      } else {
        toast.success(`Marked "${episodeName}" as unwatched`);
      }
      
      loadShowData();
    } catch (error) {
      console.error('Failed to update episode:', error);
      toast.error('Failed to update episode');
    }
  };

  const undoWatchStatus = async (episodeId, episodeName) => {
    try {
      await api.put(`/episodes/${episodeId}/watched`, { watched: false });
      toast.success(`Undone: "${episodeName}" marked as unwatched`);
      loadShowData();
    } catch (error) {
      console.error('Failed to undo:', error);
      toast.error('Failed to undo');
    }
  };

  const removeShow = async () => {
    if (!window.confirm(`Remove ${show.name} from your favorites?`)) return;

    try {
      await api.delete(`/shows/favorites/${showId}`);
      toast.success('Show removed from favorites');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to remove show:', error);
      toast.error('Failed to remove show');
    }
  };

  const shareShow = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
      await Share.share({
        title: `Check out ${show.name}`,
        text: `I'm watching ${show.name} on WatchWhistle! ${show.summary ? stripHtml(show.summary).slice(0, 100) + '...' : ''}`,
        url: window.location.href,
        dialogTitle: 'Share with friends'
      });
    } catch (error) {
      // User cancelled or share not available
      console.log('Share cancelled or unavailable');
    }
  };

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  const seasons = [...new Set(episodes.map(ep => ep.season))].sort((a, b) => a - b);
  const filteredEpisodes = selectedSeason === 'all' 
    ? episodes 
    : episodes.filter(ep => ep.season === parseInt(selectedSeason));

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="loading-container">
        <p>Show not found</p>
      </div>
    );
  }

  return (
    <div className="show-details">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <nav className="details-nav">
        <button 
          className="back-btn" 
          onClick={() => navigate('/dashboard')}
          data-testid="back-button"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div 
          className="logo" 
          onClick={() => navigate('/dashboard')}
          data-testid="home-logo"
        >
          <Tv size={28} color="#ef4444" />
          <span>WatchWhistle</span>
        </div>
        <div className="nav-actions">
          <button 
            className="share-btn" 
            onClick={shareShow}
            data-testid="share-show-button"
          >
            <Share2 size={20} />
            Share
          </button>
          <button 
            className="home-btn" 
            onClick={() => navigate('/dashboard')}
            data-testid="home-button"
          >
            Home
          </button>
          <button 
            className="delete-btn" 
            onClick={removeShow}
            data-testid="delete-show-button"
          >
            <Trash2 size={20} />
            Remove
          </button>
        </div>
      </nav>

      {/* Show Header */}
      <div className="show-header">
        <div className="show-header-content">
          {show.image_url && (
            <img src={show.image_url} alt={show.name} className="show-poster" data-testid="show-poster" />
          )}
          <div className="show-header-info">
            <h1 data-testid="show-title">{show.name}</h1>
            {show.genres?.length > 0 && (
              <div className="genres" data-testid="show-genres">
                {show.genres.map(genre => (
                  <span key={genre} className="genre-tag">{genre}</span>
                ))}
              </div>
            )}
            {show.premiered && (
              <p className="premiered" data-testid="show-premiered">Premiered: {new Date(show.premiered).getFullYear()}</p>
            )}
            {show.status && (
              <p className="status" data-testid="show-status">Status: {show.status}</p>
            )}
            {show.rating && (
              <p className="tvmaze-rating" data-testid="show-rating">TVMaze Rating: ⭐ {show.rating.toFixed(1)}</p>
            )}
            
            {/* User Rating */}
            <div className="user-rating-section" data-testid="rating-section">
              <p className="rating-label">Your Rating:</p>
              <div className="star-rating">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                  <span
                    key={rating}
                    className={`star ${
                      rating <= (ratingHover || show.user_rating || 0) ? 'filled' : ''
                    }`}
                    onMouseEnter={() => setRatingHover(rating)}
                    onMouseLeave={() => setRatingHover(0)}
                    onClick={() => handleRating(rating)}
                    data-testid={`star-${rating}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              {show.user_rating && (
                <span className="rating-value" data-testid="rating-value">{show.user_rating}/10</span>
              )}
            </div>

            {show.summary && (
              <p className="summary" data-testid="show-summary">{stripHtml(show.summary)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="episodes-section">
        <div className="episodes-header">
          <h2 data-testid="episodes-title">Episodes</h2>
          <div className="season-filter">
            <label htmlFor="season-select">Season:</label>
            <select 
              id="season-select"
              value={selectedSeason} 
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="season-select"
              data-testid="season-select"
            >
              <option value="all">All Seasons</option>
              {seasons.map(season => (
                <option key={season} value={season}>Season {season}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="episodes-list" data-testid="episodes-list">
          {filteredEpisodes.map(episode => (
            <div 
              key={episode.id} 
              className={`episode-item ${episode.watched ? 'watched' : ''}`}
              data-testid={`episode-${episode.id}`}
            >
              <div className="episode-number">
                <span>S{episode.season}E{episode.number}</span>
              </div>
              <div className="episode-details">
                <h3 className="episode-name">{episode.name}</h3>
                {episode.airdate && (
                  <p className="episode-airdate">Aired: {new Date(episode.airdate).toLocaleDateString()}</p>
                )}
                {episode.summary && (
                  <p className="episode-summary">{stripHtml(episode.summary)}</p>
                )}
              </div>
              <button
                className={`watch-btn ${episode.watched ? 'watched' : ''}`}
                onClick={() => toggleWatched(episode.id, episode.watched, episode.name)}
                data-testid={`watch-btn-${episode.id}`}
              >
                <Check size={20} />
                {episode.watched ? 'Watched' : 'Mark Watched'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .show-details {
          min-height: 100vh;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          padding-bottom: 48px;
        }

        .details-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .back-btn, .delete-btn, .share-btn {
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

        .back-btn:hover, .delete-btn:hover, .share-btn:hover {
          background: #f3f4f6;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .home-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #ef4444;
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          font-family: 'Inter', sans-serif;
        }

        .home-btn:hover {
          background: #dc2626;
        }

        .delete-btn {
          color: #ef4444;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #ef4444;
          cursor: pointer;
          font-size: 22px;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
        }

        .show-header {
          padding: 48px 32px;
        }

        .show-header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 48px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px);
          border-radius: 24px;
          padding: 32px;
        }

        .show-poster {
          width: 100%;
          border-radius: 16px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .show-header-info {
          color: white;
        }

        .show-header-info h1 {
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 700;
          margin-bottom: 16px;
        }

        .genres {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .genre-tag {
          padding: 6px 16px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .premiered, .status, .tvmaze-rating {
          font-size: 16px;
          margin-bottom: 8px;
          opacity: 0.9;
        }

        .user-rating-section {
          margin: 24px 0;
          padding: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .rating-label {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .star-rating {
          display: inline-flex;
          gap: 6px;
          font-size: 28px;
          cursor: pointer;
        }

        .rating-value {
          margin-left: 16px;
          font-size: 20px;
          font-weight: 600;
        }

        .summary {
          font-size: 16px;
          line-height: 1.8;
          opacity: 0.95;
          margin-top: 16px;
        }

        .episodes-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .episodes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          color: white;
        }

        .episodes-header h2 {
          font-size: 32px;
          font-weight: 700;
        }

        .season-filter {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .season-filter label {
          font-weight: 500;
        }

        .season-select {
          padding: 10px 16px;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
        }

        .episodes-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .episode-item {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: grid;
          grid-template-columns: 80px 1fr auto;
          gap: 20px;
          align-items: start;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }

        .episode-item:hover {
          transform: translateY(-2px);
        }

        .episode-item.watched {
          opacity: 0.7;
        }

        .episode-number {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          padding: 12px;
          border-radius: 12px;
          text-align: center;
          font-weight: 700;
        }

        .episode-details h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .episode-airdate {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .episode-summary {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
        }

        .watch-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          font-family: 'Inter', sans-serif;
          white-space: nowrap;
        }

        .watch-btn:hover {
          background: #059669;
        }

        .watch-btn.watched {
          background: #6b7280;
        }

        @media (max-width: 768px) {
          .show-header-content {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .episode-item {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .watch-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ShowDetails;
