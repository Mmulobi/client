import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const AdminPanel = ({ setIsAdmin }) => {
  const [pendingConfessions, setPendingConfessions] = useState([]);
  const [approvedConfessions, setApprovedConfessions] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchPendingConfessions();
    fetchApprovedConfessions();
  }, []);

  const fetchPendingConfessions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/confessions/pending');
      console.log('Fetched pending confessions:', res.data);
      setPendingConfessions(res.data);
    } catch (err) {
      console.error('Error fetching pending confessions:', err.message);
    }
  };

  const fetchApprovedConfessions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/confessions');
      console.log('Fetched approved confessions:', res.data);
      setApprovedConfessions(res.data);
    } catch (err) {
      console.error('Error fetching approved confessions:', err.message);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/confessions/${id}/approve`);
      console.log('Approved confession:', id);
      setPendingConfessions((prev) => prev.filter((conf) => conf.id !== id));
      fetchApprovedConfessions();
    } catch (err) {
      console.error('Error approving confession:', err.message);
    }
  };

  const handleDelete = async (id, isApproved = false) => {
    try {
      await axios.delete(`http://localhost:5000/api/confessions/${id}`);
      console.log('Deleted confession:', id);
      if (isApproved) {
        setApprovedConfessions((prev) => prev.filter((conf) => conf.id !== id));
      } else {
        setPendingConfessions((prev) => prev.filter((conf) => conf.id !== id));
      }
    } catch (err) {
      console.error('Error deleting confession:', err.message);
    }
  };

  const handleEdit = (id, text) => {
    setEditId(id);
    setEditText(text);
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/confessions/${id}`, { text: editText });
      console.log('Saved edit for confession:', id);
      setEditId(null);
      setEditText('');
      fetchApprovedConfessions();
    } catch (err) {
      console.error('Error saving edit:', err.message);
    }
  };

  const handleBulkApprove = async () => {
    try {
      await Promise.all(pendingConfessions.map((conf) => axios.patch(`http://localhost:5000/api/confessions/${conf.id}/approve`)));
      console.log('Bulk approved all pending confessions');
      setPendingConfessions([]);
      fetchApprovedConfessions();
    } catch (err) {
      console.error('Error bulk approving:', err.message);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(pendingConfessions.map((conf) => axios.delete(`http://localhost:5000/api/confessions/${conf.id}`)));
      console.log('Bulk deleted all pending confessions');
      setPendingConfessions([]);
    } catch (err) {
      console.error('Error bulk deleting:', err.message);
    }
  };

  const handleLogout = () => {
    console.log('Admin logging out');
    setIsAdmin(false);
  };

  const totalReactions = approvedConfessions.reduce((acc, conf) => acc + (conf.fire || 0) + (conf.skull || 0) + (conf.heart || 0), 0);

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Admin Command Center</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      <div className="stats-dashboard">
        <span>Pending: {pendingConfessions.length}</span>
        <span>Approved: {approvedConfessions.length}</span>
        <span>Total Reactions: {totalReactions}</span>
      </div>
      <div className="bulk-actions">
        <button onClick={handleBulkApprove} className="bulk-btn approve">Approve All</button>
        <button onClick={handleBulkDelete} className="bulk-btn delete">Delete All Pending</button>
      </div>
      <h3>Pending Confessions</h3>
      {pendingConfessions.length === 0 ? (
        <p>No pending confessions</p>
      ) : (
        pendingConfessions.map((conf) => (
          <div key={conf.id} className="pending-card">
            <span>{conf.text}</span>
            <div>
              <button onClick={() => handleApprove(conf.id)} className="approve-btn">Approve</button>
              <button onClick={() => handleDelete(conf.id)} className="delete-btn">Delete</button>
            </div>
          </div>
        ))
      )}
      <h3>Approved Confessions</h3>
      {approvedConfessions.length === 0 ? (
        <p>No approved confessions</p>
      ) : (
        approvedConfessions.map((conf) => (
          <div key={conf.id} className="pending-card">
            {editId === conf.id ? (
              <>
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="edit-input"
                />
                <button onClick={() => handleSaveEdit(conf.id)} className="save-btn">Save</button>
                <button onClick={() => setEditId(null)} className="cancel-btn">Cancel</button>
              </>
            ) : (
              <>
                <span>{conf.text}</span>
                <div>
                  <button onClick={() => handleEdit(conf.id, conf.text)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(conf.id, true)} className="delete-btn">Delete</button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AdminPanel;