import { Bot, User } from 'lucide-react';

export default function MessageList({ messages, currentUser, isGroup, isAI }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          {isAI ? (
            <>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl">
                🤖
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">AI Assistant</h3>
              <p className="text-gray-500 max-w-sm">
                Ask me anything! I can help with questions, coding, writing, and more.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {['What can you do?', 'Help me write code', 'Explain a concept'].map(suggestion => (
                  <button
                    key={suggestion}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-4xl">👋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Start chatting</h3>
              <p className="text-gray-500">Send a message to start the conversation</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          <div className="flex justify-center">
            <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
              {formatDate(dateMessages[0].createdAt)}
            </span>
          </div>

          {dateMessages.map((message, index) => {
            const isOwn = message.senderId === currentUser?.id;
            const isAI = message.senderId === 'ai';
            const showAvatar = !isOwn && (index === 0 || dateMessages[index - 1]?.senderId !== message.senderId);

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
              >
                {!isOwn ? (
                  <div className="flex-shrink-0">
                    {showAvatar ? (
                      isAI ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-600" />
                        </div>
                      )
                    ) : (
                      <div className="w-8" />
                    )}
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    <img
                      src={currentUser?.avatar}
                      alt="You"
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                )}

                <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                  {isGroup && !isOwn && showAvatar && (
                    <span className="text-xs text-gray-500 mb-1">
                      {isAI ? 'AI Assistant' : 'User'}
                    </span>
                  )}

                  <div
                    className={`
                      px-4 py-2.5 rounded-2xl shadow-sm
                      ${isOwn
                        ? 'bg-primary-600 text-white rounded-tr-sm'
                        : isAI
                          ? 'bg-purple-50 text-gray-800 rounded-tl-sm border border-purple-100'
                          : 'bg-white text-gray-800 rounded-tl-sm'
                      }
                    `}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  <span className="text-xs text-gray-400 mt-1 px-1">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
