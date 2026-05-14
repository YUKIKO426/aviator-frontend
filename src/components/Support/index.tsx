import React, { useState } from 'react';
import './support.scss';

interface SupportProps {
  telegramLink?: string;
  instagramLink?: string;
  whatsappNumber?: string;
}

export default function Support({
  telegramLink = 'https://t.me/yourusername',
  instagramLink = 'https://instagram.com/yourusername',
  whatsappNumber = '919999999999',
}: SupportProps) {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'support', text: 'Hello! 👋 How can we help you today?', time: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [name, setName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);

  const autoReplies = [
    "Thanks for reaching out! Our team will respond shortly.",
    "We typically respond within 5-10 minutes.",
    "For urgent issues, please contact us on Telegram for faster support.",
    "Your message has been received. Support team will be with you soon! ⚡",
  ];

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Auto reply after 2 seconds
    setTimeout(() => {
      const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      setMessages(prev => [...prev, { from: 'support', text: reply, time: new Date() }]);
    }, 2000);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Support FAB button */}
      <div className="support-fab" onClick={() => setOpen(!open)}>
        <span className="support-fab-icon">💬</span>
        <span className="support-fab-label">Support</span>
        <span className="support-fab-badge">24/7</span>
      </div>

      {/* Support menu */}
      {open && (
        <div className="support-menu">
          <div className="support-menu-title">
            <span>Contact Support</span>
            <button onClick={() => setOpen(false)}>×</button>
          </div>

          {/* Live Chat */}
          <button className="support-option live-chat" onClick={() => { setChatOpen(true); setOpen(false); }}>
            <span className="so-icon">💬</span>
            <div className="so-info">
              <div className="so-name">Live Chat</div>
              <div className="so-desc">Chat with us now • 24/7</div>
            </div>
            <span className="so-badge online">Online</span>
          </button>

          {/* Telegram */}
          <a className="support-option" href={telegramLink} target="_blank" rel="noreferrer">
            <span className="so-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#2AABEE">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.674l-2.95-.924c-.642-.204-.654-.642.136-.953l11.538-4.45c.535-.194 1.003.13.858.9z"/>
              </svg>
            </span>
            <div className="so-info">
              <div className="so-name">Telegram</div>
              <div className="so-desc">Fast replies on Telegram</div>
            </div>
            <span className="so-arrow">→</span>
          </a>

          {/* Instagram */}
          <a className="support-option" href={instagramLink} target="_blank" rel="noreferrer">
            <span className="so-icon">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <defs>
                  <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f09433"/>
                    <stop offset="25%" stopColor="#e6683c"/>
                    <stop offset="50%" stopColor="#dc2743"/>
                    <stop offset="75%" stopColor="#cc2366"/>
                    <stop offset="100%" stopColor="#bc1888"/>
                  </linearGradient>
                </defs>
                <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </span>
            <div className="so-info">
              <div className="so-name">Instagram</div>
              <div className="so-desc">DM us on Instagram</div>
            </div>
            <span className="so-arrow">→</span>
          </a>

          {/* WhatsApp */}
          <a className="support-option" href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer">
            <span className="so-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </span>
            <div className="so-info">
              <div className="so-name">WhatsApp</div>
              <div className="so-desc">Chat on WhatsApp</div>
            </div>
            <span className="so-arrow">→</span>
          </a>
        </div>
      )}

      {/* Live Chat window */}
      {chatOpen && (
        <div className="support-chat">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🛡️</div>
              <div>
                <div className="chat-name">Aviator Support</div>
                <div className="chat-status">
                  <span className="chat-online-dot"/>Online • 24/7
                </div>
              </div>
            </div>
            <button className="chat-close" onClick={() => setChatOpen(false)}>×</button>
          </div>

          {!nameSubmitted ? (
            <div className="chat-name-form">
              <div className="chat-welcome">👋 Welcome! Please enter your name to start chatting.</div>
              <input
                className="chat-name-input"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && name.trim() && setNameSubmitted(true)}
              />
              <button
                className="chat-start-btn"
                onClick={() => name.trim() && setNameSubmitted(true)}
              >
                Start Chat
              </button>
            </div>
          ) : (
            <>
              <div className="chat-messages">
                {messages.map((m, i) => (
                  <div key={i} className={`chat-msg ${m.from}`}>
                    {m.from === 'support' && <div className="chat-msg-avatar">🛡️</div>}
                    <div className="chat-msg-content">
                      <div className="chat-msg-text">{m.text}</div>
                      <div className="chat-msg-time">{formatTime(m.time)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="chat-input-row">
                <input
                  className="chat-input"
                  placeholder="Type your message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                />
                <button className="chat-send" onClick={sendMessage}>➤</button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
