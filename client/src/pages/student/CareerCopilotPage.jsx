import React, { useEffect, useState, useRef } from 'react';
import {
  Sparkles,
  Send,
  User,
  Bot,
  Briefcase,
  Compass,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const STARTER_PROMPTS = [
  'Recommend internships that match my profile skills and preferences',
  'Analyze what skills I should add to my resume for full-stack engineering',
  'Give me tips on answering "Tell me about a challenging technical project"',
  'Search for remote developer internships currently open'
];

export const CareerCopilotPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am your InternHub Career Copilot. I can help you discover matching internships, analyze skill gaps, polish your resume, and prepare for interviews. What would you like to explore today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Load user conversation list
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await api.get('/ai/copilot/conversations');
        if (res.success && res.data) {
          setConversations(res.data);
        }
      } catch (err) {
        // non-blocking
      }
    };
    loadConversations();
  }, []);

  const handleSelectConversation = async (convId) => {
    try {
      const res = await api.get(`/ai/copilot/conversations/${convId}`);
      if (res.success && res.data) {
        setActiveConversationId(convId);
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load thread:', err);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || sending) return;

    const userMessage = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const res = await api.post('/ai/copilot/chat', {
        message: text.trim(),
        conversationId: activeConversationId || undefined
      });

      if (res.success && res.data) {
        if (res.data.conversationId) {
          setActiveConversationId(res.data.conversationId);
        }
        if (res.data.message) {
          setMessages(prev => [...prev, res.data.message]);
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Apologies, I encountered an issue retrieving data: ${err.message}. Please try again.`
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([
      {
        role: 'assistant',
        content: `Started a new session! Ask me about roles, interview preparation, or skill requirements.`
      }
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Title */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">AI Intelligence</p>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
            Career Copilot <Sparkles className="h-5 w-5 text-indigo-600" />
          </h1>
        </div>
        <button
          onClick={handleNewChat}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-indigo-600" /> New Chat
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="glass-card flex-1 min-h-0 rounded-3xl bg-white border border-slate-200 flex flex-col overflow-hidden shadow-sm">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={i}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-xs">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  {msg.content}
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {sending && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-xs">
                <Bot className="h-4 w-4 animate-spin" />
              </div>
              <div className="rounded-2xl rounded-tl-none bg-slate-100 px-4 py-3 text-xs text-slate-500 flex items-center gap-1.5">
                <span className="animate-pulse">Thinking & retrieving verified internship intelligence...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Starter Prompts (if chat is short) */}
        {messages.length <= 2 && (
          <div className="p-4 bg-slate-50/80 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Suggested Topics
            </span>
            <div className="flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-all text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input Box */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Copilot about internships, skill requirements, or interview prep..."
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={sending || !input.trim()}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerCopilotPage;
