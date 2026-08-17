import axios from 'axios';
import { useState } from 'react';
import api from '../api/apiClient';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', {
        full_name: fullName.trim(),
        email: email.trim(),
        password
      });

      navigate('/login');
    } catch (err) {
      const defaultMessage = 'Registration failed. Please check your inputs or try a different email.';

      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (Array.isArray(detail)) {
          setError(detail.map(d => d.msg || d).join(', '));
        } else {
          setError(detail ? String(detail) : defaultMessage);
        }
      } else {
        setError(defaultMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page page-auth">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create an Account</h1>
          <p className="auth-subtitle">Join CodePilot AI and supercharge your code reviews</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            <span>Full Name</span>
            <input
              type="text"
              placeholder="e.g. Alex Morgan"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </label>
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
              placeholder="At least 6 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="button primary full-width" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
};

export default RegisterPage;
