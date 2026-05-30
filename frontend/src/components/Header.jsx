import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get('search') || '');
  }, [location.search]);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/catalog?search=${encodeURIComponent(search.trim())}`);
    else navigate('/catalog');
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const initials = user ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '';

  return (
    <header style={{
      background: 'var(--red)', color: 'white', position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 16, height: 60 }}>
        <Link to="/" style={{ color: 'white', fontWeight: 800, fontSize: 22, letterSpacing: -0.5, flexShrink: 0 }}>
          OCKO
        </Link>

        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Поиск товаров..."
              style={{
                width: '100%', padding: '9px 12px 9px 38px', border: 'none',
                borderRadius: 'var(--radius)', fontSize: 14, outline: 'none',
                color: 'var(--text)', background: 'white',
              }}
            />
          </div>
          <button type="submit" style={{
            background: 'var(--red-dark)', color: 'white', border: 'none',
            borderRadius: 'var(--radius)', padding: '9px 18px', fontWeight: 600, cursor: 'pointer',
            fontSize: 14, flexShrink: 0,
          }}>
            Найти
          </button>
        </form>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link to="/catalog" style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, padding: '6px 10px', borderRadius: 6, whiteSpace: 'nowrap',
            transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Каталог
          </Link>

          {user && (
            <Link to="/sell" style={{ color: 'white', background: 'var(--green)', borderRadius: 6,
              padding: '6px 14px', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--green-dark)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
            >
              + Продать
            </Link>
          )}

          {user && (
            <Link to="/favorites" style={{ color: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 6, display: 'flex', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </Link>
          )}

          <Link to="/cart" style={{
            color: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 6, display: 'flex',
            position: 'relative', transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2, background: 'var(--green)',
                color: 'white', borderRadius: '50%', width: 18, height: 18,
                fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>

          {user ? (
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.25)',
                  border: '2px solid rgba(255,255,255,0.5)', color: 'white', fontWeight: 700,
                  fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              >
                {initials}
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 44, background: 'white', borderRadius: 10,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)', minWidth: 200, overflow: 'hidden', zIndex: 200,
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: '#FAFAFA' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user.email}</div>
                  </div>
                  {[
                    { to: '/profile', label: 'Мой профиль' },
                    { to: '/profile/listings', label: 'Мои объявления' },
                    { to: '/orders', label: 'Мои заказы' },
                    { to: '/favorites', label: 'Избранное' },
                  ].map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
                      style={{ display: 'block', padding: '10px 16px', color: 'var(--text)', fontSize: 14, transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    <button onClick={handleLogout}
                      style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none',
                        color: 'var(--red)', fontSize: 14, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FDECEA'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      Выйти
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" style={{
              background: 'white', color: 'var(--red)', borderRadius: 6,
              padding: '7px 16px', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap',
            }}>
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
