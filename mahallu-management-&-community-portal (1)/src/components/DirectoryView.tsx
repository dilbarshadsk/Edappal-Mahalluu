import React, { useState, useMemo } from 'react';
import { FamilyRecord, FamilyMember, EconomicStatus, BloodGroup, Role, RequestType } from '../types';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  MapPin, 
  Building2, 
  ShieldAlert, 
  Heart, 
  Eye, 
  Download, 
  X, 
  Briefcase, 
  GraduationCap, 
  UserCheck, 
  Globe,
  SlidersHorizontal,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  Lock,
  Shield,
  ShieldCheck,
  FileEdit,
  Printer,
  ArrowRight,
  EyeOff,
  KeyRound,
  Mail,
  Sparkles,
  MessageCircle,
  Share2,
  UserPlus,
  Edit3,
  Trash2
} from 'lucide-react';
import { User } from '../types';
import { getAccountForFamily, registerNewResidentAccount } from '../data/mockData';
import { ResidentCredentialsModal } from './ResidentCredentialsModal';
import { FamilyMemberFormModal } from './FamilyMemberFormModal';
import { FamilySlipModal } from './FamilySlipModal';
import { CensusPrintModal } from './CensusPrintModal';

interface DirectoryViewProps {
  families: FamilyRecord[];
  onAddFamily: (family: FamilyRecord, credentials?: { email: string; password: string }) => void;
  onUpdateFamily?: (family: FamilyRecord) => void;
  currentUserRole: Role;
  currentUser?: User | null;
  onNavigateToServices?: (prefill?: { type: RequestType; subject: string; details?: string }) => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  families,
  onAddFamily,
  onUpdateFamily,
  currentUserRole,
  currentUser,
  onNavigateToServices
}) => {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Selected Family Modal State
  const [activeFamily, setActiveFamily] = useState<FamilyRecord | null>(null);
  const [isAddFamilyModalOpen, setIsAddFamilyModalOpen] = useState(false);
  const [familySlipTarget, setFamilySlipTarget] = useState<FamilyRecord | null>(null);
  const [isCensusPrintModalOpen, setIsCensusPrintModalOpen] = useState(false);

  // New Family Form State
  const [newHouseNo, setNewHouseNo] = useState('');
  const [newHouseName, setNewHouseName] = useState('');
  const [newWard, setNewWard] = useState('Ward 1 - Bilal Nagar');
  const [newHead, setNewHead] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newStatus, setNewStatus] = useState<EconomicStatus>('General');
  const [newRation, setNewRation] = useState<'APL' | 'BPL' | 'AAY'>('APL');
  const [newChanda, setNewChanda] = useState(500);

  // Head of Family details in new household
  const [newHeadAge, setNewHeadAge] = useState<number>(45);
  const [newHeadGender, setNewHeadGender] = useState<'Male' | 'Female'>('Male');
  const [newHeadBlood, setNewHeadBlood] = useState<BloodGroup>('O+');
  const [newHeadOccupation, setNewHeadOccupation] = useState('Merchant / Business');
  const [newHeadEducation, setNewHeadEducation] = useState('SSLC');

  // Full Family Members staged for new household registration
  const [additionalMembers, setAdditionalMembers] = useState<FamilyMember[]>([]);

  // Member Modal State for adding/editing family members (works for both new & existing households)
  const [memberModalConfig, setMemberModalConfig] = useState<{
    isOpen: boolean;
    target: 'new-household' | 'existing-household';
    family?: FamilyRecord;
    memberToEdit?: FamilyMember | null;
  }>({
    isOpen: false,
    target: 'new-household',
    memberToEdit: null
  });

  // New Household Portal Credentials State
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(true);

  // Modal state for viewing, printing, and sharing resident portal credentials
  const [credentialsModalData, setCredentialsModalData] = useState<{
    family: FamilyRecord;
    email: string;
    password: string;
    isNewlyCreated?: boolean;
  } | null>(null);

  // Filtered families logic
  const filteredFamilies = useMemo(() => {
    return families.filter((fam) => {
      // Search matches head, houseNo, houseName, phone, or member name
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        fam.headOfFamily.toLowerCase().includes(query) ||
        fam.houseNo.toLowerCase().includes(query) ||
        fam.houseName.toLowerCase().includes(query) ||
        fam.phone.toLowerCase().includes(query) ||
        fam.members.some(m => m.name.toLowerCase().includes(query) || m.occupation.toLowerCase().includes(query));

      // Ward filter
      const matchesWard = selectedWard === 'All' || fam.ward === selectedWard;

      // Status filter
      const matchesStatus = selectedStatus === 'All' || fam.economicStatus === selectedStatus;

      // Blood group filter
      const matchesBlood = selectedBloodGroup === 'All' || fam.members.some(m => m.bloodGroup === selectedBloodGroup);

      return matchesSearch && matchesWard && matchesStatus && matchesBlood;
    });
  }, [families, searchQuery, selectedWard, selectedStatus, selectedBloodGroup]);

  // Open credentials for any household in the directory
  const handleOpenCredentials = (fam: FamilyRecord) => {
    const account = getAccountForFamily(fam.houseNo, fam.headOfFamily, fam.portalEmail);
    setCredentialsModalData({
      family: fam,
      email: account.email,
      password: account.temporaryPassword || account.password,
      isNewlyCreated: false
    });
  };

  // Update password in authentication store
  const handleUpdatePassword = (familyId: string, newPass: string) => {
    if (credentialsModalData) {
      registerNewResidentAccount({
        email: credentialsModalData.email,
        password: newPass,
        temporaryPassword: newPass,
        issuedDate: '2026-09-21',
        user: {
          id: `user-${credentialsModalData.family.houseNo.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          name: credentialsModalData.family.headOfFamily,
          email: credentialsModalData.email,
          role: 'resident',
          houseNo: credentialsModalData.family.houseNo,
          ward: credentialsModalData.family.ward,
          familyId: credentialsModalData.family.id,
          phone: credentialsModalData.family.phone,
          designation: 'Resident & Head of Family'
        }
      });
      setCredentialsModalData({
        ...credentialsModalData,
        password: newPass
      });
    }
  };

  // Member management handlers for new household registration and existing census records
  const handleOpenAddMemberForNew = (prefillRelation?: FamilyMember['relationToHead']) => {
    let dummyMember: FamilyMember | null = null;
    if (prefillRelation) {
      dummyMember = {
        id: '',
        name: '',
        relationToHead: prefillRelation,
        age: prefillRelation === 'Spouse' ? 40 : prefillRelation === 'Son' || prefillRelation === 'Daughter' ? 18 : 68,
        gender: prefillRelation === 'Spouse' || prefillRelation === 'Daughter' || prefillRelation === 'Mother' || prefillRelation === 'Sister' ? 'Female' : 'Male',
        bloodGroup: 'O+',
        occupation: prefillRelation === 'Spouse' ? 'Homemaker' : prefillRelation === 'Son' || prefillRelation === 'Daughter' ? 'Student' : 'Senior',
        education: 'SSLC',
        maritalStatus: prefillRelation === 'Spouse' ? 'Married' : 'Single',
        isAbroad: false
      };
    }
    setMemberModalConfig({
      isOpen: true,
      target: 'new-household',
      memberToEdit: dummyMember
    });
  };

  const handleOpenEditMemberForNew = (member: FamilyMember) => {
    setMemberModalConfig({
      isOpen: true,
      target: 'new-household',
      memberToEdit: member
    });
  };

  const handleRemoveMemberFromNew = (memberId: string) => {
    setAdditionalMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const handleOpenAddMemberForExisting = (fam: FamilyRecord) => {
    setMemberModalConfig({
      isOpen: true,
      target: 'existing-household',
      family: fam,
      memberToEdit: null
    });
  };

  const handleOpenEditMemberForExisting = (fam: FamilyRecord, member: FamilyMember) => {
    setMemberModalConfig({
      isOpen: true,
      target: 'existing-household',
      family: fam,
      memberToEdit: member
    });
  };

  const handleDeleteMemberFromExisting = (fam: FamilyRecord, memberId: string) => {
    if (fam.members.length <= 1) {
      alert('A household census record must contain at least one member.');
      return;
    }
    const memberName = fam.members.find(m => m.id === memberId)?.name || 'Member';
    if (!window.confirm(`Are you sure you want to remove ${memberName} from House #${fam.houseNo} census?`)) {
      return;
    }
    const updatedMembers = fam.members.filter(m => m.id !== memberId);
    const updatedFamily = { ...fam, members: updatedMembers };
    if (activeFamily && activeFamily.id === fam.id) {
      setActiveFamily(updatedFamily);
    }
    onUpdateFamily?.(updatedFamily);
  };

  const handleSaveMember = (savedMember: FamilyMember) => {
    if (memberModalConfig.target === 'new-household') {
      if (memberModalConfig.memberToEdit && memberModalConfig.memberToEdit.id) {
        setAdditionalMembers(prev => prev.map(m => m.id === savedMember.id ? savedMember : m));
      } else {
        setAdditionalMembers(prev => [...prev, savedMember]);
      }
    } else if (memberModalConfig.target === 'existing-household' && memberModalConfig.family) {
      const fam = memberModalConfig.family;
      let updatedMembers: FamilyMember[];
      if (memberModalConfig.memberToEdit && memberModalConfig.memberToEdit.id) {
        updatedMembers = fam.members.map(m => m.id === savedMember.id ? savedMember : m);
      } else {
        updatedMembers = [...fam.members, savedMember];
      }
      const updatedFamily = { ...fam, members: updatedMembers };
      if (activeFamily && activeFamily.id === fam.id) {
        setActiveFamily(updatedFamily);
      }
      onUpdateFamily?.(updatedFamily);
    }
    setMemberModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Handle Add Family Submit with Automatic Portal Credential Creation
  const handleCreateFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHouseNo || !newHead || !newPhone) return;

    const cleanHouse = newHouseNo.toLowerCase().replace(/[^a-z0-9]/g, '');
    const emailToUse = newEmail.trim() || `resident.${cleanHouse || 'user'}@mahallu.org`;
    const passwordToUse = newPassword.trim() || `${newHouseNo.replace(/[^a-zA-Z0-9]/g, '') || 'MHL'}@Mahallu2026`;

    // Member #1 is the Head of Family
    const headMember: FamilyMember = {
      id: `m-${Date.now()}-head`,
      name: newHead.trim(),
      relationToHead: 'Head',
      age: Number(newHeadAge) || 45,
      gender: newHeadGender,
      bloodGroup: newHeadBlood,
      occupation: newHeadOccupation.trim() || 'Merchant / Business',
      education: newHeadEducation.trim() || 'SSLC',
      maritalStatus: 'Married'
    };

    // Full Household Members array (Head + all additional family members)
    const allMembers: FamilyMember[] = [headMember, ...additionalMembers];

    const newFamily: FamilyRecord = {
      id: `fam-${Date.now()}`,
      houseNo: newHouseNo.trim(),
      houseName: newHouseName.trim() || 'Baitul Aman',
      ward: newWard,
      headOfFamily: newHead.trim(),
      phone: newPhone.trim(),
      address: newAddress.trim() || `${newWard}, Central Mahallu`,
      economicStatus: newStatus,
      rationCardType: newRation,
      monthlyChandaAmount: Number(newChanda) || 500,
      enrolledYear: 2026,
      portalEmail: emailToUse,
      temporaryPassword: passwordToUse,
      credentialsIssuedDate: '2026-09-21',
      members: allMembers
    };

    onAddFamily(newFamily, { email: emailToUse, password: passwordToUse });
    setIsAddFamilyModalOpen(false);

    // Prompt immediate access slip / WhatsApp sharing modal so resident gets credentials
    setCredentialsModalData({
      family: newFamily,
      email: emailToUse,
      password: passwordToUse,
      isNewlyCreated: true
    });

    // Reset fields
    setNewHouseNo('');
    setNewHouseName('');
    setNewHead('');
    setNewPhone('');
    setNewAddress('');
    setNewEmail('');
    setNewPassword('');
    setNewHeadAge(45);
    setNewHeadBlood('O+');
    setNewHeadOccupation('Merchant / Business');
    setNewHeadEducation('SSLC');
    setAdditionalMembers([]);
  };

  const handlePrintDirectory = () => {
    setIsCensusPrintModalOpen(true);
  };

  // RESIDENT ROLE: Strict Privacy Guard - Resident only views their OWN household profile
  if (currentUserRole === 'resident') {
    const residentHouseNo = currentUser?.houseNo || 'M-14';
    const myFamily = families.find(f => f.houseNo === residentHouseNo) || families.find(f => f.houseNo === 'M-14') || families[0];

    return (
      <div id="resident-my-household-view" className="space-y-6">
        {/* Household Primary Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                {myFamily.houseNo}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-slate-900">{myFamily.houseName}</h3>
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {myFamily.ward}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800">Head of Family: {myFamily.headOfFamily}</span>
                  <span>•</span>
                  <span>Enrolled: {myFamily.enrolledYear}</span>
                  <span>•</span>
                  <span>Ration Card: {myFamily.rationCardType}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                id="print-my-family-btn"
                type="button"
                onClick={() => setFamilySlipTarget(myFamily)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Family Slip</span>
              </button>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Payment</span>
                <span className="text-lg font-bold text-emerald-800">₹{myFamily.monthlyChandaAmount}/mo</span>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                {myFamily.economicStatus}
              </span>
            </div>
          </div>

          {/* Quick Contact & Address Strip */}
          <div className="p-4 bg-slate-50/70 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong className="text-slate-700">Registered Phone:</strong> {myFamily.phone}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 sm:col-span-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong className="text-slate-700">House Address:</strong> {myFamily.address}
              </span>
            </div>
          </div>

          {/* Family Members Section */}
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Registered Family Members ({myFamily.members.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Individual records enrolled in the official Mahallu family register.
                </p>
              </div>
              {onNavigateToServices && (
                <button
                  id="resident-request-member-update-btn"
                  type="button"
                  onClick={() => onNavigateToServices({
                    type: 'Add / Edit Family Members',
                    subject: `Census Update: Add / Edit Family Members for House #${myFamily.houseNo}`,
                    details: `House #${myFamily.houseNo} (${myFamily.houseName}, ${myFamily.ward}) requests to add/edit family member census records.\n\nHead of Family: ${myFamily.headOfFamily}\nContact Phone: ${myFamily.phone}\n\nMember Update Details:\n• Action: [Add New Member / Edit Existing Member]\n• Member Legal Name:\n• Relationship to Head of Family:\n• Gender & Age:\n• Blood Group:\n• Marital Status:\n• Occupation & Education:\n• Reason for Update (Newborn / Marriage / NRI / Correction):`
                  })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  <FileEdit className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Request Member Add / Update</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myFamily.members.map((member) => (
                <div 
                  key={member.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-200 hover:shadow-2xs transition-all space-y-2.5 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-bold text-slate-900 text-sm">{member.name}</h5>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                          {member.relationToHead}
                        </span>
                        {member.isAbroad && (
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded border border-blue-200 flex items-center gap-0.5">
                            <Globe className="w-2.5 h-2.5" /> NRI
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {member.gender} • {member.age} yrs • {member.maritalStatus}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg shrink-0 flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                        {member.bloodGroup}
                      </span>
                      {onNavigateToServices && (
                        <button
                          type="button"
                          onClick={() => onNavigateToServices({
                            type: 'Add / Edit Family Members',
                            subject: `Correction Request: ${member.name} (House #${myFamily.houseNo})`,
                            details: `Requesting census update for member ${member.name} (${member.relationToHead}, Age: ${member.age}):\n- House No: #${myFamily.houseNo} (${myFamily.houseName})\n- Current Blood Group: ${member.bloodGroup}\n- Current Occupation: ${member.occupation}\n- Proposed Changes / Reason:`
                          })}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-slate-200"
                          title="Submit correction request for this member"
                        >
                          <FileEdit className="w-3 h-3 text-emerald-600" />
                          <span>Request Correction</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Occupation</span>
                      <span className="text-slate-700 font-medium truncate block">{member.occupation}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Education</span>
                      <span className="text-slate-700 font-medium truncate block">{member.education}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certified Family Slip Modal */}
        {familySlipTarget && (
          <FamilySlipModal
            family={familySlipTarget}
            onClose={() => setFamilySlipTarget(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div id="directory-module" className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Resident & Family Directory</h2>
            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
              {filteredFamilies.length} Households
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete census of enrolled households, economic support categories, and family member particulars.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {currentUserRole === 'admin' && (
            <button
              id="register-family-btn"
              onClick={() => setIsAddFamilyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Household</span>
            </button>
          )}

          <button
            id="print-directory-btn"
            onClick={handlePrintDirectory}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Census</span>
          </button>

          {/* Grid / Table Toggle */}
          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-2xs text-emerald-700 font-bold' : 'text-slate-500'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-2xs text-emerald-700 font-bold' : 'text-slate-500'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              id="directory-search-input"
              type="text"
              placeholder="Search house #, name, phone, member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
            />
          </div>

          {/* Ward Selector */}
          <div>
            <select
              id="ward-filter-select"
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="All">All Wards / Blocks</option>
              <option value="Ward 1 - Bilal Nagar">Ward 1 - Bilal Nagar</option>
              <option value="Ward 2 - Madina Colony">Ward 2 - Madina Colony</option>
              <option value="Ward 3 - Edappal Town">Ward 3 - Edappal Town</option>
              <option value="Ward 4 - Quba Junction">Ward 4 - Quba Junction</option>
            </select>
          </div>

          {/* Economic Support Status */}
          <div>
            <select
              id="status-filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="All">All Economic Categories</option>
              <option value="General">General Category</option>
              <option value="Zakat-Eligible">Zakat-Eligible / Support Required</option>
              <option value="Priority Support">Priority Support (Widow/Orphan)</option>
            </select>
          </div>

          {/* Blood Group Filter */}
          <div>
            <select
              id="blood-group-filter-select"
              value={selectedBloodGroup}
              onChange={(e) => setSelectedBloodGroup(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="All">Filter by Blood Group (Any Member)</option>
              <option value="O+">O+ Positive</option>
              <option value="A+">A+ Positive</option>
              <option value="B+">B+ Positive</option>
              <option value="AB+">AB+ Positive</option>
              <option value="O-">O- Negative (Rare)</option>
              <option value="A-">A- Negative (Rare)</option>
              <option value="B-">B- Negative (Rare)</option>
              <option value="AB-">AB- Negative (Rare)</option>
            </select>
          </div>

        </div>

        {/* Quick status reset info */}
        {(searchQuery || selectedWard !== 'All' || selectedStatus !== 'All' || selectedBloodGroup !== 'All') && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Showing {filteredFamilies.length} of {families.length} households matching filters</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedWard('All');
                setSelectedStatus('All');
                setSelectedBloodGroup('All');
              }}
              className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFamilies.map((family) => {
            const isZakat = family.economicStatus === 'Zakat-Eligible';
            const isPriority = family.economicStatus === 'Priority Support';

            return (
              <div
                key={family.id}
                id={`family-card-${family.houseNo}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                      House #{family.houseNo}
                    </span>
                    
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isPriority
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : isZakat
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {family.economicStatus}
                    </span>
                  </div>

                  {/* House & Head Information */}
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{family.houseName}</h3>
                  <p className="text-xs font-semibold text-emerald-900 mt-0.5">Head: {family.headOfFamily}</p>
                  
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{family.ward}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{family.phone}</span>
                    </div>
                  </div>

                  {/* Member Blood Groups Snapshot */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                      <span className="font-medium">{family.members.length} Family Members:</span>
                      <span className="text-emerald-800 font-semibold">Monthly Payment: ₹{family.monthlyChandaAmount}/mo</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {family.members.map((member) => (
                        <span
                          key={member.id}
                          className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                          title={`${member.name} (${member.relationToHead}) - Blood: ${member.bloodGroup}, Occ: ${member.occupation}`}
                        >
                          <span className="font-semibold text-slate-900">{member.relationToHead}:</span>
                          <span className="text-rose-700 font-bold">{member.bloodGroup}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    id={`view-family-${family.houseNo}-btn`}
                    onClick={() => setActiveFamily(family)}
                    className="py-2 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Profile</span>
                  </button>

                  <button
                    id={`credentials-family-${family.houseNo}-btn`}
                    onClick={() => handleOpenCredentials(family)}
                    className="py-2 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Resident Login ID & Password"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Portal Access</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">House #</th>
                  <th className="py-3 px-4">House & Head of Family</th>
                  <th className="py-3 px-4">Ward / Block</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Economic Status</th>
                  <th className="py-3 px-4 text-center">Members</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFamilies.map((fam) => (
                  <tr key={fam.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{fam.houseNo}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{fam.houseName}</div>
                      <div className="text-[11px] text-slate-500">Head: {fam.headOfFamily}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{fam.ward}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{fam.phone}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        fam.economicStatus === 'Priority Support'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : fam.economicStatus === 'Zakat-Eligible'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {fam.economicStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">{fam.members.length}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveFamily(fam)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Profile
                        </button>
                        <button
                          id={`table-credentials-family-${fam.houseNo}-btn`}
                          onClick={() => handleOpenCredentials(fam)}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Resident Login ID & Password"
                        >
                          <KeyRound className="w-3 h-3 text-emerald-700" />
                          <span>Login ID</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Family Detail Modal */}
      {activeFamily && (
        <div id="family-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 p-6 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold bg-emerald-700/80 px-2 py-0.5 rounded text-emerald-100">
                    House #{activeFamily.houseNo}
                  </span>
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-emerald-200">
                    Enrolled {activeFamily.enrolledYear}
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight">{activeFamily.houseName}</h2>
                <p className="text-xs text-emerald-200 mt-0.5">Head of Family: {activeFamily.headOfFamily}</p>
              </div>

              <button
                id="close-family-modal-btn"
                onClick={() => setActiveFamily(null)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Household Key Particulars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Ward / Block</span>
                  <span className="font-bold text-slate-800">{activeFamily.ward}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Primary Phone</span>
                  <span className="font-mono font-bold text-slate-800">{activeFamily.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Support Status</span>
                  <span className="font-bold text-emerald-800">{activeFamily.economicStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Ration Card / Payment</span>
                  <span className="font-bold text-slate-800">{activeFamily.rationCardType} • ₹{activeFamily.monthlyChandaAmount}/mo</span>
                </div>
              </div>

              {/* Family Members Section */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-700" />
                      <span>Family Members Register ({activeFamily.members.length} Members)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">Official Mahallu Census Record</p>
                  </div>
                  <button
                    id="add-member-to-active-family-btn"
                    type="button"
                    onClick={() => handleOpenAddMemberForExisting(activeFamily)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add Family Member</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {activeFamily.members.map((member, idx) => (
                    <div 
                      key={member.id}
                      className="p-4 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50/60 transition-colors text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{member.name}</span>
                            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                              {member.relationToHead}
                            </span>
                            {member.isAbroad && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded text-[10px] font-semibold">
                                <Globe className="w-2.5 h-2.5" /> NRI
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-slate-600 text-[11px]">
                            <span className="flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-slate-400" />
                              {member.gender}, {member.age} yrs • {member.maritalStatus}
                            </span>
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3 text-slate-400" />
                              {member.education}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-slate-400" />
                              {member.occupation}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Blood Group Tag & Actions */}
                      <div className="shrink-0 flex items-center gap-2 sm:justify-end">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs">
                          <Heart className="w-3 h-3 text-rose-600 fill-rose-500" />
                          <span>Blood: {member.bloodGroup}</span>
                        </span>
                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleOpenEditMemberForExisting(activeFamily, member)}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer"
                            title="Edit Member Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {activeFamily.members.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMemberFromExisting(activeFamily, member.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Remove Member from Census"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Residential Address Details */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                <span className="font-bold text-slate-800">Physical Address: </span>
                <span>{activeFamily.address}</span>
              </div>

              {/* Resident Portal Access Card */}
              <div className="p-4 bg-emerald-950 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-emerald-800 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-800/60 border border-emerald-700/60 flex items-center justify-center text-emerald-300 shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Resident Portal Account</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">Active</span>
                    </div>
                    <div className="text-[11px] text-emerald-200/80 mt-0.5 font-mono">
                      Portal Login: {getAccountForFamily(activeFamily.houseNo, activeFamily.headOfFamily, activeFamily.portalEmail).email}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenCredentials(activeFamily)}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>View / Share Login Slip</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                id="admin-print-family-slip-btn"
                onClick={() => setFamilySlipTarget(activeFamily)}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-300 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-700" />
                <span>Print Official Family Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFamily(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Household Modal */}
      {isAddFamilyModalOpen && (
        <div id="add-family-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-700/60 flex items-center justify-center text-emerald-200 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Register New Mahallu Household</h3>
                  <p className="text-xs text-emerald-200">Enrol full family members & issue official census credentials</p>
                </div>
              </div>
              <button
                id="close-add-family-modal-btn"
                onClick={() => setIsAddFamilyModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateFamily} className="p-6 space-y-6 text-xs overflow-y-auto flex-1">
              
              {/* SECTION 1: Household & Address Particulars */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100 text-slate-900 font-bold">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span>1. Household Particulars</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">House Number *</label>
                    <input
                      id="new-house-no-input"
                      type="text"
                      placeholder="e.g. B-45 / M-102"
                      value={newHouseNo}
                      onChange={(e) => setNewHouseNo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">House / Villa Name</label>
                    <input
                      id="new-house-name-input"
                      type="text"
                      placeholder="e.g. Baitul Aman / Rahmath Manzil"
                      value={newHouseName}
                      onChange={(e) => setNewHouseName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ward / Block *</label>
                    <select
                      id="new-ward-select"
                      value={newWard}
                      onChange={(e) => setNewWard(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="Ward 1 - Bilal Nagar">Ward 1 - Bilal Nagar</option>
                      <option value="Ward 2 - Madina Colony">Ward 2 - Madina Colony</option>
                      <option value="Ward 3 - Edappal Town">Ward 3 - Edappal Town</option>
                      <option value="Ward 4 - Quba Junction">Ward 4 - Quba Junction</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Primary Contact Phone *</label>
                    <input
                      id="new-phone-input"
                      type="text"
                      placeholder="+91 98470 12345"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Support Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as EconomicStatus)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="General">General</option>
                      <option value="Zakat-Eligible">Zakat-Eligible</option>
                      <option value="Priority Support">Priority Support</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ration Card</label>
                    <select
                      value={newRation}
                      onChange={(e) => setNewRation(e.target.value as 'APL' | 'BPL' | 'AAY')}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="APL">APL</option>
                      <option value="BPL">BPL</option>
                      <option value="AAY">AAY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Monthly Payment (₹)</label>
                    <input
                      type="number"
                      value={newChanda}
                      onChange={(e) => setNewChanda(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                  <textarea
                    rows={2}
                    placeholder="Near landmark, road number..."
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* SECTION 2: Head of Family Details (Census Member #1) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100 text-slate-900 font-bold">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span>2. Head of Family (Census Member #1)</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Head of Family Full Name *</label>
                  <input
                    id="new-head-input"
                    type="text"
                    placeholder="e.g. Haji Usman Ali / Mariyam Beevi"
                    value={newHead}
                    onChange={(e) => setNewHead(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      min={18}
                      max={110}
                      value={newHeadAge}
                      onChange={(e) => setNewHeadAge(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={newHeadGender}
                      onChange={(e) => setNewHeadGender(e.target.value as 'Male' | 'Female')}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={newHeadBlood}
                      onChange={(e) => setNewHeadBlood(e.target.value as BloodGroup)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 font-bold"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Occupation</label>
                    <input
                      type="text"
                      placeholder="e.g. Merchant"
                      value={newHeadOccupation}
                      onChange={(e) => setNewHeadOccupation(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Education</label>
                    <input
                      type="text"
                      placeholder="e.g. SSLC"
                      value={newHeadEducation}
                      onChange={(e) => setNewHeadEducation(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Full Family Members Register (Spouse, Sons, Daughters, Parents) */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-slate-900">
                      3. Full Household Members Census ({1 + additionalMembers.length} Members)
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      {1 + additionalMembers.length} Total
                    </span>
                  </div>
                  <button
                    id="add-member-to-new-family-btn"
                    type="button"
                    onClick={() => handleOpenAddMemberForNew()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs cursor-pointer self-start sm:self-auto transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add Family Member</span>
                  </button>
                </div>

                {/* Quick Add Presets Bar */}
                <div className="flex items-center gap-1.5 flex-wrap bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-600 mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Quick Add:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenAddMemberForNew('Spouse')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 hover:text-emerald-800 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    + Spouse (Wife/Husband)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAddMemberForNew('Son')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 hover:text-emerald-800 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    + Son
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAddMemberForNew('Daughter')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 hover:text-emerald-800 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    + Daughter
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAddMemberForNew('Father')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 hover:text-emerald-800 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    + Father
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAddMemberForNew('Mother')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 hover:text-emerald-800 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    + Mother
                  </button>
                </div>

                {/* Staged Members Cards List */}
                <div className="space-y-2.5">
                  {/* Member 1: Head of Family Card */}
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                        1
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs">
                            {newHead ? newHead : '(Head of Family Name Required)'}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                            Head of Family
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {newHeadGender} • {newHeadAge} yrs • Blood: {newHeadBlood} • {newHeadOccupation}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-800 font-bold bg-white px-2 py-1 rounded-md border border-emerald-200 shrink-0">
                      Primary Head
                    </span>
                  </div>

                  {/* Additional Members List */}
                  {additionalMembers.map((member, idx) => (
                    <div 
                      key={member.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-xs">
                          {idx + 2}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs">{member.name}</span>
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                              {member.relationToHead}
                            </span>
                            {member.isAbroad && (
                              <span className="px-1.5 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-semibold rounded border border-sky-200 flex items-center gap-0.5">
                                <Globe className="w-2.5 h-2.5" /> NRI
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {member.gender} • {member.age} yrs • Blood: {member.bloodGroup} • {member.occupation} • {member.education}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditMemberForNew(member)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Member"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveMemberFromNew(member.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Empty state hint */}
                  {additionalMembers.length === 0 && (
                    <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-slate-500 text-xs space-y-1">
                      <p className="font-medium text-slate-700">Only Head of Family is currently added.</p>
                      <p className="text-[11px]">
                        Click <strong className="text-emerald-700">+ Add Family Member</strong> or the quick buttons above to include spouse, sons, daughters, and elders in this household census.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4: Resident Portal Login Credentials Card */}
              <div className="p-4 bg-emerald-950 text-white rounded-2xl space-y-3 border border-emerald-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-300" />
                    <span className="font-bold text-xs text-white">4. Resident Portal Login Credentials</span>
                  </div>
                  <span className="text-[10px] bg-emerald-800/80 text-emerald-200 px-2 py-0.5 rounded-md font-semibold border border-emerald-700/50">
                    Auto-Created
                  </span>
                </div>
                
                <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                  Upon registration, this account is activated so the resident can log in directly to view their full household details, pay monthly payments, and apply for certificates. A WhatsApp share link and printable access slip will be generated.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-300 mb-1">
                      Portal Login Email ID
                    </label>
                    <input
                      type="email"
                      placeholder={newHouseNo ? `resident.${newHouseNo.toLowerCase().replace(/[^a-z0-9]/g, '')}@mahallu.org` : 'e.g. resident@mahallu.org'}
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-black/40 border border-emerald-700 rounded-lg text-white placeholder-emerald-400/50 focus:ring-1 focus:ring-emerald-400 font-mono"
                    />
                    <span className="text-[10px] text-emerald-300/80 mt-0.5 block truncate">
                      {newEmail ? 'Custom email set' : `Defaults to: resident.${newHouseNo.toLowerCase().replace(/[^a-z0-9]/g, '') || 'house'}@mahallu.org`}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-emerald-300">
                        Temporary Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const clean = (newHouseNo || 'MHL').replace(/[^a-zA-Z0-9]/g, '');
                          const rand = Math.floor(100 + Math.random() * 900);
                          setNewPassword(`${clean}@MHL${rand}`);
                        }}
                        className="text-[10px] text-emerald-300 hover:text-white underline cursor-pointer"
                      >
                        Regenerate
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder={newHouseNo ? `${newHouseNo.replace(/[^a-zA-Z0-9]/g, '')}@Mahallu2026` : 'Mahallu@2026'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-8 text-xs bg-black/40 border border-emerald-700 rounded-lg text-white placeholder-emerald-400/50 focus:ring-1 focus:ring-emerald-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-2.5 text-emerald-400 hover:text-white cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-emerald-300/80 mt-0.5 block truncate">
                      {newPassword ? 'Custom password set' : `Defaults to: ${(newHouseNo || 'House').replace(/[^a-zA-Z0-9]/g, '')}@Mahallu2026`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Submission Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Ready to enrol: <strong className="text-slate-800">{1 + additionalMembers.length} family members</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddFamilyModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-register-family-btn"
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register Household ({1 + additionalMembers.length} Members) & Issue Credentials</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resident Portal Credentials Modal (WhatsApp Share, Print Official Slip, Copy) */}
      {credentialsModalData && (
        <ResidentCredentialsModal
          family={credentialsModalData.family}
          email={credentialsModalData.email}
          password={credentialsModalData.password}
          isOpen={true}
          isNewlyCreated={credentialsModalData.isNewlyCreated}
          onClose={() => setCredentialsModalData(null)}
          onUpdatePassword={handleUpdatePassword}
        />
      )}

      {/* Family Member Form Modal (used for both new registration & existing households) */}
      <FamilyMemberFormModal
        isOpen={memberModalConfig.isOpen}
        onClose={() => setMemberModalConfig(prev => ({ ...prev, isOpen: false }))}
        onSave={handleSaveMember}
        initialMember={memberModalConfig.memberToEdit}
        familyHouseNo={memberModalConfig.target === 'existing-household' ? memberModalConfig.family?.houseNo : newHouseNo || 'New'}
        familyHeadName={memberModalConfig.target === 'existing-household' ? memberModalConfig.family?.headOfFamily : newHead || 'Head of Family'}
      />

      {/* Official Family Slip Modal (Admin & Directory Print) */}
      {familySlipTarget && (
        <FamilySlipModal
          family={familySlipTarget}
          onClose={() => setFamilySlipTarget(null)}
        />
      )}

      {/* Official Comprehensive Census Register Print Modal */}
      <CensusPrintModal
        isOpen={isCensusPrintModalOpen}
        onClose={() => setIsCensusPrintModalOpen(false)}
        families={families}
        initialWardFilter={selectedWard}
      />

    </div>
  );
};
