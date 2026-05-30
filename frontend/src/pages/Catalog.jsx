import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { slug: '', name: 'Все категории' },
  { slug: 'electronics', name: '💻 Электроника' },
  { slug: 'clothing', name: '👗 Одежда и обувь' },
  { slug: 'home', name: '🏠 Дом и сад' },
  { slug: 'transport', name: '🚗 Транспорт' },
  { slug: 'sport', name: '⚽ Спорт и отдых' },
  { slug: 'beauty', name: '💄 Красота' },
  { slug: 'kids', name: '🧸 Детские товары' },
  { slug: 'books', name: '📚 Книги и хобби' },
  { slug: 'business', name: '🏭 Бизнес' },
  { slug: 'realty', name: '🏢 Недвижимость' },
];

const CITIES = ['', 'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Нижний Новгород'];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    condition: searchParams.get('condition') || '',
    city: searchParams.get('city') || '',
    sort: searchParams.get('sort') || 'new',
    page: parseInt(searchParams.get('page') || '1'),
  });

  const limit = 20;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      params.set('limit', limit);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products);
      setTotal(res.data.total);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v && !(k === 'page' && v === 1) && !(k === 'sort' && v === 'new')) params[k] = v; });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const setFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value, page: 1 }));

  const pages = Math.ceil(total / limit);

  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumbs">
          <Link to="/">Главная</Link><span>›</span>
          <span>Каталог</span>
          {filters.search && <><span>›</span><span>«{filters.search}»</span></>}
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* Sidebar */}
          <aside style={{ width: 240, flexShrink: 0 }}>
            <div className="card" style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 15 }}>Категории</div>
              {CATEGORIES.map(cat => (
                <button key={cat.slug} onClick={() => setFilter('category', cat.slug)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px',
                    background: filters.category === cat.slug ? '#FDECEA' : 'transparent',
                    color: filters.category === cat.slug ? 'var(--red)' : 'var(--text)',
                    border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13,
                    fontWeight: filters.category === cat.slug ? 600 : 400, marginBottom: 2,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (filters.category !== cat.slug) e.currentTarget.style.background = '#F5F5F5'; }}
                  onMouseLeave={e => { if (filters.category !== cat.slug) e.currentTarget.style.background = 'transparent'; }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="card" style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 15 }}>Цена, ₽</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="number" placeholder="От" value={filters.min_price} onChange={e => setFilter('min_price', e.target.value)}
                  className="form-input" style={{ width: '50%', padding: '7px 10px' }} />
                <span style={{ color: 'var(--text-secondary)' }}>—</span>
                <input type="number" placeholder="До" value={filters.max_price} onChange={e => setFilter('max_price', e.target.value)}
                  className="form-input" style={{ width: '50%', padding: '7px 10px' }} />
              </div>
            </div>

            <div className="card" style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 15 }}>Состояние</div>
              {[['', 'Любое'], ['new', 'Новый'], ['used', 'Б/у']].map(([val, label]) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" name="condition" value={val} checked={filters.condition === val} onChange={() => setFilter('condition', val)} style={{ accentColor: 'var(--red)' }} />
                  {label}
                </label>
              ))}
            </div>

            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 15 }}>Город</div>
              <select value={filters.city} onChange={e => setFilter('city', e.target.value)} className="form-select" style={{ padding: '7px 10px' }}>
                {CITIES.map(c => <option key={c} value={c}>{c || 'Любой город'}</option>)}
              </select>
            </div>

            {(filters.category || filters.min_price || filters.max_price || filters.condition || filters.city) && (
              <button onClick={() => setFilters({ search: filters.search, category: '', min_price: '', max_price: '', condition: '', city: '', sort: 'new', page: 1 })}
                className="btn btn-ghost" style={{ width: '100%', marginTop: 12 }}>
                Сбросить фильтры
              </button>
            )}
          </aside>

          {/* Main */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
                {loading ? 'Загрузка...' : `Найдено: ${total} объявлений`}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Сортировка:</span>
                <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)} className="form-select" style={{ padding: '6px 10px', width: 'auto' }}>
                  <option value="new">Новые</option>
                  <option value="price_asc">Дешевле</option>
                  <option value="price_desc">Дороже</option>
                  <option value="popular">Популярные</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="spinner" />
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>Ничего не найдено</h3>
                <p>Попробуйте изменить параметры поиска</p>
              </div>
            ) : (
              <>
                <div className="grid-3">
                  {products.map(p => <ProductCard key={p.id} product={p} onFavoriteToggle={() => {}} />)}
                </div>
                {pages > 1 && (
                  <div className="pagination">
                    <button className="page-btn" onClick={() => setFilter('page', Math.max(1, filters.page - 1))} disabled={filters.page === 1}>‹</button>
                    {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                      let page;
                      if (pages <= 7) page = i + 1;
                      else if (filters.page <= 4) page = i + 1;
                      else if (filters.page >= pages - 3) page = pages - 6 + i;
                      else page = filters.page - 3 + i;
                      return (
                        <button key={page} className={`page-btn ${filters.page === page ? 'active' : ''}`} onClick={() => setFilter('page', page)}>
                          {page}
                        </button>
                      );
                    })}
                    <button className="page-btn" onClick={() => setFilter('page', Math.min(pages, filters.page + 1))} disabled={filters.page === pages}>›</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
