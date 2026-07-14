import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import api from '../api/axios';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Chào bạn! Mình là trợ lý ảo của Lumière Spa. Mình có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/chatbot/chat', { message: userMessage });
      setMessages(prev => [...prev, { role: 'bot', text: response.data.reply }]);
    } catch (error) {
      console.error("Chatbot error", error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Xin lỗi, hệ thống AI đang gặp sự cố. Bạn vui lòng liên hệ Hotline nhé.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white rounded-3xl shadow-premium-2xl overflow-hidden border border-emerald-100 flex flex-col h-[500px] max-h-[80vh] transition-all duration-300 transform origin-bottom-right">
          {/* Header */}
          <div className="bg-emerald-950 p-4 flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-gold to-yellow-600 p-2 rounded-xl shadow-inner">
                <Sparkles className="w-5 h-5 text-emerald-950" />
              </div>
              <div>
                <h3 className="font-serif font-black text-sm tracking-widest uppercase">Lumière AI</h3>
                <p className="text-[10px] text-emerald-200 uppercase tracking-widest font-bold">Trực tuyến</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-emerald-900 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#F0F7F4] space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-emerald-900 text-white rounded-tr-sm' 
                    : 'bg-white text-emerald-950 border border-emerald-100 shadow-sm rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-emerald-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex space-x-2">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-emerald-50">
            <div className="flex items-center bg-[#F0F7F4] rounded-2xl p-1 border border-emerald-100 focus-within:border-emerald-300 transition-colors">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm text-emerald-950 placeholder-emerald-800/40"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-emerald-900 text-gold rounded-xl hover:bg-emerald-800 disabled:opacity-50 transition-colors shadow-premium-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-emerald-950 text-gold p-4 rounded-full shadow-premium-lg hover:shadow-premium-xl hover:scale-110 transition-all duration-300 group relative border border-gold/30"
        >
          <div className="absolute inset-0 bg-gold/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <MessageSquare className="w-7 h-7 relative z-10" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-[#F0F7F4] animate-pulse"></div>
        </button>
      )}
    </div>
  );
}
