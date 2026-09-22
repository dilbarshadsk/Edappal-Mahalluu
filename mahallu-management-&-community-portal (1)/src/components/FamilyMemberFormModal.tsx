import React, { useState, useEffect } from 'react';
import { FamilyMember, BloodGroup } from '../types';
import { 
  X, 
  UserPlus, 
  UserCheck, 
  Heart, 
  Briefcase, 
  GraduationCap, 
  Globe, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface FamilyMemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: FamilyMember) => void;
  initialMember?: FamilyMember | null;
  familyHouseNo?: string;
  familyHeadName?: string;
}

export const FamilyMemberFormModal: React.FC<FamilyMemberFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMember,
  familyHouseNo,
  familyHeadName
}) => {
  const [name, setName] = useState('');
  const [relationToHead, setRelationToHead] = useState<FamilyMember['relationToHead']>('Spouse');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'Male' | 'Female'>('Female');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [occupation, setOccupation] = useState('Homemaker');
  const [education, setEducation] = useState('SSLC');
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married' | 'Widowed' | 'Divorced'>('Married');
  const [isAbroad, setIsAbroad] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialMember) {
      setName(initialMember.name);
      setRelationToHead(initialMember.relationToHead);
      setAge(initialMember.age);
      setGender(initialMember.gender);
      setBloodGroup(initialMember.bloodGroup);
      setOccupation(initialMember.occupation);
      setEducation(initialMember.education);
      setMaritalStatus(initialMember.maritalStatus);
      setIsAbroad(Boolean(initialMember.isAbroad));
    } else {
      // Default reset for new member
      setName('');
      setRelationToHead('Spouse');
      setAge(30);
      setGender('Female');
      setBloodGroup('O+');
      setOccupation('Homemaker');
      setEducation('SSLC');
      setMaritalStatus('Married');
      setIsAbroad(false);
    }
    setError(null);
  }, [initialMember, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Member name is required.');
      return;
    }

    if (age <= 0 || age > 120) {
      setError('Please enter a valid age between 1 and 120.');
      return;
    }

    const memberData: FamilyMember = {
      id: initialMember?.id || `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      relationToHead,
      age: Number(age),
      gender,
      bloodGroup,
      occupation: occupation.trim() || 'None',
      education: education.trim() || 'General',
      maritalStatus,
      isAbroad
    };

    onSave(memberData);
    onClose();
  };

  const handleRelationChange = (val: FamilyMember['relationToHead']) => {
    setRelationToHead(val);
    // Sensible defaults based on relationship
    if (val === 'Spouse') {
      setGender('Female');
      setMaritalStatus('Married');
      setOccupation('Homemaker');
    } else if (val === 'Son') {
      setGender('Male');
      setMaritalStatus('Single');
      setOccupation('Student');
    } else if (val === 'Daughter') {
      setGender('Female');
      setMaritalStatus('Single');
      setOccupation('Student');
    } else if (val === 'Father') {
      setGender('Male');
      setMaritalStatus('Married');
      setOccupation('Retired / Senior');
    } else if (val === 'Mother') {
      setGender('Female');
      setMaritalStatus('Married');
      setOccupation('Senior');
    }
  };

  return (
    <div 
      id="family-member-modal-backdrop"
      className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div 
        id="family-member-modal-card"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-700/60 flex items-center justify-center text-emerald-200 shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {initialMember ? 'Edit Family Member Details' : 'Add Family Member to Census'}
              </h3>
              <p className="text-xs text-emerald-200">
                {familyHouseNo ? `Household #${familyHouseNo}` : 'Census Registry'}
                {familyHeadName ? ` • Head: ${familyHeadName}` : ''}
              </p>
            </div>
          </div>
          <button
            id="close-member-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Member Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Member Full Name *
            </label>
            <input
              id="member-fullname-input"
              type="text"
              placeholder="e.g. Fatima Beevi / Bilal Rahman"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          {/* Relation to Head & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Relation to Head of Family *
              </label>
              <select
                id="member-relation-select"
                value={relationToHead}
                onChange={(e) => handleRelationChange(e.target.value as FamilyMember['relationToHead'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Spouse">Spouse (Wife / Husband)</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Head">Head of Family</option>
                <option value="Other">Other Dependent</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Gender *
              </label>
              <select
                id="member-gender-select"
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Age & Blood Group & Marital Status */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Age (Years) *
              </label>
              <input
                id="member-age-input"
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                <span>Blood Group</span>
              </label>
              <select
                id="member-bloodgroup-select"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
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
              <label className="block font-semibold text-slate-700 mb-1">
                Marital Status
              </label>
              <select
                id="member-marital-select"
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value as 'Single' | 'Married' | 'Widowed' | 'Divorced')}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>
          </div>

          {/* Occupation & Education */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-slate-500" />
                <span>Occupation</span>
              </label>
              <input
                id="member-occupation-input"
                type="text"
                placeholder="e.g. Student, Homemaker, Teacher"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-slate-500" />
                <span>Education</span>
              </label>
              <input
                id="member-education-input"
                type="text"
                placeholder="e.g. SSLC, Plus Two, Degree"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* NRI / Abroad Toggle */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-600" />
              <div>
                <span className="font-semibold text-slate-800 block text-xs">Expatriate / NRI Status</span>
                <span className="text-[11px] text-slate-500">Is this member currently residing or working abroad?</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAbroad}
                onChange={(e) => setIsAbroad(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-family-member-btn"
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialMember ? 'Save Changes' : 'Add to Family'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
