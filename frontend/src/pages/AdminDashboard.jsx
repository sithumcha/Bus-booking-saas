import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { LayoutDashboard, Bus, CalendarClock, FileText, Plus, Edit2, Trash2, 
  MapPin, Clock, X, Info, Check, CheckCircle, Printer, AlertCircle, Loader2, Settings, User, Phone, Image, Upload, Satellite, ShieldAlert, Lock, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';
import AddBus from './AddBus';
import DriverTracking from '../components/DriverTracking';

const BUS_IMAGE_PRESETS = [
  { name: 'AC Luxury Coach (Blue)', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop' },
  { name: 'Sleek Cruiser (White)', url: 'https://images.unsplash.com/photo-1626125345510-4603468eedfb?w=500&auto=format&fit=crop' },
  { name: 'Modern Sleeper (Red)', url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop' },
  { name: 'Urban Double Decker', url: 'https://images.unsplash.com/photo-1562620644-66bdc0e97d1b?w=500&auto=format&fit=crop' }
];

const ROUTE_CITIES = ['Colombo', 'Kandy', 'Jaffna', 'Galle', 'Trincomalee'];

const AdminDashboard = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dynamic dark mode tracking for Recharts colors
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);
  
  // Data States
  const [buses, setBuses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showBusModal, setShowBusModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [busForm, setBusForm] = useState({
    registrationNumber: '',
    type: 'AC Luxury',
    totalSeats: 40,
    seatLayout: '2x2',
    amenities: [],
    brand: '',
    image: BUS_IMAGE_PRESETS[0].url,
    description: ''
  });
  const [busError, setBusError] = useState('');
  const [imageSourceTab, setImageSourceTab] = useState('upload');

  const [showTripModal, setShowTripModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [tripForm, setTripForm] = useState({
    busId: '',
    routeFrom: 'Colombo',
    routeTo: 'Kandy',
    date: '',
    departureTime: '',
    arrivalTime: '',
    fare: '',
    boardingPoints: [],
    droppingPoints: []
  });
  const [boardingInput, setBoardingInput] = useState({ location: '', time: '' });
  const [droppingInput, setDroppingInput] = useState({ location: '', time: '' });
  const [tripError, setTripError] = useState('');

  // Driver Modal States
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [driverForm, setDriverForm] = useState({
    name: '',
    licenseNumber: '',
    phone: '',
    status: 'Active',
    assignedBus: ''
  });
  const [driverError, setDriverError] = useState('');

  // Driver GPS Tracking State
  const [trackingTrip, setTrackingTrip] = useState(null);

  // Manifest Selection
  const [selectedTripId, setSelectedTripId] = useState('');

  // Operator Profile Update States
  const [profileForm, setProfileForm] = useState({
    companyName: user?.companyName || '',
    contactNumber: user?.contactNumber || '',
    password: '',
    confirmPassword: ''
  });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // SVG Chart Tooltips
  const [hoveredRevenuePoint, setHoveredRevenuePoint] = useState(null);
  const [hoveredBarPoint, setHoveredBarPoint] = useState(null);

  // Fetch operator data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [busRes, tripRes, bookingRes, driverRes] = await Promise.all([
        api.get('/buses'),
        api.get('/trips/operator').catch(() => ({ data: [] })),
        api.get('/bookings/operator').catch(() => ({ data: [] })),
        api.get('/drivers').catch(() => ({ data: [] }))
      ]);
      setBuses(busRes.data);
      setTrips(tripRes.data);
      setBookings(bookingRes.data);
      setDrivers(driverRes.data);
      if (tripRes.data.length > 0) {
        setSelectedTripId(tripRes.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Sync profile data when operator context changes
  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        companyName: user.companyName || '',
        contactNumber: user.contactNumber || ''
      }));
    }
  }, [user]);

  // Statistics calculation
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const activeTripsCount = trips.filter(t => t.status === 'Scheduled').length;
  const totalBookingsCount = bookings.length;

  // Chart data calculations
  const getMonthlyRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    // Generate the last 6 months labels
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      let mIndex = currentMonth - i;
      if (mIndex < 0) mIndex += 12;
      last6Months.push(months[mIndex]);
    }

    const monthlyTotals = [0, 0, 0, 0, 0, 0];
    
    bookings.forEach(b => {
      const bDate = new Date(b.createdAt || Date.now());
      // Calculate how many months ago this booking was (0 is current month, 1 is last month)
      const monthsAgo = (currentDate.getFullYear() - bDate.getFullYear()) * 12 + (currentMonth - bDate.getMonth());
      if (monthsAgo >= 0 && monthsAgo < 6) {
        // Index in our monthlyTotals array (0 is oldest, 5 is current)
        const index = 5 - monthsAgo;
        monthlyTotals[index] += b.totalAmount;
      }
    });

    return last6Months.map((m, idx) => ({ month: m, value: monthlyTotals[idx] }));
  };

  const getBookingsPerBusData = () => {
    const busCounts = {};
    buses.forEach(b => {
      busCounts[b.registrationNumber] = 0;
    });
    
    trips.forEach(t => {
      const reg = t.bus?.registrationNumber;
      if (reg && busCounts[reg] !== undefined) {
        busCounts[reg] += t.bookedSeats?.length || 0;
      }
    });

    return Object.keys(busCounts).map(k => ({ label: k, value: busCounts[k] }));
  };

  // Image upload and compression helper
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Use canvas.toDataURL to output jpeg base64
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => {
          reject(err);
        };
      };
      reader.onerror = (err) => {
        reject(err);
      };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setBusError('Please select a valid image file.');
      return;
    }

    try {
      const compressedBase64 = await compressImage(file);
      setBusForm(prev => ({ ...prev, image: compressedBase64 }));
    } catch (err) {
      console.error('Failed to process image', err);
      setBusError('Failed to process uploaded image.');
    }
  };

  // Bus Management Logic
  const openBusModal = (bus = null) => {
    setBusError('');
    if (bus) {
      setEditingBus(bus);
      setBusForm({
        registrationNumber: bus.registrationNumber,
        type: bus.type,
        totalSeats: bus.totalSeats,
        seatLayout: bus.seatLayout,
        amenities: bus.amenities || [],
        brand: bus.brand || '',
        image: bus.image || BUS_IMAGE_PRESETS[0].url,
        description: bus.description || ''
      });
      // Pre-detect image source tab
      if (bus.image && (bus.image.startsWith('data:') || bus.image.startsWith('blob:'))) {
        setImageSourceTab('upload');
      } else if (bus.image && (bus.image.startsWith('http://') || bus.image.startsWith('https://'))) {
        setImageSourceTab('url');
      } else {
        setImageSourceTab('upload');
      }
    } else {
      setEditingBus(null);
      setBusForm({
        registrationNumber: '',
        type: 'AC Luxury',
        totalSeats: 40,
        seatLayout: '2x2',
        amenities: [],
        brand: '',
        image: BUS_IMAGE_PRESETS[0].url,
        description: ''
      });
      setImageSourceTab('upload');
    }
    setShowBusModal(true);
  };

  const handleBusSubmit = async (e) => {
    e.preventDefault();
    setBusError('');

    if (!busForm.registrationNumber.trim()) {
      setBusError('Registration number is required.');
      return;
    }

    try {
      if (editingBus) {
        const { data } = await api.put(`/buses/${editingBus._id}`, busForm);
        setBuses(prev => prev.map(b => b._id === editingBus._id ? data : b));
      } else {
        const { data } = await api.post('/buses', busForm);
        setBuses(prev => [...prev, data]);
      }
      setShowBusModal(false);
    } catch (error) {
      setBusError(error.response?.data?.message || 'Failed to save bus details.');
    }
  };

  const handleDeleteBus = async (busId) => {
    if (window.confirm('Are you sure you want to remove this bus from your fleet?')) {
      try {
        await api.delete(`/buses/${busId}`);
        setBuses(prev => prev.filter(b => b._id !== busId));
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete bus.');
      }
    }
  };

  const toggleAmenity = (amenity) => {
    setBusForm(prev => {
      const list = prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities: list };
    });
  };

  // Trip Scheduling Logic
  const openTripModal = (trip = null) => {
    setTripError('');
    if (trip) {
      setEditingTrip(trip);
      const formattedDate = trip.date ? new Date(trip.date).toISOString().split('T')[0] : '';
      setTripForm({
        busId: trip.bus?._id || trip.bus || '',
        routeFrom: trip.route?.from || 'Colombo',
        routeTo: trip.route?.to || 'Kandy',
        date: formattedDate,
        departureTime: trip.departureTime || '',
        arrivalTime: trip.arrivalTime || '',
        fare: trip.fare || '',
        boardingPoints: trip.boardingPoints || [],
        droppingPoints: trip.droppingPoints || []
      });
    } else {
      setEditingTrip(null);
      setTripForm({
        busId: buses[0]?._id || '',
        routeFrom: 'Colombo',
        routeTo: 'Kandy',
        date: '',
        departureTime: '',
        arrivalTime: '',
        fare: '',
        boardingPoints: [],
        droppingPoints: []
      });
    }
    setShowTripModal(true);
  };

  const addBoardingPoint = () => {
    if (!boardingInput.location.trim() || !boardingInput.time.trim()) return;
    setTripForm(prev => ({
      ...prev,
      boardingPoints: [...prev.boardingPoints, boardingInput]
    }));
    setBoardingInput({ location: '', time: '' });
  };

  const addDroppingPoint = () => {
    if (!droppingInput.location.trim() || !droppingInput.time.trim()) return;
    setTripForm(prev => ({
      ...prev,
      droppingPoints: [...prev.droppingPoints, droppingInput]
    }));
    setDroppingInput({ location: '', time: '' });
  };

  const removeBoardingPoint = (index) => {
    setTripForm(prev => ({
      ...prev,
      boardingPoints: prev.boardingPoints.filter((_, idx) => idx !== index)
    }));
  };

  const removeDroppingPoint = (index) => {
    setTripForm(prev => ({
      ...prev,
      droppingPoints: prev.droppingPoints.filter((_, idx) => idx !== index)
    }));
  };

  const handleTripSubmit = async (e) => {
    e.preventDefault();
    setTripError('');

    let { busId, routeFrom, routeTo, date, departureTime, arrivalTime, fare } = tripForm;
    
    if (!busId && buses.length > 0) {
      busId = buses[0]._id;
    }

    const missing = [];
    if (!busId) missing.push('Select Vehicle (Please refresh page)');
    if (!routeFrom?.trim()) missing.push('Route From');
    if (!routeTo?.trim()) missing.push('Route To');
    if (!date) missing.push('Date');
    if (!departureTime?.trim()) missing.push('Departure Time');
    if (!arrivalTime?.trim()) missing.push('Arrival Time');
    if (!fare) missing.push('Fare');

    if (missing.length > 0) {
      setTripError(`Please fill in all core trip details. Missing: ${missing.join(', ')}`);
      return;
    }

    try {
      const payload = {
        busId,
        route: { from: routeFrom, to: routeTo },
        date,
        departureTime,
        arrivalTime,
        fare: parseFloat(fare),
        boardingPoints: [{ location: routeFrom, time: departureTime }],
        droppingPoints: [{ location: routeTo, time: arrivalTime }]
      };

      if (editingTrip) {
        const { data } = await api.put(`/trips/${editingTrip._id}`, payload);
        setTrips(prev => prev.map(t => t._id === editingTrip._id ? data : t));
      } else {
        const { data } = await api.post('/trips', payload);
        setTrips(prev => [...prev, data]);
      }
      setShowTripModal(false);
      setEditingTrip(null);
    } catch (error) {
      setTripError(error.response?.data?.message || 'Failed to save trip details.');
    }
  };

  const handleCancelTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to cancel this trip? Passengers will need notifications.')) {
      try {
        const { data } = await api.put(`/trips/${tripId}/cancel`);
        setTrips(prev => prev.map(t => t._id === tripId ? data : t));
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel trip.');
      }
    }
  };

  // Driver Management Logic
  const openDriverModal = (driver = null) => {
    setDriverError('');
    if (driver) {
      setEditingDriver(driver);
      setDriverForm({
        name: driver.name,
        licenseNumber: driver.licenseNumber,
        phone: driver.phone,
        status: driver.status || 'Active',
        assignedBus: driver.assignedBus?._id || driver.assignedBus || ''
      });
    } else {
      setEditingDriver(null);
      setDriverForm({
        name: '',
        licenseNumber: '',
        phone: '',
        status: 'Active',
        assignedBus: ''
      });
    }
    setShowDriverModal(true);
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    setDriverError('');

    if (!driverForm.name.trim() || !driverForm.licenseNumber.trim() || !driverForm.phone.trim()) {
      setDriverError('Name, license, and phone are required.');
      return;
    }

    try {
      const payload = { ...driverForm };
      if (!payload.assignedBus) delete payload.assignedBus;

      if (editingDriver) {
        const { data } = await api.put(`/drivers/${editingDriver._id}`, payload);
        setDrivers(prev => prev.map(d => d._id === editingDriver._id ? data : d));
      } else {
        const { data } = await api.post('/drivers', payload);
        setDrivers(prev => [...prev, data]);
      }
      setShowDriverModal(false);
    } catch (error) {
      setDriverError(error.response?.data?.message || 'Failed to save driver details.');
    }
  };

  const handleDeleteDriver = async (driverId) => {
    if (window.confirm('Are you sure you want to remove this driver?')) {
      try {
        await api.delete(`/drivers/${driverId}`);
        setDrivers(prev => prev.filter(d => d._id !== driverId));
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete driver.');
      }
    }
  };

  // Operator Profile Update Submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });

    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      setProfileMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    try {
      setProfileLoading(true);
      const updatePayload = {
        companyName: profileForm.companyName,
        contactNumber: profileForm.contactNumber
      };
      if (profileForm.password) {
        updatePayload.password = profileForm.password;
      }

      const { data } = await api.put('/auth/operator/profile', updatePayload);
      updateUser(data);
      setProfileForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setProfileMessage({ type: 'success', text: 'Operator profile updated successfully!' });
    } catch (error) {
      setProfileMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update operator profile.'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Get manifest passengers for selected trip
  const getManifestData = () => {
    if (!selectedTripId) return [];
    
    const manifestBookings = bookings.filter(b => b.trip?._id === selectedTripId && b.bookingStatus === 'Confirmed');
    const list = [];
    manifestBookings.forEach(booking => {
      booking.passengers.forEach(p => {
        list.push({
          name: p.name,
          age: p.age,
          gender: p.gender,
          seatNumber: p.seatNumber,
          contactName: booking.user?.name || 'Guest',
          contactPhone: booking.user?.phone || 'N/A',
          bookingId: booking._id
        });
      });
    });

    return list.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true }));
  };

  const handlePrintManifest = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090B] py-8 print:bg-white print:py-0 transition-colors duration-300">
      
      {/* Manifest printer styles override */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-manifest, #printable-manifest * {
            visibility: visible !important;
          }
          #printable-manifest {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10px !important;
            background: white !important;
            color: black !important;
          }
        }
      `}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 print:hidden">
        <div className="flex justify-between items-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-heading font-extrabold text-gray-900 dark:text-white drop-shadow-sm">Operator Control Center</h1>
          <div className="flex gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Manage fleet, route scheduling, real-time analytics, and manifest records.</p>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Menu */}
          <div className="w-full lg:w-64 bg-white dark:bg-[#0E0E12] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden shrink-0 h-max animate-fade-in-up transition-colors duration-300">
            <div className="p-8 bg-gradient-to-br from-gray-900 to-slate-800 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner border border-white/20">
                  <ShieldAlert className="w-8 h-8 text-secondary" />
                </div>
                <h2 className="font-heading font-bold text-lg drop-shadow-sm truncate">{user?.companyName || user?.name || 'Operator'}</h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Control Center</p>
              </div>
            </div>
            <div className="py-2">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-all ${activeTab === 'overview' ? 'bg-slate-50 dark:bg-white/5 text-gray-900 dark:text-white border-r-4 border-gray-900 dark:border-white font-bold shadow-inner' : 'text-gray-500 hover:bg-gray-50 hover:dark:bg-white/5 dark:text-gray-400 font-medium'}`}
              >
                <LayoutDashboard className="w-5 h-5" /> Analytics Overview
              </button>
              <button 
                onClick={() => setActiveTab('buses')}
                className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-all ${activeTab === 'buses' ? 'bg-slate-50 dark:bg-white/5 text-gray-900 dark:text-white border-r-4 border-gray-900 dark:border-white font-bold shadow-inner' : 'text-gray-500 hover:bg-gray-50 hover:dark:bg-white/5 dark:text-gray-400 font-medium'}`}
              >
                <Bus className="w-5 h-5" /> Bus Management
              </button>
              <button 
                onClick={() => setActiveTab('trips')}
                className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-all ${activeTab === 'trips' ? 'bg-slate-50 dark:bg-white/5 text-gray-900 dark:text-white border-r-4 border-gray-900 dark:border-white font-bold shadow-inner' : 'text-gray-500 hover:bg-gray-50 hover:dark:bg-white/5 dark:text-gray-400 font-medium'}`}
              >
                <CalendarClock className="w-5 h-5" /> Trip Scheduler
              </button>
              <button 
                onClick={() => setActiveTab('drivers')}
                className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-all ${activeTab === 'drivers' ? 'bg-slate-50 dark:bg-white/5 text-gray-900 dark:text-white border-r-4 border-gray-900 dark:border-white font-bold shadow-inner' : 'text-gray-500 hover:bg-gray-50 hover:dark:bg-white/5 dark:text-gray-400 font-medium'}`}
              >
                <Users className="w-5 h-5" /> Driver Management
              </button>
              <button 
                onClick={() => setActiveTab('telemetry')}
                className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-all ${activeTab === 'telemetry' ? 'bg-slate-50 dark:bg-white/5 text-gray-900 dark:text-white border-r-4 border-gray-900 dark:border-white font-bold shadow-inner' : 'text-gray-500 hover:bg-gray-50 hover:dark:bg-white/5 dark:text-gray-400 font-medium'}`}
              >
                <Satellite className="w-5 h-5 text-emerald-500 animate-pulse-soft" /> GPS Broadcast
              </button>
              <button 
                onClick={() => setActiveTab('reports')}
                className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-all ${activeTab === 'reports' ? 'bg-slate-50 dark:bg-white/5 text-gray-900 dark:text-white border-r-4 border-gray-900 dark:border-white font-bold shadow-inner' : 'text-gray-500 hover:bg-gray-50 hover:dark:bg-white/5 dark:text-gray-400 font-medium'}`}
              >
                <FileText className="w-5 h-5" /> Passenger Manifests
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-all ${activeTab === 'profile' ? 'bg-slate-50 dark:bg-white/5 text-gray-900 dark:text-white border-r-4 border-gray-900 dark:border-white font-bold shadow-inner' : 'text-gray-500 hover:bg-gray-50 hover:dark:bg-white/5 dark:text-gray-400 font-medium'}`}
              >
                <Settings className="w-5 h-5" /> Fleet Settings
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white dark:bg-[#0E0E12] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 p-8 min-h-[500px] animate-fade-in-up animation-delay-200 transition-colors duration-300">
{loading ? (
              <div className="flex flex-col justify-center items-center h-80 gap-3 text-gray-400">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <span className="font-semibold text-sm">Loading operator panel data...</span>
              </div>
            ) : (
              <>
                
                {/* 1. ANALYTICS OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Analytics Overview</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Real-time indicators across scheduled operations.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-blue-50/50 dark:bg-blue-950/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <p className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">Total Revenue</p>
                        <p className="text-3xl font-extrabold text-blue-900 dark:text-blue-200">LKR {totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="bg-green-50/50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-green-100 dark:border-emerald-900/30">
                        <p className="text-green-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">Scheduled Trips</p>
                        <p className="text-3xl font-extrabold text-green-900 dark:text-emerald-200">{activeTripsCount}</p>
                      </div>
                      <div className="bg-purple-50/50 dark:bg-indigo-950/20 p-6 rounded-2xl border border-purple-100 dark:border-indigo-900/30">
                        <p className="text-purple-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">Total Passenger Bookings</p>
                        <p className="text-3xl font-extrabold text-purple-900 dark:text-indigo-200">{totalBookingsCount}</p>
                      </div>
                    </div>

                    {/* SVG Interactive Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                      
                      {/* Area Chart: Monthly Revenue */}
                      <div className="border border-gray-100 dark:border-white/5 rounded-3xl p-6 relative bg-white dark:bg-[#121217] shadow-sm transition-colors duration-300">
                        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-6">Monthly Revenue Stream</h3>
                        
                        <div className="h-64 mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={getMonthlyRevenueData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={isDark ? "#f59e0b" : "#3b82f6"} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={isDark ? "#f59e0b" : "#3b82f6"} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f1f5f9"} />
                              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#94a3b8", fontWeight: 600 }} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#94a3b8", fontWeight: 600 }} tickFormatter={(val) => `LKR ${val/1000}k`} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: isDark ? '#1e293b' : '#ffffff', 
                                  border: isDark ? '1px solid rgba(255,255,255,0.05)' : 'none', 
                                  color: isDark ? '#ffffff' : '#1e293b',
                                  borderRadius: '12px', 
                                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', 
                                  fontWeight: 'bold' 
                                }} 
                                formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Revenue']} 
                              />
                              <Area type="monotone" dataKey="value" stroke={isDark ? "#fbbf24" : "#2563eb"} strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Bar Chart: Bookings count per bus */}
                      <div className="border border-gray-100 dark:border-white/5 rounded-3xl p-6 relative bg-white dark:bg-[#121217] shadow-sm transition-colors duration-300">
                        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-6">Ticket Reservations Per Vehicle</h3>

                        {buses.length === 0 ? (
                          <div className="h-44 flex items-center justify-center text-xs text-gray-400 font-medium">Add buses to display metrics.</div>
                        ) : (
                          <div className="h-64 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={getBookingsPerBusData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f1f5f9"} />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#94a3b8", fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#94a3b8", fontWeight: 600 }} allowDecimals={false} />
                                <Tooltip 
                                  cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc' }} 
                                  contentStyle={{ 
                                    backgroundColor: isDark ? '#1e293b' : '#ffffff', 
                                    border: isDark ? '1px solid rgba(255,255,255,0.05)' : 'none', 
                                    color: isDark ? '#ffffff' : '#1e293b',
                                    borderRadius: '12px', 
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', 
                                    fontWeight: 'bold' 
                                  }} 
                                />
                                <Bar dataKey="value" name="Bookings" fill={isDark ? "#f59e0b" : "#facc15"} radius={[6, 6, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. BUS MANAGEMENT */}
                {activeTab === 'add-bus' && (
                  <AddBus onComplete={() => setActiveTab('buses')} />
                )}

                {activeTab === 'buses' && (
                  <div>
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Bus Management</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Manage operator registration profiles for the fleet.</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('add-bus')}
                        className="bg-primary text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm hover:bg-primary-hover shadow-md shadow-blue-100 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add New Bus
                      </button>
                    </div>
                    
                    {buses.length === 0 ? (
                      <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-dashed">
                        <Bus className="w-16 h-16 mx-auto text-gray-300 mb-4 animate-pulse" />
                        <p className="font-bold text-lg">No buses in fleet</p>
                        <p className="text-sm text-gray-400 mt-1">Register your first bus to schedule travels.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b">
                              <th className="p-4 rounded-tl-xl rounded-bl-xl">Vehicle details</th>
                              <th className="p-4">Type</th>
                              <th className="p-4">Total Seats</th>
                              <th className="p-4">Seat Layout</th>
                              <th className="p-4">Amenities & Features</th>
                              <th className="p-4 rounded-tr-xl rounded-br-xl text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {buses.map((bus, idx) => (
                              <tr key={bus._id} className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors animate-fade-in-up animation-delay-${(idx % 5) * 100}`}>
                                <td className="p-4 flex items-center gap-4">
                                  {bus.image ? (
                                    <img src={bus.image} alt={bus.registrationNumber} className="w-16 h-11 object-cover rounded-xl border border-gray-200 shrink-0 shadow-sm hover:scale-110 transition-transform" />
                                  ) : (
                                    <div className="w-16 h-11 bg-gray-100 rounded-xl flex items-center justify-center border text-gray-400 shrink-0"><Bus className="w-5 h-5" /></div>
                                  )}
                                  <div>
                                    <p className="font-extrabold text-gray-900 uppercase tracking-tight">{bus.registrationNumber}</p>
                                    <p className="text-xs text-gray-500 font-bold">{bus.brand || 'Standard Coach'}</p>
                                    {bus.description && <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 max-w-xs">{bus.description}</p>}
                                  </div>
                                </td>

                                <td className="p-4">
                                  <span className="bg-blue-50 text-primary border border-blue-100 px-2.5 py-1 rounded-full text-xs font-bold">{bus.type}</span>
                                </td>
                                <td className="p-4 font-semibold">{bus.totalSeats} seats</td>
                                <td className="p-4 text-gray-500 font-mono">{bus.seatLayout}</td>
                                <td className="p-4">
                                  <div className="flex flex-wrap gap-1.5 max-w-xs">
                                    {bus.amenities?.map((a, idx) => (
                                      <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-semibold">{a}</span>
                                    ))}
                                    {(!bus.amenities || bus.amenities.length === 0) && <span className="text-gray-400 text-xs italic">None</span>}
                                  </div>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex gap-2 justify-end">
                                    <button 
                                      onClick={() => openBusModal(bus)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                                      title="Edit Bus"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteBus(bus._id)}
                                      className="p-2 text-red-650 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                      title="Delete Bus"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. TRIP SCHEDULER */}
                {activeTab === 'trips' && (
                  <div>
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Trip Scheduler</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Define routes, schedules, and fare matrix details.</p>
                      </div>
                      <button 
                        onClick={() => openTripModal()}
                        disabled={buses.length === 0}
                        className={`px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-md transition-all cursor-pointer ${
                          buses.length > 0 
                          ? 'bg-primary text-white hover:bg-primary-hover shadow-blue-100' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                        }`}
                      >
                        <Plus className="w-4 h-4" /> Schedule Trip
                      </button>
                    </div>

                    {buses.length === 0 && (
                      <div className="bg-amber-50 text-amber-800 p-4 rounded-2xl flex items-start gap-3 border border-amber-100 mb-6 text-sm font-medium">
                        <Info className="w-5 h-5 mt-0.5 text-amber-600 shrink-0" />
                        <div>
                          <p className="font-bold">Fleet required</p>
                          <p className="text-xs text-amber-600 mt-0.5">You must add at least one bus in "Bus Management" before scheduling trips.</p>
                        </div>
                      </div>
                    )}

                    {trips.length === 0 ? (
                      <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-dashed">
                        <CalendarClock className="w-16 h-16 mx-auto text-gray-300 mb-4 animate-pulse" />
                        <p className="font-bold text-lg">No trips scheduled</p>
                        <p className="text-sm text-gray-400 mt-1">Schedule your fleet to launch search bookings.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b">
                              <th className="p-4 rounded-tl-xl rounded-bl-xl">Route</th>
                              <th className="p-4">Bus (Reg No)</th>
                              <th className="p-4">Date</th>
                              <th className="p-4">Times</th>
                              <th className="p-4">Fare</th>
                              <th className="p-4">Bookings</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 rounded-tr-xl rounded-br-xl text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {trips.map(trip => (
                              <tr key={trip._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                <td className="p-4">
                                  <p className="font-bold text-gray-800">{trip.route?.from} &rarr; {trip.route?.to}</p>
                                </td>
                                <td className="p-4 uppercase font-semibold text-gray-500 dark:text-gray-400">{trip.bus?.registrationNumber || 'Deleted Bus'}</td>
                                <td className="p-4 font-semibold text-gray-500 dark:text-gray-400">{new Date(trip.date).toLocaleDateString()}</td>
                                <td className="p-4 text-xs font-medium text-gray-500">
                                  <div>Dep: <span className="font-bold text-gray-700">{trip.departureTime}</span></div>
                                  <div>Arr: <span>{trip.arrivalTime}</span></div>
                                </td>
                                <td className="p-4 font-extrabold text-primary">LKR {trip.fare}</td>
                                <td className="p-4">
                                  <span className="font-semibold text-gray-800">{trip.bookedSeats?.length || 0}</span>
                                  <span className="text-gray-400 text-xs">/{trip.bus?.totalSeats || 40} seats</span>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                    trip.status === 'Scheduled' ? 'bg-green-50 text-green-700 border-green-100' :
                                    trip.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                    'bg-gray-50 text-gray-500 border-gray-100'
                                  }`}>
                                    {trip.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  {trip.status === 'Scheduled' && (
                                    <div className="flex items-center justify-end gap-2">
                                      <button 
                                        onClick={() => setTrackingTrip(trip)}
                                        className="text-xs flex items-center gap-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer shadow-sm animate-pulse-soft"
                                      >
                                        <Satellite className="w-3 h-3" /> Broadcast GPS
                                      </button>
                                      <button 
                                        onClick={() => openTripModal(trip)}
                                        className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-all cursor-pointer"
                                        title="Edit Trip Details"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => handleCancelTrip(trip._id)}
                                        className="text-xs text-red-500 hover:text-red-700 font-bold hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                        title="Cancel Journey"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 3.5 DRIVER MANAGEMENT */}
                {activeTab === 'drivers' && (
                  <div>
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Driver Management</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Manage your driver personnel and assign them to vehicles.</p>
                      </div>
                      <button 
                        onClick={() => openDriverModal()}
                        className="bg-primary text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm hover:bg-primary-hover shadow-md shadow-blue-100 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Driver
                      </button>
                    </div>

                    {drivers.length === 0 ? (
                      <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-dashed">
                        <Users className="w-16 h-16 mx-auto text-gray-300 mb-4 animate-pulse" />
                        <p className="font-bold text-lg">No drivers registered</p>
                        <p className="text-sm text-gray-400 mt-1">Register drivers to assign them to your fleet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b">
                              <th className="p-4 rounded-tl-xl rounded-bl-xl">Driver Name</th>
                              <th className="p-4">License / Phone</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Assigned Bus</th>
                              <th className="p-4 rounded-tr-xl rounded-br-xl text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {drivers.map((driver) => (
                              <tr key={driver._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                <td className="p-4 font-bold text-gray-800">{driver.name}</td>
                                <td className="p-4">
                                  <div className="text-sm font-medium text-gray-800">{driver.licenseNumber}</div>
                                  <div className="text-xs text-gray-500">{driver.phone}</div>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                    driver.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
                                    driver.status === 'On Leave' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                    'bg-red-50 text-red-700 border-red-100'
                                  }`}>
                                    {driver.status}
                                  </span>
                                </td>
                                <td className="p-4">
                                  {driver.assignedBus ? (
                                    <span className="bg-blue-50 text-primary border border-blue-100 px-2 py-1 rounded-md text-xs font-bold">
                                      {driver.assignedBus.registrationNumber}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-xs italic">Unassigned</span>
                                  )}
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex gap-2 justify-end">
                                    <button 
                                      onClick={() => openDriverModal(driver)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteDriver(driver._id)}
                                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. PASSENGER MANIFESTS */}
                {activeTab === 'reports' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Passenger Manifest</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Select a journey schedule to compile passenger onboarding lists.</p>
                      </div>
                      
                      {trips.length > 0 && (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <select 
                            className="border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:bg-white text-sm font-semibold flex-grow sm:flex-grow-0 min-w-[200px]"
                            value={selectedTripId}
                            onChange={(e) => setSelectedTripId(e.target.value)}
                          >
                            {trips.map(trip => (
                              <option key={trip._id} value={trip._id}>
                                {trip.route?.from} &rarr; {trip.route?.to} ({new Date(trip.date).toLocaleDateString()}) - {trip.departureTime}
                              </option>
                            ))}
                          </select>
                          
                          <button 
                            onClick={handlePrintManifest}
                            disabled={getManifestData().length === 0}
                            className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary-hover shadow shadow-blue-100 disabled:opacity-50 transition-all cursor-pointer"
                            title="Print Manifest"
                          >
                            <Printer className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {trips.length === 0 ? (
                      <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-dashed">
                        <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="font-bold text-lg">No trips scheduled</p>
                        <p className="text-sm text-gray-400 mt-1">Passenger manifest outputs will render once trips are created.</p>
                      </div>
                    ) : getManifestData().length === 0 ? (
                      <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <User className="w-16 h-16 mx-auto text-gray-300 mb-4 animate-pulse" />
                        <p className="font-bold text-lg">No reserved seats</p>
                        <p className="text-sm text-gray-400 mt-1">There are no passenger bookings registered for the selected journey.</p>
                      </div>
                    ) : (
                      <div className="border border-gray-100 rounded-2xl p-6 bg-white relative">
                        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span>Passenger Boarding Sheet</span>
                          <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold">{getManifestData().length} Passengers</span>
                        </h3>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b">
                                <th className="p-3">Seat</th>
                                <th className="p-3">Passenger</th>
                                <th className="p-3">Age/Gender</th>
                                <th className="p-3">Primary Account User</th>
                                <th className="p-3">Contact</th>
                                <th className="p-3 rounded-tr-lg">Booking ID</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getManifestData().map((p, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                                  <td className="p-3 font-extrabold text-primary font-mono text-base">{p.seatNumber}</td>
                                  <td className="p-3 font-bold text-gray-800 dark:text-white">{p.name}</td>
                                  <td className="p-3 font-semibold text-gray-500 dark:text-gray-400">{p.age} / {p.gender}</td>
                                  <td className="p-3 text-gray-700 font-semibold">{p.contactName}</td>
                                  <td className="p-3 text-gray-500 font-medium">{p.contactPhone}</td>
                                  <td className="p-3 font-mono text-xs text-gray-400 uppercase">{p.bookingId.substring(0, 10)}...</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. PROFILE SETTINGS */}
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Operator Fleet Settings</h2>
                    
                    {profileMessage.text && (
                      <div className={`mb-6 p-4 rounded-xl flex items-center gap-2.5 text-sm border font-semibold ${
                        profileMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {profileMessage.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                        <span>{profileMessage.text}</span>
                      </div>
                    )}

                    <form onSubmit={handleProfileSubmit} className="max-w-lg space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Company Name</label>
                        <div className="relative">
                          <Bus className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                          <input 
                            type="text" 
                            required
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all"
                            value={profileForm.companyName}
                            onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Official Email Address</label>
                        <input 
                          type="email" 
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 text-sm font-medium cursor-not-allowed" 
                          defaultValue={user?.email} 
                          disabled 
                        />
                        <p className="text-xs text-gray-400 mt-1">Official corporate email cannot be edited.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Contact Helpline</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. 0112345678"
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all"
                            value={profileForm.contactNumber}
                            onChange={(e) => setProfileForm({ ...profileForm, contactNumber: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="border-t pt-5">
                        <h3 className="text-base font-bold text-gray-700 mb-4">Update Security Password</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <input 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all"
                                value={profileForm.password}
                                onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <input 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all"
                                value={profileForm.confirmPassword}
                                onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={profileLoading}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-hover transition-all cursor-pointer shadow-md shadow-blue-100 flex items-center gap-2 disabled:opacity-50"
                      >
                        {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Settings
                      </button>
                    </form>
                  </div>
                )}

                {/* 6. GPS TELEMETRY BROADCAST */}
                {activeTab === 'telemetry' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="border-b pb-4 flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">GPS Broadcast Control</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Stream live GPS signals or update coordinates manually for active scheduled trips.</p>
                      </div>
                    </div>

                     {trips.length === 0 ? (
                      <div className="text-center py-12 max-w-xl mx-auto bg-gray-50 rounded-3xl border border-dashed border-gray-200 p-8">
                        <Satellite className="w-16 h-16 mx-auto text-primary mb-4 animate-pulse-soft" />
                        <h3 className="font-heading font-extrabold text-xl text-gray-900 mb-2">Location Control Center</h3>
                        <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">
                          To stream live GPS coordinates or set manual locations for your fleet, you must first register a vehicle and schedule a passenger travel route.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          {buses.length === 0 ? (
                            <button
                              onClick={() => setActiveTab('add-bus')}
                              className="px-5 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl cursor-pointer shadow-md"
                            >
                              Step 1: Add a Bus to Fleet
                            </button>
                          ) : (
                            <button
                              onClick={() => setActiveTab('trips')}
                              className="px-5 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl cursor-pointer shadow-md"
                            >
                              Step 2: Schedule a Trip Route
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {trips.map(trip => (
                          <div key={trip._id} className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                                  {trip.bus?.registrationNumber || 'Bus'}
                                </span>
                                <h3 className="text-lg font-black text-gray-900 mt-1.5">{trip.route?.from} → {trip.route?.to}</h3>
                                <p className="text-xs text-gray-450 mt-0.5 font-medium">Date: {new Date(trip.date).toLocaleDateString()} | Time: {trip.departureTime}</p>
                              </div>
                              <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-black border ${
                                trip.currentLocation?.lat 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                                {trip.currentLocation?.lat ? 'Broadcasting' : 'Inactive'}
                              </span>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-5 flex flex-col gap-2">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Current Location Status</p>
                              {trip.currentLocation?.lat ? (
                                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-700">
                                  <p>Latitude: <span className="text-gray-900 font-bold">{trip.currentLocation.lat.toFixed(4)}</span></p>
                                  <p>Longitude: <span className="text-gray-900 font-bold">{trip.currentLocation.lng.toFixed(4)}</span></p>
                                  <p>Speed: <span className="text-emerald-600 font-black">{trip.currentLocation.speed || 0} km/h</span></p>
                                  <p>Updated: <span className="text-gray-500 font-normal">{new Date(trip.currentLocation.lastUpdated).toLocaleTimeString()}</span></p>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-450 italic text-center py-2">No coordinates set. Map location is default.</p>
                              )}
                            </div>

                            <button
                              onClick={() => setTrackingTrip(trip)}
                              className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
                            >
                              <Satellite className="w-4 h-4 text-secondary animate-pulse-soft" />
                              Start Broadcast / Update Location
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </>
            )}
          </div>
        </div>
      </div>

      {/* PRINT-ONLY PASSENGER MANIFEST LAYOUT */}
      {trips.length > 0 && selectedTripId && (
        <div id="printable-manifest" className="hidden print:block text-black bg-white w-full p-8 font-sans">
          {(() => {
            const activeTrip = trips.find(t => t._id === selectedTripId);
            return (
              <div>
                <div className="border-b border-gray-300 pb-5 mb-6 flex justify-between items-end">
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">PASSENGER MANIFEST SHEET</h1>
                    <p className="text-xs text-gray-500 font-bold mt-1 uppercase">Trip Schedule: {activeTrip?.route?.from} &rarr; {activeTrip?.route?.to}</p>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">Operator: {user?.companyName || 'Corporate Operator'}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-bold text-gray-400">Date: {activeTrip ? new Date(activeTrip.date).toLocaleDateString() : 'N/A'}</p>
                    <p className="font-bold text-gray-500 mt-1">Departure: {activeTrip?.departureTime}</p>
                    <p className="font-bold text-gray-400 mt-0.5">Bus No: {activeTrip?.bus?.registrationNumber?.toUpperCase()}</p>
                  </div>
                </div>

                {getManifestData().length === 0 ? (
                  <div className="text-center py-12 text-sm text-gray-400 font-bold">No registered passenger bookings on this scheduled journey.</div>
                ) : (
                  <div>
                    <table className="w-full text-left text-xs border border-gray-200 border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                          <th className="p-2.5 border-r">Seat</th>
                          <th className="p-2.5 border-r">Passenger Name</th>
                          <th className="p-2.5 border-r">Age/Gender</th>
                          <th className="p-2.5 border-r">Primary Contact</th>
                          <th className="p-2.5 border-r">Phone</th>
                          <th className="p-2.5">Booking ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getManifestData().map((p, idx) => (
                          <tr key={idx} className="border-b border-gray-200">
                            <td className="p-2.5 border-r font-extrabold text-sm text-center">{p.seatNumber}</td>
                            <td className="p-2.5 border-r font-bold">{p.name}</td>
                            <td className="p-2.5 border-r">{p.age} / {p.gender}</td>
                            <td className="p-2.5 border-r">{p.contactName}</td>
                            <td className="p-2.5 border-r">{p.contactPhone}</td>
                            <td className="p-2.5 font-mono text-[10px] uppercase">{p.bookingId}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <div className="mt-12 flex justify-between items-center text-xs pt-8 border-t border-dashed">
                      <div>
                        <p className="border-t border-gray-300 w-48 text-center pt-2 font-bold">Driver Signature</p>
                      </div>
                      <div>
                        <p className="border-t border-gray-300 w-48 text-center pt-2 font-bold">Station Master Signature</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* BUS MANAGEMENT MODAL (ADD / EDIT) */}
      {showBusModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full p-6 relative overflow-hidden my-8">
            <button 
              onClick={() => setShowBusModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-extrabold text-gray-800 mb-2">{editingBus ? 'Edit Bus Details' : 'Add New Bus to Fleet'}</h3>
            <p className="text-xs text-gray-400 mb-6">Enter vehicle credentials, layout styles, and convenience checklist details.</p>

            {busError && (
              <div className="mb-4 bg-red-50 text-red-750 p-3 rounded-xl flex items-center gap-2 text-sm border border-red-100 font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{busError}</span>
              </div>
            )}

            <form onSubmit={handleBusSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Registration Number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. WP ND-4567"
                    className="w-full border border-gray-250 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase font-bold text-gray-800 dark:text-white bg-white dark:bg-slate-900"
                    value={busForm.registrationNumber}
                    onChange={(e) => setBusForm({ ...busForm, registrationNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Vehicle Brand / Model</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Volvo B11R"
                    className="w-full border border-gray-250 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-800 dark:text-white bg-white dark:bg-slate-900"
                    value={busForm.brand}
                    onChange={(e) => setBusForm({ ...busForm, brand: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Bus Type</label>
                  <select 
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-700 bg-white"
                    value={busForm.type}
                    onChange={(e) => setBusForm({ ...busForm, type: e.target.value })}
                  >
                    <option value="AC Luxury">AC Luxury</option>
                    <option value="Non-AC">Non-AC</option>
                    <option value="Sleeper">Sleeper</option>
                    <option value="Semi-Sleeper">Semi-Sleeper</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Seat Layout</label>
                  <select 
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-700 bg-white"
                    value={busForm.seatLayout}
                    onChange={(e) => setBusForm({ ...busForm, seatLayout: e.target.value })}
                  >
                    <option value="2x2">Standard (2x2)</option>
                    <option value="3x2">High Capacity (3x2)</option>
                    <option value="2x1">Comfort (2x1)</option>
                    <option value="1x1">Premium Sleeper (1x1)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Total Passenger Seats</label>
                  <input 
                    type="number" 
                    required
                    min="10"
                    max="60"
                    placeholder="e.g. 40"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
                    value={busForm.totalSeats}
                    onChange={(e) => setBusForm({ ...busForm, totalSeats: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Bus Image Source</label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setImageSourceTab('upload')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        imageSourceTab === 'upload' 
                          ? 'bg-primary text-white border-primary shadow-xs' 
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceTab('url')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        imageSourceTab === 'url' 
                          ? 'bg-primary text-white border-primary shadow-xs' 
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>

                  {imageSourceTab === 'upload' ? (
                    <div className="relative border border-dashed border-gray-200 rounded-xl p-2.5 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group min-h-[50px]">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        {busForm.image && busForm.image.startsWith('data:') ? (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                            <img src={busForm.image} alt="Upload preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0 text-gray-400 group-hover:bg-gray-300 transition-colors">
                            <Upload className="w-5 h-5" />
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-xs font-bold text-gray-700">Choose local image</p>
                          <p className="text-[10px] text-gray-400">PNG, JPG or WebP (auto-resized)</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="https://..."
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-800"
                        value={busForm.image}
                        onChange={(e) => setBusForm({ ...busForm, image: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Template Image Picker Presets */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Or Choose from Image Presets</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {BUS_IMAGE_PRESETS.map((preset, idx) => {
                    const isSelected = busForm.image === preset.url;
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setBusForm({ ...busForm, image: preset.url })}
                        className={`group rounded-xl overflow-hidden border-2 relative h-16 transition-all ${
                          isSelected ? 'border-primary shadow' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center p-1 text-[9px] text-white text-center font-bold">
                          {isSelected ? <Check className="w-5 h-5 text-secondary stroke-[3]" /> : preset.name.split(' ')[0]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>


              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Vehicle Description</label>
                <textarea 
                  rows="2"
                  placeholder="e.g. Equipped with soft reclining leather seats, individual reading lights, climate control, and soft neck pillows."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-800"
                  value={busForm.description}
                  onChange={(e) => setBusForm({ ...busForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amenities Checklist</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['WiFi', 'Charging Point', 'Water Bottle', 'Pillow', 'Blanket', 'Reading Light'].map(amenity => {
                    const checked = busForm.amenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                          checked 
                          ? 'bg-secondary/15 text-dark border-secondary' 
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${checked ? 'bg-secondary border-secondary text-dark' : 'border-gray-300'}`}>
                          {checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t mt-6 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setShowBusModal(false)}
                  className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-bold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow hover:bg-primary-hover cursor-pointer"
                >
                  Save Bus Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRIVER MODAL */}
      {showDriverModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full p-6 relative overflow-hidden my-8">
            <button 
              onClick={() => setShowDriverModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-extrabold text-gray-800 mb-2">{editingDriver ? 'Edit Driver' : 'Add New Driver'}</h3>
            <p className="text-xs text-gray-400 mb-6">Manage personnel details and vehicle assignments.</p>

            {driverError && (
              <div className="mb-4 bg-red-50 text-red-750 p-3 rounded-xl flex items-center gap-2 text-sm border border-red-100 font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{driverError}</span>
              </div>
            )}

            <form onSubmit={handleDriverSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Driver Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Nimal Perera"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-800"
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">License Number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. B1234567"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-800 uppercase"
                    value={driverForm.licenseNumber}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Contact Phone</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 0771234567"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-800"
                    value={driverForm.phone}
                    onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Employment Status</label>
                  <select 
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-700 bg-white"
                    value={driverForm.status}
                    onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Assign to Bus</label>
                  <select 
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-700 bg-white"
                    value={driverForm.assignedBus}
                    onChange={(e) => setDriverForm({ ...driverForm, assignedBus: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {buses.map(b => (
                      <option key={b._id} value={b._id}>{b.registrationNumber}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t mt-6 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setShowDriverModal(false)}
                  className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-bold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow hover:bg-primary-hover cursor-pointer"
                >
                  Save Driver Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRIP SCHEDULER MODAL */}
      {showTripModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-xl w-full p-6 relative overflow-hidden my-8">
            <button 
              onClick={() => setShowTripModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-extrabold text-gray-800 mb-2">{editingTrip ? 'Edit Travel Journey' : 'Schedule Travel Journey'}</h3>
            <p className="text-xs text-gray-400 mb-6">{editingTrip ? 'Modify destination routes, schedule calendar parameters, and timings details.' : 'Select a bus, specify destination routes, schedule calendar parameters, and design stops details.'}</p>

            {tripError && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 text-sm border border-red-100 font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{tripError}</span>
              </div>
            )}

            <form onSubmit={handleTripSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Select Vehicle</label>
                <select 
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-gray-800 bg-white"
                  value={tripForm.busId}
                  onChange={(e) => setTripForm({ ...tripForm, busId: e.target.value })}
                >
                  {buses.map(bus => (
                    <option key={bus._id} value={bus._id}>
                      {bus.registrationNumber.toUpperCase()} ({bus.brand || bus.type} - {bus.totalSeats} Seats)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Route From (Origin)</label>
                  <select 
                    required
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-800 bg-white"
                    value={tripForm.routeFrom}
                    onChange={(e) => setTripForm({ ...tripForm, routeFrom: e.target.value })}
                  >
                    {ROUTE_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Route To (Destination)</label>
                  <select 
                    required
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-800 bg-white"
                    value={tripForm.routeTo}
                    onChange={(e) => setTripForm({ ...tripForm, routeTo: e.target.value })}
                  >
                    {ROUTE_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Journey Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
                    value={tripForm.date}
                    onChange={(e) => setTripForm({ ...tripForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Departure Time</label>
                  <input 
                    type="time" 
                    required
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
                    value={tripForm.departureTime}
                    onChange={(e) => setTripForm({ ...tripForm, departureTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Arrival Time</label>
                  <input 
                    type="time" 
                    required
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
                    value={tripForm.arrivalTime}
                    onChange={(e) => setTripForm({ ...tripForm, arrivalTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Fare Amount (LKR)</label>
                <input 
                  type="number" 
                  required
                  min="100"
                  placeholder="e.g. 2400"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-primary"
                  value={tripForm.fare}
                  onChange={(e) => setTripForm({ ...tripForm, fare: e.target.value })}
                />
              </div>



              <div className="pt-4 border-t mt-6 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setShowTripModal(false)}
                  className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-bold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow hover:bg-primary-hover cursor-pointer"
                >
                  {editingTrip ? 'Save Trip Details' : 'Schedule Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* DRIVER GPS TRACKING TERMINAL */}
      {trackingTrip && (
        <DriverTracking 
          trip={trackingTrip} 
          onClose={() => {
            setTrackingTrip(null);
            fetchDashboardData();
          }} 
        />
      )}

    </div>
  );
};

export default AdminDashboard;
