import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

const CITIES = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Нижний Новгород', 'Другой'];

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || 'Москва',
    about: user?.about || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Введите имя'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await api.put('/auth/me', form);
      updateUser(res.data);
      setSuccess('Профиль сохранён');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('Пароли не совпадают'); return; }
    if (pwForm.newPassword.length < 6) { setPwError('Пароль должен быть не менее 6 символов'); return; }
    setSavingPw(true); setPwError(''); setPwSuccess('');
    try {
      await api.put('/auth/me/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwSuccess('Пароль изменён');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSuccess(''), 3000);
    } catch (e) {
      setPwError(e.response?.data?.error || 'Ошибка изменения пароля');
    } finally {
      setSavingPw(false);
    }
  };

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 24 }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>{user.name}</h1>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{user.email}</div>
            <Link to={`/seller/${user.id}`} style={{ fontSize: 13, color: 'var(--red)', marginTop: 2, display: 'inline-block' }}>
              Публичный профиль →
            </Link>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { key: 'profile', label: 'Настройки профиля' },
            { key: 'password', label: 'Смена пароля' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-ghost'}`}>
              {tab.label}
            </button>
          ))}
          <Link to="/profile/listings" className="btn btn-secondary">Мои объявления</Link>
          <Link to="/orders" className="btn btn-ghost">Мои заказы</Link>
        </div>

        {activeTab === 'profile' && (
          <form onSubmit={handleProfile} className="card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Личные данные</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Имя и фамилия *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="form-input" placeholder="Иван Иванов" required />
              </div>
              <div className="form-group">
                <label className="form-label">Телефон</label>
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="form-input" placeholder="+7 999 000-00-00" />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Город</label>
              <select value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="form-select">
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">О себе</label>
              <textarea value={form.about} onChange={e => setForm(p => ({ ...p, about: e.target.value }))}
                placeholder="Расскажите о себе как о продавце..." className="form-textarea" rows={4} />
              <span className="form-hint">Эта информация будет видна на вашей странице продавца</span>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handlePassword} className="card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Смена пароля</h2>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Текущий пароль *</label>
              <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} className="form-input" required />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Новый пароль *</label>
              <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} className="form-input" placeholder="Минимум 6 символов" required />
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Подтвердите новый пароль *</label>
              <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} className="form-input" required />
            </div>
            {pwError && <div className="alert alert-error">{pwError}</div>}
            {pwSuccess && <div className="alert alert-success">{pwSuccess}</div>}
            <button type="submit" disabled={savingPw} className="btn btn-primary">
              {savingPw ? 'Изменение...' : 'Изменить пароль'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
