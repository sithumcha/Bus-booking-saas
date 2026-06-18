import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bus, User, LogOut, Search, Home, Menu, X, Shield, BookOpen, Sun, Moon, Settings } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-dark text-white shadow-xl border-b border-white/10 print:hidden transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Logo & Left Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 text-xl font-black tracking-tight text-white hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-tr from-secondary to-yellow-300 text-slate-900 p-2 rounded-xl shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                <Bus className="h-6 w-6 stroke-[2.5]" />
              </div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 font-heading text-2xl font-black drop-shadow-md">BusSaaS</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-5">
              <Link 
                to="/" 
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/10 relative group ${
                  isActive('/') ? 'text-secondary' : 'text-blue-100'
                }`}
              >
                <Home className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> Home
                {isActive('/') && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-secondary rounded-t-full shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>}
              </Link>
              <Link 
                to="/search" 
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/10 relative group ${
                  isActive('/search') ? 'text-secondary' : 'text-blue-100'
                }`}
              >
                <Search className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> Search Rides
                {isActive('/search') && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-secondary rounded-t-full shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>}
              </Link>
              <Link 
                to="/buses" 
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/10 relative group ${
                  isActive('/buses') ? 'text-secondary' : 'text-blue-100'
                }`}
              >
                <Bus className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> Our Fleet
                {isActive('/buses') && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-secondary rounded-t-full shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>}
              </Link>
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-yellow-400 hover:text-yellow-300 transition-all focus:outline-none shadow-inner mr-2"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-blue-200" />}
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                {/* Dashboard Quick Link */}
                {user.role === 'operator' || user.role === 'admin' ? (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 transition-all text-secondary"
                  >
                    <Shield className="w-4 h-4 text-secondary" />
                    <span>Control Center</span>
                  </Link>
                ) : (
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-blue-400/20 bg-white/5 hover:bg-white/10 transition-all text-white"
                  >
                    <BookOpen className="w-4 h-4 text-blue-300" />
                    <span>My Dashboard</span>
                  </Link>
                )}

                {/* Advanced Hover Profile Dropdown */}
                <div className="relative group ml-2">
                  <div className="flex items-center gap-3 cursor-pointer py-2 pl-3 pr-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all">
                    <div className="flex flex-col text-right hidden lg:flex">
                      <span className="text-[10px] text-blue-200 font-bold uppercase tracking-widest leading-none">
                        {user.role}
                      </span>
                      <span className="text-sm font-extrabold text-white truncate max-w-[120px]">
                        {user.name || user.companyName}
                      </span>
                    </div>
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user.name || user.companyName}&background=0D8ABC&color=fff&rounded=true`} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full border-2 border-white/20 group-hover:border-secondary transition-colors"
                    />
                  </div>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-2 z-50">
                    <div className="bg-white dark:bg-[#0E0E12] rounded-2xl shadow-xl shadow-blue-900/20 border border-gray-100 dark:border-white/5 overflow-hidden py-2 text-gray-700 dark:text-gray-300">
                      <div className="px-4 py-3 border-b border-gray-50 dark:border-white/5 mb-2">
                        <p className="text-sm text-gray-550 dark:text-gray-400">Signed in as</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.email}</p>
                      </div>
                      
                      <Link to={user.role === 'passenger' ? '/dashboard' : '/admin'} className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 hover:dark:bg-white/5 hover:text-primary dark:hover:text-indigo-400 transition-colors">
                        <Settings className="w-4 h-4" /> Account Settings
                      </Link>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 hover:dark:bg-red-950/20 transition-colors mt-1 border-t border-gray-50 dark:border-white/5"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-blue-100 hover:text-white hover:bg-white/5 transition-all"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-secondary text-dark px-5 py-2.5 rounded-xl font-extrabold text-sm hover:bg-yellow-400 transition-all shadow-md shadow-yellow-500/10 hover:shadow-lg hover:shadow-yellow-500/25"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Actions (Theme + Hamburger) */}
          <div className="md:hidden flex items-center gap-3">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl bg-white/5 text-yellow-400 hover:bg-white/10 transition-all"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-blue-200" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 text-blue-100 hover:bg-white/10 focus:outline-none transition-all"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-primary/98 border-t border-blue-500/10 px-4 pt-2 pb-6 space-y-3 transition-all animate-fade-in">
          
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 p-3 rounded-xl text-base font-bold transition-all ${
              isActive('/') ? 'bg-white/10 text-secondary' : 'text-blue-100'
            }`}
          >
            <Home className="w-5 h-5" /> Home
          </Link>

          <Link 
            to="/search" 
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 p-3 rounded-xl text-base font-bold transition-all ${
              isActive('/search') ? 'bg-white/10 text-secondary' : 'text-blue-100'
            }`}
          >
            <Search className="w-5 h-5" /> Search Rides
          </Link>

          <Link 
            to="/buses" 
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 p-3 rounded-xl text-base font-bold transition-all ${
              isActive('/buses') ? 'bg-white/10 text-secondary' : 'text-blue-100'
            }`}
          >
            <Bus className="w-5 h-5" /> Our Fleet
          </Link>

          <div className="border-t border-white/5 my-2 pt-2">
            {user ? (
              <div className="space-y-3">
                <div className="px-3 py-2 bg-white/5 rounded-xl flex items-center gap-3">
                  <User className="w-8 h-8 text-blue-300" />
                  <div>
                    <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">{user.role}</p>
                    <p className="text-sm font-extrabold">{user.name || user.companyName}</p>
                  </div>
                </div>

                {user.role === 'operator' || user.role === 'admin' ? (
                  <Link 
                    to="/admin" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 w-full p-3 rounded-xl text-base font-bold bg-yellow-500/10 text-secondary border border-yellow-500/20"
                  >
                    <Shield className="w-5 h-5" /> {user.role === 'admin' ? 'Admin Panel' : 'Operator Panel'}
                  </Link>
                ) : (
                  <Link 
                    to="/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 w-full p-3 rounded-xl text-base font-bold bg-white/5 text-blue-100 border border-white/5"
                  >
                    <BookOpen className="w-5 h-5" /> Passenger Dashboard
                  </Link>
                )}

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full p-3 rounded-xl text-base font-bold text-red-300 bg-red-500/5 hover:bg-red-500/10 transition-all border border-red-500/10 cursor-pointer"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-center font-bold text-blue-100 hover:bg-white/5 border border-white/10"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-secondary text-dark px-4 py-3 rounded-xl text-center font-extrabold shadow-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
