import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export default function AddProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', price: '', category_id: '', condition: 'new', city: user?.city || 'Москва', stock: 1 });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
  }, []);

  if (!user) return (
    <div className="page"><div className="container">
      <div className="empty-state"><div className="empty-state-icon">🔒</div>
        <h3>Необходима авторизация</h3>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Войти</Link>
      </div>
    </div></div>
  );

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Введите название'); return; }
    if (!form.price || parseFloat(form.price) <= 0) { setError('Введите корректную цену'); return; }
    setLoading(true); setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach(img => formData.append('images', img));
      const res = await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/product/${res.data.id}`);
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка создания объявления');
    } finally {
      setLoading(false);
    }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 740 }}>
        <div className="breadcrumbs">
          <Link to="/">Главная</Link><span>›</span><span>Новое объявление</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Разместить объявление</h1>

        <form onSubmit={handleSubmit}>
          {/* Images */}
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📷 Фотографии</h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={src} alt="" style={{ width: 90, height: 80, objectFit: 'cover', borderRadius: 8, border: i === 0 ? '2px solid var(--red)' : '2px solid var(--border)' }} />
                  {i === 0 && <span style={{ position: 'absolute', bottom: 2, left: 2, fontSize: 10, background: 'var(--red)', color: 'white', padding: '1px 5px', borderRadius: 4 }}>Главная</span>}
                </div>
              ))}
              <label style={{ width: 90, height: 80, border: '2px dashed var(--border)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12, gap: 4, transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--red)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span style={{ fontSize: 24 }}>+</span>
                <span>Фото</span>
                <input type="file" multiple accept="image/*" onChange={handleImages} style={{ display: 'none' }} />
              </label>
            </div>
            <div className="form-hint">Первое фото — главное. До 10 фотографий, каждая до 10 МБ</div>
          </div>

          {/* Main info */}
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📝 Описание</h2>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Название объявления *</label>
              <input {...f('title')} className="form-input" placeholder="Например: iPhone 15 Pro Max 256GB" maxLength={100} required />
              <span className="form-hint">{form.title.length}/100</span>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Описание</label>
              <textarea {...f('description')} className="form-textarea" rows={5} placeholder="Расскажите о товаре подробнее: состояние, комплектация, причина продажи..." maxLength={2000} />
              <span className="form-hint">{(form.description || '').length}/2000</span>
            </div>
            <div className="form-group">
              <label className="form-label">Категория</label>
              <select {...f('category_id')} className="form-select">
                <option value="">Выберите категорию</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Price & condition */}
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>💰 Цена и состояние</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Цена, ₽ *</label>
                <input type="number" {...f('price')} className="form-input" placeholder="0" min="1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Состояние</label>
                <select {...f('condition')} className="form-select">
                  <option value="new">Новый</option>
                  <option value="used">Б/у</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">В наличии (шт.)</label>
                <input type="number" {...f('stock')} className="form-input" min="1" placeholder="1" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📍 Местоположение</h2>
            <div className="form-group">
              <label className="form-label">Город</label>
              <input {...f('city')} className="form-input" placeholder="Москва" />
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
              {loading ? 'Размещение...' : 'Разместить объявление'}
            </button>
            <Link to="/" className="btn btn-ghost btn-lg">Отмена</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
