import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/apiClient';

interface Bug {
  title: string;
  description: string;
  severity?: string;
  line_number?: string | number;
  recommendation?: string;
}

interface SecurityIssue {
  title: string;
  description: string;
  severity?: string;
  cve_or_type?: string;
  recommendation?: string;
}

interface IssueItem {
  title: string;
  description: string;
  recommendation?: string;
}

interface ParsedReview {
  summary: string;
  score: number;
  severity: string;
  bugs: Bug[];
  security_issues: SecurityIssue[];
  performance_issues: IssueItem[];
  quality_issues: IssueItem[];
  suggestions: string[];
}

interface CodeReview {
  id: number;
  language: string;
  code: string;
  status: string;
  review_result: string | null;
  created_at: string;
}

const ReviewDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [review, setReview] = useState<CodeReview | null>(null);
  const [parsed, setParsed] = useState<ParsedReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRawJson, setShowRawJson] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadReview = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/reviews/${id}`);
        const data: CodeReview = response.data;
        setReview(data);

        if (data.review_result) {
          try {
            const json = JSON.parse(data.review_result);
            setParsed({
              summary: json.summary || 'Code analysis complete.',
              score: typeof json.score === 'number' ? json.score : 75,
              severity: json.severity || 'medium',
              bugs: Array.isArray(json.bugs) ? json.bugs : [],
              security_issues: Array.isArray(json.security_issues) ? json.security_issues : [],
              performance_issues: Array.isArray(json.performance_issues) ? json.performance_issues : [],
              quality_issues: Array.isArray(json.quality_issues) ? json.quality_issues : [],
              suggestions: Array.isArray(json.suggestions) ? json.suggestions : []
            });
          } catch {
            setParsed({
              summary: data.review_result,
              score: 70,
              severity: 'medium',
              bugs: [],
              security_issues: [],
              performance_issues: [],
              quality_issues: [],
              suggestions: []
            });
          }
        }
      } catch (err) {
        setError('Unable to load review details.');
      } finally {
        setLoading(false);
      }
    };

    loadReview();
  }, [id]);

  const handleCopyCode = () => {
    if (review?.code) {
      navigator.clipboard.writeText(review.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (error) {
    return (
      <main className="page page-review-detail">
        <div className="detail-error-card">
          <h1>Review Not Found</h1>
          <p className="error-message">{error}</p>
          <Link to="/reviews" className="button secondary">
            ← Back to Reviews
          </Link>
        </div>
      </main>
    );
  }

  if (loading || !review) {
    return (
      <main className="page page-review-detail">
        <div className="loading-state-card">
          <div className="spinner"></div>
          <p>Loading code review report...</p>
        </div>
      </main>
    );
  }

  const scoreClass = (parsed?.score ?? 75) >= 80 ? 'good' : (parsed?.score ?? 75) >= 60 ? 'warning' : 'danger';
  const severityClass = (parsed?.severity || 'medium').toLowerCase();

  return (
    <main className="page page-review-detail">
      <div className="detail-shell">
        <div className="detail-header-nav">
          <Link to="/reviews" className="back-link">
            ← Back to All Reviews
          </Link>
          <span className="review-meta-date">
            Reviewed on {new Date(review.created_at).toLocaleString()}
          </span>
        </div>

        {/* Top Summary Banner */}
        <section className="detail-hero-banner">
          <div className="hero-banner-main">
            <div className="banner-badge-row">
              <span className="language-badge large">{review.language}</span>
              <span className={`status-pill ${review.status}`}>{review.status}</span>
              <span className={`severity-chip ${severityClass}`}>
                {parsed?.severity ? `${parsed.severity.toUpperCase()} RISK` : 'MEDIUM RISK'}
              </span>
            </div>
            <h1>Code Review Report #{review.id}</h1>
            <p className="executive-summary">{parsed?.summary}</p>
          </div>

          <div className={`score-circle-card ${scoreClass}`}>
            <div className="score-circle-inner">
              <span className="score-val">{parsed?.score ?? '—'}</span>
              <span className="score-denom">/ 100</span>
            </div>
            <span className="score-label">Quality Score</span>
          </div>
        </section>

        {/* Findings Grid */}
        <div className="findings-layout">
          {/* Bugs Section */}
          <section className="findings-card">
            <div className="findings-card-header">
              <span className="card-header-icon">🐞</span>
              <h2>Bugs & Potential Defects ({parsed?.bugs.length || 0})</h2>
            </div>
            {parsed?.bugs && parsed.bugs.length > 0 ? (
              <div className="issues-list">
                {parsed.bugs.map((bug, index) => (
                  <div key={index} className="issue-item">
                    <div className="issue-header">
                      <strong>{bug.title}</strong>
                      {bug.line_number && (
                        <span className="line-tag">Line {bug.line_number}</span>
                      )}
                      {bug.severity && (
                        <span className={`severity-tag ${bug.severity.toLowerCase()}`}>
                          {bug.severity}
                        </span>
                      )}
                    </div>
                    <p className="issue-desc">{bug.description}</p>
                    {bug.recommendation && (
                      <div className="issue-rec">
                        <strong>Fix Recommendation:</strong> {bug.recommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="clean-state">✅ No runtime bugs detected in snippet.</p>
            )}
          </section>

          {/* Security Section */}
          <section className="findings-card">
            <div className="findings-card-header">
              <span className="card-header-icon">🛡️</span>
              <h2>Security Vulnerabilities ({parsed?.security_issues.length || 0})</h2>
            </div>
            {parsed?.security_issues && parsed.security_issues.length > 0 ? (
              <div className="issues-list">
                {parsed.security_issues.map((sec, index) => (
                  <div key={index} className="issue-item security">
                    <div className="issue-header">
                      <strong>{sec.title}</strong>
                      {sec.cve_or_type && (
                        <span className="cve-tag">{sec.cve_or_type}</span>
                      )}
                      {sec.severity && (
                        <span className={`severity-tag ${sec.severity.toLowerCase()}`}>
                          {sec.severity}
                        </span>
                      )}
                    </div>
                    <p className="issue-desc">{sec.description}</p>
                    {sec.recommendation && (
                      <div className="issue-rec">
                        <strong>Mitigation:</strong> {sec.recommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="clean-state">✅ No high-risk security flaws identified.</p>
            )}
          </section>

          {/* Performance & Quality */}
          <section className="findings-card">
            <div className="findings-card-header">
              <span className="card-header-icon">⚡</span>
              <h2>Performance & Optimization ({parsed?.performance_issues.length || 0})</h2>
            </div>
            {parsed?.performance_issues && parsed.performance_issues.length > 0 ? (
              <div className="issues-list">
                {parsed.performance_issues.map((perf, index) => (
                  <div key={index} className="issue-item">
                    <div className="issue-header">
                      <strong>{perf.title}</strong>
                    </div>
                    <p className="issue-desc">{perf.description}</p>
                    {perf.recommendation && (
                      <div className="issue-rec">
                        <strong>Optimization:</strong> {perf.recommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="clean-state">✅ Code demonstrates sound performance patterns.</p>
            )}
          </section>

          {/* Suggestions */}
          <section className="findings-card">
            <div className="findings-card-header">
              <span className="card-header-icon">💡</span>
              <h2>Actionable Recommendations ({parsed?.suggestions.length || 0})</h2>
            </div>
            {parsed?.suggestions && parsed.suggestions.length > 0 ? (
              <ul className="suggestions-list">
                {parsed.suggestions.map((sug, index) => (
                  <li key={index} className="suggestion-item">
                    {sug}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="clean-state">No extra suggestions.</p>
            )}
          </section>
        </div>

        {/* Source Code Inspected */}
        <section className="source-code-card">
          <div className="source-code-header">
            <h3>Analyzed Source Code ({review.language})</h3>
            <button onClick={handleCopyCode} className="button outline small">
              {copied ? '✓ Copied' : 'Copy Code'}
            </button>
          </div>
          <pre className="source-code-viewer">{review.code}</pre>
        </section>

        {/* Raw JSON Debug View */}
        <div className="raw-json-toggle-area">
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="button text-subtle small"
          >
            {showRawJson ? 'Hide Raw AI JSON' : 'Show Raw AI JSON Output'}
          </button>

          {showRawJson && (
            <pre className="raw-json-viewer">{review.review_result}</pre>
          )}
        </div>
      </div>
    </main>
  );
};

export default ReviewDetailPage;
