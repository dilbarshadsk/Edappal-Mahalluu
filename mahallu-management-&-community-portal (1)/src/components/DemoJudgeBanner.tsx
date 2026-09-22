import React from 'react';
import { User } from '../types';
import { Shield, UserCheck, Sparkles, LogIn, Check } from 'lucide-react';

interface DemoJudgeBannerProps {
  currentUser: User | null;
  onSelectRole: (role: 'admin' | 'resident') => void;
  onOpenLoginModal: () => void;
}

export const DemoJudgeBanner: React.FC<DemoJudgeBannerProps> = ({
  currentUser,
  onSelectRole,
  onOpenLoginModal
}) => {
  return (
    <div id="judge-demo-banner" className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white border-b border-emerald-700/50 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Judge Callout */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-semibold uppercase tracking-wider text-[10px]">
            <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Judge & Reviewer Quick Switcher</span>
          </div>
          <span className="hidden sm:inline text-slate-300 text-[11px]">
            Test both committee governance & resident self-service instantly:
          </span>
        </div>

        {/* Right: Quick 1-Click Role Switchers */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Super Admin Switch */}
          <button
            id="judge-admin-switch-btn"
            onClick={() => onSelectRole('admin')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              currentUser?.role === 'admin'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs ring-2 ring-emerald-300/60'
                : 'bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Super Admin</span>
            {currentUser?.role === 'admin' && (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 ml-0.5"></span>
            )}
          </button>

          {/* Resident Switch */}
          <button
            id="judge-resident-switch-btn"
            onClick={() => onSelectRole('resident')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              currentUser?.role === 'resident'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs ring-2 ring-emerald-300/60'
                : 'bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Resident / Family Head</span>
            {currentUser?.role === 'resident' && (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 ml-0.5"></span>
            )}
          </button>

          {/* Login Dialog view */}
          <button
            id="judge-login-page-btn"
            onClick={onOpenLoginModal}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border border-transparent hover:border-slate-700"
          >
            <LogIn className="w-3 h-3 text-slate-400" />
            <span>Login Page</span>
          </button>
        </div>

      </div>
    </div>
  );
};
