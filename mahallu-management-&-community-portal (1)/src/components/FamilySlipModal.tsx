import React, { useState } from 'react';
import { FamilyRecord } from '../types';
import { MahalluLogo } from './MahalluLogo';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  QrCode, 
  Building2, 
  Phone, 
  MapPin, 
  Users, 
  Heart, 
  Globe 
} from 'lucide-react';

interface FamilySlipModalProps {
  family: FamilyRecord | null;
  onClose: () => void;
}

export const FamilySlipModal: React.FC<FamilySlipModalProps> = ({ family, onClose }) => {
  const [printSuccess, setPrintSuccess] = useState(false);

  if (!family) return null;

  const slipRefNo = `MHL-SLIP-2026-${family.houseNo.replace(/[^a-zA-Z0-9]/g, '')}`;
  const issueDate = '21 September 2026';

  const generatePrintableHtml = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Mahallu Family Slip - House #${family.houseNo} (${family.houseName})</title>
  <style>
    @page { 
      size: A4; 
      margin: 12mm 15mm; 
    }
    * { box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
      color: #0f172a; 
      margin: 0; 
      padding: 24px; 
      background: #ffffff;
      font-size: 12px;
      line-height: 1.5;
    }
    .slip-container {
      max-width: 800px;
      margin: 0 auto;
      border: 3px double #065f46;
      border-radius: 12px;
      padding: 24px;
      position: relative;
    }
    .no-print {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px dashed #cbd5e1;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 18px;
      background: #047857;
      color: white;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      text-decoration: none;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #065f46;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .org-title {
      font-size: 22px;
      font-weight: 800;
      color: #065f46;
      font-family: Georgia, serif;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .org-reg {
      font-size: 11px;
      color: #475569;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 4px;
      letter-spacing: 0.8px;
    }
    .slip-badge {
      display: inline-block;
      margin-top: 10px;
      padding: 4px 18px;
      background: #ecfdf5;
      border: 1.5px solid #059669;
      color: #065f46;
      font-weight: 800;
      font-size: 12px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .meta-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }
    .summary-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 20px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px 16px;
    }
    .summary-item label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .summary-item value {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }
    .members-table-title {
      font-size: 13px;
      font-weight: 800;
      color: #065f46;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 6px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 11px;
    }
    th {
      background: #065f46;
      color: #ffffff;
      padding: 8px 10px;
      text-align: left;
      font-weight: 700;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .badge-tag {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
    }
    .tag-head { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .tag-nri { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .tag-blood { background: #ffe4e6; color: #be123c; border: 1px solid #fecdd3; font-weight: bold; }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 28px;
      padding-top: 16px;
      border-top: 1.5px dashed #cbd5e1;
    }
    .seal-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .seal-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 2px dashed #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 8px;
      font-weight: 800;
      color: #065f46;
      text-transform: uppercase;
      line-height: 1.2;
      padding: 4px;
      background: #ecfdf5;
    }
    .sig-block {
      text-align: right;
    }
    .sig-name {
      font-family: Georgia, cursive, serif;
      font-size: 16px;
      color: #065f46;
      margin-bottom: 2px;
      font-weight: bold;
    }
    .sig-title {
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
    }
    .sig-org {
      font-size: 10px;
      color: #64748b;
    }
    .notice {
      font-size: 9px;
      color: #64748b;
      margin-top: 18px;
      text-align: center;
      line-height: 1.4;
      border-top: 1px solid #f1f5f9;
      padding-top: 8px;
    }
    @media print {
      body { padding: 0; background: white; }
      .slip-container { border: 2px solid #065f46; border-radius: 0; padding: 18px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body onload="setTimeout(function(){ try { window.print(); } catch(e){} }, 400)">
  <div class="no-print">
    <button class="btn" onclick="window.print()">
      🖨️ Print Family Slip
    </button>
  </div>

  <div class="slip-container">
    <div class="header">
      <div class="org-title">EDAPPAL CENTRAL MAHALLU JAMA'ATH</div>
      <div class="org-reg">Waqf Board Reg. No: KL/WQF/142/1984 • Edappal Central Mahallu</div>
      <div class="slip-badge">Certified Household Census Slip / കുടുംബ സ്ലിപ്പ്</div>
      <div class="meta-strip">
        <span>Reference Folio: <strong>${slipRefNo}</strong></span>
        <span>Registered Ward: <strong>${family.ward}</strong></span>
        <span>Issued Date: <strong>${issueDate}</strong></span>
      </div>
    </div>

    <div class="summary-box">
      <div class="summary-grid">
        <div class="summary-item">
          <label>House Number</label>
          <value>${family.houseNo}</value>
        </div>
        <div class="summary-item">
          <label>House / Villa Name</label>
          <value>${family.houseName}</value>
        </div>
        <div class="summary-item">
          <label>Head of Household</label>
          <value>${family.headOfFamily}</value>
        </div>
        <div class="summary-item">
          <label>Registered Mobile</label>
          <value>${family.phone}</value>
        </div>
        <div class="summary-item">
          <label>Ration Card Category</label>
          <value>${family.rationCardType}</value>
        </div>
        <div class="summary-item">
          <label>Economic Classification</label>
          <value>${family.economicStatus}</value>
        </div>
        <div class="summary-item">
          <label>Monthly Payment</label>
          <value>₹${family.monthlyChandaAmount} / month</value>
        </div>
        <div class="summary-item">
          <label>Census Enrolled</label>
          <value>Year ${family.enrolledYear}</value>
        </div>
        <div class="summary-item" style="grid-column: span 4;">
          <label>Physical Address</label>
          <value>${family.address}</value>
        </div>
      </div>
    </div>

    <div class="members-table-title">
      <span>Registered Household Members (${family.members.length} Enrolled)</span>
      <span style="font-size: 11px; font-weight: 600; color: #64748b;">Official Census Records</span>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 30px;">#</th>
          <th>Full Name</th>
          <th>Relation</th>
          <th>Gender</th>
          <th>Age</th>
          <th>Marital</th>
          <th>Blood</th>
          <th>Occupation</th>
          <th>Education</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${family.members.map((m, idx) => `
          <tr>
            <td style="text-align: center; font-weight: bold; color: #64748b;">${idx + 1}</td>
            <td style="font-weight: 700;">
              ${m.name}
              ${m.relationToHead === 'Head' ? '<span class="badge-tag tag-head">Head</span>' : ''}
            </td>
            <td>${m.relationToHead}</td>
            <td>${m.gender}</td>
            <td>${m.age} yrs</td>
            <td>${m.maritalStatus}</td>
            <td><span class="badge-tag tag-blood">${m.bloodGroup}</span></td>
            <td>${m.occupation}</td>
            <td>${m.education}</td>
            <td>
              ${m.isAbroad ? '<span class="badge-tag tag-nri">NRI Abroad</span>' : 'Resident'}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="footer">
      <div class="seal-box">
        <div class="seal-circle">
          CENTRAL<br>MAHALLU<br>★ SEAL ★
        </div>
        <div>
          <div style="font-weight: 800; font-size: 11px; color: #065f46;">VERIFIED DIGITAL CENSUS</div>
          <div style="font-size: 10px; color: #64748b;">Security Code: ${slipRefNo}-SEC99</div>
          <div style="font-size: 9px; color: #94a3b8; font-family: monospace;">QR-CHECK: AUTH-OK</div>
        </div>
      </div>

      <div style="text-align: center;">
        <div style="font-size: 10px; color: #64748b; font-style: italic;">Chief Imam Attestation</div>
        <div style="font-family: Georgia, cursive; font-size: 14px; color: #065f46; font-weight: bold; margin-top: 4px;">Hafiz Bilal Faizy</div>
        <div style="font-size: 10px; font-weight: 600; color: #1e293b;">Usthad Hafiz Muhammad Bilal Faizy</div>
        <div style="font-size: 9px; color: #64748b;">Chief Imam & Khateeb</div>
      </div>

      <div class="sig-block">
        <div style="font-size: 10px; color: #64748b; font-style: italic;">Issuing Authority</div>
        <div class="sig-name">P.K. Abdul Rahman Haji</div>
        <div class="sig-title">Janab P.K. Abdul Rahman Haji</div>
        <div class="sig-org">General Secretary, Mahallu Jama'ath</div>
      </div>
    </div>

    <div class="notice">
      Notice: This certified family slip is an official extract from the registered census database of Edappal Central Mahallu Jama'ath. Valid for official verification, admissions, and Mahallu welfare services. Any unauthorized reproduction, erasure, or tampering invalidates this record.
    </div>
  </div>
</body>
</html>`;
  };

  const handlePrintSlip = () => {
    try {
      const htmlContent = generatePrintableHtml();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);

      // 1. Download local file copy
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `Mahallu_Family_Slip_House_${family.houseNo}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 2. Open printable view in new tab (bypasses iframe sandbox print restrictions)
      try {
        const printWindow = window.open(blobUrl, '_blank');
        if (printWindow) {
          printWindow.focus();
        }
      } catch (err) {
        console.warn('Popup blocked:', err);
      }

      // 3. Trigger native window print
      try {
        window.print();
      } catch (err) {
        console.warn('Direct print error:', err);
      }

      setPrintSuccess(true);
      setTimeout(() => setPrintSuccess(false), 6000);
    } catch (e) {
      console.error('Error generating print slip:', e);
      try {
        window.print();
      } catch {}
    }
  };

  return (
    <div id="family-slip-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Inline Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-family-slip, #printable-family-slip * {
            visibility: visible;
          }
          #printable-family-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10mm;
            border: 2px solid #065f46 !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-0.5">
              <MahalluLogo className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Mahallu Family Slip</h3>
                <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
                  House #{family.houseNo}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Official certified census extract for household</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="print-family-slip-action-btn"
              type="button"
              onClick={handlePrintSlip}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              id="download-family-slip-btn"
              type="button"
              onClick={handlePrintSlip}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer hidden sm:inline-flex"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HTML</span>
            </button>

            <button
              id="close-family-slip-modal-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Slip"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner (Appears when user triggers print/download) */}
        {printSuccess && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between gap-3 text-emerald-900 text-xs font-medium print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Printable Family Slip for House #{family.houseNo} generated and downloaded! Opening print preview in browser...
              </span>
            </div>
            <button 
              onClick={() => setPrintSuccess(false)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Printable Official Slip Paper Content */}
        <div className="p-6 sm:p-8 bg-slate-100/50 max-h-[calc(85vh-70px)] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 print:bg-white">
          <div 
            id="printable-family-slip" 
            className="bg-white rounded-2xl border-2 border-emerald-800/40 p-6 sm:p-8 shadow-md relative print:border-2 print:border-emerald-900 print:rounded-none print:p-6 print:shadow-none"
          >
            {/* Watermark subtle seal */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none select-none">
              <MahalluLogo className="w-80 h-80" />
            </div>

            {/* Letterhead */}
            <div className="text-center border-b-2 border-emerald-800 pb-5 mb-5">
              <div className="flex items-center justify-center gap-2 text-emerald-800 mb-2">
                <MahalluLogo className="w-14 h-14" />
              </div>
              <h1 className="text-2xl font-black text-emerald-900 font-serif tracking-tight">
                EDAPPAL CENTRAL MAHALLU JAMA'ATH
              </h1>
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mt-0.5">
                Waqf Board Reg. No: KL/WQF/142/1984 • Edappal Central Mahallu, Malappuram
              </p>
              <div className="mt-2.5 inline-block px-4 py-1 bg-emerald-50 border border-emerald-700/60 rounded-full">
                <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                  Certified Household Census Slip / കുടുംബ സ്ലിപ്പ്
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium mt-4 pt-3 border-t border-slate-100">
                <span>Ref: <strong className="text-slate-800 font-mono">{slipRefNo}</strong></span>
                <span>Ward: <strong className="text-slate-800">{family.ward}</strong></span>
                <span>Date of Issue: <strong className="text-slate-800">{issueDate}</strong></span>
              </div>
            </div>

            {/* Household Summary Box */}
            <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">House Number</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{family.houseNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">House Name</span>
                  <span className="font-bold text-slate-900">{family.houseName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Head of Family</span>
                  <span className="font-bold text-slate-900">{family.headOfFamily}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact Phone</span>
                  <span className="font-bold text-slate-900 font-mono">{family.phone}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Ration Card</span>
                  <span className="font-semibold text-slate-800">{family.rationCardType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Economic Status</span>
                  <span className="font-semibold text-slate-800">{family.economicStatus}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Monthly Payment</span>
                  <span className="font-bold text-emerald-800">₹{family.monthlyChandaAmount} / month</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Census Enrolled</span>
                  <span className="font-semibold text-slate-800">Year {family.enrolledYear}</span>
                </div>

                <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Address</span>
                  <span className="text-slate-700 font-medium">{family.address}</span>
                </div>
              </div>
            </div>

            {/* Registered Family Members Table */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between pb-1 border-b border-emerald-800/30">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Enrolled Family Members ({family.members.length})</span>
                </h4>
                <span className="text-[11px] font-semibold text-slate-500">Official Census Roster</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-emerald-900 text-white text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2 px-2.5 rounded-l-lg text-center w-8">#</th>
                      <th className="py-2 px-2.5">Member Name</th>
                      <th className="py-2 px-2">Relation</th>
                      <th className="py-2 px-2">Gender</th>
                      <th className="py-2 px-2">Age</th>
                      <th className="py-2 px-2">Marital</th>
                      <th className="py-2 px-2">Blood</th>
                      <th className="py-2 px-2">Occupation</th>
                      <th className="py-2 px-2">Education</th>
                      <th className="py-2 px-2.5 rounded-r-lg text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {family.members.map((member, idx) => (
                      <tr key={member.id} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                        <td className="py-2 px-2.5 text-center font-bold text-slate-400 text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-2.5 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{member.name}</span>
                            {member.relationToHead === 'Head' && (
                              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded border border-emerald-200">
                                Head
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-2 text-slate-700 font-medium">{member.relationToHead}</td>
                        <td className="py-2 px-2 text-slate-600">{member.gender}</td>
                        <td className="py-2 px-2 text-slate-600">{member.age} yrs</td>
                        <td className="py-2 px-2 text-slate-600">{member.maritalStatus}</td>
                        <td className="py-2 px-2">
                          <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px] rounded">
                            {member.bloodGroup}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-slate-700">{member.occupation}</td>
                        <td className="py-2 px-2 text-slate-600">{member.education}</td>
                        <td className="py-2 px-2.5 text-right font-medium">
                          {member.isAbroad ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200">
                              <Globe className="w-2.5 h-2.5" /> NRI
                            </span>
                          ) : (
                            <span className="text-slate-600 text-[11px]">Resident</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Official Signatures and Seal Strip */}
            <div className="pt-6 border-t border-dashed border-slate-300 grid grid-cols-3 gap-4 items-end">
              {/* Seal & QR Verification */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-emerald-700 flex items-center justify-center p-1 text-center bg-emerald-50 shrink-0">
                  <span className="text-[7px] font-extrabold text-emerald-900 leading-tight">
                    CENTRAL<br/>MAHALLU<br/>★ SEAL ★
                  </span>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-emerald-950 uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Digitally Verified</span>
                  </div>
                  <div className="font-mono text-[9px] text-slate-500">{slipRefNo}</div>
                  <div className="text-[8px] text-slate-400">Authentic Census Extract</div>
                </div>
              </div>

              {/* Chief Imam */}
              <div className="text-center">
                <div className="text-[10px] text-slate-400 italic">Chief Imam Attestation</div>
                <div className="font-serif italic text-emerald-900 font-bold text-sm mt-1">
                  Hafiz Bilal Faizy
                </div>
                <div className="text-[11px] font-bold text-slate-800">
                  Usthad Hafiz M. Bilal Faizy
                </div>
                <div className="text-[10px] text-slate-500">
                  Chief Imam & Khateeb
                </div>
              </div>

              {/* General Secretary */}
              <div className="text-right">
                <div className="text-[10px] text-slate-400 italic">Issuing Secretariat Authority</div>
                <div className="font-serif italic text-emerald-900 font-bold text-sm mt-1">
                  P. K. Abdul Rahman Haji
                </div>
                <div className="text-[11px] font-bold text-slate-800">
                  Janab P. K. Abdul Rahman Haji
                </div>
                <div className="text-[10px] text-slate-500">
                  General Secretary
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-5 pt-3 border-t border-slate-100 text-center text-[9px] text-slate-400 leading-relaxed">
              This document is a legally recognized certified census slip from Edappal Central Mahallu Jama'ath records. It is accepted for school/madrasa admissions, marriage clearance, and civic identity verification. Any unauthorized alteration or forgery is strictly prohibited under Mahallu bylaws.
            </div>

          </div>
        </div>

        {/* Footer info (Hidden on Print) */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <span>Printed slips can be attached with government, marriage, or madrasa applications.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
