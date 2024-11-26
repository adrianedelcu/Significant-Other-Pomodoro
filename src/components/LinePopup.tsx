import React, { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';

const encouragingMessages = [
  "Minami-chan! Your dedication is truly inspiring! 頑張って! 🌟",
  "ミナミちゃん、今日も素晴らしい一日を過ごしてね! ✨",
  "Minami, you're absolutely glowing today! Keep shining! 🎉",
  "私の大切なミナミ、あなたの頑張りを誇りに思います! 💪",
  "Minami-chan, your smile brightens everyone's day! 🌈",
  "ミナミ、あなたは本当に素晴らしい人です! 🌍",
  "Watching you work so hard makes me proud, Minami! ⭐",
  "ミナミちゃん、一緒に頑張ろうね! 🎊",
  "Minami, you're stronger than you know! 💫",
  "今日のミナミちゃんも可愛いね! ☀️",
  "Keep that beautiful smile going, Minami-chan! 😊",
  "ミナミ、あなたは最高です! 🚀",
  "Minami, your potential knows no bounds! 🌠",
  "私はいつもミナミを信じています! 💝",
  "Minami-chan, you bring so much joy to my life! 🎈"
];

interface Message {
  id: string;
  text: string;
  timestamp: string;
  sender: 'Adrian' | 'System';
}

interface LinePopupProps {
  show: boolean;
  onClose: () => void;
}

export function LinePopup({ show, onClose }: LinePopupProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const stored = localStorage.getItem('line-chat-messages');
    return stored ? JSON.parse(stored) : [];
  });
  const [isMinimized, setIsMinimized] = useState(!show);

  useEffect(() => {
    setIsMinimized(!show);
  }, [show]);

  useEffect(() => {
    if (show) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)],
        timestamp: new Date().toISOString(),
        sender: 'Adrian'
      };

      const systemMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '✨ Completed another productive session! ✨',
        timestamp: new Date().toISOString(),
        sender: 'System'
      };

      setMessages(prev => {
        const updated = [...prev, systemMessage, newMessage].slice(-50);
        localStorage.setItem('line-chat-messages', JSON.stringify(updated));
        return updated;
      });

      const timer = setTimeout(() => {
        setIsMinimized(true);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const formatTime = (timestamp: string) => {
    return new Intl.DateTimeFormat('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(timestamp));
  };

  const formatDate = (timestamp: string) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(timestamp));
  };

  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach(message => {
      const date = message.timestamp.split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
    });
    return groups;
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-[#00B900] rounded-full shadow-lg flex items-center justify-center hover:bg-[#00A000] transition-colors z-50"
        aria-label="Open chat"
      >
        <MessageCircle className="text-white" size={24} />
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
      </button>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <div className="fixed bottom-0 right-0 md:bottom-4 md:right-4 w-full md:w-[380px] h-[100vh] md:h-[600px] bg-[#1A202C] dark:bg-gray-900 md:rounded-lg shadow-xl flex flex-col z-50 transition-colors">
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-[#2D3748] dark:bg-gray-800 md:rounded-t-lg transition-colors">
        <div className="flex items-center flex-1">
          <img
            src="https://i.pravatar.cc/40?img=3"
            alt="Adrian"
            className="w-10 h-10 rounded-full border-2 border-[#00B900]"
          />
          <h3 className="ml-3 text-white font-medium">Adrian</h3>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-gray-400 hover:text-white transition-colors p-2"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-[#1A202C] dark:bg-gray-900 p-4 space-y-6 transition-colors">
        {Object.entries(messageGroups).map(([date, msgs]) => (
          <div key={date} className="space-y-4">
            <div className="text-center">
              <span className="inline-block bg-gray-700 dark:bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full transition-colors">
                {formatDate(date)}
              </span>
            </div>
            {msgs.map(message => (
              <div key={message.id} className="space-y-1">
                {message.sender === 'System' ? (
                  <div className="text-center">
                    <span className="inline-block bg-gray-700/50 dark:bg-gray-800/50 text-gray-300 text-xs px-3 py-1 rounded-full transition-colors">
                      {message.text}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-end gap-2">
                      <img
                        src="https://i.pravatar.cc/24?img=3"
                        alt="Adrian"
                        className="w-6 h-6 rounded-full mb-1"
                      />
                      <div className="bg-[#00B900] text-white rounded-2xl rounded-bl-none px-4 py-2 max-w-[80%] break-words">
                        <p>{message.text}</p>
                      </div>
                    </div>
                    <span className="text-gray-500 text-xs ml-8">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-[#2D3748] dark:bg-gray-800 p-3 md:rounded-b-lg transition-colors">
        <button
          onClick={() => setIsMinimized(true)}
          className="w-full py-3 bg-[#00B900] text-white font-medium rounded-lg hover:bg-[#00A000] transition-colors"
        >
          Start Chat
        </button>
      </div>
    </div>
  );
}