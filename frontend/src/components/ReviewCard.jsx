import StarRating from './StarRating';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Сегодня';
  if (days === 1) return 'Вчера';
  if (days < 30) return `${days} дн. назад`;
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ReviewCard({ review }) {
  const initials = (review.reviewer_name || 'П').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{
        width: 42, height: 42, borderRadius: '50%', background: 'var(--green)', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600,
        fontSize: 14, flexShrink: 0,
      }}>
        {review.reviewer_avatar
          ? <img src={review.reviewer_avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" />
          : initials
        }
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{review.reviewer_name}</span>
          <StarRating value={review.rating} size={14} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 'auto' }}>{timeAgo(review.created_at)}</span>
        </div>
        {review.product_title && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Товар: {review.product_title}
          </div>
        )}
        {review.comment && (
          <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{review.comment}</p>
        )}
      </div>
    </div>
  );
}
