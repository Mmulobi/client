import React, { useState } from 'react';
import axios from 'axios';
import './ConfessionInput.css';

const MAX_CHARS = 280;

const ConfessionInput = ({ onNewConfession }) => {
  const [text, setText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    console.log('Submitting confession:', text);
    try {
      const res = await axios.post('http://localhost:5000/api/confessions', { text });
      console.log('Confession posted:', res.data);
      onNewConfession(res.data);
      setText('');
    } catch (err) {
      console.error('Error posting confession:', err.response?.data || err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="confession-input">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
        placeholder="Confess your sins..."
        className="input-textarea"
      />
      <div className="char-count">{text.length}/{MAX_CHARS}</div>
      <button type="submit" className="input-button">Confess</button>
    </form>
  );
};

export default ConfessionInput;