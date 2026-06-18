import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Satellite, StopCircle, PlayCircle, Loader2, GaugeCircle, MapPin, Map, RefreshCw } from 'lucide-react';

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
  className: 'custom-bus-icon bg-white rounded-full shadow-lg p-1 border-2 border-primary',
  iconSize: [44, 44],
  iconAnchor: [22, 22]
});

// Dictionary of city/stop coordinates for default mapping and quick resolution
const CITIES = {
  'Colombo': [6.9271, 79.8612],
  'Kandy': [7.2906, 80.6337],
  'Jaffna': [9.6615, 80.0255],
  'Galle': [6.0535, 80.2210],
  'Trincomalee': [8.5874, 81.2152],
  'Negombo': [7.2089, 79.8353],
  'Kurunegala': [7.4863, 80.3647],
  'Anuradhapura': [8.3114, 80.4037],
  'Matara': [5.9549, 80.5550],
  'Batticaloa': [7.7170, 81.7010],
  'Polonnaruwa': [7.9397, 81.0026],
  'Dambulla': [7.8731, 80.6517],
  'Kadawatha': [7.0016, 79.9482],
  'Pettah': [6.9372, 79.8521],
  'Pettah Bus Stand': [6.9372, 79.8521],
  'Kadawatha Highway Entrance': [7.0016, 79.9482],
  'Peradeniya': [7.2714, 80.5969],
  'Kandy Goods Shed': [7.2906, 80.6337],
  'Negombo Bus Stand': [7.2089, 79.8353],
  'Vavuniya': [8.7514, 80.4971],
  'Jaffna Bus Stand': [9.6615, 80.0255]
};

// Map click event subcomponent
const MapClickHandler = ({ onMapClick, enabled }) => {
  useMapEvents({
    click: (e) => {
      if (enabled) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    }
  });
  return null;
};

const DriverTracking = ({ trip, onClose }) => {
  const [trackingMode, setTrackingMode] = useState('gps'); // 'gps' or 'manual'
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [error, setError] = useState('');

  // Manual input states
  const [manualCoords, setManualCoords] = useState({ lat: '', lng: '', speed: '0' });
  const [isUpdatingManual, setIsUpdatingManual] = useState(false);
  
  const watchIdRef = useRef(null);
  const lastSyncRef = useRef(0);

  // Compute default center (Origin coords or Colombo)
  const originName = trip?.route?.from || 'Colombo';
  const defaultCenter = useMemo(() => CITIES[originName] || [6.9271, 79.8612], [originName]);

  // Extract all boarding/dropping points from trip for quick selection
  const tripStops = useMemo(() => {
    const stops = [];
    if (trip?.route?.from) {
      stops.push({ name: `${trip.route.from} (Origin)`, location: trip.route.from });
    }
    if (trip?.boardingPoints) {
      trip.boardingPoints.forEach(bp => {
        stops.push({ name: `${bp.location} (Boarding)`, location: bp.location });
      });
    }
    if (trip?.droppingPoints) {
      trip.droppingPoints.forEach(dp => {
        stops.push({ name: `${dp.location} (Dropping)`, location: dp.location });
      });
    }
    if (trip?.route?.to) {
      stops.push({ name: `${trip.route.to} (Destination)`, location: trip.route.to });
    }
    return stops;
  }, [trip]);

  // Set default manual coordinates when component loads
  useEffect(() => {
    setManualCoords(prev => ({
      ...prev,
      lat: defaultCenter[0].toFixed(6),
      lng: defaultCenter[1].toFixed(6)
    }));
  }, [defaultCenter]);

  const startBroadcast = () => {
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsBroadcasting(true);

    // Watch position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, speed: gpsSpeed } = position.coords;
        const coords = [latitude, longitude];
        const currentSpeedKmH = gpsSpeed ? Math.round(gpsSpeed * 3.6) : 0;
        
        setCurrentCoords(coords);
        setSpeed(currentSpeedKmH);

        // Throttle updates to backend to every 5 seconds
        const now = Date.now();
        if (now - lastSyncRef.current > 5000) {
          lastSyncRef.current = now;
          try {
            await api.put(`/trips/${trip._id}/location`, {
              lat: latitude,
              lng: longitude,
              speed: currentSpeedKmH
            });
          } catch (err) {
            console.error('Failed to sync location to server', err);
          }
        }
      },
      (err) => {
        setError(`GPS Error: ${err.message}`);
        stopBroadcast();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    );
  };

  const stopBroadcast = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsBroadcasting(false);
  };

  const handleStopSelect = (e) => {
    const selectedStop = e.target.value;
    if (!selectedStop) return;
    const coords = CITIES[selectedStop];
    if (coords) {
      setManualCoords(prev => ({
        ...prev,
        lat: coords[0].toFixed(6),
        lng: coords[1].toFixed(6)
      }));
    }
  };

  const handleMapClick = (coords) => {
    setManualCoords(prev => ({
      ...prev,
      lat: coords[0].toFixed(6),
      lng: coords[1].toFixed(6)
    }));
  };

  const handleManualUpdate = async (e) => {
    e.preventDefault();
    const latNum = parseFloat(manualCoords.lat);
    const lngNum = parseFloat(manualCoords.lng);
    const speedNum = parseInt(manualCoords.speed) || 0;

    if (isNaN(latNum) || isNaN(lngNum)) {
      setError('Please provide valid Latitude and Longitude values.');
      return;
    }

    try {
      setIsUpdatingManual(true);
      setError('');
      
      const { data } = await api.put(`/trips/${trip._id}/location`, {
        lat: latNum,
        lng: lngNum,
        speed: speedNum
      });
      
      setCurrentCoords([latNum, lngNum]);
      setSpeed(speedNum);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update location manually.');
    } finally {
      setIsUpdatingManual(false);
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col animate-fade-in">
      
      {/* Header */}
      <div className="bg-slate-900 p-4 border-b border-white/10 flex justify-between items-center text-white shrink-0 shadow-lg">
        <div>
          <h2 className="text-xl font-heading font-black tracking-wide flex items-center gap-2">
            Driver Broadcast Terminal
            {isBroadcasting && <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full animate-pulse-soft">Live</span>}
          </h2>
          <p className="text-gray-400 text-xs font-medium mt-1">
            Trip: {trip.route?.from} → {trip.route?.to} | ID: {trip._id}
          </p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400">Close</button>
      </div>

      {/* Main UI */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        
        {/* Controls Sidebar */}
        <div className="w-full lg:w-96 bg-slate-800 p-6 flex flex-col shrink-0 border-r border-white/5 z-10 shadow-xl overflow-y-auto">
          
          {/* Mode Selector */}
          <div className="bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 flex mb-6 relative overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => {
                stopBroadcast();
                setTrackingMode('gps');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all z-10 ${trackingMode === 'gps' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-white'}`}
            >
              <Satellite className="w-4 h-4" /> Hardware GPS
            </button>
            <button
              type="button"
              onClick={() => {
                stopBroadcast();
                setTrackingMode('manual');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all z-10 ${trackingMode === 'manual' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-white'}`}
            >
              <MapPin className="w-4 h-4" /> Manual Sync
            </button>
          </div>

          <div className="flex-1">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-bold mb-6">
                {error}
              </div>
            )}

            {/* GPS BROADCAST MODE */}
            {trackingMode === 'gps' && (
              <div className="space-y-6 animate-fade-in">
                <div className={`p-6 rounded-3xl border-2 transition-all duration-500 flex flex-col items-center justify-center text-center ${isBroadcasting ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'bg-slate-900 border-white/10'}`}>
                  
                  <div className="relative mb-6">
                    <div className={`absolute inset-0 rounded-full blur-xl ${isBroadcasting ? 'bg-emerald-500/30 animate-pulse' : 'bg-transparent'}`}></div>
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center relative shadow-inner border-4 ${isBroadcasting ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-700 border-slate-600'}`}>
                      <Satellite className={`w-10 h-10 text-white ${isBroadcasting ? 'animate-pulse' : ''}`} />
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-2 font-heading">
                    {isBroadcasting ? 'GPS Active' : 'GPS Offline'}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium">
                    {isBroadcasting ? 'Your GPS chip is reading location data and securely streaming it to passengers.' : 'Press start to connect to GPS satellites and begin broadcasting your location.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-white/5 shadow-inner">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <GaugeCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Speed</span>
                    </div>
                    <p className="text-2xl font-black text-white">{isBroadcasting ? speed : '--'} <span className="text-xs text-gray-500 font-medium">km/h</span></p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-2xl border border-white/5 shadow-inner">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">GPS Lock</span>
                    </div>
                    <p className="text-xs font-bold text-white mt-1">
                      {isBroadcasting ? <span className="text-emerald-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Streaming</span> : <span className="text-gray-400">Disconnected</span>}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={isBroadcasting ? stopBroadcast : startBroadcast}
                  className={`w-full py-4.5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl cursor-pointer ${isBroadcasting ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'}`}
                >
                  {isBroadcasting ? (
                    <><StopCircle className="w-6 h-6" /> Stop Broadcast</>
                  ) : (
                    <><PlayCircle className="w-6 h-6" /> Start GPS Sync</>
                  )}
                </button>
              </div>
            )}

            {/* MANUAL LOCATION MODE */}
            {trackingMode === 'manual' && (
              <form onSubmit={handleManualUpdate} className="space-y-5 animate-fade-in">
                <div className="bg-slate-900 p-5 rounded-2xl border border-white/5">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">City / Stop Quick Preset</h4>
                  <select
                    onChange={handleStopSelect}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-primary font-semibold cursor-pointer"
                  >
                    <option value="">-- Select Stop Coordinate --</option>
                    {tripStops.map((stop, idx) => (
                      <option key={idx} value={stop.location}>
                        {stop.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Manual Coordinates</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Latitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        required
                        placeholder="6.9271"
                        value={manualCoords.lat}
                        onChange={(e) => setManualCoords({ ...manualCoords, lat: e.target.value })}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Longitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        required
                        placeholder="79.8612"
                        value={manualCoords.lng}
                        onChange={(e) => setManualCoords({ ...manualCoords, lng: e.target.value })}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Current Speed (km/h)</label>
                    <input
                      type="number"
                      min="0"
                      max="150"
                      value={manualCoords.speed}
                      onChange={(e) => setManualCoords({ ...manualCoords, speed: e.target.value })}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                  
                  <div className="bg-slate-800/50 p-3.5 rounded-xl border border-white/5 text-[10px] text-gray-400 leading-relaxed">
                    💡 <strong>Tip:</strong> Click anywhere on the map on the right to instantly drop a pin and read the coordinates.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingManual}
                  className="w-full py-4.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  {isUpdatingManual ? (
                    <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Updating...</>
                  ) : (
                    <><RefreshCw className="w-4.5 h-4.5" /> Sync Location Manually</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Live Map Feedback */}
        <div className="flex-1 relative bg-slate-950">
          <MapContainer 
            center={currentCoords || defaultCenter} 
            zoom={12} 
            className="w-full h-full z-0 filter brightness-90"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            <MapClickHandler onMapClick={handleMapClick} enabled={trackingMode === 'manual'} />
            
            {/* Bus Marker */}
            {currentCoords && (
              <Marker position={currentCoords} icon={busIcon}>
                <Popup>
                  <div className="text-xs font-semibold text-gray-800">
                    <p className="font-bold text-primary mb-1">Bus NC-4455</p>
                    <p>Speed: {speed} km/h</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Clicked location preview pin (in manual mode) */}
            {trackingMode === 'manual' && manualCoords.lat && manualCoords.lng && (
              <Marker 
                position={[parseFloat(manualCoords.lat), parseFloat(manualCoords.lng)]}
                icon={L.divIcon({
                  html: '<div class="w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping"></div><div class="w-3 h-3 bg-red-500 rounded-full border-2 border-white absolute top-0"></div>',
                  className: 'manual-pin-preview',
                  iconSize: [12, 12],
                  iconAnchor: [6, 6]
                })}
              />
            )}
          </MapContainer>
          
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white text-[10px] uppercase font-bold tracking-widest shadow-lg flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${trackingMode === 'gps' ? 'bg-emerald-500 animate-ping' : 'bg-blue-500'}`}></span>
              {trackingMode === 'gps' ? 'GPS Signal Terminal' : 'Manual Editing Map'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DriverTracking;
