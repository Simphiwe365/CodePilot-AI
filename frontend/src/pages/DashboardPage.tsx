import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <main className="page page-dashboard">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Welcome back,</p>
            <h1>CodePilot AI</h1>
          </div>
          <button className="button secondary" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <section className="dashboard-grid">
          <article className="dashboard-card">
            <h2>Submit Code Review</h2>
            <p>Send source code to the AI review engine and get feedback.</p>
            <Link to="/review/new" className="button primary">Start Review</Link>
          </article>
          <article className="dashboard-card">
            <h2>My Reviews</h2>
            <p>See all previous reviews and inspect results.</p>
            <Link to="/reviews" className="button secondary">View Reviews</Link>
          </article>
          <article className="dashboard-card">
            <h2>Review Statistics</h2>
            <p>Track totals for completed, failed, and pending reviews.</p>
            <Link to="/stats" className="button secondary">View Stats</Link>
          </article>
        </section>
      </div>
    </main>
  );
};

export default DashboardPage;
