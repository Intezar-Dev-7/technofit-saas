import React, { useState } from 'react';
import { GymProvider, useGym } from './context/GymContext';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { Attendance } from './pages/Attendance';
import { Payments } from './pages/Payments';
import { Renewals } from './pages/Renewals';
import { Memberships } from './pages/Memberships';
import { Settings } from './pages/Settings';
import { Reports } from './pages/Reports';
import { Login } from './components/Login';
import { MemberProfileModal } from './components/MemberProfileModal';
import { Member } from './types';
import { 
  Dumbbell, 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  CreditCard, 
  RefreshCw, 
  Award, 
  Settings as SettingsIcon, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Monitor,
  User, 
  Sparkles,
  Search,
  BarChart3
} from 'lucide-react';

type ViewType = 'dashboard' | 'members' | 'attendance' | 'payments' | 'renewals' | 'memberships' | 'settings' | 'reports';

function AppContent() {
  const { gymInfo, theme, setTheme, isAuthenticated, adminUser, logout, members } = useGym();
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Global search state
  const [selectedGlobalMember, setSelectedGlobalMember] = useState<Member | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<Member[]>([]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Gym Members', icon: Users },
    { id: 'memberships', label: 'Pricing Plans', icon: Award },
    { id: 'attendance', label: 'Desk Check-In', icon: CheckSquare },
    { id: 'payments', label: 'Payment Ledger', icon: CreditCard },
    { id: 'renewals', label: 'Retention & Renewals', icon: RefreshCw },
    { id: 'reports', label: 'Business Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ] as const;

  // Protect the application using the admin login gate
  if (!isAuthenticated) {
    return <Login onSuccess={() => setActiveView('dashboard')} />;
  }

  // Toggle theme between light, dark, and system
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  // Render the current view
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onViewChange={(view) => setActiveView(view)} />;
      case 'members':
        return <Members />;
      case 'attendance':
        return <Attendance />;
      case 'payments':
        return <Payments />;
      case 'renewals':
        return <Renewals />;
      case 'memberships':
        return <Memberships />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onViewChange={(view) => setActiveView(view)} />;
    }
  };

  // Find label of active view
  const activeLabel = navItems.find(item => item.id === activeView)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex transition-colors duration-200">
      
      {/* 1. PERSISTENT SIDEBAR (Compact on tablet/md, full-width on desktop/lg) */}
      <aside className="hidden md:flex flex-col w-20 lg:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800/80 fixed h-full z-20 transition-all duration-200">
        
        {/* Brand / Title section */}
        <div className="p-4 lg:p-6 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-center lg:justify-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-xs overflow-hidden flex items-center justify-center flex-shrink-0">
            {gymInfo.logoUrl ? (
              <img src={gymInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Dumbbell className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0 flex-1 lg:block hidden animate-fade-in">
            <h1 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white uppercase truncate" title={gymInfo.name}>
              {gymInfo.name}
            </h1>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-extrabold tracking-wider uppercase block">
              Goa Franchise
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 lg:px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveView(item.id)}
                title={item.label}
                className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md shadow-zinc-900/5 dark:shadow-none'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 lg:w-4 lg:h-4 flex-shrink-0 ${isActive ? 'text-inherit' : 'text-zinc-400 dark:text-zinc-500'}`} />
                <span className="lg:block hidden truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-3 lg:p-4 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-950/20 space-y-3">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/10 flex items-center justify-center font-bold text-xs flex-shrink-0" title={adminUser}>
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 lg:block hidden">
              <p className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider">
                Active Admin
              </p>
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-300 truncate" title={adminUser}>
                {adminUser}
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              logout();
              setActiveView('dashboard');
            }}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-1 lg:px-3 border border-rose-200 dark:border-rose-900/20 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
            title="Log Out Terminal"
          >
            <span className="lg:inline hidden">Log Out Terminal</span>
            <span className="lg:hidden block text-center font-black">OUT</span>
          </button>
        </div>

      </aside>

      {/* 2. MAIN APPLICATION CONTENT COLUMN */}
      <div className="flex-1 flex flex-col md:pl-20 lg:pl-64 min-w-0 transition-all duration-200">
        
        {/* Core Topbar/Header */}
        <header className="sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-850 z-10 px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 md:hidden cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Current route display tag */}
            <div className="flex items-center gap-2">
              <span className="hidden lg:inline text-xs text-zinc-400 font-bold uppercase tracking-wider">
                {gymInfo.name}
              </span>
              <span className="hidden lg:inline text-zinc-300 dark:text-zinc-700">/</span>
              <h1 className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-tight">
                {activeLabel}
              </h1>
            </div>
          </div>

          {/* Global Autocomplete Member Search */}
          <div className="relative hidden md:block md:w-48 lg:w-80">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search member by Name, Phone, ID..."
                value={globalSearchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setGlobalSearchQuery(val);
                  if (val.trim()) {
                    const matches = members.filter(m =>
                      m.name.toLowerCase().includes(val.toLowerCase()) ||
                      m.phone.includes(val) ||
                      m.id.toLowerCase().includes(val.toLowerCase())
                    ).slice(0, 5);
                    setGlobalSearchResults(matches);
                  } else {
                    setGlobalSearchResults([]);
                  }
                }}
                className="w-full pl-9 pr-8 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              />
              {globalSearchQuery && (
                <button
                  onClick={() => {
                    setGlobalSearchQuery('');
                    setGlobalSearchResults([]);
                  }}
                  className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {globalSearchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {globalSearchResults.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedGlobalMember(m);
                      setGlobalSearchQuery('');
                      setGlobalSearchResults([]);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">{m.name}</p>
                      <p className="text-[10px] text-zinc-400 font-medium">{m.phone} • {m.id}</p>
                    </div>
                    <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded uppercase">
                      Profile
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2.5">
            
            {/* Desk Check-In Shortcut */}
            {activeView !== 'attendance' && (
              <button
                onClick={() => setActiveView('attendance')}
                title="Desk Check-In"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden lg:inline">Desk Check-In</span>
              </button>
            )}

            {/* Light / Dark Mode switch */}
            <button
              onClick={toggleTheme}
              className="p-2 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
              title={`Switch appearance (Current: ${theme})`}
            >
              {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
              {theme === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
              {theme === 'system' && <Monitor className="w-4 h-4 text-emerald-500" />}
            </button>

            {/* User Avatar badge (Mobile compact) */}
            <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 p-1 pr-2.5 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300">
              <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] uppercase">
                {adminUser[0]}
              </div>
              <span className="hidden md:inline max-w-28 truncate">{adminUser}</span>
            </div>

          </div>
        </header>

        {/* Primary View Router Grid Frame */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderView()}
        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-[10px] text-zinc-400 border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950/20">
          {gymInfo.name} Goa • Front-Desk Terminal • Simulated Local Time: 14 Aug 2026, 09:40 AM
        </footer>

      </div>

      {/* 3. MOBILE MENU SLIDE-OVER DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backer overlay shadow */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs" 
          />

          <div className="fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between p-6 z-10 animate-slide-in">
            <div className="space-y-6">
              
              {/* Brand and close button */}
              <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center overflow-hidden flex-shrink-0">
                    {gymInfo.logoUrl ? (
                      <img src={gymInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Dumbbell className="w-4 h-4" />
                    )}
                  </div>
                  <h2 className="text-xs font-black uppercase text-zinc-900 dark:text-white truncate max-w-[120px]">
                    {gymInfo.name}
                  </h2>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 border border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded-md cursor-pointer hover:bg-zinc-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation list */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                          : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0 text-zinc-400 dark:text-zinc-500" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>

            </div>

            {/* Profile badge footer */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-xs text-zinc-500">
                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  {adminUser[0].toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Desk Terminal</p>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-300 truncate">{adminUser}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  setActiveView('dashboard');
                }}
                className="w-full flex items-center justify-center gap-2 py-1.5 px-3 border border-rose-200 dark:border-rose-900/20 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                Log Out Terminal
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Global member profile modal trigger */}
      {selectedGlobalMember && (
        <MemberProfileModal 
          member={selectedGlobalMember}
          onClose={() => setSelectedGlobalMember(null)}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <GymProvider>
      <AppContent />
    </GymProvider>
  );
}
