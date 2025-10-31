// Floating chat UI - "Cursor for forms"

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Minimize2, Maximize2, Send, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface FloatingChatProps {
  onClose: () => void;
  onSendMessage: (message: string) => void;
}

export const FloatingChat: React.FC<FloatingChatProps> = ({ onClose, onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: "I'm your form-filling assistant. Tell me how you'd like to fill this form, or ask me to generate content for specific fields.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    onSendMessage(input);
    setInput('');

    // Simulate AI response (placeholder)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I understand. I'll help you fill this form. (Context engine will be integrated here)",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isMinimized) {
    return (
      <div
        className="form-agent-floating-chat-minimized"
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '20px',
          zIndex: 2147483647
        }}
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all animate-fade-in"
        >
          <MessageSquare size={24} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="form-agent-floating-chat"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '400px',
        height: '600px',
        zIndex: 2147483647,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <div className="bg-white rounded-lg shadow-2xl flex flex-col h-full border border-gray-200 animate-slide-in">
        {/* Header */}
        <div
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg cursor-move flex items-center justify-between"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={20} />
            <span className="font-semibold">FormAgent</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <Minimize2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : msg.type === 'system'
                    ? 'bg-yellow-50 text-yellow-900 border border-yellow-200'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me how to fill this form..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press <kbd className="px-1 py-0.5 bg-gray-200 rounded">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl+Shift+Space</kbd> to toggle
          </p>
        </div>
      </div>
    </div>
  );
};
