import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import ConfessionInput from './components/ConfessionInput';
import ConfessionCard from './components/ConfessionCard';
import AdminPanel from './components/AdminPanel';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const socket = io('http://localhost:5000', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

function App() {
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    console.log('App mounting... Attempting socket connection to http://localhost:5000');
    fetchConfessions();

    socket.on('connect', () => {
      console.log('Socket connected successfully. Socket ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socket.on('newConfession', (confession) => {
      console.log('New confession received via socket:', confession);
      setConfessions((prev) => {
        const exists = prev.some((c) => c.id === confession.id);
        if (!exists) {
          const updated = [{ ...confession, comments: confession.comments || [] }, ...prev];
          console.log('State after adding new confession:', updated);
          return updated;
        }
        console.log('Confession already exists, skipping:', confession.id);
        return prev;
      });
    });

    socket.on('confessionApproved', (confession) => {
      console.log('Confession approved:', confession);
      setConfessions((prev) => {
        const filtered = prev.filter((c) => c.id !== confession.id);
        const updated = [...filtered, { ...confession, comments: confession.comments || [] }];
        console.log('State after approval:', updated);
        return updated;
      });
    });

    socket.on('confessionEdited', (confession) => { // New listener
      console.log('Confession edited:', confession);
      setConfessions((prev) => {
        const updated = prev.map((c) => (c.id === confession.id ? { ...confession, comments: c.comments } : c));
        console.log('State after edit:', updated);
        return updated;
      });
    });

    socket.on('confessionDeleted', (id) => {
      console.log('Confession deleted:', id);
      setConfessions((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        console.log('State after deletion:', updated);
        return updated;
      });
    });

    socket.on('reactionUpdate', ({ id, type, count }) => {
      console.log('Reaction update:', { id, type, count });
      setConfessions((prev) => {
        const updated = prev.map((c) => (c.id === id ? { ...c, [type]: count } : c));
        console.log('State after reaction update:', updated);
        return updated;
      });
    });

    socket.on('newComment', ({ confessionId, comment }) => {
      console.log('New comment received:', { confessionId, comment });
      setConfessions((prev) => {
        const updatedConfessions = prev.map((c) =>
          c.id === Number(confessionId)
            ? { ...c, comments: [...(c.comments || []), comment] }
            : c
        );
        console.log('State after new comment:', updatedConfessions);
        return updatedConfessions;
      });
    });

    if (!socket.connected) {
      console.log('Socket not connected - forcing connect');
      socket.connect();
    }

    return () => {
      console.log('Disconnecting socket');
      socket.disconnect();
    };
  }, []);

  const fetchConfessions = async () => {
    try {
      const confessionsRes = await axios.get('http://localhost:5000/api/confessions');
      const confessionsData = confessionsRes.data;
      console.log('Initial confessions fetched from API:', confessionsData);

      let commentsData = [];
      try {
        const commentsRes = await axios.get('http://localhost:5000/api/comments');
        commentsData = commentsRes.data;
        console.log('Initial comments fetched from API:', commentsData);
      } catch (commentErr) {
        console.warn('Comments fetch failed:', commentErr.message);
      }

      const confessionsWithComments = confessionsData.map((conf) => ({
        ...conf,
        comments: commentsData.filter((comment) => comment.confessionId === conf.id),
      }));

      console.log('Final confessions with comments:', confessionsWithComments);
      setConfessions(confessionsWithComments);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching confessions:', err.message);
      setConfessions([]);
      setLoading(false);
    }
  };

  const handleNewConfession = async (newConfession) => {
    console.log('Posting new confession:', newConfession);
    try {
      const res = await axios.post('http://localhost:5000/api/confessions', {
        text: newConfession.text,
      });
      console.log('Confession posted to server:', res.data);
      toast.success('Confession posted!');
    } catch (err) {
      console.error('Error posting confession:', err.response?.data || err.message);
      toast.error('Failed to post confession');
    }
  };

  const handleAdminToggle = (e) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      console.log('Admin access granted');
      setIsAdmin(true);
      setAdminPassword('');
    } else {
      console.log('Wrong admin password');
      toast.error('Invalid admin password');
      setAdminPassword('');
    }
  };

  return (
    <div className="app-container">
      <div className="logo-container">
        <span className="logo-text">Confession</span>
        <span className="logo-x">X</span>
      </div>
      {!isAdmin && (
        <form onSubmit={handleAdminToggle} className="admin-login">
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Admin Password"
            className="input-text"
          />
          <button type="submit" className="admin-btn">Admin Login</button>
        </form>
      )}
      {isAdmin && <AdminPanel setIsAdmin={setIsAdmin} />}
      <ConfessionInput onNewConfession={handleNewConfession} />
      {loading ? (
        <div className="spinner">Loading...</div>
      ) : (
        <div className="confession-feed">
          {confessions.length === 0 ? (
            <p>No confessions yet</p>
          ) : (
            confessions.map((conf) => (
              <div key={conf.id} className="fade-in">
                <ConfessionCard confession={conf} />
              </div>
            ))
          )}
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
}

export default App;