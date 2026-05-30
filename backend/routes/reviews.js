const express = require('express');
const { getDB } = require('../db/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/seller/:sellerId', (req, res) => {
  const db = getDB();
  const reviews = db.prepare(`
    SELECT r.*, u.name as reviewer_name, u.avatar as reviewer_avatar,
           p.title as product_title
    FROM reviews r
    JOIN users u ON r.reviewer_id = u.id
    LEFT JOIN products p ON r.product_id = p.id
    WHERE r.seller_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.sellerId);
  res.json(reviews);
});

router.get('/product/:productId', (req, res) => {
  const db = getDB();
  const reviews = db.prepare(`
    SELECT r.*, u.name as reviewer_name, u.avatar as reviewer_avatar
    FROM reviews r
    JOIN users u ON r.reviewer_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.productId);
  res.json(reviews);
});

router.post('/', authenticateToken, (req, res) => {
  const { seller_id, product_id, rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Рейтинг от 1 до 5' });
  if (!seller_id && !product_id) return res.status(400).json({ error: 'Укажите seller_id или product_id' });

  const db = getDB();

  if (seller_id && parseInt(seller_id) === req.user.id) {
    return res.status(400).json({ error: 'Нельзя оставить отзыв себе' });
  }

  const result = db.prepare(`
    INSERT INTO reviews (reviewer_id, seller_id, product_id, rating, comment) VALUES (?, ?, ?, ?, ?)
  `).run(req.user.id, seller_id || null, product_id || null, rating, comment || null);

  if (seller_id) {
    const stats = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE seller_id = ?').get(seller_id);
    db.prepare('UPDATE users SET rating = ?, reviews_count = ? WHERE id = ?').run(
      Math.round(stats.avg * 10) / 10, stats.cnt, seller_id
    );
  }

  const review = db.prepare(`
    SELECT r.*, u.name as reviewer_name, u.avatar as reviewer_avatar
    FROM reviews r JOIN users u ON r.reviewer_id = u.id
    WHERE r.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(review);
});

module.exports = router;
