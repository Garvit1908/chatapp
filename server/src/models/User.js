import db from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const User = {
  create: (username, email, password) => {
    const id = uuidv4();
    const passwordHash = bcrypt.hashSync(password, 10);
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    const stmt = db.prepare(`
      INSERT INTO users (id, username, email, password_hash, avatar_url)
      VALUES (?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(id, username, email, passwordHash, avatarUrl);
      return { id, username, email, avatar_url: avatarUrl };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        if (error.message.includes('email')) {
          throw new Error('Email already registered');
        }
        throw new Error('Username already taken');
      }
      throw error;
    }
  },

  findByEmail: (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT id, username, email, avatar_url, created_at, last_seen FROM users WHERE id = ?');
    return stmt.get(id);
  },

  findByUsername: (username) => {
    const stmt = db.prepare('SELECT id, username, email, avatar_url FROM users WHERE username = ?');
    return stmt.get(username);
  },

  verifyPassword: (user, password) => {
    return bcrypt.compareSync(password, user.password_hash);
  },

  updateLastSeen: (id) => {
    const stmt = db.prepare('UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);
  },

  search: (query, currentUserId) => {
    const stmt = db.prepare(`
      SELECT id, username, email, avatar_url FROM users
      WHERE (username LIKE ? OR email LIKE ?) AND id != ?
      LIMIT 20
    `);
    const searchPattern = `%${query}%`;
    return stmt.all(searchPattern, searchPattern, currentUserId);
  },

  getAll: (excludeId) => {
    const stmt = db.prepare(`
      SELECT id, username, email, avatar_url FROM users
      WHERE id != ?
    `);
    return stmt.all(excludeId);
  }
};
