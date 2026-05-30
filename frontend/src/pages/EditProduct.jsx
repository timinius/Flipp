import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export default function EditProduct() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get(`/products/${id}`), api.get('/categories')]).then(([pRes, cRes]) => {
      const p = pRes.data;
      if (p.seller_id !== user?.id) { navigate('/'); return; }
      setForm({ title: p.title, description: p.description || '', price: p.price, category_id: p.category_id || '', condition: p.condition, city: p.city, stock: p.stock, status: p.status });
      setPreviews((p.images || []).map(img => img.url));
      setCategories(cRes.data);
    }).finally(() => setLoading(false));
  }, [id, user, navigate]);

  if (loading) return <div className="spinner" style={{ marginTop: 60 }} />;
  if (!form) return null;

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach(img => formData.append('images', img));
      await api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/product/${id}`);
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 740 }}>
        <div className="breadcrumbs">
          <Link to="/profile/listings">Мои объявления</Link><span>›</span><span>Редактирование</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Редактировать объявление</h1>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📷 Фотографии</h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              {previews.map((src, i) => (
                <img key={i} src={src} alt="" style={{ width: 90, height: 80, objectFit: 'cover', borderRadius: 8, border: i === 0 ? '2px solid var(--red)' : '2px solid var(--border)' }}
                  onError={e => e.target.style.display = 'none'} />
              ))}
              <label style={{ width: 90, height: 80, border: '2px dashed var(--border)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12, gap: 4 }}>
                <span style={{ fontSize: 24 }}>+</span><span>Изменить</span>
                <input type="file" multiple accept="image/*" onChange={handleImages} style={{ display: 'none' }} />
              </label>
            </div>
            <div className="form-hint">Загрузите новые фото для замены текущих</div>
          </div>

          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📝 Описание</h2>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Название *</label>
              <input {...f('title')} className="form-input" required />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Описание</label>
              <textarea {...f('description')} className="form-textarea" rows={5} />
            </div>
            <div className="form-group">
              <label className="form-label">Категория</label>
              <select {...f('category_id')} className="form-select">
                <option value="">Без категории</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>💰 Цена и состояние</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Цена, ₽</label>
                <input type="number" {...f('price')} className="form-input" min="1" />
              </div>
              <div className="form-group">
                <label className="form-label">Состояние</label>
                <select {...f('condition')} className="form-select">
                  <option value="new">Новый</option>
                  <option value="used">Б/у</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">В наличии</label>
                <input type="number" {...f('stock')} className="form-input" min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Статус</label>
                <select {...f('status')} className="form-select">
                  <option value="active">Активно</option>
                  <option value="archived">Архив</option>
                  <option value="sold">Продано</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Город</label>
              <input {...f('city')} className="form-input" />
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={saving} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
            <Link to={`/product/${id}`} className="btn btn-ghost btn-lg">Отмена</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
