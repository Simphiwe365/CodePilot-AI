import { useEffect, useState } from 'react';
import api from '../api/apiClient';

const StatsPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.get('/reviews/stats');
        setStats(response.data);
      } catch (err) {
        setError('Unable to load statistics.');
      }
    };

    loadStats();
  }, []);

  return (
    <main className="page page-stats">
      <div className="auth-card">
        <h1>Review Statistics</h1>
        {error && <div className="error-message">{error}</div>}
        {stats ? (
          <div className="stats-grid">
            <div className="stat-card">
              <h2>Total Reviews</h2>
              <p>{stats.total_reviews}</p>
            </div>
            <div className="stat-card">
              <h2>Completed</h2>
              <p>{stats.completed_reviews}</p>
            </div>
            <div className="stat-card">
              <h2>Failed</h2>
              <p>{stats.failed_reviews}</p>
            </div>
          </div>
        ) : (
          <p>Loading statistics...</p>
        )}
      </div>
    </main>
  );
};

export default StatsPage;
