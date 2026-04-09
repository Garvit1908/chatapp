import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  Plus,
  LogOut,
  Search,
  MoreVertical,
  Trash2,
  Settings,
  Bot,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const { conversations, activeConversation, setActiveConversation, loadMessages, deleteConversation, getAllUsers, createDirectConversation, createGroupConversation } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    if (showNewChat || showNewGroup) {
      setAvailableUsers(getAllUsers());
    }
  }, [showNewChat, showNewGroup]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredConversations = conversations
    .filter(c =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lastMessage || c.last_message)?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.updated_at || 0);
      const dateB = new Date(b.updatedAt || b.updated_at || 0);
      return dateB - dateA;
    });

  const handleConversationClick = (conv) => {
    setActiveConversation(conv);
    loadMessages(conv.id);
  };

  const handleDelete = (e, convId) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      deleteConversation(convId);
    }
  };

  const handleCreateDirect = (user) => {
    createDirectConversation(user.id, user.username, user.avatar);
    setShowNewChat(false);
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      createGroupConversation(groupName, selectedUsers);
      setGroupName('');
      setSelectedUsers([]);
      setShowNewGroup(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.username}
              className="w-10 h-10 rounded-full bg-gray-100"
            />
            <div>
              <p className="font-semibold text-gray-800">{currentUser?.username}</p>
              <p className="text-xs text-green-500">Online</p>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={() => setShowNewChat(true)}
            className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-sm mt-1">Click + to start a new chat</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleConversationClick(conv)}
                className={`
                  group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                  ${activeConversation?.id === conv.id
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-gray-50 border border-transparent'
                  }
                `}
              >
                <div className="relative">
                  {conv.type === 'ai' ? (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                      {conv.avatar}
                    </div>
                  ) : (
                    <img
                      src={conv.avatar}
                      alt={conv.name}
                      className="w-12 h-12 rounded-full bg-gray-100"
                    />
                  )}
                  {conv.type === 'direct' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-800 truncate">{conv.name}</p>
                    {(conv.lastMessage || conv.last_message) && (
                      <p className="text-xs text-gray-400">
                        {new Date(conv.updatedAt || conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {conv.type === 'ai' && <Bot className="inline w-3 h-3 mr-1" />}
                    {conv.lastMessage || conv.last_message || 'No messages yet'}
                  </p>
                </div>

                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-96 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-lg">New Chat</h3>
              <button onClick={() => setShowNewChat(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <button
                onClick={() => {
                  setShowNewChat(false);
                  setShowNewGroup(true);
                }}
                className="w-full p-3 mb-3 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center gap-3 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium">New Group</p>
                  <p className="text-sm text-gray-500">Create a group chat</p>
                </div>
              </button>

              <p className="text-sm text-gray-500 mb-2">Select a user to chat with:</p>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableUsers.length === 0 ? (
                  <p className="text-center text-gray-400 py-4">No other users registered</p>
                ) : (
                  availableUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleCreateDirect(user)}
                      className="w-full p-2 hover:bg-gray-50 rounded-xl flex items-center gap-3 transition-colors"
                    >
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-10 h-10 rounded-full bg-gray-100"
                      />
                      <div className="text-left">
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Group Modal */}
      {showNewGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-96 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-lg">New Group</h3>
              <button onClick={() => setShowNewGroup(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <input
                type="text"
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />

              <p className="text-sm text-gray-500 mb-2">Select members:</p>

              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                {availableUsers.map(user => (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-full bg-gray-100"
                    />
                    <span className="font-medium">{user.username}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedUsers.length === 0}
                className="w-full py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
              >
                Create Group ({selectedUsers.length + 1} members)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
