import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Armchair, CreditCard, Lock, CheckCircle, Loader2, X, AlertCircle } from 'lucide-react';

const SeatSelection = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  const [bookingData, setBookingData] = useState({
    boardingPoint: '',
    droppingPoint: ''
  });

  // Passenger details per seat
  const [passengerDetails, setPassengerDetails] = useState({});

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });
  const [paymentError, setPaymentError] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const { data } = await api.get(`/trips/${tripId}`);
        setTrip(data);
        if (data.boardingPoints?.length > 0) setBookingData(prev => ({...prev, boardingPoint: data.boardingPoints[0]._id}));
        if (data.droppingPoints?.length > 0) setBookingData(prev => ({...prev, droppingPoint: data.droppingPoints[data.droppingPoints.length-1]._id}));
      } catch (error) {
        console.error('Failed to fetch trip details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTripDetails();
  }, [tripId]);

  // Sync passenger details structure with selected seats
  useEffect(() => {
    setPassengerDetails(prev => {
      const updated = { ...prev };
      
      // Add newly selected seats
      selectedSeats.forEach((seat, idx) => {
        if (!updated[seat]) {
          updated[seat] = {
            name: idx === 0 ? (user?.name || '') : '',
            age: '',
            gender: 'Male'
          };
        }
      });

      // Remove unselected seats
      Object.keys(updated).forEach(seat => {
        if (!selectedSeats.includes(seat)) {
          delete updated[seat];
        }
      });

      return updated;
    });
  }, [selectedSeats, user]);

  const toggleSeat = (seatNumber) => {
    if (trip?.bookedSeats?.includes(seatNumber)) return;
    
    setSelectedSeats(prev => 
      prev.includes(seatNumber)
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handlePassengerChange = (seat, field, value) => {
    setPassengerDetails(prev => ({
      ...prev,
      [seat]: {
        ...prev[seat],
        [field]: value
      }
    }));
  };

  const validatePassengerDetails = () => {
    for (const seat of selectedSeats) {
      const p = passengerDetails[seat];
      if (!p || !p.name.trim()) {
        alert(`Please enter the passenger name for seat ${seat}`);
        return false;
      }
      if (!p.age || isNaN(p.age) || parseInt(p.age) <= 0) {
        alert(`Please enter a valid age for seat ${seat}`);
        return false;
      }
    }
    return true;
  };

  const handleProceedToPayment = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'operator') {
      alert('Operators/Agents are not allowed to book seats.');
      return;
    }
    if (validatePassengerDetails()) {
      setShowPaymentModal(true);
    }
  };

  // Card input formatting helpers
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setPaymentForm(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setPaymentForm(prev => ({ ...prev, cardExpiry: value }));
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setPaymentForm(prev => ({ ...prev, cardCvv: value }));
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setPaymentError('');

    const { cardName, cardNumber, cardExpiry, cardCvv } = paymentForm;
    if (!cardName.trim() || cardNumber.replace(/\s/g, '').length !== 16 || cardExpiry.length !== 5 || cardCvv.length !== 3) {
      setPaymentError('Please fill in all payment details correctly.');
      return;
    }

    // Start animated mock processing
    setPaymentProcessing(true);
    setProcessingStep(1);

    setTimeout(() => {
      setProcessingStep(2);
      setTimeout(() => {
        setProcessingStep(3);
        setTimeout(() => {
          setProcessingStep(4);
          setTimeout(() => {
            executeBooking();
          }, 1000);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  const executeBooking = async () => {
    try {
      const passengers = selectedSeats.map((seat) => ({
        name: passengerDetails[seat].name,
        age: parseInt(passengerDetails[seat].age),
        gender: passengerDetails[seat].gender,
        seatNumber: seat
      }));

      const bp = trip.boardingPoints.find(p => p._id === bookingData.boardingPoint) || trip.boardingPoints[0];
      const dp = trip.droppingPoints.find(p => p._id === bookingData.droppingPoint) || trip.droppingPoints[0];

      await api.post('/bookings', {
        tripId,
        passengers,
        totalAmount: selectedSeats.length * trip.fare,
        boardingPoint: { location: bp.location, time: bp.time },
        droppingPoint: { location: dp.location, time: dp.time },
        paymentMethod: 'Credit Card'
      });
      
      setShowPaymentModal(false);
      setPaymentProcessing(false);
      navigate('/dashboard/bookings');
    } catch (error) {
      setPaymentProcessing(false);
      setPaymentError(error.response?.data?.message || 'Booking checkout failed');
    }
  };

  if (loading) return <div className="text-center p-20 flex flex-col items-center justify-center gap-4 text-gray-500"><Loader2 className="w-10 h-10 animate-spin text-primary" /> Loading seats...</div>;
  if (!trip) return <div className="text-center p-20 text-red-500 font-semibold">Trip not found</div>;

  const totalSeats = trip.bus?.totalSeats || 40;
  const layout = trip.bus?.seatLayout || '2x2';

  // Parse layout columns
  let left = 2, right = 2;
  if (layout && layout.includes('x')) {
    const parts = layout.split('x');
    left = parseInt(parts[0]) || 2;
    right = parseInt(parts[1]) || 2;
  }
  const seatsPerRow = left + right;

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const leftLetters = alphabet.slice(0, left).split('');
  const middleLetter = alphabet[left];
  const rightLetters = alphabet.slice(left + 1, left + 1 + right).split('');

  // Total seats = (numRows - 1) * seatsPerRow + (seatsPerRow + 1) = numRows * seatsPerRow + 1
  const numRows = Math.ceil((totalSeats - 1) / seatsPerRow);
  const seatLetters = alphabet.slice(0, seatsPerRow + 1).split(''); // Includes middle letter

  const seats = [];
  for (let r = 1; r <= numRows; r++) {
    const isLastRow = r === numRows;
    // Left side seats
    for (const letter of leftLetters) {
      if (seats.length < totalSeats) {
        seats.push(`${r}${letter}`);
      }
    }
    // Middle seat (only in last row)
    if (isLastRow) {
      if (seats.length < totalSeats) {
        seats.push(`${r}${middleLetter}`);
      }
    }
    // Right side seats
    for (const letter of rightLetters) {
      if (seats.length < totalSeats) {
        seats.push(`${r}${letter}`);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090B] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Configure Your Journey</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{trip.route?.from} &rarr; {trip.route?.to} | {new Date(trip.date).toDateString()} | Departure: {trip.departureTime}</p>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Advanced 3D Seat Layout Map */}
          <div className="w-full lg:w-7/12 bg-zinc-950 p-12 rounded-3xl shadow-2xl border border-zinc-800 h-fit relative overflow-hidden animate-fade-in-up">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-zinc-950 to-zinc-950"></div>
            
            <div className="relative z-10 flex items-center justify-center mb-12 gap-8 border-b border-zinc-800 pb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 border border-zinc-700 shadow-inner"><Armchair className="w-4 h-4" /></div>
                <span className="text-sm text-zinc-400 font-bold uppercase tracking-widest">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"><Armchair className="w-4 h-4" /></div>
                <span className="text-sm text-blue-300 font-bold uppercase tracking-widest">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-900/50 text-red-500 border border-red-900/50"><Armchair className="w-4 h-4" /></div>
                <span className="text-sm text-red-400 font-bold uppercase tracking-widest">Booked</span>
              </div>
            </div>

            {/* 3D Bus Floor Plan Wrapper */}
            <div className="relative max-w-sm mx-auto group">
              <div 
                className="border-8 border-zinc-850 p-8 rounded-[40px] relative bg-zinc-900 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] transition-transform duration-700 ease-out"
                style={{ 
                  transform: 'perspective(1200px) rotateX(15deg) scale(0.95)',
                  transformStyle: 'preserve-3d',
                  boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)'
                }}
              >
                {/* Windshield / Dashboard representation */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 w-3/4 h-8 bg-zinc-800 rounded-full blur-sm opacity-50"></div>
                
                {/* Driver Steering wheel */}
                <div className="absolute top-6 right-10 w-12 h-12 border-[6px] border-zinc-700 rounded-full flex items-center justify-center shadow-lg transform -rotate-12">
                  <div className="w-2 h-8 bg-zinc-700 rounded-full"></div>
                </div>
                
                <div className="mt-20 grid gap-y-5 gap-x-3 relative z-10" style={{ transform: 'translateZ(20px)', gridTemplateColumns: `repeat(${left + 1 + right}, minmax(0, 1fr))` }}>
                  {Array.from({ length: numRows }).map((_, rIdx) => {
                    const r = rIdx + 1;
                    const isLastRow = r === numRows;
                    return (
                      <React.Fragment key={`row-${r}`}>
                        {/* Render left side seats */}
                        {leftLetters.map((seatLetter) => {
                          const seat = `${r}${seatLetter}`;
                          if (!seats.includes(seat)) return <div key={`empty-${r}-${seatLetter}`} className="w-12 h-12" />;

                          const isBooked = trip.bookedSeats?.includes(seat);
                          const isSelected = selectedSeats.includes(seat);

                          return (
                            <button
                              key={seat}
                              disabled={isBooked}
                              onClick={() => toggleSeat(seat)}
                              title={`Seat ${seat}`}
                              className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl transition-all duration-300 border relative ${
                                isBooked ? 'bg-red-950/40 text-red-500 border-red-900/50 cursor-not-allowed opacity-60' :
                                isSelected ? 'bg-gradient-to-br from-primary to-indigo-600 text-white border-primary shadow-[0_0_15px_rgba(37,99,235,0.4)] animate-scale-in font-bold' :
                                'bg-white text-zinc-750 border-zinc-200 hover:border-primary hover:text-primary hover:-translate-y-1 hover:shadow-md'
                              }`}
                            >
                              <span className={`text-[8px] absolute top-0.5 left-1 font-bold ${isSelected ? 'text-white/80' : 'text-zinc-400'}`}>{seat}</span>
                              <Armchair className="w-5 h-5 mt-1.5" />
                            </button>
                          );
                        })}

                        {/* Render Aisle or Middle Seat */}
                        {isLastRow ? (
                          (() => {
                            const seat = `${r}${middleLetter}`;
                            if (!seats.includes(seat)) return <div key={`empty-${r}-${middleLetter}`} className="w-12 h-12" />;

                            const isBooked = trip.bookedSeats?.includes(seat);
                            const isSelected = selectedSeats.includes(seat);

                            return (
                              <button
                                key={seat}
                                disabled={isBooked}
                                onClick={() => toggleSeat(seat)}
                                title={`Seat ${seat}`}
                                className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl transition-all duration-300 border relative ${
                                  isBooked ? 'bg-red-950/40 text-red-500 border-red-900/50 cursor-not-allowed opacity-60' :
                                  isSelected ? 'bg-gradient-to-br from-primary to-indigo-600 text-white border-primary shadow-[0_0_15px_rgba(37,99,235,0.4)] animate-scale-in font-bold' :
                                  'bg-white text-zinc-750 border-zinc-200 hover:border-primary hover:text-primary hover:-translate-y-1 hover:shadow-md'
                                }`}
                              >
                                <span className={`text-[8px] absolute top-0.5 left-1 font-bold ${isSelected ? 'text-white/80' : 'text-zinc-400'}`}>{seat}</span>
                                <Armchair className="w-5 h-5 mt-1.5" />
                              </button>
                            );
                          })()
                        ) : (
                          <div key={`aisle-${r}`} className="w-8 flex items-center justify-center text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                            Aisle
                          </div>
                        )}

                        {/* Render right side seats */}
                        {rightLetters.map((seatLetter) => {
                          const seat = `${r}${seatLetter}`;
                          if (!seats.includes(seat)) return <div key={`empty-${r}-${seatLetter}`} className="w-12 h-12" />;

                          const isBooked = trip.bookedSeats?.includes(seat);
                          const isSelected = selectedSeats.includes(seat);

                          return (
                            <button
                              key={seat}
                              disabled={isBooked}
                              onClick={() => toggleSeat(seat)}
                              title={`Seat ${seat}`}
                              className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl transition-all duration-300 border relative ${
                                isBooked ? 'bg-red-950/40 text-red-500 border-red-900/50 cursor-not-allowed opacity-60' :
                                isSelected ? 'bg-gradient-to-br from-primary to-indigo-600 text-white border-primary shadow-[0_0_15px_rgba(37,99,235,0.4)] animate-scale-in font-bold' :
                                'bg-white text-zinc-750 border-zinc-200 hover:border-primary hover:text-primary hover:-translate-y-1 hover:shadow-md'
                              }`}
                            >
                              <span className={`text-[8px] absolute top-0.5 left-1 font-bold ${isSelected ? 'text-white/80' : 'text-zinc-400'}`}>{seat}</span>
                              <Armchair className="w-5 h-5 mt-1.5" />
                            </button>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </div>
            </div>
          </div>
          </div>

          {/* Booking Summary & Passenger Forms */}
          <div className="w-full lg:w-5/12 space-y-6 lg:sticky lg:top-24 h-fit">
            <div className="glass p-6 rounded-3xl shadow-xl border border-white/20 dark:border-white/10">
              <h3 className="text-xl font-heading font-extrabold mb-6 border-b border-gray-200 dark:border-white/5 pb-4 text-gray-800 dark:text-white">Booking Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Boarding Point</label>
                    <select 
                      className="w-full border border-gray-200 dark:border-white/10 rounded-xl p-3 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                      value={bookingData.boardingPoint}
                      onChange={(e) => setBookingData({...bookingData, boardingPoint: e.target.value})}
                    >
                      {trip.boardingPoints?.map(bp => (
                        <option key={bp._id} value={bp._id}>{bp.location} ({bp.time})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Dropping Point</label>
                    <select 
                      className="w-full border border-gray-200 dark:border-white/10 rounded-xl p-3 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                      value={bookingData.droppingPoint}
                      onChange={(e) => setBookingData({...bookingData, droppingPoint: e.target.value})}
                    >
                      {trip.droppingPoints?.map(dp => (
                        <option key={dp._id} value={dp._id}>{dp.location} ({dp.time})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Dynamic Passenger Inputs */}
              {selectedSeats.length > 0 && (
                <div className="border-t border-gray-200 dark:border-white/5 pt-6 mb-6 space-y-6">
                  <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <span>Passenger Information</span>
                    <span className="bg-primary/10 dark:bg-indigo-500/20 text-primary dark:text-indigo-300 text-xs px-2 py-0.5 rounded-full">{selectedSeats.length} Selected</span>
                  </h4>
                  
                  <div className="space-y-6 max-h-80 overflow-y-auto pr-1">
                    {selectedSeats.map(seat => (
                      <div key={seat} className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200/60 dark:border-white/5 relative">
                        <div className="absolute top-3 right-4 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                          Seat {seat}
                        </div>
                        
                        <div className="space-y-3 mt-2">
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Full Name</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. John Doe"
                              className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              value={passengerDetails[seat]?.name || ''}
                              onChange={(e) => handlePassengerChange(seat, 'name', e.target.value)}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Age</label>
                              <input 
                                type="number" 
                                required
                                min="1"
                                max="120"
                                placeholder="e.g. 28"
                                className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                value={passengerDetails[seat]?.age || ''}
                                onChange={(e) => handlePassengerChange(seat, 'age', e.target.value)}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Gender</label>
                              <select 
                                className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                value={passengerDetails[seat]?.gender || 'Male'}
                                onChange={(e) => handlePassengerChange(seat, 'gender', e.target.value)}
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-white/5 pt-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Selected Seats ({selectedSeats.length})</span>
                  <span className="font-bold text-gray-800 dark:text-white">{selectedSeats.join(', ') || '-'}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Fare per Seat</span>
                  <span className="font-bold text-gray-800 dark:text-white font-mono">LKR {trip.fare}</span>
                </div>
                <div className="flex justify-between text-lg font-extrabold mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                  <span className="text-gray-800 dark:text-white">Total Amount</span>
                  <span className="text-primary dark:text-indigo-400 text-xl font-mono">LKR {selectedSeats.length * trip.fare}</span>
                </div>
              </div>

              <button 
                onClick={handleProceedToPayment}
                disabled={selectedSeats.length === 0}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-base transition-all duration-300 ${
                  selectedSeats.length > 0 
                  ? 'bg-gradient-to-r from-secondary to-yellow-400 text-zinc-955 hover:from-yellow-400 hover:to-yellow-300 hover:shadow-[0_10px_20px_rgba(250,204,21,0.3)] hover:-translate-y-0.5 cursor-pointer shadow-md' 
                  : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Proceed to Pay & Book
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-up Payment Checkout Sheet */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-end justify-center sm:p-4 overflow-hidden transition-all">
          <div className="bg-white dark:bg-[#0E0E12] rounded-t-[40px] sm:rounded-3xl shadow-[0_-30px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-white/5 max-w-md w-full p-8 relative overflow-hidden animate-fade-in-up mt-auto sm:mt-8 max-h-[90vh] overflow-y-auto">
            <div className="w-16 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mb-6 sm:hidden"></div>
            <button 
              onClick={() => !paymentProcessing && setShowPaymentModal(false)}
              disabled={paymentProcessing}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Simulated Animated Processing Screens */}
            {paymentProcessing ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                {processingStep < 4 ? (
                  <div className="relative mb-6">
                    <Loader2 className="w-16 h-16 animate-spin text-primary" />
                    <Lock className="w-6 h-6 text-primary absolute inset-0 m-auto" />
                  </div>
                ) : (
                  <div className="mb-6 bg-green-50 dark:bg-green-955/20 p-4 rounded-full border border-green-150 dark:border-green-500/30 scale-110 animate-bounce">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {processingStep === 1 && 'Validating Card Details...'}
                  {processingStep === 2 && 'Authorizing Transaction...'}
                  {processingStep === 3 && 'Securing Seats Reservation...'}
                  {processingStep === 4 && 'Payment Successful!'}
                </h3>
                <p className="text-gray-400 dark:text-gray-400 text-sm max-w-xs">
                  {processingStep === 1 && 'Checking security protocols and fields.'}
                  {processingStep === 2 && 'Connecting with banking gateway.'}
                  {processingStep === 3 && 'Updating database records.'}
                  {processingStep === 4 && 'Generating E-ticket manifest. Wrapping up...'}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 font-heading">Secure Checkout</h3>
                <p className="text-sm text-gray-400 mb-6 flex items-center gap-1.5"><Lock className="w-4 h-4 text-green-500" /> SSL Encrypted payment gateway</p>

                {/* Sleek Credit Card Visualization */}
                <div className="w-full h-44 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white flex flex-col justify-between shadow-xl shadow-blue-900/10 mb-6 relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full"></div>
                  <div className="absolute right-10 top-10 w-24 h-24 bg-white/5 rounded-full"></div>
                  
                  <div className="flex justify-between items-start">
                    <div className="text-[10px] font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded backdrop-blur">SECURE PAY</div>
                    <div className="w-10 h-7 bg-amber-400 rounded-md opacity-80 border border-amber-300"></div>
                  </div>

                  <div className="text-xl font-mono tracking-widest py-2">
                    {paymentForm.cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] text-blue-200 font-bold uppercase tracking-wider">Cardholder</p>
                      <p className="text-xs font-semibold truncate max-w-[200px]">{paymentForm.cardName.toUpperCase() || 'YOUR NAME'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-blue-200 font-bold uppercase tracking-wider text-right">Expires</p>
                      <p className="text-xs font-semibold">{paymentForm.cardExpiry || 'MM/YY'}</p>
                    </div>
                  </div>
                </div>

                {paymentError && (
                  <div className="mb-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm border border-red-100 dark:border-red-500/20 font-medium">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Cardholder Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. JOHN DOE"
                      className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase font-medium"
                      value={paymentForm.cardName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Card Number</label>
                    <input 
                      type="text" 
                      required
                      placeholder="1234 5678 1234 5678"
                      className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                      value={paymentForm.cardNumber}
                      onChange={handleCardNumberChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Expiration Date</label>
                      <input 
                        type="text" 
                        required
                        placeholder="MM/YY"
                        className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-center"
                        value={paymentForm.cardExpiry}
                        onChange={handleExpiryChange}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">CVV</label>
                      <input 
                        type="password" 
                        required
                        placeholder="•••"
                        className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-center"
                        value={paymentForm.cardCvv}
                        onChange={handleCvvChange}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-white/5 mt-6 flex flex-col gap-2">
                    <button 
                      type="submit"
                      className="w-full py-4 bg-primary text-white rounded-2xl text-center font-bold shadow-lg shadow-blue-100/10 hover:bg-primary-hover cursor-pointer"
                    >
                      Pay LKR {selectedSeats.length * trip.fare}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="w-full py-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-650 dark:text-gray-300 rounded-2xl text-center font-bold text-sm border border-gray-200 dark:border-white/5 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
