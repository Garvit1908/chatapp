import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }) {
  const { currentUser, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [aiTyping, setAiTyping] = useState(false);

  const aiModels = [
    { id: 'llama3.2', name: 'Llama 3.2', description: 'Fast and efficient local model' },
    { id: 'llama3.1', name: 'Llama 3.1', description: 'Balanced performance' },
    { id: 'mistral', name: 'Mistral', description: 'Great for conversations' },
    { id: 'codellama', name: 'Code Llama', description: 'Optimized for code' }
  ];
  const [selectedAiModel, setSelectedAiModel] = useState('llama3.2');

  // Load conversations from localStorage
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const loadConversations = () => {
      const key = `chatapp_conversations_${currentUser.id}`;
      const data = JSON.parse(localStorage.getItem(key) || '[]');

      // Ensure AI conversation exists
      const hasAiConv = data.some(c => c.type === 'ai');
      if (!hasAiConv) {
        const aiConv = {
          id: 'ai-assistant',
          name: 'AI Assistant',
          type: 'ai',
          avatar: '🤖',
          lastMessage: 'Hello! I\'m your AI assistant. How can I help you today?',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        data.unshift(aiConv);
        localStorage.setItem(key, JSON.stringify(data));
      }

      setConversations(data);
    };

    loadConversations();
  }, [isAuthenticated, currentUser]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    const key = `chatapp_messages_${activeConversation.id}`;
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    setMessages(data);

    // Add welcome message for AI if empty
    if (activeConversation.type === 'ai' && data.length === 0) {
      const welcomeMsg = {
        id: 'welcome_' + Date.now(),
        conversationId: activeConversation.id,
        senderId: 'ai',
        content: "Hello! I'm your AI assistant. How can I help you today?",
        type: 'text',
        createdAt: new Date().toISOString()
      };
      const newMessages = [welcomeMsg];
      localStorage.setItem(key, JSON.stringify(newMessages));
      setMessages(newMessages);
    }
  }, [activeConversation]);

  const simulateAiResponse = useCallback(async (userMessage) => {
    setAiTyping(true);

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const responses = [
      "That's interesting! Tell me more.",
      "I understand. How can I help with that?",
      "Thanks for sharing! What else would you like to discuss?",
      "I'm here to help. Could you provide more details?",
      "That's a great point! Let me think about that...",
      "I'd be happy to assist with that!",
      "Interesting perspective! What are your thoughts on this?"
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];

    const aiMessage = {
      id: 'msg_' + Date.now(),
      conversationId: activeConversation.id,
      senderId: 'ai',
      content: response,
      type: 'text',
      createdAt: new Date().toISOString()
    };

    // Save message
    const key = `chatapp_messages_${activeConversation.id}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([...existing, aiMessage]));

    // Update conversation last message
    const convKey = `chatapp_conversations_${currentUser.id}`;
    const convs = JSON.parse(localStorage.getItem(convKey) || '[]');
    const updated = convs.map(c =>
      c.id === activeConversation.id
        ? { ...c, lastMessage: aiMessage.content, updatedAt: new Date().toISOString() }
        : c
    );
    localStorage.setItem(convKey, JSON.stringify(updated));

    setAiTyping(false);
    setMessages(prev => [...prev, aiMessage]);
    setConversations(updated);
  }, [activeConversation, currentUser]);

  const sendMessage = useCallback((content, type = 'text') => {
    if (!activeConversation || !currentUser) return;

    const message = {
      id: 'msg_' + Date.now(),
      conversationId: activeConversation.id,
      senderId: currentUser.id,
      content,
      type,
      createdAt: new Date().toISOString()
    };

    // Save message
    const key = `chatapp_messages_${activeConversation.id}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([...existing, message]));

    // Update conversation
    const convKey = `chatapp_conversations_${currentUser.id}`;
    const convs = JSON.parse(localStorage.getItem(convKey) || '[]');
    const updated = convs.map(c =>
      c.id === activeConversation.id
        ? { ...c, lastMessage: content, updatedAt: new Date().toISOString() }
        : c
    );
    localStorage.setItem(convKey, JSON.stringify(updated));

    setMessages(prev => [...prev, message]);
    setConversations(updated);

    // Simulate AI response if AI chat
    if (activeConversation.type === 'ai') {
      simulateAiResponse(content);
    }
  }, [activeConversation, currentUser, simulateAiResponse]);

  const createDirectConversation = (userId, username, avatar) => {
    const conv = {
      id: 'conv_' + Date.now(),
      name: username,
      type: 'direct',
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      participantId: userId,
      lastMessage: null,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const key = `chatapp_conversations_${currentUser.id}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([conv, ...existing]));

    setConversations(prev => [conv, ...prev]);
    setActiveConversation(conv);
    setMessages([]);
    return conv;
  };

  const createGroupConversation = (name, participantIds) => {
    const conv = {
      id: 'group_' + Date.now(),
      name,
      type: 'group',
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`,
      participantIds: [...participantIds, currentUser.id],
      lastMessage: null,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const key = `chatapp_conversations_${currentUser.id}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([conv, ...existing]));

    setConversations(prev => [conv, ...prev]);
    setActiveConversation(conv);
    setMessages([]);
    return conv;
  };

  const deleteConversation = (conversationId) => {
    const key = `chatapp_conversations_${currentUser.id}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = existing.filter(c => c.id !== conversationId);
    localStorage.setItem(key, JSON.stringify(filtered));

    // Also delete messages
    localStorage.removeItem(`chatapp_messages_${conversationId}`);

    setConversations(filtered);
    if (activeConversation?.id === conversationId) {
      setActiveConversation(null);
      setMessages([]);
    }
  };

  const getAllUsers = () => {
    const users = JSON.parse(localStorage.getItem('chatapp_users') || '[]');
    return users.filter(u => u.id !== currentUser?.id);
  };

  const setTyping = useCallback((isTyping) => {
    // No-op for localStorage mode
  }, []);

  const loadMessages = useCallback((conversationId) => {
    const key = `chatapp_messages_${conversationId}`;
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    setMessages(data);
  }, []);

  const value = {
    conversations,
    activeConversation,
    messages,
    typingUsers,
    aiModels,
    selectedAiModel,
    aiTyping,
    connected: true,
    setActiveConversation,
    setSelectedAiModel,
    sendMessage,
    loadMessages,
    createDirectConversation,
    createGroupConversation,
    deleteConversation,
    getAllUsers,
    setTyping
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}
