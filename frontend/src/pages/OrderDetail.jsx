import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

function formatPrice(p) { return new Intl.NumberFormat('ru-RU').format(p) + ' ₽'; }
function formatDate(d) { return new Date(d).toLocaleString('ru-RU'); }

const STATUS_MAP = {
  pending: { label: 'Ожидает подтверждения', color: '#F5A623', icon: '⏳' },
  confirmed: { label: 'Подтверждён', color: '#5D7A61', icon: '✅' },
  shipped: { label: 'Отправлен', color: '#2196F3', icon: '🚚' },
  delivered: { label: 'Доставлен', color: '#4CAF50', icon: '📦' },
  cancelled: { label: 'Отменён', color: '#9E9E9E', icon: '❌' },
};

const PAY_MAP = { card: '💳 Банковская карта', cash: '💵 Наличными', sbp: '📱 СБП' };
const FALLBACK = 'https://via.placeholder.com/70x60?text=IMG';

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const isSuccess = location.state?.success;

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data)).catch(() => setOrder(null)).finally(() => setLoading(false));
  }, [id]);

  if (!user) return <div className="page"><div className="container"><Link to="/login" className="btn btn-primary">Войти</Link></div></div>;
  if (loading) return <div className="spinner" style={{ marginTop: 60 }} />;
  if (!order) return (
    <div className="page"><div className="container"><div className="empty-state"><div className="empty-state-icon">😕</div><h3>Заказ не найден</h3></div></div></div>
  );

  const status = STATUS_MAP[order.status] || STATUS_MAP.pending;

  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumbs">
          <Link to="/orders">Мои заказы</Link><span>›</span><span>Заказ #{order.id}</span>
        </div>

        {isSuccess && (
          <div className="alert alert-success" style={{ fontSize: 15, marginBottom: 20 }}>
            🎉 Заказ успешно оформлен! Мы уведомим вас об изменении статуса.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'flex-start' }}>
          <div>
            {/* Status */}
            <div className="card" style={{ padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 36 }}>{status.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, color: status.color }}>{status.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatDate(order.created_at)}</div>
              </div>
            </div>

            {/* Items */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ padding: '16px 20px', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>
                Товары в заказе
              </div>
              {(order.items || []).map((item, i) => (
                <div key={item.id} style={{ display: 'flex', gap: 14, padding: 16, borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <img src={item.image || FALLBACK} alt="" style={{ width: 70, height: 60, objectFit: 'cover', borderRadius: 6 }}
                    onError={e => e.target.src = FALLBACK} />
                  <div style={{ flex: 1 }}>
                    <Link to={`/product/${item.product_id}`} style={{ fontWeight: 500, display: 'block', marginBottom: 4, color: 'var(--text)' }}>
                      {item.title}
                    </Link>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Продавец: <Link to={`/seller/${item.seller_id}`} style={{ color: 'var(--red)' }}>{item.seller_name}</Link>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>× {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--red)', flexShrink: 0 }}>{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            {/* Delivery */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>📦 Доставка</div>
              <div style={{ fontSize: 14, color: 'var(--text)' }}>{order.address}</div>
            </div>
          </div>

          {/* Summary */}
          <div className="card" style={{ padding: 20, position: 'sticky', top: 80 }}>
            <div style={{ fontWeight: 700, marginBottom: 16 }}>Детали заказа</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Номер заказа</span>
                <span style={{ fontWeight: 500 }}>#{order.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Оплата</span>
                <span style={{ fontWeight: 500 }}>{PAY_MAP[order.payment_method] || order.payment_method}</span>
              </div>
              <div className="divider" style={{ margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Итого</span>
                <span className="price">{formatPrice(order.total_price)}</span>
              </div>
            </div>
            <Link to="/orders" className="btn btn-ghost" style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}>
              ← Все заказы
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
