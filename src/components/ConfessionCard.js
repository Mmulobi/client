import React, { useState } from 'react';
import axios from 'axios';
import './ConfessionCard.css';

const ConfessionCard = ({ confession }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false); // Toggle comments visibility

  const handleReaction = async (type) => {
    try {
      console.log('Updating reaction:', type, 'for confession:', confession.id);
      await axios.patch(`http://localhost:5000/api/confessions/${confession.id}/reactions`, { type });
    } catch (err) {
      console.error('Error updating reaction:', err.response?.data || err.message);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      console.log('Empty comment - skipping');
      return;
    }
    console.log('Posting comment:', commentText, 'on confession:', confession.id);
    try {
      const res = await axios.post(`http://localhost:5000/api/confessions/${confession.id}/comments`, {
        text: commentText,
      });
      console.log('Comment posted successfully with response:', res.data);
      setCommentText(''); // Clear input
      setShowComments(true); // Keep comments open after posting
    } catch (err) {
      console.error('Error posting comment:', err.response?.data || err.message);
    }
  };

  const toggleComments = () => {
    setShowComments((prev) => !prev);
  };

  const reactions = {
    fire: confession.fire || 0,
    skull: confession.skull || 0,
    heart: confession.heart || 0,
  };

  return (
    <div className="confession-card">
      <div className="confession-content">
        <p className="confession-text">{confession.text}</p>
        <small className="confession-time">{new Date(confession.createdAt).toLocaleTimeString()}</small>
      </div>
      <div className="interaction-bar">
        <button onClick={() => handleReaction('fire')} className="reaction-btn">🔥 {reactions.fire}</button>
        <button onClick={() => handleReaction('skull')} className="reaction-btn">💀 {reactions.skull}</button>
        <button onClick={() => handleReaction('heart')} className="reaction-btn">❤️ {reactions.heart}</button>
        <button onClick={toggleComments} className="comment-toggle-btn">
          💬 {(confession.comments || []).length}
        </button>
      </div>
      {showComments && (
        <div className="comments-section fade-in">
          {(confession.comments || []).map((c) => (
            <p key={c.id} className="comment">{c.text}</p>
          ))}
          <form onSubmit={handleComment} className="comment-form">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="comment-input"
            />
            <button type="submit" className="comment-btn">Post</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ConfessionCard;