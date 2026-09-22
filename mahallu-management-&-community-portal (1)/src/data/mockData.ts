import { 
  FamilyRecord, 
  DuesRecord, 
  DonationCampaign, 
  PrayerSchedule, 
  NoticeItem, 
  CommunityEvent, 
  ServiceRequest,
  User,
  CommitteeMessage,
  CommitteeOfficial,
  MadrassaStudent,
  MadrassaTeacher,
  MadrassaClassInfo
} from '../types';

export const DEMO_USERS: Record<string, User> = {
  admin: {
    id: 'user-admin-1',
    name: 'Janab P.K. Abdul Rahman Haji',
    email: 'admin@mahallu.org',
    role: 'admin',
    phone: '+91 98471 23456',
    designation: 'General Secretary, Central Mahallu Jama\'ath Committee'
  },
  resident: {
    id: 'user-resident-1',
    name: 'Dr. CH Mansoor Ahmed',
    email: 'resident@mahallu.org',
    role: 'resident',
    phone: '+91 94462 88123',
    houseNo: 'M-14',
    ward: 'Ward 2 - Madina Colony',
    familyId: 'fam-02',
    designation: 'Resident & Head of Family'
  }
};

export interface RegisteredAccount {
  email: string;
  password: string;
  user: User;
  temporaryPassword?: string;
  issuedDate?: string;
}

export const REGISTERED_ACCOUNTS: RegisteredAccount[] = [
  {
    email: 'admin@mahallu.org',
    password: 'Admin@123',
    user: DEMO_USERS.admin
  },
  {
    email: 'secretary@mahallu.org',
    password: 'admin123',
    user: DEMO_USERS.admin
  },
  {
    email: 'ajmalma578@gmail.com',
    password: 'Admin@123',
    user: DEMO_USERS.admin
  },
  {
    email: 'resident@mahallu.org',
    password: 'Resident@123',
    user: DEMO_USERS.resident
  },
  {
    email: 'mansoor@mahallu.org',
    password: 'resident123',
    user: DEMO_USERS.resident
  },
  {
    email: 'mohammed@mahallu.org',
    password: 'Password@123',
    user: {
      id: 'user-resident-2',
      name: 'Al-Haj P.K. Mohammed Haji',
      email: 'mohammed@mahallu.org',
      role: 'resident',
      phone: '+91 98460 11223',
      houseNo: 'B-01',
      ward: 'Ward 1 - Bilal Nagar',
      familyId: 'fam-01',
      designation: 'Resident & Head of Family'
    }
  },
  {
    email: 'kareem.n08@mahallu.org',
    password: 'Kareem@2026',
    user: {
      id: 'user-resident-3',
      name: 'K.T. Abdul Kareem',
      email: 'kareem.n08@mahallu.org',
      role: 'resident',
      phone: '+91 97455 33441',
      houseNo: 'N-08',
      ward: 'Ward 3 - Edappal Town',
      familyId: 'fam-03',
      designation: 'Resident & Head of Family'
    }
  },
  {
    email: 'hamza.q22@mahallu.org',
    password: 'Hamza@2026',
    user: {
      id: 'user-resident-4',
      name: 'V.P. Hamza Haji',
      email: 'hamza.q22@mahallu.org',
      role: 'resident',
      phone: '+91 99470 66551',
      houseNo: 'Q-22',
      ward: 'Ward 4 - Quba Junction',
      familyId: 'fam-04',
      designation: 'Resident & Head of Family'
    }
  },
  {
    email: 'asma.b19@mahallu.org',
    password: 'Asma@2026',
    user: {
      id: 'user-resident-5',
      name: 'Asma M.V.',
      email: 'asma.b19@mahallu.org',
      role: 'resident',
      phone: '+91 96055 77889',
      houseNo: 'B-19',
      ward: 'Ward 1 - Bilal Nagar',
      familyId: 'fam-05',
      designation: 'Resident & Head of Family'
    }
  }
];

// Helper to register new resident account dynamically
export function registerNewResidentAccount(account: RegisteredAccount) {
  const normalizedEmail = account.email.trim().toLowerCase();
  const index = REGISTERED_ACCOUNTS.findIndex(
    a => a.email.toLowerCase() === normalizedEmail ||
         Boolean(account.user.houseNo && a.user.houseNo && a.user.houseNo.toLowerCase() === account.user.houseNo.toLowerCase())
  );

  if (index >= 0) {
    REGISTERED_ACCOUNTS[index] = account;
  } else {
    REGISTERED_ACCOUNTS.push(account);
  }

  // Persist to localStorage for session and reload safety
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = REGISTERED_ACCOUNTS.filter(a => a.user.role === 'resident');
      localStorage.setItem('mahallu_resident_accounts', JSON.stringify(stored));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }
}

// Helper to look up account by house number or email
export function getAccountForFamily(houseNo: string, headOfFamily?: string, email?: string): RegisteredAccount {
  const found = REGISTERED_ACCOUNTS.find(
    a => (a.user.houseNo && a.user.houseNo.toLowerCase() === houseNo.toLowerCase()) ||
         (email && a.email.toLowerCase() === email.toLowerCase())
  );

  if (found) return found;

  // Auto-generate credentials fallback if not explicitly found
  const cleanHouse = houseNo.toLowerCase().replace(/[^a-z0-9]/g, '');
  const generatedEmail = email || `resident.${cleanHouse}@mahallu.org`;
  const generatedPass = `${houseNo.replace(/[^a-zA-Z0-9]/g, '')}@Mahallu2026`;
  
  const newAccount: RegisteredAccount = {
    email: generatedEmail,
    password: generatedPass,
    temporaryPassword: generatedPass,
    issuedDate: '2026-09-21',
    user: {
      id: `user-${cleanHouse}`,
      name: headOfFamily || `Resident House #${houseNo}`,
      email: generatedEmail,
      role: 'resident',
      houseNo: houseNo,
      designation: 'Resident & Head of Family'
    }
  };

  registerNewResidentAccount(newAccount);
  return newAccount;
}

// Hydrate from localStorage on initialization if available
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const raw = localStorage.getItem('mahallu_resident_accounts');
    if (raw) {
      const parsed: RegisteredAccount[] = JSON.parse(raw);
      parsed.forEach(acc => {
        if (!REGISTERED_ACCOUNTS.some(a => a.email.toLowerCase() === acc.email.toLowerCase())) {
          REGISTERED_ACCOUNTS.push(acc);
        }
      });
    }
  } catch {
    // Ignore JSON parse errors
  }
}

export function authenticateUser(emailInput: string, passwordInput: string): User | null {
  const normalizedEmail = emailInput.trim().toLowerCase();
  const trimmedPassword = passwordInput.trim();

  // Find matching account
  const account = REGISTERED_ACCOUNTS.find(
    acc => acc.email.toLowerCase() === normalizedEmail && acc.password === trimmedPassword
  );

  return account ? account.user : null;
}

export const INITIAL_FAMILIES: FamilyRecord[] = [
  {
    id: 'fam-01',
    houseNo: 'B-01',
    houseName: 'Baitul Falah',
    ward: 'Ward 1 - Bilal Nagar',
    headOfFamily: 'Al-Haj P.K. Mohammed Haji',
    phone: '+91 98460 11223',
    alternatePhone: '+91 98460 11224',
    address: 'Near Old Madrasa, Bilal Nagar, Central Mahallu',
    economicStatus: 'General',
    rationCardType: 'APL',
    monthlyChandaAmount: 500,
    enrolledYear: 1994,
    members: [
      { id: 'm-1-1', name: 'Al-Haj P.K. Mohammed Haji', relationToHead: 'Head', age: 68, gender: 'Male', bloodGroup: 'O+', occupation: 'Retired Merchant & Waqf Trustee', education: 'SSLC', maritalStatus: 'Married' },
      { id: 'm-1-2', name: 'Suhara Mohammed', relationToHead: 'Spouse', age: 62, gender: 'Female', bloodGroup: 'A+', occupation: 'Homemaker', education: 'Upper Primary', maritalStatus: 'Married' },
      { id: 'm-1-3', name: 'Nawaf P.K.', relationToHead: 'Son', age: 34, gender: 'Male', bloodGroup: 'O+', occupation: 'Software Architect (Dubai)', education: 'B.Tech Computer Science', maritalStatus: 'Married', isAbroad: true },
      { id: 'm-1-4', name: 'Dr. Naseeba Rahman', relationToHead: 'Daughter', age: 29, gender: 'Female', bloodGroup: 'B+', occupation: 'Dentist (BDS)', education: 'MDS Orthodontics', maritalStatus: 'Married' },
      { id: 'm-1-5', name: 'Ayaan Nawaf', relationToHead: 'Other', age: 4, gender: 'Male', bloodGroup: 'O+', occupation: 'Student', education: 'Kindergarten', maritalStatus: 'Single' }
    ]
  },
  {
    id: 'fam-02',
    houseNo: 'M-14',
    houseName: 'Darussalam',
    ward: 'Ward 2 - Madina Colony',
    headOfFamily: 'Dr. CH Mansoor Ahmed',
    phone: '+91 94462 88123',
    alternatePhone: '+91 94462 88124',
    address: 'Opp. Crescent Public School, Madina Colony',
    economicStatus: 'General',
    rationCardType: 'APL',
    monthlyChandaAmount: 500,
    enrolledYear: 2008,
    members: [
      { id: 'm-2-1', name: 'Dr. CH Mansoor Ahmed', relationToHead: 'Head', age: 46, gender: 'Male', bloodGroup: 'A+', occupation: 'Associate Professor & Physician', education: 'MBBS, MD General Medicine', maritalStatus: 'Married' },
      { id: 'm-2-2', name: 'Rubeena Mansoor', relationToHead: 'Spouse', age: 41, gender: 'Female', bloodGroup: 'B+', occupation: 'High School Teacher', education: 'M.Sc Mathematics, B.Ed', maritalStatus: 'Married' },
      { id: 'm-2-3', name: 'Farhan Mansoor', relationToHead: 'Son', age: 17, gender: 'Male', bloodGroup: 'A+', occupation: 'Higher Secondary Student', education: '+2 Science', maritalStatus: 'Single' },
      { id: 'm-2-4', name: 'Amina Mansoor', relationToHead: 'Daughter', age: 13, gender: 'Female', bloodGroup: 'AB+', occupation: 'Student', education: 'Standard 8', maritalStatus: 'Single' }
    ]
  },
  {
    id: 'fam-03',
    houseNo: 'N-08',
    houseName: 'Kalliyath House',
    ward: 'Ward 3 - Al-Noor',
    headOfFamily: 'K.T. Abdul Kareem',
    phone: '+91 97455 33441',
    address: 'Near Noorul Huda Madrasa, Ward 3',
    economicStatus: 'Zakat-Eligible',
    rationCardType: 'BPL',
    monthlyChandaAmount: 200,
    enrolledYear: 2012,
    members: [
      { id: 'm-3-1', name: 'K.T. Abdul Kareem', relationToHead: 'Head', age: 53, gender: 'Male', bloodGroup: 'B-', occupation: 'Auto Rickshaw Driver', education: '7th Standard', maritalStatus: 'Married' },
      { id: 'm-3-2', name: 'Jameela Kareem', relationToHead: 'Spouse', age: 48, gender: 'Female', bloodGroup: 'O+', occupation: 'Kudumbashree Tailor', education: 'SSLC', maritalStatus: 'Married' },
      { id: 'm-3-3', name: 'Ashiq K.T.', relationToHead: 'Son', age: 21, gender: 'Male', bloodGroup: 'B-', occupation: 'Diploma Apprentice', education: 'Diploma Mechanical', maritalStatus: 'Single' },
      { id: 'm-3-4', name: 'Ansiya K.T.', relationToHead: 'Daughter', age: 18, gender: 'Female', bloodGroup: 'O+', occupation: 'Degree Student', education: 'B.Com 1st Year', maritalStatus: 'Single' }
    ]
  },
  {
    id: 'fam-04',
    houseNo: 'Q-22',
    houseName: 'Noor Villa',
    ward: 'Ward 4 - Quba Junction',
    headOfFamily: 'V.P. Hamza Haji',
    phone: '+91 99470 66551',
    address: 'Post Office Road, Quba Junction',
    economicStatus: 'General',
    rationCardType: 'APL',
    monthlyChandaAmount: 500,
    enrolledYear: 1999,
    members: [
      { id: 'm-4-1', name: 'V.P. Hamza Haji', relationToHead: 'Head', age: 72, gender: 'Male', bloodGroup: 'O-', occupation: 'Wholesale Spice Merchant', education: 'Metric', maritalStatus: 'Married' },
      { id: 'm-4-2', name: 'Mariyam Hamza', relationToHead: 'Spouse', age: 66, gender: 'Female', bloodGroup: 'A-', occupation: 'Homemaker', education: 'Primary', maritalStatus: 'Married' },
      { id: 'm-4-3', name: 'Shameem Hamza', relationToHead: 'Son', age: 38, gender: 'Male', bloodGroup: 'O-', occupation: 'Civil Engineer (Qatar)', education: 'B.Tech Civil', maritalStatus: 'Married', isAbroad: true },
      { id: 'm-4-4', name: 'Sabira Shameem', relationToHead: 'Daughter', age: 33, gender: 'Female', bloodGroup: 'AB-', occupation: 'Architect', education: 'B.Arch', maritalStatus: 'Married' }
    ]
  },
  {
    id: 'fam-05',
    houseNo: 'B-19',
    houseName: 'Gulshan Manzil',
    ward: 'Ward 1 - Bilal Nagar',
    headOfFamily: 'Late M.V. Musthafa (Widow: Asma M.V.)',
    phone: '+91 96055 77889',
    address: 'Canal Road, Bilal Nagar West',
    economicStatus: 'Priority Support',
    rationCardType: 'AAY',
    monthlyChandaAmount: 100,
    enrolledYear: 2015,
    members: [
      { id: 'm-5-1', name: 'Asma M.V.', relationToHead: 'Head', age: 52, gender: 'Female', bloodGroup: 'AB+', occupation: 'Pappad Making & Handicrafts', education: 'Upper Primary', maritalStatus: 'Widowed' },
      { id: 'm-5-2', name: 'Sumayya M.V.', relationToHead: 'Daughter', age: 23, gender: 'Female', bloodGroup: 'A+', occupation: 'B.Ed Student (Scholarship Recipient)', education: 'BA English, B.Ed Ongoing', maritalStatus: 'Single' },
      { id: 'm-5-3', name: 'Salman M.V.', relationToHead: 'Son', age: 15, gender: 'Male', bloodGroup: 'AB+', occupation: 'High School Student', education: 'Class 10', maritalStatus: 'Single' }
    ]
  },
  {
    id: 'fam-06',
    houseNo: 'M-07',
    houseName: 'Al-Hasanat',
    ward: 'Ward 2 - Madina Colony',
    headOfFamily: 'T.K. Ubaidullah',
    phone: '+91 94471 99220',
    address: 'Near Rose Garden, Madina Colony',
    economicStatus: 'General',
    rationCardType: 'APL',
    monthlyChandaAmount: 400,
    enrolledYear: 2004,
    members: [
      { id: 'm-6-1', name: 'T.K. Ubaidullah', relationToHead: 'Head', age: 57, gender: 'Male', bloodGroup: 'B+', occupation: 'Building Contractor', education: 'Plus Two', maritalStatus: 'Married' },
      { id: 'm-6-2', name: 'Khadija Ubaidullah', relationToHead: 'Spouse', age: 50, gender: 'Female', bloodGroup: 'O+', occupation: 'Homemaker', education: 'SSLC', maritalStatus: 'Married' },
      { id: 'm-6-3', name: 'Habeeb Rahman T.K.', relationToHead: 'Son', age: 26, gender: 'Male', bloodGroup: 'B+', occupation: 'Chartered Accountant (Kochi)', education: 'CA, B.Com', maritalStatus: 'Single' }
    ]
  },
  {
    id: 'fam-07',
    houseNo: 'N-15',
    houseName: 'Baitul Aman',
    ward: 'Ward 3 - Al-Noor',
    headOfFamily: 'Sayyid Munavvar Ali Shihab',
    phone: '+91 98473 44556',
    address: 'Near Mahallu Islamic Centre, Al-Noor',
    economicStatus: 'General',
    rationCardType: 'APL',
    monthlyChandaAmount: 500,
    enrolledYear: 2001,
    members: [
      { id: 'm-7-1', name: 'Sayyid Munavvar Ali Shihab', relationToHead: 'Head', age: 49, gender: 'Male', bloodGroup: 'O+', occupation: 'Islamic Scholar & Author', education: 'MA Arabic, Afzal-ul-Ulama', maritalStatus: 'Married' },
      { id: 'm-7-2', name: 'Shareefa Bushra', relationToHead: 'Spouse', age: 43, gender: 'Female', bloodGroup: 'A+', occupation: 'Arabic Tutor', education: 'Afzal-ul-Ulama', maritalStatus: 'Married' },
      { id: 'm-7-3', name: 'Sayyid Bilal Ali', relationToHead: 'Son', age: 19, gender: 'Male', bloodGroup: 'O+', occupation: 'Law Student', education: 'BA LLB 2nd Year', maritalStatus: 'Single' }
    ]
  },
  {
    id: 'fam-08',
    houseNo: 'Q-05',
    houseName: 'Chembakassery House',
    ward: 'Ward 4 - Quba Junction',
    headOfFamily: 'C.H. Moideenkutty',
    phone: '+91 97472 88990',
    address: 'KSRTC Link Road, Quba',
    economicStatus: 'Zakat-Eligible',
    rationCardType: 'BPL',
    monthlyChandaAmount: 200,
    enrolledYear: 2011,
    members: [
      { id: 'm-8-1', name: 'C.H. Moideenkutty', relationToHead: 'Head', age: 61, gender: 'Male', bloodGroup: 'AB+', occupation: 'Carpentry Craftsman', education: 'Primary', maritalStatus: 'Married' },
      { id: 'm-8-2', name: 'Pathumma C.H.', relationToHead: 'Spouse', age: 55, gender: 'Female', bloodGroup: 'B+', occupation: 'Homemaker', education: 'Primary', maritalStatus: 'Married' },
      { id: 'm-8-3', name: 'Riyaz C.H.', relationToHead: 'Son', age: 24, gender: 'Male', bloodGroup: 'AB+', occupation: 'Electrician & AC Technician', education: 'ITI Electrical', maritalStatus: 'Single' }
    ]
  },
  {
    id: 'fam-09',
    houseNo: 'B-31',
    houseName: 'Kizhakkayil',
    ward: 'Ward 1 - Bilal Nagar',
    headOfFamily: 'K.P. Faisal',
    phone: '+91 95670 12345',
    address: 'Bilal Nagar 4th Cross Road',
    economicStatus: 'General',
    rationCardType: 'APL',
    monthlyChandaAmount: 400,
    enrolledYear: 2016,
    members: [
      { id: 'm-9-1', name: 'K.P. Faisal', relationToHead: 'Head', age: 39, gender: 'Male', bloodGroup: 'A-', occupation: 'Pharmacy Owner', education: 'B.Pharm', maritalStatus: 'Married' },
      { id: 'm-9-2', name: 'Dr. Shahina Faisal', relationToHead: 'Spouse', age: 35, gender: 'Female', bloodGroup: 'O+', occupation: 'Ayurvedic Medical Officer', education: 'BAMS', maritalStatus: 'Married' },
      { id: 'm-9-3', name: 'Hadi Faisal', relationToHead: 'Son', age: 8, gender: 'Male', bloodGroup: 'A-', occupation: 'Student', education: '3rd Standard', maritalStatus: 'Single' }
    ]
  },
  {
    id: 'fam-10',
    houseNo: 'M-28',
    houseName: 'Al-Madina Heritage',
    ward: 'Ward 2 - Madina Colony',
    headOfFamily: 'P.A. Kunhimohammed Master',
    phone: '+91 94951 66778',
    address: 'Behind Madina Juma Masjid',
    economicStatus: 'General',
    rationCardType: 'APL',
    monthlyChandaAmount: 500,
    enrolledYear: 1996,
    members: [
      { id: 'm-10-1', name: 'P.A. Kunhimohammed Master', relationToHead: 'Head', age: 70, gender: 'Male', bloodGroup: 'O+', occupation: 'Retired Headmaster & Historian', education: 'BA, B.Ed', maritalStatus: 'Married' },
      { id: 'm-10-2', name: 'Ayishabi Kunhimohammed', relationToHead: 'Spouse', age: 64, gender: 'Female', bloodGroup: 'B+', occupation: 'Retired Teacher', education: 'TTC', maritalStatus: 'Married' },
      { id: 'm-10-3', name: 'Er. Jasim P.A.', relationToHead: 'Son', age: 36, gender: 'Male', bloodGroup: 'O+', occupation: 'Petroleum Engineer (Oman)', education: 'B.Tech Chemical', maritalStatus: 'Married', isAbroad: true }
    ]
  },
  {
    id: 'fam-11',
    houseNo: 'N-24',
    houseName: 'Koyissery House',
    ward: 'Ward 3 - Al-Noor',
    headOfFamily: 'M.K. Basheer',
    phone: '+91 97441 55667',
    address: 'Near Riverview Walkway, Al-Noor',
    economicStatus: 'Zakat-Eligible',
    rationCardType: 'BPL',
    monthlyChandaAmount: 200,
    enrolledYear: 2018,
    members: [
      { id: 'm-11-1', name: 'M.K. Basheer', relationToHead: 'Head', age: 50, gender: 'Male', bloodGroup: 'B+', occupation: 'Fish Merchant & Vendor', education: '5th Standard', maritalStatus: 'Married' },
      { id: 'm-11-2', name: 'Fathimath Zuhra', relationToHead: 'Spouse', age: 44, gender: 'Female', bloodGroup: 'A+', occupation: 'Homemaker', education: '7th Standard', maritalStatus: 'Married' },
      { id: 'm-11-3', name: 'Shakir M.K.', relationToHead: 'Son', age: 22, gender: 'Male', bloodGroup: 'B+', occupation: 'Graphic Designer', education: 'Diploma Multimedia', maritalStatus: 'Single' },
      { id: 'm-11-4', name: 'Shifa M.K.', relationToHead: 'Daughter', age: 16, gender: 'Female', bloodGroup: 'A+', occupation: 'Student', education: 'Plus One Science', maritalStatus: 'Single' }
    ]
  },
  {
    id: 'fam-12',
    houseNo: 'Q-35',
    houseName: 'Al-Rayyan',
    ward: 'Ward 4 - Quba Junction',
    headOfFamily: 'E.K. Ashraf',
    phone: '+91 98950 44332',
    address: 'Railway Overbridge Lane, Quba',
    economicStatus: 'General',
    rationCardType: 'APL',
    monthlyChandaAmount: 400,
    enrolledYear: 2007,
    members: [
      { id: 'm-12-1', name: 'E.K. Ashraf', relationToHead: 'Head', age: 54, gender: 'Male', bloodGroup: 'O+', occupation: 'Hardware & Sanitations Dealer', education: 'Pre-Degree', maritalStatus: 'Married' },
      { id: 'm-12-2', name: 'Sakeena Ashraf', relationToHead: 'Spouse', age: 47, gender: 'Female', bloodGroup: 'AB+', occupation: 'Homemaker', education: 'SSLC', maritalStatus: 'Married' },
      { id: 'm-12-3', name: 'Adil Ashraf', relationToHead: 'Son', age: 25, gender: 'Male', bloodGroup: 'O+', occupation: 'Digital Marketing Lead (Bengaluru)', education: 'BBA, MBA', maritalStatus: 'Single' }
    ]
  }
];

export const INITIAL_DUES: DuesRecord[] = [
  { id: 'due-01', familyId: 'fam-01', houseNo: 'B-01', houseName: 'Baitul Falah', headOfFamily: 'Al-Haj P.K. Mohammed Haji', ward: 'Ward 1 - Bilal Nagar', month: 'September', year: 2026, amount: 500, status: 'Paid', paidDate: '2026-09-05', receiptNumber: 'MHL-26-0914', paymentMethod: 'Online UPI', recordedBy: 'Admin (System)' },
  { id: 'due-02', familyId: 'fam-02', houseNo: 'M-14', houseName: 'Darussalam', headOfFamily: 'Dr. CH Mansoor Ahmed', ward: 'Ward 2 - Madina Colony', month: 'September', year: 2026, amount: 500, status: 'Paid', paidDate: '2026-09-10', receiptNumber: 'MHL-26-0988', paymentMethod: 'Online UPI', recordedBy: 'Resident Portal' },
  { id: 'due-03', familyId: 'fam-03', houseNo: 'N-08', houseName: 'Kalliyath House', headOfFamily: 'K.T. Abdul Kareem', ward: 'Ward 3 - Al-Noor', month: 'September', year: 2026, amount: 200, status: 'Pending' },
  { id: 'due-04', familyId: 'fam-04', houseNo: 'Q-22', houseName: 'Noor Villa', headOfFamily: 'V.P. Hamza Haji', ward: 'Ward 4 - Quba Junction', month: 'September', year: 2026, amount: 500, status: 'Paid', paidDate: '2026-09-02', receiptNumber: 'MHL-26-0891', paymentMethod: 'Cash / Mahallu Office', recordedBy: 'Treasurer Office' },
  { id: 'due-05', familyId: 'fam-05', houseNo: 'B-19', houseName: 'Gulshan Manzil', headOfFamily: 'Late M.V. Musthafa (Widow: Asma M.V.)', ward: 'Ward 1 - Bilal Nagar', month: 'September', year: 2026, amount: 100, status: 'Paid', paidDate: '2026-09-12', receiptNumber: 'MHL-26-1011', paymentMethod: 'Cash / Mahallu Office', recordedBy: 'Welfare Committee' },
  { id: 'due-06', familyId: 'fam-06', houseNo: 'M-07', houseName: 'Al-Hasanat', headOfFamily: 'T.K. Ubaidullah', ward: 'Ward 2 - Madina Colony', month: 'September', year: 2026, amount: 400, status: 'Pending' },
  { id: 'due-07', familyId: 'fam-07', houseNo: 'N-15', houseName: 'Baitul Aman', headOfFamily: 'Sayyid Munavvar Ali Shihab', ward: 'Ward 3 - Al-Noor', month: 'September', year: 2026, amount: 500, status: 'Paid', paidDate: '2026-09-01', receiptNumber: 'MHL-26-0870', paymentMethod: 'Bank Transfer', recordedBy: 'Accounts' },
  { id: 'due-08', familyId: 'fam-08', houseNo: 'Q-05', houseName: 'Chembakassery House', headOfFamily: 'C.H. Moideenkutty', ward: 'Ward 4 - Quba Junction', month: 'September', year: 2026, amount: 200, status: 'Overdue' },
  { id: 'due-09', familyId: 'fam-09', houseNo: 'B-31', houseName: 'Kizhakkayil', headOfFamily: 'K.P. Faisal', ward: 'Ward 1 - Bilal Nagar', month: 'September', year: 2026, amount: 400, status: 'Paid', paidDate: '2026-09-08', receiptNumber: 'MHL-26-0945', paymentMethod: 'Online UPI', recordedBy: 'Admin (System)' },
  { id: 'due-10', familyId: 'fam-10', houseNo: 'M-28', houseName: 'Al-Madina Heritage', headOfFamily: 'P.A. Kunhimohammed Master', ward: 'Ward 2 - Madina Colony', month: 'September', year: 2026, amount: 500, status: 'Paid', paidDate: '2026-09-03', receiptNumber: 'MHL-26-0904', paymentMethod: 'Bank Transfer', recordedBy: 'Admin (System)' },
  { id: 'due-11', familyId: 'fam-11', houseNo: 'N-24', houseName: 'Koyissery House', headOfFamily: 'M.K. Basheer', ward: 'Ward 3 - Al-Noor', month: 'September', year: 2026, amount: 200, status: 'Overdue' },
  { id: 'due-12', familyId: 'fam-12', houseNo: 'Q-35', houseName: 'Al-Rayyan', headOfFamily: 'E.K. Ashraf', ward: 'Ward 4 - Quba Junction', month: 'September', year: 2026, amount: 400, status: 'Pending' }
];

export const INITIAL_CAMPAIGNS: DonationCampaign[] = [
  {
    id: 'camp-1',
    title: 'Central Juma Masjid Solar Energy & Green Roof Project',
    category: 'Mosque Project',
    targetAmount: 850000,
    raisedAmount: 645000,
    description: 'Transitioning the 800-capacity central masjid complex to clean solar energy with 25kW on-grid solar panels and eco-friendly cooling to reduce recurring electricity bills to zero.',
    donorCount: 142,
    deadline: '2026-10-31',
    status: 'Active',
    recentDonations: [
      { id: 'd-1', campaignId: 'camp-1', donorName: 'Nawaf P.K. (Dubai)', houseNo: 'B-01', amount: 50000, date: '2026-09-18', anonymous: false, transactionId: 'TXN-90214' },
      { id: 'd-2', campaignId: 'camp-1', donorName: 'Well-Wisher Resident', amount: 25000, date: '2026-09-17', anonymous: true, transactionId: 'TXN-88143' },
      { id: 'd-3', campaignId: 'camp-1', donorName: 'Dr. CH Mansoor Ahmed', houseNo: 'M-14', amount: 15000, date: '2026-09-15', anonymous: false, transactionId: 'TXN-87610' }
    ]
  },
  {
    id: 'camp-2',
    title: 'Dialysis & Emergency Critical Healthcare Relief Fund',
    category: 'Medical Relief',
    targetAmount: 500000,
    raisedAmount: 410000,
    description: 'Providing monthly subsidised dialysis assistance, cancer medications, and emergency surgery grants for economically vulnerable Mahallu residents regardless of status.',
    donorCount: 98,
    deadline: '2026-11-15',
    status: 'Active',
    recentDonations: [
      { id: 'd-4', campaignId: 'camp-2', donorName: 'Shameem Hamza (Qatar)', houseNo: 'Q-22', amount: 30000, date: '2026-09-19', anonymous: false, transactionId: 'TXN-91102' },
      { id: 'd-5', campaignId: 'camp-2', donorName: 'Anonymous Brother', amount: 10000, date: '2026-09-16', anonymous: true, transactionId: 'TXN-89400' }
    ]
  },
  {
    id: 'camp-3',
    title: 'Civil Services & Higher Education Merit Scholarship 2026-27',
    category: 'Education',
    targetAmount: 300000,
    raisedAmount: 215000,
    description: 'Mentorship grants, laptop subsidies, and competitive exam coaching (UPSC, PSC, GATE, NEET) for meritorious students from low-income Mahallu families.',
    donorCount: 64,
    deadline: '2026-10-15',
    status: 'Active',
    recentDonations: [
      { id: 'd-6', campaignId: 'camp-3', donorName: 'Er. Jasim P.A. (Oman)', houseNo: 'M-28', amount: 25000, date: '2026-09-14', anonymous: false, transactionId: 'TXN-85412' },
      { id: 'd-7', campaignId: 'camp-3', donorName: 'Habeeb Rahman T.K.', houseNo: 'M-07', amount: 12000, date: '2026-09-10', anonymous: false, transactionId: 'TXN-83911' }
    ]
  },
  {
    id: 'camp-4',
    title: 'Widow Welfare, Orphan Support & Monthly Ration Kits',
    category: 'Welfare & Aid',
    targetAmount: 250000,
    raisedAmount: 195000,
    description: 'Comprehensive monthly food security baskets, medical kit supplies, and seasonal school supply distribution for 18 orphan & single-mother households in our Mahallu.',
    donorCount: 82,
    deadline: '2026-12-31',
    status: 'Active',
    recentDonations: [
      { id: 'd-8', campaignId: 'camp-4', donorName: 'K.P. Faisal', houseNo: 'B-31', amount: 15000, date: '2026-09-18', anonymous: false, transactionId: 'TXN-90822' },
      { id: 'd-9', campaignId: 'camp-4', donorName: 'Anonymous Sister', amount: 8000, date: '2026-09-13', anonymous: true, transactionId: 'TXN-86510' }
    ]
  }
];

export const INITIAL_PRAYER_SCHEDULE: PrayerSchedule = {
  date: 'Monday, 21 September 2026',
  hijriDate: '9 Rabi\' al-Thani 1448 AH',
  timings: [
    { id: 'p-1', name: 'Fajr', arabicName: 'الفجر', adhan: '05:02 AM', iqamah: '05:25 AM' },
    { id: 'p-2', name: 'Sunrise (Shurooq)', arabicName: 'الشروق', adhan: '06:18 AM', iqamah: '—' },
    { id: 'p-3', name: 'Dhuhr', arabicName: 'الظهر', adhan: '12:24 PM', iqamah: '12:45 PM' },
    { id: 'p-4', name: 'Asr', arabicName: 'العصر', adhan: '03:48 PM', iqamah: '04:10 PM' },
    { id: 'p-5', name: 'Maghrib', arabicName: 'المغرب', adhan: '06:26 PM', iqamah: '06:36 PM' },
    { id: 'p-6', name: 'Isha', arabicName: 'العشاء', adhan: '07:38 PM', iqamah: '08:00 PM' }
  ],
  jumuah: {
    firstAdhan: '12:15 PM',
    khutbah: '12:40 PM',
    prayer: '01:05 PM',
    khatib: 'Chief Imam Maulana Abdul Wahab Qasimi'
  }
};

export const INITIAL_NOTICES: NoticeItem[] = [
  {
    id: 'not-1',
    title: 'Janazah Announcement: Late Al-Haj K.M. Kunjabdulla Haji (84 yrs)',
    category: 'Janazah',
    date: '2026-09-21',
    time: '11:30 AM',
    author: 'Mahallu Secretariat',
    priority: 'urgent',
    content: 'Inna lillahi wa inna ilayhi raji\'un. We deeply grieve the peaceful demise of respected senior elder Al-Haj K.M. Kunjabdulla Haji (84 yrs), Baitul Noor (Ward 2, Madina Colony). May Allah SWT shower his vast mercy upon his soul and grant fortitude to his grieving family.',
    janazahDetails: {
      deceasedName: 'Al-Haj K.M. Kunjabdulla Haji',
      age: 84,
      houseName: 'Baitul Noor',
      ward: 'Ward 2 - Madina Colony',
      relativeInfo: 'Father of K.M. Musthafa (Merchant) and Dr. Jaleel (Calicut)',
      prayerTime: 'Today at 04:30 PM (After Asr Prayer)',
      prayerVenue: 'Central Juma Masjid Prayer Hall',
      burialGround: 'Central Mahallu Qabaristan (Grave Block C)'
    }
  },
  {
    id: 'not-2',
    title: 'Upcoming Friday Khutbah: "Digital Ethics & Youth Mental Well-being"',
    category: 'Khutbah',
    date: '2026-09-25',
    time: '12:40 PM',
    author: 'Imam Office',
    priority: 'normal',
    content: 'The upcoming Jumu\'ah Khutbah will focus on fostering conscious digital habits, protecting adolescents from online addiction, and reviving compassionate family communications in light of Sunnah.',
    khutbahDetails: {
      khatibName: 'Maulana Abdul Wahab Qasimi (Chief Imam)',
      topic: 'Digital Ethics, Screen Balance & Reviving Family Bonds',
      keyPoints: [
        'Guarding the gaze and speech in online environments',
        'Parental responsibility in age of AI and smartphone saturation',
        'Creating device-free family table moments and barakah'
      ],
      time: 'First Adhan at 12:15 PM, Khutbah starts at 12:40 PM sharp'
    }
  },
  {
    id: 'not-3',
    title: 'Free Mega Multi-Specialty Health, Cardiac & Eye Screening Camp',
    category: 'General',
    date: '2026-09-27',
    time: '09:00 AM - 02:00 PM',
    author: 'Mahallu Health & Welfare Wing',
    priority: 'normal',
    content: 'In association with Aster MIMS Medical Foundation, the Mahallu Health Wing is organizing a free comprehensive medical camp. Services include ECG, blood sugar, lipid profile, ophthalmology screening with complimentary spectacles for eligible senior citizens.'
  },
  {
    id: 'not-4',
    title: 'Notice: Annual General Body Meeting & Audited Accounts Presentation',
    category: 'General',
    date: '2026-10-04',
    time: '07:30 PM (After Isha)',
    author: 'Secretary P.K. Abdul Rahman Haji',
    priority: 'normal',
    content: 'All registered heads of families and active Mahallu members are formally requested to attend the Annual General Body Meeting at the Community Auditorium. Audited balance sheet for FY 2025-26, election of 2 ward sub-committee members, and solar project progress will be tabled.'
  }
];

export const INITIAL_EVENTS: CommunityEvent[] = [
  {
    id: 'evt-1',
    title: 'Annual Mahallu Family Conclave & Career Guidance Expo',
    category: 'Education & Community',
    date: '2026-09-27',
    time: '09:00 AM - 04:30 PM',
    venue: 'Al-Noor Community Auditorium & Sports Ground',
    description: 'A vibrant day of family bonding, interactive career pavilions for 10th/12th students with civil servants, and interactive parenting discussions.',
    organizer: 'Mahallu Youth & Education Forum',
    speaker: 'Er. Mohammed Shafi IAS & Senior Academicians',
    rsvps: { attending: 185, maybe: 42, declined: 9 },
    userRsvp: 'attending'
  },
  {
    id: 'evt-2',
    title: 'Pre-Marital Life Readiness & Counseling Workshop',
    category: 'Family Welfare',
    date: '2026-10-11',
    time: '02:00 PM - 06:00 PM',
    venue: 'Islamic Cultural Centre Conference Hall',
    description: 'An interactive seminar for prospective grooms and brides covering emotional intelligence, financial planning, conflict resolution, and rights in marriage.',
    organizer: 'Mahallu Family Counseling Cell',
    speaker: 'Dr. C.K. Adil (Family Psychologist) & Usthad Zubair Faizy',
    rsvps: { attending: 48, maybe: 15, declined: 3 },
    userRsvp: null
  },
  {
    id: 'evt-3',
    title: 'Voluntary Blood Donation Drive & Rare Blood Registry',
    category: 'Health',
    date: '2026-10-18',
    time: '08:30 AM - 01:00 PM',
    venue: 'Madrasa Block B Ground Floor',
    description: 'Community emergency blood registry drive in partnership with Government Medical College Blood Bank. Aiming to collect 100 units.',
    organizer: 'Mahallu Relief Team',
    rsvps: { attending: 74, maybe: 20, declined: 5 },
    userRsvp: 'maybe'
  }
];

export const INITIAL_SERVICE_REQUESTS: ServiceRequest[] = [
  {
    id: 'req-01',
    refNo: 'MHL-REQ-2026-042',
    type: 'Marriage Certificate',
    applicantName: 'Dr. CH Mansoor Ahmed',
    houseNo: 'M-14',
    phone: '+91 94462 88123',
    ward: 'Ward 2 - Madina Colony',
    subject: 'Official Nikah / Marriage Verification Certificate for Embassy Visa',
    details: 'Requesting certified Mahallu Marriage Registration Extract for family visa stamping procedures. Nikah was solemnized at Central Juma Masjid on 14-Aug-2009 with Register Folio #118/2009.',
    submittedAt: '2026-09-15 10:30 AM',
    updatedAt: '2026-09-17 04:15 PM',
    status: 'Approved',
    adminRemarks: 'Verified against Mahallu Nikah Register Volume IV, Page 118. Marriage duly recorded. Certificate issued digitally with digital stamp.',
    approvedCertificateData: {
      certificateNo: 'MHL-CERT-MAR-2026-089',
      issueDate: '17 September 2026',
      issuedBy: 'Janab P.K. Abdul Rahman Haji (General Secretary)',
      validityNote: 'Official extract valid for passport, visa, and legal verification.',
      purpose: 'Family Residence Visa & Embassy Verification'
    }
  },
  {
    id: 'req-02',
    refNo: 'MHL-REQ-2026-048',
    type: 'NOC Certificate',
    applicantName: 'K.P. Faisal',
    houseNo: 'B-31',
    phone: '+91 95670 12345',
    ward: 'Ward 1 - Bilal Nagar',
    subject: 'No Objection Certificate for Commercial Pharmacy License',
    details: 'Applying for Kerala State Pharmacy Council local body NOC for operating retail medical store at Bilal Nagar Junction commercial shop room.',
    submittedAt: '2026-09-19 02:20 PM',
    updatedAt: '2026-09-20 11:00 AM',
    status: 'In Review',
    adminRemarks: 'Inspected premises location. Subscription payment dues verified up to date. Pending signature from Ward Member.'
  },
  {
    id: 'req-03',
    refNo: 'MHL-REQ-2026-051',
    type: 'Financial & Medical Aid',
    applicantName: 'Asma M.V.',
    houseNo: 'B-19',
    phone: '+91 96055 77889',
    ward: 'Ward 1 - Bilal Nagar',
    subject: 'Financial Assistance for Daughter\'s Final Semester B.Ed Fees',
    details: 'Requesting grant assistance of ₹15,000 for college tuition fee deadline at Calicut University Teacher Training Centre. Single parent family without steady income.',
    submittedAt: '2026-09-20 09:15 AM',
    updatedAt: '2026-09-21 10:00 AM',
    status: 'Pending',
    adminRemarks: 'Assigned to Ward Relief Convenor for house visit and recommendation before upcoming committee review.'
  },
  {
    id: 'req-04',
    refNo: 'MHL-REQ-2026-039',
    type: 'Grievance / Petition',
    applicantName: 'K.T. Abdul Kareem',
    houseNo: 'N-08',
    phone: '+91 97455 33441',
    ward: 'Ward 3 - Al-Noor',
    subject: 'Drainage water overflow near Madrasa walkway during heavy rains',
    details: 'The culvert adjacent to house #N-08 and the junior madrasa entrance is choked with silt, causing muddy water stagnation. Requesting Mahallu development wing intervention with Panchayath authorities.',
    submittedAt: '2026-09-11 05:40 PM',
    updatedAt: '2026-09-14 02:00 PM',
    status: 'Approved',
    adminRemarks: 'Mahallu Civic Committee petitioned the Ward Member; desilting work scheduled for this Saturday.'
  },
  {
    id: 'req-05',
    refNo: 'MHL-REQ-2026-056',
    type: 'Add / Edit Family Members',
    applicantName: 'Dr. CH Mansoor Ahmed',
    houseNo: 'M-14',
    phone: '+91 94462 88123',
    ward: 'Ward 2 - Madina Colony',
    subject: 'Census Update: Add Newborn Son (Ayaan Mansoor) to Household Census',
    details: 'Requesting to enroll newborn son Ayaan Mansoor (Born: 02-Aug-2026, Blood Group: O+, Male, Relation: Son). Birth certificate from Calicut Municipal Corporation is enclosed for secretariat records.',
    submittedAt: '2026-09-18 11:15 AM',
    updatedAt: '2026-09-19 03:30 PM',
    status: 'Approved',
    adminRemarks: 'Birth certificate verified and birth registered under Mahallu Register Volume XII, Entry #412. Household census updated.'
  }
];

export const INITIAL_COMMITTEE_OFFICIALS: CommitteeOfficial[] = [
  {
    id: 'off-01',
    name: 'Janab Haji P. K. Sayed Alavi Thangal',
    designation: 'President',
    roleDescription: 'Executive head of Central Mahallu Jama\'ath Committee. Presides over disputes, general policy, and high-level community resolutions.',
    phone: '+91 94471 11223',
    email: 'president@alnoormahallu.org',
    availability: 'Daily after Asr & Sunday 10:00 AM - 1:00 PM'
  },
  {
    id: 'off-02',
    name: 'Janab P. K. Abdul Rahman Haji',
    designation: 'General Secretary',
    roleDescription: 'Primary administrative officer for official correspondence, NOC clearances, certificates, government liaison, and office administration.',
    phone: '+91 98471 23456',
    email: 'secretary@alnoormahallu.org',
    availability: 'Monday - Saturday: 9:00 AM - 1:00 PM & 4:30 PM - 8:00 PM'
  },
  {
    id: 'off-03',
    name: 'Usthad Hafiz Muhammad Bilal Faizy',
    designation: 'Chief Imam & Khateeb',
    roleDescription: 'Spiritual guidance, Friday Juma Khutbah, Nikah solemnization, confidential family dispute arbitration, and Shariah counseling.',
    phone: '+91 98472 88990',
    email: 'imam@alnoormahallu.org',
    availability: 'Central Juma Masjid (Between Maghrib & Isha daily)'
  },
  {
    id: 'off-04',
    name: 'Janab V. K. Hamza Haji',
    designation: 'Treasurer & Finance Secretary',
    roleDescription: 'Accounts management, monthly subscription payments, Baithul-Mal funds, charitable distributions, and commercial shop room receipts.',
    phone: '+91 94474 44556',
    email: 'treasurer@alnoormahallu.org',
    availability: 'Office Counter: Monday - Friday 10:00 AM - 12:30 PM'
  },
  {
    id: 'off-05',
    name: 'Janab K. V. Ashraf',
    designation: 'Ward 1 Member (Bilal Nagar)',
    roleDescription: 'Ward welfare supervisor, household census verifications, local infrastructure liaison, and community assistance coordinator.',
    phone: '+91 98470 12341',
    email: 'ward1@alnoormahallu.org',
    availability: 'Available on call & Ward Helpdesk every Saturday',
    wardAssigned: 'Ward 1 - Bilal Nagar'
  },
  {
    id: 'off-06',
    name: 'Janab M. P. Ibrahim',
    designation: 'Ward 2 Member (Madina Colony)',
    roleDescription: 'Madina Colony ward representative, local civil grievance handler, new resident onboarding, and subscription payment follow-up.',
    phone: '+91 98470 54321',
    email: 'ward2@alnoormahallu.org',
    availability: 'Daily evenings 5:00 PM - 7:30 PM',
    wardAssigned: 'Ward 2 - Madina Colony'
  },
  {
    id: 'off-07',
    name: 'Janab T. K. Siddique',
    designation: 'Ward 3 Member (Al-Noor)',
    roleDescription: 'Central ward representative, mosque vicinity maintenance coordinator, Madrasa parent committee liaison.',
    phone: '+91 98470 87654',
    email: 'ward3@alnoormahallu.org',
    availability: 'Daily at Central Masjid after Isha',
    wardAssigned: 'Ward 3 - Al-Noor'
  },
  {
    id: 'off-08',
    name: 'Janab P. M. Nazeer',
    designation: 'Ward 4 Member (Quba Junction)',
    roleDescription: 'Quba Junction ward representative, youth engagement officer, ambulance and emergency relief wing coordinator.',
    phone: '+91 98470 99887',
    email: 'ward4@alnoormahallu.org',
    availability: 'Daily 6:00 PM - 8:30 PM',
    wardAssigned: 'Ward 4 - Quba Junction'
  }
];

export const INITIAL_COMMITTEE_MESSAGES: CommitteeMessage[] = [
  {
    id: 'cmsg-01',
    referenceNo: 'MHL-COM-2026-001',
    senderName: 'Dr. CH Mansoor Ahmed',
    houseNo: 'M-14',
    ward: 'Ward 2 - Madina Colony',
    phone: '+91 94462 88123',
    email: 'resident@mahallu.org',
    category: 'Ward Issue',
    urgency: 'Normal',
    subject: 'Request for additional street illumination on Madina Colony 3rd Cross Lane',
    message: 'Respected Committee, during evening prayers many elderly residents walk to the Central Masjid along Madina Colony 3rd Cross. Two street lights have been dim. Could the Mahallu civic wing please coordinate with the Panchayath lineman for LED replacement?',
    preferredResponse: 'WhatsApp',
    sentAt: '18 Sep 2026, 11:30 AM',
    status: 'Replied',
    assignedTo: 'Janab M. P. Ibrahim (Ward 2 Member)',
    committeeReply: {
      repliedBy: 'Janab M. P. Ibrahim (Ward 2 Member)',
      repliedAt: '19 Sep 2026, 04:20 PM',
      replyText: 'Assalamu Alaikum Dr. Mansoor. We inspected the lane yesterday evening with the Panchayath electrical wing. Two new 40W LED fittings have been requisitioned and replacement work is slated for tomorrow afternoon, Insha Allah.'
    }
  },
  {
    id: 'cmsg-02',
    referenceNo: 'MHL-COM-2026-002',
    senderName: 'Dr. CH Mansoor Ahmed',
    houseNo: 'M-14',
    ward: 'Ward 2 - Madina Colony',
    phone: '+91 94462 88123',
    email: 'resident@mahallu.org',
    category: 'Confidential Counseling',
    urgency: 'Normal',
    subject: 'Personal consultation request with Chief Imam Usthad Bilal Faizy',
    message: 'Assalamu Alaikum Usthad. I would like to request a 15-minute in-person consultation regarding pre-marital counseling guidance and family advice for my nephew before his scheduled engagement.',
    preferredResponse: 'In-Person Meeting',
    requestedAppointmentDate: '2026-09-24 07:15 PM',
    sentAt: '20 Sep 2026, 02:45 PM',
    status: 'In Review',
    assignedTo: 'Usthad Hafiz Muhammad Bilal Faizy (Chief Imam)',
    committeeReply: {
      repliedBy: 'Janab P. K. Abdul Rahman Haji (General Secretary)',
      repliedAt: '21 Sep 2026, 10:15 AM',
      replyText: 'Wa Alaikumu Salam Dr. Mansoor. Usthad Bilal Faizy has noted your request. You are warmly welcome to the Imam\'s office after Isha prayer on Thursday (24-Sep) at 7:30 PM.'
    }
  }
];

export const INITIAL_MADRASSA_TEACHERS: MadrassaTeacher[] = [
  {
    id: 'tch-01',
    name: 'Usthad Hafiz Ahmad Kabeer Baqavi',
    title: 'Sadar Usthad (Headmaster)',
    classesAssigned: ['Std 7', 'Std 9', 'Std 10'],
    subjects: ['Quran Hifz & Tajweed', 'Fiqh (Shafi\'i)', 'Aqeeda'],
    phone: '+91 94472 11988',
    experienceYears: 18,
    qualification: 'Baqavi, Hafiz-ul-Quran (Darul Huda Islamic University)'
  },
  {
    id: 'tch-02',
    name: 'Usthad Zubair Faizy',
    title: 'Senior Mu\'allim',
    classesAssigned: ['Std 5', 'Std 6', 'Std 8'],
    subjects: ['Arabic Grammar & Lugha', 'Thareekh (Islamic History)'],
    phone: '+91 97455 88214',
    experienceYears: 12,
    qualification: 'Faizy, MA Arabic (Calicut University)'
  },
  {
    id: 'tch-03',
    name: 'Usthad Salman Farisi Wafy',
    title: 'Mu\'allim & Hifz In-charge',
    classesAssigned: ['Std 3', 'Std 4'],
    subjects: ['Quran Nazira', 'Akhlaq & Adab', 'Dua & Adhkar'],
    phone: '+91 98463 77450',
    experienceYears: 8,
    qualification: 'Wafy, CIC Diploma in Islamic Studies'
  },
  {
    id: 'tch-04',
    name: 'Mu\'allima Fathima Zahra',
    title: 'Primary Section Mu\'allima',
    classesAssigned: ['Std 1', 'Std 2'],
    subjects: ['Qaida Nooraniyah', 'Basic Deeniyath', 'Amma Juz'],
    phone: '+91 99478 33201',
    experienceYears: 6,
    qualification: 'Mu\'allima Sanad (Samastha Vidyabhyasa Board)'
  }
];

export const INITIAL_MADRASSA_CLASSES: MadrassaClassInfo[] = [
  { standard: 1, division: 'A', classTeacher: 'Mu\'allima Fathima Zahra', totalStudents: 18, timing: '06:45 AM - 08:30 AM', roomNo: 'Block A - Room 101' },
  { standard: 2, division: 'A', classTeacher: 'Mu\'allima Fathima Zahra', totalStudents: 20, timing: '06:45 AM - 08:30 AM', roomNo: 'Block A - Room 102' },
  { standard: 3, division: 'A', classTeacher: 'Usthad Salman Farisi Wafy', totalStudents: 22, timing: '06:30 AM - 08:30 AM', roomNo: 'Block A - Room 103' },
  { standard: 4, division: 'A', classTeacher: 'Usthad Salman Farisi Wafy', totalStudents: 19, timing: '06:30 AM - 08:30 AM', roomNo: 'Block B - Room 201' },
  { standard: 5, division: 'A', classTeacher: 'Usthad Zubair Faizy', totalStudents: 24, timing: '06:30 AM - 08:30 AM', roomNo: 'Block B - Room 202' },
  { standard: 6, division: 'A', classTeacher: 'Usthad Zubair Faizy', totalStudents: 21, timing: '06:30 AM - 08:30 AM', roomNo: 'Block B - Room 203' },
  { standard: 7, division: 'A', classTeacher: 'Usthad Hafiz Ahmad Kabeer Baqavi', totalStudents: 23, timing: '06:30 AM - 08:30 AM', roomNo: 'Main Hall West' },
  { standard: 8, division: 'A', classTeacher: 'Usthad Zubair Faizy', totalStudents: 20, timing: '06:15 AM - 08:30 AM', roomNo: 'Block B - Room 204' },
  { standard: 9, division: 'A', classTeacher: 'Usthad Hafiz Ahmad Kabeer Baqavi', totalStudents: 18, timing: '06:15 AM - 08:30 AM', roomNo: 'Block C - Room 301' },
  { standard: 10, division: 'A', classTeacher: 'Usthad Hafiz Ahmad Kabeer Baqavi', totalStudents: 16, timing: '06:15 AM - 08:30 AM', roomNo: 'Board Exam Hall' }
];

export const INITIAL_MADRASSA_STUDENTS: MadrassaStudent[] = [
  {
    id: 'stu-01',
    admissionNo: 'NHM-2022-084',
    name: 'Bilal Basheer',
    gender: 'Male',
    standard: 4,
    division: 'A',
    houseNo: 'B-04',
    houseName: 'Al-Barakah',
    parentName: 'Muhammed Basheer',
    parentPhone: '+91 98470 12345',
    quranLevel: 'Surah Al-Mulk (Juz 29 Nazira)',
    attendancePct: 96,
    monthlyFee: 200,
    feeStatus: 'Paid',
    recentExamMarks: {
      term: 'Half-Yearly Board 2026',
      quranScore: 48,
      fiqhScore: 46,
      thareekhScore: 45,
      totalScore: 139,
      grade: 'Mumtaz (Distinction)'
    }
  },
  {
    id: 'stu-02',
    admissionNo: 'NHM-2018-021',
    name: 'Fathima Basheer',
    gender: 'Female',
    standard: 9,
    division: 'A',
    houseNo: 'B-04',
    houseName: 'Al-Barakah',
    parentName: 'Muhammed Basheer',
    parentPhone: '+91 98470 12345',
    quranLevel: 'Juz 12 (Tajweed Certified)',
    attendancePct: 98,
    monthlyFee: 250,
    feeStatus: 'Paid',
    recentExamMarks: {
      term: 'Half-Yearly Board 2026',
      quranScore: 50,
      fiqhScore: 49,
      thareekhScore: 48,
      totalScore: 147,
      grade: 'Mumtaz (Distinction)'
    }
  },
  {
    id: 'stu-03',
    admissionNo: 'NHM-2023-112',
    name: 'Rayan Noufal',
    gender: 'Male',
    standard: 3,
    division: 'A',
    houseNo: 'A-08',
    houseName: 'Madeena Manzil',
    parentName: 'Noufal K.P.',
    parentPhone: '+91 98472 77881',
    quranLevel: 'Juz Amma (Surah An-Naba to Al-Lail)',
    attendancePct: 91,
    monthlyFee: 200,
    feeStatus: 'Paid',
    recentExamMarks: {
      term: 'Half-Yearly Board 2026',
      quranScore: 42,
      fiqhScore: 44,
      thareekhScore: 40,
      totalScore: 126,
      grade: 'Jayyid Jiddan (First Class)'
    }
  },
  {
    id: 'stu-04',
    admissionNo: 'NHM-2024-145',
    name: 'Aisha Noufal',
    gender: 'Female',
    standard: 1,
    division: 'A',
    houseNo: 'A-08',
    houseName: 'Madeena Manzil',
    parentName: 'Noufal K.P.',
    parentPhone: '+91 98472 77881',
    quranLevel: 'Qaida Nooraniyah (Lesson 11)',
    attendancePct: 94,
    monthlyFee: 200,
    feeStatus: 'Paid',
    recentExamMarks: {
      term: 'Mid-Term Evaluation',
      quranScore: 45,
      fiqhScore: 43,
      thareekhScore: 44,
      totalScore: 132,
      grade: 'Mumtaz (Distinction)'
    }
  },
  {
    id: 'stu-05',
    admissionNo: 'NHM-2020-048',
    name: 'Salman M.V.',
    gender: 'Male',
    standard: 10,
    division: 'A',
    houseNo: 'B-19',
    houseName: 'Gulshan Manzil',
    parentName: 'Asma M.V. (Late Musthafa)',
    parentPhone: '+91 96055 77889',
    quranLevel: 'Juz 22 Nazira & Dars Apprentice',
    attendancePct: 95,
    monthlyFee: 250,
    feeStatus: 'Scholarship',
    recentExamMarks: {
      term: 'Board Pre-Model Examination',
      quranScore: 49,
      fiqhScore: 47,
      thareekhScore: 46,
      totalScore: 142,
      grade: 'Mumtaz (Distinction)'
    }
  },
  {
    id: 'stu-06',
    admissionNo: 'NHM-2021-063',
    name: 'Hisham Mansoor',
    gender: 'Male',
    standard: 6,
    division: 'A',
    houseNo: 'M-14',
    houseName: 'Darul Aman',
    parentName: 'Dr. CH Mansoor Ahmed',
    parentPhone: '+91 94462 88123',
    quranLevel: 'Juz 6 Nazira with Tartil',
    attendancePct: 88,
    monthlyFee: 250,
    feeStatus: 'Pending',
    recentExamMarks: {
      term: 'Half-Yearly Board 2026',
      quranScore: 41,
      fiqhScore: 39,
      thareekhScore: 38,
      totalScore: 118,
      grade: 'Jayyid (Second Class)'
    }
  },
  {
    id: 'stu-07',
    admissionNo: 'NHM-2022-092',
    name: 'Noufia Kareem',
    gender: 'Female',
    standard: 5,
    division: 'A',
    houseNo: 'K-03',
    houseName: 'Baitul Falah',
    parentName: 'K.T. Abdul Kareem',
    parentPhone: '+91 97455 33441',
    quranLevel: 'Surah Yaseen & Waqi\'ah (Hifz)',
    attendancePct: 97,
    monthlyFee: 200,
    feeStatus: 'Paid',
    recentExamMarks: {
      term: 'Half-Yearly Board 2026',
      quranScore: 47,
      fiqhScore: 45,
      thareekhScore: 44,
      totalScore: 136,
      grade: 'Mumtaz (Distinction)'
    }
  },
  {
    id: 'stu-08',
    admissionNo: 'NHM-2023-120',
    name: 'Zayan Hamza',
    gender: 'Male',
    standard: 2,
    division: 'A',
    houseNo: 'Q-22',
    houseName: 'Noor Villa',
    parentName: 'V.P. Hamza Haji (G: Shameem)',
    parentPhone: '+91 99470 66551',
    quranLevel: 'Qaida Nooraniyah (Lesson 14 - Tanween)',
    attendancePct: 92,
    monthlyFee: 200,
    feeStatus: 'Paid',
    recentExamMarks: {
      term: 'Mid-Term Evaluation',
      quranScore: 44,
      fiqhScore: 42,
      thareekhScore: 45,
      totalScore: 131,
      grade: 'Mumtaz (Distinction)'
    }
  },
  {
    id: 'stu-09',
    admissionNo: 'NHM-2019-035',
    name: 'Ameen Siraj',
    gender: 'Male',
    standard: 8,
    division: 'A',
    houseNo: 'P-11',
    houseName: 'Siraj Manzil',
    parentName: 'Sirajudheen P.',
    parentPhone: '+91 98460 55432',
    quranLevel: 'Juz 18 Nazira & Tajweed',
    attendancePct: 95,
    monthlyFee: 250,
    feeStatus: 'Paid',
    recentExamMarks: {
      term: 'Half-Yearly Board 2026',
      quranScore: 47,
      fiqhScore: 46,
      thareekhScore: 44,
      totalScore: 137,
      grade: 'Mumtaz (Distinction)'
    }
  },
  {
    id: 'stu-10',
    admissionNo: 'NHM-2020-052',
    name: 'Khadija Zahra',
    gender: 'Female',
    standard: 7,
    division: 'A',
    houseNo: 'F-07',
    houseName: 'Baitun Noor',
    parentName: 'Ibrahim Kutty',
    parentPhone: '+91 97471 22334',
    quranLevel: 'Juz 10 Nazira & Hifz Portions',
    attendancePct: 97,
    monthlyFee: 250,
    feeStatus: 'Paid',
    recentExamMarks: {
      term: 'Half-Yearly Board 2026',
      quranScore: 48,
      fiqhScore: 45,
      thareekhScore: 47,
      totalScore: 140,
      grade: 'Mumtaz (Distinction)'
    }
  }
];

