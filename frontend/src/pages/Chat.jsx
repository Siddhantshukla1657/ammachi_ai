import React, { useState } from 'react';
import './chat.css';
import Sidebar from '../components/Sidebar.jsx';

export default function Chat(){
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: 'Hello! I am Ammachi AI, your farming assistant. How can I help you today?\n\nസ്വാഗതം! എനിക്ക് സഹായം വേണോ?' , time: '2:26:16 PM' }
  ]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage(e){
    e.preventDefault();
    if(!query.trim()) return;
    const m = { id: Date.now(), from: 'user', text: query.trim(), time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, m]);
    setQuery('');
    setLoading(true);
    try {
      const res = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: m.text })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now()+1, from: 'bot', text: data.reply || 'Sorry, I could not understand that.', time: new Date().toLocaleTimeString() }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now()+2, from: 'bot', text: 'Sorry, there was a problem connecting to the AI.', time: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
    }
  }

  const quick = ['How to identify rice blast disease?', 'Best time to plant coconut?', 'Organic pest control methods', 'Monsoon farming tips'];

  return (
    <div className="chat-layout">
      <Sidebar />
      <main className="chat-main">
        <div className="chat-container">
          <header className="chat-header">
            <div className="chat-header-left">
              <div className="assistant-badge">Ammachi AI</div>
              <div className="assistant-sub">Your Farming Assistant</div>
            </div>
            <div className="chat-header-right">
              <button className="lang-btn">മലയാളം</button>
              <button className="settings-btn">⚙</button>
            </div>
          </header>

          <section className="chat-window">
            {messages.map(m => (
              <div key={m.id} className={`msg-row ${m.from==='bot'? 'bot':'user'}`}>
                <div className="msg-bubble">{m.text.split('\n').map((line,i)=>(<div key={i}>{line}</div>))}
                  <div className="msg-time">{m.time}</div>
                </div>
              </div>
            ))}
            {loading && <div className="msg-row bot"><div className="msg-bubble">Ammachi AI is typing...</div></div>}
          </section>

          <div className="chat-quick">
            {quick.map((q,i)=>(<button key={i} className="quick-btn" onClick={() => { setQuery(q); }} title={q}>{q}</button>))}
          </div>

          <form className="chat-input-row" onSubmit={sendMessage}>
            <input className="chat-input" placeholder="Ask me anything about farming..." value={query} onChange={(e)=>setQuery(e.target.value)} />
            <button className="chat-send" type="submit">➤</button>
          </form>
        </div>
      </main>
    </div>
  );
}
