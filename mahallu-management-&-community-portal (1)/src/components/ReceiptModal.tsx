import React from 'react';
import { DuesRecord } from '../types';
import { Printer, X, CheckCircle, ShieldCheck, Download } from 'lucide-react';

interface ReceiptModalProps {
  receipt: DuesRecord | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    try {
      const receiptNo = receipt.receiptNumber || 'MHL-26-GEN';
      const printableHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Receipt - ${receiptNo}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: system-ui, sans-serif; color: #0f172a; padding: 24px; max-width: 600px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px solid #047857; padding-bottom: 12px; margin-bottom: 16px; }
    .title { font-size: 18px; font-weight: bold; color: #0f172a; }
    .sub { font-size: 12px; color: #047857; font-weight: 600; text-transform: uppercase; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
    .box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 13px; }
    .row { display: flex; justify-content: space-between; padding: 4px 0; }
    .total { font-weight: bold; font-size: 15px; border-top: 1px solid #cbd5e1; margin-top: 6px; padding-top: 6px; color: #047857; }
    .badge { display: inline-block; padding: 2px 8px; background: #d1fae5; color: #065f46; border-radius: 999px; font-weight: bold; font-size: 11px; }
    .btn { display: inline-block; padding: 8px 16px; background: #047857; color: white; border-radius: 6px; text-decoration: none; cursor: pointer; border: none; font-weight: bold; }
    @media print { .no-print { display: none !important; } }
  </style>
</head>
<body onload="setTimeout(function(){ window.print(); }, 300)">
  <div class="no-print" style="text-align: center; margin-bottom: 16px;">
    <button class="btn" onclick="window.print()">Print Official Receipt</button>
  </div>
  <div class="header">
    <div class="title">EDAPPAL CENTRAL MAHALLU JAMA'ATH</div>
    <div class="sub">Waqf Board Reg. No: KL/WQF/142/1984 • Malappuram</div>
    <p style="font-size: 12px; margin-top: 4px;">Official Mahallu Subscription Payment Receipt</p>
  </div>
  <div class="meta">
    <div><strong>Receipt No:</strong> ${receiptNo}</div>
    <div style="text-align: right;"><strong>Date:</strong> ${receipt.paidDate || 'Paid'}</div>
    <div><strong>Household:</strong> ${receipt.headOfFamily} (House #${receipt.houseNo})</div>
    <div style="text-align: right;"><strong>Ward:</strong> ${receipt.ward}</div>
  </div>
  <div class="box">
    <div class="row">
      <span>Monthly Mahallu Subscription (${receipt.month} ${receipt.year})</span>
      <span>₹${receipt.amount.toLocaleString()}</span>
    </div>
    <div class="row">
      <span>Payment Method</span>
      <span>${receipt.paymentMethod || 'Online UPI'}</span>
    </div>
    <div class="row total">
      <span>Total Paid</span>
      <span>₹${receipt.amount.toLocaleString()} <span class="badge">PAID</span></span>
    </div>
  </div>
  <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-top: 24px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
    <div>Digitally Verified by Central Mahallu Jama'ath Finance System</div>
    <div style="text-align: right; font-weight: bold; color: #047857;">Treasurer / Finance Sec.</div>
  </div>
</body>
</html>`;

      const blob = new Blob([printableHtml], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);

      // Download
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `Receipt_${receiptNo}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Open new window
      try {
        const w = window.open(blobUrl, '_blank');
        if (w) w.focus();
      } catch (e) {
        console.warn('Popup blocked', e);
      }

      // Local print
      try {
        window.print();
      } catch (err) {
        console.warn('Print error', err);
      }
    } catch {
      try { window.print(); } catch {}
    }
  };

  return (
    <div id="receipt-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="receipt-modal-card" 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Modal Action Bar (Hidden in print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-semibold text-slate-700">Official Mahallu Payment Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="print-receipt-btn"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              id="close-receipt-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div id="printable-receipt" className="p-8 bg-white text-slate-800">
          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-emerald-700/80">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-serif text-xl font-bold shadow-md shadow-emerald-700/20">
                EM
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">EDAPPAL CENTRAL MAHALLU JAMA'ATH</h2>
                <p className="text-xs text-emerald-800 font-medium tracking-wide uppercase">Waqf Board Reg. No: KL/WQF/142/1984</p>
                <p className="text-[11px] text-slate-500">Main Road, Edappal Town, P.O. Edappal, Malappuram • Helpline: +91 495 2410022</p>
              </div>
            </div>
            <div className="inline-block px-4 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold uppercase tracking-wider mt-2">
              Monthly Subscription Payment Receipt
            </div>
          </div>

          {/* Receipt Meta Details */}
          <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-200">
            <div>
              <p className="text-slate-500 font-medium">Receipt No:</p>
              <p className="font-mono font-bold text-slate-900 text-sm">{receipt.receiptNumber || 'MHL-26-GEN'}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 font-medium">Payment Date:</p>
              <p className="font-semibold text-slate-900 text-sm">{receipt.paidDate || 'Current'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Household / Member:</p>
              <p className="font-semibold text-slate-900 text-sm">{receipt.headOfFamily}</p>
              <p className="text-slate-600">House #{receipt.houseNo} • {receipt.houseName}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 font-medium">Ward / Jurisdiction:</p>
              <p className="font-semibold text-slate-900 text-sm">{receipt.ward}</p>
              <p className="text-slate-600">Payment Mode: {receipt.paymentMethod || 'Online UPI'}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="my-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-y border-slate-200">
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-center">Period</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-3 font-medium text-slate-800">
                    Monthly Mahallu Maintenance & Madrasa Welfare Payment
                  </td>
                  <td className="py-3 px-3 text-center text-slate-600 font-medium">
                    {receipt.month} {receipt.year}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    ₹{receipt.amount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
                  <td colSpan={2} className="py-2.5 px-3 text-slate-700">Total Received</td>
                  <td className="py-2.5 px-3 text-right text-base font-bold text-emerald-800">
                    ₹{receipt.amount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Verification & Signatures */}
          <div className="grid grid-cols-2 items-end pt-4 border-t border-dashed border-slate-300 text-xs">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Digitally Authenticated</span>
              </div>
              <p className="text-[10px] text-slate-500">
                System Reference: SHA-256 Verified<br/>
                Recorded By: {receipt.recordedBy || 'Mahallu Treasury System'}
              </p>
            </div>
            <div className="text-right">
              <div className="font-serif italic text-emerald-900 text-sm font-semibold mb-1">
                P.K. Abdul Rahman Haji
              </div>
              <div className="text-[11px] font-semibold text-slate-800 border-t border-slate-300 pt-1 inline-block">
                General Secretary / Treasurer
              </div>
              <p className="text-[10px] text-slate-400">Edappal Central Mahallu Jama'ath</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 print:hidden">
          Thank you for your timely contribution toward community upliftment and religious education.
        </div>
      </div>
    </div>
  );
};
