import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page flex-center" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div>
        <div style={{ fontSize: 80, fontWeight: 900, color: 'var(--red)', lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '16px 0 8px' }}>Страница не найдена</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Возможно, она была удалена или вы перешли по неверной ссылке</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary btn-lg">На главную</Link>
          <Link to="/catalog" className="btn btn-ghost btn-lg">В каталог</Link>
        </div>
      </div>
    </div>
  );
}
