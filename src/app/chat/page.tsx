"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Send,
  Mic,
  Paperclip,
  Package,
  MapPin,
  DollarSign,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const quickActions = [
  { icon: Package, label: "Book Delivery", action: "book" },
  { icon: MapPin, label: "Track Package", action: "track" },
  { icon: DollarSign, label: "Get Quote", action: "quote" },
  { icon: HelpCircle, label: "FAQs", action: "faq" },
];

const initialMessages: Message[] = [
  {
    id: "1",
    type: "bot",
    content:
      "👋 Hi! I'm AceBot, your intelligent courier assistant. How can I help you today?",
    timestamp: new Date(),
    suggestions: [
      "Book a new delivery",
      "Track my package",
      "Calculate delivery cost",
      "Contact support",
    ],
  },
];

export default function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("book") || lowerMessage.includes("delivery")) {
      return "I can help you book a delivery! To get started, I'll need:\n\n📍 Pickup location\n📍 Delivery location\n📦 Package details\n⚖️ Approximate weight\n\nWould you like to start booking now? I can also calculate an estimated price for you.";
    } else if (lowerMessage.includes("track")) {
      return "To track your package, please provide your tracking ID. It looks like this: ACT-2025-XXX\n\nYou can also find it in your booking confirmation email or SMS.";
    } else if (
      lowerMessage.includes("price") ||
      lowerMessage.includes("cost") ||
      lowerMessage.includes("quote")
    ) {
      return "I'd be happy to calculate a delivery quote! I'll need:\n\n📏 Distance (or pickup & delivery cities)\n⚖️ Package weight\n⚡ Delivery speed (Standard, Express, or Fast Track)\n\nPlease provide these details and I'll give you an instant quote.";
    } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! 👋 I'm here to make your courier experience seamless. What would you like to do today?";
    } else if (lowerMessage.includes("help") || lowerMessage.includes("support")) {
      return "I'm here to help! You can:\n\n📦 Book new deliveries\n📍 Track packages\n💰 Get price quotes\n📞 Contact customer support\n❓ Get answers to FAQs\n\nWhat do you need assistance with?";
    } else {
      return "I understand you're asking about: \"" +
        userMessage +
        "\"\n\nI'm constantly learning! For immediate assistance, you can:\n\n• Use quick actions below\n• Call our 24/7 hotline: 0300-1234567\n• Email: support@acetransit.com\n\nHow else can I help you?";
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate bot typing and response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: generateBotResponse(input),
        timestamp: new Date(),
        suggestions:
          Math.random() > 0.5
            ? ["Yes, proceed", "Tell me more", "Not now", "Contact support"]
            : undefined,
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  const handleQuickAction = (action: string) => {
    if (action === "book") {
      router.push("/booking");
    } else if (action === "track") {
      setInput("I want to track my package");
      handleSend();
    } else if (action === "quote") {
      setInput("I need a price quote");
      handleSend();
    } else if (action === "faq") {
      setInput("Show me frequently asked questions");
      handleSend();
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">AceBot</h1>
                <p className="text-xs text-green-600 font-medium">● Online</p>
              </div>
            </div>
          </div>
          <Badge variant="info" size="sm">
            AI Assistant
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`mb-4 flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] ${
                  message.type === "user" ? "order-2" : "order-1"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-tr-sm"
                      : "bg-white border border-gray-200 text-gray-900 rounded-tl-sm shadow-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      message.type === "user" ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Suggestions */}
                {message.type === "bot" && message.suggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-3 flex flex-wrap gap-2"
                  >
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1.5 bg-white border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-sm text-gray-700 rounded-full transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-4"
          >
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-2 w-2 bg-orange-500 rounded-full"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="px-4 pb-4 max-w-3xl mx-auto w-full"
        >
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.action}
                onClick={() => handleQuickAction(action.action)}
                className="flex flex-col items-center gap-2 p-3 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-xl transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <action.icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xs text-gray-700 text-center font-medium">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 safe-area-inset-bottom">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Paperclip className="h-6 w-6 text-gray-600" />
            </button>

            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                rows={1}
                className="w-full px-4 py-3 pr-12 bg-gray-100 hover:bg-gray-200 focus:bg-white border border-transparent focus:border-orange-500 rounded-xl resize-none outline-none transition-colors"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-lg transition-colors">
                <Mic className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <Button
              size="md"
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 h-12 w-12 p-0"
            >
              <Send className="h-5 w-5" strokeWidth={2.5} />
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-2">
            Powered by AI • Your data is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
