import React from 'react';
import { DuesRecord, User } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  Printer, 
  CreditCard, 
  TrendingUp
} from 'lucide-react';

interface ResidentChandaViewProps {
  currentUser: User;
  dues: DuesRecord[];
  onOpenReceipt: (record: DuesRecord) => void;
  onOpenPayModal: (due: DuesRecord) => void;
  onToggleDueStatus?: (dueId: string) => void;
  onSwitchToDonations: () => void;
}

export const ResidentChandaView: React.FC<ResidentChandaViewProps> = ({
  currentUser,
  dues,
  onOpenReceipt,
  onOpenPayModal,
  onToggleDueStatus,
  onSwitchToDonations
}) => {
  const resHouse = currentUser.houseNo || 'M-14';
  const residentDue = dues.find(d => d.houseNo === resHouse) || dues.find(d => d.houseNo === 'M-14') || dues[1];
  const isPaid = residentDue?.status === 'Paid';

  // Community-wide collection metrics for current month
  const currentMonth = dues[0]?.month || 'September';
  const currentYear = dues[0]?.year || 2026;
  const currentMonthDues = dues.filter(d => (!d.month || d.month.toLowerCase() === currentMonth.toLowerCase()) && (!d.year || d.year === currentYear));
  const communityCollected = currentMonthDues.filter(d => d.status === 'Paid').reduce((acc, d) => acc + d.amount, 0);
  const communityExpected = currentMonthDues.reduce((acc, d) => acc + d.amount, 0);
  const communityPaidCount = currentMonthDues.filter(d => d.status === 'Paid').length;
  const communityTotalCount = currentMonthDues.length || 12;
  const communityPercent = communityExpected > 0 ? Math.round((communityCollected / communityExpected) * 100) : 0;

  // Past billing history records strictly for this household
  const historyRows: DuesRecord[] = [
    ...(residentDue ? [residentDue] : []),
    {
      id: 'hist-aug-26',
      familyId: 'fam-02',
      houseNo: resHouse,
      houseName: residentDue?.houseName || 'Darussalam',
      headOfFamily: residentDue?.headOfFamily || 'Dr. CH Mansoor Ahmed',
      ward: residentDue?.ward || 'Ward 2 - Madina Colony',
      month: 'August',
      year: 2026,
      amount: 500,
      status: 'Paid',
      paidDate: '2026-08-08',
      receiptNumber: 'MHL-26-0812',
      paymentMethod: 'Online UPI',
      recordedBy: 'Resident Portal'
    },
    {
      id: 'hist-jul-26',
      familyId: 'fam-02',
      houseNo: resHouse,
      houseName: residentDue?.houseName || 'Darussalam',
      headOfFamily: residentDue?.headOfFamily || 'Dr. CH Mansoor Ahmed',
      ward: residentDue?.ward || 'Ward 2 - Madina Colony',
      month: 'July',
      year: 2026,
      amount: 500,
      status: 'Paid',
      paidDate: '2026-07-05',
      receiptNumber: 'MHL-26-0701',
      paymentMethod: 'Bank Transfer',
      recordedBy: 'Accounts Office'
    },
    {
      id: 'hist-jun-26',
      familyId: 'fam-02',
      houseNo: resHouse,
      houseName: residentDue?.houseName || 'Darussalam',
      headOfFamily: residentDue?.headOfFamily || 'Dr. CH Mansoor Ahmed',
      ward: residentDue?.ward || 'Ward 2 - Madina Colony',
      month: 'June',
      year: 2026,
      amount: 500,
      status: 'Paid',
      paidDate: '2026-06-12',
      receiptNumber: 'MHL-26-0619',
      paymentMethod: 'Cash / Mahallu Office',
      recordedBy: 'Treasury'
    }
  ];

  return (
    <div id="resident-payment-container" className="space-y-6">
      {/* Current Active Cycle Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              {residentDue?.houseNo || 'M-14'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900">
                  {residentDue?.houseName || 'Darussalam'}
                </h3>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {residentDue?.ward || 'Ward 2 - Madina Colony'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Head of Family: <strong className="text-slate-800">{residentDue?.headOfFamily || currentUser.name}</strong> • Cycle: <span className="font-semibold text-emerald-800">September 2026</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Rate</span>
              <span className="text-2xl font-bold text-emerald-800">₹{residentDue?.amount}</span>
            </div>
            <span className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 ${
              isPaid 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {isPaid ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Paid & Confirmed</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Payment Pending</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {isPaid ? (
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-950">Payment Settled:</span>
                  <span className="font-semibold text-slate-800">{residentDue?.paidDate || '10-Sep-2026'}</span>
                  <span>•</span>
                  <span className="text-slate-600">Method: {residentDue?.paymentMethod || 'Online UPI'}</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Receipt Serial: <strong className="font-mono text-emerald-900">{residentDue?.receiptNumber || 'MHL-26-0988'}</strong> (Waqf Board Audited)
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {residentDue && (
                  <button
                    id="resident-view-receipt-main-btn"
                    onClick={() => onOpenReceipt(residentDue)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View & Print Receipt</span>
                  </button>
                )}
                {onToggleDueStatus && residentDue && (
                  <button
                    id="resident-demo-toggle-due-btn"
                    onClick={() => onToggleDueStatus(residentDue.id)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer border border-slate-200"
                    title="Toggle between Paid and Pending to test online payment"
                  >
                    <span>Demo: Toggle to Pending</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-amber-950">Monthly Payment Subscription is Due</span>
                <p className="text-amber-900/90 text-xs leading-relaxed max-w-xl">
                  Your monthly subscription supports the daily operation, imam/muezzin honorarium, water & electricity utilities of Edappal Central Juma Masjid.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {residentDue && (
                  <button
                    id="resident-pay-now-primary-btn"
                    onClick={() => onOpenPayModal(residentDue)}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Now (UPI / Card / NetBanking)</span>
                  </button>
                )}
                {onToggleDueStatus && residentDue && (
                  <button
                    id="resident-demo-toggle-paid-btn"
                    onClick={() => onToggleDueStatus(residentDue.id)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer border border-slate-200"
                    title="Toggle to Paid status"
                  >
                    <span>Toggle Paid</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Community-Wide Monthly Collection vs Expected Overview Card */}
      <div id="resident-community-collection-card" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Mahallu Monthly Collection Progress
                </h4>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                  {currentMonth} {currentYear}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Transparent community overview: Total collected vs. expected monthly dues for all residents.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              {communityPercent}% Target Achieved
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
            <span className="text-[11px] font-bold text-emerald-900/80 uppercase tracking-wider block">
              Total Collected ({currentMonth})
            </span>
            <div className="text-2xl font-extrabold text-emerald-800 mt-1">
              ₹{communityCollected.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-700 mt-0.5 block">
              Realized from {communityPaidCount} of {communityTotalCount} households
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Total Expected Monthly Dues
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              ₹{communityExpected.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Assessed for all {communityTotalCount} registered resident households
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">Collection Progress: <strong className="text-emerald-800">{communityPercent}%</strong></span>
            <span>Pending Balance: <strong className="text-amber-700">₹{Math.max(0, communityExpected - communityCollected).toLocaleString()}</strong></span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/70">
            <div 
              className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, communityPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* My Household Subscription History Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              My Household Payment History
            </h4>
            <p className="text-xs text-slate-500">
              Verified record of monthly subscriptions for House #{currentUser.houseNo || 'M-14'}.
            </p>
          </div>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
            House #{currentUser.houseNo || 'M-14'} Only
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Billing Cycle</th>
                <th className="py-3 px-4">House #</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment Method & Date</th>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historyRows.map((item, idx) => {
                const itemIsPaid = item.status === 'Paid';
                return (
                  <tr key={item.id + idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {item.month} {item.year}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">
                      {item.houseNo}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{item.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        itemIsPaid
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {itemIsPaid ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {itemIsPaid ? (
                        <div>
                          <span className="font-medium text-slate-800">{item.paidDate}</span>
                          <span className="text-slate-400 block text-[10px]">{item.paymentMethod}</span>
                        </div>
                      ) : (
                        <span className="text-amber-700 italic font-medium">Pending Settlement</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {item.receiptNumber || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {itemIsPaid ? (
                        <button
                          id={`resident-hist-receipt-${item.id}`}
                          onClick={() => onOpenReceipt(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      ) : (
                        <button
                          id={`resident-hist-pay-${item.id}`}
                          onClick={() => onOpenPayModal(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
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
  );
};
