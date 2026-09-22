import { NoticeItem, CommunityEvent, MahalluNotification } from '../types';

export function generateNotifications(
  notices: NoticeItem[],
  events: CommunityEvent[],
  readIds: Set<string>
): MahalluNotification[] {
  const notifications: MahalluNotification[] = [];

  // Map announcements / notices
  notices.forEach((notice) => {
    const id = `notif-notice-${notice.id}`;
    let badgeText = 'ANNOUNCEMENT';
    if (notice.priority === 'urgent') {
      badgeText = 'URGENT BROADCAST';
    } else if (notice.category === 'Janazah') {
      badgeText = 'JANAZAH NOTICE';
    } else if (notice.category === 'Khutbah') {
      badgeText = 'FRIDAY KHUTBAH';
    } else if (notice.category === 'Emergency') {
      badgeText = 'EMERGENCY';
    }

    notifications.push({
      id,
      type: 'announcement',
      referenceId: notice.id,
      title: notice.title,
      category: notice.category,
      summary: notice.content,
      date: notice.date,
      time: notice.time,
      authorOrOrganizer: notice.author,
      priority: notice.priority,
      createdAt: notice.date,
      isRead: readIds.has(id),
      badgeText
    });
  });

  // Map community events
  events.forEach((event) => {
    const id = `notif-event-${event.id}`;
    
    // Calculate relative badge
    const eventDate = new Date(event.date);
    const today = new Date('2026-09-22');
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let badgeText = 'UPCOMING EVENT';
    if (diffDays === 0) {
      badgeText = 'TODAY';
    } else if (diffDays === 1) {
      badgeText = 'TOMORROW';
    } else if (diffDays > 1 && diffDays <= 7) {
      badgeText = `IN ${diffDays} DAYS`;
    }

    notifications.push({
      id,
      type: 'event',
      referenceId: event.id,
      title: event.title,
      category: event.category,
      summary: event.description,
      date: event.date,
      time: event.time,
      venue: event.venue,
      authorOrOrganizer: event.organizer,
      priority: 'normal',
      createdAt: event.date,
      isRead: readIds.has(id),
      badgeText
    });
  });

  // Sort: Urgent items first, then upcoming dates closest to current time
  return notifications.sort((a, b) => {
    // Unread urgent first
    if (!a.isRead && a.priority === 'urgent' && (b.isRead || b.priority !== 'urgent')) return -1;
    if (!b.isRead && b.priority === 'urgent' && (a.isRead || a.priority !== 'urgent')) return 1;

    // Unread first
    if (!a.isRead && b.isRead) return -1;
    if (a.isRead && !b.isRead) return 1;

    // By date descending (newest/upcoming first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
