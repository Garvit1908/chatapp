# ChatApp 💬

A modern, real-time chat application with AI integration, built with React and Vite. Features peer-to-peer messaging, group chats, and AI assistant conversations - all stored locally in your browser.

![ChatApp Preview](https://via.placeholder.com/800x400?text=ChatApp+Preview)

## ✨ Features

- 🔐 **User Authentication** - Register and login with local storage
- 💬 **Direct Messaging** - One-on-one chats between users
- 👥 **Group Chats** - Create multi-user conversation rooms
- 🤖 **AI Assistant** - Built-in AI chat with simulated responses
- 📱 **Responsive Design** - Works on desktop and mobile
- 💾 **Local Storage** - No backend required, data persists in browser
- 🎨 **Modern UI** - Clean interface with Tailwind CSS
- ⚡ **Fast** - Vite-powered development and builds

## 🛠️ Tech Stack

- **Frontend:** React 18, React Router v6
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Build Tool:** Vite
- **Storage:** Browser localStorage
- **Backend (Optional):** Node.js, Express, Socket.io, SQLite

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed

### Installation

```bash
# Clone the repository
git clone https://github.com/Garvit1908/chatapp.git
cd chatapp

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Build for Production

```bash
npm run build
```

## 📖 How to Use

1. **Register an Account**
   - Click "Create Account" on the welcome screen
   - Enter username, email, and password

2. **Start Chatting**
   - Log in with your credentials
   - Click the **+** button to start a new chat
   - Choose "New Group" for group chats or select a user for direct messages

3. **AI Assistant**
   - The AI Assistant conversation is automatically available
   - Ask questions and get instant responses

4. **Manage Conversations**
   - Click on any conversation to open it
   - Hover and click the trash icon to delete conversations
   - Conversations are sorted by most recent activity

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           Frontend (React)              │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Auth   │  │   Chat   │  │   AI    │ │
│  │ Context │  │ Context  │  │ Service │ │
│  └────┬────┘  └────┬─────┘  └────┬────┘ │
│       └──────────────┴─────────────┘     │
│                    │                      │
│            localStorage API               │
│     (Users, Conversations, Messages)     │
└─────────────────────────────────────────┘
```

### Data Model

**User**
```javascript
{
  id: string,
  username: string,
  email: string,
  avatar: string (URL),
  createdAt: ISOString
}
```

**Conversation**
```javascript
{
  id: string,
  name: string,
  type: 'direct' | 'group' | 'ai',
  avatar: string,
  lastMessage: string,
  updatedAt: ISOString
}
```

**Message**
```javascript
{
  id: string,
  conversationId: string,
  senderId: string, // user.id or 'ai'
  content: string,
  type: 'text',
  createdAt: ISOString
}
```

## 📁 Project Structure

```
chatapp/
├── src/
│   ├── components/
│   │   ├── Auth/           # Login & Register
│   │   ├── Chat/           # ChatWindow, MessageList, MessageInput
│   │   ├── Sidebar/        # Conversation list
│   │   ├── AI/             # AI Settings
│   │   └── Layout/         # App layout
│   ├── contexts/
│   │   ├── AuthContext.jsx # Authentication state
│   │   └── ChatContext.jsx # Chat state & logic
│   ├── services/
│   │   └── api.js          # API service layer
│   └── main.jsx            # App entry point
├── server/                 # Optional backend (not running)
│   └── src/
│       ├── routes/         # API routes
│       ├── models/         # Database models
│       └── socket/         # Socket.io handlers
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 🔧 Backend (Optional)

The project includes a backend server with:
- **Express.js** REST API
- **Socket.io** for real-time messaging
- **SQLite** database with better-sqlite3
- **JWT** authentication
- **Ollama** integration for AI responses

### Backend Setup (if needed)

```bash
cd server
npm install
npm start
```

> ⚠️ **Note:** The backend currently has compilation issues with `better-sqlite3` on Windows. The frontend works standalone with localStorage.

## 🎯 Future Improvements

- [ ] Fix backend SQLite compilation
- [ ] Connect real Ollama AI integration
- [ ] Add file/image sharing
- [ ] Implement read receipts
- [ ] Add typing indicators (real-time)
- [ ] Push notifications
- [ ] End-to-end encryption
- [ ] Message search

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

---

Built with ❤️ using React and Vite
