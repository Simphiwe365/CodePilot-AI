import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../utils/auth';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const authed = isAuthenticated();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to={authed ? '/dashboard' : '/'} className="navbar-brand">
          <span className="brand-badge">⚡</span>
          <span className="brand-name">CodePilot <span className="brand-accent">AI</span></span>
        </Link>

        <nav className="navbar-links">
          {authed ? (
            <>
              <Link
                to="/dashboard"
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                to="/review/new"
                className={`nav-link ${location.pathname === '/review/new' ? 'active' : ''}`}
              >
                Submit Review
              </Link>
              <Link
                to="/reviews"
                className={`nav-link ${location.pathname === '/reviews' ? 'active' : ''}`}
              >
                My Reviews
              </Link>
              <Link
                to="/stats"
                className={`nav-link ${location.pathname === '/stats' ? 'active' : ''}`}
              >
                Statistics
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="button primary small"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        {authed && (
          <div className="navbar-actions">
            <button onClick={handleLogout} className="button outline small">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
