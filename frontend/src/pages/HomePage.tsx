import { Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const HomePage = () => {
  const authed = isAuthenticated();

  return (
    <main className="page page-home">
      <section className="hero-card">
        <div className="hero-badge">AI-Powered Engineering Assistant</div>
        <h1 className="hero-title">Elevate Your Code Quality Instantly</h1>
        <p className="hero-description">
          Automated code reviews analyzing security vulnerabilities, performance bottlenecks, syntax bugs, and software design quality in seconds.
        </p>

        <div className="actions">
          {authed ? (
            <Link to="/dashboard" className="button primary large">
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/register" className="button primary large">
                Get Started Free
              </Link>
              <Link to="/login" className="button outline large">
                Sign In
              </Link>
            </>
          )}
        </div>

        <div className="hero-features-grid">
          <div className="feature-pill">
            <span className="feature-icon">🛡️</span>
            <div>
              <strong>Security Audit</strong>
              <p>Detect injection, secrets, & CVE risks</p>
            </div>
          </div>
          <div className="feature-pill">
            <span className="feature-icon">🐞</span>
            <div>
              <strong>Bug Detection</strong>
              <p>Identify edge cases & runtime flaws</p>
            </div>
          </div>
          <div className="feature-pill">
            <span className="feature-icon">⚡</span>
            <div>
              <strong>Performance</strong>
              <p>Find memory leaks & slow patterns</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
