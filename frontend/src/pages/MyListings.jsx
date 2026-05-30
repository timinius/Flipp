import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

function formatPrice(p) { return new Intl.NumberFormat('ru-RU').format(p) + ' ₽'; }
function formatDate(d) { return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }); }
const FALLBACK = 'https://via.placeholder.com/80x70?text=IMG';

const STATUS_LABELS = { active: { label: 'Активно', color: 'var(--green)', bg: '#EBF3EC' }, archived: { label: 'Архив', color: '#777', bg: '#F5F5F5' }, sold: { label: 'Продано', color: '#F5A623', bg: '#FFF8E7' } };

export default function MyListings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get(`/products?seller_id=${user.id}&limit=100&sort=new`).then(r => setProducts(r.data.products || [])).finally(() => setLoading(false));
  }, [user, navigate]);

  const handleDelete = async (productId) => {
    if (!confirm('Удалить объявление?')) return;
    setDeleting(productId);
    try {
      await api.delete(`/products/${productId}`);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (e) {
      alert(e.response?.data?.error || 'Ошибка удаления');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="spinner" style={{ marginTop: 60 }} />;

  const filtered = products.filter(p => p.status === filter || filter === 'all');

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Мои объявления</h1>
          <Link to="/sell" className="btn btn-primary">+ Новое объявление</Link>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[['all', `Все (${products.length})`], ['active', `Активные (${products.filter(p => p.status === 'active').length})`], ['archived', `Архив (${products.filter(p => p.status === 'archived').length})`], ['sold', `Проданные (${products.filter(p => p.status === 'sold').length})`]].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`btn ${filter === val ? 'btn-primary' : 'btn-ghost'} btn-sm`}>{label}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>Объявлений нет</h3>
            <Link to="/sell" className="btn btn-primary" style={{ marginTop: 16 }}>Разместить объявление</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(product => {
              const s = STATUS_LABELS[product.status] || STATUS_LABELS.active;
              return (
                <div key={product.id} className="card" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
                  <img src={product.primary_image || product.image || FALLBACK} alt=""
                    style={{ width: 90, height: 75, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                    onError={e => e.target.src = FALLBACK}
                  />
                  <div style={{ flex: 1 }}>
                    <Link to={`/product/${product.id}`} style={{ fontWeight: 600, color: 'var(--text)', fontSize: 15, display: 'block', marginBottom: 4 }}>
                      {product.title}
                    </Link>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                      <span>👁 {product.views}</span>
                      <span>♡ {product.likes_count}</span>
                      <span>📅 {formatDate(product.created_at)}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className="price" style={{ marginBottom: 6, fontSize: 16 }}>{formatPrice(product.price)}</div>
                    <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500, color: s.color, background: s.bg }}>{s.label}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    <Link to={`/edit/${product.id}`} className="btn btn-outline btn-sm">Редактировать</Link>
                    <button onClick={() => handleDelete(product.id)} disabled={deleting === product.id}
                      className="btn btn-sm" style={{ background: 'none', border: '1.5px solid var(--border)', color: 'var(--red)', transition: 'background 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FDECEA'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
                      {deleting === product.id ? '...' : 'Удалить'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
