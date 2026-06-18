import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Bus, Building, ShieldAlert, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [role, setRole] = useState('passenger');
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  
  const { registerUser, registerOperator } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (role === 'operator') {
        await registerOperator(formData.companyName, formData.email, formData.password, formData.phone);
        navigate('/admin');
      } else if (role === 'admin') {
        await registerUser(formData.name, formData.email, formData.password, formData.phone, 'admin');
        navigate('/superadmin');
      } else {
        await registerUser(formData.name, formData.email, formData.password, formData.phone, 'passenger');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      
      {/* Left Side: Advanced Image & Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-primary/80 to-purple-900/90 z-10 mix-blend-multiply"></div>
        <img 
          src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
          alt="Luxury Bus Travel" 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        
        {/* Floating Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-float animation-delay-200"></div>

        <div className="relative z-20 flex flex-col justify-between p-16 h-full text-white">
          <div>
            <Link to="/" className="flex items-center gap-3 w-max group">
              <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20 group-hover:bg-white/20 transition-all">
                <Bus className="h-6 w-6 text-secondary" />
              </div>
              <span className="text-3xl font-heading font-black tracking-tight drop-shadow-md">BusSaaS</span>
            </Link>
          </div>
          
          <div className="max-w-md animate-fade-in-up">
            <h1 className="text-5xl font-heading font-extrabold mb-6 leading-tight">
              Start Your <br/><span className="text-secondary">Journey.</span>
            </h1>
            <p className="text-lg text-blue-100 font-light mb-8">
              Create an account to book premium buses, manage fleets, or administer the system.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Glassmorphic Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-gray-50 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up py-10">
          
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-heading font-extrabold text-gray-900 tracking-tight">
              Create Account
            </h2>
            <p className="mt-3 text-gray-500 font-medium">
              Join us to {role === 'operator' ? 'manage your fleet' : role === 'admin' ? 'moderate the system' : 'book tickets easily'}
            </p>
          </div>

          {/* Advanced Pill Role Selector */}
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex relative overflow-hidden">
            <button
              type="button"
              onClick={() => setRole('passenger')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all z-10 ${role === 'passenger' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <User className="w-4 h-4" /> Passenger
            </button>
            <button
              type="button"
              onClick={() => setRole('operator')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all z-10 ${role === 'operator' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <Bus className="w-4 h-4" /> Operator
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all z-10 ${role === 'admin' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <ShieldAlert className="w-4 h-4" /> Admin
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 border border-red-100 animate-scale-in">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-5">
              
              {role !== 'operator' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white shadow-sm text-gray-900 font-medium"
                      placeholder="John Doe"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Company Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="companyName"
                      required
                      className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white shadow-sm text-gray-900 font-medium"
                      placeholder="Super Express Travels"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white shadow-sm text-gray-900 font-medium"
                    placeholder="you@example.com"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white shadow-sm text-gray-900 font-medium"
                    placeholder="+94 77 123 4567"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white shadow-sm text-gray-900 font-medium"
                    placeholder="••••••••"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 text-base font-bold rounded-2xl text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-4 focus:ring-gray-900/20 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                Create Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 font-medium border-t border-gray-200 pt-8">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary hover:text-primary-hover transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
