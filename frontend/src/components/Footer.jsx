import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#1A1A1A', color: '#CCC', marginTop: 'auto' }}>
      <div className="container" style={{ padding: '40px 20px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 24, marginBottom: 10 }}>OCKO</div>
            <p style={{ fontSize: 13, lineHeight: 1.6 }}>
              Маркетплейс для частных объявлений и продажи товаров. Быстро, удобно, безопасно.
            </p>
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 600, marginBottom: 12 }}>Покупателям</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['/', 'Главная'], ['/catalog', 'Каталог'], ['/cart', 'Корзина'], ['/orders', 'Мои заказы']].map(([to, label]) => (
                <Link key={to} to={to} style={{ color: '#AAA', fontSize: 13, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = '#AAA'}
                >{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 600, marginBottom: 12 }}>Продавцам</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['/sell', 'Разместить объявление'], ['/profile/listings', 'Мои объявления']].map(([to, label]) => (
                <Link key={to} to={to} style={{ color: '#AAA', fontSize: 13, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = '#AAA'}
                >{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 600, marginBottom: 12 }}>Категории</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['electronics', 'Электроника'], ['clothing', 'Одежда'], ['home', 'Дом и сад'], ['transport', 'Транспорт']].map(([slug, label]) => (
                <Link key={slug} to={`/catalog?category=${slug}`} style={{ color: '#AAA', fontSize: 13, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = '#AAA'}
                >{label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #333', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 13 }}>© 2024 OCKO. Все права защищены.</span>
          <span style={{ fontSize: 12, color: '#777' }}>Безопасные сделки · Быстрая доставка · Поддержка 24/7</span>
        </div>
      </div>
    </footer>
  );
}
