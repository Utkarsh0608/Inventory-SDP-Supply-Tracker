import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Loader2, User, UserPlus, LogIn } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    state: '',
    city: '',
    pincode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Handle Login
        await login({ 
          email: formData.email, 
          password: formData.password 
        });
        navigate('/dashboard');
      } else {
        // Handle Registration
        if (!formData.state || !formData.city || !/^[0-9]{6}$/.test(formData.pincode)) {
          throw {
            response: {
              data: {
                detail: 'State, City and a valid 6-digit Pincode are required.'
              }
            }
          };
        }

        await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          state: formData.state,
          city: formData.city,
          pincode: formData.pincode
        });
        
        // After successful registration, switch to login and show success message
        setIsLogin(true);
        setError('Registration successful! Please sign in with your credentials.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (!err.response) {
        setError('Network error: Is the backend server running?');
      } else {
        setError(err.response.data?.detail || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="p-3 bg-blue-600 dark:bg-blue-500 rounded-xl shadow-lg">
            <User className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Inventory Tracker
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className={`p-4 flex items-start rounded-lg border-l-4 ${error.includes('successful') ? 'bg-green-50 dark:bg-green-900/20 border-green-400 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-700 dark:text-red-400'}`}>
                <AlertCircle className={`h-5 w-5 mr-2 mt-0.5 ${error.includes('successful') ? 'text-green-400' : 'text-red-400'}`} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500 py-2.5 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500 py-2.5 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500 py-2.5 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    State
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full sm:text-sm border-gray-300 dark:border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500 py-2.5 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="Madhya Pradesh"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full sm:text-sm border-gray-300 dark:border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500 py-2.5 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="Bhopal"
                  />
                </div>

                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pincode
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={handleInputChange}
                    maxLength={6}
                    className="mt-1 block w-full sm:text-sm border-gray-300 dark:border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500 py-2.5 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="462001"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Pincode must be a 6 digit number.
                  </p>
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  isLogin ? (
                    <span className="flex items-center"><LogIn className="h-4 w-4 mr-2" /> Sign In</span>
                  ) : (
                    <span className="flex items-center"><UserPlus className="h-4 w-4 mr-2" /> Register</span>
                  )
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
