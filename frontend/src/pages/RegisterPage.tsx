import axios from 'axios';
import { useState } from 'react';
import api from '../api/apiClient';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await api.post('/auth/register', {
        full_name: fullName,
        email,
        password
      });

      navigate('/login');
    } catch (err) {
      const defaultMessage = 'Registration failed. Please try again with a different email.';

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const detail = err.response?.data?.detail ?? err.response?.data ?? err.message;
        setError(detail ? String(detail) : defaultMessage);
        console.error('Registration error', { status, detail, response: err.response?.data });
      } else {
        setError(defaultMessage);
        console.error('Registration error', err);
      }
    }
  };

  return (
    <main className="page page-auth">
      <div className="auth-card">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? <div className="error-message">{error}</div> : null}
          <button type="submit" className="button primary">Register</button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  );
};

export default RegisterPage;
