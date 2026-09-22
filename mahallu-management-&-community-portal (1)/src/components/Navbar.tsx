import React, { useState, useEffect, useRef } from 'react';
import { User, ActiveTab, NoticeItem, CommunityEvent } from '../types';
import { MahalluLogo } from './MahalluLogo';
import { NotificationCenter } from './NotificationCenter';
import { 
  Users, 
  Wallet, 
  Clock, 
  FileText, 
  LayoutDashboard, 
  Menu, 
  X, 
  LogOut, 
  Shield, 
  UserCheck, 
  ChevronDown,
  HeartHandshake,
  Compass,
  PhoneCall,
  GraduationCap,
  Sparkles,
  MapPin,
  Building2,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  pendingRequestsCount: number;
  notices?: NoticeItem[];
  events?: CommunityEvent[];
  onAddNotice?: (notice: NoticeItem) => void;
  onUpdateRsvp?: (eventId: string, rsvp: 'attending' | 'maybe' | 'declined') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  onOpenLoginModal,
  onLogout,
  pendingRequestsCount,
  notices = [],
  events = [],
  onAddNotice,
  onUpdateRsvp
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'directory' as ActiveTab, label: 'Directory', icon: Users },
    { id: 'financials' as ActiveTab, label: 'Financials', icon: Wallet },
    { id: 'prayer-notices' as ActiveTab, label: 'Prayer & Notices', icon: Clock },
    { 
      id: 'services' as ActiveTab, 
      label: 'Services', 
      icon: FileText, 
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : undefined 
    },
    { 
      id: 'geo-map' as ActiveTab, 
      label: 'Geo Map', 
      icon: Compass 
    },
    { 
      id: 'madrassa' as ActiveTab, 
      label: 'Madrasa', 
      icon: GraduationCap 
    },
    ...(currentUser?.role === 'resident' ? [
      {
        id: 'contact-us' as ActiveTab,
        label: 'Helpdesk',
        icon: PhoneCall
      }
    ] : [])
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-40 shadow-xs print:hidden transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[4.25rem] gap-2 lg:gap-4">
          
          {/* Left: Mobile Nav Toggle on Left + Brand Logo & Mahallu Identity */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Navigation Toggle */}
            {currentUser && (
              <button
                id="mobile-nav-toggle"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {/* Brand Logo & Title */}
            <button 
              id="brand-logo-btn"
              onClick={() => onTabChange('dashboard')} 
              className="flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer group select-none py-1"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-slate-50 border border-emerald-200/80 shadow-2xs flex items-center justify-center group-hover:scale-105 group-hover:border-emerald-400/80 group-hover:shadow-xs transition-all duration-200 p-1 shrink-0">
                <MahalluLogo className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900 text-sm sm:text-base lg:text-[17px] tracking-tight leading-none group-hover:text-emerald-950 transition-colors">
                    Edappal Mahallu
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300/60 rounded-full">
                    Portal
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate max-w-[180px] sm:max-w-none">
                    Central Jama'ath
                  </span>
                  <span className="hidden md:inline text-slate-300">•</span>
                  <span className="hidden md:inline text-[10px] text-emerald-700 font-mono font-medium">
                    Waqf KL/142
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Central Navigation Dock - High aesthetic pill container */}
          {currentUser && (
            <nav className="hidden lg:flex items-center justify-center flex-1 max-w-2xl xl:max-w-3xl px-2">
              <div className="bg-slate-100/90 hover:bg-slate-100 border border-slate-200/80 p-1 rounded-2xl flex items-center gap-0.5 xl:gap-1 shadow-2xs transition-all">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-tab-${item.id}`}
                      onClick={() => onTabChange(item.id)}
                      className={`relative flex items-center gap-1.5 px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-white text-emerald-950 shadow-xs font-bold border border-emerald-200/80 scale-[1.01]'
                          : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 xl:w-4 xl:h-4 transition-colors ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black leading-tight animate-pulse ${
                          isActive 
                            ? 'bg-emerald-800 text-white' 
                            : 'bg-rose-500 text-white'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>
          )}

          {/* User Profile & Actions Right Section */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Desktop Waqf / Live indicator pill (hidden on small laptops, visible on xl) */}
            {currentUser && (
              <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50/80 border border-emerald-200/70 rounded-full text-[11px] text-emerald-800 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Edappal Live</span>
              </div>
            )}

            {/* Notification Center */}
            {currentUser && (
              <NotificationCenter
                notices={notices}
                events={events}
                currentUser={currentUser}
                onNavigateTab={(tab) => onTabChange(tab)}
                onAddNotice={onAddNotice}
                onUpdateRsvp={onUpdateRsvp}
              />
            )}

            {/* User Profile & Persona Switcher */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 p-1 sm:p-1.5 pr-2 sm:pr-3 rounded-2xl border transition-all cursor-pointer select-none ${
                    userDropdownOpen
                      ? 'border-emerald-500/80 bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200/90 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300 shadow-2xs'
                  }`}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="relative">
                    <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl bg-gradient-to-tr from-emerald-900 to-emerald-700 text-white font-bold flex items-center justify-center text-xs shadow-2xs border border-emerald-600/40 shrink-0">
                      {currentUser.name.charAt(0)}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>

                  <div className="hidden sm:block text-left max-w-[130px] lg:max-w-[150px]">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate">
                      {currentUser.name.split(' ')[0]} {currentUser.name.split(' ')[1] || ''}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {currentUser.role === 'admin' ? (
                        <span className="inline-flex items-center text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded leading-tight">
                          <Shield className="w-2.5 h-2.5 mr-0.5" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-semibold text-blue-800 bg-blue-100/80 px-1.5 py-0.2 rounded leading-tight">
                          <UserCheck className="w-2.5 h-2.5 mr-0.5" /> #{currentUser.houseNo || 'Res'}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180 text-emerald-700' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    id="user-dropdown-menu"
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100"
                  >
                    {/* Header Info */}
                    <div className="px-4 py-3 bg-gradient-to-b from-slate-50/80 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white font-bold flex items-center justify-center text-sm shadow-2xs border border-emerald-700 shrink-0">
                          {currentUser.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {currentUser.role === 'admin' ? (
                              <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                Super Administrator
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                                Resident • House #{currentUser.houseNo}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {currentUser.designation && (
                        <p className="text-[10px] text-slate-500 font-medium mt-2 bg-white p-1.5 rounded-lg border border-slate-200/60">
                          Role: <strong className="text-slate-800">{currentUser.designation}</strong>
                        </p>
                      )}
                    </div>

                    {/* Quick Shortcuts */}
                    <div className="p-1.5 space-y-0.5">
                      <button
                        id="user-menu-overview-btn"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onTabChange('dashboard');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl text-left transition-colors cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                        <span>Mahallu Dashboard Overview</span>
                      </button>

                      {currentUser.role === 'resident' && (
                        <button
                          id="user-menu-helpdesk-btn"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onTabChange('contact-us');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl text-left transition-colors cursor-pointer"
                        >
                          <PhoneCall className="w-4 h-4 text-blue-600" />
                          <span>Contact Committee & Helpdesk</span>
                        </button>
                      )}

                      <button
                        id="switch-persona-btn"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenLoginModal();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-xl text-left transition-colors cursor-pointer"
                      >
                        <Users className="w-4 h-4 text-slate-500" />
                        <span>Switch Persona / Sign In</span>
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="p-1.5">
                      <button
                        id="logout-btn"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl text-left transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out of Portal</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-sign-in-btn"
                onClick={onOpenLoginModal}
                className="px-4 py-2 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Nav Left-Side Drawer Popup */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            id="mobile-nav-backdrop"
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Left-side Drawer Panel that slides in from the left */}
          <div 
            id="mobile-nav-menu"
            className="relative w-[300px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250 ease-out border-r border-slate-200"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-0.5 shadow-2xs flex items-center justify-center">
                  <MahalluLogo className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-900 text-sm">Edappal Mahallu</span>
                    <span className="text-[9px] font-semibold px-1 py-0.2 bg-emerald-100 text-emerald-800 rounded">Portal</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Navigation Menu</p>
                </div>
              </div>

              <button
                id="close-mobile-nav-btn"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current User Info Card */}
            {currentUser && (
              <div className="p-3 mx-3 mt-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white font-bold flex items-center justify-center text-sm shadow-2xs border border-emerald-700 shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-emerald-800 font-semibold truncate">
                      {currentUser.role === 'admin' ? 'Super Admin' : `Resident • House #${currentUser.houseNo}`}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Tabs List */}
            <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Menu Navigation</p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-tab-${item.id}`}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-700 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white text-emerald-800' : 'bg-rose-500 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Account Actions */}
            {currentUser && (
              <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-1">
                <button
                  id="mobile-switch-account-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLoginModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Switch Account</span>
                </button>
                <button
                  id="mobile-logout-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
