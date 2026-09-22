import React, { useState } from 'react';
import { User } from '../types';
import { authenticateUser } from '../data/mockData';
import { MahalluLogo } from './MahalluLogo';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  HelpCircle,
  X,
  PhoneCall
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onExploreAsGuest?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onExploreAsGuest }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your registered email address and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const user = authenticateUser(email, password);
      setIsLoading(false);

      if (user) {
        onLogin(user);
      } else {
        setErrorMsg('Invalid email or password. Please verify your credentials and try again.');
      }
    }, 450);
  };

  return (
    <div id="login-page-container" className="min-h-[85vh] flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* Left Column: Visual Brand */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 p-6 sm:p-8 lg:p-12 text-white flex flex-col items-center justify-center relative overflow-hidden border-b lg:border-b-0 border-emerald-800/40">
          {/* Subtle decorative background glow */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-emerald-600/10 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-row lg:flex-col items-center gap-3.5 sm:gap-4 lg:gap-0 text-left lg:text-center w-full max-w-sm mx-auto justify-center">
            {/* Logo: in a line with name on mobile, stacked on top on desktop */}
            <div className="w-14 h-14 sm:w-18 sm:h-18 lg:w-32 lg:h-32 rounded-2xl lg:rounded-3xl bg-white/95 border border-emerald-400/30 flex items-center justify-center shadow-2xl shadow-emerald-950/60 p-1.5 sm:p-2 lg:p-2.5 mb-0 lg:mb-5 shrink-0 hover:scale-105 transition-transform duration-300">
              <MahalluLogo className="w-full h-full" />
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-400 tracking-wider uppercase block">
                State Waqf Board Registered
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight font-serif">
                Edappal Central Mahallu
              </h1>
              <p className="text-[11px] sm:text-xs lg:text-sm text-emerald-200/80 font-medium max-w-xs pt-0.5 lg:pt-1">
                Community Administration & Resident Services
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Sign in to your account
              </h2>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div 
                id="login-error-alert"
                className="mb-6 p-4 bg-red-50/90 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-3 animate-in fade-in duration-150"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-red-900">Authentication Failed</span>
                  <p>{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label 
                  htmlFor="login-email-input" 
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="e.g. admin@mahallu.org or resident@mahallu.org"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label 
                    htmlFor="login-password-input" 
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Enter your secret password"
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-600 font-medium">Keep me signed in on this device</span>
                </label>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {onExploreAsGuest && (
            <div className="mt-6 pt-4 text-center">
              <button
                id="explore-guest-btn"
                onClick={onExploreAsGuest}
                className="text-xs font-semibold text-slate-500 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                Browse Public Prayer Schedule & Notices as Guest →
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Forgot Password Modal Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Account Access Assistance</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              To safeguard confidential household registers and Waqf financial records, password resets are verified directly by the Mahallu General Secretary's Secretariat.
            </p>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <PhoneCall className="w-4 h-4 text-emerald-700" />
                <span>Mahallu Secretariat Helpdesk:</span>
              </div>
              <p className="text-slate-600">• Helpline: <strong className="text-slate-800">+91 98471 23456</strong></p>
              <p className="text-slate-600">• Email: <strong className="text-slate-800">office@mahallu.org</strong></p>
              <p className="text-slate-500 text-[11px]">Working Hours: 08:30 AM – 07:30 PM (Except Friday Prayer break)</p>
            </div>

            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
