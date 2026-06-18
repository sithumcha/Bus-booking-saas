import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Users, Wifi, Zap, Droplet, Wind } from 'lucide-react';

const BusCard = ({ trip }) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({ transform: '' });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (-5deg to +5deg)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    // Calculate dynamic gradient for the "shimmer" effect based on mouse position
    const shimmerX = (x / rect.width) * 100;
    const shimmerY = (y / rect.height) * 100;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      background: `radial-gradient(circle at ${shimmerX}% ${shimmerY}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%)`
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      background: 'none'
    });
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop';
  const busImage = trip.bus?.image || fallbackImage;

  return (
    <div 
      className="relative"
      style={{ perspective: '1000px' }}
    >
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform: tiltStyle.transform, transition: tiltStyle.transform.includes('rotateX(0deg)') ? 'transform 0.5s ease-out' : 'none' }}
        className="bg-white dark:bg-[#0E0E12] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100 dark:border-white/5 flex flex-col md:flex-row relative z-10"
      >
        {/* Shimmer Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-50 transition-opacity duration-300"
          style={{ background: tiltStyle.background }}
        ></div>

        {/* Bus Image Container */}
        <div className="relative w-full md:w-56 shrink-0 h-48 md:h-auto min-h-[160px] bg-gray-50 dark:bg-white/5 flex items-center justify-center overflow-hidden">
          <img 
            src={busImage} 
            alt={trip.bus?.brand || 'Bus Fleet'} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent text-white"></div>
          {trip.bus?.type && (
            <span className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/20 shadow-lg">
              {trip.bus.type}
            </span>
          )}
        </div>

        {/* Details Area */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary dark:text-indigo-400 tracking-wide">
                  {trip.bus?.operator?.companyName || 'Operator Name'}
                </span>
                {trip.bus?.brand && (
                  <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                    • {trip.bus.brand}
                  </span>
                )}
              </div>
              
              {/* Seats Left Pill */}
              <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/10 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {(trip.bus?.totalSeats || 40) - (trip.bookedSeats?.length || 0)} seats left
                </span>
              </div>
            </div>

            <h3 className="text-2xl font-heading font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span>{trip.route.from}</span>
              <span className="text-gray-300 dark:text-gray-600 font-light">&rarr;</span>
              <span>{trip.route.to}</span>
            </h3>

            {/* Bus Description */}
            {trip.bus?.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 font-medium italic line-clamp-2">
                "{trip.bus.description}"
              </p>
            )}

            {/* Trip Timings / Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-955/20 rounded-xl shrink-0 shadow-inner">
                  <Clock className="w-4 h-4 text-primary dark:text-indigo-400" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-0.5">Departs</div>
                  <div className="font-bold text-gray-800 dark:text-white">{trip.departureTime}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl shrink-0 shadow-inner">
                  <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-0.5">Arrives</div>
                  <div className="font-bold text-gray-800 dark:text-white">{trip.arrivalTime}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                <div className="p-2 bg-blue-50 dark:bg-blue-955/20 rounded-xl shrink-0 shadow-inner">
                  <MapPin className="w-4 h-4 text-primary dark:text-indigo-400" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-0.5">Boarding</div>
                  <div className="font-bold text-gray-800 dark:text-white">{trip.boardingPoints?.length || 0} stops</div>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities Checklist */}
          {trip.bus?.amenities && trip.bus.amenities.length > 0 && (
            <div className="border-t border-gray-100 dark:border-white/5 pt-4 flex flex-wrap gap-2">
              {trip.bus.amenities.map((amenity, idx) => {
                let IconComponent = null;
                const name = amenity.toLowerCase();
                if (name.includes('wi')) IconComponent = Wifi;
                else if (name.includes('charge') || name.includes('plug') || name.includes('outlet')) IconComponent = Zap;
                else if (name.includes('water') || name.includes('bottle')) IconComponent = Droplet;
                else if (name.includes('ac') || name.includes('air')) IconComponent = Wind;
                
                return (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/5 uppercase tracking-widest hover:bg-white hover:dark:bg-white/10 hover:shadow-md transition-all cursor-default"
                  >
                    {IconComponent && <IconComponent className="w-3 h-3 text-gray-400 dark:text-gray-500" />}
                    {amenity}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Fare / Book CTA Section */}
        <div className="w-full md:w-56 shrink-0 p-8 flex md:flex-col justify-between md:justify-center items-center md:items-end gap-6 border-t md:border-t-0 md:border-l border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0E0E12]/50">
          <div className="text-left md:text-right">
            <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1">Fare per seat</div>
            <div className="text-3xl font-heading font-black text-primary dark:text-indigo-400 drop-shadow-sm">
              LKR {trip.fare}
            </div>
          </div>
          <button 
            onClick={() => navigate(`/booking/${trip._id || trip.bus._id}`)}
            className="w-full bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-dark text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-gray-900/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex justify-center items-center gap-2"
          >
            Select Seats
          </button>
        </div>
      </div>
      
      {/* 3D Drop Shadow layer */}
      <div 
        className="absolute inset-4 bg-black/10 rounded-[40px] blur-xl -z-10 transition-opacity duration-500"
        style={{ opacity: tiltStyle.transform.includes('rotateX(0deg)') ? 0 : 1 }}
      ></div>
    </div>
  );
};

export default BusCard;
