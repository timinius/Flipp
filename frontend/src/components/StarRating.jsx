import { useState } from 'react';

export default function StarRating({ value = 0, max = 5, onChange, size = 18 }) {
  const [hovered, setHovered] = useState(0);

  if (!onChange) {
    return (
      <span style={{ display: 'inline-flex', gap: 2 }}>
        {Array.from({ length: max }, (_, i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < Math.round(value) ? '#F5A623' : '#E0E0E0'}>
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
      </span>
    );
  }

  return (
    <span style={{ display: 'inline-flex', gap: 2, cursor: 'pointer' }}>
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          width={size} height={size} viewBox="0 0 24 24"
          fill={(hovered || value) > i ? '#F5A623' : '#E0E0E0'}
          onMouseEnter={() => setHovered(i + 1)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i + 1)}
          style={{ transition: 'fill 0.15s' }}
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </span>
  );
}
