import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';

export default function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/favorites').then(r => setFavorites(r.data)).finally(() => setLoading(false));
  }, [user, navigate]);

  const handleFavoriteToggle = () => {
    api.get('/favorites').then(r => setFavorites(r.data));
  };

  if (loading) return <div className="spinner" style={{ marginTop: 60 }} />;

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
          Избранное {favorites.length > 0 && <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: 18 }}>({favorites.length})</span>}
        </h1>
        {favorites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">♡</div>
            <h3>Список избранного пуст</h3>
            <p>Нажмите ♡ на любом товаре, чтобы сохранить его</p>
            <Link to="/catalog" className="btn btn-primary" style={{ marginTop: 16 }}>В каталог</Link>
          </div>
        ) : (
          <div className="grid-4">
            {favorites.map(p => (
              <ProductCard key={p.id} product={{ ...p, is_favorited: true }} onFavoriteToggle={handleFavoriteToggle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
