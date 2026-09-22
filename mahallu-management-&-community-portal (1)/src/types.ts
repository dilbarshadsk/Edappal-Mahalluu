export type Role = 'admin' | 'resident';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  houseNo?: string;
  familyId?: string;
  ward?: string;
  designation?: string;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type EconomicStatus = 'General' | 'Zakat-Eligible' | 'Priority Support';

export interface FamilyMember {
  id: string;
  name: string;
  relationToHead: 'Head' | 'Spouse' | 'Son' | 'Daughter' | 'Father' | 'Mother' | 'Brother' | 'Sister' | 'Other';
  age: number;
  gender: 'Male' | 'Female';
  bloodGroup: BloodGroup;
  occupation: string;
  education: string;
  maritalStatus: 'Single' | 'Married' | 'Widowed' | 'Divorced';
  isAbroad?: boolean;
}

export interface FamilyRecord {
  id: string;
  houseNo: string;
  houseName: string;
  ward: string;
  headOfFamily: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  economicStatus: EconomicStatus;
  rationCardType: 'APL' | 'BPL' | 'AAY' | 'None';
  monthlyPaymentAmount?: number;
  monthlyChandaAmount: number;
  members: FamilyMember[];
  enrolledYear: number;
  portalEmail?: string;
  temporaryPassword?: string;
  credentialsIssuedDate?: string;
}

export type DuesStatus = 'Paid' | 'Pending' | 'Overdue';

export interface DuesRecord {
  id: string;
  familyId: string;
  houseNo: string;
  houseName: string;
  headOfFamily: string;
  ward: string;
  month: string;
  year: number;
  amount: number;
  status: DuesStatus;
  paidDate?: string;
  receiptNumber?: string;
  paymentMethod?: 'Online UPI' | 'Cash / Mahallu Office' | 'Bank Transfer' | 'Credit Card' | 'Net Banking' | string;
  recordedBy?: string;
}

export interface DonationContribution {
  id: string;
  campaignId: string;
  donorName: string;
  houseNo?: string;
  amount: number;
  date: string;
  anonymous: boolean;
  transactionId: string;
}

export interface DonationCampaign {
  id: string;
  title: string;
  category: 'Mosque Project' | 'Education' | 'Medical Relief' | 'Welfare & Aid';
  targetAmount: number;
  raisedAmount: number;
  description: string;
  donorCount: number;
  deadline: string;
  status: 'Active' | 'Completed';
  recentDonations: DonationContribution[];
}

export interface PrayerItem {
  id: string;
  name: string;
  arabicName: string;
  adhan: string;
  iqamah: string;
}

export interface PrayerSchedule {
  date: string;
  hijriDate: string;
  timings: PrayerItem[];
  jumuah: {
    firstAdhan: string;
    khutbah: string;
    prayer: string;
    khatib: string;
  };
}

export type NoticeCategory = 'General' | 'Janazah' | 'Khutbah' | 'Emergency';

export interface NoticeItem {
  id: string;
  title: string;
  category: NoticeCategory;
  date: string;
  time?: string;
  content: string;
  author: string;
  priority: 'normal' | 'urgent';
  janazahDetails?: {
    deceasedName: string;
    age: number;
    houseName: string;
    ward: string;
    relativeInfo: string;
    prayerTime: string;
    prayerVenue: string;
    burialGround: string;
  };
  khutbahDetails?: {
    khatibName: string;
    topic: string;
    keyPoints: string[];
    time: string;
  };
}

export interface CommunityEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  organizer: string;
  speaker?: string;
  rsvps: {
    attending: number;
    maybe: number;
    declined: number;
  };
  userRsvp?: 'attending' | 'maybe' | 'declined' | null;
}

export type RequestType = 
  | 'NOC Certificate' 
  | 'Marriage Certificate' 
  | 'Financial & Medical Aid' 
  | 'Add / Edit Family Members'
  | 'Grievance / Petition';

export type RequestStatus = 'Pending' | 'In Review' | 'Approved' | 'Rejected';

export interface ServiceRequest {
  id: string;
  refNo: string;
  type: RequestType;
  applicantName: string;
  houseNo: string;
  phone: string;
  ward: string;
  subject: string;
  details: string;
  submittedAt: string;
  updatedAt: string;
  status: RequestStatus;
  adminRemarks?: string;
  approvedCertificateData?: {
    certificateNo: string;
    issueDate: string;
    issuedBy: string;
    validityNote: string;
    purpose: string;
  };
}

export type ActiveTab = 'dashboard' | 'directory' | 'financials' | 'prayer-notices' | 'services' | 'geo-map' | 'madrassa' | 'contact-us';

export type CommitteeMessageCategory = 
  | 'General Inquiry' 
  | 'Confidential Counseling' 
  | 'Ward Issue' 
  | 'Payment / Financial'
  | 'Chanda / Financial' 
  | 'Emergency Aid' 
  | 'Feedback / Suggestion';

export type CommitteeMessageStatus = 'Pending' | 'In Review' | 'Replied' | 'Resolved';

export interface CommitteeMessage {
  id: string;
  referenceNo: string;
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
  sentAt: string;
  status: CommitteeMessageStatus;
  assignedTo: string;
  committeeReply?: {
    repliedBy: string;
    repliedAt: string;
    replyText: string;
  };
}

export interface CommitteeOfficial {
  id: string;
  name: string;
  designation: string;
  roleDescription: string;
  phone: string;
  email: string;
  availability: string;
  wardAssigned?: string;
}

export interface MahalluLandmark {
  id: string;
  name: string;
  type: 'masjid' | 'qabaristan' | 'madrasa' | 'office' | 'hall' | 'ambulance';
  description: string;
  x: number; // percentage coordinate 0 - 100 on map
  y: number;
  ward: string;
  contactPerson?: string;
  phone?: string;
}

export interface AIChatAction {
  label: string;
  actionType: 'navigate' | 'check_clearance' | 'quick_prompt' | 'open_submit_request';
  targetTab?: ActiveTab;
  prompt?: string;
  requestType?: RequestType;
}

export interface ClearanceCriterion {
  criterion: string;
  status: string;
  passed: boolean;
  note: string;
}

export interface ClearanceAuditResult {
  houseNo: string;
  certificateType: string;
  evaluatedAt: string;
  items: ClearanceCriterion[];
  overallStatus: 'CLEARED' | 'ACTION_REQUIRED' | 'PENDING_REVIEW';
  actionRequired?: string | null;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  clearanceStatus?: {
    houseNo: string;
    verdict: string;
    isCleared: boolean;
    pendingDues: number;
    censusComplete: boolean;
  };
  suggestedActions?: AIChatAction[];
  clearanceAudit?: ClearanceAuditResult;
  isEvaluatingClearance?: boolean;
}

export type NotificationType = 'announcement' | 'event';

export interface MahalluNotification {
  id: string;
  type: NotificationType;
  referenceId: string;
  title: string;
  category: string;
  summary: string;
  date: string;
  time?: string;
  venue?: string;
  authorOrOrganizer?: string;
  priority?: 'normal' | 'urgent';
  createdAt: string;
  isRead: boolean;
  badgeText?: string;
}

export interface MadrassaStudent {
  id: string;
  admissionNo: string;
  name: string;
  gender: 'Male' | 'Female';
  standard: number; // 1 to 10
  division: string;
  houseNo: string;
  houseName: string;
  parentName: string;
  parentPhone: string;
  quranLevel: string;
  attendancePct: number;
  monthlyFee: number;
  feeStatus: 'Paid' | 'Pending' | 'Scholarship';
  recentExamMarks?: {
    term: string;
    quranScore: number;
    fiqhScore: number;
    thareekhScore: number;
    totalScore: number;
    grade: 'Mumtaz (Distinction)' | 'Jayyid Jiddan (First Class)' | 'Jayyid (Second Class)' | 'Maqbool (Pass)';
  };
}

export interface MadrassaTeacher {
  id: string;
  name: string;
  title: string;
  classesAssigned: string[];
  subjects: string[];
  phone: string;
  experienceYears: number;
  qualification: string;
}

export interface MadrassaClassInfo {
  standard: number;
  division: string;
  classTeacher: string;
  totalStudents: number;
  timing: string;
  roomNo: string;
}

