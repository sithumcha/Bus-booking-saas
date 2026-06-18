import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Bus, Users, Shield, Layout, Search, Wifi, Zap, Droplet, Wind } from 'lucide-react';

const ClientBuses = () => {
  const [buses, setBuses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('none');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [busesRes, tripsRes] = await Promise.all([
          api.get('/buses/all'),
          api.get('/trips')
        ]);
        setBuses(busesRes.data || []);
        setTrips(tripsRes.data || []);
      } catch (error) {
        console.error('Failed to fetch fleet data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const filteredBuses = buses.filter(bus => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (bus.registrationNumber || '').toLowerCase().includes(searchLower) ||
      (bus.brand || '').toLowerCase().includes(searchLower) ||
      (bus.operator?.companyName || '').toLowerCase().includes(searchLower) ||
      (bus.description || '').toLowerCase().includes(searchLower);

    const matchesType = selectedType === 'All' || bus.type === selectedType;

    const matchesAmenities = selectedAmenities.every(amenity =>
      bus.amenities && bus.amenities.includes(amenity)
    );

    return matchesSearch && matchesType && matchesAmenities;
  }).sort((a, b) => {
    if (sortBy === 'seats-asc') return a.totalSeats - b.totalSeats;
    if (sortBy === 'seats-desc') return b.totalSeats - a.totalSeats;
    return 0;
  });

  const fallbackImage = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090B] py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-5xl font-heading font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-sm">
            Our <span className="text-gradient-dark dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-gray-400">Luxury Fleet</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-light">
            Explore our state-of-the-art vehicles equipped with high-end amenities for your ultimate safety and comfort.
          </p>
        </div>

        {/* Search & Filter Panel */}
        <div className="glass dark:bg-[#0E0E12]/80 p-6 md:p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-white/5 mb-12 animate-fade-in-up transition-colors duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
            
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Search Fleet</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by operator, brand, number plate..."
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#121217] border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Bus Type Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Bus Class</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#121217] border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="All">All Classes</option>
                <option value="AC Luxury">AC Luxury</option>
                <option value="Non-AC">Non-AC</option>
                <option value="Sleeper">Sleeper</option>
                <option value="Semi-Sleeper">Semi-Sleeper</option>
              </select>
            </div>

            {/* Sort by seats */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Sort By Capacity</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#121217] border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="none">Default Sort</option>
                <option value="seats-asc">Seats: Low to High</option>
                <option value="seats-desc">Seats: High to Low</option>
              </select>
            </div>

          </div>

          {/* Amenities checklist filter */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Filter by Amenities</p>
            <div className="flex flex-wrap gap-2.5">
              {['WiFi', 'Charging Point', 'Water Bottle', 'Pillow', 'Blanket', 'Reading Light'].map(amenity => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      isSelected 
                        ? 'bg-primary text-white border-primary shadow-md shadow-blue-500/10' 
                        : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-gray-300 hover:dark:border-white/20 hover:bg-gray-50 hover:dark:bg-white/10'
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
              {selectedAmenities.length > 0 && (
                <button
                  onClick={() => setSelectedAmenities([])}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 hover:dark:bg-red-950/20 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : buses.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center border border-gray-100 shadow-sm max-w-xl mx-auto">
            <Bus className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No buses available right now</h3>
            <p className="text-gray-500">Check back later as operators register new buses in our network.</p>
          </div>
        ) : buses.length === 0 ? (
          <div className="bg-white dark:bg-[#0E0E12] p-12 rounded-2xl text-center border border-gray-100 dark:border-white/5 shadow-sm max-w-xl mx-auto">
            <Bus className="w-16 h-16 mx-auto text-gray-300 mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No buses available right now</h3>
            <p className="text-gray-500 dark:text-gray-400">Check back later as operators register new buses in our network.</p>
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="bg-white dark:bg-[#0E0E12] p-12 rounded-2xl text-center border border-gray-100 dark:border-white/5 shadow-sm max-w-xl mx-auto">
            <Bus className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No buses match your filters</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or changing filters to see other fleet vehicles.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('All');
                setSelectedAmenities([]);
                setSortBy('none');
              }}
              className="mt-6 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredBuses.map(bus => {
              const busTrips = trips.filter(t => t.bus?._id === bus._id);

              return (
                <div 
                  key={bus._id} 
                  className="bg-white dark:bg-[#0E0E12] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  {/* Image & Type Header */}
                  <div className="relative h-64 bg-gray-105 dark:bg-[#121217] overflow-hidden">
                    <img 
                      src={bus.image || fallbackImage} 
                      alt={bus.brand || 'Bus Fleet'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                    
                    {/* Bus Type Tag */}
                    <span className="absolute top-4 left-4 bg-primary/95 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-lg">
                      {bus.type || 'Standard'}
                    </span>

                    {/* License Plate Badge */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white border border-white/20 px-3 py-1 rounded-xl text-[11px] font-mono font-bold tracking-wider">
                      <Shield className="w-3.5 h-3.5 text-secondary" />
                      <span>{bus.registrationNumber ? bus.registrationNumber.toUpperCase() : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 p-8 flex flex-col justify-between">
                    <div>
                      {/* Operator & Brand */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-sm font-extrabold text-primary dark:text-indigo-400 tracking-wide">
                          {bus.operator?.companyName || 'Registered Operator'}
                        </span>
                        {bus.brand && (
                          <span className="text-gray-400 dark:text-gray-400 text-xs font-bold uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/5">
                            {bus.brand}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {bus.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium leading-relaxed">
                          {bus.description}
                        </p>
                      )}

                      {/* Features Grid */}
                      <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 dark:border-white/5 py-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 dark:bg-indigo-955/30 text-primary dark:text-indigo-400 rounded-xl shrink-0">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-400 dark:text-gray-505 font-bold uppercase tracking-widest">Capacity</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{bus.totalSeats} Passenger Seats</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 dark:bg-indigo-955/30 text-primary dark:text-indigo-400 rounded-xl shrink-0">
                            <Layout className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-400 dark:text-gray-555 font-bold uppercase tracking-widest">Seating Plan</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{bus.seatLayout} Cabin Layout</p>
                          </div>
                        </div>
                      </div>

                      {/* Amenities list */}
                      {bus.amenities && bus.amenities.length > 0 && (
                        <div className="mb-6">
                          <p className="text-[9px] text-gray-450 dark:text-gray-500 font-bold uppercase tracking-widest mb-2.5">Cabin Comforts</p>
                          <div className="flex flex-wrap gap-2">
                            {bus.amenities.map((amenity, idx) => {
                              let IconComponent = null;
                              const name = amenity.toLowerCase();
                              if (name.includes('wi')) IconComponent = Wifi;
                              else if (name.includes('charge') || name.includes('plug') || name.includes('outlet')) IconComponent = Zap;
                              else if (name.includes('water') || name.includes('bottle')) IconComponent = Droplet;
                              else if (name.includes('ac') || name.includes('air')) IconComponent = Wind;
                              
                              return (
                                <span 
                                  key={idx} 
                                  className="inline-flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/5 uppercase tracking-wider"
                                >
                                  {IconComponent && <IconComponent className="w-3.5 h-3.5 text-gray-400" />}
                                  {amenity}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Upcoming Departures Section */}
                      <div className="border-t border-gray-100 dark:border-white/5 pt-6">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Upcoming Journeys
                        </p>
                        {busTrips.length > 0 ? (
                          <div className="space-y-3">
                            {busTrips.slice(0, 3).map((trip) => (
                              <div 
                                key={trip._id} 
                                className="flex justify-between items-center bg-gray-50 dark:bg-[#121217] hover:bg-gray-100/70 hover:dark:bg-[#161620] p-3 rounded-2xl border border-gray-200 dark:border-white/5 transition-all duration-200"
                              >
                                <div className="text-left">
                                  <p className="text-xs font-black text-gray-800 dark:text-white flex items-center gap-1">
                                    <span>{trip.route.from}</span>
                                    <span className="text-gray-400 font-normal">&rarr;</span>
                                    <span>{trip.route.to}</span>
                                  </p>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-0.5">
                                    {trip.departureTime} • {new Date(trip.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Fare</p>
                                    <span className="text-xs font-extrabold text-primary dark:text-indigo-400">LKR {trip.fare}</span>
                                  </div>
                                  <button 
                                    onClick={() => navigate(`/booking/${trip._id}`)}
                                    className="px-3.5 py-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-black hover:dark:bg-gray-200 text-[10px] font-black rounded-xl cursor-pointer transition-all shadow-md shadow-gray-900/10 hover:shadow-lg"
                                  >
                                    Book Now
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold italic text-left">
                            No upcoming rides scheduled. Check back later!
                          </p>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientBuses;
