import React, { useState } from 'react';
import { Bus, Globe, MessageCircle, Camera, Briefcase, Send, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  return (
    <footer className="relative bg-white dark:bg-[#09090b] text-gray-600 dark:text-gray-400 pt-20 pb-10 overflow-hidden print:hidden border-t-4 border-primary transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-secondary/5 blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand & About */}
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-secondary text-dark p-2 rounded-xl shadow-lg shadow-yellow-500/20">
                <Bus className="h-6 w-6 stroke-[2.5]" />
              </div>
              <span className="text-2xl font-heading font-black text-gray-900 dark:text-white">BusSaaS</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
              Experience the future of intercity travel. We provide a seamless, luxurious, and highly secure platform for booking your next journey across the country.
            </p>
            <div className="flex items-center gap-4">
              {[Globe, MessageCircle, Camera, Briefcase].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white hover:scale-110 transition-all duration-300 shadow-md">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="animate-fade-in-up animation-delay-100">
            <h4 className="text-lg font-heading font-extrabold text-gray-900 dark:text-white mb-6 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-3">
              {['About Us', 'Popular Routes', 'Our Fleet', 'Careers', 'Press & Media'].map((link, idx) => (
                <li key={idx}>
                  <a href="#" className="group flex items-center text-gray-500 dark:text-gray-400 hover:text-secondary transition-colors text-sm font-medium">
                    <span className="w-0 h-[2px] bg-secondary mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="animate-fade-in-up animation-delay-200">
            <h4 className="text-lg font-heading font-extrabold text-gray-900 dark:text-white mb-6 uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-500 dark:text-gray-400 group">
                <MapPin className="w-5 h-5 text-primary group-hover:text-secondary transition-colors shrink-0 mt-0.5" />
                <span>123 Transit Boulevard,<br/>Colombo 00100,<br/>Sri Lanka</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 group">
                <Phone className="w-5 h-5 text-primary group-hover:text-secondary transition-colors shrink-0" />
                <span>+94 11 234 5678</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 group">
                <Mail className="w-5 h-5 text-primary group-hover:text-secondary transition-colors shrink-0" />
                <span>support@bussaas.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="animate-fade-in-up animation-delay-300">
            <h4 className="text-lg font-heading font-extrabold text-gray-900 dark:text-white mb-6 uppercase tracking-wider">Newsletter</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form onSubmit={handleSubscribe} className="relative group">
              <input 
                type="email" 
                required
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm rounded-2xl py-3.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
              />
              <button 
                type="submit" 
                className="absolute right-1 top-1 bottom-1 bg-primary hover:bg-primary-hover text-white p-2.5 rounded-xl transition-all shadow-md group-focus-within:bg-secondary group-focus-within:text-dark"
              >
                <Send className="w-4 h-4 -ml-0.5" />
              </button>
            </form>
            {subscribed && (
              <p className="text-emerald-400 text-xs mt-2 font-medium animate-fade-in flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Successfully subscribed!
              </p>
            )}
          </div>
          
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in-up animation-delay-400">
          <p className="text-gray-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} BusBooking SaaS. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
