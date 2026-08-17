import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/apiClient';

interface ReviewItem {
  id: number;
  language: string;
  code: string;
  status: string;
  review_result: string | null;
  created_at: string;
}

const ReviewsPage = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reviews/');
      setReviews(response.data);
    } catch (err) {
      setError('Unable to load reviews. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this code review?')) {
      return;
    }

    try {
      setDeletingId(id);
      await api.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert('Failed to delete review. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getScore = (resultText: string | null) => {
    if (!resultText) return null;
    try {
      const parsed = JSON.parse(resultText);
      return typeof parsed.score === 'number' ? parsed.score : null;
    } catch {
      return null;
    }
  };

  return (
    <main className="page page-reviews">
      <div className="reviews-shell">
        <div className="page-header-row">
          <div>
            <h1>My Code Reviews</h1>
            <p className="page-header-sub">History of all AI automated code inspections and findings</p>
          </div>
          <Link to="/review/new" className="button primary">
            + New Review
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-state-card">
            <div className="spinner"></div>
            <p>Loading your reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon">📝</div>
            <h2>No code reviews yet</h2>
            <p>Paste a snippet of code in Python, JavaScript, or any language to get instant AI feedback.</p>
            <Link to="/review/new" className="button primary">
              Submit First Review
            </Link>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.map((review) => {
              const score = getScore(review.review_result);
              const preview = review.code.split('\n').slice(0, 3).join('\n');
              const dateStr = new Date(review.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <article key={review.id} className="review-card">
                  <div className="review-card-top">
                    <div className="card-badge-row">
                      <span className="language-badge">{review.language}</span>
                      <span className={`status-pill ${review.status}`}>
                        {review.status}
                      </span>
                    </div>
                    {score !== null && (
                      <div className={`score-badge ${score >= 80 ? 'good' : score >= 60 ? 'warning' : 'danger'}`}>
                        Score {score}/100
                      </div>
                    )}
                  </div>

                  <pre className="code-preview-snippet">{preview}</pre>

                  <div className="review-card-footer">
                    <span className="review-date">{dateStr}</span>
                    <div className="card-actions">
                      <button
                        onClick={(e) => handleDelete(review.id, e)}
                        className="button text-danger small"
                        disabled={deletingId === review.id}
                        title="Delete Review"
                      >
                        {deletingId === review.id ? 'Deleting...' : 'Delete'}
                      </button>
                      <Link to={`/reviews/${review.id}`} className="button primary small">
                        View Report →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default ReviewsPage;
