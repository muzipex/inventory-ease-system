
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Shield, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const SplashPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = "Oops! That password's too short—like a half-built wall!";
    }

    if (!isLogin) {
      if (!formData.businessName) {
        newErrors.businessName = 'Business name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message === 'Invalid login credentials') {
            toast.error('Invalid email or password. Please check your credentials.');
          } else {
            toast.error(error.message || 'An error occurred during login');
          }
        } else {
          toast.success('Welcome back!');
          navigate('/');
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.businessName);
        if (error) {
          if (error.message === 'User already registered') {
            toast.error('An account with this email already exists. Please sign in instead.');
            setIsLogin(true);
          } else {
            toast.error(error.message || 'An error occurred during registration');
          }
        } else {
          toast.success('Account created successfully! Please check your email to verify your account.');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="relative w-6 h-6">
        <div className="absolute inset-0 border-2 border-orange-200 rounded border-t-orange-500 animate-spin"></div>
        <div className="absolute inset-1 border border-orange-100 rounded border-t-orange-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
      </div>
      <span className="ml-2 text-white font-medium">
        {isLogin ? 'Building access...' : 'Creating account...'}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 md:grid-cols-24 gap-2 h-full w-full p-4">
          {Array.from({ length: 288 }, (_, i) => (
            <div
              key={i}
              className="bg-slate-600 rounded-sm opacity-60 animate-pulse"
              style={{
                animationDelay: `${(i % 12) * 0.1}s`,
                animationDuration: `${2 + (i % 3)}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
          {/* Logo */}
          <div className="mb-8">
            <div className="text-orange-500 font-bold text-2xl">
              NGABIRANO BLOCKS
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              BUILD SMARTER,
              <br />
              <span className="text-orange-500">NOT HARDER</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
              Track, manage, and optimize your block inventory—anytime, anywhere.
            </p>

            {/* Trust Signals */}
            <div className="space-y-4">
              <div className="flex items-center text-slate-400">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="italic">"Used by 50+ construction teams in East Africa."</span>
              </div>
              
              <div className="flex items-center text-slate-400">
                <Shield className="h-5 w-5 text-blue-500 mr-3" />
                <span>Secure cloud sync & data protection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Forms Section */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 py-12">
          <Card className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border-slate-700 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="flex bg-slate-700 rounded-lg p-1">
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                      isLogin 
                        ? 'bg-orange-500 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    onClick={() => setIsLogin(true)}
                    disabled={isLoading}
                  >
                    Login
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                      !isLogin 
                        ? 'bg-orange-500 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    onClick={() => setIsLogin(false)}
                    disabled={isLoading}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                {isLogin ? 'Welcome Back' : 'Get Started'}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Business Name</label>
                    <Input
                      type="text"
                      placeholder="Your Construction Company"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-orange-500 focus:ring-orange-500"
                      disabled={isLoading}
                    />
                    {errors.businessName && (
                      <p className="text-red-400 text-sm">{errors.businessName}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-orange-500 focus:ring-orange-500"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center">
                    Password
                    <Lock className="h-4 w-4 ml-2 text-slate-400" />
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-orange-500 focus:ring-orange-500 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-sm">{errors.password}</p>
                  )}
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-orange-500 focus:ring-orange-500"
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                >
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      {isLogin ? 'ACCESS INVENTORY' : 'GET STARTED'}
                      <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        🔨
                      </span>
                    </>
                  )}
                </Button>

                {isLogin && (
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm text-slate-400 hover:text-orange-500 transition-colors relative group"
                      disabled={isLoading}
                    >
                      Forgot password?
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
                    </button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SplashPage;
