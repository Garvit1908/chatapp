import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = express.Router();

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search users
router.get('/search', authenticateToken, (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    const users = User.search(q, req.user.id);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (for creating conversations)
router.get('/', authenticateToken, (req, res) => {
  try {
    const users = User.getAll(req.user.id);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
