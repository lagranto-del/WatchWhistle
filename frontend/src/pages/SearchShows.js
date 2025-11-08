import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../App';
import { Tv, Search, ArrowLeft, Plus, Check } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const SearchShows = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedShows, setAddedShows] = useState(new Set());

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await api.get(`/shows/search?q=${encodeURIComponent(query)}`);
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (showData) => {
    try {
      const show = showData.show;
      await api.post('/shows/favorites', {
        tvmaze_id: show.id,
        name: show.name,
        image_url: show.image?.medium || show.image?.original,
        genres: show.genres || [],
        rating: show.rating?.average,
        premiered: show.premiered,
        status: show.status,
        summary: show.summary
      });
      
      setAddedShows(prev => new Set([...prev, show.id]));
      toast.success(`${show.name} added to favorites!`);
    } catch (error) {
      console.error('Failed to add show:', error);
      if (error.response?.status === 400) {
        toast.info('Show already in favorites');
      } else {
        toast.error('Failed to add show');
      }
    }
  };

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  return (
    <div className="search-page">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <nav className="search-nav">
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
        <div className="nav-spacer"></div>
      </nav>

      <div className="search-content">
        <div className="search-header">
          <h1 data-testid="search-title">Find Your Shows</h1>
          <p data-testid="search-subtitle">Search for TV shows to add to your watchlist</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="search-form" data-testid="search-form">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Search for TV shows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-testid="search-input"
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            data-testid="search-submit-button"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Results */}
        {results.length > 0 && (
          <div className="results-section" data-testid="results-section">
            <h2>Results ({results.length})</h2>
            <div className="results-grid">
              {results.map((item) => {
                const show = item.show;
                const isAdded = addedShows.has(show.id);
                
                return (
                  <div key={show.id} className="result-card" data-testid={`result-${show.id}`}>
                    {show.image?.medium && (
                      <img src={show.image.medium} alt={show.name} className="result-image" />
                    )}
                    <div className="result-content">
                      <h3 className="result-title">{show.name}</h3>
                      <div className="result-meta">
                        {show.premiered && (
                          <span className="result-year">{new Date(show.premiered).getFullYear()}</span>
                        )}
                        {show.genres?.length > 0 && (
                          <span className="result-genres">{show.genres.slice(0, 2).join(', ')}</span>
                        )}
                      </div>
                      {show.rating?.average && (
                        <div className="result-rating">
                          ⭐ {show.rating.average.toFixed(1)}
                        </div>
                      )}
                      {show.summary && (
                        <p className="result-summary">
                          {stripHtml(show.summary).slice(0, 150)}...
                        </p>
                      )}
                      <button
                        className={`btn ${isAdded ? 'btn-success' : 'btn-primary'} btn-sm`}
                        onClick={() => addToFavorites(item)}
                        disabled={isAdded}
                        data-testid={`add-show-${show.id}`}
                      >
                        {isAdded ? (
                          <>
                            <Check size={16} />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus size={16} />
                            Add to Favorites
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <div className="no-results" data-testid="no-results">
            <Search size={48} />
            <p>No shows found. Try a different search term.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .search-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          padding-bottom: 48px;
        }

        .search-nav {
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
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
        }

        .nav-spacer {
          width: 100px;
        }

        .search-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 32px;
        }

        .search-header {
          text-align: center;
          margin-bottom: 48px;
          color: white;
        }

        .search-header h1 {
          font-size: clamp(36px, 5vw, 48px);
          font-weight: 700;
          margin-bottom: 12px;
        }

        .search-header p {
          font-size: 18px;
          opacity: 0.9;
        }

        .search-form {
          display: flex;
          gap: 16px;
          max-width: 800px;
          margin: 0 auto 48px;
        }

        .search-input-wrapper {
          flex: 1;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-input {
          width: 100%;
          padding: 16px 16px 16px 48px;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .search-input:focus {
          outline: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .results-section {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px);
          border-radius: 24px;
          padding: 32px;
        }

        .results-section h2 {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin-bottom: 24px;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .result-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .result-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }

        .result-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
        }

        .result-content {
          padding: 20px;
        }

        .result-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 12px;
        }

        .result-meta {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .result-rating {
          font-size: 14px;
          color: #fbbf24;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .result-summary {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .btn-sm {
          padding: 10px 20px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .no-results {
          text-align: center;
          padding: 64px 32px;
          color: white;
        }

        .no-results svg {
          margin-bottom: 16px;
          opacity: 0.7;
        }

        .no-results p {
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .search-nav {
            padding: 12px 16px;
          }

          .search-content {
            padding: 24px 16px;
          }

          .search-form {
            flex-direction: column;
          }

          .nav-spacer {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchShows;
