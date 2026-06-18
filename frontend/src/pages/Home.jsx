import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  MapPin, Calendar, Search, ArrowRight, ShieldCheck, Zap, ChevronDown, Star,
  Wifi, Coffee, RefreshCw, MessageSquare, Check, HelpCircle, Info, Sparkles, Tv, Wind, Shield, Users, Bus,
  ArrowLeftRight, Compass
} from 'lucide-react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const words = ["Comfortably", "Securely", "Swiftly", "Stylishly"];

const popularRoutes = [
  { from: 'Colombo', to: 'Kandy', price: 1250, time: '3h 15m', trips: 12, label: 'Cultural Capitol', bg: 'from-indigo-600 to-violet-800' },
  { from: 'Colombo', to: 'Galle', price: 950, time: '2h 00m', trips: 16, label: 'Coastal Express', bg: 'from-blue-600 to-indigo-800' },
  { from: 'Colombo', to: 'Jaffna', price: 2400, time: '6h 30m', trips: 6, label: 'Northern Gateway', bg: 'from-emerald-600 to-teal-800' },
  { from: 'Trincomalee', to: 'Colombo', price: 1850, time: '5h 45m', trips: 8, label: 'Eastern Link', bg: 'from-amber-600 to-orange-850' }
];

const demoSeats = [
  { id: '1A', type: 'Window', price: 1200, status: 'available' },
  { id: '1B', type: 'Aisle', price: 1200, status: 'booked' },
  { id: '2A', type: 'Window', price: 1250, status: 'available' },
  { id: '2B', type: 'Aisle', price: 1250, status: 'available' },
  { id: '3A', type: 'Window', price: 1200, status: 'booked' },
  { id: '3B', type: 'Aisle', price: 1200, status: 'available' },
  { id: '4A', type: 'Window', price: 1300, status: 'available' },
  { id: '4B', type: 'Aisle', price: 1300, status: 'available' },
];

const faqs = [
  {
    q: "How far in advance can I book a ticket?",
    a: "You can book tickets up to 30 days in advance. We recommend booking early for holiday seasons to secure your preferred seats."
  },
  {
    q: "Can I choose my specific seat?",
    a: "Yes! Our interactive 3D seat map allows you to select your exact seat location, including window or aisle preference."
  },
  {
    q: "What is the cancellation policy?",
    a: "Tickets can be cancelled up to 24 hours before departure for a full refund minus a small processing fee. Cancellations within 24 hours are non-refundable."
  },
  {
    q: "Do I need a printed ticket to board?",
    a: "No, we are fully digital. You can simply show the Digital Boarding Pass from your passenger dashboard or email on your mobile device."
  },
  {
    q: "Are the buses air-conditioned and equipped with Wi-Fi?",
    a: "All of our VIP Sleeper and Business Class fleet are fully air-conditioned and offer complimentary high-speed Wi-Fi, personal charging ports, and bottled water."
  }
];

const CLIMATES = {
  morning: {
    img: '/premium_luxury_bus_hero_morning.png',
    label: 'Morning Scenic Ride',
    icon: '🌅',
    badgeText: 'Fresh Morning Departure',
    filter: 'brightness(1.05) saturate(1.1)',
    overlay: 'bg-transparent'
  },
  evening: {
    img: '/premium_luxury_bus_hero_morning.png',
    label: 'Sunset Golden Hour',
    icon: '🌇',
    badgeText: 'Golden Sunset Express',
    filter: 'brightness(0.85) sepia(0.4) saturate(1.6) hue-rotate(-10deg)',
    overlay: 'bg-gradient-to-t from-orange-600/40 via-orange-400/20 to-transparent mix-blend-multiply'
  },
  night: {
    img: '/premium_luxury_bus_hero_night.png?v=new2',
    label: 'Midnight Skyline Cruise',
    icon: '🌃',
    badgeText: 'Night Skyline Cruise',
    filter: 'brightness(1) saturate(1.05)',
    overlay: 'bg-transparent'
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: ''
  });

  const [climate, setClimate] = useState(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 16) return 'morning';
    if (hour >= 16 && hour < 19) return 'evening';
    return 'night';
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      let currentMode;
      if (hour >= 6 && hour < 16) currentMode = 'morning';
      else if (hour >= 16 && hour < 19) currentMode = 'evening';
      else currentMode = 'night';
      
      setClimate(currentMode);
    }, 60000); // Check every minute to see if time of day has shifted

    return () => clearInterval(interval);
  }, []);

  const [isSwapping, setIsSwapping] = useState(false);

  const handleSwap = (e) => {
    e.preventDefault();
    if (!searchParams.from && !searchParams.to) return;
    setIsSwapping(true);
    setSearchParams(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
    setTimeout(() => setIsSwapping(false), 500);
  };

  // Parallax Mouse State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Typing Animation State
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // FAQ States
  const [activeFaq, setActiveFaq] = useState(null);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');

  // Fleet Showcase Tab State
  const [activeFleetTab, setActiveFleetTab] = useState('sleeper');

  // Mini Seat Demo Selection State
  const [selectedDemoSeats, setSelectedDemoSeats] = useState([]);

  // Refund Simulator State
  const [refundSimulated, setRefundSimulated] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);

  // Statistics Count-Up State
  const [stats, setStats] = useState({ passengers: 0, cities: 0, trips: 0, rating: 0 });

  // Intersection Observers for Scroll Animations
  const [popularRef, popularVisible] = useScrollAnimation({ threshold: 0.1 });
  const [stepsRef, stepsVisible] = useScrollAnimation({ threshold: 0.1 });
  const [seatDemoRef, seatDemoVisible] = useScrollAnimation({ threshold: 0.15 });
  const [bentoRef, bentoVisible] = useScrollAnimation({ threshold: 0.1 });
  const [fleetRef, fleetVisible] = useScrollAnimation({ threshold: 0.1 });
  const [statsRef, statsVisible] = useScrollAnimation({ threshold: 0.15 });
  const [testimonialsRef, testimonialsVisible] = useScrollAnimation({ threshold: 0.1 });
  const [faqRef, faqVisible] = useScrollAnimation({ threshold: 0.1 });

  // Check if counter has run to prevent resets
  const countRun = useRef(false);

  // Parallax Event Listener
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Text Typing Animation
  useEffect(() => {
    let typingSpeed = isDeleting ? 50 : 100;
    
    if (!isDeleting && currentText === words[currentWordIndex]) {
      typingSpeed = 2000;
      setTimeout(() => setIsDeleting(true), typingSpeed);
      return;
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
      typingSpeed = 500;
      return;
    }

    const timeout = setTimeout(() => {
      setCurrentText(
        words[currentWordIndex].substring(0, currentText.length + (isDeleting ? -1 : 1))
      );
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex]);

  // Statistics Count-up Trigger
  useEffect(() => {
    if (statsVisible && !countRun.current) {
      countRun.current = true;
      let start = 0;
      const duration = 1500; // 1.5s
      const steps = 40;
      const intervalTime = duration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        setStats({
          passengers: Math.floor((500 / steps) * step),
          cities: Math.floor((120 / steps) * step),
          trips: Math.floor((10000 / steps) * step),
          rating: Number(((4.9 / steps) * step).toFixed(1))
        });
        if (step >= steps) {
          clearInterval(timer);
          setStats({ passengers: 500, cities: 120, trips: 10000, rating: 4.9 });
        }
      }, intervalTime);
      return () => clearInterval(timer);
    }
  }, [statsVisible]);

  // Handle Select Popular Route
  const handleSelectRoute = (route) => {
    setSearchParams({
      from: route.from,
      to: route.to,
      date: new Date().toISOString().split('T')[0] // Set today
    });
    
    // Scroll and pulse search widget
    const searchWidget = document.getElementById('search-widget');
    if (searchWidget) {
      searchWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      searchWidget.classList.add('ring-4', 'ring-secondary', 'scale-[1.02]');
      setTimeout(() => {
        searchWidget.classList.remove('ring-4', 'ring-secondary', 'scale-[1.02]');
      }, 2000);
    }
  };

  // Toggle demo seat selection
  const toggleDemoSeat = (seatId) => {
    if (selectedDemoSeats.includes(seatId)) {
      setSelectedDemoSeats(selectedDemoSeats.filter(id => id !== seatId));
    } else {
      setSelectedDemoSeats([...selectedDemoSeats, seatId]);
    }
  };

  const totalDemoFare = selectedDemoSeats.reduce((total, seatId) => {
    const seat = demoSeats.find(s => s.id === seatId);
    return total + (seat ? seat.price : 0);
  }, 0);

  // Trigger refund simulator
  const triggerRefundSimulation = () => {
    setRefundLoading(true);
    setTimeout(() => {
      setRefundLoading(false);
      setRefundSimulated(true);
      setTimeout(() => {
        setRefundSimulated(false);
      }, 5000);
    }, 1200);
  };

  // Filter FAQs
  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(faqSearchQuery.toLowerCase())
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams(searchParams).toString();
    navigate(`/search?${query}`);
  };

  const handleFastBookDemo = () => {
    // Populate form with demo defaults and search
    setSearchParams({
      from: 'Colombo',
      to: 'Kandy',
      date: new Date().toISOString().split('T')[0]
    });
    const query = new URLSearchParams({
      from: 'Colombo',
      to: 'Kandy',
      date: new Date().toISOString().split('T')[0]
    }).toString();
    navigate(`/search?${query}`);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] overflow-x-hidden">
      <Helmet>
        <title>BusSaaS - Next-Gen Premium Intercity Bus Travel</title>
        <meta name="description" content="Experience intercity travel redesigned. Book luxury sleepers, select specific seats on 3D maps, track rides live, and get instant digital tickets." />
      </Helmet>

      {/* Hero Section with Parallax blobs & Ambient Particles */}
      <section className="relative w-full min-h-[780px] lg:h-[820px] flex items-center justify-center overflow-hidden py-16 lg:py-0">
        <div className="absolute inset-0 bg-slate-950 z-0 overflow-hidden">
          {['morning', 'evening', 'night'].map((mode) => (
            <div 
              key={mode}
              className="absolute inset-0 transition-all duration-[2000ms] ease-in-out"
              style={{ 
                opacity: climate === mode ? 1 : 0,
                visibility: climate === mode ? 'visible' : 'hidden',
                zIndex: climate === mode ? 10 : 0
              }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('${CLIMATES[mode].img}')`,
                  filter: CLIMATES[mode].filter,
                  transform: 'scale(1.02)'
                }}
              ></div>
              <div className={`absolute inset-0 ${CLIMATES[mode].overlay}`}></div>
            </div>
          ))}
          
          {/* Floating Particles */}
          {[...Array(18)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-1.5 h-1.5 bg-white rounded-full mix-blend-screen opacity-0 animate-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 80 + 20}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${Math.random() * 12 + 6}s`
              }}
            ></div>
          ))}
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & Search Form */}
            <div className="lg:col-span-7 text-left">
              {/* Climate Selection Control Badge */}
              <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
                  <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
                  <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">{CLIMATES[climate].badgeText}</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-heading font-black mb-6 tracking-tight animate-fade-in-up leading-tight [text-shadow:_0_4px_12px_rgba(0,0,0,0.85)]">
                Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-yellow-300 border-r-4 border-secondary pr-1.5 animate-pulse drop-shadow-lg">{currentText || 'Luxury'}</span>
                <br />Across Sri Lanka
              </h1>
              <p className="text-lg md:text-xl text-slate-100 mb-10 max-w-xl font-bold leading-relaxed animate-fade-in-up animation-delay-100 [text-shadow:_0_2px_8px_rgba(0,0,0,0.9)]">
                Book premium operators, select your exact seat layout, and track your journey completely in real-time.
              </p>

              {/* Search Widget */}
              <div 
                id="search-widget"
                className="relative p-6 md:p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] animate-fade-in-up animation-delay-200 border border-indigo-200/20 bg-indigo-950/60 backdrop-blur-xl hover:border-indigo-200/40 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(79,70,229,0.3)]"
              >
                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-center relative">
                    {/* Leaving From */}
                    <div className="lg:col-span-3 text-left">
                      <label className="block text-[10px] font-extrabold text-blue-200 mb-1.5 uppercase tracking-widest">Leaving from</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <MapPin className="h-4 w-4 text-gray-400 group-focus-within:text-secondary transition-colors" />
                        </div>
                        <select
                          required
                          className="block w-full pl-11 pr-3 py-3.5 text-sm border border-indigo-200/20 rounded-2xl bg-indigo-900/50 text-white focus:outline-none focus:ring-2 focus:ring-secondary/80 focus:border-transparent transition-all shadow-inner font-bold cursor-pointer hover:bg-indigo-800/60"
                          value={searchParams.from}
                          onChange={(e) => setSearchParams({...searchParams, from: e.target.value})}
                        >
                          <option className="text-slate-900 bg-white dark:text-white dark:bg-slate-900" value="" disabled>Select Origin</option>
                          <option className="text-slate-900 bg-white dark:text-white dark:bg-slate-900" value="Colombo">Colombo</option>
                          <option className="text-slate-900 bg-white dark:text-white dark:bg-slate-900" value="Kandy">Kandy</option>
                          <option className="text-slate-900 bg-white dark:text-white dark:bg-slate-900" value="Jaffna">Jaffna</option>
                          <option className="text-slate-900 bg-white dark:text-white dark:bg-slate-900" value="Galle">Galle</option>
                          <option className="text-slate-900 bg-white dark:text-white dark:bg-slate-900" value="Trincomalee">Trincomalee</option>
                        </select>
                      </div>
                    </div>

                    {/* Swap Button Column */}
                    <div className="lg:col-span-1 flex justify-center pt-4 lg:pt-5">
                      <button
                        onClick={handleSwap}
                        aria-label="Swap locations"
                        className={`w-11 h-11 rounded-full bg-indigo-600/30 border border-indigo-200/20 text-secondary hover:text-white hover:bg-indigo-500/50 flex items-center justify-center cursor-pointer shadow-lg hover:shadow-secondary/25 transition-all duration-500 transform hover:scale-110 active:scale-95 ${isSwapping ? 'rotate-180' : ''}`}
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Going To */}
                    <div className="lg:col-span-3 text-left">
                      <label className="block text-[10px] font-extrabold text-blue-200 mb-1.5 uppercase tracking-widest">Going to</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <MapPin className="h-4 w-4 text-gray-400 group-focus-within:text-secondary transition-colors" />
                        </div>
                        <select
                          required
                          className="block w-full pl-11 pr-3 py-3.5 text-sm border border-indigo-200/20 rounded-2xl bg-indigo-900/50 text-white focus:outline-none focus:ring-2 focus:ring-secondary/80 focus:border-transparent transition-all shadow-inner font-bold cursor-pointer hover:bg-indigo-800/60"
                          value={searchParams.to}
                          onChange={(e) => setSearchParams({...searchParams, to: e.target.value})}
                        >
                          <option className="text-slate-900 bg-white dark:text-white dark:bg-slate-900" value="" disabled>Select Destination</option>
                          <option className="text-slate-900 bg-white dark:text-white dark:bg-slate-900" value="Colombo">Colombo</option>
                          <option className="text-slate-900 bg-white dark:text-white dark:bg-slate-900" value="Kandy">Kandy</option>
                          <option className="text-slate-900 bg-white dark:text-white dark:bg-slate-900" value="Jaffna">Jaffna</option>
                          <option className="text-slate-900 bg-white dark:text-white dark:bg-slate-900" value="Galle">Galle</option>
                          <option className="text-slate-900 bg-white dark:text-white dark:bg-slate-900" value="Trincomalee">Trincomalee</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {/* Date */}
                    <div className="md:col-span-3 text-left">
                      <label className="block text-[10px] font-extrabold text-blue-200 mb-1.5 uppercase tracking-widest">Date of Journey</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Calendar className="h-4 w-4 text-gray-400 group-focus-within:text-secondary transition-colors" />
                        </div>
                        <input
                          type="date"
                          required
                          className="block w-full pl-11 pr-4 py-3.5 text-sm border border-indigo-200/20 rounded-2xl bg-indigo-900/50 text-white focus:outline-none focus:ring-2 focus:ring-secondary/80 focus:border-transparent transition-all shadow-inner font-bold cursor-pointer hover:bg-indigo-800/60"
                          value={searchParams.date}
                          onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Find button */}
                    <div className="md:col-span-1">
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-secondary text-dark rounded-2xl font-black text-sm hover:bg-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 transition-all shadow-[0_4px_20px_rgba(250,204,21,0.3)] hover:shadow-[0_6px_25px_rgba(250,204,21,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer duration-300"
                      >
                        <Search className="w-4 h-4" />
                        Find Rides
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Interactive 3D Boarding Pass Preview */}
            <div className="lg:col-span-5 hidden lg:flex justify-center">
              <div 
                className="w-[380px] bg-gradient-to-b from-slate-900 to-indigo-950 border border-white/15 rounded-[2.5rem] shadow-2xl p-6 relative overflow-hidden transition-transform duration-300 hover:scale-[1.03]"
                style={{ 
                  transform: `perspective(1000px) rotateX(${mousePos.y * -4}deg) rotateY(${mousePos.x * 4}deg)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Visual Accent circles */}
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-secondary/15 rounded-full blur-2xl"></div>
                
                {/* Barcode styling cut */}
                <div className="absolute top-1/2 left-[-10px] w-5 h-5 bg-slate-950 rounded-full"></div>
                <div className="absolute top-1/2 right-[-10px] w-5 h-5 bg-slate-950 rounded-full"></div>
                
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    <span className="text-[10px] font-extrabold tracking-widest uppercase text-blue-200">Express Boarding Pass</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold tracking-widest border border-emerald-500/20 uppercase animate-pulse">
                    Hold Active
                  </span>
                </div>

                <div className="border-b border-dashed border-white/10 pb-5 mb-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">Origin</span>
                      <span className="text-xl font-heading font-black text-white truncate block">
                        {searchParams.from || 'Select Origin'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">Destination</span>
                      <span className="text-xl font-heading font-black text-secondary truncate block">
                        {searchParams.to || 'Destination'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">Journey Date</span>
                    <span className="text-xs font-bold text-white block">
                      {searchParams.date ? new Date(searchParams.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : 'Date Not Picked'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">Cabin Class</span>
                    <span className="text-xs font-bold text-white block">VIP Sleeper (AC)</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">Assigned Seats</span>
                    <span className="text-xs font-extrabold text-secondary block">
                      {selectedDemoSeats.length > 0 ? selectedDemoSeats.join(', ') : 'Demo A2, B2'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">Est. Price</span>
                    <span className="text-md font-black text-emerald-400 block">
                      LKR {selectedDemoSeats.length > 0 ? totalDemoFare : 2500}
                    </span>
                  </div>
                </div>

                {/* Ticket Barcode */}
                <div className="flex flex-col items-center justify-center bg-white p-3.5 rounded-2xl">
                  <div className="flex items-center justify-between w-full h-10 gap-0.5 overflow-hidden opacity-90">
                    {[1, 3, 1, 2, 4, 1, 2, 1, 3, 1, 4, 2, 1, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 3, 1, 4, 2, 1].map((w, idx) => (
                      <div key={idx} className="bg-slate-900 h-full rounded-sm" style={{ width: `${w * 1.5}px` }}></div>
                    ))}
                  </div>
                  <span className="text-[8px] font-bold text-gray-500 tracking-[0.4em] uppercase mt-2">BUSS-SAAS-582910</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section ref={popularRef} className="py-24 relative overflow-hidden bg-white dark:bg-[#0E0E12] border-b border-gray-150 dark:border-white/5">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ${popularVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Popular Destinations
            </div>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-gray-900 dark:text-white mb-4">
              Explore Popular Direct Routes
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-md max-w-2xl mx-auto">
              Click any route to automatically fill out the journey details above and search with a single click.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularRoutes.map((route, index) => (
              <div 
                key={index}
                onClick={() => handleSelectRoute(route)}
                className="group relative bg-slate-900 text-white rounded-3xl p-6 overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5"
              >
                {/* Background Decor */}
                <div className={`absolute inset-0 bg-gradient-to-br ${route.bg} opacity-85 group-hover:opacity-95 transition-opacity`}></div>
                
                {/* Overlay Card Details */}
                <div className="relative z-10 flex flex-col justify-between h-44">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70 py-1 px-2.5 rounded-full bg-white/10 backdrop-blur-md">
                      {route.label}
                    </span>
                    <div className="text-right">
                      <div className="text-[9px] uppercase tracking-wider text-white/60">Tickets From</div>
                      <div className="text-lg font-black text-secondary">LKR {route.price}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-heading font-black mb-1.5 flex items-center gap-1.5">
                      <span>{route.from}</span>
                      <span className="text-white/60 font-light">&rarr;</span>
                      <span>{route.to}</span>
                    </h3>
                    
                    <div className="flex items-center justify-between border-t border-white/15 pt-2.5 mt-2.5 text-xs text-white/80">
                      <div className="flex items-center gap-1 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-secondary" />
                        <span>{route.trips} trips/day</span>
                      </div>
                      <span className="font-semibold bg-black/15 py-0.5 px-2 rounded-lg">{route.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Redefined Travel Experience Timeline Section */}
      <section ref={stepsRef} className="py-24 bg-slate-50 dark:bg-[#09090b] relative overflow-hidden border-b border-gray-150 dark:border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))]"></div>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ${stepsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4">
              <Compass className="w-3.5 h-3.5" /> Seamless Booking
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-gray-900 dark:text-white mb-4">
              How BusSaaS Redefines Your Travel
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-semibold text-md max-w-xl mx-auto">
              Skip the long queues. Secure your premium intercity journey in less than 2 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Desktop horizontal connecting line */}
            <div className="absolute top-1/2 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 hidden md:block -translate-y-12"></div>
            
            {[
              {
                step: '01',
                title: 'Search Routes',
                desc: 'Enter your source and destination, and choose your departure date to scan all premium buses.',
                icon: Search,
                color: 'from-blue-600 to-cyan-500',
                glow: 'shadow-blue-500/10'
              },
              {
                step: '02',
                title: 'Select Seats',
                desc: 'Use our real-time interactive seat layouts to pick window views or comfortable sleeper beds.',
                icon: Users,
                color: 'from-indigo-600 to-violet-500',
                glow: 'shadow-indigo-500/10'
              },
              {
                step: '03',
                title: 'Secure Checkout',
                desc: 'Confirm your ticket and complete booking instantly using safe credit card or mobile wallet pathways.',
                icon: ShieldCheck,
                color: 'from-emerald-600 to-teal-500',
                glow: 'shadow-emerald-500/10'
              },
              {
                step: '04',
                title: 'Digital Boarding',
                desc: 'Receive your dynamic QR boarding pass on email and track your bus telemetry completely live.',
                icon: Zap,
                color: 'from-amber-600 to-orange-500',
                glow: 'shadow-orange-500/10'
              }
            ].map((s, idx) => (
              <div 
                key={idx}
                className="group relative bg-white dark:bg-[#0E0E12] border border-gray-150 dark:border-white/5 rounded-3xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between h-72 z-10 hover:border-primary/20"
              >
                {/* Accent Blob */}
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-xl group-hover:scale-150 transition-all duration-500"></div>
                
                <div className="flex justify-between items-start mb-6">
                  {/* Icon Wrapper */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-lg ${s.glow} group-hover:scale-110 transition-transform duration-500`}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  
                  {/* Step indicator label */}
                  <span className="text-4xl font-heading font-black text-gray-200/50 dark:text-white/20 select-none transition-colors duration-500 group-hover:text-primary/30">
                    {s.step}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-heading font-black text-gray-900 dark:text-white mb-2.5 transition-colors group-hover:text-primary">
                    {s.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-xs leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Feature Showcase */}
      <section ref={bentoRef} className="py-24 bg-gray-50 dark:bg-[#09090b] relative overflow-hidden border-b border-gray-150 dark:border-white/5">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ${bentoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Shield className="w-3.5 h-3.5" /> Luxury Infrastructure
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-gray-900 dark:text-white mb-4">
              Engineered For The Premium Traveler
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-md max-w-2xl mx-auto">
              We've packed state-of-the-art tech into every square inch of our booking experience.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1: Live GPS Tracker Demo (Double size) */}
            <div className="md:col-span-2 glass-card dark:bg-white/5 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between overflow-hidden relative group hover:shadow-2xl transition-all border border-white/50">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="bg-primary text-white p-2 rounded-xl">
                    <MapPin className="w-5 h-5 text-indigo-100" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Live Route Tracker Demo</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md font-medium">
                  Know exactly where your bus is at any second. Try out our live tracking mockup below.
                </p>
              </div>

              {/* Animated Map Line widget */}
              <div className="relative w-full h-32 bg-slate-900 rounded-2xl border border-white/10 p-6 flex flex-col justify-center overflow-hidden">
                {/* SVG Route Line */}
                <div className="absolute left-[8%] right-[8%] h-[2px] bg-slate-700 top-1/2 -translate-y-1/2"></div>
                
                {/* Station nodes */}
                <div className="absolute left-[8%] top-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-3 h-3 bg-secondary rounded-full border-2 border-slate-900 z-10 animate-node-pulse"></div>
                  <span className="text-[9px] font-extrabold text-blue-200 uppercase mt-1">Colombo</span>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-3 h-3 bg-primary rounded-full border-2 border-slate-900 z-10"></div>
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase mt-1">Kurunegala</span>
                </div>

                <div className="absolute right-[8%] top-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full border-2 border-slate-900 z-10"></div>
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase mt-1">Kandy</span>
                </div>

                {/* Animated Moving Bus */}
                <div className="absolute top-1/2 -translate-y-[24px] w-9 h-6 animate-bus-move">
                  <div className="bg-secondary text-dark px-1.5 py-0.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 shadow-md border border-yellow-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    BUS
                  </div>
                </div>

                <div className="absolute bottom-2 left-6 text-[9px] font-black uppercase text-secondary/80 flex items-center gap-1.5 tracking-wider">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  Active Trip: Route 01 • En Route to Kurunegala (On-Time)
                </div>
              </div>
            </div>

            {/* Bento Card 2: Luxury Amenities Showcase */}
            <div className="glass-card dark:bg-white/5 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all border border-white/50">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="bg-secondary text-dark p-2 rounded-xl">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Elite Cabin Comfort</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed mb-6">
                  Enjoy amenities standard across all Luxury and Super-VIP trips. Hover to explore.
                </p>
              </div>

              {/* Grid of icons with descriptions */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Wifi, label: 'High-speed Wi-Fi', desc: 'Complimentary high bandwidth' },
                  { icon: Zap, label: 'Charging ports', desc: 'USB ports at every seat' },
                  { icon: Coffee, label: 'Refreshments', desc: 'Complimentary water & snacks' },
                  { icon: Wind, label: 'Climate Control', desc: 'Fully air conditioned cabin' }
                ].map((item, idx) => (
                  <div key={idx} className="group/item p-3 bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl hover:bg-white hover:dark:bg-white/10 hover:shadow-sm transition-all duration-300">
                    <item.icon className="w-5 h-5 text-primary dark:text-indigo-300 mb-1 group-hover/item:scale-110 transition-transform" />
                    <div className="text-[10px] font-black text-gray-800 dark:text-white">{item.label}</div>
                    <div className="text-[8px] text-gray-400">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bento Card 3: Instant Refunds Simulation */}
            <div className="glass-card dark:bg-white/5 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all border border-white/50">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="bg-emerald-500 text-white p-2 rounded-xl">
                    <RefreshCw className="w-5 h-5 text-emerald-100" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Instant Refunds</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
                  Cancel or modify your ticket instantly up to 24 hours before your trip. Try the simulator.
                </p>
              </div>

              <div className="mt-6">
                {refundLoading ? (
                  <div className="h-16 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-2xl">
                    <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-300 ml-2">Processing refund...</span>
                  </div>
                ) : refundSimulated ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-150 dark:bg-emerald-500/10 dark:border-emerald-500/20 rounded-2xl text-center animate-scale-in">
                    <Check className="w-6 h-6 text-emerald-500 mx-auto mb-1 animate-pulse" />
                    <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Refund Successful!</div>
                    <div className="text-[9px] text-emerald-500">LKR 1,250 refunded to your wallet</div>
                  </div>
                ) : (
                  <button 
                    onClick={triggerRefundSimulation}
                    className="w-full py-3.5 bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-dark dark:hover:bg-gray-100 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Simulate Ticket Refund
                  </button>
                )}
              </div>
            </div>

            {/* Bento Card 4: Chat Companion (Double size) */}
            <div className="md:col-span-2 glass-card dark:bg-white/5 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between overflow-hidden relative group hover:shadow-2xl transition-all border border-white/50">
              <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="mb-6">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="bg-indigo-500 text-white p-2 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-indigo-150" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">24/7 Smart Ticket Assistant</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md font-medium">
                  Have questions about boarding, delays, or pricing? Chat live with our automated assistant anytime.
                </p>
              </div>

              {/* Chat bubbles mock */}
              <div className="space-y-3 p-4 bg-white/40 dark:bg-slate-900/50 border border-white/60 dark:border-white/10 rounded-2xl">
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs max-w-[80%] font-medium">
                    👋 Hello! Can I reschedule my ticket for tomorrow's trip to Galle?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-primary text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs max-w-[80%] font-bold shadow-md">
                    Yes! You can reschedule free of charge. Let me update your booking Colombo &rarr; Galle to tomorrow. Select a departure time?
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Seat Selection Demo */}
      <section ref={seatDemoRef} className="py-24 relative overflow-hidden bg-white dark:bg-[#0E0E12] border-b border-gray-150 dark:border-white/5">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ${seatDemoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Demo
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-gray-900 dark:text-white mb-4">
              Try Our Live Seat Selector
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-md max-w-2xl mx-auto">
              Select seats in the interactive cabin preview below to calculate prices and preview the experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Interactive Seat Grid Layout */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-[320px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
                
                {/* Steering Wheel and Front Indicator */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Front of Cabin</span>
                  <div className="w-8 h-8 rounded-full border-2 border-slate-700 flex items-center justify-center text-slate-400" title="Driver Seat">
                    ⚡
                  </div>
                </div>

                {/* Seat Map grid */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-5">
                  {demoSeats.map((seat) => {
                    const isBooked = seat.status === 'booked';
                    const isSelected = selectedDemoSeats.includes(seat.id);
                    
                    let bgClass = 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500 cursor-pointer';
                    if (isBooked) {
                      bgClass = 'bg-red-500/10 text-red-500 border border-red-500/20 cursor-not-allowed opacity-50';
                    } else if (isSelected) {
                      bgClass = 'bg-secondary text-dark border border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-seat-pulse cursor-pointer';
                    }

                    return (
                      <button
                        key={seat.id}
                        disabled={isBooked}
                        onClick={() => toggleDemoSeat(seat.id)}
                        className={`py-3.5 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center ${bgClass}`}
                      >
                        <span className="text-[9px] font-medium opacity-60 uppercase">{seat.type}</span>
                        <span>{seat.id}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center border-t border-slate-800 pt-5 mt-6 text-[9px] font-bold text-slate-400 uppercase">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700 inline-block"></span>
                    <span>Free</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-secondary inline-block"></span>
                    <span>Chosen</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-red-500/20 inline-block"></span>
                    <span>Taken</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing Summary & Call To Action */}
            <div className="lg:col-span-6">
              <div className="glass-card dark:bg-white/5 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl border border-white/50 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Interactive Booking summary</h3>
                
                {selectedDemoSeats.length === 0 ? (
                  <div className="text-center py-10">
                    <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4 animate-bounce" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                      Please click on one or more available seats in the interactive bus layout to view details and price tiers.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-scale-in">
                    <div className="flex justify-between items-center border-b border-gray-150 dark:border-white/5 pb-4">
                      <div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Selected Seats</div>
                        <div className="text-lg font-extrabold text-gray-900 dark:text-white">
                          {selectedDemoSeats.sort().join(', ')}
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-primary/10 text-primary dark:bg-indigo-500/20 dark:text-indigo-300 text-xs font-bold rounded-lg uppercase tracking-wider">
                        {selectedDemoSeats.length} Ticket(s)
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm text-gray-500 font-medium">
                        <span>Base Ride Fare</span>
                        <span>LKR {totalDemoFare}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 font-medium">
                        <span>Digital Platform Fee</span>
                        <span className="text-emerald-500 font-bold">LKR 0 (FREE)</span>
                      </div>
                      <div className="flex justify-between text-lg font-black border-t border-gray-150 dark:border-white/5 pt-4 text-gray-900 dark:text-white">
                        <span>Total Price</span>
                        <span className="text-primary dark:text-indigo-400">LKR {totalDemoFare}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleFastBookDemo}
                      className="w-full py-4 bg-secondary text-dark rounded-2xl font-black text-md hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl shadow-yellow-500/10"
                    >
                      <span>Book These Selected Seats Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Fleet Showcase Section */}
      <section ref={fleetRef} className="py-24 bg-gray-50 dark:bg-[#09090b] relative overflow-hidden border-b border-gray-150 dark:border-white/5">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ${fleetVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Bus className="w-3.5 h-3.5" /> Luxury Fleet Options
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-gray-900 dark:text-white mb-4">
              Select Your Travel Standard
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-md max-w-2xl mx-auto">
              We provide three tiers of comfort to match your budget and expectations. Toggle options below.
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex p-1.5 bg-gray-200/60 dark:bg-white/5 rounded-2xl backdrop-blur-md">
              <button 
                onClick={() => setActiveFleetTab('sleeper')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeFleetTab === 'sleeper' ? 'bg-white dark:bg-white/10 text-primary dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
              >
                VVIP Sleeper Suite
              </button>
              <button 
                onClick={() => setActiveFleetTab('business')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeFleetTab === 'business' ? 'bg-white dark:bg-white/10 text-primary dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Business Recliner
              </button>
              <button 
                onClick={() => setActiveFleetTab('express')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeFleetTab === 'express' ? 'bg-white dark:bg-white/10 text-primary dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Classic Express
              </button>
            </div>
          </div>

          {/* Dynamic Tab Content */}
          <div className="bg-white dark:bg-[#0E0E12] rounded-[2.5rem] border border-gray-150 dark:border-white/5 p-8 md:p-12 shadow-xl">
            {activeFleetTab === 'sleeper' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-scale-in">
                <div>
                  <h3 className="text-2xl md:text-3xl font-heading font-black text-gray-900 dark:text-white mb-4">
                    Ultra-VVIP Sleeper Suite
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6">
                    Our flagship cabin class. Features luxury single-person capsules, 180-degree lie-flat sleeper beds, individual widescreen display screens, high-speed Wi-Fi, and a complimentary hot meal served onboard.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-y border-gray-150 dark:border-white/5 py-6 mb-6">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Seating Layout</div>
                      <div className="text-sm font-extrabold text-gray-800 dark:text-white">1x1 Private Cubicles</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Max Occupancy</div>
                      <div className="text-sm font-extrabold text-gray-800 dark:text-white">20 Private Cabins</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Fare Guideline</div>
                      <div className="text-sm font-extrabold text-secondary">LKR 2,500 Base Fare</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Rating</div>
                      <div className="text-sm font-extrabold text-gray-800 dark:text-white flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>4.9 / 5</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["Private Bed", "Personal TV", "High-speed Wi-Fi", "USB Charger", "Meals Onboard", "Blanket & Pillow"].map((amenity, idx) => (
                      <span key={idx} className="bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold text-[10px] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/5 uppercase tracking-wider">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="h-[300px] md:h-[380px] rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-white/10">
                  <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop" alt="VVIP Sleeper interior" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {activeFleetTab === 'business' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-scale-in">
                <div>
                  <h3 className="text-2xl md:text-3xl font-heading font-black text-gray-900 dark:text-white mb-4">
                    Executive Recliner Business Class
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6">
                    Elite travel for corporate commuting and family holiday comfort. Features ergonomic 145-degree leather reclining seats, expansive individual legroom with leg rests, central climate control, and USB charging.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-y border-gray-150 dark:border-white/5 py-6 mb-6">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Seating Layout</div>
                      <div className="text-sm font-extrabold text-gray-800 dark:text-white">2x1 Spacious Recliners</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Max Occupancy</div>
                      <div className="text-sm font-extrabold text-gray-800 dark:text-white">30 Reclining Seats</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Fare Guideline</div>
                      <div className="text-sm font-extrabold text-secondary">LKR 1,800 Base Fare</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Rating</div>
                      <div className="text-sm font-extrabold text-gray-800 dark:text-white flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>4.8 / 5</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["Leather Recliner", "Spacious Legroom", "USB Charger", "Reading Light", "Mineral Water", "Air Conditioning"].map((amenity, idx) => (
                      <span key={idx} className="bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold text-[10px] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/5 uppercase tracking-wider">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="h-[300px] md:h-[380px] rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-white/10">
                  <img src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop" alt="Business class interior" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {activeFleetTab === 'express' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-scale-in">
                <div>
                  <h3 className="text-2xl md:text-3xl font-heading font-black text-gray-900 dark:text-white mb-4">
                    Classic Express Cruiser
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6">
                    Fast, economical, and highly comfortable intercity transit. Equipped with modern fabric semi-reclining seats, standard air conditioning, audio systems, live GPS route updates, and safety-certified speed limits.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-y border-gray-150 dark:border-white/5 py-6 mb-6">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Seating Layout</div>
                      <div className="text-sm font-extrabold text-gray-800 dark:text-white">2x2 Standard Seats</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Max Occupancy</div>
                      <div className="text-sm font-extrabold text-gray-800 dark:text-white">40 Semi-Reclining Seats</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Fare Guideline</div>
                      <div className="text-sm font-extrabold text-secondary">LKR 1,200 Base Fare</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Rating</div>
                      <div className="text-sm font-extrabold text-gray-800 dark:text-white flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>4.6 / 5</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["Air Conditioning", "Live GPS Updates", "Fabric Recliner", "Audio System", "Experienced Driver"].map((amenity, idx) => (
                      <span key={idx} className="bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold text-[10px] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/5 uppercase tracking-wider">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="h-[300px] md:h-[380px] rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-white/10">
                  <img src="/classic_express_interior.png" alt="Express Cruiser interior" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Statistics Section with Count-Up Animation */}
      <section ref={statsRef} className="py-20 bg-white dark:bg-[#0E0E12] border-y border-gray-150 dark:border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-40"></div>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative transition-all duration-1000 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100 dark:divide-white/5">
            <div className="text-center px-4 animate-fade-in-up">
              <div className="text-4xl md:text-5xl font-heading font-black text-primary dark:text-indigo-400 mb-2">
                {stats.passengers === 500 ? '500k+' : `${stats.passengers}k+`}
              </div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Passengers Served</div>
            </div>
            <div className="text-center px-4 animate-fade-in-up animation-delay-100">
              <div className="text-4xl md:text-5xl font-heading font-black text-secondary mb-2">
                {stats.cities === 120 ? '120+' : `${stats.cities}+`}
              </div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Cities Covered</div>
            </div>
            <div className="text-center px-4 animate-fade-in-up animation-delay-200">
              <div className="text-4xl md:text-5xl font-heading font-black text-emerald-500 mb-2">
                {stats.trips === 10000 ? '10k+' : `${stats.trips}+`}
              </div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Daily Trips Completed</div>
            </div>
            <div className="text-center px-4 animate-fade-in-up animation-delay-300">
              <div className="text-4xl md:text-5xl font-heading font-black text-purple-500 mb-2">
                {stats.rating === 4.9 ? '4.9/5' : `${stats.rating}/5`}
              </div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Passenger Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Marquee Section */}
      <section ref={testimonialsRef} className="py-24 bg-gray-50 dark:bg-[#09090b] overflow-hidden relative border-b border-gray-150 dark:border-white/5">
        <div className={`transition-all duration-1000 delay-200 ${testimonialsVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="text-center mb-16 px-4">
            <h2 className="text-3xl md:text-5xl font-heading font-black text-gray-900 dark:text-white mb-4">Loved by Travelers</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-md max-w-2xl mx-auto">Don't just take our word for it. Here is what our passengers have to say.</p>
          </div>
          
          <div className="relative w-full flex overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-gray-50 to-transparent dark:from-[#09090b] z-10 pointer-events-none"></div>
            <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-gray-50 to-transparent dark:to-[#09090b] z-10 pointer-events-none"></div>
            
            <div className="flex animate-marquee whitespace-nowrap py-4 gap-6 hover:[animation-play-state:paused]">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="inline-block w-[350px] glass-card dark:bg-white/5 dark:border-white/10 p-8 rounded-3xl shadow-lg border border-white/50 shrink-0 hover-lift transition-all duration-300">
                  <div className="flex text-yellow-400 mb-4">
                    {[1,2,3,4,5].map(star => <Star key={star} className="w-4.5 h-4.5 fill-current" />)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 font-medium whitespace-normal leading-relaxed text-sm">
                    "The most comfortable and reliable bus booking platform I have ever used. The 3D seat selection is simply amazing and exactly matches the real bus!"
                  </p>
                  <div className="flex items-center gap-4">
                    <img src={`https://ui-avatars.com/api/?name=User+${i}&background=0D8ABC&color=fff`} alt="User" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Passenger {i}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Frequent Traveler</p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Duplicate for infinite loop */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={`dup-${i}`} className="inline-block w-[350px] glass-card dark:bg-white/5 dark:border-white/10 p-8 rounded-3xl shadow-lg border border-white/50 shrink-0 hover-lift transition-all duration-300">
                  <div className="flex text-yellow-400 mb-4">
                    {[1,2,3,4,5].map(star => <Star key={star} className="w-4.5 h-4.5 fill-current" />)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 font-medium whitespace-normal leading-relaxed text-sm">
                    "The most comfortable and reliable bus booking platform I have ever used. The 3D seat selection is simply amazing and exactly matches the real bus!"
                  </p>
                  <div className="flex items-center gap-4">
                    <img src={`https://ui-avatars.com/api/?name=User+${i}&background=0D8ABC&color=fff`} alt="User" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Passenger {i}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Frequent Traveler</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* Redesigned Searchable FAQ Section */}
      <section ref={faqRef} className="py-24 bg-[#FAFAFA] dark:bg-[#0E0E12] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50"></div>
        <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ${faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
              <HelpCircle className="w-3.5 h-3.5" /> Support Hub
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-md max-w-lg mx-auto">
              Everything you need to know about booking, scheduling, and traveling with BusSaaS.
            </p>
          </div>

          {/* FAQ Search Bar */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search FAQs (e.g. refund, seat, wifi)..."
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all shadow-sm font-medium"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`glass-card dark:bg-white/5 dark:border-white/10 rounded-2xl overflow-hidden transition-all duration-500 transform ${activeFaq === index ? 'shadow-[0_0_25px_rgba(79,70,229,0.18)] border-primary/40 dark:border-indigo-500/30 scale-[1.01]' : 'hover:shadow-lg border-white/40 dark:border-white/5'}`}
                >
                  <button 
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none cursor-pointer"
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  >
                    <span className="font-bold text-gray-900 dark:text-white pr-8 text-md">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-secondary shrink-0 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ${activeFaq === index ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="p-6 pt-0 text-gray-600 dark:text-gray-300 font-medium text-sm leading-relaxed border-t border-gray-150/40 dark:border-white/5">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white/40 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-3xl">
                <Info className="w-10 h-10 text-gray-400 dark:text-gray-505 mx-auto mb-3" />
                <div className="text-md font-bold text-gray-700 dark:text-gray-300 mb-1">No FAQs matches your query</div>
                <div className="text-xs text-gray-400">Try searching for other terms like 'ticket', 'cancel' or 'cancellation'.</div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
