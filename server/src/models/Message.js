import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const Message = {
  create: (conversationId, senderId, content, type = 'text', replyTo = null) => {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO messages (id, conversation_id, sender_id, content, type, reply_to)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, conversationId, senderId, content, type, replyTo);
    return { id, conversationId, senderId, content, type, replyTo };
  },

  findById: (id) => {
    const stmt = db.prepare(`
      SELECT m.*, u.username as sender_username, u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `);
    return stmt.get(id);
  },

  getByConversation: (conversationId, limit = 50, offset = 0) => {
    const stmt = db.prepare(`
      SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.type,
        m.reply_to,
        m.created_at,
        u.username as sender_username,
        u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(conversationId, limit, offset).reverse();
  },

  getRecent: (conversationId, limit = 100) => {
    const stmt = db.prepare(`
      SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.type,
        m.created_at,
        u.username as sender_username,
        u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at DESC
      LIMIT ?
    `);
    return stmt.all(conversationId, limit).reverse();
  },

  delete: (id) => {
    const stmt = db.prepare('DELETE FROM messages WHERE id = ?');
    stmt.run(id);
  }
};
