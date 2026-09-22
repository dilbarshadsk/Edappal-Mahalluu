import React, { useState, useEffect } from 'react';
import { ResidentChandaView } from './ResidentChandaView';
import { 
  DuesRecord, 
  DonationCampaign, 
  DonationContribution, 
  Role, 
  User, 
  DuesStatus,
  FamilyRecord
} from '../types';
import { 
  Wallet, 
  HeartHandshake, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Printer, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Plus, 
  CreditCard, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  X,
  QrCode,
  FileCheck,
  FileSpreadsheet,
  Download,
  Lock,
  Building,
  Smartphone,
  Check,
  Loader2,
  ChevronRight,
  Shield,
  TrendingUp,
  Target,
  Users
} from 'lucide-react';

interface FinancialsViewProps {
  families?: FamilyRecord[];
  dues: DuesRecord[];
  campaigns: DonationCampaign[];
  currentUser: User;
  onOpenReceipt: (record: DuesRecord) => void;
  onMarkDuePaid: (dueId: string, method: string) => void;
  onContributeDonation: (campaignId: string, contribution: DonationContribution) => void;
  onToggleDueStatus?: (dueId: string) => void;
  initialSubTab?: 'payments' | 'donations';
}

export const FinancialsView: React.FC<FinancialsViewProps> = ({
  families,
  dues,
  campaigns,
  currentUser,
  onOpenReceipt,
  onMarkDuePaid,
  onContributeDonation,
  onToggleDueStatus,
  initialSubTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'payments' | 'donations'>(initialSubTab || 'payments');

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [wardFilter, setWardFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Donation Modal State
  const [selectedCampaign, setSelectedCampaign] = useState<DonationCampaign | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(1000);
  const [donorName, setDonorName] = useState(currentUser.name);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donationSuccessMsg, setDonationSuccessMsg] = useState(false);

  // Pay Dues Modal for Resident / Online Gateway Simulation
  const [payingDue, setPayingDue] = useState<DuesRecord | null>(null);
  const [paymentMethodTab, setPaymentMethodTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');
  const [processingStep, setProcessingStep] = useState<number>(1);
  const [upiId, setUpiId] = useState('mansoor@okhdfcbank');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [cardNumber, setCardNumber] = useState('4532 8821 9012 3456');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('742');
  const [cardName, setCardName] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [selectedBank, setSelectedBank] = useState('sbi');
  const [completedTxnId, setCompletedTxnId] = useState('');

  // Handle start paying
  const handleOpenPayModal = (due: DuesRecord) => {
    setPayingDue(due);
    setPaymentMethodTab('upi');
    setPaymentStep('form');
    setProcessingStep(1);
    setUpiId('mansoor@okhdfcbank');
    setSelectedUpiApp('gpay');
    setCardNumber('4532 8821 9012 3456');
    setCardExpiry('08/28');
    setCardCvv('742');
    setCardName(due.headOfFamily || currentUser.name);
    setSelectedBank('sbi');
    setCompletedTxnId('');
  };

  // Execute payment gateway simulation
  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingDue) return;

    setPaymentStep('processing');
    setProcessingStep(1);

    setTimeout(() => {
      setProcessingStep(2);
    }, 600);

    setTimeout(() => {
      setProcessingStep(3);
    }, 1200);

    setTimeout(() => {
      const methodLabel = 
        paymentMethodTab === 'upi' ? `Online UPI (${selectedUpiApp.toUpperCase()})` :
        paymentMethodTab === 'card' ? `Debit/Credit Card (••${cardNumber.replace(/\s+/g, '').slice(-4)})` :
        `Net Banking (${selectedBank.toUpperCase()})`;

      const txnId = `TXN-MHL-${Math.floor(100000 + Math.random() * 900000)}`;
      setCompletedTxnId(txnId);
      setPaymentStep('success');

      onMarkDuePaid(payingDue.id, methodLabel);
    }, 1800);
  };

  // Filtered Dues Logic
  const filteredDues = dues.filter(item => {
    const matchesSearch = 
      !searchQuery || 
      item.headOfFamily.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.houseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.houseName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesWard = wardFilter === 'All' || item.ward === wardFilter;

    return matchesSearch && matchesStatus && matchesWard;
  });

  // Active monthly billing cycle metrics
  const currentMonth = dues[0]?.month || 'September';
  const currentYear = dues[0]?.year || 2026;

  // Filter dues specifically for the active current month
  const currentMonthDues = dues.filter(d => 
    (!d.month || d.month.toLowerCase() === currentMonth.toLowerCase()) &&
    (!d.year || d.year === currentYear)
  );

  // Total collected amount for the current month
  const currentMonthCollected = currentMonthDues
    .filter(d => d.status === 'Paid')
    .reduce((acc, d) => acc + d.amount, 0);

  // Total expected monthly dues for all residents
  // Assessed dues for the current month across all resident households (or from registered families)
  const totalExpectedMonthlyDues = currentMonthDues.length > 0
    ? currentMonthDues.reduce((acc, d) => acc + d.amount, 0)
    : (families?.reduce((acc, f) => acc + (f.monthlyChandaAmount || 0), 0) || 0);

  const totalResidentsCount = currentMonthDues.length || families?.length || 12;
  const currentMonthPaidCount = currentMonthDues.filter(d => d.status === 'Paid').length;
  const currentMonthPendingCount = currentMonthDues.filter(d => d.status === 'Pending').length;
  const currentMonthOverdueCount = currentMonthDues.filter(d => d.status === 'Overdue').length;
  const currentMonthUnpaidCount = currentMonthPendingCount + currentMonthOverdueCount;
  const currentMonthShortfall = Math.max(0, totalExpectedMonthlyDues - currentMonthCollected);
  const currentMonthCollectionPercentage = totalExpectedMonthlyDues > 0
    ? Math.round((currentMonthCollected / totalExpectedMonthlyDues) * 100)
    : 0;

  // Calculate overall ledger stats
  const totalAmountDue = dues.reduce((acc, d) => acc + d.amount, 0);
  const totalCollected = dues.filter(d => d.status === 'Paid').reduce((acc, d) => acc + d.amount, 0);
  const totalPending = totalAmountDue - totalCollected;
  const paidCount = dues.filter(d => d.status === 'Paid').length;
  const pendingCount = dues.filter(d => d.status === 'Pending').length;
  const overdueCount = dues.filter(d => d.status === 'Overdue').length;

  // Export Dues to CSV format for archival & audits
  const handleExportCSV = () => {
    const headers = [
      'House Number',
      'Head of Family',
      'House Name',
      'Ward',
      'Subscription Month',
      'Subscription Year',
      'Amount (INR)',
      'Payment Status',
      'Payment Date',
      'Payment Method',
      'Receipt Number',
      'Recorded By'
    ];

    const rows = filteredDues.map(d => [
      `"${d.houseNo.replace(/"/g, '""')}"`,
      `"${d.headOfFamily.replace(/"/g, '""')}"`,
      `"${d.houseName.replace(/"/g, '""')}"`,
      `"${d.ward.replace(/"/g, '""')}"`,
      `"${d.month}"`,
      `"${d.year}"`,
      d.amount,
      `"${d.status}"`,
      `"${d.paidDate || 'N/A'}"`,
      `"${d.paymentMethod || 'N/A'}"`,
      `"${d.receiptNumber || 'N/A'}"`,
      `"${d.recordedBy || 'N/A'}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedMonth = 'September_2026';
    link.setAttribute('download', `mahallu_payment_dues_${sanitizedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle donation submission
  const handleSubmitDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || donationAmount <= 0) return;

    const contribution: DonationContribution = {
      id: `d-${Date.now()}`,
      campaignId: selectedCampaign.id,
      donorName: isAnonymous ? 'Well-Wisher' : (donorName || currentUser.name),
      houseNo: currentUser.houseNo,
      amount: Number(donationAmount),
      date: '2026-09-21',
      anonymous: isAnonymous,
      transactionId: `TXN-${Math.floor(10000 + Math.random() * 90000)}`
    };

    onContributeDonation(selectedCampaign.id, contribution);
    setDonationSuccessMsg(true);
    setTimeout(() => {
      setDonationSuccessMsg(false);
      setSelectedCampaign(null);
    }, 1200);
  };

  return (
    <div id="financials-module" className="space-y-6">
      
      {/* Module Title and Navigation Tabs */}
      {currentUser.role !== 'resident' ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Community Treasury & Financials
              </h2>
              <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                September 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Transparent collection of monthly Mahallu subscription dues and community welfare funds.
            </p>
          </div>

          {/* Sub-Tabs: Payments vs Donations */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              id="tab-payment-tracker"
              onClick={() => setActiveSubTab('payments')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'payments'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>
                Monthly Payments ({paidCount}/${dues.length})
              </span>
            </button>

            <button
              id="tab-donation-campaigns"
              onClick={() => setActiveSubTab('donations')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'donations'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Public Donation Campaigns ({campaigns.length})</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between sm:justify-end">
          {/* Sub-Tabs: Payments vs Donations for Resident */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 w-full sm:w-auto">
            <button
              id="tab-payment-tracker"
              onClick={() => setActiveSubTab('payments')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'payments'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>My Monthly Payments</span>
            </button>

            <button
              id="tab-donation-campaigns"
              onClick={() => setActiveSubTab('donations')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'donations'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Public Donation Causes ({campaigns.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* PAYMENTS TRACKER SUBTAB */}
      {activeSubTab === 'payments' && (
        currentUser.role === 'resident' ? (
          <ResidentChandaView
            currentUser={currentUser}
            dues={dues}
            onOpenReceipt={onOpenReceipt}
            onOpenPayModal={handleOpenPayModal}
            onToggleDueStatus={onToggleDueStatus}
            onSwitchToDonations={() => setActiveSubTab('donations')}
          />
        ) : (
          <div className="space-y-6">
          
          {/* Primary Summary Card: Current Month Collected vs Total Expected Monthly Dues for All Residents */}
          <div 
            id="monthly-dues-collection-summary-card" 
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <TrendingUp className="w-5 h-5 text-emerald-100" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Monthly Dues Collection vs. Expected Target
                    </h3>
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200/60">
                      {currentMonth} {currentYear}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                      Active Cycle
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{currentMonthCollectionPercentage}% Collected</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{currentMonthPaidCount} of {totalResidentsCount} Households Paid</span>
                </div>
              </div>
            </div>

            {/* Comparison Body: Total Collected vs Total Expected */}
            <div className="p-5 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                
                {/* Total Collected Amount for Current Month */}
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-900/80 uppercase tracking-wider flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Total Collected Amount (Current Month)</span>
                      </span>
                      <div className="text-3xl font-extrabold text-emerald-800 tracking-tight mt-1.5">
                        ₹{currentMonthCollected.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-200/80 text-emerald-900 rounded-lg shrink-0">
                      Realized Inflow
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-900/90 font-medium">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span><strong>{currentMonthPaidCount} households</strong> paid for {currentMonth}</span>
                    </span>
                    <span className="font-bold text-emerald-800">
                      {currentMonthCollectionPercentage}% of Target
                    </span>
                  </div>
                </div>

                {/* Total Expected Monthly Dues for All Residents */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-slate-500" />
                        <span>Total Expected Monthly Dues (All Residents)</span>
                      </span>
                      <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
                        ₹{totalExpectedMonthlyDues.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg shrink-0">
                      Expected Assessment
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>Assessed across <strong>all {totalResidentsCount} residents</strong></span>
                    </span>
                    <span className="font-semibold text-slate-700">
                      100% Target Baseline
                    </span>
                  </div>
                </div>

              </div>

              {/* Visual Progress Bar: Collected vs Expected */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Target Fulfillment:</span>
                    <span className="text-emerald-800 font-extrabold">{currentMonthCollectionPercentage}%</span>
                    <span className="text-slate-400 font-normal">({currentMonthPaidCount} of {totalResidentsCount} households settled)</span>
                  </span>
                  <span className="font-semibold text-slate-600">
                    Remaining Shortfall: <strong className="text-amber-700">₹{currentMonthShortfall.toLocaleString()}</strong>
                  </span>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, currentMonthCollectionPercentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span className="text-emerald-800 font-semibold">₹{currentMonthCollected.toLocaleString()} Collected to Date</span>
                  <span className="text-slate-600 font-semibold">Target: ₹{totalExpectedMonthlyDues.toLocaleString()} Total Expected</span>
                </div>
              </div>

              {/* 4-Metric Breakdown Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Collection Ratio</div>
                  <div className="text-base font-bold text-emerald-800 mt-0.5">{currentMonthCollectionPercentage}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{currentMonthPaidCount} paid accounts</div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Balance</div>
                  <div className="text-base font-bold text-amber-700 mt-0.5">₹{currentMonthShortfall.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{currentMonthUnpaidCount} unpaid / overdue</div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resident Households</div>
                  <div className="text-base font-bold text-slate-800 mt-0.5">{totalResidentsCount} Families</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Across 4 Mahallu Wards</div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Expected Due</div>
                  <div className="text-base font-bold text-slate-800 mt-0.5">
                    ₹{totalResidentsCount > 0 ? Math.round(totalExpectedMonthlyDues / totalResidentsCount) : 0}/mo
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Per household avg</div>
                </div>
              </div>

            </div>
          </div>

          {/* Treasury Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Collected</span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">₹{totalCollected.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">
                <span className="font-semibold text-emerald-800">{paidCount} households</span> paid this month
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Dues</span>
              <div className="text-2xl font-bold text-amber-600 mt-1">₹{totalPending.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">
                <span className="font-semibold text-amber-700">{pendingCount} pending</span> • {overdueCount} overdue
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collection Ratio</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {Math.round((totalCollected / totalAmountDue) * 100)}%
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full" 
                  style={{ width: `${Math.round((totalCollected / totalAmountDue) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              
              {/* Search */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="dues-search-input"
                  type="text"
                  placeholder="Search household or house #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                />
              </div>

              {/* Status Filter */}
              <select
                id="dues-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 font-medium text-slate-700"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid Only</option>
                <option value="Pending">Pending Only</option>
                <option value="Overdue">Overdue Only</option>
              </select>

              {/* Ward Filter */}
              <select
                id="dues-ward-filter"
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 font-medium text-slate-700"
              >
                <option value="All">All Wards</option>
                <option value="Ward 1 - Bilal Nagar">Ward 1 - Bilal Nagar</option>
                <option value="Ward 2 - Madina Colony">Ward 2 - Madina Colony</option>
                <option value="Ward 3 - Edappal Town">Ward 3 - Edappal Town</option>
                <option value="Ward 4 - Quba Junction">Ward 4 - Quba Junction</option>
              </select>

            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 hidden sm:inline">
                Showing {filteredDues.length} household records
              </span>

              {currentUser.role === 'admin' && (
                <button
                  id="export-payment-csv-btn"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 hover:text-emerald-800 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                  title="Export monthly subscription payment dues to CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
          </div>

          {/* Dues Records Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">House #</th>
                    <th className="py-3 px-4">Household & Ward</th>
                    <th className="py-3 px-4">Subscription Month</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Payment Info</th>
                    <th className="py-3 px-4 text-right">Receipt / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDues.map((item) => {
                    const isPaid = item.status === 'Paid';
                    const isPending = item.status === 'Pending';
                    const isOverdue = item.status === 'Overdue';
                    const isResidentOwner = currentUser.houseNo === item.houseNo;

                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isResidentOwner ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {item.houseNo}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{item.headOfFamily}</div>
                          <div className="text-[11px] text-slate-500">{item.houseName} • {item.ward}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {item.month} {item.year}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          ₹{item.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {isPaid && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                            {isOverdue && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                            <span>{item.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-600">
                          {isPaid ? (
                            <div>
                              <span className="font-semibold text-slate-800">{item.paidDate}</span>
                              <span className="text-slate-400 block text-[10px]">{item.paymentMethod || 'Online'}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unpaid</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isPaid ? (
                            <button
                              id={`receipt-btn-${item.houseNo}`}
                              onClick={() => onOpenReceipt(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Receipt</span>
                            </button>
                          ) : currentUser.role === 'admin' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                id={`mark-paid-btn-${item.houseNo}`}
                                onClick={() => onMarkDuePaid(item.id, 'Cash / Mahallu Office')}
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
                                title="Record cash payment at Mahallu office"
                              >
                                Mark Paid
                              </button>
                              <button
                                id={`pay-now-admin-btn-${item.houseNo}`}
                                onClick={() => handleOpenPayModal(item)}
                                className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                                title="Open simulated payment gateway"
                              >
                                Pay Now
                              </button>
                            </div>
                          ) : (
                            <button
                              id={`pay-now-btn-${item.houseNo}`}
                              onClick={() => handleOpenPayModal(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay Now</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    )}

      {/* DONATION CAMPAIGNS SUBTAB */}
      {activeSubTab === 'donations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((campaign) => {
              const progressPct = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100));

              return (
                <div 
                  key={campaign.id}
                  id={`campaign-card-${campaign.id}`}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full">
                        {campaign.category}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        Closes: {campaign.deadline}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 tracking-tight">{campaign.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{campaign.description}</p>

                    {/* Progress Bar & Amount */}
                    <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="flex justify-between items-baseline mb-2">
                        <div>
                          <span className="text-xs text-slate-500 block">Funds Raised</span>
                          <span className="text-lg font-bold text-slate-900">₹{campaign.raisedAmount.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-500 block">Goal Target</span>
                          <span className="text-xs font-bold text-slate-700">₹{campaign.targetAmount.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
                        <span><strong>{progressPct}%</strong> of goal achieved</span>
                        <span><strong>{campaign.donorCount}</strong> community contributors</span>
                      </div>
                    </div>

                    {/* Recent Donors Ticker */}
                    <div className="mt-4">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Recent Contributions:
                      </span>
                      <div className="space-y-1.5">
                        {campaign.recentDonations.slice(0, 3).map((don) => (
                          <div key={don.id} className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-0">
                            <span className="text-slate-800 font-medium truncate max-w-[200px]">
                              {don.anonymous ? 'Well-Wisher (Anonymous)' : don.donorName}
                            </span>
                            <span className="font-bold text-emerald-800">
                              ₹{don.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Donate Button */}
                  <button
                    id={`donate-btn-${campaign.id}`}
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      setDonationAmount(1000);
                      setIsAnonymous(false);
                    }}
                    className="mt-6 w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>Contribute to this Fund</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Donate Modal */}
      {selectedCampaign && (
        <div id="donation-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            
            <div className="bg-emerald-900 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-800/80 px-2 py-0.5 rounded">
                  Community Contribution
                </span>
                <h3 className="text-base font-bold mt-1 line-clamp-1">{selectedCampaign.title}</h3>
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="p-1 text-slate-300 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {donationSuccessMsg ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Jazakallah Khair!</h4>
                <p className="text-xs text-slate-600">
                  Your generous contribution of ₹{donationAmount.toLocaleString()} has been safely recorded into the campaign ledger.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitDonation} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Select Preset Contribution Amount</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[500, 1000, 2500, 5000].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setDonationAmount(amt)}
                        className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                          donationAmount === amt
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Custom Amount (₹)</label>
                  <input
                    type="number"
                    min="100"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-sm font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Donor Name</label>
                  <input
                    type="text"
                    disabled={isAnonymous}
                    value={isAnonymous ? 'Well-Wisher' : donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous-checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="anonymous-checkbox" className="text-slate-700 font-medium">
                    Keep my identity anonymous on the public portal
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Proceed & Confirm Contribution (₹{donationAmount.toLocaleString()})</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* COMPREHENSIVE 'PAY NOW' ONLINE PAYMENT GATEWAY MODAL */}
      {payingDue && (
        <div id="pay-now-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Top Header */}
            <div className="bg-emerald-950 p-5 text-white flex items-center justify-between border-b border-emerald-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-800/80 border border-emerald-700/80 flex items-center justify-center shadow-inner text-emerald-200">
                  <Lock className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">Mahallu E-Pay Gateway</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-800 text-emerald-200 border border-emerald-700">
                      256-Bit SSL
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-300/80">Edappal Central Mahallu Jama'ath Waqf Fund</p>
                </div>
              </div>
              <button
                id="close-pay-now-modal-btn"
                onClick={() => setPayingDue(null)}
                className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-900/80 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Switcher based on step */}
            {paymentStep === 'form' && (
              <form onSubmit={handleExecutePayment} className="p-6 space-y-5 text-xs">
                
                {/* Due Amount & Household Summary Card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Subscription</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      House #{payingDue.houseNo} • {payingDue.headOfFamily}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {payingDue.houseName} • {payingDue.month} {payingDue.year}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Payable</span>
                    <div className="text-xl font-extrabold text-emerald-800 font-mono">
                      ₹{payingDue.amount}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold">Zero Gateway Fees</span>
                  </div>
                </div>

                {/* Payment Method Selector Tabs */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Payment Method:
                  </label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                    
                    {/* UPI Tab */}
                    <button
                      type="button"
                      id="method-tab-upi"
                      onClick={() => setPaymentMethodTab('upi')}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${
                        paymentMethodTab === 'upi'
                          ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-emerald-700" />
                      <span>UPI & QR</span>
                    </button>

                    {/* Card Tab */}
                    <button
                      type="button"
                      id="method-tab-card"
                      onClick={() => setPaymentMethodTab('card')}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${
                        paymentMethodTab === 'card'
                          ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-700" />
                      <span>Debit / Card</span>
                    </button>

                    {/* Net Banking Tab */}
                    <button
                      type="button"
                      id="method-tab-netbanking"
                      onClick={() => setPaymentMethodTab('netbanking')}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${
                        paymentMethodTab === 'netbanking'
                          ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Building className="w-4 h-4 text-emerald-700" />
                      <span>Net Banking</span>
                    </button>

                  </div>
                </div>

                {/* METHOD 1: UPI & QR CONTENT */}
                {paymentMethodTab === 'upi' && (
                  <div className="space-y-4">
                    {/* Simulated Instant QR Code */}
                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row items-center gap-4">
                      
                      {/* Decorative QR Code Block */}
                      <div className="w-24 h-24 bg-white p-2 rounded-xl border border-emerald-200 shadow-2xs flex flex-col items-center justify-center shrink-0">
                        <QrCode className="w-16 h-16 text-emerald-900" />
                        <span className="text-[9px] font-bold text-emerald-700 font-mono">BHIM UPI</span>
                      </div>

                      <div className="text-center sm:text-left space-y-1">
                        <span className="text-xs font-bold text-slate-900 block">Scan to Pay with Any UPI App</span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Open Google Pay, PhonePe, Paytm, or BHIM and scan this live QR code to approve ₹{payingDue.amount}.
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                          {['gpay', 'phonepe', 'paytm', 'bhim'].map((app) => (
                            <button
                              key={app}
                              type="button"
                              onClick={() => setSelectedUpiApp(app as any)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all border ${
                                selectedUpiApp === app
                                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {app}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Or Enter UPI VPA ID */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-semibold text-slate-700">Or Pay via UPI VPA ID</label>
                        <span className="text-[10px] text-slate-400">Instant Verification</span>
                      </div>
                      <div className="relative">
                        <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. yourname@okhdfcbank"
                          className="w-full pl-9 pr-24 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 font-medium text-slate-900"
                          required
                        />
                        <span className="absolute right-2.5 top-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Verified
                        </span>
                      </div>
                      
                      {/* Popular Handle Pills */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                        <span className="text-slate-400">Popular:</span>
                        {['@okhdfcbank', '@okaxis', '@ybl', '@paytm'].map((handle) => (
                          <button
                            type="button"
                            key={handle}
                            onClick={() => setUpiId(`mansoor${handle}`)}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 font-mono transition-colors cursor-pointer"
                          >
                            {handle}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* METHOD 2: DEBIT / CREDIT CARD CONTENT */}
                {paymentMethodTab === 'card' && (
                  <div className="space-y-4">
                    
                    {/* Simulated Mini Card Preview */}
                    <div className="bg-gradient-to-tr from-emerald-950 via-emerald-900 to-slate-900 p-4 rounded-2xl text-white shadow-md space-y-3 relative overflow-hidden">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 font-mono">
                          Edappal Community Card
                        </span>
                        <span className="text-xs font-bold text-amber-300 font-mono tracking-wider">RuPay / VISA</span>
                      </div>
                      <div className="font-mono text-base tracking-widest text-emerald-100 font-bold">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>
                      <div className="flex justify-between items-end text-[11px]">
                        <div>
                          <span className="text-[9px] text-emerald-300 block uppercase">Cardholder</span>
                          <span className="font-semibold text-white uppercase">{cardName || payingDue.headOfFamily}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-emerald-300 block uppercase">Expires</span>
                          <span className="font-mono font-semibold text-white">{cardExpiry || 'MM/YY'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Form Inputs */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Card Number *</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="16-digit card number"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-sm font-semibold focus:ring-2 focus:ring-emerald-600"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Expiry Date *</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-center focus:ring-2 focus:ring-emerald-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">CVV / CVC *</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-center focus:ring-2 focus:ring-emerald-600"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Name on Card *</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name exactly as printed on card"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="save-card-check"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="save-card-check" className="text-slate-600 font-medium">
                        Securely tokenize this card for future monthly payment deductions
                      </label>
                    </div>

                  </div>
                )}

                {/* METHOD 3: NET BANKING CONTENT */}
                {paymentMethodTab === 'netbanking' && (
                  <div className="space-y-4">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Choose Your Primary Banking Partner:
                    </label>
                    
                    {/* Bank Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'sbi', name: 'State Bank of India', code: 'SBI' },
                        { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
                        { id: 'icici', name: 'ICICI Bank', code: 'ICICI' },
                        { id: 'axis', name: 'Axis Bank', code: 'AXIS' },
                        { id: 'federal', name: 'Federal Bank', code: 'FED' },
                        { id: 'kgb', name: 'Kerala Gramin Bank', code: 'KGB' }
                      ].map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            selectedBank === bank.id
                              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <span className="block text-[11px] font-bold truncate max-w-[100px]">{bank.code}</span>
                            <span className="text-[9px] text-slate-500 truncate block max-w-[100px]">{bank.name}</span>
                          </div>
                          {selectedBank === bank.id && (
                            <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Or Select from 50+ Other Supported Banks</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                      >
                        <option value="sbi">State Bank of India (Retail & Corporate)</option>
                        <option value="hdfc">HDFC Bank</option>
                        <option value="icici">ICICI Bank</option>
                        <option value="axis">Axis Bank</option>
                        <option value="federal">Federal Bank</option>
                        <option value="kgb">Kerala Gramin Bank</option>
                        <option value="canara">Canara Bank</option>
                        <option value="pnb">Punjab National Bank</option>
                        <option value="bob">Bank of Baroda</option>
                        <option value="sib">South Indian Bank</option>
                      </select>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>You will be safely routed to your bank's authenticated portal to authorize this ₹{payingDue.amount} subscription.</span>
                    </div>

                  </div>
                )}

                {/* Security Guarantee Notice */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Direct Credit to Edappal Waqf Trust</span>
                  </div>
                  <span className="font-mono text-slate-400">NPCI Certified</span>
                </div>

                {/* Submit Pay Now Button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    id="execute-pay-now-btn"
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Authorize & Pay ₹{payingDue.amount} Securely</span>
                  </button>
                </div>

              </form>
            )}

            {/* STEP 2: PROCESSING ANIMATION */}
            {paymentStep === 'processing' && (
              <div className="p-10 text-center space-y-6">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-ping opacity-30"></div>
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-600 flex items-center justify-center text-emerald-700">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-slate-900 tracking-tight">Processing Payment</h4>
                  <p className="text-xs text-slate-500">
                    {processingStep === 1 && 'Connecting to secure banking gateway node...'}
                    {processingStep === 2 && 'Authenticating 2-Factor authorization with NPCI...'}
                    {processingStep === 3 && `Crediting ₹${payingDue.amount} to Central Mahallu Waqf Treasury...`}
                  </p>
                </div>

                {/* Simulated Progress Line */}
                <div className="w-full max-w-xs mx-auto h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ 
                      width: processingStep === 1 ? '35%' : processingStep === 2 ? '70%' : '100%' 
                    }}
                  ></div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Please do not refresh or close this browser window</span>
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS STATE */}
            {paymentStep === 'success' && (
              <div className="p-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-md shadow-emerald-700/10">
                  <CheckCircle2 className="w-9 h-9 text-emerald-700" />
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Settlement Confirmed
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 mt-2">Payment Cleared Successfully!</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your monthly contribution of <strong>₹{payingDue.amount}</strong> has been credited to Central Mahallu Treasury.
                  </p>
                </div>

                {/* Transaction receipt particulars */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 text-xs space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction ID:</span>
                    <span className="font-mono font-bold text-slate-900">{completedTxnId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Household:</span>
                    <span className="font-semibold text-slate-800">H#{payingDue.houseNo} - {payingDue.headOfFamily}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subscription Period:</span>
                    <span className="font-semibold text-slate-800">{payingDue.month} {payingDue.year}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                    <span className="text-slate-700">Amount Paid:</span>
                    <span className="text-emerald-800">₹{payingDue.amount} (Zero Fees)</span>
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    id="view-official-receipt-btn"
                    onClick={() => {
                      const updatedDue: DuesRecord = {
                        ...payingDue,
                        status: 'Paid',
                        paidDate: '2026-09-21',
                        paymentMethod: paymentMethodTab === 'upi' ? 'Online UPI' : paymentMethodTab === 'card' ? 'Credit Card' : 'Net Banking',
                        receiptNumber: `MHL-26-${Math.floor(1000 + Math.random() * 9000)}`,
                        recordedBy: currentUser.name
                      };
                      setPayingDue(null);
                      onOpenReceipt(updatedDue);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>View & Print Official Receipt</span>
                  </button>

                  <button
                    onClick={() => setPayingDue(null)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Back to Financials
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
