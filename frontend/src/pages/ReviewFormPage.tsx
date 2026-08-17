import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api/apiClient';

const SAMPLE_SNIPPETS: Record<string, string> = {
  python: `def divide_numbers(a, b):
    # Potential zero division edge case
    return a / b

def fetch_data(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"
    return query`,
  javascript: `function calculateDiscount(price, discount) {
    if (discount = 0.5) { // assignment bug
      return price * discount;
    }
    return price;
}`,
  typescript: `interface User {
  id: string;
  email: string;
}

function parseUser(jsonString: string): User {
  return eval("(" + jsonString + ")"); // dangerous eval
}`,
  go: `package main

import "fmt"

func divide(a, b int) int {
    return a / b
}`,
  sql: `SELECT * FROM accounts WHERE status = 'active' AND balance > 0;`
};

const ReviewFormPage = () => {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(SAMPLE_SNIPPETS.python);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (!code.trim() || Object.values(SAMPLE_SNIPPETS).includes(code)) {
      setCode(SAMPLE_SNIPPETS[newLang] || '');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (code.trim().length < 3) {
      setError('Please provide at least 3 characters of code.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/reviews/', {
        language,
        code
      });

      // Seamlessly transition to the review details page
      navigate(`/reviews/${response.data.id}`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        setError(detail ? String(detail) : 'Failed to submit review. Please try again.');
      } else {
        setError('Unable to submit review. Please check your network connection.');
      }
      setLoading(false);
    }
  };

  const lineCount = code.split('\n').length;
  const charCount = code.length;

  return (
    <main className="page page-review-form">
      <div className="review-form-card">
        <div className="form-header">
          <div>
            <h1>Submit Code for AI Review</h1>
            <p className="form-subtitle">
              Select your programming language and paste your code snippet below.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="review-input-form">
          <div className="form-row">
            <label className="field-group language-field">
              <span className="field-label">Target Language</span>
              <select
                value={language}
                onChange={(event) => handleLanguageChange(event.target.value)}
                disabled={loading}
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="go">Go</option>
                <option value="java">Java</option>
                <option value="cpp">C / C++</option>
                <option value="rust">Rust</option>
                <option value="sql">SQL</option>
                <option value="html">HTML / CSS</option>
                <option value="shell">Bash / Shell</option>
              </select>
            </label>

            <div className="editor-metrics">
              <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
              <span>•</span>
              <span>{charCount} / 50,000 chars</span>
            </div>
          </div>

          <label className="field-group">
            <span className="field-label">Source Code</span>
            <textarea
              className="code-editor-input"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              rows={14}
              placeholder="// Paste your code snippet here..."
              disabled={loading}
              spellCheck={false}
              required
            />
          </label>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="review-loading-panel">
              <div className="spinner"></div>
              <div>
                <strong>Running AI Security & Quality Audit...</strong>
                <p>Analyzing syntax, potential bugs, CVEs, and performance patterns.</p>
              </div>
            </div>
          ) : (
            <div className="form-actions">
              <button type="submit" className="button primary large full-width">
                ⚡ Run Automated Code Review
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
};

export default ReviewFormPage;
