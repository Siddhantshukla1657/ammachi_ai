import React, { useState, useEffect } from 'react';
import './chat.css';
import Sidebar from '../components/Sidebar.jsx';
import TranslatedText from '../components/TranslatedText';
import { useLanguage } from '../context/LanguageContext';
import { translate } from '../utils/translate';

export default function Chat(){
  // Get current language from context
  const { language } = useLanguage();
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: 'Hello! I am Ammachi AI, your farming assistant. How can I help you today?\n\nസ്വാഗതം! എനിക്ക് സഹായം വേണോ?' , time: '2:26:16 PM' }
  ]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState(language === 'Malayalam' ? 'ml' : 'en'); // 'en' or 'ml'
  
  // Update lang when language context changes
  useEffect(() => {
    setLang(language === 'Malayalam' ? 'ml' : 'en');
  }, [language]);

  // Update messages and quick questions when language changes
  useEffect(() => {
    const initialMessage = lang === 'ml' 
      ? 'നമസ്കാരം! ഞാൻ അമ്മച്ചി AI ആണ്, നിങ്ങളുടെ കൃഷി സഹായി. എനിക്ക് എങ്ങനെ സഹായിക്കാൻ കഴിയും?'
      : 'Hello! I am Ammachi AI, your farming assistant. How can I help you today?';
    
    setMessages([{
      id: 1, 
      from: 'bot', 
      text: initialMessage,
      time: new Date().toLocaleTimeString()
    }]);
  }, [lang]);

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
        body: JSON.stringify({ 
          message: m.text,
          language: lang,
          sessionId: `chat-${Date.now()}`
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now()+1, from: 'bot', text: data.reply || 'Sorry, I could not understand that.', time: new Date().toLocaleTimeString() }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now()+2, from: 'bot', text: 'Sorry, there was a problem connecting to the AI.', time: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
    }
  }

  const quick = lang === 'ml' 
    ? ['നെല്ലിന് രോഗം എങ്ങനെ കണ്ടറിയാം?', 'തെങ്ങിന് നടാൻ എപ്പോളാണ് നല്ല സമയം?', 'ഌർഗാനിക് കീട നിയന്ത്രണ രീതികൾ', 'മഴക്കാല കൃഷി സലാഹങ്ങൾ']
    : ['How to identify rice blast disease?', 'Best time to plant coconut?', 'Organic pest control methods', 'Monsoon farming tips'];

  return (
    <div className="chat-layout">
      <Sidebar />
      <main className="chat-main">
        <div className="chat-container">
          <header className="chat-header">
            <div className="chat-header-left">
              <div className="assistant-badge">Ammachi AI</div>
              <div className="assistant-sub"><TranslatedText text="Your Farming Assistant" /></div>
            </div>
            <div className="chat-header-right">
              {/* Language toggle switch */}
              <div className="lang-toggle-pill">
                <button
                  className={`lang-toggle-option${lang === 'en' ? ' active' : ''}`}
                  onClick={() => setLang('en')}
                  type="button"
                >
                  English
                </button>
                <button
                  className={`lang-toggle-option${lang === 'ml' ? ' active' : ''}`}
                  onClick={() => setLang('ml')}
                  type="button"
                >
                  മലയാളം
                </button>
                <span className={`lang-toggle-slider ${lang === 'ml' ? 'right' : ''}`}></span>
              </div>
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
            <input 
              className="chat-input" 
              placeholder={lang === 'ml' ? 'കൃഷിയെ കുറിച്ച് എന്തെങ്കിലും ചോദിക്കൂ...' : 'Ask me anything about farming...'} 
              value={query} 
              onChange={(e)=>setQuery(e.target.value)} 
            />
            <button className="chat-send" type="submit">➤</button>
          </form>
        </div>
      </main>
    </div>
  );
}
