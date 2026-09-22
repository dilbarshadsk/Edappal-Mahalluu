import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  Filter, 
  Users, 
  Building2, 
  ExternalLink,
  ShieldCheck,
  Globe2,
  Heart
} from 'lucide-react';
import { FamilyRecord, FamilyMember } from '../types';
import { MahalluLogo } from './MahalluLogo';

interface CensusPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  families: FamilyRecord[];
  initialWardFilter?: string;
}

export const CensusPrintModal: React.FC<CensusPrintModalProps> = ({
  isOpen,
  onClose,
  families,
  initialWardFilter = 'All'
}) => {
  const [selectedWard, setSelectedWard] = useState<string>(initialWardFilter);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [includeMemberDetails, setIncludeMemberDetails] = useState<boolean>(true);
  const [printSuccess, setPrintSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  if (!isOpen) return null;

  // Distinct wards
  const wards = ['All', ...Array.from(new Set(families.map(f => f.ward))).sort()];

  // Filtered households
  const filteredFamilies = families.filter(fam => {
    const matchWard = selectedWard === 'All' || fam.ward === selectedWard;
    const matchStatus = selectedStatus === 'All' || fam.economicStatus === selectedStatus;
    return matchWard && matchStatus;
  });

  // Calculate high-level census aggregates
  const totalHouseholds = filteredFamilies.length;
  const allMembers: { family: FamilyRecord; member: FamilyMember }[] = [];
  filteredFamilies.forEach(f => {
    f.members.forEach(m => {
      allMembers.push({ family: f, member: m });
    });
  });

  const totalPopulation = allMembers.length;
  const maleCount = allMembers.filter(item => item.member.gender === 'Male').length;
  const femaleCount = allMembers.filter(item => item.member.gender === 'Female').length;
  const childrenCount = allMembers.filter(item => item.member.age < 18).length;
  const seniorCount = allMembers.filter(item => item.member.age >= 60).length;
  const abroadCount = allMembers.filter(item => item.member.isAbroad).length;

  const zakatEligibleCount = filteredFamilies.filter(f => f.economicStatus === 'Zakat-Eligible').length;
  const prioritySupportCount = filteredFamilies.filter(f => f.economicStatus === 'Priority Support').length;
  const generalCount = filteredFamilies.filter(f => f.economicStatus === 'General').length;

  const bplCount = filteredFamilies.filter(f => f.rationCardType === 'BPL' || f.rationCardType === 'AAY').length;

  // Generate complete standalone HTML document for flawless printing/PDF export in all browsers
  const generateStandaloneHtml = (): string => {
    const todayFormatted = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const rowsHtml = filteredFamilies.map((fam, idx) => {
      const membersRows = includeMemberDetails ? fam.members.map((m, mIdx) => `
        <tr style="border-bottom: 1px solid #f1f5f9; background: ${mIdx % 2 === 0 ? '#ffffff' : '#fafafa'}; font-size: 10px;">
          <td style="padding: 4px 6px; color: #64748b; text-align: center;">${mIdx + 1}</td>
          <td style="padding: 4px 6px; font-weight: 600; color: #0f172a;">
            ${m.name} ${m.isAbroad ? '<span style="background: #e0f2fe; color: #0369a1; padding: 1px 4px; border-radius: 4px; font-size: 8px; font-weight: bold;">NRI</span>' : ''}
          </td>
          <td style="padding: 4px 6px; color: #334155;">${m.relationToHead}</td>
          <td style="padding: 4px 6px; text-align: center; color: #334155;">${m.age} yrs (${m.gender[0]})</td>
          <td style="padding: 4px 6px; text-align: center; font-weight: bold; color: #065f46;">${m.bloodGroup}</td>
          <td style="padding: 4px 6px; color: #475569;">${m.occupation || '-'}</td>
          <td style="padding: 4px 6px; color: #475569;">${m.education || '-'}</td>
          <td style="padding: 4px 6px; text-align: center; color: #64748b;">${m.maritalStatus}</td>
        </tr>
      `).join('') : '';

      return `
        <div style="margin-bottom: 16px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; page-break-inside: avoid; background: #ffffff;">
          <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="display: inline-block; background: #065f46; color: #ffffff; font-weight: bold; font-size: 11px; padding: 2px 8px; border-radius: 4px; margin-right: 8px;">
                House #${fam.houseNo}
              </span>
              <strong style="font-size: 13px; color: #0f172a;">${fam.houseName}</strong>
              <span style="color: #64748b; font-size: 11px; margin-left: 8px;">(${fam.ward})</span>
            </div>
            <div style="font-size: 11px; color: #334155;">
              <span style="margin-right: 12px;"><strong>Head:</strong> ${fam.headOfFamily}</span>
              <span style="margin-right: 12px;"><strong>Phone:</strong> ${fam.phone}</span>
              <span style="background: #ecfdf5; color: #065f46; padding: 2px 6px; border-radius: 4px; font-weight: bold;">
                ${fam.economicStatus}
              </span>
              <span style="margin-left: 6px; background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px;">
                Ration: ${fam.rationCardType}
              </span>
            </div>
          </div>

          ${includeMemberDetails ? `
            <table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
              <thead>
                <tr style="background: #f1f5f9; color: #475569; font-size: 9px; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #cbd5e1;">
                  <th style="padding: 4px 6px; text-align: center; width: 30px;">#</th>
                  <th style="padding: 4px 6px; text-align: left;">Member Legal Name</th>
                  <th style="padding: 4px 6px; text-align: left; width: 80px;">Relationship</th>
                  <th style="padding: 4px 6px; text-align: center; width: 70px;">Age / Sex</th>
                  <th style="padding: 4px 6px; text-align: center; width: 50px;">Blood</th>
                  <th style="padding: 4px 6px; text-align: left;">Occupation</th>
                  <th style="padding: 4px 6px; text-align: left;">Education</th>
                  <th style="padding: 4px 6px; text-align: center; width: 60px;">Marital</th>
                </tr>
              </thead>
              <tbody>
                ${membersRows}
              </tbody>
            </table>
          ` : `
            <div style="padding: 8px 12px; font-size: 11px; color: #475569; display: flex; justify-content: space-between;">
              <span>Total Members: <strong>${fam.members.length}</strong> (${fam.members.map(m => m.name).join(', ')})</span>
              <span>Address: ${fam.address}</span>
            </div>
          `}
        </div>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Mahallu Census Register - ${selectedWard === 'All' ? 'All Wards' : selectedWard}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 16px;
      font-size: 11px;
      line-height: 1.4;
    }
    .no-print {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-bottom: 20px;
      padding: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .btn {
      background: #065f46;
      color: white;
      border: none;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-secondary {
      background: #475569;
    }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body onload="setTimeout(function(){ try { window.print(); } catch(e){} }, 400)">
  <div class="no-print">
    <button class="btn" onclick="window.print()">🖨️ Print Document / Save PDF</button>
    <button class="btn btn-secondary" onclick="window.close()">Close Window</button>
  </div>

  <!-- Header -->
  <div style="text-align: center; border-bottom: 2px solid #065f46; padding-bottom: 12px; margin-bottom: 16px;">
    <div style="font-size: 14px; font-weight: bold; color: #065f46; margin-bottom: 4px;">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
    <div style="font-size: 18px; font-weight: 900; letter-spacing: 0.5px; color: #064e3b; text-transform: uppercase;">
      EDAPPAL CENTRAL MAHALLU JAMA'ATH
    </div>
    <div style="font-size: 11px; color: #475569; font-weight: 600;">
      Reg. No: MHL/KER/2026/EDP-489 • Central Mahallu Complex, Edappal, Malappuram District, Kerala - 679576
    </div>
    <div style="display: inline-block; background: #065f46; color: #ffffff; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: bold; margin-top: 8px; letter-spacing: 0.5px;">
      OFFICIAL RESIDENT CENSUS REGISTER (മഹല്ല് കാനേഷുമാരി രജിസ്റ്റർ)
    </div>
    <div style="font-size: 10px; color: #64748b; margin-top: 6px;">
      Jurisdiction Ward: <strong>${selectedWard === 'All' ? 'Complete Mahallu Territorial Wards (1 to 4)' : selectedWard}</strong> • Generated on: <strong>${todayFormatted}</strong>
    </div>
  </div>

  <!-- Summary Statistics Grid -->
  <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-bottom: 16px; text-align: center;">
    <div style="border-right: 1px solid #e2e8f0; padding-right: 4px;">
      <div style="font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase;">Households</div>
      <div style="font-size: 16px; font-weight: 900; color: #065f46;">${totalHouseholds}</div>
    </div>
    <div style="border-right: 1px solid #e2e8f0; padding-right: 4px;">
      <div style="font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase;">Total Population</div>
      <div style="font-size: 16px; font-weight: 900; color: #0f172a;">${totalPopulation}</div>
    </div>
    <div style="border-right: 1px solid #e2e8f0; padding-right: 4px;">
      <div style="font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase;">Male / Female</div>
      <div style="font-size: 14px; font-weight: bold; color: #334155;">${maleCount} / ${femaleCount}</div>
    </div>
    <div style="border-right: 1px solid #e2e8f0; padding-right: 4px;">
      <div style="font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase;">Children (&lt;18)</div>
      <div style="font-size: 14px; font-weight: bold; color: #334155;">${childrenCount}</div>
    </div>
    <div style="border-right: 1px solid #e2e8f0; padding-right: 4px;">
      <div style="font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase;">Senior (60+)</div>
      <div style="font-size: 14px; font-weight: bold; color: #334155;">${seniorCount}</div>
    </div>
    <div>
      <div style="font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase;">NRI / Abroad</div>
      <div style="font-size: 14px; font-weight: bold; color: #0284c7;">${abroadCount}</div>
    </div>
  </div>

  <!-- Household Roster Content -->
  <div>
    ${rowsHtml}
  </div>

  <!-- Signatures & Official Certification Seal -->
  <div style="margin-top: 24px; padding-top: 16px; border-top: 2px dashed #94a3b8; display: flex; justify-content: space-between; align-items: flex-end; page-break-inside: avoid;">
    <div style="text-align: center; width: 140px;">
      <div style="font-size: 10px; color: #64748b; margin-bottom: 24px;">Prepared by:</div>
      <div style="border-top: 1px solid #0f172a; font-weight: bold; font-size: 10px; padding-top: 4px;">
        Census In-Charge
      </div>
    </div>

    <div style="text-align: center; border: 2px solid #065f46; padding: 6px 12px; border-radius: 6px; width: 150px;">
      <div style="font-size: 9px; font-weight: bold; color: #065f46; text-transform: uppercase;">OFFICIAL SEAL</div>
      <div style="font-size: 8px; color: #64748b; margin-top: 2px;">Edappal Central Mahallu</div>
      <div style="font-size: 8px; color: #065f46; font-weight: bold;">Verified Record</div>
    </div>

    <div style="text-align: center; width: 140px;">
      <div style="font-size: 10px; color: #64748b; margin-bottom: 24px;">Verified & Approved:</div>
      <div style="border-top: 1px solid #0f172a; font-weight: bold; font-size: 10px; padding-top: 4px;">
        General Secretary
      </div>
    </div>

    <div style="text-align: center; width: 140px;">
      <div style="font-size: 10px; color: #64748b; margin-bottom: 24px;">Attested:</div>
      <div style="border-top: 1px solid #0f172a; font-weight: bold; font-size: 10px; padding-top: 4px;">
        Mahallu President
      </div>
    </div>
  </div>

  <div style="text-align: center; font-size: 9px; color: #94a3b8; margin-top: 14px;">
    Official extract from the computerized Mahallu Enterprise Database. Any unauthorized modification renders this document invalid.
  </div>
</body>
</html>`;
  };

  // 1. Action: Direct Print / Browser Tab Launch
  const handlePrint = () => {
    try {
      const htmlContent = generateStandaloneHtml();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);

      // Open printable view in new window/tab (bypasses iframe restrictions)
      let opened = false;
      try {
        const printWindow = window.open(blobUrl, '_blank');
        if (printWindow) {
          printWindow.focus();
          opened = true;
        }
      } catch (e) {
        console.warn('Popup blocked:', e);
      }

      // Also trigger local window.print as secondary trigger
      try {
        window.print();
      } catch (e) {
        console.warn('Local print error:', e);
      }

      setSuccessMessage(opened 
        ? 'Census print preview opened in new tab. Print dialog ready!' 
        : 'Printing triggered. You can also download the certified HTML/PDF document below.'
      );
      setPrintSuccess(true);
      setTimeout(() => setPrintSuccess(false), 5000);
    } catch (err) {
      console.error('Error initiating print:', err);
      try {
        window.print();
      } catch {}
    }
  };

  // 2. Action: Download Standalone HTML Document
  const handleDownloadHtml = () => {
    try {
      const htmlContent = generateStandaloneHtml();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const wardSuffix = selectedWard === 'All' ? 'All_Wards' : selectedWard.replace(/\s+/g, '_');
      a.download = `Mahallu_Census_Register_${wardSuffix}_${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setSuccessMessage('Official Mahallu Census document downloaded successfully!');
      setPrintSuccess(true);
      setTimeout(() => setPrintSuccess(false), 4000);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // 3. Action: Export Full Census CSV
  const handleExportCsv = () => {
    try {
      const headers = [
        'House No',
        'House Name',
        'Ward',
        'Head of Family',
        'Primary Phone',
        'Address',
        'Economic Status',
        'Ration Card',
        'Monthly Payment',
        'Member Name',
        'Relationship',
        'Gender',
        'Age',
        'Blood Group',
        'Occupation',
        'Education',
        'Marital Status',
        'Is Abroad (NRI)'
      ];

      const csvRows: string[] = [headers.join(',')];

      filteredFamilies.forEach(fam => {
        fam.members.forEach(mem => {
          const row = [
            `"${fam.houseNo}"`,
            `"${fam.houseName}"`,
            `"${fam.ward}"`,
            `"${fam.headOfFamily}"`,
            `"${fam.phone}"`,
            `"${fam.address.replace(/"/g, '""')}"`,
            `"${fam.economicStatus}"`,
            `"${fam.rationCardType}"`,
            fam.monthlyChandaAmount,
            `"${mem.name}"`,
            `"${mem.relationToHead}"`,
            `"${mem.gender}"`,
            mem.age,
            `"${mem.bloodGroup}"`,
            `"${(mem.occupation || '').replace(/"/g, '""')}"`,
            `"${(mem.education || '').replace(/"/g, '""')}"`,
            `"${mem.maritalStatus}"`,
            mem.isAbroad ? 'Yes' : 'No'
          ];
          csvRows.push(row.join(','));
        });
      });

      // Include UTF-8 BOM for accurate opening in MS Excel / Apple Numbers
      const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const wardSuffix = selectedWard === 'All' ? 'All_Wards' : selectedWard.replace(/\s+/g, '_');
      a.download = `Mahallu_Census_Data_${wardSuffix}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setSuccessMessage('Full Census spreadsheet (CSV) exported successfully!');
      setPrintSuccess(true);
      setTimeout(() => setPrintSuccess(false), 4000);
    } catch (err) {
      console.error('CSV export error:', err);
    }
  };

  return (
    <div id="census-print-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Inline Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-census-report, #printable-census-report * {
            visibility: visible;
          }
          #printable-census-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10mm;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none flex flex-col max-h-[92vh]">
        
        {/* Top Header Controls (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-2xs">
              <MahalluLogo className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Print Official Mahallu Census Register</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold font-mono">
                  {totalHouseholds} Households
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Official certified roster of residents, age breakdown, and economic support categories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="print-census-action-btn"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer hidden sm:inline-flex"
              title="Download Standalone Printable HTML"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>HTML File</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer hidden sm:inline-flex"
              title="Export as CSV Spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Toolbar (Hidden on Print) */}
        <div className="px-6 py-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3 text-xs print:hidden shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Ward Filter:</span>
            </div>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              {wards.map(w => (
                <option key={w} value={w}>{w === 'All' ? 'All Wards (1 to 4)' : w}</option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 text-slate-600 font-semibold ml-2">
              <span>Category:</span>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="All">All Categories</option>
              <option value="General">General</option>
              <option value="Zakat-Eligible">Zakat-Eligible</option>
              <option value="Priority Support">Priority Support</option>
            </select>

            <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer select-none ml-2">
              <input
                type="checkbox"
                checked={includeMemberDetails}
                onChange={(e) => setIncludeMemberDetails(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <span className="font-medium">Include Detailed Member Tables</span>
            </label>
          </div>

          <div className="text-slate-500 text-[11px]">
            Showing <strong className="text-slate-800">{totalHouseholds}</strong> households • <strong className="text-slate-800">{totalPopulation}</strong> registered residents
          </div>
        </div>

        {/* Success Banner */}
        {printSuccess && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-900 print:hidden shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button 
              onClick={() => setPrintSuccess(false)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Printable Official Census Document View */}
        <div className="p-6 sm:p-8 bg-slate-100/50 overflow-y-auto print:p-0 print:bg-white flex-1">
          <div 
            id="printable-census-report" 
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm print:border-none print:shadow-none print:p-0"
          >
            {/* Document Official Header */}
            <div className="text-center border-b-2 border-emerald-900 pb-5 mb-6">
              <div className="text-sm font-bold text-emerald-900 mb-1 font-serif">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-emerald-800/30 flex items-center justify-center p-1 shadow-2xs">
                  <MahalluLogo className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-emerald-950 uppercase tracking-tight">
                    EDAPPAL CENTRAL MAHALLU JAMA'ATH
                  </h1>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">
                    Reg. No: MHL/KER/2026/EDP-489 • Central Mahallu Complex, Edappal, Malappuram District, Kerala - 679576
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                <span className="px-4 py-1 rounded-full bg-emerald-900 text-white font-bold text-xs tracking-wider uppercase">
                  OFFICIAL RESIDENT CENSUS REGISTER (മഹല്ല് കാനേഷുമാരി രജിസ്റ്റർ)
                </span>
              </div>

              <div className="mt-2 text-xs text-slate-500">
                <span>Jurisdiction: <strong>{selectedWard === 'All' ? 'All Mahallu Wards' : selectedWard}</strong></span>
                <span className="mx-2">•</span>
                <span>Extract Date: <strong>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
              </div>
            </div>

            {/* Census Demographic Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-center">
              <div className="border-r border-slate-200/80 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Households</span>
                <span className="text-lg font-black text-emerald-800 block mt-0.5">{totalHouseholds}</span>
                <span className="text-[10px] text-slate-500">Registered</span>
              </div>

              <div className="border-r border-slate-200/80 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Population</span>
                <span className="text-lg font-black text-slate-900 block mt-0.5">{totalPopulation}</span>
                <span className="text-[10px] text-slate-500">Residents</span>
              </div>

              <div className="border-r border-slate-200/80 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Gender Ratio</span>
                <span className="text-sm font-bold text-slate-800 block mt-1">
                  {maleCount} M / {femaleCount} F
                </span>
                <span className="text-[10px] text-slate-500">Males / Females</span>
              </div>

              <div className="border-r border-slate-200/80 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Children (&lt;18)</span>
                <span className="text-lg font-bold text-slate-800 block mt-0.5">{childrenCount}</span>
                <span className="text-[10px] text-slate-500">School & Madrasa</span>
              </div>

              <div className="border-r border-slate-200/80 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Seniors (60+)</span>
                <span className="text-lg font-bold text-slate-800 block mt-0.5">{seniorCount}</span>
                <span className="text-[10px] text-slate-500">Elder Members</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Expatriates (NRI)</span>
                <span className="text-lg font-bold text-sky-700 block mt-0.5">{abroadCount}</span>
                <span className="text-[10px] text-slate-500">Abroad Employed</span>
              </div>
            </div>

            {/* Households Register List */}
            <div className="space-y-4">
              {filteredFamilies.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl">
                  No household census records matching the selected filter.
                </div>
              ) : (
                filteredFamilies.map((fam, fIndex) => (
                  <div 
                    key={fam.id}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white break-inside-avoid"
                  >
                    {/* Household Summary Header */}
                    <div className="bg-slate-50/90 px-4 py-2.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-emerald-800 text-white font-bold rounded text-[11px] font-mono">
                          House #{fam.houseNo}
                        </span>
                        <strong className="text-sm font-bold text-slate-900">{fam.houseName}</strong>
                        <span className="text-slate-500 text-xs">({fam.ward})</span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-600 flex-wrap text-xs">
                        <span><strong>Head:</strong> {fam.headOfFamily}</span>
                        <span>•</span>
                        <span><strong>Phone:</strong> {fam.phone}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-800 font-bold text-[10px]">
                          {fam.economicStatus}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px]">
                          Ration: {fam.rationCardType}
                        </span>
                      </div>
                    </div>

                    {/* Member Details Table */}
                    {includeMemberDetails ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100/70 text-slate-600 text-[10px] uppercase font-bold border-b border-slate-200">
                              <th className="py-1.5 px-3 text-center w-8">#</th>
                              <th className="py-1.5 px-3">Member Name</th>
                              <th className="py-1.5 px-3">Relation</th>
                              <th className="py-1.5 px-3 text-center">Age / Sex</th>
                              <th className="py-1.5 px-3 text-center">Blood</th>
                              <th className="py-1.5 px-3">Occupation</th>
                              <th className="py-1.5 px-3">Education</th>
                              <th className="py-1.5 px-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {fam.members.map((mem, mIdx) => (
                              <tr key={mem.id} className={mIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                                <td className="py-1.5 px-3 text-center text-slate-400 font-mono text-[11px]">{mIdx + 1}</td>
                                <td className="py-1.5 px-3 font-semibold text-slate-900">
                                  {mem.name}
                                  {mem.isAbroad && (
                                    <span className="ml-1.5 px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded text-[9px] font-bold">
                                      NRI
                                    </span>
                                  )}
                                </td>
                                <td className="py-1.5 px-3 text-slate-600">{mem.relationToHead}</td>
                                <td className="py-1.5 px-3 text-center text-slate-600 font-mono text-[11px]">
                                  {mem.age} yrs ({mem.gender[0]})
                                </td>
                                <td className="py-1.5 px-3 text-center font-bold text-emerald-800 text-[11px] font-mono">
                                  {mem.bloodGroup}
                                </td>
                                <td className="py-1.5 px-3 text-slate-600">{mem.occupation || '—'}</td>
                                <td className="py-1.5 px-3 text-slate-600">{mem.education || '—'}</td>
                                <td className="py-1.5 px-3 text-center text-slate-500 text-[11px]">{mem.maritalStatus}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-3 text-xs text-slate-600 flex items-center justify-between">
                        <span>Total Members: <strong>{fam.members.length}</strong> ({fam.members.map(m => m.name).join(', ')})</span>
                        <span>Address: {fam.address}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Official Certification and Seal Footer */}
            <div className="mt-10 pt-6 border-t-2 border-dashed border-slate-300 grid grid-cols-4 gap-4 text-center text-xs break-inside-avoid">
              <div>
                <p className="text-[10px] text-slate-400 mb-8">Prepared by:</p>
                <div className="border-t border-slate-900 pt-1 font-bold text-slate-900">
                  Census In-Charge
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="border-2 border-emerald-900 p-2 rounded-xl w-32 text-center bg-emerald-50/30">
                  <span className="text-[9px] font-black text-emerald-950 block uppercase tracking-wider">OFFICIAL SEAL</span>
                  <span className="text-[8px] text-slate-500 block">Edappal Central Mahallu</span>
                  <span className="text-[8px] text-emerald-800 font-bold block">Verified Register</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 mb-8">Verified & Approved:</p>
                <div className="border-t border-slate-900 pt-1 font-bold text-slate-900">
                  General Secretary
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 mb-8">Attested:</p>
                <div className="border-t border-slate-900 pt-1 font-bold text-slate-900">
                  Mahallu President
                </div>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 mt-6">
              Certified authentic extract from the Edappal Central Mahallu Jama'ath Digital Census Records.
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official verified document suitable for government, survey, and welfare audits.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Census</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
