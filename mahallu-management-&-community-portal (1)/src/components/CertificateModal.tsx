import React from 'react';
import { ServiceRequest } from '../types';
import { MahalluLogo } from './MahalluLogo';
import { Printer, X, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CertificateModalProps {
  request: ServiceRequest | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ request, onClose }) => {
  if (!request) return null;

  const isMarriage = request.type === 'Marriage Certificate';
  const certData = request.approvedCertificateData || {
    certificateNo: `MHL-CERT-${request.refNo}`,
    issueDate: '21 September 2026',
    issuedBy: 'Janab P.K. Abdul Rahman Haji (General Secretary)',
    validityNote: 'Official document certified under Central Mahallu Constitution.',
    purpose: request.subject
  };

  const handlePrint = () => {
    try {
      const certNo = certData.certificateNo || `MHL-CERT-${request.refNo}`;
      const printableHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${isMarriage ? 'Marriage Certificate' : 'NOC Certificate'} - ${certNo}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: system-ui, serif; color: #0f172a; padding: 30px; max-width: 700px; margin: 0 auto; border: 3px double #065f46; border-radius: 12px; }
    .header { text-align: center; border-bottom: 2px solid #065f46; padding-bottom: 16px; margin-bottom: 20px; }
    .title { font-size: 22px; font-weight: 800; color: #065f46; font-family: serif; }
    .sub { font-size: 13px; color: #0f172a; font-weight: 600; text-transform: uppercase; margin-top: 4px; }
    .cert-type { display: inline-block; padding: 4px 16px; background: #ecfdf5; border: 1px solid #10b981; border-radius: 999px; font-size: 13px; font-weight: bold; color: #065f46; margin-top: 10px; }
    .body { font-size: 14px; line-height: 1.8; margin: 24px 0; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; font-size: 12px; }
    .btn { display: inline-block; padding: 8px 16px; background: #047857; color: white; border-radius: 6px; text-decoration: none; cursor: pointer; border: none; font-weight: bold; font-family: sans-serif; }
    @media print { .no-print { display: none !important; } }
  </style>
</head>
<body onload="setTimeout(function(){ window.print(); }, 300)">
  <div class="no-print" style="text-align: center; margin-bottom: 16px;">
    <button class="btn" onclick="window.print()">Print Official Certificate</button>
  </div>
  <div class="header">
    <img src="/mahallu-logo.svg" width="64" height="64" style="margin: 0 auto 8px; display: block;" alt="Logo" />
    <div class="title">EDAPPAL CENTRAL MAHALLU JAMA'ATH</div>
    <div class="sub">Waqf Board Reg. No: KL/WQF/142/1984 • Edappal Central Mahallu</div>
    <div class="cert-type">${isMarriage ? 'OFFICIAL MARRIAGE REGISTRATION EXTRACT' : 'OFFICIAL NO OBJECTION CERTIFICATE (NOC)'}</div>
  </div>
  <div class="body">
    <p><strong>Certificate Ref:</strong> ${certNo}</p>
    <p><strong>Date of Issuance:</strong> ${certData.issueDate}</p>
    <p><strong>Issued to:</strong> ${request.applicantName} (House #${request.houseNo})</p>
    <p style="margin-top: 16px;">
      This is to officially certify that <strong>${request.applicantName}</strong> is a registered bonafide resident member of this Mahallu under House #${request.houseNo}. All Mahallu subscription records and census documentation are in good order.
    </p>
    <p style="margin-top: 12px;"><strong>Subject / Purpose:</strong> ${request.subject}</p>
    <p style="margin-top: 12px; font-style: italic; color: #475569;">${certData.validityNote}</p>
  </div>
  <div class="footer">
    <div>
      <div>Digitally Certified & Sealed</div>
      <div style="color: #64748b; font-size: 10px;">Central Mahallu Jama'ath Executive Committee</div>
    </div>
    <div style="text-align: right;">
      <div style="font-family: cursive; font-size: 18px; color: #065f46;">Abdul Rahman Haji</div>
      <div style="font-weight: bold;">General Secretary</div>
      <div style="color: #64748b; font-size: 11px;">Edappal Central Mahallu</div>
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob([printableHtml], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);

      // Download
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `Certificate_${certNo}.html`;
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
    <div id="certificate-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="certificate-modal-card" 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Top Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-800">
              {isMarriage ? 'Official Marriage Registration Extract' : 'Official No Objection Certificate (NOC)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="print-certificate-btn"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Certificate</span>
            </button>
            <button
              id="close-certificate-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Paper Container with Ornate Border */}
        <div id="printable-certificate" className="p-8 sm:p-10 bg-[#fdfbf7] text-slate-900 border-8 border-double border-emerald-800/30 m-2 sm:m-4 rounded-xl shadow-inner">
          {/* Header */}
          <div className="text-center pb-6 border-b border-emerald-900/20">
            <div className="flex justify-center mb-3">
              <MahalluLogo className="w-16 h-16 drop-shadow-sm" />
            </div>
            <p className="font-serif text-emerald-800 text-lg tracking-widest uppercase mb-1">
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-950 font-serif">
              EDAPPAL CENTRAL MAHALLU JAMA'ATH
            </h1>
            <p className="text-xs font-semibold text-emerald-800 tracking-wider uppercase">
              Registered Under State Waqf Board (Reg. No: KL/WQF/142/1984)
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              P.O. Edappal Town, Malappuram District, Kerala - 679576 • info@edappalmahallu.org
            </p>

            <div className="mt-4 inline-block px-5 py-1.5 border-2 border-emerald-800 bg-white rounded-md text-emerald-950 font-bold tracking-wider text-sm uppercase shadow-xs">
              {isMarriage ? 'MARRIAGE REGISTRATION CERTIFICATE' : 'NO OBJECTION CERTIFICATE (NOC)'}
            </div>
          </div>

          {/* Certificate Metadata */}
          <div className="flex justify-between items-center text-xs py-3 text-slate-600 border-b border-dashed border-emerald-900/20 font-mono">
            <div>
              <span className="font-bold text-slate-800">Certificate No: </span>
              <span className="text-emerald-900 font-bold">{certData.certificateNo}</span>
            </div>
            <div>
              <span className="font-bold text-slate-800">Date of Issue: </span>
              <span>{certData.issueDate}</span>
            </div>
          </div>

          {/* Body Content */}
          <div className="py-6 text-sm text-slate-800 leading-relaxed space-y-4">
            <p>
              This is to certify that <span className="font-bold text-slate-900 underline decoration-emerald-600 decoration-1 underline-offset-4">{request.applicantName}</span>, 
              residing at House No. <span className="font-bold text-slate-900">{request.houseNo}</span>, 
              <span className="font-bold text-slate-900"> {request.ward}</span>, is a registered permanent resident and bona fide member of Edappal Central Mahallu Jama'ath.
            </p>

            {isMarriage ? (
              <div className="bg-white/80 p-4 rounded-lg border border-emerald-100 text-xs space-y-2">
                <p className="font-semibold text-emerald-950">Marriage Particulars from Mahallu Nikah Register:</p>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div><strong>Applicant:</strong> {request.applicantName}</div>
                  <div><strong>House:</strong> {request.houseNo} ({request.ward})</div>
                  <div><strong>Register Reference:</strong> Folio #118/Vol IV</div>
                  <div><strong>Verification Status:</strong> Fully Verified & Recorded</div>
                </div>
              </div>
            ) : null}

            <p>
              {isMarriage 
                ? "This extract is issued based on the verified entries of the Mahallu Marriage Register upon lawful application, and carries the full endorsement of the Mahallu Jama'ath Committee for official, embassy, and governmental records."
                : "The Mahallu Jama'ath Committee hereby affirms that it has No Objection toward the purpose described below, and confirms that the applicant holds good community standing with all subscription dues cleared."
              }
            </p>

            <div className="bg-emerald-50/70 p-3 rounded-md border border-emerald-200/70 text-xs">
              <span className="font-bold text-emerald-950">Purpose / Application Subject: </span>
              <span className="text-slate-800">{request.subject}</span>
              <p className="text-[11px] text-slate-500 mt-1 italic">Remarks: {request.adminRemarks || 'Duly sanctioned by the Executive Committee.'}</p>
            </div>
          </div>

          {/* Seal and Signatures */}
          <div className="grid grid-cols-3 items-end pt-8 mt-4 border-t-2 border-emerald-900/20 text-xs">
            {/* President Signature */}
            <div className="text-center">
              <div className="font-serif italic text-emerald-950 text-sm font-semibold mb-1">
                Sayyid Munavvar Ali
              </div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800 text-[11px]">
                President
              </div>
              <div className="text-[10px] text-slate-500">Mahallu Jama'ath Committee</div>
            </div>

            {/* Official Seal Emblem */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-800 flex flex-col items-center justify-center text-center p-1 bg-emerald-50/40">
                <ShieldCheck className="w-5 h-5 text-emerald-700 mb-0.5" />
                <span className="text-[8px] font-bold text-emerald-950 uppercase leading-tight tracking-tighter">OFFICIAL SEAL</span>
                <span className="text-[7px] text-emerald-700">CENTRAL MAHALLU</span>
              </div>
              <span className="text-[9px] text-emerald-800 font-mono mt-1 font-semibold">DIGITALLY VERIFIED</span>
            </div>

            {/* General Secretary Signature */}
            <div className="text-center">
              <div className="font-serif italic text-emerald-950 text-sm font-semibold mb-1">
                P.K. Abdul Rahman Haji
              </div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800 text-[11px]">
                General Secretary
              </div>
              <div className="text-[10px] text-slate-500">Mahallu Jama'ath Committee</div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 print:hidden">
          Official document generated via Mahallu Digital Administration System. Valid without manual signature when QR/Digital seal is present.
        </div>
      </div>
    </div>
  );
};
