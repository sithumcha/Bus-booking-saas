import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User as UserIcon } from 'lucide-react';
import api from '../services/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your BusSaaS AI Assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [trips, setTrips] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Fetch active trips from database to query when user asks about routes
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data } = await api.get('/trips');
        setTrips(data || []);
      } catch (err) {
        console.error('Failed to fetch trips for AI Chatbot', err);
      }
    };
    fetchTrips();
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleQuickReply = (query) => {
    sendMessage(query);
  };

  const sendMessage = (text) => {
    // Add user message
    const newMsg = { id: Date.now(), text, isBot: false };
    setMessages(prev => [...prev, newMsg]);
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const responseText = getBotResponse(text.toLowerCase());
      setMessages(prev => [...prev, { id: Date.now() + 1, text: responseText, isBot: true }]);
      setIsTyping(false);
    }, 1200);
  };

  const getBotResponse = (text) => {
    const textLower = text.toLowerCase();

    // Check if the user is asking for available buses, routes, or seats
    if (
      textLower.includes('bus') || 
      textLower.includes('route') || 
      textLower.includes('schedule') || 
      textLower.includes('trip') || 
      textLower.includes('travel') || 
      textLower.includes('go to') || 
      textLower.includes('to') || 
      textLower.includes('from') ||
      textLower.includes('seat') ||
      textLower.includes('avail')
    ) {
      // Find all unique locations from current trips data
      const locations = Array.from(
        new Set(
          trips.flatMap(t => [
            t.route?.from?.toLowerCase(), 
            t.route?.to?.toLowerCase()
          ].filter(Boolean))
        )
      );

      let matchedDest = '';
      let matchedOrigin = '';

      // Check if text states "to <city>" or "from <city>"
      locations.forEach(loc => {
        if (
          textLower.includes(`to ${loc}`) || 
          textLower.includes(`to: ${loc}`) || 
          textLower.includes(`going to ${loc}`) || 
          textLower.includes(`travel to ${loc}`)
        ) {
          matchedDest = loc;
        }
        if (
          textLower.includes(`from ${loc}`) || 
          textLower.includes(`from: ${loc}`) || 
          textLower.includes(`starting from ${loc}`) ||
          textLower.includes(`depart from ${loc}`)
        ) {
          matchedOrigin = loc;
        }
      });

      // Fallback: search for any location mention in text if no explicit directions are found
      if (!matchedDest) {
        const mentioned = locations.filter(loc => textLower.includes(loc));
        if (mentioned.length > 0) {
          if (mentioned.length >= 2) {
            const firstIndex = textLower.indexOf(mentioned[0]);
            const secondIndex = textLower.indexOf(mentioned[1]);
            if (firstIndex < secondIndex) {
              matchedOrigin = mentioned[0];
              matchedDest = mentioned[1];
            } else {
              matchedOrigin = mentioned[1];
              matchedDest = mentioned[0];
            }
          } else {
            // Assume single city mention is destination
            matchedDest = mentioned[0];
          }
        }
      }

      // Filter trips
      let matchingTrips = trips;
      if (matchedOrigin) {
        matchingTrips = matchingTrips.filter(t => t.route?.from?.toLowerCase() === matchedOrigin);
      }
      if (matchedDest) {
        matchingTrips = matchingTrips.filter(t => t.route?.to?.toLowerCase() === matchedDest);
      }

      if (matchingTrips.length > 0) {
        let reply = `Here are the available buses for your journey:\n\n`;
        matchingTrips.slice(0, 3).forEach((t, index) => {
          const availableSeats = (t.bus?.totalSeats || 40) - (t.bookedSeats?.length || 0);
          reply += `${index + 1}. **${t.route?.from} ➔ ${t.route?.to}**\n   • Bus: ${t.bus?.brand || 'AC Coach'} (${t.bus?.type || 'Luxury'})\n   • Departure: **${t.departureTime}**\n   • Fare: **LKR ${t.fare}**\n   • Available seats: **${availableSeats}**\n\n`;
        });

        if (matchingTrips.length > 3) {
          reply += `And ${matchingTrips.length - 3} more journeys are scheduled. You can use the search bar on our homepage to see all options!`;
        } else {
          reply += `You can book your seat directly by clicking "Search Rides" in our navigation bar!`;
        }
        return reply;
      } else if (matchedOrigin || matchedDest) {
        return `I couldn't find any direct buses scheduled currently from **${matchedOrigin || 'anywhere'}** to **${matchedDest || 'anywhere'}**. Please try searching for another route or check our fleet catalog.`;
      } else {
        const uniqueOrigins = Array.from(new Set(trips.map(t => t.route?.from).filter(Boolean)));
        return `We currently have routes connecting cities like ${uniqueOrigins.slice(0, 5).join(', ')}. Where would you like to travel? (e.g., type "Colombo to Kandy" or "buses to Galle")`;
      }
    }

    if (textLower.includes('cancel') || textLower.includes('refund')) {
      return "You can cancel your ticket up to 24 hours before departure from your Passenger Dashboard. A small cancellation fee may apply.";
    }
    if (textLower.includes('baggage') || textLower.includes('luggage')) {
      return "Each passenger is allowed 1 hand luggage (max 7kg) and 1 check-in bag (max 20kg). Additional luggage requires an extra fee.";
    }
    if (textLower.includes('contact') || textLower.includes('support')) {
      return "You can reach our human support team at support@bussaas.com or call us at +94 77 123 4567.";
    }
    if (textLower.includes('book') || textLower.includes('ticket')) {
      return "To book a ticket, simply use the search bar on the homepage, select your preferred bus, choose a seat, and complete the payment!";
    }

    return "I'm your AI assistant. You can ask me about available buses (e.g. 'buses to Kandy' or 'Colombo to Galle'), ticket cancellation, luggage rules, or support details!";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white/90 dark:bg-[#0E0E12]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col mb-4 transform transition-all animate-fade-in-up transition-colors duration-300" style={{ height: '500px', maxHeight: '80vh' }}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-blue-600 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Assistant</h3>
                <p className="text-[10px] text-blue-100 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 dark:bg-[#09090B]/50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm whitespace-pre-line ${msg.isBot ? 'bg-white dark:bg-[#121217] border border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300 rounded-tl-sm' : 'bg-primary text-white rounded-tr-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#121217] border border-gray-100 dark:border-white/5 rounded-2xl rounded-tl-sm p-4 shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-[#09090B]/85 flex gap-2 overflow-x-auto whitespace-nowrap border-t border-gray-100 dark:border-white/5 no-scrollbar scroll-smooth">
            {['How to Book', 'Cancel Ticket', 'Luggage Policy', 'Contact Support'].map((query) => (
              <button
                key={query}
                onClick={() => handleQuickReply(query)}
                className="px-3.5 py-1.5 bg-white dark:bg-[#121217] hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white text-xs font-bold text-gray-600 dark:text-gray-300 rounded-full border border-gray-100 dark:border-white/5 cursor-pointer transition-all duration-200 shrink-0 shadow-xs"
              >
                {query}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-[#0E0E12] border-t border-gray-100 dark:border-white/5 flex gap-2">
            <input 
              type="text" 
              className="flex-1 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121217] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-gray-800 dark:text-white"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-primary text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-primary-hover disabled:opacity-50 disabled:dark:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 transition-all duration-300 ${isOpen ? 'bg-red-500 hover:bg-red-600 rotate-90 scale-90' : 'bg-primary hover:bg-primary-hover hover:-translate-y-1'}`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageSquare className="w-6 h-6 text-white" />}
      </button>
    </div>
  );
};

export default Chatbot;
