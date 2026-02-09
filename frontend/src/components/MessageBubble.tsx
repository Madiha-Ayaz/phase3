'use client';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content, timestamp }) => {
  const isUser = role === 'user';

  // Format timestamp to show only time
  const formattedTime = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl p-4 ${
        isUser
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-none'
          : 'bg-white/10 text-white rounded-bl-none'
      }`}>
        <div className="whitespace-pre-wrap break-words">
          {content}
        </div>
        <div className={`text-xs mt-2 ${isUser ? 'text-purple-200' : 'text-gray-400'}`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};