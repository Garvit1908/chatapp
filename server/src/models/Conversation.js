import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const Conversation = {
  create: (type, name = null, avatarUrl = null) => {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO conversations (id, type, name, avatar_url)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, type, name, avatarUrl);
    return { id, type, name, avatar_url: avatarUrl };
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
    return stmt.get(id);
  },

  addMember: (conversationId, userId, isAdmin = false) => {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO conversation_members (conversation_id, user_id, is_admin)
      VALUES (?, ?, ?)
    `);
    stmt.run(conversationId, userId, isAdmin ? 1 : 0);
  },

  removeMember: (conversationId, userId) => {
    const stmt = db.prepare(`
      DELETE FROM conversation_members
      WHERE conversation_id = ? AND user_id = ?
    `);
    stmt.run(conversationId, userId);
  },

  getMembers: (conversationId) => {
    const stmt = db.prepare(`
      SELECT u.id, u.username, u.email, u.avatar_url, cm.is_admin, cm.joined_at
      FROM conversation_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.conversation_id = ?
    `);
    return stmt.all(conversationId);
  },

  getConversationsForUser: (userId) => {
    const stmt = db.prepare(`
      SELECT
        c.*,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at
      FROM conversations c
      JOIN conversation_members cm ON c.id = cm.conversation_id
      WHERE cm.user_id = ?
      ORDER BY COALESCE(c.updated_at, c.created_at) DESC
    `);
    return stmt.all(userId);
  },

  findDirectConversation: (userId1, userId2) => {
    const stmt = db.prepare(`
      SELECT c.* FROM conversations c
      JOIN conversation_members cm1 ON c.id = cm1.conversation_id
      JOIN conversation_members cm2 ON c.id = cm2.conversation_id
      WHERE c.type = 'direct'
      AND cm1.user_id = ? AND cm2.user_id = ?
      AND (SELECT COUNT(*) FROM conversation_members WHERE conversation_id = c.id) = 2
    `);
    return stmt.get(userId1, userId2);
  },

  updateTimestamp: (id) => {
    const stmt = db.prepare('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);
  },

  delete: (id) => {
    const stmt = db.prepare('DELETE FROM conversations WHERE id = ?');
    stmt.run(id);
  }
};
