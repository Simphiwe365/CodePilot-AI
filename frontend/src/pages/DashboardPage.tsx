import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/apiClient';

interface UserProfile {
  id: number;
  full_name: string;
  email: string;
}

interface StatsSummary {
  total_reviews: number;
  completed: number;
  failed: number;
  pending: number;
}

const DashboardPage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userRes, statsRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/reviews/stats')
        ]);
        setUser(userRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <main className="page page-dashboard">
      <div className="dashboard-shell">
        <header className="dashboard-hero">
          <div>
            <div className="eyebrow">Developer Workspace</div>
            <h1 className="dashboard-greeting">
              {loading ? 'Welcome back' : `Welcome back, ${user?.full_name || 'Engineer'}`}
            </h1>
            <p className="dashboard-subtext">
              {user?.email ? user.email : 'Submit code snippets for AI-powered automated review'}
            </p>
          </div>
          <Link to="/review/new" className="button primary pulse-btn">
            + New Review
          </Link>
        </header>

        {stats && (
          <section className="stats-quick-bar">
            <div className="quick-stat-card">
              <span className="stat-num">{stats.total_reviews}</span>
              <span className="stat-lbl">Total Reviews</span>
            </div>
            <div className="quick-stat-card success">
              <span className="stat-num">{stats.completed}</span>
              <span className="stat-lbl">Completed</span>
            </div>
            <div className="quick-stat-card warning">
              <span className="stat-num">{stats.pending}</span>
              <span className="stat-lbl">Pending</span>
            </div>
            <div className="quick-stat-card danger">
              <span className="stat-num">{stats.failed}</span>
              <span className="stat-lbl">Failed</span>
            </div>
          </section>
        )}

        <section className="dashboard-grid">
          <article className="dashboard-card primary-card">
            <div className="card-icon-badge">🚀</div>
            <h2>Submit Code Review</h2>
            <p>Paste your Python, JavaScript, TypeScript, Go, or Java code and receive instantaneous deep analysis.</p>
            <Link to="/review/new" className="button primary">
              Start Review →
            </Link>
          </article>

          <article className="dashboard-card">
            <div className="card-icon-badge">📁</div>
            <h2>My Reviews</h2>
            <p>Browse your audit history, inspect severity ratings, and copy refactoring suggestions.</p>
            <Link to="/reviews" className="button outline">
              View History ({stats?.total_reviews ?? '—'})
            </Link>
          </article>

          <article className="dashboard-card">
            <div className="card-icon-badge">📊</div>
            <h2>Review Analytics</h2>
            <p>Analyze programming language distributions, failure rates, and code health indicators over time.</p>
            <Link to="/stats" className="button outline">
              Explore Analytics →
            </Link>
          </article>
        </section>
      </div>
    </main>
  );
};

export default DashboardPage;
