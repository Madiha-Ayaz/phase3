'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AdvancedChatInterfaceProps {
  onTaskAction?: () => void;
  className?: string;
  initialMessages?: Message[];
}

export const AdvancedChatInterface: React.FC<AdvancedChatInterfaceProps> = ({
  onTaskAction,
  className = '',
  initialMessages = []
}) => {
  const [messages, setMessages] = useState<Message[]>([
    ...initialMessages,
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your advanced AI assistant. You can ask me to create, list, update, or delete tasks using natural language. I can also help you manage priorities and deadlines.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sample suggestions to help users interact with the AI
  const sampleSuggestions = [
    "Add a new task: Buy groceries",
    "Show me my tasks",
    "Mark task as completed",
    "Update my urgent tasks",
    "Set deadline for project"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    // Hide suggestions after user sends a message
    setShowSuggestions(false);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);

    try {
      // Send message to backend
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Add network timeout simulation for better UX
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      // Use the API URL from environment, with fallback for development
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      // Send message as query parameter instead of JSON body
      const url = new URL(`${apiUrl}/api/chat`);
      url.searchParams.append('message', inputValue.trim());

      console.log('Making API call to:', url.toString());
      console.log('Using token:', token.substring(0, 20) + '...'); // Log first 20 chars for debugging

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Try to get detailed error message from response
        let errorMsg = `Failed to get response from AI: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorData.message || errorMsg;
        } catch (e) {
          // If response is not JSON, use the status text
          console.warn('Non-JSON error response:', await response.text().catch(() => 'Unable to read error response'));
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      // Add AI response
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Trigger task refresh if needed
      if (onTaskAction) {
        onTaskAction();
      }
    } catch (error: any) {
      console.error('Error sending message:', error);

      let errorMessageText = 'Sorry, I encountered an error processing your request. Please try again.';

      // Handle different types of errors appropriately
      if (error.name === 'AbortError') {
        errorMessageText = 'Request timed out. Please check your connection and try again.';
      } else if (error.message && error.message.includes('Failed to fetch')) {
        errorMessageText = 'Unable to connect to the server. Please make sure the backend is running on http://localhost:8000.';
      } else if (error.message && (error.message.includes('401') || error.message.toLowerCase().includes('unauthorized'))) {
        errorMessageText = 'Authentication error. Please log out and log back in to refresh your session.';
      } else if (error.message && error.message.includes('404')) {
        errorMessageText = 'API endpoint not found. Please check if the backend is properly configured.';
      } else if (error.message) {
        errorMessageText = `Error: ${error.message}`;
      } else if (typeof error === 'object' && error !== null) {
        // Handle case where error is an object without a message property
        errorMessageText = `Error: ${JSON.stringify(error)}`;
      } else {
        // Handle any other unexpected error types
        errorMessageText = `Error: ${String(error)}`;
      }

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: errorMessageText,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
          <span className="ml-2 text-xs text-purple-300 bg-purple-900/50 px-2 py-1 rounded-full">
            Online
          </span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-grow overflow-y-auto mb-4 space-y-4 pr-2 p-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
          />
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl p-4 bg-white/10 text-white rounded-bl-none">
              <div className="flex items-center">
                <div className="animate-pulse">Typing</div>
                <div className="ml-2 flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length === 0 && (
        <div className="px-4 pb-2">
          <div className="text-xs text-gray-400 mb-2">Try asking:</div>
          <div className="flex flex-wrap gap-2">
            {sampleSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-lg transition-all border border-white/10"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me to manage your tasks..."
            className="flex-grow bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !inputValue.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSending ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};