import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Preloader from './components/Preloader';
import Chatbot from './components/Chatbot';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({ showSpinner: false, speed: 500, minimum: 0.2 });

import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import SeatSelection from './pages/SeatSelection';
import Login from './pages/Login';
import Register from './pages/Register';
import PassengerDashboard from './pages/PassengerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ClientBuses from './pages/ClientBuses';

// Inner component to use location hook
const AppContent = () => {
  const location = useLocation();

  // Scroll to top and trigger NProgress on route change
  useEffect(() => {
    NProgress.start();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Simulate loading time to show the bus animation
    const timer = setTimeout(() => {
      NProgress.done();
    }, 600);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#09090B]">
      <Navbar />
      {/* 
        Keying the main container by location.pathname forces React to remount it,
        triggering the animate-fade-in-up transition on every page load.
      */}
      <main 
        key={location.pathname} 
        className="flex-grow animate-fade-in-up animation-duration-500"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/buses" element={<ClientBuses />} />
          <Route path="/booking/:tripId" element={<SeatSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute role="passenger" />}>
            <Route path="/dashboard/*" element={<PassengerDashboard />} />
          </Route>
          
          <Route element={<ProtectedRoute role="operator" />}>
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/superadmin/*" element={<SuperAdminDashboard />} />
          </Route>
        </Routes>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <HelmetProvider>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

export default App;
