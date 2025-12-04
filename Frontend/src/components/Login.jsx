import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import remoteWorkerImage from '../assets/undraw_remote-worker.svg';
import { supabase } from '../utils/supabase';

// API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function Login() {
  const navigate = useNavigate();
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [validationErrors, setValidationErrors] = useState({
    name: null,
    email: null,
    password: null,
    confirmPassword: null
  });

  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setValidationErrors({
      name: null,
      email: null,
      password: null,
      confirmPassword: null
    });
    setApiError('');
    setSuccessMessage('');
    setShowPassword(false);
    setShowCPassword(false);
    setIsLoading(false);
  };

  useEffect(() => {
    resetForm();
  }, []);

  // Handle OAuth redirect and profile creation for Google sign-in
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session when user returns from OAuth
        const { data: { session }, error } = await supabase.auth.getSession();

        if (session && session.user) {
          console.log('OAuth successful, creating/updating profile');

          // Extract Google user data
          const user = session.user;
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
          const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

          try {
            // Upsert profile data
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                full_name: fullName,
                avatar_url: avatarUrl,
              }, {
                onConflict: 'id'
              });

            if (profileError) {
              console.error('Profile creation/update failed:', profileError);
              // Continue with sign-in even if profile creation fails
            } else {
              console.log('Profile created/updated successfully');
            }
          } catch (profileError) {
            console.error('Profile operation error:', profileError);
          }

          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify(user));

          // Navigate to home page
          navigate('/');
        } else if (error) {
          console.error('OAuth error:', error);
          setApiError('Authentication failed. Please try again.');
          setGoogleLoading(false);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  const isFormValid = () => {
    if (isLoginForm) {
      return formData.email && formData.password;
    } else {
      return validationErrors.name === 'valid' && validationErrors.email === 'valid' && validationErrors.password === 'valid' && validationErrors.confirmPassword === 'valid';
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.*[a-z]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear API errors when user starts typing
    setApiError('');
    setSuccessMessage('');

    // Real-time validation
    if (name === 'name' && value) {
      setValidationErrors(prev => ({
        ...prev,
        name: value.trim().length >= 2 ? 'valid' : 'invalid'
      }));
    } else if (name === 'name' && !value) {
      setValidationErrors(prev => ({
        ...prev,
        name: null
      }));
    }

    if (name === 'email' && value) {
      setValidationErrors(prev => ({
        ...prev,
        email: validateEmail(value) ? 'valid' : 'invalid'
      }));
    } else if (name === 'email' && !value) {
      setValidationErrors(prev => ({
        ...prev,
        email: null
      }));
    }

    if (name === 'password' && value) {
      setValidationErrors(prev => ({
        ...prev,
        password: validatePassword(value) ? 'valid' : 'invalid'
      }));
    } else if (name === 'password' && !value) {
      setValidationErrors(prev => ({
        ...prev,
        password: null
      }));
    }

    if (name === 'confirmPassword' && value && !isLoginForm) {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: value === formData.password ? 'valid' : 'invalid'
      }));
    } else if (name === 'confirmPassword' && !value) {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: null
      }));
    }
  };

  const getInputBorderClass = (field) => {
    if (validationErrors[field] === 'valid') {
      return 'border-green-500';
    } else if (validationErrors[field] === 'invalid') {
      return 'border-red-500';
    }
    return 'border-gray-300';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError('');
    setSuccessMessage('');

    try {
      const endpoint = isLoginForm ? '/api/auth/login' : '/api/auth/signup';
      const payload = isLoginForm 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      // Client-side validation
      if (!isLoginForm && formData.password !== formData.confirmPassword) {
        setApiError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (isLoginForm) {
          setSuccessMessage('Login successful! Redirecting...');
          // Store user data
          localStorage.setItem('user', JSON.stringify(data.user));
          // Redirect to home page
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          setSuccessMessage('Account created successfully! Please login.');
          setTimeout(() => {
            setIsLoginForm(true);
            setFormData({
              name: '',
              email: '',
              password: '',
              confirmPassword: ''
            });
            setSuccessMessage('');
          }, 2000);
        }
      } else {
        setApiError(data.message || 'An error occurred');
      }
    } catch (error) {
      setApiError('Network error. Please try again.');
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setApiError('');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setApiError(error.message);
        setGoogleLoading(false);
        return;
      }

      // OAuth will redirect to Google, so we don't need to handle success here
      // The redirect back will be handled by the auth listener
    } catch (error) {
      setApiError('An error occurred during Google authentication');
      setGoogleLoading(false);
      console.error('Google auth error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-blue-50">
      {/* Main Container */}
      <div className="moving-border-container rounded-3xl shadow-right-only max-w-5xl w-full relative">
        <div className="relative min-h-[500px] bg-white rounded-[calc(1.5rem-4px)] overflow-hidden">
          
          {/* Illustration Panel - Smoothly Sliding */}
          <div className={`absolute inset-y-0 w-1/2 bg-blue-600 p-12 flex items-center justify-center z-10 transition-transform duration-1000 ease-in-out ${
            isLoginForm 
              ? 'transform translate-x-0' 
              : 'transform translate-x-full'
          }`}>
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full transform -translate-x-24 translate-y-24"></div>
            
            <div className="text-center z-10">
              <div className="mb-8">
                {/* Remote Worker Image */}
                <div className="w-96 h-80 mx-auto bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm p-8">
                  <img 
                    src={remoteWorkerImage} 
                    alt="Remote Worker" 
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 transition-all duration-500">
                {isLoginForm ? 'Welcome Back!' : 'Join Us Today!'}
              </h2>
              <p className="text-blue-100 text-xs transition-all duration-500">
                {isLoginForm 
                  ? 'Your AI-powered career acceleration platform awaits' 
                  : 'Start your journey to career success'
                }
              </p>
            </div>
          </div>

          {/* Form Panel - Smoothly Sliding */}
          <div className={`absolute inset-y-0 w-1/2 p-12 flex flex-col justify-center bg-white z-20 transition-transform duration-1000 ease-in-out shadow-2xl border-l border-gray-200 ${
            isLoginForm 
              ? 'transform translate-x-full' 
              : 'transform translate-x-0'
          }`}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mt-12 transition-all duration-500">
                {isLoginForm ? 'LOGIN' : 'SIGN UP'}
              </h3>
            </div>

            {/* Google OAuth Button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading || isLoading}
                className={`w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-2xl text-sm font-medium bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-gray-700">
                  {googleLoading ? 'Connecting...' : 'Continue with Google'}
                </span>
              </button>

              {/* Divider */}
              <div className="flex items-center mt-5 mb-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="px-3 text-xs text-gray-500">or</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 max-w-[90%] mx-4">
              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-3 rounded-xl text-sm text-center">
                  {successMessage}
                </div>
              )}

              {/* Name Field (Sign Up only) */}
              <div className={`transition-all duration-500 ease-in-out ${
                !isLoginForm 
                  ? 'opacity-100 max-h-20 transform translate-y-0' 
                  : 'opacity-0 max-h-0 overflow-hidden transform -translate-y-2'
              }`}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 rounded-2xl text-sm border border-opacity-40 placeholder:text-xs ${getInputBorderClass('name')} focus:outline-none focus:ring-0 transition-colors bg-gray-50 text-gray-800 placeholder-gray-400 bg-opacity-40`}
                  placeholder="Full Name"
                  required={!isLoginForm}
                  disabled={isLoginForm}
                />
              </div>

              {/* Email Field */}
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 rounded-2xl text-sm border border-opacity-40  placeholder:text-xs ${getInputBorderClass('email')} focus:outline-none focus:ring-0 transition-colors bg-gray-50 text-gray-800 placeholder-gray-400 bg-opacity-40`}
                  placeholder="john@example.com"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 pr-12 rounded-2xl border-opacity-40  placeholder:text-xs text-sm border ${getInputBorderClass('password')} focus:outline-none focus:ring-0 transition-colors bg-gray-50 text-gray-800 placeholder-gray-400 bg-opacity-40`}
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* API Error Message */}
              {apiError && (
                <p className="text-red-500 text-xs text-center">{apiError}</p>
              )}

              {/* Confirm Password Field (Sign Up only) */}
              <div className={`transition-all duration-500 ease-in-out ${
                !isLoginForm 
                  ? 'opacity-100 max-h-20 transform translate-y-0' 
                  : 'opacity-0 max-h-0 overflow-hidden transform -translate-y-2'
              }`}>
                <div className="relative">
                  <input
                    type={showCPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 rounded-2xl text-sm border border-opacity-40  placeholder:text-xs ${getInputBorderClass('confirmPassword')} focus:outline-none focus:ring-0 transition-colors bg-gray-50 text-gray-800 placeholder-gray-400 bg-opacity-40`}
                    placeholder="Confirm your password"
                    required={!isLoginForm}
                    disabled={isLoginForm}
                  />
                  <button
                      type="button"
                      onClick={() => setShowCPassword(!showCPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-10">
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid()}
                  className={`w-full text-white bg-blue-600 hover:bg-blue-700 font-medium py-3 px-3 placeholder:text-xs text-sm rounded-full transition-all duration-300 ${
                    isLoading || !isFormValid()
                      ? 'cursor-not-allowed' 
                      : ''
                  }`}
                >
                  <span className="transition-all duration-300">
                    {isLoading 
                      ? (isLoginForm ? 'Logging in...' : 'Creating Account...') 
                      : (isLoginForm ? 'Login' : 'Sign Up')
                    }
                  </span>
                </button>
              </div>

              {/* Toggle Form Link */}
              <div className="text-center pt-6">
                <p className="text-gray-600 text-xs">
                  <span className="transition-all duration-300">
                    {isLoginForm 
                      ? "Don't have an account? " 
                      : "Already have an account? "
                    }
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginForm(!isLoginForm);
                      resetForm();
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-all duration-300 hover:scale-105"
                    disabled={isLoading}
                  >
                    {isLoginForm ? 'Sign up' : 'Login'}
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
