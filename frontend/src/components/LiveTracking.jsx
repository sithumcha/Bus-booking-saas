import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation2, Clock, MapPin, GaugeCircle, X, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';

// Custom Bus Icon
const busIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="#1E3A8A" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M8 6v6"/>
  <path d="M15 6v6"/>
  <path d="M2 12h19.6"/>
  <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/>
  <circle cx="7" cy="18" r="2"/>
  <circle cx="17" cy="18" r="2"/>
</svg>
`;

const busIcon = L.divIcon({
  html: busIconSvg,
  className: 'custom-bus-icon bg-white rounded-full shadow-lg p-1 border-2 border-primary animate-pulse-soft',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22]
});

// City Coordinates Dictionary
const CITIES = {
  'Colombo': [6.9271, 79.8612],
  'Kandy': [7.2906, 80.6337],
  'Jaffna': [9.6615, 80.0255],
  'Galle': [6.0535, 80.2210],
  'Trincomalee': [8.5874, 81.2152]
};

// Simple utility to calculate distance between two lat/lng pairs in km
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;  
  const dLon = (lon2 - lon1) * Math.PI / 180; 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

const LiveTracking = ({ trip, onClose }) => {
  const [currentCoords, setCurrentCoords] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [status, setStatus] = useState('Fetching live data...');
  const [error, setError] = useState('');

  // Dynamic dark mode tracking for map themes
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const originName = trip?.route?.from || 'Colombo';
  const destName = trip?.route?.to || 'Kandy';
  
  const originCoords = CITIES[originName] || CITIES['Colombo'];
  const destCoords = CITIES[destName] || CITIES['Kandy'];
  
  const totalDistance = useMemo(() => getDistance(originCoords[0], originCoords[1], destCoords[0], destCoords[1]), [originCoords, destCoords]);

  const distanceRemaining = currentCoords 
    ? getDistance(currentCoords[0], currentCoords[1], destCoords[0], destCoords[1])
    : totalDistance;

  const etaMins = speed > 0 ? Math.round((distanceRemaining / speed) * 60) : '--';
  const progress = currentCoords ? Math.max(0, Math.min(1, 1 - (distanceRemaining / totalDistance))) : 0;

  // Poll Backend for Real Location Data
  useEffect(() => {
    let isMounted = true;

    const fetchLocation = async () => {
      try {
        const { data } = await api.get(`/trips/${trip._id}/location`);
        if (isMounted) {
          if (data.currentLocation && data.currentLocation.lat) {
            setCurrentCoords([data.currentLocation.lat, data.currentLocation.lng]);
            setSpeed(data.currentLocation.speed || 0);
            setLastUpdated(new Date(data.currentLocation.lastUpdated));
            setStatus('Live GPS Sync Active');
            setError('');
          } else {
            setStatus('Waiting for driver to start GPS broadcast...');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to sync with bus telemetry.');
        }
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000); // Poll every 5 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [trip._id]);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-fade-in">
      <div className="bg-white dark:bg-[#0E0E12] rounded-3xl w-full max-w-6xl h-full max-h-[800px] overflow-hidden flex flex-col relative shadow-2xl animate-scale-in border border-gray-100 dark:border-white/5 transition-colors duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-slate-800 dark:from-black dark:to-slate-900 p-4 md:p-6 text-white flex justify-between items-center z-10 shadow-md">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-3 rounded-2xl shadow-inner border border-white/10">
              <Navigation2 className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-black tracking-wide flex items-center gap-2">
                Authentic Telemetry
                <span className="bg-emerald-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full animate-pulse-soft">Connected</span>
              </h2>
              <p className="text-gray-400 text-sm font-medium mt-0.5">
                {originName} <span className="text-primary mx-1">→</span> {destName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors group"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-white" />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-slate-100 dark:bg-zinc-950">
          
          {error && (
            <div className="absolute top-4 left-0 right-0 z-20 flex justify-center">
              <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-455 px-6 py-2 rounded-full font-bold shadow-lg border border-red-100 dark:border-red-950/30 flex items-center gap-2 animate-fade-in-up">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            </div>
          )}

          {!currentCoords && !error && (
            <div className="absolute inset-0 z-20 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-gray-800 dark:text-white font-bold text-xl">{status}</p>
              <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">The map will appear as soon as the driver activates the GPS transmitter.</p>
            </div>
          )}

          <MapContainer 
            center={currentCoords || [(originCoords[0] + destCoords[0]) / 2, (originCoords[1] + destCoords[1]) / 2]} 
            zoom={9} 
            className="w-full h-full z-0"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url={isDark 
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              }
            />
            
            {/* Route Line */}
            <Polyline 
              positions={[originCoords, destCoords]} 
              color={isDark ? "#818CF8" : "#1E3A8A"} 
              weight={4} 
              opacity={0.6}
              dashArray="10, 10"
              className="animate-pulse"
            />
            
            {/* Origin Marker */}
            <Marker position={originCoords}>
              <Popup className="font-bold text-gray-800 rounded-xl">Departure: {originName}</Popup>
            </Marker>
            
            {/* Destination Marker */}
            <Marker position={destCoords}>
              <Popup className="font-bold text-gray-800 rounded-xl">Arrival: {destName}</Popup>
            </Marker>

            {/* Actual Live Bus Marker */}
            {currentCoords && (
              <Marker position={currentCoords} icon={busIcon}>
                <Popup className="font-bold text-gray-800 rounded-xl shadow-lg border-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-primary uppercase text-[10px] tracking-widest font-black">Active Route</span>
                    <span>{trip?.bus?.registrationNumber || 'Bus-1234'}</span>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Glassmorphic Overlay Panel */}
          {currentCoords && (
            <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-96 bg-white/90 dark:bg-[#0E0E12]/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-gray-105 dark:border-white/5 z-10 animate-fade-in-up animation-delay-200 transition-colors duration-300">
              <h3 className="font-heading font-extrabold text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-sm flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                  Real-Time Metrics
                </span>
                <span className="text-[9px] text-gray-405 dark:text-gray-400 tracking-normal font-medium bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                  Sync: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Now'}
                </span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                    <GaugeCircle className="w-4 h-4 text-primary dark:text-indigo-400" />
                    <span className="text-xs font-bold uppercase">Speed</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{speed} <span className="text-sm text-gray-400 font-medium">km/h</span></p>
                </div>
                
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                    <Clock className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-bold uppercase">ETA</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{etaMins} <span className="text-sm text-gray-400 font-medium">mins</span></p>
                </div>
              </div>

              <div className="mt-4 bg-primary/5 dark:bg-indigo-500/10 p-4 rounded-2xl border border-primary/10 dark:border-indigo-500/20 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">Next Stop</p>
                  <p className="font-bold text-gray-900 dark:text-white">{trip?.droppingPoints?.[0]?.location || destName}</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  <span>{originName}</span>
                  <span>{destName}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-linear rounded-full relative"
                    style={{ width: `${progress * 100}%` }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/40 blur-sm animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default LiveTracking;
