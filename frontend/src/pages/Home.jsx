import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { slug: 'electronics', name: 'Электроника', icon: '💻', color: '#EBF3EC' },
  { slug: 'clothing', name: 'Одежда', icon: '👗', color: '#FDECEA' },
  { slug: 'home', name: 'Дом и сад', icon: '🏠', color: '#FFF8E7' },
  { slug: 'transport', name: 'Транспорт', icon: '🚗', color: '#EBF3EC' },
  { slug: 'sport', name: 'Спорт', icon: '⚽', color: '#FDECEA' },
  { slug: 'beauty', name: 'Красота', icon: '💄', color: '#FFF8E7' },
  { slug: 'kids', name: 'Дети', icon: '🧸', color: '#EBF3EC' },
  { slug: 'books', name: 'Книги', icon: '📚', color: '#FDECEA' },
  { slug: 'business', name: 'Бизнес', icon: '🏭', color: '#FFF8E7' },
  { slug: 'realty', name: 'Недвижимость', icon: '🏢', color: '#EBF3EC' },
];

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    api.get('/products?limit=8&sort=new').then(r => setProducts(r.data.products || [])).finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) navigate(`/catalog?search=${encodeURIComponent(searchVal.trim())}`);
    else navigate('/catalog');
  };

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--red) 0%, #8B0000 60%, var(--green-dark) 100%)',
        color: 'white', padding: '60px 20px', textAlign: 'center',
      }}>
        <div className="container">
          <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 12, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            OCKO — Маркетплейс
          </h1>
          <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
            Покупайте и продавайте всё что угодно — от электроники до автомобилей
          </p>
          <form onSubmit={handleSearch} style={{ display: 'flex', maxWidth: 600, margin: '0 auto', gap: 0, borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <input
              type="text" value={searchVal} onChange={e => setSearchVal(e.target.value)}
              placeholder="Что ищете? Например: iPhone, велосипед, диван..."
              style={{ flex: 1, padding: '16px 20px', border: 'none', fontSize: 15, outline: 'none', color: 'var(--text)' }}
            />
            <button type="submit" style={{
              background: 'var(--green)', color: 'white', border: 'none', padding: '16px 28px',
              fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--green-dark)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
            >
              Найти
            </button>
          </form>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            {['Бесплатные объявления', 'Безопасные сделки', 'Доставка по России'].map(text => (
              <span key={text} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 14px', fontSize: 13 }}>
                ✓ {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '36px 0' }}>
        <div className="container">
          <h2 className="section-title">Категории</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} to={`/catalog?category=${cat.slug}`}
                style={{
                  background: cat.color, borderRadius: 'var(--radius-lg)', padding: '16px 12px',
                  textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'block',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: 32, marginBottom: 6 }}>{cat.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New listings */}
      <section style={{ padding: '0 0 40px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Новые объявления</h2>
            <Link to="/catalog" style={{ color: 'var(--red)', fontSize: 14, fontWeight: 500 }}>
              Смотреть все →
            </Link>
          </div>
          {loading ? (
            <div className="spinner" />
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>Пока нет объявлений</h3>
              <p>Станьте первым!</p>
            </div>
          ) : (
            <div className="grid-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Banner */}
      <section style={{ background: 'linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%)', padding: '40px 20px', color: 'white' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Начните продавать прямо сейчас</h2>
            <p style={{ opacity: 0.9 }}>Разместите бесплатное объявление и найдите покупателя за 24 часа</p>
          </div>
          <Link to="/sell" className="btn" style={{ background: 'white', color: 'var(--green-dark)', fontWeight: 700, padding: '14px 28px', fontSize: 16 }}>
            Разместить объявление
          </Link>
        </div>
      </section>

      {/* Popular */}
      <section style={{ padding: '36px 0 40px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Популярное</h2>
            <Link to="/catalog?sort=popular" style={{ color: 'var(--red)', fontSize: 14, fontWeight: 500 }}>Смотреть все →</Link>
          </div>
          <PopularProducts />
        </div>
      </section>
    </div>
  );
}

function PopularProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products?limit=4&sort=popular').then(r => setProducts(r.data.products || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;
  return (
    <div className="grid-4">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
