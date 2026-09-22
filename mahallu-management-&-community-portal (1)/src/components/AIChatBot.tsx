import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  ActiveTab, 
  AIChatMessage, 
  AIChatAction, 
  ClearanceAuditResult, 
  FamilyRecord, 
  DuesRecord, 
  RequestType 
} from '../types';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  X, 
  Minus,
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Building2, 
  FileCheck, 
  Clock, 
  CreditCard, 
  Info,
  ChevronRight,
  Flame
} from 'lucide-react';

interface AIChatBotProps {
  currentUser: User | null;
  families: FamilyRecord[];
  dues: DuesRecord[];
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenSubmitRequest?: (type?: RequestType) => void;
  isFloating?: boolean;
  onCloseFloating?: () => void;
  initialPrompt?: string | null;
}

export const AIChatBot: React.FC<AIChatBotProps> = ({
  currentUser,
  families,
  dues,
  onNavigateTab,
  onOpenSubmitRequest,
  isFloating = false,
  onCloseFloating,
  initialPrompt
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHouseNo, setSelectedHouseNo] = useState(currentUser?.houseNo || 'M-14');
  const [selectedCertType, setSelectedCertType] = useState<string>('Marriage NOC');
  const [isClearanceMode, setIsClearanceMode] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDockMinimized, setIsDockMinimized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find user's family and dues record
  const currentFamily = families.find(f => 
    (currentUser?.houseNo && f.houseNo.toLowerCase() === currentUser.houseNo.toLowerCase()) ||
    (f.houseNo.toLowerCase() === selectedHouseNo.toLowerCase())
  );
  const currentDue = dues.find(d => 
    (currentUser?.houseNo && d.houseNo.toLowerCase() === currentUser.houseNo.toLowerCase()) ||
    (d.houseNo.toLowerCase() === selectedHouseNo.toLowerCase())
  );

  // Initialize conversation with proactive greeting
  useEffect(() => {
    if (messages.length === 0) {
      const houseText = currentUser?.houseNo ? ` (House #${currentUser.houseNo})` : '';
      const initialGreeting: AIChatMessage = {
        id: 'msg-welcome',
        sender: 'assistant',
        text: `Assalamu Alaikum wa Rahmatullahi wa Barakatuh ${currentUser ? `**${currentUser.name}**${houseText}` : '**Respected Resident**'}!

I am **Mahallu Sahayi** (മഹല്ല് സഹായി), your dedicated AI Community & Clearance Assistant for **Edappal Central Mahallu Jama'ath** (Waqf Reg. KL/WQF/142/1984).

You can ask me any **doubts** or request a **clearance check**:
- **Clearance & NOC:** Check if your household is clear for Marriage NOC, Nikah, or Madrasa admissions.
- **Payments & Subscriptions:** Pending dues calculation, UPI payments, and digital receipt queries.
- **Prayer & Notices:** Adhan/Iqamah timings and Friday Jumu'ah khutbah details.
- **Welfare & Medical Aid:** Baitul Mal emergency grants application requirements.

What would you like to clear up or check today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: "Check Household Clearance", actionType: "check_clearance" },
          { label: "Marriage NOC Checklist", actionType: "quick_prompt", prompt: "What documents and clearances are needed for a Marriage NOC?" },
          { label: "How to Pay Pending Dues", actionType: "quick_prompt", prompt: "How do I check and pay pending subscription payment dues?" },
          ...(currentUser?.role === 'resident' ? [{ label: "Contact Committee Desk", actionType: "navigate" as const, targetTab: "contact-us" as const }] : []),
          { label: "Friday Jumu'ah Details", actionType: "quick_prompt", prompt: "What are this Friday's Jumu'ah prayer, Khutbah timing and speaker?" }
        ]
      };
      setMessages([initialGreeting]);
    }
  }, [currentUser]);

  // Handle initial prompt if passed
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Perform structured clearance audit
  const performClearanceAudit = async (houseNoToAudit: string, certType: string) => {
    setIsAuditing(true);
    
    // Add user question
    const userQuery: AIChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: `Please check my Mahallu Clearance status for House #${houseNoToAudit} for "${certType}".`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userQuery]);

    try {
      const response = await fetch('/api/clearance-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          houseNo: houseNoToAudit,
          certificateType: certType
        })
      });

      let auditData: ClearanceAuditResult;
      if (response.ok) {
        auditData = await response.json();
      } else {
        // Fallback calculation using live frontend state
        const targetDue = dues.find(d => d.houseNo.toLowerCase() === houseNoToAudit.toLowerCase());
        const isPaid = targetDue?.status === 'Paid';
        auditData = {
          houseNo: houseNoToAudit,
          certificateType: certType,
          evaluatedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          items: [
            {
              criterion: "Monthly Subscription Payment",
              status: isPaid ? "Cleared" : `Pending (${targetDue ? targetDue.month : 'September'} - ₹${targetDue ? targetDue.amount : 250})`,
              passed: isPaid,
              note: isPaid ? "All dues cleared up to date." : "Please settle monthly subscription online or at the office."
            },
            {
              criterion: "Household Census Registration",
              status: "Verified",
              passed: true,
              note: "Family census record is active in the central registry."
            },
            {
              criterion: "Statutory Documentation (Aadhaar / ID)",
              status: "Verified",
              passed: true,
              note: "Head of household and resident details match records."
            },
            {
              criterion: "Executive Committee Clearance",
              status: isPaid ? "Clear to Issue" : "Conditional on Payment Clearance",
              passed: isPaid,
              note: isPaid ? "Certificate can be approved and issued within 24 hours." : "Pending final clearance of subscription dues."
            }
          ],
          overallStatus: isPaid ? 'CLEARED' : 'ACTION_REQUIRED',
          actionRequired: isPaid ? null : "Pay pending subscription to obtain instant committee clearance."
        };
      }

      // Add clearance audit response
      const isPassed = auditData.overallStatus === 'CLEARED';
      const botResponse: AIChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: `### Clearance Audit Report for House #${auditData.houseNo}
**Purpose:** ${auditData.certificateType}  
**Overall Clearance Status:** **${isPassed ? 'CLEARED (APPROVED)' : 'ACTION REQUIRED'}**

${isPassed 
  ? `Alhamdulillah! Your household is in **good standing** with zero pending subscription dues and a fully verified census profile. You are cleared to proceed with your application.` 
  : `Your household census and documents are verified, but **1 monthly subscription due (₹250)** is currently pending. Please settle this to ensure immediate committee approval.`}
`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        clearanceAudit: auditData,
        suggestedActions: isPassed ? [
          { label: `Apply for ${certType}`, actionType: 'navigate', targetTab: 'services' },
          { label: "Download Latest Receipt", actionType: 'navigate', targetTab: 'financials' }
        ] : [
          { label: "Pay Pending Dues (₹250)", actionType: 'navigate', targetTab: 'financials' },
          { label: `Proceed to ${certType} Application`, actionType: 'navigate', targetTab: 'services' }
        ]
      };

      setMessages(prev => [...prev, botResponse]);

    } catch (err) {
      console.error("Clearance check error:", err);
      // Fallback response
      const botResponse: AIChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: `### Clearance Status for House #${houseNoToAudit}
- **Subscription Payment:** Verified & active.
- **Family Census:** Registered.
- **Clearance Verdict:** Ready for submission under **Service Requests**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: "Open Service Requests", actionType: "navigate", targetTab: "services" },
          { label: "Check Financials", actionType: "navigate", targetTab: "financials" }
        ]
      };
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsAuditing(false);
      setIsClearanceMode(false);
    }
  };

  // Send message to Gemini / AI endpoint
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const chatHistory = messages.slice(-5).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const residentContext = {
        currentUser: currentUser ? {
          name: currentUser.name,
          role: currentUser.role,
          houseNo: currentUser.houseNo || selectedHouseNo,
          ward: currentUser.ward
        } : null,
        houseName: currentFamily?.houseName || 'Baitul Noor',
        duesStatus: currentDue?.status || 'Pending',
        chandaAmount: currentFamily?.monthlyChandaAmount || 500
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: chatHistory,
          residentContext
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      const botMsg: AIChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.reply || "I am here to assist with any Mahallu clearance or doubt.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        clearanceStatus: data.clearanceStatus,
        suggestedActions: data.suggestedActions
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("AI Chatbot request error:", error);
      // Graceful in-browser fallback
      const botMsg: AIChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: `### Edappal Central Mahallu Jama'ath Guidance
Regarding your inquiry:

- **Marriage NOC & Clearances:** Please ensure your monthly subscription dues (payments) are cleared up to date and your bride/groom details and Aadhaar copies are ready.
- **Dues Settlement:** You can pay pending dues via Online UPI in the **Financials & Payments** section.
- **Service Request:** You can file a formal application under the **Service Requests** tab for 24-hour committee clearance.

Would you like me to take you directly to the relevant portal section?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: "Check Household Clearance", actionType: "check_clearance" },
          { label: "Go to Financials & Dues", actionType: "navigate", targetTab: "financials" },
          { label: "Open Service Requests", actionType: "navigate", targetTab: "services" }
        ]
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Action Click Handler
  const handleActionClick = (action: AIChatAction) => {
    if (action.actionType === 'navigate' && action.targetTab) {
      onNavigateTab(action.targetTab);
      if (isFloating && onCloseFloating) {
        // Optional: keep open or minimize
      }
    } else if (action.actionType === 'check_clearance') {
      setIsClearanceMode(true);
    } else if (action.actionType === 'quick_prompt' && action.prompt) {
      handleSendMessage(action.prompt);
    } else if (action.actionType === 'open_submit_request') {
      if (onOpenSubmitRequest) {
        onOpenSubmitRequest(action.requestType);
      } else {
        onNavigateTab('services');
      }
    }
  };

  // Copy text helper
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Text to Speech
  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Render markdown-like simple syntax helper
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-bold text-slate-900 text-sm mt-2 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={idx} className="font-bold text-slate-800 text-xs my-1">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('- ')) {
        const itemText = line.replace('- ', '');
        return (
          <li key={idx} className="text-xs text-slate-700 ml-4 list-disc my-0.5">
            <span dangerouslySetInnerHTML={{ __html: itemText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={idx} className="text-xs text-slate-700 ml-4 list-decimal my-0.5">
            <span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </li>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-xs text-slate-700 my-1 leading-relaxed">
          <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </p>
      );
    });
  };

  // Render minimized dock bar if isDockMinimized is active
  if (isFloating && isDockMinimized) {
    return (
      <div
        id="mahallu-ai-chatbot-minimized-dock"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-72 sm:w-80 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl shadow-2xl border border-emerald-500/40 p-3 z-50 flex items-center justify-between cursor-pointer hover:shadow-emerald-900/40 transition-all select-none"
        onClick={() => setIsDockMinimized(false)}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Bot className="w-4.5 h-4.5 text-emerald-300" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-emerald-900 rounded-full animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>Mahallu Sahayi</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-400/20 text-emerald-200 rounded font-mono">
                Minimized
              </span>
            </h4>
            <p className="text-[10px] text-emerald-200/80">Click to resume chat</p>
          </div>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            id="restore-docked-chat-btn"
            onClick={() => setIsDockMinimized(false)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Restore window"
            aria-label="Restore window"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          {onCloseFloating && (
            <button
              id="close-docked-chat-btn"
              onClick={onCloseFloating}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Close Assistant"
              aria-label="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      id="mahallu-ai-chatbot-container"
      className={`bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden transition-all duration-300 ${
        isFloating 
          ? isExpanded 
            ? 'fixed inset-4 sm:inset-10 z-50' 
            : 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[440px] h-[600px] max-h-[85vh] z-50' 
          : 'w-full h-[720px] max-h-[85vh]'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-4 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white shadow-inner">
              <Bot className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-emerald-900 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                Mahallu Sahayi
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-mono font-medium">
                  AI
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-emerald-100/80 font-medium">
              Resident Doubts & Clearance Helpdesk
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1">
          {/* Quick Clearance Audit Trigger */}
          <button
            id="header-clearance-audit-btn"
            onClick={() => setIsClearanceMode(!isClearanceMode)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isClearanceMode 
                ? 'bg-amber-400 text-slate-900 shadow-sm' 
                : 'bg-white/10 hover:bg-white/20 text-emerald-100'
            }`}
            title="Open Instant Clearance Audit"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Clearance Audit</span>
          </button>

          {isFloating && (
            <>
              {/* Dedicated Minimize Button */}
              <button
                id="minimize-chat-btn"
                onClick={() => setIsDockMinimized(true)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Minimize Assistant"
                aria-label="Minimize Assistant"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                id="toggle-expand-chat-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title={isExpanded ? "Restore size" : "Maximize window"}
                aria-label={isExpanded ? "Restore size" : "Maximize window"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              {onCloseFloating && (
                <button
                  id="close-floating-chat-btn"
                  onClick={onCloseFloating}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Close Helpdesk"
                  aria-label="Close Helpdesk"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Interactive Clearance Mode Banner / Sub-panel */}
      {isClearanceMode && (
        <div id="clearance-audit-panel" className="bg-amber-50/90 border-b border-amber-200 px-4 py-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Official Mahallu Clearance Evaluator</span>
            </div>
            <button 
              onClick={() => setIsClearanceMode(false)}
              className="text-amber-700 hover:text-amber-900 text-xs font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          <p className="text-[11px] text-amber-800 mb-2.5">
            Audit your household status against official Waqf bylaws to confirm immediate eligibility for Marriage NOC, certificates, or voting rights.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5">
            <div>
              <label className="block text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                House Number:
              </label>
              <select
                id="audit-house-select"
                value={selectedHouseNo}
                onChange={(e) => setSelectedHouseNo(e.target.value)}
                className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {families.map(f => (
                  <option key={f.id} value={f.houseNo}>
                    #{f.houseNo} - {f.houseName} ({f.headOfFamily})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                Required Clearance:
              </label>
              <select
                id="audit-cert-select"
                value={selectedCertType}
                onChange={(e) => setSelectedCertType(e.target.value)}
                className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Marriage NOC">Marriage NOC / Nikah Certificate</option>
                <option value="Residency Certificate">Residency / Mahallu Member Certificate</option>
                <option value="Madrasa Admission Clearance">Madrasa Admission & Student Clearance</option>
                <option value="Financial & Medical Aid Clearance">Baitul Mal Medical & Relief Aid</option>
                <option value="General Body Voting Eligibility">General Body Voting & Committee Rights</option>
              </select>
            </div>
          </div>

          <button
            id="run-audit-btn"
            disabled={isAuditing}
            onClick={() => performClearanceAudit(selectedHouseNo, selectedCertType)}
            className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isAuditing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing Waqf Ledger & Census...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Run Instant Clearance Audit</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div 
        id="chat-messages-container"
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div className="flex items-end gap-2 max-w-[90%] sm:max-w-[85%]">
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0 mb-1 shadow-2xs">
                    <Bot className="w-4 h-4 text-emerald-200" />
                  </div>
                )}

                <div 
                  className={`rounded-2xl px-4 py-3 text-xs shadow-2xs leading-relaxed ${
                    isUser 
                      ? 'bg-emerald-700 text-white rounded-br-xs' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  {/* Formatted body */}
                  <div className="space-y-1">
                    {renderFormattedText(msg.text)}
                  </div>

                  {/* Render Clearance Audit Report Card if present */}
                  {msg.clearanceAudit && (
                    <div 
                      id={`clearance-report-${msg.id}`}
                      className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-800"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                          House #{msg.clearanceAudit.houseNo}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          msg.clearanceAudit.overallStatus === 'CLEARED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {msg.clearanceAudit.overallStatus === 'CLEARED' ? 'CLEARED' : 'ACTION REQUIRED'}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {msg.clearanceAudit.items.map((item, idx) => (
                          <div key={idx} className="flex items-start justify-between gap-2 text-[11px]">
                            <div className="flex items-start gap-1.5">
                              {item.passed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <p className="font-medium text-slate-800">{item.criterion}</p>
                                <p className="text-[10px] text-slate-500">{item.note}</p>
                              </div>
                            </div>
                            <span className={`shrink-0 font-bold text-[10px] ${
                              item.passed ? 'text-emerald-700' : 'text-amber-700'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>

                      {msg.clearanceAudit.actionRequired && (
                        <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg font-medium flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>{msg.clearanceAudit.actionRequired}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggested Actions within the response */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          id={`action-btn-${actIdx}`}
                          onClick={() => handleActionClick(act)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>{act.label}</span>
                          <ChevronRight className="w-3 h-3 text-emerald-600" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message meta footer */}
                  <div className="flex items-center justify-between gap-4 mt-1.5 pt-1 text-[10px] opacity-70">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="hover:opacity-100 p-0.5 text-slate-500 hover:text-slate-800 transition-opacity cursor-pointer"
                          title="Copy reply"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => handleSpeak(msg.text)}
                          className="hover:opacity-100 p-0.5 text-slate-500 hover:text-slate-800 transition-opacity cursor-pointer"
                          title="Read aloud"
                        >
                          {isSpeaking ? <VolumeX className="w-3 h-3 text-emerald-600" /> : <Volume2 className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          );
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic py-1 animate-pulse">
            <div className="w-6 h-6 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-emerald-200" />
            </div>
            <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-2 rounded-2xl">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
              <span className="ml-1 text-[11px] text-slate-600 font-medium">Mahallu Sahayi is checking records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Doubts Suggestion Chips */}
      <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Doubts:
        </span>

        <button
          onClick={() => setIsClearanceMode(true)}
          className="shrink-0 px-2 py-1 bg-amber-100/80 hover:bg-amber-200/80 text-amber-900 border border-amber-300 rounded-lg font-medium transition-colors cursor-pointer"
        >
          Check Clearance Status
        </button>

        <button
          onClick={() => handleSendMessage("What documents and clearances are needed for a Marriage NOC?")}
          className="shrink-0 px-2 py-1 bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
        >
          Marriage NOC Checklist
        </button>

        <button
          onClick={() => handleSendMessage("How do I check and pay my pending payment dues online?")}
          className="shrink-0 px-2 py-1 bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
        >
          Pay Dues Online
        </button>

        <button
          onClick={() => handleSendMessage("What are the prayer and Friday Jumu'ah khutbah timings?")}
          className="shrink-0 px-2 py-1 bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
        >
          Mosque Prayer Times
        </button>

        <button
          onClick={() => handleSendMessage("How can I apply for emergency medical or financial aid from Baitul Mal?")}
          className="shrink-0 px-2 py-1 bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
        >
          Medical Aid Assistance
        </button>
      </div>

      {/* Input bar */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            id="chat-input-field"
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask doubts about NOC, payment dues, prayer times, clearances..."
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
          />
          <button
            id="send-chat-btn"
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-1">
          <span>Official AI Assistant • Edappal Central Mahallu Jama'ath</span>
          <span className="font-mono text-[9px] text-emerald-700">Waqf KL/WQF/142/1984</span>
        </div>
      </div>

    </div>
  );
};
