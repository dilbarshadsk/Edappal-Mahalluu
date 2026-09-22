import React, { useState, useMemo, useEffect } from 'react';
import { 
  User, 
  MadrassaStudent, 
  MadrassaTeacher, 
  MadrassaClassInfo,
  FamilyRecord 
} from '../types';
import { MahalluLogo } from './MahalluLogo';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Users, 
  Search, 
  Plus, 
  Printer, 
  Phone, 
  Sparkles, 
  AlertCircle, 
  X,
  CreditCard,
  FileText,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface MadrassaManagementViewProps {
  currentUser: User;
  students: MadrassaStudent[];
  teachers: MadrassaTeacher[];
  classes: MadrassaClassInfo[];
  families: FamilyRecord[];
  onAddStudent: (student: MadrassaStudent) => void;
  onUpdateFeeStatus: (studentId: string, status: 'Paid' | 'Pending') => void;
  onShowToast: (msg: string) => void;
}

export const MadrassaManagementView: React.FC<MadrassaManagementViewProps> = ({
  currentUser,
  students,
  teachers,
  classes,
  families,
  onAddStudent,
  onUpdateFeeStatus,
  onShowToast
}) => {
  const isAdmin = currentUser.role === 'admin';
  
  // Active Sub Tab: default to 'students' for admin, 'my-children' for residents
  const [activeSubTab, setActiveSubTab] = useState<'students' | 'my-children' | 'faculty' | 'classes' | 'attendance-exams'>(
    isAdmin ? 'students' : 'my-children'
  );

  useEffect(() => {
    if (!isAdmin && activeSubTab === 'students') {
      setActiveSubTab('my-children');
    } else if (isAdmin && activeSubTab === 'my-children') {
      setActiveSubTab('students');
    }
  }, [currentUser.role, isAdmin]);

  const [selectedStandard, setSelectedStandard] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feeFilter, setFeeFilter] = useState<'all' | 'Paid' | 'Pending' | 'Scholarship'>('all');

  // Modals
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<MadrassaStudent | null>(null);

  // New Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'Male' | 'Female'>('Male');
  const [newStudentStandard, setNewStudentStandard] = useState<number>(1);
  const [newStudentDivision, setNewStudentDivision] = useState('A');
  const [newStudentHouseNo, setNewStudentHouseNo] = useState('');
  const [newStudentParentName, setNewStudentParentName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentQuranLevel, setNewStudentQuranLevel] = useState('Qaida Nooraniyah');

  // Household identifier for resident
  const userHouseNo = (currentUser.houseNo || 'M-14').trim().toLowerCase();
  const userName = (currentUser.name || '').trim().toLowerCase();
  const userPhone = currentUser.phone ? currentUser.phone.replace(/\D/g, '') : '';

  // Filter students belonging strictly to the logged-in resident family
  const residentChildren = useMemo(() => {
    return students.filter(s => {
      const sHouse = s.houseNo?.trim().toLowerCase();
      const sParent = s.parentName?.trim().toLowerCase();
      const sPhone = s.parentPhone ? s.parentPhone.replace(/\D/g, '') : '';

      const matchHouse = Boolean(userHouseNo && sHouse && sHouse === userHouseNo);
      const matchParent = Boolean(userName && sParent && (sParent.includes(userName) || userName.includes(sParent)));
      const matchPhone = Boolean(userPhone && sPhone && (sPhone.endsWith(userPhone) || userPhone.endsWith(sPhone)));

      return matchHouse || matchParent || matchPhone;
    });
  }, [students, userHouseNo, userName, userPhone]);

  // Main student list (for Admin)
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesStd = selectedStandard === 'all' || s.standard === selectedStandard;
      const matchesFee = feeFilter === 'all' || s.feeStatus === feeFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        s.name.toLowerCase().includes(query) ||
        s.houseNo.toLowerCase().includes(query) ||
        s.houseName.toLowerCase().includes(query) ||
        s.parentName.toLowerCase().includes(query) ||
        s.admissionNo.toLowerCase().includes(query);
      return matchesStd && matchesFee && matchesSearch;
    });
  }, [students, selectedStandard, feeFilter, searchQuery]);

  // Overall institutional metrics (Admin)
  const totalStudents = students.length;
  const boysCount = students.filter(s => s.gender === 'Male').length;
  const girlsCount = students.filter(s => s.gender === 'Female').length;
  const paidCount = students.filter(s => s.feeStatus === 'Paid').length;
  const pendingCount = students.filter(s => s.feeStatus === 'Pending').length;
  const avgAttendance = Math.round(students.reduce((acc, s) => acc + s.attendancePct, 0) / (students.length || 1));

  // Resident household metrics
  const residentAvgAttendance = residentChildren.length > 0
    ? Math.round(residentChildren.reduce((acc, s) => acc + s.attendancePct, 0) / residentChildren.length)
    : 100;
  const residentPendingFees = residentChildren.filter(s => s.feeStatus === 'Pending').reduce((acc, s) => acc + s.monthlyFee, 0);

  // Handle House No autofill
  const handleHouseSelect = (houseNo: string) => {
    setNewStudentHouseNo(houseNo);
    const fam = families.find(f => f.houseNo.toLowerCase() === houseNo.toLowerCase());
    if (fam) {
      setNewStudentParentName(fam.headOfFamily);
      setNewStudentPhone(fam.phone);
    }
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentHouseNo.trim()) return;

    const fam = families.find(f => f.houseNo.toLowerCase() === newStudentHouseNo.trim().toLowerCase());
    const houseName = fam ? fam.houseName : `House ${newStudentHouseNo}`;

    const newStudent: MadrassaStudent = {
      id: `stu-${Date.now()}`,
      admissionNo: `NHM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      name: newStudentName.trim(),
      gender: newStudentGender,
      standard: Number(newStudentStandard),
      division: newStudentDivision,
      houseNo: newStudentHouseNo.trim(),
      houseName,
      parentName: newStudentParentName.trim() || 'Parent',
      parentPhone: newStudentPhone.trim() || '+91 98470 00000',
      quranLevel: newStudentQuranLevel.trim() || 'Qaida Nooraniyah',
      attendancePct: 100,
      monthlyFee: 200,
      feeStatus: 'Paid',
      recentExamMarks: {
        term: 'Enrollment Evaluation',
        quranScore: 45,
        fiqhScore: 40,
        thareekhScore: 42,
        totalScore: 127,
        grade: 'Mumtaz (Distinction)'
      }
    };

    onAddStudent(newStudent);
    setIsEnrollModalOpen(false);
    onShowToast(`Enrolled ${newStudent.name} into Standard ${newStudent.standard}`);

    // Reset form
    setNewStudentName('');
    setNewStudentHouseNo('');
    setNewStudentParentName('');
    setNewStudentPhone('');
  };

  return (
    <div id="madrassa-management-container" className="space-y-6">
      
      {/* INSTITUTIONAL BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 rounded-3xl border border-emerald-800/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/95 p-1.5 flex items-center justify-center shrink-0 shadow-lg border border-emerald-400/40">
              <MahalluLogo className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {isAdmin ? (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-mono">
                    Educational Wing • Est. 1984
                  </span>
                ) : (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Resident Portal • House #{currentUser.houseNo || 'M-14'}
                  </span>
                )}
                <span className="text-xs text-emerald-200/80 font-medium">
                  Affiliated to Islamic Educational Board
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
                {isAdmin ? "Noorul Huda Islamic Academy & Madrasa" : "Noorul Huda Madrasa • Family Portal"}
              </h2>
            </div>
          </div>

          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
              <button
                id="enroll-student-btn"
                onClick={() => setIsEnrollModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Enroll New Student</span>
              </button>
            </div>
          )}
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-emerald-800/40 text-xs">
          {isAdmin ? (
            <>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <span className="text-emerald-300 text-[11px] block">Total Enrolled</span>
                <span className="text-xl font-black text-white mt-0.5 block">{totalStudents}</span>
                <span className="text-[10px] text-slate-300">{boysCount} Boys • {girlsCount} Girls</span>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <span className="text-emerald-300 text-[11px] block">Avg. Attendance</span>
                <span className="text-xl font-black text-emerald-400 mt-0.5 block">{avgAttendance}%</span>
                <span className="text-[10px] text-slate-300">Current Month Rate</span>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <span className="text-emerald-300 text-[11px] block">Fee Collection</span>
                <span className="text-xl font-black text-amber-300 mt-0.5 block">{paidCount}/{totalStudents}</span>
                <span className="text-[10px] text-slate-300">{pendingCount} pending dues</span>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <span className="text-emerald-300 text-[11px] block">My Enrolled Children</span>
                <span className="text-xl font-black text-white mt-0.5 block">{residentChildren.length}</span>
                <span className="text-[10px] text-slate-300">House #{currentUser.houseNo || 'M-14'}</span>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <span className="text-emerald-300 text-[11px] block">Children Attendance</span>
                <span className="text-xl font-black text-emerald-400 mt-0.5 block">{residentAvgAttendance}%</span>
                <span className="text-[10px] text-slate-300">Current Academic Month</span>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <span className="text-emerald-300 text-[11px] block">Monthly Fee Status</span>
                <span className={`text-xl font-black mt-0.5 block ${residentPendingFees > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                  {residentPendingFees > 0 ? `₹${residentPendingFees} Due` : 'Fees Cleared'}
                </span>
                <span className="text-[10px] text-slate-300">{residentChildren.length} registered students</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap lg:flex-nowrap items-center gap-1.5 p-1.5 bg-slate-100/90 sm:bg-white border border-slate-200/80 rounded-2xl shadow-xs sm:shadow-2xs">
        {isAdmin && (
          <button
            id="tab-students"
            onClick={() => setActiveSubTab('students')}
            className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'students'
                ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-950/20'
                : 'bg-white sm:bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/80 sm:hover:bg-slate-100 border border-slate-200/60 sm:border-transparent'
            }`}
          >
            <GraduationCap className={`w-4 h-4 shrink-0 ${activeSubTab === 'students' ? 'text-emerald-300' : 'text-emerald-700'}`} />
            <span className="truncate">Student Registry</span>
          </button>
        )}

        {!isAdmin && (
          <button
            id="tab-my-children"
            onClick={() => setActiveSubTab('my-children')}
            className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'my-children'
                ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-950/20'
                : 'bg-white sm:bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/80 sm:hover:bg-slate-100 border border-slate-200/60 sm:border-transparent'
            }`}
          >
            <Users className={`w-4 h-4 shrink-0 ${activeSubTab === 'my-children' ? 'text-emerald-300' : 'text-emerald-700'}`} />
            <span className="truncate">My Children</span>
          </button>
        )}

        <button
          id="tab-faculty"
          onClick={() => setActiveSubTab('faculty')}
          className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'faculty'
              ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-950/20'
              : 'bg-white sm:bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/80 sm:hover:bg-slate-100 border border-slate-200/60 sm:border-transparent'
          }`}
        >
          <UserCheck className={`w-4 h-4 shrink-0 ${activeSubTab === 'faculty' ? 'text-emerald-300' : 'text-emerald-700'}`} />
          <span className="truncate">Faculty</span>
        </button>

        <button
          id="tab-classes"
          onClick={() => setActiveSubTab('classes')}
          className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'classes'
              ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-950/20'
              : 'bg-white sm:bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/80 sm:hover:bg-slate-100 border border-slate-200/60 sm:border-transparent'
          }`}
        >
          <Calendar className={`w-4 h-4 shrink-0 ${activeSubTab === 'classes' ? 'text-emerald-300' : 'text-emerald-700'}`} />
          <span className="truncate">Class Schedule</span>
        </button>

        <button
          id="tab-attendance-exams"
          onClick={() => setActiveSubTab('attendance-exams')}
          className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'attendance-exams'
              ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-950/20'
              : 'bg-white sm:bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/80 sm:hover:bg-slate-100 border border-slate-200/60 sm:border-transparent'
          }`}
        >
          <Award className={`w-4 h-4 shrink-0 ${activeSubTab === 'attendance-exams' ? 'text-emerald-300' : 'text-emerald-700'}`} />
          <span className="truncate">{isAdmin ? "Board Exams" : "Exam Results"}</span>
        </button>
      </div>

      {/* 1. ADMIN FULL STUDENT REGISTRY (ONLY FOR ADMIN) */}
      {isAdmin && activeSubTab === 'students' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search student, house no (#B-04), or parent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Standard Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">Std:</span>
                <select
                  value={selectedStandard}
                  onChange={(e) => setSelectedStandard(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Standards (1-10)</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>Standard {n}</option>
                  ))}
                </select>
              </div>

              {/* Fee Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">Fee:</span>
                <select
                  value={feeFilter}
                  onChange={(e) => setFeeFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Scholarship">Scholarship / Free</option>
                </select>
              </div>
            </div>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.length === 0 ? (
              <div className="col-span-full p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-500">
                <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">No students matched criteria</h4>
                <p className="text-xs text-slate-500 mt-1">Try clearing your search query or standard filters.</p>
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div 
                  key={student.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 block">
                          {student.admissionNo}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">{student.name}</h3>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-extrabold rounded-lg border border-emerald-200 shrink-0">
                        Std {student.standard}-{student.division}
                      </span>
                    </div>

                    {/* Household Particulars */}
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">House:</span>
                        <span className="font-semibold text-slate-800">#{student.houseNo} • {student.houseName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Parent/Guardian:</span>
                        <span className="font-medium text-slate-700">{student.parentName}</span>
                      </div>
                    </div>

                    {/* Quran Level & Attendance */}
                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                          Quran / Hifz Progress
                        </span>
                        <p className="text-emerald-900 font-semibold text-[11px] flex items-center gap-1.5 mt-0.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>{student.quranLevel}</span>
                        </p>
                      </div>

                      {/* Attendance Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                          <span>Monthly Attendance</span>
                          <span className="font-bold text-slate-800">{student.attendancePct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              student.attendancePct >= 90 ? 'bg-emerald-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${student.attendancePct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Fee Status Badge */}
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        student.feeStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : student.feeStatus === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {student.feeStatus === 'Paid' ? 'Fee Paid' : student.feeStatus === 'Pending' ? 'Fee Due' : 'Scholarship'}
                      </span>

                      {student.feeStatus === 'Pending' && (
                        <button
                          onClick={() => onUpdateFeeStatus(student.id, 'Paid')}
                          className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedStudentForReport(student)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Marksheet</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. RESIDENT "MY CHILDREN" VIEW (FOR RESIDENTS) */}
      {!isAdmin && activeSubTab === 'my-children' && (
        <div className="space-y-4">
          {residentChildren.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-500">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800">No Children Currently Enrolled</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No students from House #{currentUser.houseNo || 'M-14'} are currently registered in Noorul Huda Madrasa. Please contact Sadar Usthad or submit an admission request through the office.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {residentChildren.map((student) => (
                <div 
                  key={student.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-mono text-emerald-700 font-bold block">{student.admissionNo}</span>
                        <h3 className="text-lg font-bold text-slate-900 mt-0.5">{student.name}</h3>
                        <p className="text-xs text-slate-500">Standard {student.standard} - Division {student.division}</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-lg border border-emerald-200">
                        Std {student.standard}
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Quranic Stage:</span>
                        <span className="font-bold text-emerald-900">{student.quranLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Monthly Attendance:</span>
                        <span className="font-bold text-slate-800">{student.attendancePct}%</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                        <span className="text-slate-500">Monthly Madrasa Fee:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">₹{student.monthlyFee}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            student.feeStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {student.feeStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Exam Evaluation */}
                    {student.recentExamMarks && (
                      <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between items-center font-bold text-emerald-950">
                          <span>{student.recentExamMarks.term}</span>
                          <span className="text-[11px] bg-emerald-200/80 px-2 py-0.5 rounded">
                            {student.recentExamMarks.grade}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-700">
                          <div>Quran: <strong>{student.recentExamMarks.quranScore}/50</strong></div>
                          <div>Fiqh: <strong>{student.recentExamMarks.fiqhScore}/50</strong></div>
                          <div>Thareekh: <strong>{student.recentExamMarks.thareekhScore}/50</strong></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedStudentForReport(student)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>View Progress Card</span>
                    </button>

                    {student.feeStatus === 'Pending' ? (
                      <button
                        onClick={() => {
                          onUpdateFeeStatus(student.id, 'Paid');
                          onShowToast(`Paid Madrasa fee for ${student.name} (Receipt generated)`);
                        }}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Fee (₹{student.monthlyFee})</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Fees Cleared</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. FACULTY & USTHADS TAB */}
      {activeSubTab === 'faculty' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teachers.map((teacher) => (
            <div 
              key={teacher.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg border border-emerald-200">
                      {teacher.name.split(' ')[1]?.[0] || 'U'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{teacher.name}</h3>
                      <p className="text-xs text-emerald-800 font-semibold">{teacher.title}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                    {teacher.experienceYears} Yrs Exp
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Subjects Taught</span>
                    <p className="text-slate-800 font-semibold">{teacher.subjects.join(' • ')}</p>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 px-1">
                    <span>Assigned Standards:</span>
                    <span className="font-bold text-emerald-800">{teacher.classesAssigned.join(', ')}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 px-1">
                    <span>Qualification:</span>
                    <span className="font-medium text-slate-800">{teacher.qualification}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{teacher.phone}</span>
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Active Faculty
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. CLASS SCHEDULE & TIMINGS TAB */}
      {activeSubTab === 'classes' && (
        <div className="space-y-6">
          {/* Weekly Class Schedule Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 via-emerald-850 to-teal-950 text-white">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-700/50 text-emerald-200 text-[11px] font-bold tracking-wide uppercase font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>Official Madrasa Timetable</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1.5">Weekly Class Schedule</h3>
            </div>

            {/* Daily Timing Grid */}
            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {[
                { day: 'Sunday', time: '7:00 AM to 10:00 AM', duration: '3 Hours', note: 'Weekend Extended Session', isLeave: false, color: 'bg-emerald-50 border-emerald-200 text-emerald-950' },
                { day: 'Monday', time: '7:00 AM to 8:30 AM', duration: '1 hr 30 min', note: 'Regular Morning Session', isLeave: false, color: 'bg-slate-50 border-slate-200 text-slate-900' },
                { day: 'Tuesday', time: '7:00 AM to 8:30 AM', duration: '1 hr 30 min', note: 'Regular Morning Session', isLeave: false, color: 'bg-slate-50 border-slate-200 text-slate-900' },
                { day: 'Wednesday', time: '7:00 AM to 8:30 AM', duration: '1 hr 30 min', note: 'Regular Morning Session', isLeave: false, color: 'bg-slate-50 border-slate-200 text-slate-900' },
                { day: 'Thursday', time: '7:00 AM to 8:30 AM', duration: '1 hr 30 min', note: 'Regular Morning Session', isLeave: false, color: 'bg-slate-50 border-slate-200 text-slate-900' },
                { day: 'Friday', time: 'Leave (No schedule)', duration: 'Holiday', note: 'Weekly Jum\'ah Holiday', isLeave: true, color: 'bg-rose-50/70 border-rose-200 text-rose-950' },
                { day: 'Saturday', time: '7:00 AM to 9:00 AM', duration: '2 Hours', note: 'Weekend Session', isLeave: false, color: 'bg-teal-50 border-teal-200 text-teal-950' },
              ].map((scheduleItem) => (
                <div
                  key={scheduleItem.day}
                  className={`p-4 rounded-2xl border ${scheduleItem.color} flex flex-col justify-between space-y-3 transition-all hover:shadow-2xs`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider font-mono">
                        {scheduleItem.day}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${scheduleItem.isLeave ? 'bg-rose-200/80 text-rose-800' : 'bg-slate-200/70 text-slate-700'}`}>
                        {scheduleItem.duration}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-3.5 h-3.5 shrink-0 ${scheduleItem.isLeave ? 'text-rose-600' : 'text-emerald-700'}`} />
                        <span className={`text-xs font-bold ${scheduleItem.isLeave ? 'text-rose-700' : 'text-slate-900'}`}>
                          {scheduleItem.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 leading-tight">
                    {scheduleItem.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. EXAMINATIONS & BOARD RESULTS TAB */}
      {activeSubTab === 'attendance-exams' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isAdmin ? "Central Madrasa Board Examination Registry" : "My Children's Board Examination Results"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAdmin 
                  ? "Evaluation results in Quran Tajweed, Shafi'i Fiqh, Islamic History, and Akhlaq across all enrolled students."
                  : `Certified evaluation results in Quran Tajweed, Fiqh, and History for House #${currentUser.houseNo || 'M-14'}.`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
                Term: Half-Yearly Board 2026
              </span>
            </div>
          </div>

          {/* If Resident and has no children */}
          {!isAdmin && residentChildren.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-700">No Board Records Available</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Your children's examination scores and grades will be published here upon admission.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-3">Standard</th>
                    {isAdmin && <th className="py-3 px-3">House No</th>}
                    <th className="py-3 px-3 text-center">Quran (50)</th>
                    <th className="py-3 px-3 text-center">Fiqh (50)</th>
                    <th className="py-3 px-3 text-center">Thareekh (50)</th>
                    <th className="py-3 px-3 text-center">Total (150)</th>
                    <th className="py-3 px-4">Board Grade</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(isAdmin ? students : residentChildren).map((student) => {
                    const m = student.recentExamMarks;
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {student.name}
                          <span className="block text-[10px] font-mono text-slate-400 font-normal">
                            {student.admissionNo}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          Std {student.standard}-{student.division}
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-3 font-medium text-slate-600">
                            #{student.houseNo}
                          </td>
                        )}
                        <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                          {m ? m.quranScore : 45}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                          {m ? m.fiqhScore : 42}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                          {m ? m.thareekhScore : 40}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-900">
                          {m ? m.totalScore : 127}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {m ? m.grade : 'Mumtaz (Distinction)'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedStudentForReport(student)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Progress Card
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ENROLL STUDENT MODAL (ADMIN ONLY) */}
      {isAdmin && isEnrollModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Madrasa Admission & Enrolment</h3>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zayan Noufal, Maryam Basheer"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={newStudentGender}
                    onChange={(e) => setNewStudentGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Male">Boy (Male)</option>
                    <option value="Female">Girl (Female)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Standard / Class *</label>
                  <select
                    value={newStudentStandard}
                    onChange={(e) => setNewStudentStandard(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                      <option key={s} value={s}>Standard {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mahallu House No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B-04, A-08, Q-22"
                    value={newStudentHouseNo}
                    onChange={(e) => handleHouseSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parent / Guardian Name</label>
                  <input
                    type="text"
                    placeholder="Head of Family"
                    value={newStudentParentName}
                    onChange={(e) => setNewStudentParentName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>


              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Complete Enrolment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT PROGRESS CARD / MARKSHEET MODAL */}
      {selectedStudentForReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0">
                  <MahalluLogo className="w-full h-full" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">Student Academic & Hifz Progress Card</h3>
                  <p className="text-[11px] text-emerald-200">Noorul Huda Islamic Academy • Year 2026-27</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForReport(null)}
                className="p-1 text-slate-300 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Marksheet Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
              {/* Student Info Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block">Student Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedStudentForReport.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Admission No:</span>
                  <span className="font-mono font-bold text-emerald-800">{selectedStudentForReport.admissionNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Standard & Division:</span>
                  <span className="font-semibold text-slate-800">Standard {selectedStudentForReport.standard} - {selectedStudentForReport.division}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Mahallu Household:</span>
                  <span className="font-semibold text-slate-800">#{selectedStudentForReport.houseNo} • {selectedStudentForReport.houseName}</span>
                </div>
              </div>

              {/* Quran & Conduct Evaluation */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  <span>Quranic Recitation & Hifz Evaluation</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-950">
                  <div>
                    <span className="text-slate-500 block">Current Portion:</span>
                    <span className="font-bold">{selectedStudentForReport.quranLevel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tajweed Articulation:</span>
                    <span className="font-bold text-emerald-800">Mumtaz (Excellent Makhraj)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Daily Attendance:</span>
                    <span className="font-bold">{selectedStudentForReport.attendancePct}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Behavior & Adab:</span>
                    <span className="font-bold text-emerald-800">Very Good (Jayyid Jiddan)</span>
                  </div>
                </div>
              </div>

              {/* Subject Scores Table */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Term Examination Marks</h4>
                <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px]">
                    <tr>
                      <th className="p-2.5">Subject</th>
                      <th className="p-2.5 text-center">Max Marks</th>
                      <th className="p-2.5 text-center">Marks Scored</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr>
                      <td className="p-2.5 font-medium">Quran Tilawat & Hifz</td>
                      <td className="p-2.5 text-center font-mono">50</td>
                      <td className="p-2.5 text-center font-mono font-bold text-emerald-800">
                        {selectedStudentForReport.recentExamMarks?.quranScore || 48}
                      </td>
                      <td className="p-2.5 text-center text-emerald-700 font-semibold">Passed</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Fiqh & Ibadat (Shafi'i)</td>
                      <td className="p-2.5 text-center font-mono">50</td>
                      <td className="p-2.5 text-center font-mono font-bold text-emerald-800">
                        {selectedStudentForReport.recentExamMarks?.fiqhScore || 46}
                      </td>
                      <td className="p-2.5 text-center text-emerald-700 font-semibold">Passed</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Thareekh & Akhlaq</td>
                      <td className="p-2.5 text-center font-mono">50</td>
                      <td className="p-2.5 text-center font-mono font-bold text-emerald-800">
                        {selectedStudentForReport.recentExamMarks?.thareekhScore || 45}
                      </td>
                      <td className="p-2.5 text-center text-emerald-700 font-semibold">Passed</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td className="p-2.5">Cumulative Total</td>
                      <td className="p-2.5 text-center font-mono">150</td>
                      <td className="p-2.5 text-center font-mono text-emerald-900">
                        {selectedStudentForReport.recentExamMarks?.totalScore || 139}
                      </td>
                      <td className="p-2.5 text-center text-emerald-800">
                        {selectedStudentForReport.recentExamMarks?.grade || 'Mumtaz (Distinction)'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signature Seals */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500">
                <div className="text-center">
                  <div className="h-10"></div>
                  <span className="border-t border-slate-400 pt-1 block">Class Mu'allim</span>
                </div>
                <div className="text-center">
                  <div className="text-emerald-800 font-serif font-bold text-xs">ختم الصدر أستاذ</div>
                  <span className="border-t border-slate-400 pt-1 block">Sadar Usthad Seal</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Central Mahallu Jama'ath Madrasa Registry</span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Progress Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

