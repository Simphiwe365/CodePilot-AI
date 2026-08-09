import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/apiClient';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await api.get('/reviews/');
        setReviews(response.data);
      } catch (err) {
        setError('Unable to load reviews.');
      }
    };

    loadReviews();
  }, []);

  return (
    <main className="page page-reviews">
      <div className="auth-card">
        <h1>My Reviews</h1>
        {error && <div className="error-message">{error}</div>}
        {reviews.length === 0 ? (
          <p>No reviews yet. Start a new review to generate your first report.</p>
        ) : (
          <ul className="review-list">
            {reviews.map((review) => (
              <li key={review.id} className="review-item">
                <strong>{review.language}</strong>
                <span>{review.status}</span>
                <Link to={`/reviews/${review.id}`} className="button secondary">
                  Details
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
};

export default ReviewsPage;
