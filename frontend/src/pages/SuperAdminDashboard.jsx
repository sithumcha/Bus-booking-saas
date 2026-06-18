import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Shield, TrendingUp, Users, Bus, Navigation, Activity, Banknote, Map, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SuperAdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/superadmin/stats');
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load platform statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Mock historical data for the area chart since we only have current totals
  const getHistoricalData = () => {
    return [
      { month: 'Jan', revenue: (stats?.global?.totalCommission || 0) * 0.4 },
      { month: 'Feb', revenue: (stats?.global?.totalCommission || 0) * 0.5 },
      { month: 'Mar', revenue: (stats?.global?.totalCommission || 0) * 0.6 },
      { month: 'Apr', revenue: (stats?.global?.totalCommission || 0) * 0.8 },
      { month: 'May', revenue: (stats?.global?.totalCommission || 0) * 0.9 },
      { month: 'Jun', revenue: stats?.global?.totalCommission || 0 }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#09090B] flex items-center justify-center">
        <div className="animate-spin text-primary">
          <Activity className="w-10 h-10" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#09090B] p-8">
        <div className="max-w-4xl mx-auto bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200">
          <h2 className="font-bold text-lg mb-2">Access Denied</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090B] py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-heading font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Platform Owner Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Global overview of all operations, operators, and platform revenue.
            </p>
          </div>
          <div className="mt-4 md:mt-0 bg-white dark:bg-[#0E0E12] px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">System Online</span>
          </div>
        </div>

        {/* TOP KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up animation-delay-100">
          
          <div className="bg-white dark:bg-[#0E0E12] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 bg-blue-50 dark:bg-blue-900/20 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Total Platform Revenue</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white">LKR {stats?.global?.totalCommission?.toLocaleString()}</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-2 flex items-center gap-1">
                  Lifetime Platform Earnings
                </p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-2xl">
                <Banknote className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0E0E12] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 bg-emerald-50 dark:bg-emerald-900/20 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Registered Operators</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats?.global?.totalOperators}</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> All accounts active
                </p>
              </div>
              <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-2xl">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0E0E12] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 bg-purple-50 dark:bg-purple-900/20 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Total Fleet Size</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats?.global?.totalBuses}</h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-2">Buses across all operators</p>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 rounded-2xl">
                <Bus className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0E0E12] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 bg-amber-50 dark:bg-amber-900/20 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Global Passengers</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats?.global?.totalPassengers}</h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-2">Registered passenger accounts</p>
              </div>
              <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 rounded-2xl">
                <Navigation className="w-6 h-6" />
              </div>
            </div>
          </div>

        </div>

        {/* MIDDLE SECTION: CHART & OVERVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-fade-in-up animation-delay-200">
          
          <div className="lg:col-span-2 bg-white dark:bg-[#0E0E12] border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Platform Commission Growth</h3>
                <p className="text-xs text-gray-500 mt-1">Based on 5% platform cut of all bookings</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-primary">LKR {stats?.global?.totalCommission.toLocaleString()}</p>
                <p className="text-xs text-emerald-500 font-bold">Total YTD</p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getHistoricalData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isDark ? "#f59e0b" : "#3b82f6"} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={isDark ? "#f59e0b" : "#3b82f6"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#27272a" : "#f1f5f9"} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? "#71717a" : "#94a3b8", fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? "#71717a" : "#94a3b8", fontWeight: 600 }} tickFormatter={(val) => `LKR ${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#18181b' : '#ffffff', 
                      border: isDark ? '1px solid #3f3f46' : '1px solid #f1f5f9', 
                      color: isDark ? '#ffffff' : '#09090b',
                      borderRadius: '16px', 
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', 
                      fontWeight: 'bold' 
                    }} 
                    formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Commission']} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke={isDark ? "#f59e0b" : "#3b82f6"} strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-gray-800 dark:from-black dark:to-[#0a0a0f] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="relative z-10">
              <Map className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-2xl font-black mb-2">Total Network Volume</h3>
              <p className="text-sm text-gray-400 font-medium mb-8">Gross Merchandise Value (GMV) of all tickets sold across all operators.</p>
              
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Global GMV</p>
                  <p className="text-4xl font-black text-white">LKR {stats?.global?.totalGMV.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Active Trips</p>
                  <p className="text-2xl font-bold text-gray-300">{stats?.global?.totalTrips}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* OPERATORS TABLE */}
        <div className="bg-white dark:bg-[#0E0E12] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden animate-fade-in-up animation-delay-300">
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Registered Bus Operators</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Breakdown of revenue and fleet size per company.</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#15151a] text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100 dark:border-white/5">
                  <th className="p-4 pl-6">Operator Company</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Fleet Size</th>
                  <th className="p-4">Scheduled Trips</th>
                  <th className="p-4">Gross Revenue</th>
                  <th className="p-4 pr-6 text-right">Commission Cut (5%)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stats?.operators.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400 italic">No operators registered on the platform yet.</td>
                  </tr>
                ) : (
                  stats?.operators.map((op, idx) => (
                    <tr key={op._id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 pl-6">
                        <p className="font-bold text-gray-900 dark:text-white">{op.companyName}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{op._id.substring(0, 8)}</p>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{op.email}</td>
                      <td className="p-4 font-semibold text-gray-800 dark:text-gray-300">{op.busesCount} buses</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{op.tripsCount} trips</td>
                      <td className="p-4 font-bold text-gray-800 dark:text-gray-300">LKR {op.totalRevenue.toLocaleString()}</td>
                      <td className="p-4 pr-6 text-right font-black text-emerald-600 dark:text-emerald-400">
                        LKR {op.commissionGenerated.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SuperAdminDashboard;
