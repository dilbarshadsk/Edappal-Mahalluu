import React, { useState } from 'react';
import { 
  User, 
  CommitteeMessage, 
  CommitteeOfficial, 
  CommitteeMessageCategory,
  ActiveTab
} from '../types';
import { INITIAL_COMMITTEE_OFFICIALS } from '../data/mockData';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Send, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  Lock, 
  HeartHandshake, 
  HelpCircle, 
  ChevronRight,
  ExternalLink,
  Calendar,
  Search,
  Sparkles,
  Inbox,
  User as UserIcon,
  PhoneCall,
  Flame,
  ArrowRight
} from 'lucide-react';

interface ContactUsViewProps {
  currentUser: User;
  messages: CommitteeMessage[];
  onSendMessage: (msg: {
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
  }) => void;
  onShowToast: (msg: string) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const ContactUsView: React.FC<ContactUsViewProps> = ({
  currentUser,
  messages,
  onSendMessage,
  onShowToast,
  onNavigateTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'compose' | 'history' | 'roster'>('compose');
  
  // Form State
  const [category, setCategory] = useState<CommitteeMessageCategory>('General Inquiry');
  const [urgency, setUrgency] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [preferredResponse, setPreferredResponse] = useState<'Phone Call' | 'WhatsApp' | 'In-Person Meeting' | 'Email'>('WhatsApp');
  const [subject, setSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [wantsAppointment, setWantsAppointment] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Roster Search & Ward Filter
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterFilter, setRosterFilter] = useState<'all' | 'exec' | 'wards'>('all');

  // Filter messages for current resident's household
  const residentMessages = messages.filter(
    m => (currentUser.houseNo && m.houseNo === currentUser.houseNo) || m.senderName === currentUser.name
  );

  // Find resident's ward official
  const residentWardOfficial = INITIAL_COMMITTEE_OFFICIALS.find(
    off => off.wardAssigned && currentUser.ward && off.wardAssigned.toLowerCase().includes(currentUser.ward.toLowerCase().split(' - ')[0])
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      onShowToast('Please enter a brief subject for your communication.');
      return;
    }
    if (!messageText.trim() || messageText.trim().length < 15) {
      onShowToast('Please provide a message with at least 15 characters.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSendMessage({
        senderName: currentUser.name,
        houseNo: currentUser.houseNo || 'N/A',
        ward: currentUser.ward || 'Central Mahallu',
        phone: currentUser.phone || '+91 94460 00000',
        email: currentUser.email,
        category,
        urgency,
        subject: subject.trim(),
        message: messageText.trim(),
        preferredResponse,
        requestedAppointmentDate: wantsAppointment && appointmentDate ? appointmentDate : undefined
      });

      setIsSubmitting(false);
      // Reset form
      setSubject('');
      setMessageText('');
      setWantsAppointment(false);
      setAppointmentDate('');
      setActiveSubTab('history');
    }, 400);
  };

  const handlePreloadTopic = (selectedCat: CommitteeMessageCategory, sampleSubject: string) => {
    setCategory(selectedCat);
    setSubject(sampleSubject);
    setActiveSubTab('compose');
    onShowToast(`Category updated to: ${selectedCat}`);
  };

  // Filtered officials for roster
  const filteredOfficials = INITIAL_COMMITTEE_OFFICIALS.filter(off => {
    const matchesSearch = 
      off.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      off.designation.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      off.roleDescription.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      (off.wardAssigned && off.wardAssigned.toLowerCase().includes(rosterSearch.toLowerCase()));
    
    if (rosterFilter === 'exec') {
      return matchesSearch && !off.wardAssigned;
    }
    if (rosterFilter === 'wards') {
      return matchesSearch && Boolean(off.wardAssigned);
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
                Resident Communication Desk
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Resident Access Only
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Contact Mahallu Committee
            </h1>

            {/* Resident Identification Bar */}
            <div className="pt-2 flex items-center gap-3 flex-wrap text-xs text-emerald-200">
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentUser.name}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>House #{currentUser.houseNo || 'M-14'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentUser.ward || 'Ward 2 - Madina Colony'}</span>
              </span>
            </div>
          </div>

          {/* Quick Contact Highlight */}
          <div className="shrink-0 bg-white/5 border border-white/15 rounded-2xl p-4 sm:p-5 backdrop-blur-xs space-y-2.5 max-w-xs">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Office Working Hours</span>
            </div>
            <div className="text-xs text-slate-200 space-y-1">
              <div className="flex justify-between font-medium">
                <span>Morning Session:</span>
                <span className="text-emerald-300 font-bold">9:00 AM – 1:00 PM</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Evening Session:</span>
                <span className="text-emerald-300 font-bold">4:30 PM – 8:30 PM</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-white/10">
                1st Floor, Central Juma Masjid Complex, Main Road
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Direct Hotlines & Key Desks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Office Counter */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
              Main Office
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Mahallu Central Office</h3>
            <p className="text-xs text-slate-500 mt-0.5">Certificates, NOC, General Enquiries</p>
            <p className="text-sm font-extrabold text-slate-800 mt-2 font-mono">+91 483 273 1000</p>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <a
              href="tel:+914832731000"
              className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg text-center transition-colors flex items-center justify-center gap-1"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Office</span>
            </a>
            <a
              href="https://wa.me/919847123456?text=Assalamu%20Alaikum%2C%20I%20am%20resident%20from%20House%20"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Chief Imam Counseling Desk */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 font-mono">
              Confidential
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Chief Imam's Pastoral Desk</h3>
            <p className="text-xs text-slate-500 mt-0.5">Nikah, Shariah advice & family disputes</p>
            <p className="text-sm font-extrabold text-slate-800 mt-2 font-mono">+91 98472 88990</p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => handlePreloadTopic('Confidential Counseling', 'Request for confidential family guidance with Chief Imam')}
              className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-lg text-center transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Request Counseling</span>
            </button>
          </div>
        </div>

        {/* 24/7 Emergency & Funeral Helpline */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-mono">
              24/7 Helpline
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Janazah & Ambulance Wing</h3>
            <p className="text-xs text-slate-500 mt-0.5">Emergency burial aid, ambulance dispatch</p>
            <p className="text-sm font-extrabold text-rose-700 mt-2 font-mono">+91 98470 99887</p>
          </div>
          <div className="pt-2">
            <a
              href="tel:+919847099887"
              className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold rounded-lg text-center transition-colors flex items-center justify-center gap-1"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
              <span>Emergency Call</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            id="tab-btn-compose"
            onClick={() => setActiveSubTab('compose')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'compose'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Message to Committee</span>
          </button>

          <button
            id="tab-btn-history"
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
              activeSubTab === 'history'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>My Sent Messages & Official Replies</span>
            {residentMessages.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeSubTab === 'history' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {residentMessages.length}
              </span>
            )}
          </button>

          <button
            id="tab-btn-roster"
            onClick={() => setActiveSubTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'roster'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Committee Directory & Ward Desks</span>
          </button>
        </div>

        {/* Quick Help Tip */}
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Standard response time: within 24–48 hours</span>
        </div>
      </div>

      {/* 4. Tab 1: Compose / Direct Message Form */}
      {activeSubTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Form (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-700" />
                <span>Submit Inquiry or Direct Communication</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your communication will be logged in the Mahallu executive queue and routed to the responsible committee official.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Category Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Communication Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'General Inquiry', label: 'General Inquiry', icon: HelpCircle, note: 'Office admin & procedures' },
                      { id: 'Confidential Counseling', label: 'Confidential Counseling', icon: Lock, note: 'Chief Imam & President only' },
                      { id: 'Ward Issue', label: 'Ward & Neighborhood Issue', icon: MapPin, note: 'Civic & local grievances' },
                      { id: 'Payment / Financial', label: 'Payment / Financial Query', icon: Building2, note: 'Treasurer\'s desk' },
                      { id: 'Emergency Aid', label: 'Emergency & Welfare Aid', icon: Flame, note: 'Relief convenor' },
                      { id: 'Feedback / Suggestion', label: 'Feedback / Suggestion', icon: Sparkles, note: 'Committee review' },
                    ] as const
                  ).map(catItem => {
                    const Icon = catItem.icon;
                    const isSelected = category === catItem.id;
                    return (
                      <button
                        type="button"
                        key={catItem.id}
                        onClick={() => setCategory(catItem.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500 shadow-2xs'
                            : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} />
                          <span className="text-xs font-bold">{catItem.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{catItem.note}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Confidentiality Notice when Counseling selected */}
              {category === 'Confidential Counseling' && (
                <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Strictly Confidential Pastoral Channel:</span>
                    <p className="text-[11px] text-indigo-800/90 mt-0.5">
                      Messages under this category are restricted exclusively to the Chief Imam Usthad Bilal Faizy and President. General staff and clerks cannot view this record.
                    </p>
                  </div>
                </div>
              )}

              {/* Urgency & Preferred Response */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Priority / Urgency Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Normal', 'High', 'Urgent'] as const).map(level => (
                      <button
                        type="button"
                        key={level}
                        onClick={() => setUrgency(level)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          urgency === level
                            ? level === 'Urgent'
                              ? 'bg-rose-50 border-rose-500 text-rose-800'
                              : level === 'High'
                              ? 'bg-amber-50 border-amber-500 text-amber-800'
                              : 'bg-emerald-50 border-emerald-500 text-emerald-800'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Preferred Response Method
                  </label>
                  <select
                    value={preferredResponse}
                    onChange={(e) => setPreferredResponse(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="WhatsApp">WhatsApp Message to Resident</option>
                    <option value="Phone Call">Direct Phone Call</option>
                    <option value="In-Person Meeting">In-Person Office Meeting</option>
                    <option value="Email">Email Notification</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Subject / Title <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Concise summary</span>
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Query regarding Madina Colony drainage desilting, or appointment with Imam"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Message Details */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Detailed Message & Particulars <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">{messageText.length} characters</span>
                </div>
                <textarea
                  rows={5}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Please state your inquiry, request, or issue with full details including names, locations, and any relevant dates..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  required
                />
              </div>

              {/* In-Person Appointment Checkbox */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wantsAppointment}
                    onChange={(e) => setWantsAppointment(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    I would like to request an in-person meeting with the committee / Imam at the Mahallu Office
                  </span>
                </label>

                {wantsAppointment && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Preferred Date & Time Window
                    </label>
                    <input
                      type="datetime-local"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full sm:w-auto px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[10px] text-slate-500">
                      Public consultation days: Sundays 10:00 AM – 1:00 PM and daily after Maghrib prayers.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500">
                  By submitting, this inquiry is registered in the official Mahallu Jama'ath Secretariat ledger.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Send Message to Committee'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Side Helper: Verified Sender & Quick Tips (1 Col) */}
          <div className="space-y-5">
            
            {/* Sender Household Snapshot */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Verified Resident Dispatcher
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-bold text-slate-800">{currentUser.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">House No:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    House #{currentUser.houseNo || 'M-14'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Ward:</span>
                  <span className="font-semibold text-slate-800">{currentUser.ward || 'Ward 2 - Madina Colony'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-mono text-slate-800">{currentUser.phone || '+91 94462 88123'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-mono text-slate-700 truncate max-w-[150px]">{currentUser.email}</span>
                </div>
              </div>

              {residentWardOfficial && (
                <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Your Ward Representative</span>
                  <p className="font-bold text-slate-900">{residentWardOfficial.name}</p>
                  <p className="text-[11px] text-slate-600">{residentWardOfficial.designation}</p>
                  <p className="text-[11px] font-mono text-emerald-700 font-bold">{residentWardOfficial.phone}</p>
                </div>
              )}
            </div>

            {/* Quick Starters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Common Resident Topics</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Click any prompt to pre-fill the form with typical inquiry details:
              </p>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handlePreloadTopic('Confidential Counseling', 'Consultation regarding pre-marital counseling & Nikah')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left text-xs transition-colors group cursor-pointer"
                >
                  <div className="font-semibold text-slate-800 group-hover:text-emerald-800">
                    Nikah & Pre-Marital Guidance
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Route to Chief Imam Usthad Bilal Faizy</div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePreloadTopic('Ward Issue', 'Street light maintenance & road drainage issue in our lane')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left text-xs transition-colors group cursor-pointer"
                >
                  <div className="font-semibold text-slate-800 group-hover:text-emerald-800">
                    Neighborhood Civic Issue
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Route to Ward Member & Civic Wing</div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePreloadTopic('Payment / Financial', 'Clarification on monthly payment ledger record & receipt')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left text-xs transition-colors group cursor-pointer"
                >
                  <div className="font-semibold text-slate-800 group-hover:text-emerald-800">
                    Payment & Receipt Clarification
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Route to Janab Hamza Haji (Treasurer)</div>
                </button>
              </div>
            </div>

            {/* Official Certification Shortcut */}
            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <Building2 className="w-4 h-4" />
                <span>Need an Official Certificate or NOC?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                For formal stamped documents like Marriage Certificates, No Objection Certificates, or Education Relief grants, please use the dedicated Services portal.
              </p>
              <button
                onClick={() => onNavigateTab('services')}
                className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Go to Service Requests</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. Tab 2: My Sent Inquiries & Official Replies */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Inbox className="w-4 h-4 text-emerald-700" />
                <span>Household Communication History ({residentMessages.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track status updates and review official responses from the Mahallu Secretariat.
              </p>
            </div>

            <button
              onClick={() => setActiveSubTab('compose')}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Compose New Inquiry</span>
            </button>
          </div>

          {residentMessages.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Inbox className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">No sent messages yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Have a question or request for the Mahallu leadership? Use the "Send Message to Committee" form to get in touch.
              </p>
              <button
                onClick={() => setActiveSubTab('compose')}
                className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Draft First Message
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {residentMessages.map(item => (
                <div 
                  key={item.id}
                  className="p-5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-4 hover:border-slate-300 transition-all"
                >
                  {/* Top Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {item.referenceNo}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {item.category}
                      </span>
                      {item.urgency !== 'Normal' && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.urgency === 'Urgent' 
                            ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {item.urgency} Priority
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.sentAt}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                        item.status === 'Replied'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : item.status === 'In Review'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {item.status === 'Replied' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {item.status === 'In Review' && <Clock className="w-3.5 h-3.5" />}
                        {item.status === 'Pending' && <AlertCircle className="w-3.5 h-3.5" />}
                        <span>{item.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Subject & Query Text */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.subject}</h3>
                    <p className="text-xs text-slate-700 mt-1.5 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/80">
                      {item.message}
                    </p>
                  </div>

                  {/* Details Badges */}
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
                    <span>
                      <strong>Assigned To:</strong> {item.assignedTo}
                    </span>
                    <span>
                      <strong>Response Mode:</strong> {item.preferredResponse}
                    </span>
                    {item.requestedAppointmentDate && (
                      <span className="text-indigo-700 font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Meeting Requested for: {item.requestedAppointmentDate}
                      </span>
                    )}
                  </div>

                  {/* Official Committee Reply Box (if replied) */}
                  {item.committeeReply && (
                    <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs text-emerald-900 font-bold">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Official Response from Mahallu Committee</span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-700 font-normal">
                          {item.committeeReply.repliedAt}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-sans pl-6">
                        "{item.committeeReply.replyText}"
                      </p>
                      <div className="text-[11px] text-emerald-800 font-semibold pl-6 pt-1">
                        — {item.committeeReply.repliedBy}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Tab 3: Committee Directory & Ward Desks */}
      {activeSubTab === 'roster' && (
        <div className="space-y-6">
          
          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                placeholder="Search committee officials by name, role, or ward..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setRosterFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  rosterFilter === 'all'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Officials ({INITIAL_COMMITTEE_OFFICIALS.length})
              </button>
              <button
                onClick={() => setRosterFilter('exec')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  rosterFilter === 'exec'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Executive Board
              </button>
              <button
                onClick={() => setRosterFilter('wards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  rosterFilter === 'wards'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Ward Desks (4 Wards)
              </button>
            </div>
          </div>

          {/* Officials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOfficials.map(official => {
              const isResidentWard = official.wardAssigned && currentUser.ward && official.wardAssigned.toLowerCase().includes(currentUser.ward.toLowerCase().split(' - ')[0]);

              return (
                <div 
                  key={official.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-3 relative ${
                    isResidentWard 
                      ? 'border-emerald-500/80 bg-emerald-50/20 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isResidentWard && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full font-mono uppercase tracking-wider">
                        Your Ward Member
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-850 via-slate-800 to-emerald-950 text-white font-bold flex items-center justify-center text-sm shadow-xs border border-emerald-700/40 shrink-0">
                      {official.name.replace(/^(Janab|Usthad|Hafiz|Dr\.|Al-Haj|Haji|K\.V\.|M\.P\.|T\.K\.|P\.M\.|P\.K\.|V\.K\.)\s+/i, '').trim().charAt(0) || official.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded bg-slate-100 text-slate-700 font-mono">
                          {official.designation}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{official.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {official.roleDescription}
                      </p>
                    </div>
                  </div>

                  {/* Availability & Contact Channels */}
                  <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{official.availability}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${official.phone}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 font-mono font-bold rounded-lg transition-colors flex items-center gap-1.5 text-xs"
                        >
                          <Phone className="w-3 h-3 text-emerald-700" />
                          <span>{official.phone}</span>
                        </a>

                        <a
                          href={`https://wa.me/${official.phone.replace(/[^0-9]/g, '')}?text=Assalamu%20Alaikum%20${encodeURIComponent(official.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/30 text-[#128C7E] rounded-lg transition-colors"
                          title="Open WhatsApp Chat"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <button
                        onClick={() => {
                          setSubject(`Inquiry directed to ${official.name} (${official.designation})`);
                          setActiveSubTab('compose');
                          onShowToast(`Pre-loaded inquiry for ${official.name}`);
                        }}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Send Note</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Frequently Asked Questions & Resident Guidelines */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <HelpCircle className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900">
            Resident Guide to Mahallu Secretariat & Committee Communications
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
            <h4 className="font-bold text-slate-800">Public Grievance Sessions</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Every Sunday between 10:00 AM and 1:00 PM, the President and General Secretary hold an open consultation room at the Central Masjid office for in-person community hearings.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
            <h4 className="font-bold text-slate-800">Family & Shariah Privacy</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Confidential inquiries to Chief Imam Usthad Bilal Faizy regarding matrimonial disputes, inheritance, and personal counseling are kept under strict Islamic confidentiality.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
            <h4 className="font-bold text-slate-800">Ward Emergency Support</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              For immediate medical emergencies or Janazah funeral notifications, contact the 24/7 Helpline (+91 98470 99887) directly rather than filing an online inquiry.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
