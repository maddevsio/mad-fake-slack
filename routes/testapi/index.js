const express = require('express');
const router = express.Router();
const { dbManager } = require('../managers');

router.get('/reset', (req, res) => {
  dbManager.reset();
  res.json({ ok: true });
});

router.get('/current/team', (req, res) => {
  if (typeof req.query.domain !== 'undefined') {
    dbManager.slackTeam().domain = req.query.domain;
    res.json({
      ok: true
    });
  } else {
    res.json({
      ok: false
    });
  }
});

module.exports = router;
