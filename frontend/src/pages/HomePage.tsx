import { Link } from 'react-router-dom';

const HomePage = () => (
  <main className="page page-home">
    <section className="hero-card">
      <h1>CodePilot AI</h1>
      <p>AI-powered code review for your team. Login or register to submit code and view reviews.</p>
      <div className="actions">
        <Link to="/login" className="button primary">Login</Link>
        <Link to="/register" className="button secondary">Register</Link>
      </div>
    </section>
  </main>
);

export default HomePage;
