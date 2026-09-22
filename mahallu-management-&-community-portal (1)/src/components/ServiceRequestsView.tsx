import React, { useState, useEffect } from 'react';
import { ServiceRequest, RequestType, RequestStatus, Role, User, CommitteeMessage, CommitteeMessageStatus } from '../types';
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Download, 
  Eye, 
  X, 
  Award, 
  Send, 
  FileCheck, 
  UserCheck, 
  Building2,
  Users,
  UserPlus,
  FileEdit,
  Sparkles,
  ShieldCheck,
  Lock,
  Inbox,
  MessageSquare,
  Phone,
  PhoneCall,
  Mail,
  Calendar,
  Flame,
  Search,
  Check
} from 'lucide-react';

interface ServiceRequestsViewProps {
  requests: ServiceRequest[];
  currentUser: User;
  committeeMessages?: CommitteeMessage[];
  onUpdateCommitteeMessageStatus?: (msgId: string, status: CommitteeMessageStatus, replyText?: string) => void;
  initialPrefill?: { type: RequestType; subject: string; details?: string } | null;
  onClearPrefill?: () => void;
  onOpenCertificate: (request: ServiceRequest) => void;
  onSubmitRequest: (request: ServiceRequest) => void;
  onUpdateStatus: (requestId: string, status: RequestStatus, remarks: string) => void;
}

export const ServiceRequestsView: React.FC<ServiceRequestsViewProps> = ({
  requests,
  currentUser,
  committeeMessages = [],
  onUpdateCommitteeMessageStatus,
  initialPrefill,
  onClearPrefill,
  onOpenCertificate,
  onSubmitRequest,
  onUpdateStatus
}) => {
  const isUserAdmin = currentUser.role === 'admin';

  // Active section tab: Formal Certificate/Service Requests vs Resident Contact Inquiries
  const [activeSection, setActiveSection] = useState<'formal-services' | 'contact-inquiries'>('formal-services');

  // Submit Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<RequestType>('Add / Edit Family Members');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [applicantName, setApplicantName] = useState(currentUser.name);
  const [houseNo, setHouseNo] = useState(currentUser.houseNo || 'M-14');
  const [phone, setPhone] = useState(currentUser.phone || '+91 94462 88123');
  const [ward, setWard] = useState(currentUser.ward || 'Ward 2 - Madina Colony');

  // Admin Review Modal for Formal Requests
  const [reviewingRequest, setReviewingRequest] = useState<ServiceRequest | null>(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [newStatus, setNewStatus] = useState<RequestStatus>('Approved');

  // Admin Review / Reply Modal for Contact Us Inquiries
  const [reviewingMessage, setReviewingMessage] = useState<CommitteeMessage | null>(null);
  const [msgStatus, setMsgStatus] = useState<CommitteeMessageStatus>('Replied');
  const [msgReplyText, setMsgReplyText] = useState('');

  // Search & Filters for Inquiries
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'all' | CommitteeMessageStatus>('all');

  // Accessible Inquiries List (Admin sees all, Resident sees only their own)
  const accessibleMessages = (committeeMessages || []).filter(msg => {
    if (isUserAdmin) return true;
    const userHouse = currentUser.houseNo?.trim().toLowerCase();
    const userName = currentUser.name?.trim().toLowerCase();
    const msgHouse = msg.houseNo?.trim().toLowerCase();
    const msgName = msg.senderName?.trim().toLowerCase();
    return (userHouse && msgHouse === userHouse) || (userName && msgName === userName);
  });

  const filteredInquiries = accessibleMessages.filter(msg => {
    const matchesSearch = 
      msg.referenceNo.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      msg.senderName.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      msg.houseNo.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      msg.subject.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      msg.message.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      msg.category.toLowerCase().includes(inquirySearch.toLowerCase());
    
    const matchesStatus = inquiryStatusFilter === 'all' || msg.status === inquiryStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingInquiriesCount = accessibleMessages.filter(m => m.status === 'Pending' || m.status === 'In Review').length;

  // Strict Scoping for Formal Requests:
  // Admin -> Access to all service requests and full history across all households
  // Resident -> STRICTLY and exclusively access only to their own requests & history. Other residents' details are hidden.
  const accessibleRequests = requests.filter(req => {
    if (isUserAdmin) return true;

    const userHouse = currentUser.houseNo?.trim().toLowerCase();
    const userName = currentUser.name?.trim().toLowerCase();
    const userPhone = currentUser.phone ? currentUser.phone.replace(/\D/g, '') : '';

    const reqHouse = req.houseNo?.trim().toLowerCase();
    const reqName = req.applicantName?.trim().toLowerCase();
    const reqPhone = req.phone ? req.phone.replace(/\D/g, '') : '';

    const matchHouse = Boolean(userHouse && reqHouse && reqHouse === userHouse);
    const matchName = Boolean(userName && reqName && (reqName === userName || reqName.includes(userName) || userName.includes(reqName)));
    const matchPhone = Boolean(userPhone && reqPhone && (reqPhone === userPhone || reqPhone.endsWith(userPhone) || userPhone.endsWith(reqPhone)));

    return matchHouse || matchName || matchPhone;
  });

  // Handle incoming prefill (e.g. when resident clicks "Request Update" from Directory)
  useEffect(() => {
    if (initialPrefill) {
      setRequestType(initialPrefill.type);
      setSubject(initialPrefill.subject);
      if (initialPrefill.details) {
        setDetails(initialPrefill.details);
      }
      setApplicantName(currentUser.name);
      setHouseNo(currentUser.houseNo || 'M-14');
      setPhone(currentUser.phone || '+91 94462 88123');
      setWard(currentUser.ward || 'Ward 2 - Madina Colony');
      setIsSubmitModalOpen(true);
      onClearPrefill?.();
    }
  }, [initialPrefill, currentUser, onClearPrefill]);

  // Insert standard member census template helper
  const handleInsertMemberTemplate = () => {
    const template = `MEMBER UPDATE PARTICULAR:
• Action: [Add New Member / Edit Existing Member / Remove Member]
• Full Legal Name: 
• Relationship to Head: [Spouse / Son / Daughter / Mother / Father / Brother / Sister]
• Gender: [Male / Female]
• Age & Date of Birth: 
• Blood Group: [A+ / B+ / O+ / AB+ / A- / B- / O- / AB-]
• Marital Status: [Single / Married / Widowed]
• Occupation: 
• Educational Qualification: 
• Status: [Resident in Mahallu / NRI Abroad]
• Supporting Documents Attached/Available: [Birth Certificate / Aadhaar / Nikah Record / TC]
• Reason / Remarks: `;
    
    setDetails(prev => prev ? `${prev}\n\n${template}` : template);
  };

  // Requests stream within accessible scope
  const filteredRequests = accessibleRequests;

  const pendingCount = accessibleRequests.filter(r => r.status === 'Pending' || r.status === 'In Review').length;
  const approvedCount = accessibleRequests.filter(r => r.status === 'Approved').length;
  const rejectedCount = accessibleRequests.filter(r => r.status === 'Rejected').length;

  const handleOpenReview = (req: ServiceRequest) => {
    setReviewingRequest(req);
    setNewStatus(req.status);
    setAdminRemarks(req.adminRemarks || '');
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingRequest) return;
    onUpdateStatus(reviewingRequest.id, newStatus, adminRemarks);
    setReviewingRequest(null);
  };

  const handleSubmitNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !details) return;

    // For resident users, always use their authenticated identity to ensure proper association
    const resolvedApplicant = isUserAdmin ? applicantName : currentUser.name;
    const resolvedHouseNo = isUserAdmin ? houseNo : (currentUser.houseNo || 'M-14');
    const resolvedWard = isUserAdmin ? ward : (currentUser.ward || 'Ward 2 - Madina Colony');
    const resolvedPhone = phone || currentUser.phone || '+91 94462 88123';

    const newReq: ServiceRequest = {
      id: `req-${Date.now()}`,
      refNo: `MHL-REQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: requestType,
      applicantName: resolvedApplicant,
      houseNo: resolvedHouseNo,
      phone: resolvedPhone,
      ward: resolvedWard,
      subject,
      details,
      submittedAt: '2026-09-22 10:30 AM',
      updatedAt: '2026-09-22 10:30 AM',
      status: 'Pending',
      adminRemarks: 'Application received online. Forwarded to Mahallu Secretariat desk for document verification.'
    };

    onSubmitRequest(newReq);
    setIsSubmitModalOpen(false);
    setSubject('');
    setDetails('');
  };

  return (
    <div id="service-requests-module" className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isUserAdmin ? 'Services, Certificates & Grievances' : 'My Service Requests & Inquiries'}
            </h2>
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full inline-flex items-center gap-1 ${
              isUserAdmin 
                ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {isUserAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                  <span>Admin Desk • Full Mahallu Records</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-emerald-700" />
                  <span>Resident Portal • House #{currentUser.houseNo || 'M-14'}</span>
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isUserAdmin
              ? 'Secretariat oversight: Review official certificates, verify NOCs, and respond directly to resident communications & grievances.'
              : `View and manage your household's service applications and track communications sent to the Mahallu committee.`}
          </p>
        </div>

        {activeSection === 'formal-services' && (
          <button
            id="new-service-request-btn"
            onClick={() => {
              setApplicantName(currentUser.name);
              setHouseNo(currentUser.houseNo || 'M-14');
              setPhone(currentUser.phone || '+91 94462 88123');
              setWard(currentUser.ward || 'Ward 2 - Madina Colony');
              setIsSubmitModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Submit New Request / Petition</span>
          </button>
        )}
      </div>

      {/* Primary Section Switcher Tabs (Formal Requests vs Contact Us Inquiries) */}
      <div className="flex border-b border-slate-200 bg-white px-3 pt-2 rounded-2xl shadow-2xs gap-2">
        <button
          onClick={() => setActiveSection('formal-services')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSection === 'formal-services'
              ? 'border-emerald-700 text-emerald-900 bg-emerald-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Formal Services & Certificates</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('contact-inquiries')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSection === 'contact-inquiries'
              ? 'border-emerald-700 text-emerald-900 bg-emerald-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Resident Inquiries & Grievances (Contact Us)</span>
          {pendingInquiriesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 font-bold">
              {pendingInquiriesCount} new
            </span>
          )}
        </button>
      </div>

      {activeSection === 'formal-services' ? (
        <>
          {/* Quick Status Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Stat Pill: In Review / Pending */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {isUserAdmin ? 'Pending Committee Action' : 'My Active Petitions'}
                </span>
                <div className="text-xl font-black text-amber-700 mt-1">
                  {pendingCount}
                </div>
                <span className="text-[10px] text-slate-400">Under verification or review</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* Stat Pill: Approved & Ready */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {isUserAdmin ? 'Total Approved' : 'Approved & Certificates'}
                </span>
                <div className="text-xl font-black text-emerald-700 mt-1">
                  {approvedCount}
                </div>
                <span className="text-[10px] text-slate-400">Officially verified & issued</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

      {/* Requests Stream / Cards */}
      {filteredRequests.length === 0 ? (
        <div id="no-service-requests-state" className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            {isUserAdmin ? 'No Applications Recorded' : 'No Service Applications Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4 leading-relaxed">
            {isUserAdmin
              ? 'There are currently no service requests recorded in the system.'
              : `There are currently no service requests or certificates recorded for your household (House #${currentUser.houseNo || 'M-14'}). If you need an official NOC, Marriage Registration Extract, or census update, click below.`}
          </p>
          {!isUserAdmin && (
            <button
              onClick={() => {
                setApplicantName(currentUser.name);
                setHouseNo(currentUser.houseNo || 'M-14');
                setPhone(currentUser.phone || '+91 94462 88123');
                setWard(currentUser.ward || 'Ward 2 - Madina Colony');
                setIsSubmitModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit First Application</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRequests.map((req) => {
            const isApproved = req.status === 'Approved';
            const isPending = req.status === 'Pending';
            const isInReview = req.status === 'In Review';
            const isRejected = req.status === 'Rejected';
            const canViewCertificate = isApproved && (req.type === 'Marriage Certificate' || req.type === 'NOC Certificate');

            return (
              <div
                key={req.id}
                id={`request-card-${req.refNo}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-all"
              >
                <div>
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {req.refNo}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        req.type === 'Add / Edit Family Members'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : req.type === 'Marriage Certificate'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                      }`}>
                        {req.type === 'Add / Edit Family Members' && <Users className="w-3 h-3 text-purple-700" />}
                        <span>{req.type}</span>
                      </span>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isApproved
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : isInReview
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : isPending
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {isInReview && <Clock className="w-3 h-3 text-blue-600" />}
                      {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                      {isRejected && <XCircle className="w-3 h-3 text-rose-600" />}
                      <span>{req.status}</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 tracking-tight mt-1">{req.subject}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{req.details}</p>

                  {/* Applicant Details */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Applicant:</span>
                      <span className="font-bold text-slate-800">{req.applicantName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Household:</span>
                      <span className="font-semibold text-slate-700">House #{req.houseNo} • {req.ward}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Contact:</span>
                      <span className="font-mono text-slate-600">{req.phone}</span>
                    </div>
                  </div>

                  {/* Committee Decision / Officer Remarks */}
                  {req.adminRemarks && (
                    <div className="mt-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block mb-0.5">
                        Committee Decision / Officer Remarks:
                      </span>
                      <p className="text-slate-700 italic">{req.adminRemarks}</p>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Submitted: {req.submittedAt}
                  </span>

                  <div className="flex items-center gap-2">
                    {canViewCertificate && (
                      <button
                        id={`view-cert-btn-${req.refNo}`}
                        onClick={() => onOpenCertificate(req)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5 text-emerald-700" />
                        <span>View Official Certificate</span>
                      </button>
                    )}

                    {isUserAdmin && (
                      <button
                        id={`review-btn-${req.refNo}`}
                        onClick={() => handleOpenReview(req)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Update Status
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
      ) : (
        /* Resident Inquiries & Grievances (Contact Us Stream) */
        <div className="space-y-4">
          {/* Inquiries Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search inquiries by Reference #, sender name, house #, or keywords..."
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              {(['all', 'Pending', 'In Review', 'Replied', 'Resolved'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setInquiryStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    inquiryStatusFilter === st
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' ? 'All Inquiries' : st}
                </button>
              ))}
            </div>
          </div>

          {filteredInquiries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">No Inquiries Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {inquirySearch || inquiryStatusFilter !== 'all'
                  ? 'No resident communications match your filter criteria.'
                  : 'There are currently no Contact Us inquiries or grievances recorded in the committee inbox.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredInquiries.map((msg) => {
                const isPending = msg.status === 'Pending';
                const isInReview = msg.status === 'In Review';
                const isReplied = msg.status === 'Replied';
                const isResolved = msg.status === 'Resolved';
                const isUrgent = msg.urgency === 'Urgent';
                const isHigh = msg.urgency === 'High';

                return (
                  <div
                    key={msg.id}
                    id={`inquiry-card-${msg.referenceNo}`}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-all"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            {msg.referenceNo}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {msg.category}
                          </span>
                          {isUrgent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <Flame className="w-3 h-3 text-rose-600" />
                              Urgent Priority
                            </span>
                          )}
                          {isHigh && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              High Priority
                            </span>
                          )}
                        </div>

                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isResolved
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isReplied
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : isInReview
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {isResolved && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {isReplied && <Check className="w-3 h-3 text-blue-600" />}
                          {isInReview && <Clock className="w-3 h-3 text-amber-600" />}
                          {isPending && <Clock className="w-3 h-3 text-rose-600" />}
                          <span>{msg.status}</span>
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 tracking-tight mt-1">{msg.subject}</h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                        {msg.message}
                      </p>

                      {/* Resident Contact Info */}
                      <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Resident:</span>
                          <span className="font-bold text-slate-800">{msg.senderName} (House #{msg.houseNo})</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Ward:</span>
                          <span className="text-slate-700">{msg.ward}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Phone & Contact:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-800">{msg.phone}</span>
                            <a
                              href={`tel:${msg.phone.replace(/\s+/g, '')}`}
                              className="p-1 bg-white border border-slate-200 hover:bg-emerald-50 text-emerald-700 rounded-md transition-colors"
                              title="Call Resident"
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                            <a
                              href={`https://wa.me/${msg.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors text-[10px] font-bold px-1.5"
                              title="WhatsApp Resident"
                            >
                              WA
                            </a>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Preferred Response:</span>
                          <span className="font-semibold text-emerald-800">{msg.preferredResponse}</span>
                        </div>
                        {msg.requestedAppointmentDate && (
                          <div className="flex justify-between items-center text-amber-900 bg-amber-50/80 p-1.5 rounded-lg border border-amber-200">
                            <span className="font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Requested Appointment:
                            </span>
                            <span className="font-bold">{msg.requestedAppointmentDate}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500 font-medium">Assigned Officer:</span>
                          <span className="font-semibold text-slate-800">{msg.assignedTo}</span>
                        </div>
                      </div>

                      {/* Official Committee Reply If Any */}
                      {msg.committeeReply && (
                        <div className="mt-3 p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs space-y-1">
                          <div className="flex items-center justify-between text-emerald-950 font-bold">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                              Official Response by {msg.committeeReply.repliedBy}:
                            </span>
                            <span className="text-[10px] font-normal text-emerald-700">{msg.committeeReply.repliedAt}</span>
                          </div>
                          <p className="text-emerald-900 leading-relaxed">{msg.committeeReply.replyText}</p>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400">
                        Received: {msg.sentAt}
                      </span>

                      {isUserAdmin && (
                        <button
                          onClick={() => {
                            setReviewingMessage(msg);
                            setMsgStatus(msg.status === 'Pending' ? 'Replied' : msg.status);
                            setMsgReplyText(msg.committeeReply?.replyText || '');
                          }}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          <span>Respond / Update Status</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Submit Request Modal */}
      {isSubmitModalOpen && (
        <div id="submit-request-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-emerald-900 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {isUserAdmin ? 'Record Mahallu Service Application' : 'Submit Mahallu Service Application'}
                </h3>
                <p className="text-xs text-emerald-200">
                  {isUserAdmin 
                    ? 'Administrative intake on behalf of Mahallu resident' 
                    : `Direct submission from House #${currentUser.houseNo || 'M-14'}`}
                </p>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewRequest} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service / Application Category *</label>
                <select
                  id="service-category-select"
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as RequestType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  <option value="Add / Edit Family Members">Census Update: Add / Edit Family Members (കുടുംബാംഗങ്ങളെ ചേർക്കുക / തിരുത്തുക)</option>
                  <option value="NOC Certificate">No Objection Certificate (NOC)</option>
                  <option value="Marriage Certificate">Marriage Registration Extract / Nikah Certificate</option>
                  <option value="Financial & Medical Aid">Emergency Medical & Financial Assistance (Zakat/Aid)</option>
                  <option value="Grievance / Petition">Public Grievance, Civic Maintenance, or Mediation</option>
                </select>
              </div>

              {requestType === 'Add / Edit Family Members' && (
                <div className="p-3.5 bg-purple-50/90 border border-purple-200 rounded-xl text-purple-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-xs text-purple-900">
                      <Users className="w-4 h-4 text-purple-700" />
                      Family Member Census Update Petition
                    </span>
                    <button
                      type="button"
                      onClick={handleInsertMemberTemplate}
                      className="px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-800 border border-purple-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>Insert Member Template</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-purple-800 leading-relaxed">
                    Use this official petition to request addition of newborns, newly married spouses, or update member qualifications, blood groups, occupations, or NRI statuses in the official Mahallu census records.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject / Purpose Headline *</label>
                <input
                  type="text"
                  placeholder={
                    requestType === 'Add / Edit Family Members'
                      ? "e.g. Census Update: Add newborn child (Ayaan) / Update qualification for Fatima..."
                      : "e.g. NOC for Residential Electricity Connection..."
                  }
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              {/* Applicant Identity Section */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    Applicant Credentials
                  </span>
                  {!isUserAdmin ? (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      Verified Profile
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      Admin Override
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Applicant Name</label>
                    <input
                      type="text"
                      value={isUserAdmin ? applicantName : currentUser.name}
                      onChange={(e) => setApplicantName(e.target.value)}
                      disabled={!isUserAdmin}
                      className={`w-full px-3 py-2 border rounded-xl ${
                        !isUserAdmin 
                          ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed font-medium' 
                          : 'bg-white border-slate-300'
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">House Number</label>
                    <input
                      type="text"
                      value={isUserAdmin ? houseNo : (currentUser.houseNo || 'M-14')}
                      onChange={(e) => setHouseNo(e.target.value)}
                      disabled={!isUserAdmin}
                      className={`w-full px-3 py-2 border rounded-xl ${
                        !isUserAdmin 
                          ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed font-medium' 
                          : 'bg-white border-slate-300'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ward / Block</label>
                    {isUserAdmin ? (
                      <select
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                      >
                        <option value="Ward 1 - Bilal Nagar">Ward 1 - Bilal Nagar</option>
                        <option value="Ward 2 - Madina Colony">Ward 2 - Madina Colony</option>
                        <option value="Ward 3 - Edappal Town">Ward 3 - Edappal Town</option>
                        <option value="Ward 4 - Quba Junction">Ward 4 - Quba Junction</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={currentUser.ward || 'Ward 2 - Madina Colony'}
                        disabled
                        className="w-full px-3 py-2 border rounded-xl bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed font-medium"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Explanation / Context *</label>
                <textarea
                  rows={requestType === 'Add / Edit Family Members' ? 6 : 4}
                  placeholder={
                    requestType === 'Add / Edit Family Members'
                      ? "Specify member particulars (Name, relation, age, gender, blood group, occupation, education, marital status, and reasons for addition/update)... or click 'Insert Member Template' above."
                      : "Provide supporting details, register dates, or specifics..."
                  }
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 font-sans"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Status Review Modal */}
      {reviewingRequest && isUserAdmin && (
        <div id="admin-review-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-emerald-400 font-bold">{reviewingRequest.refNo}</span>
                <h3 className="text-base font-bold mt-0.5">Admin Request Review</h3>
              </div>
              <button
                onClick={() => setReviewingRequest(null)}
                className="p-1 text-slate-300 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Application Subject</label>
                <p className="text-slate-800 font-bold">{reviewingRequest.subject}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{reviewingRequest.applicantName} (H# {reviewingRequest.houseNo})</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Update Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RequestStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Review">In Review</option>
                  <option value="Approved">Approved (Generate Certificate)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Committee Remarks / Endorsement Note *</label>
                <textarea
                  rows={3}
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="Enter official resolution or verification note..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewingRequest(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Update & Save Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Review / Reply Modal for Contact Us Inquiries */}
      {reviewingMessage && isUserAdmin && (
        <div id="admin-inquiry-reply-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-emerald-400 font-bold">{reviewingMessage.referenceNo}</span>
                <h3 className="text-base font-bold mt-0.5">Respond to Resident Inquiry</h3>
              </div>
              <button
                onClick={() => setReviewingMessage(null)}
                className="p-1 text-slate-300 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onUpdateCommitteeMessageStatus) {
                  onUpdateCommitteeMessageStatus(reviewingMessage.id, msgStatus, msgReplyText);
                }
                setReviewingMessage(null);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Resident:</span>
                  <span className="font-bold text-slate-800">{reviewingMessage.senderName} (H# {reviewingMessage.houseNo})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Subject:</span>
                  <span className="font-semibold text-slate-800">{reviewingMessage.subject}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Preferred Contact:</span>
                  <span className="font-semibold text-emerald-700">{reviewingMessage.preferredResponse}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inquiry Message</label>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 whitespace-pre-line">
                  {reviewingMessage.message}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Update Status *</label>
                <select
                  value={msgStatus}
                  onChange={(e) => setMsgStatus(e.target.value as CommitteeMessageStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Review">In Review</option>
                  <option value="Replied">Replied</option>
                  <option value="Resolved">Resolved & Closed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Committee Reply / Notes</label>
                <textarea
                  rows={3}
                  value={msgReplyText}
                  onChange={(e) => setMsgReplyText(e.target.value)}
                  placeholder="Enter official committee reply, phone call notes, or resolution..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewingMessage(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save & Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

