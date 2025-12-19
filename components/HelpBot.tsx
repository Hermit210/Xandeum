"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
};

const HELP_RESPONSES: Record<string, string> = {
  // General questions
  "what is xandeum": "Xandeum is a decentralized storage network built on Solana. pNodes (participant nodes) provide storage capacity using erasure coding technology.",
  "what is pnode": "pNodes are participant nodes in the Xandeum network. They provide decentralized storage for the Solana ecosystem.",
  "what is this dashboard": "This is a real-time monitoring dashboard for Xandeum DevNet nodes. It shows live node status, versions, locations, and network health.",
  
  // Node status questions
  "what does active mean": "Active means the node was last seen within 30 seconds and is currently participating in the network.",
  "what does warning mean": "Warning means the node was last seen 30-120 seconds ago and may be experiencing connectivity issues.",
  "what does offline mean": "Offline means the node hasn't been seen for over 120 seconds and is not currently responding.",
  "node status": "Nodes have 3 statuses: Active (seen <30s ago), Warning (30-120s ago), and Offline (>120s ago).",
  
  // Uptime questions
  "what is uptime": "Uptime shows recent activity based on last_seen_timestamp. 100% means the node was seen within the last 30 seconds. This is NOT historical uptime.",
  "uptime percentage": "The uptime percentage is calculated based on how recently the node was seen. It's a real-time metric, not a historical average.",
  
  // Version questions
  "node version": "The version shows which software version the pNode is running. Newer versions may have bug fixes and improvements.",
  "latest version": "Check the version distribution chart in Analytics to see which versions are most common in the network.",
  
  // Location questions
  "node location": "Node locations are determined by IP geolocation. This shows the geographic distribution of the Xandeum network.",
  "why location matters": "Geographic distribution helps ensure network resilience and reduces latency for users in different regions.",
  
  // Technical questions
  "how often refresh": "The dashboard automatically refreshes every 30 seconds to show the latest node data from the DevNet network.",
  "data source": "Data is fetched from public Xandeum DevNet pRPC endpoints using the xandeum-prpc client library.",
  "public key": "The public key is the unique identifier for each pNode on the network. Click any node row to see the full public key.",
  
  // Filtering questions
  "how to filter": "Use the filter buttons at the top to show only Active, Warning, or Offline nodes. You can also filter by version using the dropdown.",
  "how to search": "Use the search box to find nodes by public key, IP address, or city name.",
  "how to sort": "Click any column header to sort by that field. Click again to reverse the sort order.",
  
  // Error questions
  "no nodes showing": "If no nodes are showing, the RPC endpoints may be temporarily unavailable. The dashboard will retry automatically every 30 seconds.",
  "empty dashboard": "An empty dashboard means all pRPC endpoints are currently unreachable. This is temporary - the system will keep trying.",
  "connection error": "Connection errors are handled gracefully. The dashboard will show an empty state and retry automatically.",
  
  // Analytics questions
  "analytics": "Click the Analytics button in the navigation to see charts showing version distribution, activity timeline, and status breakdown.",
  "version chart": "The version distribution chart shows which software versions are running across all nodes in the network.",
  
  // DevNet questions
  "what is devnet": "DevNet is Xandeum's development network where new features are tested before being deployed to production.",
  "devnet vs mainnet": "DevNet is for testing and development. It may have more instability than MainNet but allows developers to experiment safely.",
  
  // Help questions
  "help": "I can answer questions about the dashboard, node status, uptime, versions, filtering, and more. Try asking 'what is a pNode?' or 'how to filter nodes?'",
  "commands": "You can ask me about: node status, uptime, versions, locations, filtering, searching, analytics, DevNet, and more!",
};

const getResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // Check for exact or partial matches
  for (const [key, response] of Object.entries(HELP_RESPONSES)) {
    if (lowerMessage.includes(key)) {
      return response;
    }
  }
  
  // Default response
  return "I'm here to help! Try asking about:\n• Node status (active, warning, offline)\n• Uptime and versions\n• How to filter or search nodes\n• What is Xandeum or pNode\n• Analytics and charts\n\nOr type 'help' to see all topics I can assist with.";
};

export default function HelpBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi! I'm your Xandeum Dashboard assistant. Ask me anything about nodes, status, filtering, or how to use the dashboard!",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Get bot response
    const botResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: getResponse(inputValue),
      isBot: true,
      timestamp: new Date(),
    };

    // Add bot response after a short delay
    setTimeout(() => {
      setMessages((prev) => [...prev, botResponse]);
    }, 500);

    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-[#0d1425] rounded-2xl shadow-2xl border border-[#14b8a6]/20 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#14b8a6] to-[#0d9488] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold">Help Assistant</h3>
                  <p className="text-white/80 text-xs">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.isBot
                        ? "bg-[#14b8a6]/10 text-white border border-[#14b8a6]/20"
                        : "bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#14b8a6]/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-[#0d1b3a] text-white px-4 py-2 rounded-full border border-[#14b8a6]/20 focus:border-[#14b8a6]/40 outline-none text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
