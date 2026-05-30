const express = require('express');
const { getDB } = require('../db/init');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDB();
  const categories = db.prepare('SELECT * FROM categories ORDER BY id').all();
  res.json(categories);
});

module.exports = router;
