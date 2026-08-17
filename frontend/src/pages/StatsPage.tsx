import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/apiClient';

interface StatsData {
  total_reviews: number;
  completed: number;
  failed: number;
  pending: number;
  languages: Record<string, number>;
}

const StatsPage = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/reviews/stats');
        setStats(response.data);
      } catch (err) {
        setError('Unable to load statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const completionRate = stats && stats.total_reviews > 0
    ? Math.round((stats.completed / stats.total_reviews) * 100)
    : 0;

  return (
    <main className="page page-stats">
      <div className="stats-shell">
        <div className="page-header-row">
          <div>
            <h1>Code Review Analytics</h1>
            <p className="page-header-sub">Performance metrics and language breakdown of your reviews</p>
          </div>
          <Link to="/review/new" className="button primary">
            + New Review
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-state-card">
            <div className="spinner"></div>
            <p>Loading analytics...</p>
          </div>
        ) : stats ? (
          <div className="analytics-content">
            <div className="stats-metric-grid">
              <div className="stat-card">
                <span className="stat-card-title">Total Reviews</span>
                <p className="stat-card-value">{stats.total_reviews}</p>
                <span className="stat-card-hint">All time submissions</span>
              </div>
              <div className="stat-card stat-success">
                <span className="stat-card-title">Completed</span>
                <p className="stat-card-value">{stats.completed}</p>
                <span className="stat-card-hint">Successfully reviewed</span>
              </div>
              <div className="stat-card stat-warning">
                <span className="stat-card-title">Pending</span>
                <p className="stat-card-value">{stats.pending}</p>
                <span className="stat-card-hint">In queue</span>
              </div>
              <div className="stat-card stat-danger">
                <span className="stat-card-title">Failed</span>
                <p className="stat-card-value">{stats.failed}</p>
                <span className="stat-card-hint">Execution errors</span>
              </div>
            </div>

            <div className="analytics-sections-grid">
              <div className="analytics-card">
                <h2>Success & Completion Rate</h2>
                <div className="progress-container">
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                  <div className="progress-label-row">
                    <span>Completion Rate</span>
                    <strong>{completionRate}%</strong>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h2>Languages Inspected</h2>
                {Object.keys(stats.languages || {}).length === 0 ? (
                  <p className="text-muted">No language data recorded yet.</p>
                ) : (
                  <div className="languages-tag-cloud">
                    {Object.entries(stats.languages).map(([lang, count]) => (
                      <div key={lang} className="language-chip">
                        <span className="lang-name">{lang}</span>
                        <span className="lang-count">{count} {count === 1 ? 'review' : 'reviews'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default StatsPage;
