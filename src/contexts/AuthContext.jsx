import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Generate avatar using DiceBear
const generateAvatar = (username) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage
    const savedUser = localStorage.getItem('chatapp_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('chatapp_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('chatapp_user', JSON.stringify(user));
    return { success: true };
  };

  const register = (username, email, password) => {
    const users = JSON.parse(localStorage.getItem('chatapp_users') || '[]');

    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    if (users.find(u => u.username === username)) {
      return { success: false, error: 'Username already taken' };
    }

    const newUser = {
      id: 'user_' + Date.now(),
      username,
      email,
      password, // plaintext for demo
      avatar: generateAvatar(username),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('chatapp_users', JSON.stringify(users));
    localStorage.setItem('chatapp_user', JSON.stringify(newUser));

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('chatapp_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
