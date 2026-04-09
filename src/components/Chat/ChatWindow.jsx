import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Phone,
  Video,
  MoreVertical,
  Send,
  Smile,
  Paperclip,
  Bot,
  Users,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import AISettings from '../AI/AISettings';

export default function ChatWindow() {
  const { conversationId } = useParams();
  const { currentUser } = useAuth();
  const {
    conversations,
    activeConversation,
    messages,
    aiTyping,
    setActiveConversation,
    loadMessages,
    sendMessage,
    selectedAiModel,
    setSelectedAiModel,
    aiModels
  } = useChat();

  const [showAiSettings, setShowAiSettings] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversationId) {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        setActiveConversation(conv);
        loadMessages(conv.id);
      }
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiTyping]);

  if (!activeConversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💬</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</h2>
          <p className="text-gray-500">Choose a chat from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  const isAI = activeConversation.type === 'ai';
  const isGroup = activeConversation.type === 'group';

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          {isAI ? (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
              {activeConversation.avatar}
            </div>
          ) : (
            <div className="relative">
              <img
                src={activeConversation.avatar}
                alt={activeConversation.name}
                className="w-12 h-12 rounded-full bg-gray-100"
              />
              {!isGroup && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-800">{activeConversation.name}</h2>
              {isAI && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                  {aiModels.find(m => m.id === selectedAiModel)?.name}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {isAI ? 'Always ready to help' : isGroup ? `${activeConversation.participantIds?.length || 2} members` : 'Online'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAI && (
            <button
              onClick={() => setShowAiSettings(!showAiSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span className="text-sm font-medium">AI Settings</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAiSettings ? 'rotate-180' : ''}`} />
            </button>
          )}

          {!isAI && (
            <>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Video className="w-5 h-5 text-gray-600" />
              </button>
            </>
          )}

          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* AI Settings Panel */}
      {isAI && showAiSettings && (
        <AISettings
          selectedModel={selectedAiModel}
          onModelChange={setSelectedAiModel}
          models={aiModels}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <MessageList
          messages={messages}
          currentUser={currentUser}
          isGroup={isGroup}
          isAI={isAI}
        />

        {aiTyping && (
          <div className="flex items-center gap-3 px-6 py-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">
              🤖
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSend={sendMessage}
        disabled={aiTyping}
        placeholder={isAI ? 'Ask me anything...' : 'Type a message...'}
      />
    </div>
  );
}
