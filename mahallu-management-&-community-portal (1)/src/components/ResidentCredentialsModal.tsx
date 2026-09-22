import React, { useState } from 'react';
import { FamilyRecord } from '../types';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Printer, 
  KeyRound, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Building2, 
  ShieldCheck, 
  ExternalLink,
  MessageCircle,
  QrCode,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ResidentCredentialsModalProps {
  family: FamilyRecord;
  email: string;
  password: string;
  isOpen: boolean;
  onClose: () => void;
  isNewlyCreated?: boolean;
  onUpdatePassword?: (familyId: string, newPassword: string) => void;
}

export const ResidentCredentialsModal: React.FC<ResidentCredentialsModalProps> = ({
  family,
  email,
  password: initialPassword,
  isOpen,
  onClose,
  isNewlyCreated = false,
  onUpdatePassword
}) => {
  const [copiedField, setCopiedField] = useState<'email' | 'password' | 'all' | null>(null);
  const [showPassword, setShowPassword] = useState(true);
  const [currentPassword, setCurrentPassword] = useState(initialPassword);
  const [isResetting, setIsResetting] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);
  const [lastBlobUrl, setLastBlobUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const portalUrl = typeof window !== 'undefined' ? window.location.origin : 'https://portal.mahallu.org';

  const handleCopy = (text: string, field: 'email' | 'password' | 'all') => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleRegeneratePassword = () => {
    const cleanHouse = family.houseNo.replace(/[^a-zA-Z0-9]/g, '');
    const randomDigits = Math.floor(100 + Math.random() * 900);
    const newPass = `${cleanHouse}@MHL${randomDigits}`;
    setCurrentPassword(newPass);
    if (onUpdatePassword) {
      onUpdatePassword(family.id, newPass);
    }
    setIsResetting(true);
    setTimeout(() => setIsResetting(false), 800);
  };

  const fullShareText = `Assalamu Alaikum Janab ${family.headOfFamily},

Your Central Mahallu Jama'ath Resident Portal account is ready for House #${family.houseNo} (${family.houseName}).

🌐 Portal Website: ${portalUrl}
📧 Login Email ID: ${email}
🔑 Temporary Password: ${currentPassword}

You can log in to:
• View your registered household census particulars
• View & pay monthly subscription dues (payments) online
• Download official payment receipts
• Apply for NOC & Marriage Certificates

Please keep your login credentials confidential.
- Central Mahallu Jama'ath Committee`;

  const cleanPhone = family.phone.replace(/[^0-9]/g, '');
  const phoneParam = cleanPhone.length >= 10 ? cleanPhone : '';
  const encodedText = encodeURIComponent(fullShareText);
  const whatsappUrl = phoneParam 
    ? `https://wa.me/${phoneParam}?text=${encodedText}` 
    : `https://wa.me/?text=${encodedText}`;

  const handleShareWhatsApp = () => {
    // Copy the text to clipboard so it's guaranteed to be available
    try {
      navigator.clipboard.writeText(fullShareText);
      setCopiedField('all');
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      // ignore
    }
  };

  const generatePrintSlipHtml = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Mahallu Resident Access Slip - House #${family.houseNo}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      padding: 24px;
      line-height: 1.5;
    }
    .slip-card {
      max-width: 650px;
      margin: 0 auto;
      background: #ffffff;
      border: 2px solid #065f46;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(0,0,0,0.06);
    }
    .slip-header {
      background: linear-gradient(135deg, #064e3b, #047857);
      color: #ffffff;
      padding: 24px 20px;
      text-align: center;
      border-bottom: 3px solid #10b981;
    }
    .slip-header h1 {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .slip-header p {
      font-size: 12px;
      opacity: 0.9;
    }
    .badge {
      display: inline-block;
      margin-top: 10px;
      padding: 4px 14px;
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .content {
      padding: 24px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      background: #f1f5f9;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 20px;
      border: 1px solid #e2e8f0;
    }
    .info-item {
      font-size: 13px;
    }
    .info-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }
    .info-val {
      font-weight: 700;
      color: #0f172a;
    }
    .creds-box {
      background: #022c22;
      color: #ffffff;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      border: 1px solid #047857;
    }
    .cred-row {
      margin-bottom: 12px;
    }
    .cred-row:last-child {
      margin-bottom: 0;
    }
    .cred-label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #6ee7b7;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .cred-value {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 15px;
      font-weight: 800;
      background: rgba(0,0,0,0.3);
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #065f46;
      word-break: break-all;
    }
    .features-list {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 20px;
      font-size: 12px;
      color: #334155;
    }
    .features-list ul {
      margin-left: 20px;
      margin-top: 6px;
    }
    .features-list li {
      margin-bottom: 4px;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 16px;
      border-top: 1px dashed #cbd5e1;
      font-size: 11px;
      color: #64748b;
    }
    .seal-box {
      text-align: right;
    }
    .seal-box .sign {
      height: 32px;
      font-family: cursive;
      font-size: 18px;
      color: #065f46;
      margin-bottom: 2px;
    }
    .no-print {
      text-align: center;
      margin-bottom: 16px;
    }
    .btn {
      display: inline-block;
      background: #047857;
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      border: none;
    }
    @media print {
      body { background: transparent; padding: 0; }
      .no-print { display: none !important; }
      .slip-card { box-shadow: none; border-color: #047857; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" onclick="window.print()">Print This Slip</button>
  </div>
  <div class="slip-card">
    <div class="slip-header">
      <h1>EDAPPAL CENTRAL MAHALLU JAMA'ATH</h1>
      <p>Waqf Board Reg. No: KL/WQF/142/1984 • Edappal Central Mahallu</p>
      <div class="badge">Official Resident Portal Access Pass</div>
    </div>
    <div class="content">
      <div class="section-title">Household Particulars</div>
      <div class="grid-2">
        <div class="info-item">
          <div class="info-label">Head of Family</div>
          <div class="info-val">${family.headOfFamily}</div>
        </div>
        <div class="info-item">
          <div class="info-label">House Number</div>
          <div class="info-val">House #${family.houseNo} (${family.houseName})</div>
        </div>
        <div class="info-item">
          <div class="info-label">Mahallu Ward</div>
          <div class="info-val">${family.ward}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Registered Phone</div>
          <div class="info-val">${family.phone}</div>
        </div>
      </div>

      <div class="section-title">Confidential Login Credentials</div>
      <div class="creds-box">
        <div class="cred-row">
          <div class="cred-label">Portal Web Address</div>
          <div class="cred-value">${portalUrl}</div>
        </div>
        <div class="cred-row">
          <div class="cred-label">Resident Login ID (Email)</div>
          <div class="cred-value">${email}</div>
        </div>
        <div class="cred-row">
          <div class="cred-label">Temporary Access Password</div>
          <div class="cred-value">${currentPassword}</div>
        </div>
      </div>

      <div class="features-list">
        <strong>Services Available on the Resident Portal:</strong>
        <ul>
          <li>✓ View & verify registered family census records</li>
          <li>✓ Pay monthly Mahallu payments / subscription securely online</li>
          <li>✓ Instant download of digitally verified payment receipts</li>
          <li>✓ Apply online for Mahallu NOC & Marriage Registration certificates</li>
        </ul>
      </div>

      <div class="footer">
        <div>
          <div>Date of Issuance: September 21, 2026</div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Security: For resident household use only. Do not share.</div>
        </div>
        <div class="seal-box">
          <div class="sign">Abdul Rahman Haji</div>
          <div style="font-weight: 700; color: #0f172a;">General Secretary</div>
          <div style="font-size: 10px;">Central Mahallu Committee</div>
        </div>
      </div>
    </div>
  </div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        try { window.print(); } catch(e) {}
      }, 400);
    });
  </script>
</body>
</html>`;
  };

  const handlePrintSlip = () => {
    try {
      const htmlContent = generatePrintSlipHtml();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      setLastBlobUrl(blobUrl);

      // 1. Immediately trigger download of the official HTML slip so user has a working file on disk
      const cleanHouseNo = family.houseNo.replace(/[^a-zA-Z0-9]/g, '_');
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = `Mahallu_Access_Slip_House_${cleanHouseNo}.html`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // 2. Open printable view in a new window/tab (bypasses iframe sandbox restrictions)
      try {
        const printWindow = window.open(blobUrl, '_blank');
        if (printWindow) {
          printWindow.focus();
        }
      } catch (e) {
        console.warn('Popup blocked, using direct fallback', e);
      }

      // 3. Also try standard window.print() inside try/catch
      try {
        window.print();
      } catch (err) {
        console.warn('window.print blocked in iframe sandbox:', err);
      }

      // 4. Set visual notification
      setPrintSuccess(true);
      setTimeout(() => setPrintSuccess(false), 6000);
    } catch (e) {
      console.error('Error generating print slip:', e);
      try {
        window.print();
      } catch {
        // ignore
      }
    }
  };

  return (
    <div 
      id="resident-credentials-modal-overlay" 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div 
        id="resident-credentials-modal" 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none"
      >
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 p-6 text-white relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-bold border border-emerald-400/30 mb-1">
                  <span>{isNewlyCreated ? 'New Account Created' : 'Resident Access Pass'}</span>
                  <span>• House #{family.houseNo}</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight">
                  {isNewlyCreated ? 'Resident Portal Credentials Issued' : 'Resident Portal Account Details'}
                </h2>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  Official login access for {family.headOfFamily} ({family.houseName})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer print:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Slip Content */}
        <div className="p-6 space-y-6">
          
          {/* Official Letterhead (visible in print & screen) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Beneficiary Household</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {family.headOfFamily}
              </div>
              <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
                <span>House #{family.houseNo} ({family.houseName})</span>
                <span>•</span>
                <span>{family.ward}</span>
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Contact: {family.phone}
              </div>
            </div>

            <div className="shrink-0 sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Account Active</span>
              </span>
              <div className="text-[10px] text-slate-400 mt-1">
                Issued by Committee
              </div>
            </div>
          </div>

          {/* Credentials Highlight Card */}
          <div className="bg-emerald-950 text-white rounded-2xl p-5 shadow-inner border border-emerald-800/60 space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block mb-1.5">
                Resident Portal Login Email ID
              </label>
              <div className="flex items-center justify-between bg-black/30 border border-emerald-700/50 rounded-xl px-3.5 py-2.5">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono text-sm font-semibold tracking-wide truncate select-all">
                    {email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(email, 'email')}
                  className="px-2.5 py-1 bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer print:hidden"
                  title="Copy Email ID"
                >
                  {copiedField === 'email' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span className="text-emerald-200">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                  Temporary Access Password
                </label>
                <div className="flex items-center gap-2 print:hidden">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide' : 'Reveal'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRegeneratePassword}
                    className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 cursor-pointer ml-1"
                    title="Generate new random password"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-black/30 border border-emerald-700/50 rounded-xl px-3.5 py-2.5">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono text-sm font-bold tracking-wider select-all">
                    {showPassword ? currentPassword : '••••••••••••'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(currentPassword, 'password')}
                  className="px-2.5 py-1 bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer print:hidden"
                  title="Copy Password"
                >
                  {copiedField === 'password' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span className="text-emerald-200">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Portal Link Reference */}
            <div className="pt-2 border-t border-emerald-800/60 flex items-center justify-between text-xs text-emerald-300/90">
              <span className="flex items-center gap-1">
                <span>Portal Address:</span>
                <span className="font-mono text-white font-medium">{portalUrl}</span>
              </span>
              <span className="text-[11px] text-emerald-400">Encrypted 256-Bit</span>
            </div>
          </div>

          {/* How Resident Gets & Uses Credentials Advice */}
          <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl text-xs text-amber-950 space-y-1.5 print:hidden">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>How the Resident Accesses the Portal</span>
            </div>
            <p className="text-amber-900/90 leading-relaxed text-[11px]">
              The resident visits the portal homepage and enters their <strong>Login Email ID</strong> and <strong>Temporary Password</strong>. They will automatically be routed to their private household portal, where they can only see their family census particulars, subscription payments, and official certificates.
            </p>
          </div>

          {/* Print / Download Status Banner */}
          {printSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start justify-between gap-3 text-emerald-950 animate-in fade-in duration-200 print:hidden">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-emerald-900">
                    Official Access Slip Prepared & Downloaded!
                  </div>
                  <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                    The printable access slip for House #{family.houseNo} was generated and saved to your device. If your browser blocked the print pop-up inside this window, you can view or print the downloaded file directly.
                  </p>
                  {lastBlobUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <a
                        href={lastBlobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open printable slip in new window</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrintSuccess(false)}
                className="text-emerald-700 hover:text-emerald-900 p-1 text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Delivery & Sharing Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden">
            
            {/* WhatsApp Share - Uses anchor with target _blank and copy on click */}
            <a
              id="whatsapp-share-credentials-btn"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleShareWhatsApp}
              className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer no-underline text-center"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>Send via WhatsApp</span>
            </a>

            {/* Print Official Slip (Generates printable HTML, triggers download & opens print) */}
            <button
              id="print-credentials-slip-btn"
              type="button"
              onClick={handlePrintSlip}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                printSuccess 
                  ? 'bg-emerald-800 text-white' 
                  : 'bg-slate-800 hover:bg-slate-900 text-white'
              }`}
            >
              {printSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Printed & Saved!</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4 shrink-0" />
                  <span>Print Access Slip</span>
                </>
              )}
            </button>

            {/* Copy Full Credentials Note */}
            <button
              id="copy-all-credentials-btn"
              type="button"
              onClick={() => handleCopy(fullShareText, 'all')}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedField === 'all' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span className="text-emerald-800">All Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Copy Full Note</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <p className="text-[11px] text-slate-500">
            Admin may reprint or re-share this access slip anytime from the Directory.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
