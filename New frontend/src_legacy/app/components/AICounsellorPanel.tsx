import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { X, Send, Sparkles, CheckCircle, Star, Lock, MessageSquare } from 'lucide-react';
import { useApp, ChatMessage } from '@/app/context/AppContext';
import { aiCounsellorAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'motion/react';

export function AICounsellorPanel({ onClose }: { onClose: () => void }) {
  const { chatMessages, setChatMessages, shortlistUniversity, lockUniversity, addTodo, universities, loadUserData } = useApp();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiCounsellorAPI.chat(inputMessage);
      const aiResponse = response.data;

      const newAiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: aiResponse.message,
        timestamp: new Date(),
        actions: aiResponse.actions // Ensure actions are preserved if backend sends them
      };

      const newMessages = [...updatedMessages, newAiMessage];
      setChatMessages(newMessages);

      if (aiResponse.action && aiResponse.action.type !== 'none') {
        if (aiResponse.updated_stage) {
          await loadUserData();
        }
      }

    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: any) => {
    if (action.type === 'shortlist_university') {
      await shortlistUniversity(action.university_id.toString());
    } else if (action.type === 'lock_university') {
      await lockUniversity(action.university_id.toString());
    } else if (action.type === 'create_task') {
      await addTodo(action.title, action.description);
    }
  };

  const getActionLabel = (action: any) => {
    if (action.type === 'shortlist_university') {
      const uni = universities.find(u => u.id === action.university_id.toString());
      return `Shortlist ${uni ? uni.name : 'University'}`;
    }
    if (action.type === 'lock_university') {
      const uni = universities.find(u => u.id === action.university_id.toString());
      return `Lock ${uni ? uni.name : 'University'}`;
    }
    if (action.type === 'create_task') {
      return `Add Task: ${action.title}`;
    }
    return 'Action';
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 backdrop-blur-md rounded-3xl overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white/80 border-b border-slate-100 backdrop-blur-sm z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">AI Counsellor</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs text-slate-500 font-medium">Online & Ready</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
          <X className="w-5 h-5 text-slate-500" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 scroll-smooth">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-indigo-300" />
            </div>
            <p className="text-slate-500 font-medium">No messages yet.</p>
            <p className="text-xs text-slate-400 mt-1">Start chatting to get guidance!</p>
          </div>
        )}

        {chatMessages.map(message => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 shadow-sm ${message.type === 'user' ? 'bg-indigo-100' : 'bg-white border border-slate-100'}`}>
              {message.type === 'user' ? <div className="w-3 h-3 bg-indigo-500 rounded-full" /> : <Sparkles className="w-4 h-4 text-indigo-600" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${message.type === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-sm'
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
                }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.content}</div>

              {message.actions && message.actions.length > 0 && (
                <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-slate-100/20">
                  <p className="text-xs opacity-70 mb-1 font-semibold uppercase tracking-wider">Suggested Actions</p>
                  {message.actions.map((action, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      variant={message.type === 'user' ? 'secondary' : 'outline'}
                      className={`text-xs justify-start h-auto py-2.5 px-3 text-left w-full transition-all ${message.type === 'user'
                          ? 'bg-white/10 hover:bg-white/20 text-white border-none'
                          : 'hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 bg-slate-50 border-slate-200'
                        }`}
                      onClick={() => handleAction(action)}
                    >
                      {action.type === 'shortlist_university' && <Star className={`w-3.5 h-3.5 mr-2 ${message.type === 'user' ? 'text-amber-300' : 'text-amber-500'}`} />}
                      {action.type === 'lock_university' && <Lock className={`w-3.5 h-3.5 mr-2 ${message.type === 'user' ? 'text-indigo-300' : 'text-indigo-500'}`} />}
                      {action.type === 'create_task' && <CheckCircle className={`w-3.5 h-3.5 mr-2 ${message.type === 'user' ? 'text-emerald-300' : 'text-emerald-500'}`} />}
                      {getActionLabel(action)}
                    </Button>
                  ))}
                </div>
              )}

              <p className={`text-[10px] mt-2 text-right ${message.type === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center mt-1">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-100">
        <div className="flex gap-2 items-center bg-white border border-slate-200 rounded-full p-1.5 pl-4 shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
          <input
            placeholder="Ask about universities & applications..."
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400"
          />
          <Button
            onClick={handleSend}
            size="icon"
            className={`rounded-full w-9 h-9 transition-all ${inputMessage.trim() ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            disabled={!inputMessage.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2">AI can make mistakes. Verify important information.</p>
      </div>
    </div>
  );
}
