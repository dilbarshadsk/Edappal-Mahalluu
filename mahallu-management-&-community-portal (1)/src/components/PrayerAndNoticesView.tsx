import React, { useState } from 'react';
import { 
  PrayerSchedule, 
  NoticeItem, 
  CommunityEvent, 
  NoticeCategory, 
  Role, 
  User 
} from '../types';
import { 
  Clock, 
  Bell, 
  Calendar, 
  MapPin, 
  UserCheck, 
  AlertCircle, 
  Check, 
  HelpCircle, 
  X, 
  Edit3, 
  Plus, 
  Share2, 
  Sparkles, 
  Heart, 
  CheckCircle2 
} from 'lucide-react';

interface PrayerAndNoticesViewProps {
  prayerSchedule: PrayerSchedule;
  notices: NoticeItem[];
  events: CommunityEvent[];
  currentUser: User;
  onUpdatePrayerSchedule: (newSchedule: PrayerSchedule) => void;
  onAddNotice: (notice: NoticeItem) => void;
  onUpdateRsvp: (eventId: string, rsvp: 'attending' | 'maybe' | 'declined') => void;
}

export const PrayerAndNoticesView: React.FC<PrayerAndNoticesViewProps> = ({
  prayerSchedule,
  notices,
  events,
  currentUser,
  onUpdatePrayerSchedule,
  onAddNotice,
  onUpdateRsvp
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Edit Prayer Timings Modal (for Admin)
  const [isEditingPrayers, setIsEditingPrayers] = useState(false);
  const [editedTimings, setEditedTimings] = useState(prayerSchedule.timings);
  const [editedKhutbah, setEditedKhutbah] = useState(prayerSchedule.jumuah.khutbah);
  const [editedKhatib, setEditedKhatib] = useState(prayerSchedule.jumuah.khatib);

  // Add Notice Modal (for Admin)
  const [isAddingNotice, setIsAddingNotice] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<NoticeCategory>('General');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticePriority, setNewNoticePriority] = useState<'normal' | 'urgent'>('normal');

  // Filter notices
  const filteredNotices = notices.filter(n => {
    if (activeCategory === 'All') return true;
    return n.category === activeCategory;
  });

  const handleSavePrayers = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePrayerSchedule({
      ...prayerSchedule,
      timings: editedTimings,
      jumuah: {
        ...prayerSchedule.jumuah,
        khutbah: editedKhutbah,
        khatib: editedKhatib
      }
    });
    setIsEditingPrayers(false);
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent) return;

    const notice: NoticeItem = {
      id: `not-${Date.now()}`,
      title: newNoticeTitle,
      category: newNoticeCategory,
      date: '2026-09-21',
      time: '12:00 PM',
      author: currentUser.role === 'admin' ? 'Mahallu Secretariat' : currentUser.name,
      priority: newNoticePriority,
      content: newNoticeContent
    };

    onAddNotice(notice);
    setIsAddingNotice(false);
    setNewNoticeTitle('');
    setNewNoticeContent('');
  };

  return (
    <div id="prayer-notices-module" className="space-y-6">
      {/* TOP SECTION: Daily Prayer Timings & Iqamah Schedule Card */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/80 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-300" />
              <h3 className="text-lg font-bold">Daily Congregational Prayer & Iqamah Timings</h3>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">Central Juma Masjid • {prayerSchedule.date} ({prayerSchedule.hijriDate})</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {currentUser.role === 'admin' && (
              <button
                id="edit-prayer-times-btn"
                onClick={() => {
                  setEditedTimings(prayerSchedule.timings);
                  setEditedKhutbah(prayerSchedule.jumuah.khutbah);
                  setEditedKhatib(prayerSchedule.jumuah.khatib);
                  setIsEditingPrayers(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold border border-emerald-700 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Update Schedule</span>
              </button>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Next: Dhuhr (12:24 PM)</span>
            </div>
          </div>
        </div>

        {/* Timings Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {prayerSchedule.timings.map((prayer) => {
            const isHighlighted = prayer.name === 'Dhuhr';

            return (
              <div
                key={prayer.id}
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  isHighlighted
                    ? 'bg-emerald-800/90 border-emerald-400/80 shadow-md ring-2 ring-emerald-400/30'
                    : 'bg-emerald-900/40 border-emerald-800/50 hover:bg-emerald-900/60'
                }`}
              >
                <div className="text-emerald-200 font-serif text-sm">{prayer.arabicName}</div>
                <div className="text-sm font-bold text-white tracking-wide mt-0.5">{prayer.name}</div>
                
                <div className="mt-2.5 pt-2 border-t border-emerald-800/60 space-y-1">
                  <div className="text-[11px] text-emerald-200/80 flex justify-between">
                    <span>Adhan:</span>
                    <span className="font-mono font-semibold text-white">{prayer.adhan}</span>
                  </div>
                  <div className="text-xs text-emerald-300 font-bold flex justify-between">
                    <span>Iqamah:</span>
                    <span className="font-mono text-emerald-200">{prayer.iqamah}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Jumuah Details Box */}
        <div className="mt-4 pt-3 border-t border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-emerald-300 uppercase tracking-wider text-[11px] bg-emerald-800/60 px-2.5 py-1 rounded-md border border-emerald-700/60">
              Friday Jumu'ah
            </span>
            <span className="text-emerald-100">
              1st Adhan: <strong>{prayerSchedule.jumuah.firstAdhan}</strong> • Khutbah: <strong>{prayerSchedule.jumuah.khutbah}</strong> • Prayer: <strong>{prayerSchedule.jumuah.prayer}</strong>
            </span>
          </div>
          <span className="text-emerald-300 italic">
            Khatib: {prayerSchedule.jumuah.khatib}
          </span>
        </div>
      </div>

      {/* LOWER SECTION: Two Columns (Notices Board + Events Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Categorized Noticeboard */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Category Filter Pills */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {['All', 'General', 'Janazah', 'Khutbah'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat} {cat === 'Janazah' ? '🕊️' : ''}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                {filteredNotices.length} Active Notices
              </span>
              {currentUser.role === 'admin' && (
                <button
                  id="publish-notice-btn"
                  onClick={() => setIsAddingNotice(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish Notice</span>
                </button>
              )}
            </div>
          </div>

          {/* Notices Stream */}
          <div className="space-y-4">
            {filteredNotices.map((notice) => {
              const isJanazah = notice.category === 'Janazah';
              const isKhutbah = notice.category === 'Khutbah';

              return (
                <div
                  key={notice.id}
                  id={`notice-card-${notice.id}`}
                  className={`rounded-2xl border p-5 shadow-xs transition-all ${
                    isJanazah
                      ? 'bg-emerald-950/5 border-emerald-900/30'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Notice Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isJanazah
                          ? 'bg-emerald-900 text-white'
                          : isKhutbah
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {notice.category} Notice
                      </span>

                      {notice.priority === 'urgent' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                          Urgent Broadcast
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-slate-400 font-mono">
                      {notice.date} {notice.time ? `• ${notice.time}` : ''}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{notice.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{notice.content}</p>

                  {/* Respectful Janazah Announcement Card details */}
                  {isJanazah && notice.janazahDetails && (
                    <div className="mt-4 p-4 rounded-xl bg-emerald-900/10 border border-emerald-900/20 text-xs space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800">
                        <div>
                          <strong className="text-slate-500 block text-[10px] uppercase">Deceased:</strong>
                          <span className="font-bold text-slate-900">{notice.janazahDetails.deceasedName} ({notice.janazahDetails.age} yrs)</span>
                        </div>
                        <div>
                          <strong className="text-slate-500 block text-[10px] uppercase">Residence:</strong>
                          <span>{notice.janazahDetails.houseName}, {notice.janazahDetails.ward}</span>
                        </div>
                        <div>
                          <strong className="text-slate-500 block text-[10px] uppercase">Janazah Prayer:</strong>
                          <span className="font-bold text-emerald-950">{notice.janazahDetails.prayerTime}</span>
                        </div>
                        <div>
                          <strong className="text-slate-500 block text-[10px] uppercase">Burial Qabaristan:</strong>
                          <span>{notice.janazahDetails.burialGround}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-emerald-900/20 text-[11px] text-slate-600 italic">
                        {notice.janazahDetails.relativeInfo}
                      </div>
                    </div>
                  )}

                  {/* Friday Khutbah key takeaways */}
                  {isKhutbah && notice.khutbahDetails && (
                    <div className="mt-4 p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-blue-950">Topic: {notice.khutbahDetails.topic}</span>
                        <span className="text-[11px] text-blue-800 font-medium">{notice.khutbahDetails.khatibName}</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                        {notice.khutbahDetails.keyPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Issued by: {notice.author}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right 1 Column: Community Events Calendar with RSVP */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Community Events</h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold">{events.length} Upcoming</span>
          </div>

          <div className="space-y-4">
            {events.map((evt) => (
              <div
                key={evt.id}
                id={`event-card-${evt.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 mb-1">
                    <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{evt.category}</span>
                    <span className="text-slate-500">{evt.rsvps.attending} Attending</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{evt.date} • {evt.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2">{evt.description}</p>

                {/* Interactive Resident RSVP Button Group */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Your Household RSVP:
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      id={`rsvp-attending-${evt.id}`}
                      onClick={() => onUpdateRsvp(evt.id, 'attending')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        evt.userRsvp === 'attending'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>Going</span>
                    </button>

                    <button
                      id={`rsvp-maybe-${evt.id}`}
                      onClick={() => onUpdateRsvp(evt.id, 'maybe')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        evt.userRsvp === 'maybe'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>Maybe</span>
                    </button>

                    <button
                      id={`rsvp-declined-${evt.id}`}
                      onClick={() => onUpdateRsvp(evt.id, 'declined')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        evt.userRsvp === 'declined'
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <X className="w-3 h-3" />
                      <span>No</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Admin Edit Prayer Schedule Modal */}
      {isEditingPrayers && (
        <div id="edit-prayer-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-emerald-900 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Update Daily Prayer & Iqamah Timings</h3>
                <p className="text-xs text-emerald-200">Adjust timings for central masjid broadcast display</p>
              </div>
              <button
                onClick={() => setIsEditingPrayers(false)}
                className="p-1 text-slate-300 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrayers} className="p-6 space-y-4 text-xs">
              <div className="space-y-3">
                {editedTimings.map((prayer, index) => (
                  <div key={prayer.id} className="grid grid-cols-3 gap-2 items-center">
                    <span className="font-bold text-slate-800">{prayer.name}</span>
                    <input
                      type="text"
                      value={prayer.adhan}
                      onChange={(e) => {
                        const updated = [...editedTimings];
                        updated[index].adhan = e.target.value;
                        setEditedTimings(updated);
                      }}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-center"
                      placeholder="Adhan"
                    />
                    <input
                      type="text"
                      value={prayer.iqamah}
                      onChange={(e) => {
                        const updated = [...editedTimings];
                        updated[index].iqamah = e.target.value;
                        setEditedTimings(updated);
                      }}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-center font-bold text-emerald-800"
                      placeholder="Iqamah"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <label className="block font-bold text-slate-800">Friday Jumu'ah Details</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={editedKhutbah}
                    onChange={(e) => setEditedKhutbah(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg"
                    placeholder="Khutbah Time"
                  />
                  <input
                    type="text"
                    value={editedKhatib}
                    onChange={(e) => setEditedKhatib(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg"
                    placeholder="Khatib Name"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingPrayers(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save Timings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Publish Notice Modal */}
      {isAddingNotice && (
        <div id="publish-notice-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-emerald-900 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Publish Community Notice</h3>
                <p className="text-xs text-emerald-200">Broadcast official notification to Mahallu portal</p>
              </div>
              <button
                onClick={() => setIsAddingNotice(false)}
                className="p-1 text-slate-300 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Category *</label>
                <select
                  value={newNoticeCategory}
                  onChange={(e) => setNewNoticeCategory(e.target.value as NoticeCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="General">General Announcement</option>
                  <option value="Janazah">Funeral / Janazah Announcement</option>
                  <option value="Khutbah">Friday Khutbah Summary</option>
                  <option value="Emergency">Emergency Alert</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title / Headline *</label>
                <input
                  type="text"
                  placeholder="e.g. Free Eye Screening Camp..."
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Content / Particulars *</label>
                <textarea
                  rows={4}
                  placeholder="Enter full details..."
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgent-checkbox"
                  checked={newNoticePriority === 'urgent'}
                  onChange={(e) => setNewNoticePriority(e.target.checked ? 'urgent' : 'normal')}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="urgent-checkbox" className="font-semibold text-slate-700">
                  Mark as Urgent Alert (Pin to top banner)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNotice(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
