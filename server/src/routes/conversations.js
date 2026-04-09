import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';

const router = express.Router();

// Get user's conversations
router.get('/', authenticateToken, (req, res) => {
  try {
    const conversations = Conversation.getConversationsForUser(req.user.id);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create direct conversation
router.post('/direct', authenticateToken, (req, res) => {
  try {
    const { userId } = req.body;

    // Check if conversation already exists
    const existing = Conversation.findDirectConversation(req.user.id, userId);
    if (existing) {
      const members = Conversation.getMembers(existing.id);
      return res.json({ ...existing, members });
    }

    // Get other user's info
    const otherUser = User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create conversation
    const conversation = Conversation.create(
      'direct',
      otherUser.username,
      otherUser.avatar_url
    );

    // Add members
    Conversation.addMember(conversation.id, req.user.id, false);
    Conversation.addMember(conversation.id, userId, false);

    const members = Conversation.getMembers(conversation.id);
    res.status(201).json({ ...conversation, members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create group conversation
router.post('/group', authenticateToken, (req, res) => {
  try {
    const { name, participantIds } = req.body;

    if (!name || !participantIds || !Array.isArray(participantIds)) {
      return res.status(400).json({ error: 'Name and participants are required' });
    }

    const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`;
    const conversation = Conversation.create('group', name, avatarUrl);

    // Add creator as admin
    Conversation.addMember(conversation.id, req.user.id, true);

    // Add other participants
    participantIds.forEach(userId => {
      Conversation.addMember(conversation.id, userId, false);
    });

    const members = Conversation.getMembers(conversation.id);
    res.status(201).json({ ...conversation, members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversation messages
router.get('/:id/messages', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verify user is member
    const members = Conversation.getMembers(id);
    if (!members.find(m => m.id === req.user.id)) {
      return res.status(403).json({ error: 'Not a member of this conversation' });
    }

    const messages = Message.getByConversation(id, parseInt(limit), parseInt(offset));
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete conversation
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    // Verify user is member
    const members = Conversation.getMembers(id);
    if (!members.find(m => m.id === req.user.id)) {
      return res.status(403).json({ error: 'Not a member of this conversation' });
    }

    Conversation.delete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
