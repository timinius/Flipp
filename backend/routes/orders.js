const express = require('express');
const { getDB } = require('../db/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const db = getDB();
  const orders = db.prepare(`
    SELECT o.*, COUNT(oi.id) as items_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `).all(req.user.id);
  res.json(orders);
});

router.get('/:id', authenticateToken, (req, res) => {
  const db = getDB();
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Заказ не найден' });

  const items = db.prepare(`
    SELECT oi.*, p.title, p.condition, p.city,
           u.name as seller_name, u.id as seller_id,
           (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN users u ON p.seller_id = u.id
    WHERE oi.order_id = ?
  `).all(order.id);

  res.json({ ...order, items });
});

router.post('/', authenticateToken, (req, res) => {
  const { address, payment_method = 'card' } = req.body;
  if (!address) return res.status(400).json({ error: 'Укажите адрес доставки' });

  const db = getDB();
  const cartItems = db.prepare(`
    SELECT ci.*, p.price, p.title, p.status, p.stock, p.seller_id
    FROM cart_items ci JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `).all(req.user.id);

  if (cartItems.length === 0) return res.status(400).json({ error: 'Корзина пуста' });

  for (const item of cartItems) {
    if (item.status !== 'active') return res.status(400).json({ error: `Товар "${item.title}" недоступен` });
    if (item.seller_id === req.user.id) return res.status(400).json({ error: 'Нельзя заказать собственный товар' });
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const orderResult = db.prepare(`
    INSERT INTO orders (user_id, total_price, address, payment_method) VALUES (?, ?, ?, ?)
  `).run(req.user.id, total, address, payment_method);

  const orderId = orderResult.lastInsertRowid;
  const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');

  cartItems.forEach(item => {
    insertItem.run(orderId, item.product_id, item.quantity, item.price);
  });

  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  res.status(201).json(order);
});

module.exports = router;
