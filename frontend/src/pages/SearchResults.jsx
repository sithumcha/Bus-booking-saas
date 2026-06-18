import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import BusCard from '../components/BusCard';
import { Filter, SlidersHorizontal, Bus as BusIcon, SearchX, Clock, Wind, Maximize2, Moon } from 'lucide-react';

const SearchResults = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Filter States
  const [filters, setFilters] = useState({
    busClass: [], // 'AC Luxury', 'Non-AC', 'Sleeper', 'Semi-Sleeper'
    timeOfDay: [] // 'Morning', 'Night'
  });

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(location.search);
        const { data } = await api.get(`/trips?${params.toString()}`);
        setTrips(data);
      } catch (error) {
        console.error('Failed to fetch trips', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [location.search]);

  const handleFilterChange = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value) 
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const resetFilters = () => {
    setFilters({ busClass: [], timeOfDay: [] });
  };

  // Apply filters to trips
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      // Filter by Bus Class
      if (filters.busClass.length > 0) {
        if (!trip.bus || !filters.busClass.includes(trip.bus.type)) {
          return false;
        }
      }

      // Filter by Time Of Day
      if (filters.timeOfDay.length > 0) {
        const isAM = trip.departureTime.toUpperCase().includes('AM');
        const isPM = trip.departureTime.toUpperCase().includes('PM');
        
        let match = false;
        if (filters.timeOfDay.includes('Morning') && isAM) match = true;
        if (filters.timeOfDay.includes('Night') && isPM) match = true;

        if (!match) return false;
      }

      return true;
    });
  }, [trips, filters]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090B] py-12">
      <Helmet>
        <title>Search Results - BusSaaS</title>
        <meta name="description" content="Find the best buses for your journey. Filter by AC, non-AC, morning or night departures." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Advanced Page Header */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-3xl font-heading font-extrabold text-gray-900 dark:text-white drop-shadow-sm">Search Results</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Showing available routes based on your criteria</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Advanced Sticky Filter Sidebar */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="glass-card bg-white/70 dark:bg-[#0E0E12]/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white dark:border-white/5 sticky top-28 animate-fade-in-up">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary dark:text-indigo-400" />
                  <h3 className="font-heading font-black text-lg text-gray-800 dark:text-white">Filters</h3>
                </div>
                <button onClick={resetFilters} className="text-xs font-bold text-gray-400 hover:text-primary dark:hover:text-indigo-400 transition-colors uppercase tracking-widest">Reset</button>
              </div>
              
              {/* Bus Class Filters */}
              <div className="mb-8">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-4 uppercase tracking-widest font-heading">Bus Class</h4>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${filters.busClass.includes('AC Luxury') ? 'bg-primary text-white' : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-300 group-hover:bg-primary group-hover:text-white'}`}>
                        <Wind className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-sm">AC Luxury</span>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300 dark:border-white/10 dark:bg-slate-900"
                      checked={filters.busClass.includes('AC Luxury')}
                      onChange={() => handleFilterChange('busClass', 'AC Luxury')}
                    />
                  </label>

                  <label className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${filters.busClass.includes('Sleeper') ? 'bg-indigo-500 text-white' : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-300 group-hover:bg-indigo-500 group-hover:text-white'}`}>
                        <Moon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-sm">Sleeper</span>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-indigo-500 rounded focus:ring-indigo-500 border-gray-300 dark:border-white/10 dark:bg-slate-900"
                      checked={filters.busClass.includes('Sleeper')}
                      onChange={() => handleFilterChange('busClass', 'Sleeper')}
                    />
                  </label>

                  <label className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${filters.busClass.includes('Non-AC') ? 'bg-secondary text-dark' : 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-350 group-hover:bg-secondary group-hover:text-dark'}`}>
                        <Maximize2 className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-sm">Non-AC</span>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500 border-gray-300 dark:border-white/10 dark:bg-slate-900"
                      checked={filters.busClass.includes('Non-AC')}
                      onChange={() => handleFilterChange('busClass', 'Non-AC')}
                    />
                  </label>
                </div>
              </div>
              
              {/* Departure Time Filters */}
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-4 uppercase tracking-widest font-heading">Departure Time</h4>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-all ${filters.timeOfDay.includes('Morning') ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 group-hover:bg-primary group-hover:text-white'}`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-gray-600 dark:text-gray-300 text-sm">Morning <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-medium">AM Departures</span></span>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300 dark:border-white/10 dark:bg-slate-900"
                      checked={filters.timeOfDay.includes('Morning')}
                      onChange={() => handleFilterChange('timeOfDay', 'Morning')}
                    />
                  </label>
                  <label className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-all ${filters.timeOfDay.includes('Night') ? 'bg-indigo-500 text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 group-hover:bg-indigo-500 group-hover:text-white'}`}>
                        <Moon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-gray-600 dark:text-gray-300 text-sm">Night <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-medium">PM Departures</span></span>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-indigo-500 rounded focus:ring-indigo-500 border-gray-300 dark:border-white/10 dark:bg-slate-900"
                      checked={filters.timeOfDay.includes('Night')}
                      onChange={() => handleFilterChange('timeOfDay', 'Night')}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 bg-white dark:bg-[#0E0E12] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 animate-fade-in-up animation-delay-200">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <BusIcon className="w-5 h-5 text-primary dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-heading font-black text-gray-800 dark:text-white">
                  {filteredTrips.length} <span className="text-gray-400 dark:text-gray-500 font-medium text-lg">Buses Found</span>
                </h2>
              </div>
              <button className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-bold bg-gray-50 dark:bg-white/5 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-white hover:dark:bg-white/10 hover:shadow-md transition-all text-sm cursor-pointer">
                <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                Sort By Price
              </button>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((skeleton) => (
                  <div key={skeleton} className="bg-white dark:bg-[#0E0E12] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 flex gap-6 animate-pulse">
                    <div className="w-48 h-32 bg-gray-200 dark:bg-white/5 rounded-2xl shrink-0"></div>
                    <div className="flex-1 space-y-4 py-2">
                      <div className="h-6 bg-gray-200 dark:bg-white/5 rounded-md w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-md w-1/2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-md w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="bg-white/80 dark:bg-[#0E0E12]/80 backdrop-blur-md p-16 rounded-3xl text-center border border-white dark:border-white/5 shadow-xl animate-scale-in">
                <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <SearchX className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-2xl font-heading font-black text-gray-800 dark:text-white mb-2">No buses available</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">We couldn't find any buses matching your current filters. Try adjusting them to see more results.</p>
                <button 
                  onClick={resetFilters}
                  className="mt-6 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/30 cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredTrips.map((trip, idx) => (
                  <div key={trip._id} className={`animate-fade-in-up animation-delay-${(idx % 5) * 100}`}>
                    <BusCard trip={trip} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
