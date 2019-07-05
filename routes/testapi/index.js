const express = require('express');
const router = express.Router();
const { dbManager } = require('../managers');

router.get('/api/db/reset', (req, res) => {
  dbManager.reset();
  res.json({ ok: true });
});

module.exports = router;
