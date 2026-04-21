const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/auth');
const User     = require('../models/User');

// ── GET /api/user/me — get logged-in user profile ────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: {
      id:        req.user._id,
      name:      req.user.name,
      email:     req.user.email,
      createdAt: req.user.createdAt,
    },
  });
});

// ── PUT /api/user/me — update name ───────────────────────────────────────────
router.put('/me', protect, async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true }
    );
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not update profile' });
  }
});

module.exports = router;