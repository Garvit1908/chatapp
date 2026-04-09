import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Layout from './components/Layout/Layout';
import ChatWindow from './components/Chat/ChatWindow';
import './index.css';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="h-screen w-screen bg-gray-100">
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/chat" /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/chat" /> : <Register />}
        />
        <Route
          path="/chat"
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<div className="flex items-center justify-center h-full text-gray-400">Select a conversation to start chatting</div>} />
          <Route path=":conversationId" element={<ChatWindow />} />
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? "/chat" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;
