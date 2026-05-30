const express = require('express');
const { getDB } = require('../db/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const db = getDB();
  const items = db.prepare(`
    SELECT ci.id, ci.quantity, ci.product_id,
           p.title, p.price, p.status, p.stock, p.condition, p.city,
           u.name as seller_name, u.id as seller_id,
           (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    JOIN users u ON p.seller_id = u.id
    WHERE ci.user_id = ?
    ORDER BY ci.created_at DESC
  `).all(req.user.id);
  res.json(items);
});

router.post('/', authenticateToken, (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id обязателен' });

  const db = getDB();
  const product = db.prepare('SELECT * FROM products WHERE id = ? AND status = ?').get(product_id, 'active');
  if (!product) return res.status(404).json({ error: 'Товар не найден или недоступен' });
  if (product.seller_id === req.user.id) return res.status(400).json({ error: 'Нельзя добавить свой товар в корзину' });

  const existing = db.prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?').get(req.user.id, product_id);
  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(req.user.id, product_id, quantity);
  }

  const item = db.prepare(`
    SELECT ci.id, ci.quantity, ci.product_id, p.title, p.price,
           (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
    FROM cart_items ci JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ? AND ci.product_id = ?
  `).get(req.user.id, product_id);
  res.json(item);
});

router.put('/:id', authenticateToken, (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) return res.status(400).json({ error: 'Некорректное количество' });

  const db = getDB();
  const item = db.prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!item) return res.status(404).json({ error: 'Элемент корзины не найден' });

  db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, item.id);
  res.json({ ...item, quantity });
});

router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDB();
  const item = db.prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!item) return res.status(404).json({ error: 'Элемент корзины не найден' });
  db.prepare('DELETE FROM cart_items WHERE id = ?').run(item.id);
  res.json({ message: 'Удалено из корзины' });
});

router.delete('/', authenticateToken, (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
  res.json({ message: 'Корзина очищена' });
});

module.exports = router;
