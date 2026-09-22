import React, { useState } from 'react';
import { 
  User, 
  ActiveTab, 
  FamilyRecord, 
  DuesRecord, 
  DonationCampaign, 
  PrayerSchedule, 
  NoticeItem, 
  ServiceRequest,
  CommunityEvent,
  CommitteeOfficial
} from '../types';
import { INITIAL_COMMITTEE_OFFICIALS } from '../data/mockData';
import { 
  Users, 
  Wallet, 
  FileText, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  Building2, 
  HeartHandshake, 
  Calendar, 
  ShieldCheck, 
  Eye, 
  FileCheck, 
  CreditCard,
  MapPin,
  UserCheck,
  ChevronRight,
  Compass,
  PhoneCall,
  Phone,
  Mail,
  MessageSquare,
  GraduationCap,
  Sparkles,
  TrendingUp,
  PlusCircle,
  Bell,
  Moon,
  Search,
  X,
  ExternalLink
} from 'lucide-react';

interface DashboardOverviewProps {
  currentUser: User;
  onTabChange: (tab: ActiveTab, subTab?: 'payments' | 'donations') => void;
  families: FamilyRecord[];
  dues: DuesRecord[];
  campaigns: DonationCampaign[];
  prayerSchedule: PrayerSchedule;
  notices: NoticeItem[];
  requests: ServiceRequest[];
  events: CommunityEvent[];
  onOpenReceipt: (record: DuesRecord) => void;
  onOpenCertificate: (request: ServiceRequest) => void;
  onOpenAddFamilyModal?: () => void;
  onOpenNoticeModal?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentUser,
  onTabChange,
  families,
  dues,
  campaigns,
  prayerSchedule,
  notices,
  requests,
  events,
  onOpenReceipt,
  onOpenCertificate,
  onOpenAddFamilyModal,
  onOpenNoticeModal
}) => {
  // Calculations
  const totalHouseholds = families.length;
  const totalResidents = families.reduce((acc, fam) => acc + fam.members.length, 0);
  
  const paidDuesCount = dues.filter(d => d.status === 'Paid').length;
  const pendingDuesCount = dues.filter(d => d.status === 'Pending' || d.status === 'Overdue').length;
  const totalDuesAmount = dues.reduce((acc, d) => acc + d.amount, 0);
  const collectedDuesAmount = dues.filter(d => d.status === 'Paid').reduce((acc, d) => acc + d.amount, 0);
  const duesCollectionRate = totalDuesAmount > 0 ? Math.round((collectedDuesAmount / totalDuesAmount) * 100) : 0;

  const totalDonationsRaised = campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
  const totalDonationsTarget = campaigns.reduce((acc, c) => acc + c.targetAmount, 0);

  const pendingRequests = requests.filter(r => r.status === 'Pending' || r.status === 'In Review');

  // Resident specific data
  const residentFamily = families.find(f => f.houseNo === currentUser.houseNo || f.id === currentUser.familyId) || families[0];
  const residentDues = dues.filter(d => 
    d.houseNo === (currentUser.houseNo || residentFamily?.houseNo) || 
    d.familyId === (currentUser.familyId || residentFamily?.id)
  );
  const pendingResidentDues = residentDues.filter(d => d.status === 'Pending' || d.status === 'Overdue');
  const paidResidentDues = residentDues.filter(d => d.status === 'Paid');
  const totalPendingDuesAmount = pendingResidentDues.reduce((sum, d) => sum + d.amount, 0);
  const latestPaidDue = paidResidentDues[0];

  const residentRequests = requests.filter(r => 
    (currentUser.houseNo && r.houseNo === currentUser.houseNo) || 
    (residentFamily?.houseNo && r.houseNo === residentFamily.houseNo) ||
    (currentUser.phone && r.phone === currentUser.phone)
  );

  // Committee directory state
  const [isCommitteeModalOpen, setIsCommitteeModalOpen] = useState(false);
  const [committeeFilter, setCommitteeFilter] = useState<'all' | 'exec' | 'wards'>('all');
  const [committeeSearch, setCommitteeSearch] = useState('');

  const filteredOfficials = INITIAL_COMMITTEE_OFFICIALS.filter(off => {
    const matchesSearch = 
      off.name.toLowerCase().includes(committeeSearch.toLowerCase()) ||
      off.designation.toLowerCase().includes(committeeSearch.toLowerCase()) ||
      (off.wardAssigned && off.wardAssigned.toLowerCase().includes(committeeSearch.toLowerCase())) ||
      off.phone.includes(committeeSearch);
    
    if (committeeFilter === 'exec') {
      return matchesSearch && !off.wardAssigned;
    }
    if (committeeFilter === 'wards') {
      return matchesSearch && !!off.wardAssigned;
    }
    return matchesSearch;
  });
  const pendingResidentRequests = residentRequests.filter(r => r.status === 'Pending' || r.status === 'In Review');
  const approvedResidentCertificates = residentRequests.filter(r => r.status === 'Approved' && r.approvedCertificateData);

  return (
    <div id="dashboard-overview" className="space-y-8">
      {/* Top Welcome / Persona Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
          <Building2 className="w-64 h-64 text-white -mr-16" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-700/70 border border-emerald-400/30 text-emerald-100 text-xs font-semibold backdrop-blur-xs shadow-xs">
            <div className="flex items-center gap-1.5 text-emerald-200">
              <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30" />
              <span className="font-bold text-white tracking-wide">{prayerSchedule.hijriDate}</span>
            </div>
            <span className="text-emerald-400/60">•</span>
            <span className="text-emerald-200 font-medium">Edappal Central Mahallu</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {currentUser.role === 'admin' ? (
              <span>Mahallu Administrative Control Center</span>
            ) : (
              <span>Assalamu Alaikum, {currentUser.name}</span>
            )}
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            {currentUser.role === 'admin' ? (
              <span className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs sm:text-sm text-emerald-100">
                <span className="font-semibold text-white sm:bg-emerald-800/80 sm:border sm:border-emerald-500/40 sm:px-2.5 sm:py-0.5 sm:rounded-lg">
                  Resident Directory Overview
                </span>
                <span>Total Households: <strong className="text-white">{totalHouseholds} Families</strong></span>
                <span className="text-emerald-400/60">•</span>
                <span>Residents: <strong className="text-white">{totalResidents} Members</strong></span>
                <span className="text-emerald-400/60">•</span>
                <span>Wards: <strong className="text-white">4 Wards</strong></span>
                <span className="text-emerald-400/60">•</span>
                <span>Dues Collected: <strong className="text-white">{duesCollectionRate}%</strong></span>
                <span className="text-emerald-400/60">•</span>
                <span>Petitions: <strong className="text-white">{pendingRequests.length} Pending</strong></span>
              </span>
            ) : (
              <span className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs sm:text-sm text-emerald-100">
                <span className="font-bold text-white sm:bg-emerald-800/80 sm:border sm:border-emerald-500/40 sm:px-2.5 sm:py-0.5 sm:rounded-lg sm:shadow-2xs">
                  House #{currentUser.houseNo || residentFamily?.houseNo || 'M-14'}
                </span>
                <span className="font-semibold text-white">{residentFamily?.houseName || 'Baitul Noor'}</span>
                <span className="text-emerald-400/60">•</span>
                <span>{currentUser.ward || residentFamily?.ward || 'Ward 2 - Madina Colony'}</span>
                <span className="text-emerald-400/60">•</span>
                <span>Head: <strong className="text-white">{residentFamily?.headOfFamily || currentUser.name}</strong></span>
                <span className="text-emerald-400/60">•</span>
                <span>{residentFamily?.members?.length || 4} Members</span>
                <span className="text-emerald-400/60">•</span>
                <span>Payment: <strong className="text-white">₹{residentFamily?.monthlyChandaAmount || 500}/mo</strong></span>
                <span className="text-emerald-400/60">•</span>
                <span className={`font-semibold text-xs sm:px-2 sm:py-0.5 sm:rounded-md ${
                  totalPendingDuesAmount > 0 
                    ? 'text-amber-200 sm:bg-amber-500/20 sm:border sm:border-amber-400/30' 
                    : 'text-emerald-200 sm:bg-emerald-500/20 sm:border sm:border-emerald-400/30'
                }`}>
                  {totalPendingDuesAmount > 0 ? `₹${totalPendingDuesAmount} Dues Pending` : 'All Dues Paid'}
                </span>
                {currentUser.phone && (
                  <>
                    <span className="text-emerald-400/60">•</span>
                    <span className="text-emerald-200 text-xs">Phone: {currentUser.phone}</span>
                  </>
                )}
              </span>
            )}
          </p>

          {/* Persona Mode Switch & Fast Actions */}
          <div id="header-action-buttons" className="pt-2 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full">
            {currentUser.role === 'admin' ? (
              <>
                <button
                  onClick={() => onTabChange('directory')}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center sm:justify-start gap-1.5 shadow-md cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Census Directory</span>
                </button>
                <button
                  onClick={() => onTabChange('financials')}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-emerald-800/80 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center sm:justify-start gap-1.5 border border-emerald-600/40 cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Financial Accounts</span>
                </button>
                <button
                  onClick={() => onTabChange('services')}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-emerald-800/80 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center sm:justify-start gap-1.5 border border-emerald-600/40 cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Pending Petitions ({pendingRequests.length})</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onTabChange('financials')}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center sm:justify-start gap-1.5 shadow-md cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Pay Monthly Dues</span>
                </button>
                <button
                  onClick={() => onTabChange('services')}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-emerald-800/80 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center sm:justify-start gap-1.5 border border-emerald-600/40 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Request Certificate / NOC</span>
                </button>
                <button
                  onClick={() => onTabChange('prayer-notices')}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-emerald-800/80 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center sm:justify-start gap-1.5 border border-emerald-600/40 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Prayer Schedule</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ADMIN STATS CARDS GRID */}
      {currentUser.role === 'admin' && (
        <div id="admin-kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Households */}
          <div 
            onClick={() => onTabChange('directory')}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Households</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">{totalHouseholds} Families</div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span>{totalResidents} Total Residents</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  Explore <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Dues Collection */}
          <div 
            id="admin-kpi-dues-collection"
            onClick={() => onTabChange('financials', 'payments')}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dues Collection</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">{duesCollectionRate}% Collected</div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span>₹{(collectedDuesAmount / 1000).toFixed(1)}k / ₹{(totalDuesAmount / 1000).toFixed(1)}k</span>
                <span className="text-blue-700 font-semibold flex items-center gap-0.5">
                  Ledger <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Waqf & Relief Funds */}
          <div 
            id="admin-kpi-waqf-relief"
            onClick={() => onTabChange('financials', 'donations')}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Waqf & Relief</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HeartHandshake className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">₹{(totalDonationsRaised / 100000).toFixed(2)}L</div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span>{campaigns.length} Active Campaigns</span>
                <span className="text-purple-700 font-semibold flex items-center gap-0.5">
                  Campaigns <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Pending Service Inquiries */}
          <div 
            onClick={() => onTabChange('services')}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service Inquiries</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">{pendingRequests.length} Pending</div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span>NOC & Marriage Aid</span>
                <span className="text-amber-700 font-semibold flex items-center gap-0.5">
                  Review <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRIMARY MODULE TABS & QUICK ACCESS SHORTCUTS */}
      {currentUser.role === 'admin' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Prayer Schedule */}
          <button
            id="tab-prayer-schedule"
            onClick={() => onTabChange('prayer-notices')}
            className="p-4 bg-white hover:bg-amber-50/50 border border-slate-200/90 hover:border-amber-300 rounded-2xl flex items-center shadow-2xs hover:shadow-md transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">Prayer Schedule</h4>
                <p className="text-xs text-slate-500">Daily Azan, Iqamah & alerts</p>
              </div>
            </div>
          </button>

          {/* 2. Geo Map */}
          <div 
            id="shortcut-geo-map"
            onClick={() => onTabChange('geo-map')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3.5 shadow-2xs transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Mahallu Geo Map</h4>
              <p className="text-xs text-slate-500">Ward boundaries & landmarks</p>
            </div>
          </div>

          {/* 3. Madrasa */}
          <div 
            id="shortcut-madrasa"
            onClick={() => onTabChange('madrassa')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3.5 shadow-2xs transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Madrasa Management</h4>
              <p className="text-xs text-slate-500">Attendance & student marks</p>
            </div>
          </div>

          {/* 4. Notices & Events */}
          <div 
            id="shortcut-notices-events"
            onClick={() => onTabChange('prayer-notices')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3.5 shadow-2xs transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Notices & Events</h4>
              <p className="text-xs text-slate-500">Alerts, circulars & programs</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Core Management Tabs (Financial, Family, Service, Prayer Schedule) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Family Directory Tab */}
            <button
              id="tab-family-directory"
              onClick={() => onTabChange('directory')}
              className="p-4 bg-white hover:bg-emerald-50/50 border border-slate-200/90 hover:border-emerald-300 rounded-2xl flex items-center shadow-2xs hover:shadow-md transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">Family Directory</h4>
                  <p className="text-xs text-slate-500">Census & household profiles</p>
                </div>
              </div>
            </button>

            {/* Financials Tab */}
            <button
              id="tab-financial-accounts"
              onClick={() => onTabChange('financials')}
              className="p-4 bg-white hover:bg-blue-50/50 border border-slate-200/90 hover:border-blue-300 rounded-2xl flex items-center shadow-2xs hover:shadow-md transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-800 transition-colors">Financial Accounts</h4>
                  <p className="text-xs text-slate-500">Payments, Waqf & donations</p>
                </div>
              </div>
            </button>

            {/* Services Tab */}
            <button
              id="tab-services-petitions"
              onClick={() => onTabChange('services')}
              className="p-4 bg-white hover:bg-purple-50/50 border border-slate-200/90 hover:border-purple-300 rounded-2xl flex items-center shadow-2xs hover:shadow-md transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-800 transition-colors">Services & NOC</h4>
                  <p className="text-xs text-slate-500">Petitions & marriage letters</p>
                </div>
              </div>
            </button>

            {/* Prayer Schedule Tab */}
            <button
              id="tab-prayer-schedule"
              onClick={() => onTabChange('prayer-notices')}
              className="p-4 bg-white hover:bg-amber-50/50 border border-slate-200/90 hover:border-amber-300 rounded-2xl flex items-center shadow-2xs hover:shadow-md transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">Prayer Schedule</h4>
                  <p className="text-xs text-slate-500">Daily Azan, Iqamah & alerts</p>
                </div>
              </div>
            </button>
          </div>

          {/* 4 Community Quick Shortcuts Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Geo Map */}
            <div 
              id="shortcut-geo-map"
              onClick={() => onTabChange('geo-map')}
              className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3.5 shadow-2xs transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Mahallu Geo Map</h4>
                <p className="text-xs text-slate-500">Ward boundaries & landmarks</p>
              </div>
            </div>

            {/* 2. Contact Us */}
            <div 
              id="shortcut-contact-us"
              onClick={() => onTabChange('contact-us')}
              className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3.5 shadow-2xs transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Contact Us</h4>
                <p className="text-xs text-slate-500">Helpline, office & committee</p>
              </div>
            </div>

            {/* 3. Madrasa */}
            <div 
              id="shortcut-madrasa"
              onClick={() => onTabChange('madrassa')}
              className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3.5 shadow-2xs transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Madrasa Management</h4>
                <p className="text-xs text-slate-500">Attendance & student marks</p>
              </div>
            </div>

            {/* 4. Notices & Events */}
            <div 
              id="shortcut-notices-events"
              onClick={() => onTabChange('prayer-notices')}
              className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3.5 shadow-2xs transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Notices & Events</h4>
                <p className="text-xs text-slate-500">Alerts, circulars & programs</p>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* 5. Bottom Section: Mahallu Jama'ath Committee Directory */}
        <div id="dashboard-committee-section" className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Mahallu Jama'ath Committee
              </h3>
            </div>
          </div>

          {/* Quick Roster Grid Preview (Top 4 Executive & Key Ward Officials) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {INITIAL_COMMITTEE_OFFICIALS.slice(0, 4).map((official) => {
              const isExec = !official.wardAssigned;
              return (
                <div
                  key={official.id}
                  className="bg-slate-50/80 hover:bg-emerald-50/40 border border-slate-200/90 hover:border-emerald-300 rounded-2xl p-4 transition-all flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center font-bold text-sm text-emerald-800 shadow-2xs group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                        {official.name.split(' ').filter(n => !['Janab', 'Haji', 'Usthad', 'P.', 'K.', 'V.', 'M.', 'T.'].includes(n))[0]?.[0] || 'M'}
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        isExec 
                          ? 'bg-emerald-100/70 text-emerald-900 border-emerald-200' 
                          : 'bg-blue-100/70 text-blue-900 border-blue-200'
                      }`}>
                        {official.designation.split('(')[0].trim()}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 transition-colors line-clamp-1">
                        {official.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                        {official.roleDescription}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono text-[11px] text-slate-600 font-semibold">{official.phone}</span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${official.phone.replace(/\s+/g, '')}`}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-emerald-50 text-emerald-700 rounded-lg transition-colors shadow-2xs"
                        title="Call Official"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://wa.me/${official.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors shadow-2xs"
                        title="WhatsApp Official"
                      >
                        WA
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Footer banner with expand button */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Looking for your Ward Member or the Chief Imam? View full contacts & office hours.
              </span>
            </div>
            <button
              onClick={() => setIsCommitteeModalOpen(true)}
              className="font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Explore All {INITIAL_COMMITTEE_OFFICIALS.length} Members & Ward Desks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      {/* Full Committee Members Directory Modal */}
      {isCommitteeModalOpen && (
        <div id="all-committee-members-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 text-white flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
                    Official Directory
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    Jama'ath Executive & Ward Committee
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  Mahallu Jama'ath Committee Members
                </h3>
                <p className="text-xs text-slate-300">
                  Connect with executive leadership, the Chief Imam, and your Ward Member for inquiries, pastoral care, and community assistance.
                </p>
              </div>

              <button
                onClick={() => setIsCommitteeModalOpen(false)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, designation, ward, or phone number..."
                  value={committeeSearch}
                  onChange={(e) => setCommitteeSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-slate-500 mr-1">Filter:</span>
                <button
                  onClick={() => setCommitteeFilter('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    committeeFilter === 'all'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All ({INITIAL_COMMITTEE_OFFICIALS.length})
                </button>
                <button
                  onClick={() => setCommitteeFilter('exec')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    committeeFilter === 'exec'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Executive & Spiritual (4)
                </button>
                <button
                  onClick={() => setCommitteeFilter('wards')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    committeeFilter === 'wards'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Ward Members (4)
                </button>
              </div>
            </div>

            {/* Scrollable Members Cards */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {filteredOfficials.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
                  <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No committee members match your search</h4>
                  <p className="text-xs text-slate-500 mt-1">Try clearing the search text or selecting a different filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredOfficials.map((official) => {
                    const isWard = !!official.wardAssigned;
                    return (
                      <div
                        key={official.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-base shadow-2xs">
                                {official.name.split(' ').filter(n => !['Janab', 'Haji', 'Usthad', 'P.', 'K.', 'V.', 'M.', 'T.'].includes(n))[0]?.[0] || 'M'}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 leading-snug">{official.name}</h4>
                                <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                                  isWard
                                    ? 'bg-blue-50 text-blue-900 border-blue-200'
                                    : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                }`}>
                                  {official.designation}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                            {official.roleDescription}
                          </p>

                          <div className="space-y-1.5 text-xs text-slate-600">
                            {official.wardAssigned && (
                              <div className="flex items-center justify-between text-slate-700 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                                <span className="text-slate-500 font-medium">Assigned Ward:</span>
                                <span className="font-bold text-blue-900">{official.wardAssigned}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium">Office / Availability:</span>
                              <span className="font-medium text-slate-800 text-right max-w-[200px]">{official.availability}</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium">Email:</span>
                              <span className="font-mono text-slate-700">{official.email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800">{official.phone}</span>

                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${official.phone.replace(/\s+/g, '')}`}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5 text-slate-600" />
                              <span>Call</span>
                            </a>

                            <a
                              href={`https://wa.me/${official.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                            >
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Edappal Central Mahallu Jama'ath Secretariat & Helpdesk
              </span>
              <button
                onClick={() => setIsCommitteeModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
