const express = require('express');
const { getDB } = require('../db/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const db = getDB();
  const favorites = db.prepare(`
    SELECT f.id as fav_id, f.created_at as fav_at, p.*,
           u.name as seller_name, u.city as seller_city,
           (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
    FROM favorites f
    JOIN products p ON f.product_id = p.id
    JOIN users u ON p.seller_id = u.id
    WHERE f.user_id = ? AND p.status = 'active'
    ORDER BY f.created_at DESC
  `).all(req.user.id);
  res.json(favorites);
});

router.post('/:productId', authenticateToken, (req, res) => {
  const db = getDB();
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.productId);
  if (!product) return res.status(404).json({ error: 'Товар не найден' });

  try {
    db.prepare('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)').run(req.user.id, req.params.productId);
    db.prepare('UPDATE products SET likes_count = likes_count + 1 WHERE id = ?').run(req.params.productId);
    res.json({ favorited: true });
  } catch {
    res.status(400).json({ error: 'Уже в избранном' });
  }
});

router.delete('/:productId', authenticateToken, (req, res) => {
  const db = getDB();
  const result = db.prepare('DELETE FROM favorites WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.productId);
  if (result.changes > 0) {
    db.prepare('UPDATE products SET likes_count = MAX(0, likes_count - 1) WHERE id = ?').run(req.params.productId);
  }
  res.json({ favorited: false });
});

module.exports = router;
