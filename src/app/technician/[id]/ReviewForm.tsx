'use client';

import { useState } from 'react';
import { submitReview } from './actions';
import styles from './page.module.css';

export default function ReviewForm({ techProfileId }: { techProfileId: string }) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    if (rating === 0) {
      setError('กรุณาเลือกคะแนน');
      return;
    }
    try {
      await submitReview(formData);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (submitted) {
    return <p className={styles.alreadyReviewed}>ส่งรีวิวสำเร็จ!</p>;
  }

  return (
    <form action={handleSubmit} className={styles.reviewForm}>
      <h3 className={styles.reviewFormTitle}>เขียนรีวิว</h3>
      <input type="hidden" name="techProfileId" value={techProfileId} />
      <input type="hidden" name="rating" value={rating} />

      <div className={styles.starPicker}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`${styles.starBtn} ${star <= (hoveredStar || rating) ? styles.starActive : ''}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
          >
            &#9733;
          </button>
        ))}
        <span className={styles.ratingText}>
          {rating > 0 ? `${rating}/5` : 'เลือกคะแนน'}
        </span>
      </div>

      <textarea
        name="comment"
        className={styles.reviewTextarea}
        placeholder="เขียนความคิดเห็น (ไม่บังคับ)..."
        rows={3}
      />

      {error && <p className={styles.errorText}>{error}</p>}

      <button type="submit" className={styles.submitReviewBtn} disabled={rating === 0}>
        ส่งรีวิว
      </button>
    </form>
  );
}
