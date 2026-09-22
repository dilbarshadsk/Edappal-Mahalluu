import React, { useState, useEffect, useRef } from 'react';
import { NoticeItem, CommunityEvent, MahalluNotification, User } from '../types';
import { generateNotifications } from '../utils/notificationUtils';
import { MahalluLogo } from './MahalluLogo';
import { 
  Bell, 
  BellRing, 
  Calendar, 
  Megaphone, 
  Sparkles, 
  Heart, 
  AlertTriangle, 
  Check, 
  CheckCheck, 
  Clock, 
  MapPin, 
  X, 
  ExternalLink, 
  Share2, 
  Plus, 
  Info,
  CalendarCheck,
  UserCheck
} from 'lucide-react';

interface NotificationCenterProps {
  notices: NoticeItem[];
  events: CommunityEvent[];
  currentUser: User | null;
  onNavigateTab: (tab: 'prayer-notices') => void;
  onAddNotice?: (notice: NoticeItem) => void;
  onUpdateRsvp?: (eventId: string, rsvp: 'attending' | 'maybe' | 'declined') => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notices,
  events,
  currentUser,
  onNavigateTab,
  onAddNotice,
  onUpdateRsvp
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'announcements' | 'events' | 'unread'>('all');
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('mahallu_read_notifications');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Selected notification for rich modal inspection
  const [activeNotification, setActiveNotification] = useState<MahalluNotification | null>(null);
  const [copyStatus, setCopyStatus] = useState(false);

  // Quick broadcast modal state
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState<'General' | 'Janazah' | 'Khutbah' | 'Emergency'>('General');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<'normal' | 'urgent'>('normal');

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync readIds with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mahallu_read_notifications', JSON.stringify(Array.from(readIds)));
    } catch (e) {
      console.error('Failed to save read notifications', e);
    }
  }, [readIds]);

  // Click outside listener to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const allNotifications = generateNotifications(notices, events, readIds);

  const unreadCount = allNotifications.filter(n => !n.isRead).length;
  const hasUrgentUnread = allNotifications.some(n => !n.isRead && n.priority === 'urgent');

  // Filter list
  const filteredNotifications = allNotifications.filter(n => {
    if (activeFilter === 'announcements') return n.type === 'announcement';
    if (activeFilter === 'events') return n.type === 'event';
    if (activeFilter === 'unread') return !n.isRead;
    return true;
  });

  const markAsRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const markAsUnread = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setReadIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const markAllAsRead = () => {
    const allIds = allNotifications.map(n => n.id);
    setReadIds(new Set(allIds));
  };

  const handleOpenDetail = (notif: MahalluNotification) => {
    markAsRead(notif.id);
    setActiveNotification(notif);
    setIsOpen(false);
  };

  const handleNavigateToFeed = () => {
    setIsOpen(false);
    setActiveNotification(null);
    onNavigateTab('prayer-notices');
  };

  // Find underlying object for details
  const activeNotice = activeNotification?.type === 'announcement'
    ? notices.find(n => n.id === activeNotification.referenceId)
    : undefined;

  const activeEvent = activeNotification?.type === 'event'
    ? events.find(e => e.id === activeNotification.referenceId)
    : undefined;

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastContent.trim() || !onAddNotice) return;

    const newNotice: NoticeItem = {
      id: `not-${Date.now()}`,
      title: broadcastTitle.trim(),
      category: broadcastCategory,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: currentUser?.name || 'Mahallu Secretariat',
      priority: broadcastPriority,
      content: broadcastContent.trim()
    };

    onAddNotice(newNotice);
    setBroadcastTitle('');
    setBroadcastContent('');
    setIsBroadcastModalOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/80 transition-all cursor-pointer focus:outline-hidden"
        title="Announcements & Upcoming Events"
        aria-label="Announcements & Upcoming Events"
      >
        {hasUrgentUnread ? (
          <BellRing className="w-5 h-5 text-amber-600 animate-bounce" />
        ) : (
          <Bell className="w-5 h-5" />
        )}

        {unreadCount > 0 && (
          <span 
            id="notification-badge-count"
            className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white rounded-full flex items-center justify-center shadow-xs ${
              hasUrgentUnread ? 'bg-amber-600 animate-pulse' : 'bg-emerald-600'
            }`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs z-40 sm:hidden animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          id="notification-dropdown-menu"
          className="fixed inset-x-2.5 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-[420px] max-h-[calc(100dvh-5rem)] sm:max-h-[580px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center p-1">
                <MahalluLogo className="w-full h-full" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">Mahallu Circulars & Events</h3>
                <p className="text-[11px] text-emerald-200/80">
                  {unreadCount === 0 ? 'All caught up' : `${unreadCount} unread broadcast${unreadCount > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  id="mark-all-read-btn"
                  onClick={markAllAsRead}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-2.5 bg-slate-50 border-b border-slate-200/80 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              All ({allNotifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('announcements')}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === 'announcements'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Notices ({notices.length})
            </button>
            <button
              onClick={() => setActiveFilter('events')}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === 'events'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Events ({events.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === 'unread'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[380px] sm:max-h-[420px]">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">No notifications here</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeFilter === 'unread' ? "You've read all circulars and event announcements!" : 'No items match your filter.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isUrgent = notif.priority === 'urgent';
                const isJanazah = notif.category === 'Janazah';
                const isKhutbah = notif.category === 'Khutbah';
                const isEvent = notif.type === 'event';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleOpenDetail(notif)}
                    className={`p-3.5 transition-colors cursor-pointer relative flex gap-3 hover:bg-slate-50 ${
                      !notif.isRead ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    {/* Category Icon */}
                    <div className="shrink-0 mt-0.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-2xs ${
                        isUrgent
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : isJanazah
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isKhutbah
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isEvent
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {isUrgent ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : isJanazah ? (
                          <Heart className="w-4 h-4" />
                        ) : isKhutbah ? (
                          <Sparkles className="w-4 h-4" />
                        ) : isEvent ? (
                          <Calendar className="w-4 h-4" />
                        ) : (
                          <Megaphone className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase font-mono ${
                          isUrgent
                            ? 'bg-amber-200/90 text-amber-950 font-bold animate-pulse'
                            : isJanazah
                            ? 'bg-rose-100 text-rose-900'
                            : isKhutbah
                            ? 'bg-emerald-100 text-emerald-900'
                            : isEvent
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-slate-200 text-slate-800'
                        }`}>
                          {notif.badgeText}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                            {notif.date}
                          </span>
                          {!notif.isRead ? (
                            <span 
                              onClick={(e) => markAsRead(notif.id, e)} 
                              title="Mark as read"
                              className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" 
                            />
                          ) : (
                            <button
                              onClick={(e) => markAsUnread(notif.id, e)}
                              title="Mark as unread"
                              className="text-slate-300 hover:text-slate-600 transition-colors p-0.5"
                            >
                              <CheckCheck className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h4 className={`text-xs font-bold text-slate-900 line-clamp-1 ${!notif.isRead ? 'font-black' : ''}`}>
                        {notif.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                        {notif.summary}
                      </p>

                      {/* Metadata Row */}
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-medium">
                        {notif.time && (
                          <span className="flex items-center gap-1 text-emerald-800">
                            <Clock className="w-3 h-3" />
                            <span>{notif.time}</span>
                          </span>
                        )}
                        {notif.venue && (
                          <span className="flex items-center gap-1 text-slate-600 truncate max-w-[140px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{notif.venue}</span>
                          </span>
                        )}
                        {notif.authorOrOrganizer && (
                          <span className="truncate text-slate-400">
                            By {notif.authorOrOrganizer.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
            <button
              id="view-all-broadcasts-btn"
              onClick={handleNavigateToFeed}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              <span>View All in Notices & Events</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {currentUser?.role === 'admin' && onAddNotice && (
              <button
                id="create-broadcast-modal-trigger"
                onClick={() => {
                  setIsOpen(false);
                  setIsBroadcastModalOpen(true);
                }}
                className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Broadcast Notice</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* RICH NOTIFICATION DETAIL MODAL */}
      {activeNotification && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div 
            id="notification-detail-modal"
            className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/95 p-1 flex items-center justify-center shrink-0">
                  <MahalluLogo className="w-full h-full" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                      Official Mahallu Circular
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      activeNotification.priority === 'urgent'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {activeNotification.category}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                    {activeNotification.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveNotification(null)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-slate-800 text-sm">
              {/* Date & Time pill row */}
              <div className="flex flex-wrap items-center gap-3 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs">
                <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                  <CalendarCheck className="w-4 h-4 text-emerald-700" />
                  <span>Date: {activeNotification.date}</span>
                </div>
                {activeNotification.time && (
                  <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    <span>Time: {activeNotification.time}</span>
                  </div>
                )}
                {activeNotification.venue && (
                  <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>Venue: {activeNotification.venue}</span>
                  </div>
                )}
              </div>

              {/* Notice Content / Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Circular Details</h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm">
                  {activeNotification.summary}
                </p>
              </div>

              {/* Special details for Janazah */}
              {activeNotice?.janazahDetails && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs">
                  <h4 className="font-bold text-rose-900 flex items-center gap-1.5 text-sm">
                    <Heart className="w-4 h-4 text-rose-700" />
                    <span>Janazah & Burial Particulars</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-rose-950">
                    <div>
                      <span className="text-slate-500 block">Deceased Elder:</span>
                      <span className="font-bold">{activeNotice.janazahDetails.deceasedName} ({activeNotice.janazahDetails.age} yrs)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Residence:</span>
                      <span className="font-medium">{activeNotice.janazahDetails.houseName} • {activeNotice.janazahDetails.ward}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Janazah Namaz Time:</span>
                      <span className="font-bold text-rose-900">{activeNotice.janazahDetails.prayerTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Venue & Qabaristan:</span>
                      <span className="font-medium">{activeNotice.janazahDetails.prayerVenue} ({activeNotice.janazahDetails.burialGround})</span>
                    </div>
                  </div>
                  <div className="pt-2 text-[11px] text-rose-800 border-t border-rose-200/60 font-medium">
                    Family Contact: {activeNotice.janazahDetails.relativeInfo}
                  </div>
                </div>
              )}

              {/* Special details for Khutbah */}
              {activeNotice?.khutbahDetails && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                  <h4 className="font-bold text-emerald-950 flex items-center gap-1.5 text-sm">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>Friday Khutbah Schedule & Focus Points</span>
                  </h4>
                  <p className="font-semibold text-emerald-900">
                    Khatib: {activeNotice.khutbahDetails.khatibName}
                  </p>
                  <p className="text-slate-700">Topic: "{activeNotice.khutbahDetails.topic}"</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 pt-1">
                    {activeNotice.khutbahDetails.keyPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                  <p className="text-emerald-800 text-[11px] font-semibold pt-1 border-t border-emerald-200/60">
                    {activeNotice.khutbahDetails.time}
                  </p>
                </div>
              )}

              {/* Special RSVP selector for Events */}
              {activeEvent && onUpdateRsvp && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Community RSVP</h4>
                      <p className="text-[11px] text-slate-500">
                        {activeEvent.rsvps.attending} attending • {activeEvent.rsvps.maybe} maybe
                      </p>
                    </div>
                    {activeEvent.speaker && (
                      <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
                        Speaker: {activeEvent.speaker}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onUpdateRsvp(activeEvent.id, 'attending')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeEvent.userRsvp === 'attending'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Going ({activeEvent.rsvps.attending})</span>
                    </button>
                    <button
                      onClick={() => onUpdateRsvp(activeEvent.id, 'maybe')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeEvent.userRsvp === 'maybe'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>Maybe ({activeEvent.rsvps.maybe})</span>
                    </button>
                    <button
                      onClick={() => onUpdateRsvp(activeEvent.id, 'declined')}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                        activeEvent.userRsvp === 'declined'
                          ? 'bg-slate-700 text-white'
                          : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="text-[11px] text-slate-500">
                Issued by {activeNotification.authorOrOrganizer || 'Central Mahallu Jama\'ath'}
              </span>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => {
                    const shareText = `${activeNotification.title} - Edappal Central Mahallu: ${activeNotification.summary}`;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(shareText);
                      setCopyStatus(true);
                      setTimeout(() => setCopyStatus(false), 2000);
                    }
                  }}
                  className="px-3 py-1.5 sm:py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Share announcement"
                >
                  {copyStatus ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleNavigateToFeed}
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Open Full Feed</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADMIN BROADCAST MODAL */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Broadcast New Mahallu Circular</h3>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Circular Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Urgent Janazah, Free Health Camp, Ramadan Timetable"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={broadcastCategory}
                    onChange={(e) => setBroadcastCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  >
                    <option value="General">General Notice</option>
                    <option value="Janazah">Janazah Announcement</option>
                    <option value="Khutbah">Friday Khutbah</option>
                    <option value="Emergency">Emergency Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    value={broadcastPriority}
                    onChange={(e) => setBroadcastPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent (Red Alert)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Announcement Body *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write the official circular text for Mahallu residents..."
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Send Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
