"use client";

import { useState, useEffect, useRef } from "react";
import { helpTopics } from "@/components/helpContent";

// Component to render text with clickable links
function MessageWithLinks({ text, isBold }: { text: string; isBold?: boolean }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const boldRegex = /\*\*(.*?)\*\*/g;
  
  // Split by URLs first
  const urlParts: Array<{ type: 'url' | 'text'; content: string }> = [];
  let lastIndex = 0;
  let match;
  
  // Find all URLs
  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      urlParts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    urlParts.push({ type: 'url', content: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    urlParts.push({ type: 'text', content: text.substring(lastIndex) });
  }
  
  if (urlParts.length === 0) {
    urlParts.push({ type: 'text', content: text });
  }

  return (
    <>
      {urlParts.map((part, index) => {
        if (part.type === 'url') {
          return (
            <a
              key={index}
              href={part.content}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-[#0d9488] hover:text-[#14b8a6] underline break-all transition-colors ${isBold ? 'font-bold' : 'font-medium'}`}
            >
              {part.content}
            </a>
          );
        }
        
        // Process bold markers in text
        const textParts: Array<{ content: string; bold: boolean }> = [];
        let textLastIndex = 0;
        let boldMatch;
        
        while ((boldMatch = boldRegex.exec(part.content)) !== null) {
          if (boldMatch.index > textLastIndex) {
            textParts.push({ content: part.content.substring(textLastIndex, boldMatch.index), bold: false });
          }
          textParts.push({ content: boldMatch[1], bold: true });
          textLastIndex = boldMatch.index + boldMatch[0].length;
        }
        if (textLastIndex < part.content.length) {
          textParts.push({ content: part.content.substring(textLastIndex), bold: false });
        }
        
        if (textParts.length === 0) {
          textParts.push({ content: part.content, bold: isBold || false });
        }
        
        return (
          <span key={index}>
            {textParts.map((tp, tpIndex) => (
              <span key={tpIndex} className={`text-[#14b8a6] ${tp.bold || isBold ? 'font-bold' : ''}`}>
                {tp.content}
              </span>
            ))}
          </span>
        );
      })}
    </>
  );
}

type Props = {
  stats: {
    total: number;
    active: number;
    warning?: number;
    offline?: number;
    versions?: number;
    uniqueIPs?: number;
  };
};

type Message = {
  from: "bot" | "user";
  text: string;
  isInitial?: boolean;
};

export default function HelpBot({ stats }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Hi! Ask me anything about this dashboard. **Stake details (including staking rewards, APY, APR, yield, and earnings) will be displayed here in the future once they are added to the system.**", isInitial: true },
  ]);
  const [input, setInput] = useState("");
  const botRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close bot when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (botRef.current && !botRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Enhanced matching algorithm - finds best match across all keywords
  const findBestMatch = (userMsg: string): string | null => {
    const lowerMsg = userMsg.toLowerCase().trim();
    
    // First, try exact phrase matches, prioritizing longer keywords (more specific)
    const matches: Array<{ topic: typeof helpTopics[0], keywordLength: number }> = [];
    
    for (const topic of helpTopics) {
      for (const keyword of topic.keywords) {
        const keywordLower = keyword.toLowerCase();
        if (lowerMsg.includes(keywordLower)) {
          matches.push({ topic, keywordLength: keywordLower.length });
        }
      }
    }

    // Return the match with the longest keyword (most specific)
    if (matches.length > 0) {
      matches.sort((a, b) => b.keywordLength - a.keywordLength);
      return matches[0].topic.answer(stats);
    }

    // Then try word-by-word matching for better coverage
    const words = lowerMsg.split(/\s+/).filter(w => w.length > 2);
    if (words.length > 0) {
      for (const topic of helpTopics) {
        const keywordWords = topic.keywords.flatMap(k => k.toLowerCase().split(/\s+/));
        const matchCount = words.filter(w => keywordWords.some(kw => kw.includes(w) || w.includes(kw))).length;
        
        // If more than 30% of words match, consider it a match
        if (matchCount > 0 && matchCount / words.length >= 0.3) {
          return topic.answer(stats);
        }
      }
    }

    return null;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    let reply: string | null = findBestMatch(userMsg);

    if (!reply) {
      // Try to provide a helpful response for general questions
      const lowerMsg = userMsg.toLowerCase();
      if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey")) {
        reply = "Hello! I'm here to help you with the Xandeum pNode Analytics dashboard. Ask me about nodes, status, filtering, searching, analytics, or any other features!";
      } else if (lowerMsg.includes("thank") || lowerMsg.includes("thanks")) {
        reply = "You're welcome! Feel free to ask if you need more help with the dashboard.";
      } else {
        reply = "I can help you with questions about the Xandeum pNode Analytics dashboard. Try asking about: node status, filtering, searching, sorting, analytics, versions, uptime, refresh, or navigation. What would you like to know?";
      }
    }

    setMessages(prev => [
      ...prev,
      { from: "user" as const, text: userMsg },
      { from: "bot" as const, text: reply },
    ]);

    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-[#14b8a6] hover:bg-[#0d9488] rounded-full shadow-2xl flex items-center justify-center text-3xl z-50 transition-all transform hover:scale-110 active:scale-95"
        aria-label="Open help bot"
      >
        💬
      </button>
    );
  }

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 md:hidden"
        onClick={() => setIsOpen(false)}
      />
      
      <div 
        ref={botRef}
        className="fixed bottom-6 right-6 w-[calc(100%-3rem)] md:w-[420px] lg:w-[480px] bg-[#0d1425] border-2 border-[#14b8a6]/40 rounded-2xl shadow-2xl p-5 text-sm z-50 flex flex-col max-h-[700px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#14b8a6]/30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#14b8a6] animate-pulse"></div>
            <h3 className="text-[#14b8a6] font-black text-lg">Help Bot</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors text-2xl font-bold leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#14b8a6]/10"
            aria-label="Close help bot"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[250px] max-h-[450px] pr-2 scrollbar-thin scrollbar-thumb-[#14b8a6]/30 scrollbar-track-transparent">
          {messages.map((m, i) => {
            const isInitial = m.isInitial;
            return (
              <div
                key={i}
                className={`${
                  m.from === "bot" 
                    ? "text-[#14b8a6] bg-gradient-to-r from-[#050b1f]/80 to-[#050b1f]/40 rounded-xl p-3 border border-[#14b8a6]/20" 
                    : "text-white text-right bg-[#14b8a6]/10 rounded-xl p-3 border border-[#14b8a6]/20"
                }`}
              >
                <div className={`whitespace-pre-wrap break-words text-sm leading-relaxed ${isInitial ? 'font-bold' : ''}`}>
                  {m.from === "bot" ? (
                    <MessageWithLinks text={m.text} isBold={isInitial} />
                  ) : (
                    <span className="font-medium">{m.text}</span>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3 pt-3 border-t-2 border-[#14b8a6]/30">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-[#050b1f] border-2 border-[#14b8a6]/30 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20 transition-all placeholder:text-gray-500"
            placeholder="Ask about nodes, uptime, analytics..."
            autoFocus
          />
          <button
            onClick={handleSend}
            className="bg-[#14b8a6] hover:bg-[#0d9488] px-5 py-2.5 rounded-lg text-white font-black text-sm transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#14b8a6]/20"
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}