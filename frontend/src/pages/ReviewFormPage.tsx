import { useState } from 'react';
import api from '../api/apiClient';

const ReviewFormPage = () => {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const response = await api.post('/reviews/', {
        language,
        code
      });
      setMessage(`Review created: ${response.data.id}`);
    } catch (err) {
      setError('Unable to submit review. Please try again.');
    }
  };

  return (
    <main className="page page-review-form">
      <div className="auth-card">
        <h1>Submit Code Review</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Language
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
            </select>
          </label>
          <label>
            Code
            <textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              rows={12}
              required
            />
          </label>
          {message ? <div className="success-message">{message}</div> : null}
          {error ? <div className="error-message">{error}</div> : null}
          <button type="submit" className="button primary">Review Code</button>
        </form>
      </div>
    </main>
  );
};

export default ReviewFormPage;
