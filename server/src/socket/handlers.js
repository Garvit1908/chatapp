import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { streamOllamaResponse } from '../services/ollama.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export function setupSocketHandlers(io) {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return next(new Error('Authentication error'));
      socket.user = user;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.user.id})`);

    // Join user's personal room for direct messages
    socket.join(`user:${socket.user.id}`);

    // Update online status
    User.updateLastSeen(socket.user.id);
    socket.broadcast.emit('user_online', { userId: socket.user.id });

    // Join a conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`${socket.user.username} joined conversation ${conversationId}`);
    });

    // Leave a conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`${socket.user.username} left conversation ${conversationId}`);
    });

    // Send a message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, type = 'text' } = data;

        // Verify user is a member
        const members = Conversation.getMembers(conversationId);
        if (!members.find(m => m.id === socket.user.id)) {
          socket.emit('error', { message: 'Not a member of this conversation' });
          return;
        }

        // Create message
        const message = Message.create(conversationId, socket.user.id, content, type);
        const messageWithUser = {
          ...message,
          sender_username: socket.user.username,
          sender_avatar: socket.user.avatar_url
        };

        // Update conversation timestamp
        Conversation.updateTimestamp(conversationId);

        // Broadcast to all members in the conversation
        io.to(`conversation:${conversationId}`).emit('message_received', messageWithUser);

        // Also send to all members individually if not in room
        members.forEach(member => {
          io.to(`user:${member.id}`).emit('conversation_updated', {
            conversationId,
            lastMessage: content,
            updatedAt: new Date().toISOString()
          });
        });

        // Handle AI response for AI conversations
        const conversation = Conversation.findById(conversationId);
        if (conversation && conversation.type === 'ai') {
          handleAIResponse(io, conversationId, content, members);
        }
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { conversationId, isTyping } = data;
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.user.id,
        username: socket.user.username,
        conversationId,
        isTyping
      });
    });

    // AI Chat Request
    socket.on('ai_request', async (data) => {
      try {
        const { conversationId, message, model = 'llama3.2' } = data;

        const members = Conversation.getMembers(conversationId);
        if (!members.find(m => m.id === socket.user.id)) {
          socket.emit('error', { message: 'Not a member of this conversation' });
          return;
        }

        // Notify typing
        socket.to(`conversation:${conversationId}`).emit('ai_typing', { isTyping: true });

        // Stream AI response
        const aiMessageId = `ai-${Date.now()}`;
        let fullResponse = '';

        for await (const chunk of streamOllamaResponse(message, model)) {
          fullResponse += chunk;
          io.to(`conversation:${conversationId}`).emit('ai_stream', {
            messageId: aiMessageId,
            chunk,
            conversationId
          });
        }

        // Save AI message to database
        const aiMessage = Message.create(conversationId, 'ai', fullResponse, 'text');
        const aiMessageWithUser = {
          ...aiMessage,
          sender_username: 'AI Assistant',
          sender_avatar: null
        };

        io.to(`conversation:${conversationId}`).emit('message_received', aiMessageWithUser);
        io.to(`conversation:${conversationId}`).emit('ai_typing', { isTyping: false });

      } catch (error) {
        console.error('AI request error:', error);
        socket.emit('error', { message: 'AI request failed' });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username}`);
      socket.broadcast.emit('user_offline', { userId: socket.user.id });
    });
  });
}

async function handleAIResponse(io, conversationId, userMessage, members) {
  // This is called when a message is sent in an AI conversation
  // The AI response is handled via the ai_request socket event
}
