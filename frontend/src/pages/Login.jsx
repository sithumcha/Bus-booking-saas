import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ShieldAlert, Bus, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';

const Login = () => {
  const [role, setRole] = useState('passenger'); // passenger, operator, admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { loginUser, loginOperator } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (role === 'operator') {
        await loginOperator(email, password);
        addToast('Operator Login Successful!', 'success');
        navigate('/admin');
      } else {
        const userData = await loginUser(email, password);
        // The backend returns the actual role of the user
        if (userData.role === 'admin') {
          addToast('Admin Login Successful!', 'success');
          navigate('/superadmin');
        } else {
          addToast('Login Successful!', 'success');
          navigate('/dashboard');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      addToast(msg, 'error');
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
              Elevate Your <br/><span className="text-secondary">Journey.</span>
            </h1>
            <p className="text-lg text-blue-100 font-light mb-8">
              Experience the next generation of transport management. Secure, fast, and remarkably comfortable.
            </p>
            <div className="flex items-center gap-4 text-sm font-semibold">
              <div className="flex -space-x-4">
                <img className="w-10 h-10 rounded-full border-2 border-primary" src="https://i.pravatar.cc/100?img=1" alt="User"/>
                <img className="w-10 h-10 rounded-full border-2 border-primary" src="https://i.pravatar.cc/100?img=2" alt="User"/>
                <img className="w-10 h-10 rounded-full border-2 border-primary" src="https://i.pravatar.cc/100?img=3" alt="User"/>
              </div>
              <p>Join 10,000+ users today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Glassmorphic Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-gray-50 relative">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-heading font-extrabold text-gray-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-3 text-gray-500 font-medium">
              Please enter your details to access your {role.toUpperCase()} account.
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
              <ShieldAlert className="w-5 h-5" />
              {error}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white shadow-sm text-gray-900 font-medium"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-xs font-bold text-primary hover:text-primary-hover">Forgot password?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white shadow-sm text-gray-900 font-medium"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 text-base font-bold rounded-2xl text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-4 focus:ring-gray-900/20 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                Sign In
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 font-medium border-t border-gray-200 pt-8">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary hover:text-primary-hover transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
