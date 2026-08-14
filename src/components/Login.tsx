import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { Dumbbell, Eye, EyeOff, Lock, User, AlertCircle, Sun, Moon, Monitor } from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { gymInfo, login, theme, setTheme } = useGym();
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!usernameInput.trim() || !passwordInput.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    // Simulate small, clean interactive delay for premium UX
    setTimeout(() => {
      const success = login(usernameInput.trim(), passwordInput);
      setIsLoading(false);
      if (success) {
        onSuccess();
      } else {
        setErrorMessage('Invalid username or password.');
      }
    }, 450);
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4 transition-colors duration-200">
      
      {/* Absolute top-right theme toggle for luxury experience */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-xl cursor-pointer transition-all shadow-xs"
          title={`Switch appearance (Current: ${theme})`}
        >
          {theme === 'light' && <Sun className="w-4.5 h-4.5 text-amber-500" />}
          {theme === 'dark' && <Moon className="w-4.5 h-4.5 text-indigo-400" />}
          {theme === 'system' && <Monitor className="w-4.5 h-4.5 text-emerald-500" />}
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        
        {/* Logo / Header section */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-600 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-950/40 flex items-center justify-center overflow-hidden shadow-xs">
            {gymInfo.logoUrl ? (
              <img src={gymInfo.logoUrl} alt="Gym Logo" className="w-full h-full object-cover" />
            ) : (
              <Dumbbell className="w-6 h-6 text-white dark:text-indigo-400" />
            )}
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-zinc-950 dark:text-white uppercase">
              {gymInfo.name}
            </h1>
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
              Gym Management System
            </p>
          </div>
        </div>

        {/* Central Login Card */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 shadow-md">
          <div className="space-y-1 mb-6 text-center">
            <h2 className="text-base font-black text-zinc-900 dark:text-white">Welcome back</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Sign in to manage your franchise terminal</p>
          </div>

          {/* Validation Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username field */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 dark:text-zinc-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  autoFocus
                  required
                  id="login-username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  placeholder="admin"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 dark:text-zinc-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  id="login-password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer transition-colors"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-bold cursor-pointer hover:opacity-90 active:scale-98 disabled:opacity-50 transition-all shadow-md shadow-zinc-900/10 dark:shadow-none"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-950 dark:border-t-white rounded-full animate-spin" />
                ) : (
                  'Login'
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Security Warning footnote */}
        <p className="text-[10px] text-center text-zinc-400 dark:text-zinc-500 leading-relaxed px-4">
          Terminal Mode: Administrative actions are tracked on local session audits. Standard localStorage fallback auth active.
        </p>

      </div>
    </div>
  );
};
