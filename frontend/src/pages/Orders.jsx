import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

function formatPrice(p) { return new Intl.NumberFormat('ru-RU').format(p) + ' ₽'; }
function formatDate(d) { return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); }

const STATUS_MAP = {
  pending: { label: 'Ожидает подтверждения', color: '#F5A623', bg: '#FFF8E7' },
  confirmed: { label: 'Подтверждён', color: '#5D7A61', bg: '#EBF3EC' },
  shipped: { label: 'Отправлен', color: '#2196F3', bg: '#E3F2FD' },
  delivered: { label: 'Доставлен', color: '#4CAF50', bg: '#E8F5E9' },
  cancelled: { label: 'Отменён', color: '#9E9E9E', bg: '#F5F5F5' },
};

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/orders').then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) return <div className="spinner" style={{ marginTop: 60 }} />;

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Мои заказы</h1>
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>Заказов пока нет</h3>
            <p>Перейдите в каталог и сделайте первый заказ</p>
            <Link to="/catalog" className="btn btn-primary" style={{ marginTop: 16 }}>В каталог</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(order => {
              const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
              return (
                <Link key={order.id} to={`/orders/${order.id}`} className="card"
                  style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>Заказ #{order.id}</span>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                        color: status.color, background: status.bg }}>
                        {status.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {formatDate(order.created_at)} · {order.items_count} товар(а/ов)
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="price">{formatPrice(order.total_price)}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Подробнее →</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
