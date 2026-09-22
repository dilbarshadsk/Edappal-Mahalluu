import React, { useState } from 'react';
import { 
  User, 
  ActiveTab, 
  FamilyRecord, 
  DuesRecord, 
  DonationCampaign, 
  DonationContribution, 
  PrayerSchedule, 
  NoticeItem, 
  CommunityEvent, 
  ServiceRequest, 
  RequestType,
  RequestStatus,
  CommitteeMessage,
  CommitteeMessageCategory,
  CommitteeMessageStatus,
  MadrassaStudent
} from './types';
import { 
  DEMO_USERS, 
  INITIAL_FAMILIES, 
  INITIAL_DUES, 
  INITIAL_CAMPAIGNS, 
  INITIAL_PRAYER_SCHEDULE, 
  INITIAL_NOTICES, 
  INITIAL_EVENTS, 
  INITIAL_SERVICE_REQUESTS,
  INITIAL_COMMITTEE_MESSAGES,
  INITIAL_MADRASSA_STUDENTS,
  INITIAL_MADRASSA_TEACHERS,
  INITIAL_MADRASSA_CLASSES,
  registerNewResidentAccount
} from './data/mockData';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { DirectoryView } from './components/DirectoryView';
import { FinancialsView } from './components/FinancialsView';
import { PrayerAndNoticesView } from './components/PrayerAndNoticesView';
import { ServiceRequestsView } from './components/ServiceRequestsView';
import { ReceiptModal } from './components/ReceiptModal';
import { CertificateModal } from './components/CertificateModal';
import { AuthModal } from './components/AuthModal';
import { MahalluGeoMapView } from './components/MahalluGeoMapView';
import { ContactUsView } from './components/ContactUsView';
import { MadrassaManagementView } from './components/MadrassaManagementView';
import { AIChatBot } from './components/AIChatBot';
import { CheckCircle2, Info, HeartHandshake, Shield, Bot, Compass, PhoneCall } from 'lucide-react';

export default function App() {
  // State management: starts at null to present the clean Login Page
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [families, setFamilies] = useState<FamilyRecord[]>(INITIAL_FAMILIES);
  const [dues, setDues] = useState<DuesRecord[]>(INITIAL_DUES);
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>(INITIAL_CAMPAIGNS);
  const [prayerSchedule, setPrayerSchedule] = useState<PrayerSchedule>(INITIAL_PRAYER_SCHEDULE);
  const [notices, setNotices] = useState<NoticeItem[]>(INITIAL_NOTICES);
  const [events, setEvents] = useState<CommunityEvent[]>(INITIAL_EVENTS);
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_SERVICE_REQUESTS);
  const [committeeMessages, setCommitteeMessages] = useState<CommitteeMessage[]>(() => {
    try {
      const saved = localStorage.getItem('mahallu_committee_messages');
      return saved ? JSON.parse(saved) : INITIAL_COMMITTEE_MESSAGES;
    } catch (e) {
      return INITIAL_COMMITTEE_MESSAGES;
    }
  });

  // Madrassa Management State
  const [madrassaStudents, setMadrassaStudents] = useState<MadrassaStudent[]>(INITIAL_MADRASSA_STUDENTS);
  const [madrassaTeachers] = useState(INITIAL_MADRASSA_TEACHERS);
  const [madrassaClasses] = useState(INITIAL_MADRASSA_CLASSES);

  // Modal dialog states
  const [activeReceipt, setActiveReceipt] = useState<DuesRecord | null>(null);
  const [activeCertificate, setActiveCertificate] = useState<ServiceRequest | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFloatingAIChatOpen, setIsFloatingAIChatOpen] = useState(false);
  const [serviceRequestPrefill, setServiceRequestPrefill] = useState<{ type: RequestType; subject: string; details?: string } | null>(null);
  const [financialsSubTab, setFinancialsSubTab] = useState<'payments' | 'donations'>('payments');

  const handleTabChange = (tab: ActiveTab, subTab?: 'payments' | 'donations') => {
    if (tab === 'financials' && subTab) {
      setFinancialsSubTab(subTab);
    }
    setActiveTab(tab);
  };

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    if (activeTab === 'contact-us') {
      setActiveTab('dashboard');
    }
    showToast('Signed out of Mahallu portal.');
  };

  // Login handler
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role !== 'resident' && activeTab === 'contact-us') {
      setActiveTab('dashboard');
    }
    showToast(`Welcome back, ${user.name}!`);
  };

  // Send Committee Message handler
  const handleSendCommitteeMessage = (msg: {
    senderName: string;
    houseNo: string;
    ward: string;
    phone: string;
    email?: string;
    category: CommitteeMessageCategory;
    urgency: 'Normal' | 'High' | 'Urgent';
    subject: string;
    message: string;
    preferredResponse: 'Phone Call' | 'WhatsApp' | 'In-Person Meeting' | 'Email';
    requestedAppointmentDate?: string;
  }) => {
    const assigned = 
      msg.category === 'Confidential Counseling' 
        ? 'Usthad Hafiz Muhammad Bilal Faizy (Chief Imam)' 
        : (msg.category === 'Payment / Financial' || msg.category === 'Chanda / Financial')
        ? 'Janab V. K. Hamza Haji (Treasurer)'
        : msg.category === 'Ward Issue'
        ? 'Ward Member & Civic Wing'
        : 'Janab P. K. Abdul Rahman Haji (General Secretary)';

    const newMsg: CommitteeMessage = {
      ...msg,
      id: `cmsg-${Date.now()}`,
      referenceNo: `MHL-COM-2026-${String(committeeMessages.length + 1).padStart(3, '0')}`,
      sentAt: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Pending',
      assignedTo: assigned
    };
    const updated = [newMsg, ...committeeMessages];
    setCommitteeMessages(updated);
    try {
      localStorage.setItem('mahallu_committee_messages', JSON.stringify(updated));
    } catch (e) {}
    showToast(`Inquiry sent to Mahallu Committee (${newMsg.referenceNo})`);
  };

  const handleUpdateCommitteeMessageStatus = (msgId: string, status: CommitteeMessageStatus, replyText?: string) => {
    const updated = committeeMessages.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          status,
          ...(replyText ? {
            committeeReply: {
              repliedBy: currentUser?.name || 'Mahallu Secretariat',
              repliedAt: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
              replyText
            }
          } : {})
        };
      }
      return m;
    });
    setCommitteeMessages(updated);
    try {
      localStorage.setItem('mahallu_committee_messages', JSON.stringify(updated));
    } catch (e) {}
    showToast(`Inquiry status updated to ${status}`);
  };

  // Add Family handler with automatic resident portal account generation
  const handleAddFamily = (newFamily: FamilyRecord, credentials?: { email: string; password: string }) => {
    setFamilies(prev => [newFamily, ...prev]);

    // Register resident credentials in authentication system
    const residentEmail = credentials?.email || newFamily.portalEmail || `resident.${newFamily.houseNo.toLowerCase().replace(/[^a-z0-9]/g, '')}@mahallu.org`;
    const residentPassword = credentials?.password || newFamily.temporaryPassword || `${newFamily.houseNo.replace(/[^a-zA-Z0-9]/g, '')}@Mahallu2026`;

    registerNewResidentAccount({
      email: residentEmail,
      password: residentPassword,
      temporaryPassword: residentPassword,
      issuedDate: '2026-09-21',
      user: {
        id: `user-${newFamily.houseNo.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        name: newFamily.headOfFamily,
        email: residentEmail,
        role: 'resident',
        houseNo: newFamily.houseNo,
        ward: newFamily.ward,
        familyId: newFamily.id,
        phone: newFamily.phone,
        designation: 'Resident & Head of Family'
      }
    });

    // Also create initial dues record
    const newDue: DuesRecord = {
      id: `due-${Date.now()}`,
      familyId: newFamily.id,
      houseNo: newFamily.houseNo,
      houseName: newFamily.houseName,
      headOfFamily: newFamily.headOfFamily,
      ward: newFamily.ward,
      month: 'September',
      year: 2026,
      amount: newFamily.monthlyChandaAmount,
      status: 'Pending'
    };
    setDues(prev => [newDue, ...prev]);
    showToast(`Registered ${newFamily.houseName} (#${newFamily.houseNo}) with Resident Portal Account`);
  };

  // Update existing Family details / census members
  const handleUpdateFamily = (updatedFamily: FamilyRecord) => {
    setFamilies(prev => prev.map(f => f.id === updatedFamily.id ? updatedFamily : f));
    showToast(`Household #${updatedFamily.houseNo} census updated (${updatedFamily.members.length} members).`);
  };

  // Mark Due as Paid handler
  const handleMarkDuePaid = (dueId: string, paymentMethod: string) => {
    setDues(prev => prev.map(due => {
      if (due.id === dueId) {
        const updated: DuesRecord = {
          ...due,
          status: 'Paid',
          paidDate: '2026-09-21',
          paymentMethod: paymentMethod as any,
          receiptNumber: `MHL-26-${Math.floor(1000 + Math.random() * 9000)}`,
          recordedBy: currentUser ? currentUser.name : 'System'
        };
        setActiveReceipt(updated);
        return updated;
      }
      return due;
    }));
    showToast(`Monthly dues for House recorded as Paid. Official receipt generated.`);
  };

  // Toggle Due status handler for demo/testing
  const handleToggleDueStatus = (dueId: string) => {
    setDues(prev => prev.map(due => {
      if (due.id === dueId) {
        const nextStatus = due.status === 'Paid' ? 'Pending' : 'Paid';
        const updated: DuesRecord = {
          ...due,
          status: nextStatus,
          paidDate: nextStatus === 'Paid' ? '2026-09-21' : undefined,
          paymentMethod: nextStatus === 'Paid' ? 'Online UPI' : undefined,
          receiptNumber: nextStatus === 'Paid' ? `MHL-26-${Math.floor(1000 + Math.random() * 9000)}` : undefined
        };
        return updated;
      }
      return due;
    }));
    showToast(`Subscription status updated.`);
  };

  // Add Donation Contribution handler
  const handleContributeDonation = (campaignId: string, contribution: DonationContribution) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        return {
          ...c,
          raisedAmount: c.raisedAmount + contribution.amount,
          donorCount: c.donorCount + 1,
          recentDonations: [contribution, ...c.recentDonations]
        };
      }
      return c;
    }));
    showToast(`Donation of ₹${contribution.amount.toLocaleString()} received with thanks!`);
  };

  // Update Prayer Schedule
  const handleUpdatePrayerSchedule = (newSchedule: PrayerSchedule) => {
    setPrayerSchedule(newSchedule);
    showToast('Mosque prayer timings & Iqamah schedule updated successfully.');
  };

  // Add Notice
  const handleAddNotice = (notice: NoticeItem) => {
    setNotices(prev => [notice, ...prev]);
    showToast(`Published announcement: "${notice.title.substring(0, 30)}..."`);
  };

  // Update Event RSVP
  const handleUpdateRsvp = (eventId: string, rsvp: 'attending' | 'maybe' | 'declined') => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        const oldRsvp = evt.userRsvp;
        const newRsvps = { ...evt.rsvps };

        if (oldRsvp === 'attending') newRsvps.attending = Math.max(0, newRsvps.attending - 1);
        if (oldRsvp === 'maybe') newRsvps.maybe = Math.max(0, newRsvps.maybe - 1);
        if (oldRsvp === 'declined') newRsvps.declined = Math.max(0, newRsvps.declined - 1);

        if (rsvp === 'attending') newRsvps.attending += 1;
        if (rsvp === 'maybe') newRsvps.maybe += 1;
        if (rsvp === 'declined') newRsvps.declined += 1;

        return {
          ...evt,
          rsvps: newRsvps,
          userRsvp: rsvp
        };
      }
      return evt;
    }));
    showToast(`RSVP status recorded: ${rsvp.toUpperCase()}`);
  };

  // Submit Service Request
  const handleSubmitRequest = (newRequest: ServiceRequest) => {
    setRequests(prev => [newRequest, ...prev]);
    showToast(`Application submitted! Reference ID: ${newRequest.refNo}`);
  };

  // Update Request Status (Admin)
  const handleUpdateStatus = (requestId: string, status: RequestStatus, remarks: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        const isNowApproved = status === 'Approved';
        return {
          ...r,
          status,
          adminRemarks: remarks,
          updatedAt: '2026-09-21 12:45 PM',
          approvedCertificateData: isNowApproved ? {
            certificateNo: `MHL-CERT-${r.refNo.replace('MHL-REQ-', '')}`,
            issueDate: '21 September 2026',
            issuedBy: currentUser?.name || 'Mahallu Secretariat',
            validityNote: 'Official document approved by Central Mahallu Executive Committee.',
            purpose: r.subject
          } : undefined
        };
      }
      return r;
    }));
    showToast(`Application status updated to: ${status}`);
  };

  // Madrassa Handlers
  const handleAddMadrassaStudent = (newStudent: MadrassaStudent) => {
    setMadrassaStudents(prev => [newStudent, ...prev]);
  };

  const handleUpdateMadrassaFeeStatus = (studentId: string, status: 'Paid' | 'Pending') => {
    setMadrassaStudents(prev => prev.map(s => s.id === studentId ? { ...s, feeStatus: status } : s));
  };

  const pendingRequestsCount = requests.filter(r => {
    const isPending = r.status === 'Pending' || r.status === 'In Review';
    if (!isPending) return false;
    if (currentUser?.role === 'resident') {
      const matchHouse = currentUser.houseNo && r.houseNo?.trim().toLowerCase() === currentUser.houseNo?.trim().toLowerCase();
      const matchName = currentUser.name && r.applicantName?.trim().toLowerCase() === currentUser.name?.trim().toLowerCase();
      const matchPhone = currentUser.phone && r.phone?.replace(/\D/g, '') === currentUser.phone?.replace(/\D/g, '');
      return matchHouse || matchName || matchPhone;
    }
    return true;
  }).length;

  return (
    <div id="mahallu-app-container" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Primary Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenLoginModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        pendingRequestsCount={pendingRequestsCount}
        notices={notices}
        events={events}
        onAddNotice={handleAddNotice}
        onUpdateRsvp={handleUpdateRsvp}
      />

      {/* 3. Toast Notifications */}
      {toastMessage && (
        <div 
          id="toast-notification"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentUser ? (
          <>
            {activeTab === 'dashboard' && (
              <DashboardOverview
                currentUser={currentUser}
                onTabChange={handleTabChange}
                families={families}
                dues={dues}
                campaigns={campaigns}
                prayerSchedule={prayerSchedule}
                notices={notices}
                requests={requests}
                events={events}
                onOpenReceipt={setActiveReceipt}
                onOpenCertificate={setActiveCertificate}
              />
            )}

            {activeTab === 'directory' && (
              <DirectoryView
                families={families}
                onAddFamily={handleAddFamily}
                onUpdateFamily={handleUpdateFamily}
                currentUserRole={currentUser.role}
                currentUser={currentUser}
                onNavigateToServices={(prefill) => {
                  if (prefill) {
                    setServiceRequestPrefill(prefill);
                  }
                  setActiveTab('services');
                }}
              />
            )}

            {activeTab === 'financials' && (
              <FinancialsView
                families={families}
                dues={dues}
                campaigns={campaigns}
                currentUser={currentUser}
                onOpenReceipt={setActiveReceipt}
                onMarkDuePaid={handleMarkDuePaid}
                onContributeDonation={handleContributeDonation}
                onToggleDueStatus={handleToggleDueStatus}
                initialSubTab={financialsSubTab}
              />
            )}

            {activeTab === 'prayer-notices' && (
              <PrayerAndNoticesView
                prayerSchedule={prayerSchedule}
                notices={notices}
                events={events}
                currentUser={currentUser}
                onUpdatePrayerSchedule={handleUpdatePrayerSchedule}
                onAddNotice={handleAddNotice}
                onUpdateRsvp={handleUpdateRsvp}
              />
            )}

            {activeTab === 'services' && (
              <ServiceRequestsView
                requests={requests}
                currentUser={currentUser}
                committeeMessages={committeeMessages}
                onUpdateCommitteeMessageStatus={handleUpdateCommitteeMessageStatus}
                initialPrefill={serviceRequestPrefill}
                onClearPrefill={() => setServiceRequestPrefill(null)}
                onOpenCertificate={setActiveCertificate}
                onSubmitRequest={handleSubmitRequest}
                onUpdateStatus={handleUpdateStatus}
              />
            )}

            {activeTab === 'geo-map' && (
              <MahalluGeoMapView
                families={families}
                dues={dues}
                currentUser={currentUser}
                onNavigateTab={setActiveTab}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'madrassa' && (
              <MadrassaManagementView
                currentUser={currentUser}
                students={madrassaStudents}
                teachers={madrassaTeachers}
                classes={madrassaClasses}
                families={families}
                onAddStudent={handleAddMadrassaStudent}
                onUpdateFeeStatus={handleUpdateMadrassaFeeStatus}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'contact-us' && currentUser.role === 'resident' && (
              <ContactUsView
                currentUser={currentUser}
                messages={committeeMessages}
                onSendMessage={handleSendCommitteeMessage}
                onShowToast={showToast}
                onNavigateTab={setActiveTab}
              />
            )}
          </>
        ) : (
          /* Dedicated Credential-Based Login Page */
          <LoginPage onLogin={handleLogin} />
        )}
      </main>

      {/* Floating AI Sahayi Assistant Button (Resident Doubts & Clearance Helpdesk) */}
      {currentUser && (
        <div className="fixed bottom-6 right-6 z-40 print:hidden flex flex-col items-end gap-2">
          {!isFloatingAIChatOpen && (
            <button
              id="floating-ai-launcher-btn"
              onClick={() => setIsFloatingAIChatOpen(true)}
              className="group relative flex items-center gap-2.5 px-3 py-2.5 sm:px-3.5 sm:py-2.5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 hover:from-emerald-800 hover:to-teal-800 text-white rounded-full shadow-lg hover:shadow-xl border border-emerald-500/40 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Open AI Resident Helpdesk"
              title="Open AI Sahayi Assistant"
            >
              <div className="relative">
                <Bot className="w-5 h-5 text-emerald-300 group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
              </div>
              <div className="text-left hidden md:block pr-1">
                <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>AI Sahayi</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-emerald-400/20 text-emerald-200 rounded font-mono font-medium">
                    Help
                  </span>
                </div>
              </div>
            </button>
          )}

          {/* Floating AI Chat Window */}
          {isFloatingAIChatOpen && (
            <AIChatBot
              isFloating
              onCloseFloating={() => setIsFloatingAIChatOpen(false)}
              currentUser={currentUser}
              families={families}
              dues={dues}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenSubmitRequest={() => setActiveTab('services')}
            />
          )}
        </div>
      )}

      {/* 5. Printable / Downloadable Receipt Modal */}
      <ReceiptModal
        receipt={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />

      {/* 6. Printable / Downloadable Official Certificate Modal */}
      <CertificateModal
        request={activeCertificate}
        onClose={() => setActiveCertificate(null)}
      />

      {/* 7. Authentication Modal with pre-seeded credentials */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        currentUser={currentUser}
      />

      {/* 8. Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Edappal Central Mahallu Jama'ath</span>
            <span>•</span>
            <span>Waqf Reg. KL/WQF/142/1984</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Current Persona: <strong className="text-emerald-800">{currentUser ? currentUser.role.toUpperCase() : 'Guest'}</strong></span>
            <span>•</span>
            <span>Helpline: +91 495 2410022</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

