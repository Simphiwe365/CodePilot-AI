import { useState } from 'react';
import axios from 'axios';
import api from '../api/apiClient';
import { useNavigate, Link } from 'react-router-dom';
import { TOKEN_KEY } from '../utils/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const form = new FormData();
      form.append('username', email.trim());
      form.append('password', password);

      const response = await api.post('/auth/login', form, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.access_token) {
        localStorage.setItem(TOKEN_KEY, response.data.access_token);
        navigate('/dashboard', { replace: true });
      } else {
        setError('Login succeeded but token was not returned.');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        setError(detail ? String(detail) : 'Invalid email or password.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page page-auth">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your CodePilot AI workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            <span>Email Address</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="button primary full-width" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don’t have an account? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
