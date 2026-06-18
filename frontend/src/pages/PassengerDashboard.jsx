import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Ticket, User, Settings, Download, MapPin, Clock, Printer, X, CheckCircle, AlertCircle, Phone, Lock, Bus, Calendar, Navigation2, Mail } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import LiveTracking from '../components/LiveTracking';

const PassengerDashboard = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: ''
  });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // E-Ticket Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showTracking, setShowTracking] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/bookings/mybookings');
        setBookings(data);
      } catch (error) {
        console.error('Failed to fetch bookings', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });

    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      setProfileMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    try {
      setProfileLoading(true);
      const updateData = {
        name: profileForm.name,
        phone: profileForm.phone
      };
      if (profileForm.password) {
        updateData.password = profileForm.password;
      }

      const { data } = await api.put('/auth/profile', updateData);
      updateUser(data); 
      setProfileForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setProfileMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile.' 
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePrintTicket = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-ticket');
    if (!element) return;
    
    // Temporarily add a class to ensure standard styling for the PDF
    element.classList.add('pdf-mode');
    
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`BusSaaS-Ticket-${selectedBooking._id.slice(-6)}.pdf`);
    } catch (err) {
      console.error("Could not generate PDF", err);
    } finally {
      element.classList.remove('pdf-mode');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090B] py-12 print:bg-white print:py-0 transition-colors duration-300">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-ticket, #printable-ticket * {
            visibility: visible !important;
          }
          #printable-ticket {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
        }
      `}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 print:hidden">
        
        {/* Advanced Dashboard Layout */}
        <div className="flex justify-between items-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-heading font-extrabold text-gray-900 dark:text-white drop-shadow-sm">Passenger Portal</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Menu */}
          <div className="w-full lg:w-64 bg-white dark:bg-[#0E0E12] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden shrink-0 h-max animate-fade-in-up transition-colors duration-300">
            <div className="p-8 bg-gradient-to-br from-indigo-900 to-primary text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner border border-white/30">
                  <User className="w-10 h-10" />
                </div>
                <h2 className="font-heading font-bold text-xl drop-shadow-sm">{user?.name}</h2>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mt-1">Passenger</p>
              </div>
            </div>
            <div className="py-2">
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-all ${activeTab === 'bookings' ? 'bg-primary/10 dark:bg-white/5 text-primary dark:text-indigo-400 border-r-4 border-primary dark:border-indigo-400 font-bold shadow-inner' : 'text-gray-500 hover:bg-gray-50 hover:dark:bg-white/5 dark:text-gray-400 font-medium'}`}
              >
                <Ticket className="w-5 h-5" /> Digital Tickets
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-all ${activeTab === 'profile' ? 'bg-primary/10 dark:bg-white/5 text-primary dark:text-indigo-400 border-r-4 border-primary dark:border-indigo-400 font-bold shadow-inner' : 'text-gray-500 hover:bg-gray-50 hover:dark:bg-white/5 dark:text-gray-400 font-medium'}`}
              >
                <Settings className="w-5 h-5" /> Account Settings
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white dark:bg-[#0E0E12] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 p-8 min-h-[500px] animate-fade-in-up animation-delay-200 transition-colors duration-300">
            
            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-2xl font-heading font-bold mb-6 text-gray-800 dark:text-white border-b dark:border-white/5 pb-4">My Digital Tickets</h2>
                
                {loading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                    <Ticket className="w-16 h-16 mx-auto text-gray-300 mb-4 opacity-50" />
                    <p className="text-lg font-bold text-gray-500 dark:text-gray-400">You have no active bookings.</p>
                    <p className="text-sm mt-1">Book your first ride on the homepage!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {bookings.map((booking, idx) => (
                      <div key={booking._id} className={`flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-white/5 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up animation-delay-${(idx + 1) * 100}`}>
                        
                        {/* Ticket Left Side (Details) */}
                        <div className="flex-1 bg-white dark:bg-[#121217] p-6 relative transition-colors duration-300">
                          <div className="absolute top-0 right-0 p-4">
                            <span className="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                              {booking.bookingStatus}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-4 text-primary dark:text-indigo-450">
                            <Bus className="w-5 h-5" />
                            <span className="font-bold text-sm tracking-wide uppercase">{booking.trip?.bus?.operator?.companyName || 'Luxury Travels'}</span>
                          </div>

                          <div className="flex items-center justify-between mt-6">
                            <div className="text-center">
                              <p className="text-3xl font-heading font-black text-gray-900 dark:text-white">{booking.trip?.route?.from.substring(0, 3).toUpperCase()}</p>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{booking.trip?.route?.from}</p>
                            </div>
                            
                            <div className="flex-1 flex flex-col items-center px-4 relative">
                              <div className="w-full border-t-2 border-dashed border-gray-200 dark:border-white/10 absolute top-1/2 -translate-y-1/2"></div>
                              <Bus className="w-6 h-6 text-primary bg-white dark:bg-[#121217] px-1 relative z-10" />
                            </div>

                            <div className="text-center">
                              <p className="text-3xl font-heading font-black text-gray-900 dark:text-white">{booking.trip?.route?.to.substring(0, 3).toUpperCase()}</p>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{booking.trip?.route?.to}</p>
                            </div>
                          </div>

                          <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Date</p>
                              <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{new Date(booking.trip?.date).toDateString()}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Departure</p>
                              <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{booking.trip?.departureTime}</p>
                            </div>
                          </div>
                        </div>

                        {/* Ticket Right Side (Tear-off stub) */}
                        <div className="md:w-64 bg-gradient-to-br from-indigo-900 to-primary text-white p-6 relative flex flex-col justify-between border-l-2 border-dashed border-white/20">
                          {/* Cutout circles for realism */}
                          <div className="hidden md:block absolute -left-3 top-[-10px] w-6 h-6 bg-gray-50 dark:bg-[#0E0E12] rounded-full shadow-inner transition-colors duration-300"></div>
                          <div className="hidden md:block absolute -left-3 bottom-[-10px] w-6 h-6 bg-gray-50 dark:bg-[#0E0E12] rounded-full shadow-inner transition-colors duration-300"></div>

                          <div>
                            <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest mb-1">Seat Numbers</p>
                            <p className="text-3xl font-heading font-black drop-shadow-md">{booking.passengers.map(p => p.seatNumber).join(', ')}</p>
                          </div>
                          
                          <div className="mt-6">
                            <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest mb-1">Total Paid</p>
                            <p className="text-xl font-bold">LKR {booking.totalAmount}</p>
                          </div>

                          <button 
                            onClick={() => setSelectedBooking(booking)}
                            className="mt-8 w-full bg-white dark:bg-[#09090B] text-primary dark:text-white hover:bg-gray-100 hover:dark:bg-[#121217] py-3 rounded-xl text-sm font-bold shadow-lg dark:shadow-none border dark:border-white/5 transition-colors flex justify-center items-center gap-2"
                          >
                            <Printer className="w-4 h-4" /> View Ticket
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE SETTINGS TAB */}
            {activeTab === 'profile' && (
              <div className="animate-fade-in-up">
                <h2 className="text-2xl font-heading font-bold mb-6 text-gray-800 dark:text-white border-b dark:border-white/5 pb-4">Account Settings</h2>
                
                {profileMessage.text && (
                  <div className={`mb-6 p-4 rounded-xl flex items-center gap-2.5 text-sm border font-bold animate-scale-in ${
                    profileMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200 dark:border-green-900/30 dark:bg-green-950/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-red-50 text-red-700 border-red-200 dark:border-red-900/30 dark:bg-red-950/20'
                  }`}>
                    {profileMessage.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <span>{profileMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="max-w-lg space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text" 
                        required
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-[#121217] focus:bg-white focus:dark:bg-[#1A1A22] focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold dark:text-white transition-all shadow-sm"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <input 
                        type="email" 
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-white/10 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-sm font-semibold cursor-not-allowed shadow-inner" 
                        defaultValue={user?.email} 
                        disabled 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text" 
                        required
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-[#121217] focus:bg-white focus:dark:bg-[#1A1A22] focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold dark:text-white transition-all shadow-sm"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-white/5 mt-6">
                    <h3 className="text-lg font-heading font-bold mb-4 text-gray-800 dark:text-white">Security</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">New Password (Optional)</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                          <input 
                            type="password" 
                            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-[#121217] focus:bg-white focus:dark:bg-[#1A1A22] focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold dark:text-white transition-all shadow-sm"
                            placeholder="Leave blank to keep current"
                            value={profileForm.password}
                            onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      {profileForm.password && (
                        <div className="animate-fade-in-up">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input 
                              type="password" 
                              required
                              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-[#121217] focus:bg-white focus:dark:bg-[#1A1A22] focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold dark:text-white transition-all shadow-sm"
                              placeholder="Type password again"
                              value={profileForm.confirmPassword}
                              onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={profileLoading}
                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-bold py-4 rounded-2xl hover:bg-black hover:dark:bg-gray-150 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50 mt-4"
                  >
                    {profileLoading ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern E-Ticket Modal for Printing */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:block">
          
          <div id="printable-ticket" className="bg-white dark:bg-[#0E0E12] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 max-w-4xl w-full relative overflow-hidden animate-scale-in text-gray-800 dark:text-gray-105 flex flex-col md:flex-row transition-colors duration-300 print:text-black print:bg-white print:shadow-none print:border-none print:max-w-full">
            <button 
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 print:hidden z-20 bg-gray-100 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Section - Main Ticket */}
            <div className="flex-1 p-8 flex flex-col justify-between print:p-6">
              {/* Header */}
              <div className="flex items-center gap-3 pb-6 border-b border-gray-100 dark:border-white/5">
                <div className="bg-gradient-to-tr from-secondary to-amber-300 text-slate-900 p-2 rounded-xl shadow-[0_0_10px_rgba(250,204,21,0.3)]">
                  <Bus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black tracking-wide text-gray-900 dark:text-white text-lg">BusSaaS Premium</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Intercity Express Passage</p>
                </div>
              </div>

              {/* Route segment */}
              <div className="my-8 flex justify-between items-center bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/5 print:bg-white print:border-gray-200">
                <div className="text-left">
                  <p className="text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-widest mb-1">Origin City</p>
                  <p className="text-3xl font-heading font-black text-gray-900 dark:text-white">{selectedBooking.trip?.route?.from.substring(0, 3).toUpperCase()}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase mt-1">{selectedBooking.trip?.route?.from}</p>
                </div>
                
                <div className="flex-1 px-6 relative flex items-center justify-center">
                  <div className="absolute w-full border-t-2 border-dashed border-gray-300 dark:border-white/10"></div>
                  <Bus className="w-6 h-6 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-[#0E0E12] px-1 relative z-10 print:bg-white" />
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-455 dark:text-gray-400 uppercase tracking-widest mb-1">Destination</p>
                  <p className="text-3xl font-heading font-black text-gray-900 dark:text-white">{selectedBooking.trip?.route?.to.substring(0, 3).toUpperCase()}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase mt-1">{selectedBooking.trip?.route?.to}</p>
                </div>
              </div>

              {/* Secondary Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-455 dark:text-gray-400 uppercase tracking-widest mb-1">Departure Date</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{new Date(selectedBooking.trip?.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-455 dark:text-gray-400 uppercase tracking-widest mb-1">Scheduled Time</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{selectedBooking.trip?.departureTime}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-455 dark:text-gray-400 uppercase tracking-widest mb-1">Boarding Gate</p>
                  <p className="font-bold text-emerald-605 dark:text-emerald-450 text-sm">Gate {selectedBooking.trip?.route?.from.substring(0, 2).toUpperCase()}-1</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-455 dark:text-gray-400 uppercase tracking-widest mb-1">Boarding Time</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {(() => {
                      const depTime = selectedBooking.trip?.departureTime || "00:00";
                      const [hours, minutes] = depTime.split(":").map(Number);
                      if (isNaN(hours)) return depTime;
                      let bMin = minutes - 15;
                      let bHour = hours;
                      if (bMin < 0) {
                        bMin += 60;
                        bHour = (bHour - 1 + 24) % 24;
                      }
                      return `${String(bHour).padStart(2, '0')}:${String(bMin).padStart(2, '0')}`;
                    })()}
                  </p>
                </div>
              </div>

              {/* Station Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 text-xs print:bg-white print:border-gray-200">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Boarding Station Point</p>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{selectedBooking.boardingPoint?.location}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">Depart time: {selectedBooking.boardingPoint?.time}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Dropping Station Point</p>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{selectedBooking.droppingPoint?.location}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">Arrive time: {selectedBooking.droppingPoint?.time}</p>
                </div>
              </div>

              {/* QR and guidelines */}
              <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-6 mt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm inline-block print:border-gray-200">
                    <QRCodeCanvas 
                      value={`verify:${selectedBooking._id}|trip:${selectedBooking.trip?._id}`} 
                      size={72} 
                      bgColor={"#ffffff"}
                      fgColor={"#0f172a"}
                      level={"L"}
                      includeMargin={false}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Verifiable Boarding Pass</p>
                    <p className="text-[9px] text-gray-400 mt-1 max-w-[200px] leading-relaxed">Present this QR code to the conductor at the boarding platform to check-in.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Fare Tier</p>
                  <p className="text-lg font-black text-secondary uppercase tracking-tight">Luxury VIP</p>
                </div>
              </div>
            </div>

            {/* Dividing Line & Side Holes */}
            <div className="hidden md:flex flex-col items-center justify-between relative w-0.5 shrink-0 z-10 print:hidden">
              <div className="absolute top-0 -translate-y-1/2 -left-3 w-6 h-6 bg-[#09090B] dark:bg-[#09090B] rounded-full border border-gray-200 dark:border-white/10 border-t-0"></div>
              <div className="h-full border-l-2 border-dashed border-gray-300 dark:border-white/10"></div>
              <div className="absolute bottom-0 translate-y-1/2 -left-3 w-6 h-6 bg-[#09090B] dark:bg-[#09090B] rounded-full border border-gray-200 dark:border-white/10 border-b-0"></div>
            </div>

            {/* Right Section - Passenger Stub */}
            <div className="md:w-72 bg-gradient-to-br from-indigo-900/10 to-primary/5 dark:from-indigo-950/20 dark:to-primary/10 p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-150 dark:border-white/5 relative print:p-6 print:bg-white print:border-gray-300">
              <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&q=80')] bg-cover print:hidden"></div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest leading-none mb-1">Receipt Stub</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">#{selectedBooking._id.substring(0, 8).toUpperCase()}</p>
                  </div>
                  <span className="bg-emerald-105 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-sm">
                    {selectedBooking.bookingStatus}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Passenger Traveler</p>
                  <p className="font-extrabold text-gray-900 dark:text-white uppercase truncate text-sm leading-snug">{user?.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Seat Assignment</p>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none">{selectedBooking.passengers.map(p => p.seatNumber).join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Bus Class</p>
                    <p className="font-bold text-gray-900 dark:text-white text-xs">{selectedBooking.trip?.bus?.type || 'AC Luxury'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200/50 dark:border-white/5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Fare Paid</p>
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white">LKR {selectedBooking.totalAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="relative z-10 mt-8 md:mt-0 pt-6 border-t border-dashed border-gray-200 dark:border-white/10 flex flex-wrap gap-3 print:hidden">
                {selectedBooking.bookingStatus === 'Confirmed' && (
                  <button 
                    onClick={() => setShowTracking(true)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                  >
                    <Navigation2 className="w-3.5 h-3.5" /> Track Live
                  </button>
                )}
                <button 
                  onClick={handleDownloadPDF}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <button 
                  onClick={handlePrintTicket}
                  className="w-full bg-gray-900 hover:bg-black text-white dark:bg-white/10 dark:hover:bg-white/20 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Tracking Modal Overlay */}
      {showTracking && selectedBooking?.trip && (
        <LiveTracking 
          trip={selectedBooking.trip} 
          onClose={() => setShowTracking(false)} 
        />
      )}
    </div>
  );
};

export default PassengerDashboard;
