import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/apiClient';

const ReviewDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [review, setReview] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReview = async () => {
      if (!id) return;
      try {
        const response = await api.get(`/reviews/${id}`);
        setReview(response.data);
      } catch (err) {
        setError('Unable to load review details.');
      }
    };

    loadReview();
  }, [id]);

  if (error) {
    return (
      <main className="page page-review-detail">
        <div className="auth-card">
          <h1>Review Details</h1>
          <div className="error-message">{error}</div>
        </div>
      </main>
    );
  }

  if (!review) {
    return (
      <main className="page page-review-detail">
        <div className="auth-card">
          <h1>Review Details</h1>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page page-review-detail">
      <div className="auth-card">
        <h1>Review Details</h1>
        <p><strong>Language:</strong> {review.language}</p>
        <p><strong>Status:</strong> {review.status}</p>
        <p><strong>Result:</strong></p>
        <pre>{review.review_result}</pre>
      </div>
    </main>
  );
};

export default ReviewDetailPage;
