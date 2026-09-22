import React, { useState, useMemo } from 'react';
import { 
  FamilyRecord, 
  DuesRecord, 
  MahalluLandmark, 
  ActiveTab,
  User 
} from '../types';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Search, 
  Filter, 
  Building2, 
  Phone, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Bot, 
  Smartphone, 
  Moon, 
  Sun, 
  Compass, 
  Info,
  Users,
  CreditCard,
  ShieldCheck
} from 'lucide-react';

interface MahalluGeoMapViewProps {
  families: FamilyRecord[];
  dues: DuesRecord[];
  currentUser: User | null;
  onSelectFamilyForAI?: (houseNo: string) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onShowToast: (msg: string) => void;
}

const LANDMARKS: MahalluLandmark[] = [
  {
    id: 'lm-masjid',
    name: 'Edappal Central Juma Masjid',
    type: 'masjid',
    description: 'Main Juma Masjid with 1,500 capacity, Minaret & Friday Khutbah center.',
    x: 50,
    y: 45,
    ward: 'Central Sector',
    contactPerson: 'Usthad Moulavi Bilal Qasimi (Chief Imam)',
    phone: '+91 495 2410022'
  },
  {
    id: 'lm-qabaristan',
    name: 'Central Qabaristan (Burial Ground)',
    type: 'qabaristan',
    description: 'Mahallu Waqf Cemetery & Mayyith Ghusl Facility with 24/7 access.',
    x: 42,
    y: 36,
    ward: 'Ward 1 - Bilal Nagar Sector',
    contactPerson: 'K.P. Moideen (Custodian)',
    phone: '+91 94471 88990'
  },
  {
    id: 'lm-madrasa',
    name: 'Badrul Huda Islamic Madrasa',
    type: 'madrasa',
    description: 'Dars & primary Islamic educational campus (Classes 1 to 10, 420 students).',
    x: 60,
    y: 35,
    ward: 'Ward 2 - Madina Sector',
    contactPerson: 'Usthad Zainuddin Musliyar (Sadar)',
    phone: '+91 94462 11002'
  },
  {
    id: 'lm-office',
    name: 'Mahallu Office & Waqf Council Chamber',
    type: 'office',
    description: 'Administrative secretariat, revenue counter, dispute resolution (Sulh) hall.',
    x: 52,
    y: 57,
    ward: 'Central Sector',
    contactPerson: 'Janab P.K. Abdul Rahman Haji (General Secretary)',
    phone: '+91 98471 23456'
  },
  {
    id: 'lm-ambulance',
    name: 'Baitul Mal Emergency Ambulance Post',
    type: 'ambulance',
    description: '24/7 dedicated medical emergency vehicle & first-aid disaster response unit.',
    x: 35,
    y: 58,
    ward: 'Ward 3 - Edappal Town Sector',
    contactPerson: 'Mahallu Emergency Helpline',
    phone: '+91 495 2410022'
  }
];

// Coordinate anchors for demo families
const HOUSE_COORDINATES: Record<string, { x: number; y: number }> = {
  'B-01': { x: 26, y: 30 },
  'B-19': { x: 20, y: 42 },
  'M-14': { x: 73, y: 32 },
  'N-08': { x: 28, y: 72 },
  'Q-22': { x: 76, y: 68 },
  // Simulated neighborhood homes
  'B-05': { x: 32, y: 24 },
  'B-12': { x: 16, y: 35 },
  'M-04': { x: 65, y: 26 },
  'M-20': { x: 82, y: 38 },
  'N-15': { x: 38, y: 78 },
  'N-21': { x: 22, y: 82 },
  'Q-09': { x: 68, y: 75 },
  'Q-16': { x: 84, y: 62 },
};

export const MahalluGeoMapView: React.FC<MahalluGeoMapViewProps> = ({
  families,
  dues,
  currentUser,
  onSelectFamilyForAI,
  onNavigateTab,
  onShowToast
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'landmarks'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePin, setActivePin] = useState<any | null>(null);
  const [mapTheme, setMapTheme] = useState<'light' | 'dark'>('light');
  const [showDistanceRings, setShowDistanceRings] = useState(true);

  // Combine family records with coordinates
  const mappedHouses = useMemo(() => {
    return families.map(f => {
      const coords = HOUSE_COORDINATES[f.houseNo] || {
        x: f.ward.includes('Ward 1') ? 22 + (parseInt(f.houseNo.replace(/\D/g, '') || '5') % 15) :
           f.ward.includes('Ward 2') ? 70 + (parseInt(f.houseNo.replace(/\D/g, '') || '5') % 15) :
           f.ward.includes('Ward 3') ? 26 + (parseInt(f.houseNo.replace(/\D/g, '') || '5') % 15) :
           74 + (parseInt(f.houseNo.replace(/\D/g, '') || '5') % 15),
        y: f.ward.includes('Ward 1') ? 28 + (parseInt(f.houseNo.replace(/\D/g, '') || '5') % 18) :
           f.ward.includes('Ward 2') ? 28 + (parseInt(f.houseNo.replace(/\D/g, '') || '5') % 18) :
           f.ward.includes('Ward 3') ? 68 + (parseInt(f.houseNo.replace(/\D/g, '') || '5') % 18) :
           65 + (parseInt(f.houseNo.replace(/\D/g, '') || '5') % 18)
      };

      const due = dues.find(d => d.houseNo.toLowerCase() === f.houseNo.toLowerCase());
      const isPaid = due?.status === 'Paid';

      return {
        ...f,
        coords,
        isPaid,
        dueRecord: due
      };
    });
  }, [families, dues]);

  // Filtered houses
  const filteredHouses = useMemo(() => {
    return mappedHouses.filter(h => {
      // Ward filter
      if (selectedWard !== 'all' && !h.ward.toLowerCase().includes(selectedWard.toLowerCase())) {
        return false;
      }
      // Status filter
      if (statusFilter === 'paid' && !h.isPaid) return false;
      if (statusFilter === 'pending' && h.isPaid) return false;
      if (statusFilter === 'landmarks') return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          h.houseNo.toLowerCase().includes(q) ||
          h.houseName.toLowerCase().includes(q) ||
          h.headOfFamily.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [mappedHouses, selectedWard, statusFilter, searchQuery]);

  // Filtered landmarks
  const filteredLandmarks = useMemo(() => {
    if (statusFilter === 'paid' || statusFilter === 'pending') return LANDMARKS.filter(l => l.type === 'masjid');
    return LANDMARKS;
  }, [statusFilter]);

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setActivePin(null);
  };

  // WhatsApp resident click
  const handlePingResident = (house: any) => {
    const rawPhone = house.phone.replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const text = `Assalamu Alaikum ${house.headOfFamily} (${house.houseName}, #${house.houseNo}),\nRegarding Edappal Central Mahallu Jama'ath records:`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    onShowToast(`Opening WhatsApp chat with ${house.headOfFamily}`);
  };

  return (
    <div id="mahallu-geo-map-container" className="space-y-4">
      {/* Top Map Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Edappal Central Mahallu Territorial Geo Map
              </h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full">
                482 Households • 4 Wards
              </span>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                id="map-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find house # or name..."
                className="bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 w-44 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            {/* Ward Selector */}
            <select
              id="map-ward-select"
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">All Wards (4 Zones)</option>
              <option value="Ward 1">Ward 1 - Bilal Nagar</option>
              <option value="Ward 2">Ward 2 - Madina Colony</option>
              <option value="Ward 3">Ward 3 - Edappal Town</option>
              <option value="Ward 4">Ward 4 - Quba Junction</option>
            </select>

            {/* Status Selector */}
            <select
              id="map-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">All Pins (Houses + Places)</option>
              <option value="paid">Cleared Payment Only (Green)</option>
              <option value="pending">Pending Dues Only (Amber)</option>
              <option value="landmarks">Only Landmarks & Masjid</option>
            </select>

            {/* Day/Night toggle */}
            <button
              id="toggle-map-theme-btn"
              onClick={() => setMapTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title={mapTheme === 'light' ? 'Switch to Satellite Dark Mode' : 'Switch to Day Mode'}
            >
              {mapTheme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Canvas Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map Stage (9 cols on large screen) */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden relative min-h-[540px] flex flex-col">
          {/* Zoom and Layer Floating Controls */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200 shadow-md">
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="w-full h-px bg-slate-200 my-0.5" />
            <button
              onClick={() => setShowDistanceRings(!showDistanceRings)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showDistanceRings ? 'bg-emerald-100 text-emerald-800' : 'text-slate-400 hover:bg-slate-100'
              }`}
              title="Toggle Mosque Distance Radius Rings"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          {/* Map Compass & Scale Indicator */}
          <div className="absolute bottom-4 left-4 z-20 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-[10px] text-slate-600 flex items-center gap-3">
            <span className="font-bold flex items-center gap-1 text-emerald-800">
              <Compass className="w-3.5 h-3.5" /> N
            </span>
            <div className="flex items-center gap-1">
              <span className="w-8 h-1 bg-slate-600 inline-block rounded" />
              <span>200 meters</span>
            </div>
            <span>• Scale: 1:2500</span>
          </div>

          {/* Interactive SVG Render */}
          <div 
            id="mahallu-svg-viewport"
            className={`w-full flex-1 relative overflow-hidden select-none transition-colors duration-300 ${
              mapTheme === 'dark' ? 'bg-[#0f172a]' : 'bg-[#f4f7f4]'
            }`}
            style={{ minHeight: '520px' }}
          >
            <svg
              viewBox="0 0 1000 700"
              className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                transformOrigin: '50% 50%'
              }}
            >
              <defs>
                {/* Ward Patterns and Gradients */}
                <linearGradient id="ward1-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={mapTheme === 'dark' ? '#1e293b' : '#e0e7ff'} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={mapTheme === 'dark' ? '#0f172a' : '#c7d2fe'} stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="ward2-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={mapTheme === 'dark' ? '#064e3b' : '#dcfce7'} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={mapTheme === 'dark' ? '#022c22' : '#bbf7d0'} stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="ward3-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={mapTheme === 'dark' ? '#78350f' : '#fef3c7'} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={mapTheme === 'dark' ? '#451a03' : '#fde68a'} stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="ward4-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={mapTheme === 'dark' ? '#134e4a' : '#ccfbf1'} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={mapTheme === 'dark' ? '#042f2e' : '#99f6e4'} stopOpacity="0.2" />
                </linearGradient>

                <filter id="glow-masjid" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid Background */}
              <g opacity={mapTheme === 'dark' ? 0.08 : 0.25} stroke={mapTheme === 'dark' ? '#38bdf8' : '#cbd5e1'} strokeWidth="1">
                {Array.from({ length: 20 }).map((_, i) => (
                  <line key={`gx-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="700" strokeDasharray="3 3" />
                ))}
                {Array.from({ length: 14 }).map((_, i) => (
                  <line key={`gy-${i}`} x1="0" y1={i * 50} x2="1000" y2={i * 50} strokeDasharray="3 3" />
                ))}
              </g>

              {/* WARD BOUNDARIES & ZONES */}
              {/* Ward 1: Bilal Nagar (North-West) */}
              <polygon
                points="40,40 480,40 470,360 40,360"
                fill="url(#ward1-grad)"
                stroke={mapTheme === 'dark' ? '#6366f1' : '#818cf8'}
                strokeWidth="1.5"
                strokeDasharray="5 3"
              />
              <text x="70" y="75" fill={mapTheme === 'dark' ? '#a5b4fc' : '#4338ca'} fontSize="14" fontWeight="bold">
                WARD 1 • BILAL NAGAR
              </text>
              <text x="70" y="93" fill={mapTheme === 'dark' ? '#64748b' : '#6b7280'} fontSize="10">
                124 Households • Rep: Al-Haj P.K. Mohammed
              </text>

              {/* Ward 2: Madina Colony (North-East) */}
              <polygon
                points="520,40 960,40 960,360 530,360"
                fill="url(#ward2-grad)"
                stroke={mapTheme === 'dark' ? '#10b981' : '#34d399'}
                strokeWidth="1.5"
                strokeDasharray="5 3"
              />
              <text x="550" y="75" fill={mapTheme === 'dark' ? '#6ee7b7' : '#047857'} fontSize="14" fontWeight="bold">
                WARD 2 • MADINA COLONY
              </text>
              <text x="550" y="93" fill={mapTheme === 'dark' ? '#64748b' : '#6b7280'} fontSize="10">
                138 Households • Rep: Dr. CH Mansoor Ahmed
              </text>

              {/* Ward 3: Edappal Town (South-West) */}
              <polygon
                points="40,390 470,390 470,660 40,660"
                fill="url(#ward3-grad)"
                stroke={mapTheme === 'dark' ? '#f59e0b' : '#fbbf24'}
                strokeWidth="1.5"
                strokeDasharray="5 3"
              />
              <text x="70" y="420" fill={mapTheme === 'dark' ? '#fde68a' : '#b45309'} fontSize="14" fontWeight="bold">
                WARD 3 • EDAPPAL TOWN
              </text>
              <text x="70" y="438" fill={mapTheme === 'dark' ? '#64748b' : '#6b7280'} fontSize="10">
                110 Households • Rep: K.T. Abdul Kareem
              </text>

              {/* Ward 4: Quba Junction (South-East) */}
              <polygon
                points="530,390 960,390 960,660 530,660"
                fill="url(#ward4-grad)"
                stroke={mapTheme === 'dark' ? '#14b8a6' : '#2dd4bf'}
                strokeWidth="1.5"
                strokeDasharray="5 3"
              />
              <text x="550" y="420" fill={mapTheme === 'dark' ? '#5eead4' : '#0f766e'} fontSize="14" fontWeight="bold">
                WARD 4 • QUBA JUNCTION
              </text>
              <text x="550" y="438" fill={mapTheme === 'dark' ? '#64748b' : '#6b7280'} fontSize="10">
                110 Households • Rep: V.P. Hamza Haji
              </text>

              {/* ROAD NETWORK */}
              <g stroke={mapTheme === 'dark' ? '#334155' : '#cbd5e1'} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none">
                {/* Central Cross Roads */}
                <path d="M 500,40 L 500,660" />
                <path d="M 40,375 L 960,375" />
                {/* Secondary Arterials */}
                <path d="M 200,40 Q 250,220 500,375" strokeWidth="8" />
                <path d="M 800,40 Q 750,220 500,375" strokeWidth="8" />
                <path d="M 200,660 Q 260,520 500,375" strokeWidth="8" />
                <path d="M 800,660 Q 740,520 500,375" strokeWidth="8" />
              </g>

              {/* Inner Road Fill (White / Dark Slate) */}
              <g stroke={mapTheme === 'dark' ? '#1e293b' : '#ffffff'} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d="M 500,40 L 500,660" />
                <path d="M 40,375 L 960,375" />
                <path d="M 200,40 Q 250,220 500,375" strokeWidth="6" />
                <path d="M 800,40 Q 750,220 500,375" strokeWidth="6" />
                <path d="M 200,660 Q 260,520 500,375" strokeWidth="6" />
                <path d="M 800,660 Q 740,520 500,375" strokeWidth="6" />
              </g>

              {/* Road Names */}
              <text x="510" y="210" fill={mapTheme === 'dark' ? '#94a3b8' : '#64748b'} fontSize="9" fontWeight="600" letterSpacing="2" transform="rotate(90 510 210)">
                JUMA MASJID TRUNK ROAD
              </text>
              <text x="260" y="368" fill={mapTheme === 'dark' ? '#94a3b8' : '#64748b'} fontSize="9" fontWeight="600" letterSpacing="1">
                MADINA - BILAL CROSSWAY
              </text>
              <text x="680" y="368" fill={mapTheme === 'dark' ? '#94a3b8' : '#64748b'} fontSize="9" fontWeight="600" letterSpacing="1">
                QUBA CENTRAL AVENUE
              </text>

              {/* DISTANCE RADIUS RINGS FROM MASJID (Center: 500, 315) */}
              {showDistanceRings && (
                <g stroke={mapTheme === 'dark' ? '#10b981' : '#059669'} fill="none" opacity={mapTheme === 'dark' ? 0.3 : 0.25} strokeDasharray="4 4">
                  {/* 100m */}
                  <circle cx="500" cy="315" r="90" strokeWidth="1" />
                  <text x="500" y="220" textAnchor="middle" fill={mapTheme === 'dark' ? '#34d399' : '#047857'} fontSize="8">
                    100m from Masjid
                  </text>
                  {/* 250m */}
                  <circle cx="500" cy="315" r="180" strokeWidth="1" />
                  <text x="500" y="130" textAnchor="middle" fill={mapTheme === 'dark' ? '#34d399' : '#047857'} fontSize="8">
                    250m Adhan Hearing Zone
                  </text>
                  {/* 500m */}
                  <circle cx="500" cy="315" r="300" strokeWidth="1.5" />
                  <text x="500" y="40" textAnchor="middle" fill={mapTheme === 'dark' ? '#34d399' : '#047857'} fontSize="8">
                    500m Outer Territorial Boundary
                  </text>
                </g>
              )}

              {/* LANDMARK PINS */}
              {filteredLandmarks.map((lm) => {
                const px = lm.x * 10;
                const py = lm.y * 7;
                const isMasjid = lm.type === 'masjid';

                return (
                  <g
                    key={lm.id}
                    transform={`translate(${px}, ${py})`}
                    className="cursor-pointer group"
                    onClick={() => setActivePin({ ...lm, isLandmark: true })}
                  >
                    {isMasjid ? (
                      /* Edappal Central Juma Masjid Special Grand Pin */
                      <g filter="url(#glow-masjid)">
                        <circle cx="0" cy="0" r="30" fill="#047857" opacity="0.2" className="animate-ping" />
                        <circle cx="0" cy="0" r="22" fill="#065f46" stroke="#34d399" strokeWidth="2.5" />
                        <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">
                          🕌
                        </text>
                        <rect x="-70" y="28" width="140" height="20" rx="6" fill="#022c22" opacity="0.9" />
                        <text x="0" y="42" textAnchor="middle" fill="#a7f3d0" fontSize="9" fontWeight="bold">
                          EDAPPAL JUMA MASJID
                        </text>
                      </g>
                    ) : (
                      /* Other landmarks (Madrasa, Qabaristan, Office, Ambulance) */
                      <g>
                        <circle cx="0" cy="0" r="14" fill={
                          lm.type === 'qabaristan' ? '#1e293b' :
                          lm.type === 'madrasa' ? '#1d4ed8' :
                          lm.type === 'office' ? '#4f46e5' : '#b91c1c'
                        } stroke="#ffffff" strokeWidth="2" />
                        <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10">
                          {lm.type === 'qabaristan' ? '🌿' :
                           lm.type === 'madrasa' ? '📖' :
                           lm.type === 'office' ? '🏛️' : '🚑'}
                        </text>
                        <rect x="-45" y="18" width="90" height="16" rx="4" fill="#0f172a" opacity="0.85" />
                        <text x="0" y="30" textAnchor="middle" fill="#f8fafc" fontSize="8" fontWeight="600">
                          {lm.name.split(' ')[0]} {lm.name.split(' ')[1] || ''}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* REGISTERED HOUSEHOLD PINS */}
              {filteredHouses.map((house) => {
                const px = house.coords.x * 10;
                const py = house.coords.y * 7;
                const isSelected = activePin?.id === house.id;

                return (
                  <g
                    key={house.id}
                    transform={`translate(${px}, ${py})`}
                    className="cursor-pointer"
                    onClick={() => setActivePin({ ...house, isLandmark: false })}
                  >
                    {/* Ring for selection or pending dues */}
                    {isSelected && (
                      <circle cx="0" cy="0" r="16" fill="none" stroke="#3b82f6" strokeWidth="2.5" className="animate-pulse" />
                    )}

                    {/* House Marker Pin */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected ? 10 : 8}
                      fill={house.isPaid ? '#10b981' : '#f59e0b'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* House Code */}
                    <text
                      x="0"
                      y="15"
                      textAnchor="middle"
                      fill={mapTheme === 'dark' ? '#e2e8f0' : '#1e293b'}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      #{house.houseNo}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom Map Legend */}
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">HINTS:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
                <span className="text-slate-700 text-[11px]">Payment Cleared ({mappedHouses.filter(h => h.isPaid).length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 border border-white" />
                <span className="text-slate-700 text-[11px]">Pending Dues ({mappedHouses.filter(h => !h.isPaid).length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🕌</span>
                <span className="text-slate-700 text-[11px]">Central Juma Masjid</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🌿</span>
                <span className="text-slate-700 text-[11px]">Qabaristan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">📖</span>
                <span className="text-slate-700 text-[11px]">Madrasa</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              GPS: 11.2588° N, 75.7804° E • Kerala Waqf Board
            </div>
          </div>
        </div>

        {/* Right Inspector Drawer / Detail Card (3 cols on large screen) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          {activePin ? (
            activePin.isLandmark ? (
              /* LANDMARK INSPECTOR CARD */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {activePin.type === 'masjid' ? '🕌' :
                       activePin.type === 'qabaristan' ? '🌿' :
                       activePin.type === 'madrasa' ? '📖' :
                       activePin.type === 'office' ? '🏛️' : '🚑'}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">{activePin.name}</h4>
                      <p className="text-[10px] text-emerald-700 font-semibold">{activePin.ward}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActivePin(null)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {activePin.description}
                </p>

                <div className="bg-slate-50 p-2.5 rounded-xl space-y-1 text-xs">
                  <p className="text-[11px] font-bold text-slate-700">Official Contact:</p>
                  <p className="text-slate-800 text-[11px] font-medium">{activePin.contactPerson}</p>
                  <p className="text-slate-500 font-mono text-[10px]">{activePin.phone}</p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (activePin.phone) {
                        window.open(`tel:${activePin.phone}`, '_self');
                      }
                    }}
                    className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Landmark Office</span>
                  </button>
                </div>
              </div>
            ) : (
              /* HOUSEHOLD INSPECTOR CARD */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 space-y-3.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      #{activePin.houseNo}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">{activePin.houseName}</h4>
                      <p className="text-[10px] text-slate-500">{activePin.ward}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activePin.isPaid
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {activePin.isPaid ? 'Cleared' : 'Due Pending'}
                  </span>
                </div>

                {/* Resident Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-500">Head of Family:</span>
                    <span className="font-bold text-slate-800">{activePin.headOfFamily}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-500">Family Members:</span>
                    <span className="font-medium text-slate-800">{activePin.members?.length || 5} members</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-500">Monthly Payment:</span>
                    <span className="font-bold text-emerald-800">₹{activePin.monthlyChandaAmount || 500}/mo</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-mono text-slate-800">{activePin.phone}</span>
                  </div>
                </div>

                {/* Quick Actions from Map */}
                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={() => handlePingResident(activePin)}
                    className="w-full py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Ping on WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onSelectFamilyForAI) {
                        onSelectFamilyForAI(activePin.houseNo);
                      }
                      onNavigateTab('services');
                      onShowToast(`Opening Services & Clearance for House #${activePin.houseNo}`);
                    }}
                    className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                    <span>View Clearance & Services</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab('financials')}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-slate-600" />
                    <span>View Payment Ledger</span>
                  </button>
                </div>
              </div>
            )
          ) : (
            /* DEFAULT HELPFUL GUIDE WHEN NO PIN IS SELECTED */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Info className="w-4 h-4 text-emerald-700" />
                <h4 className="font-bold text-slate-900 text-xs">Mahallu Territorial Explorer</h4>
              </div>

              <p className="text-xs leading-relaxed text-slate-600">
                Click any household pin or sacred landmark on the map to inspect family records, check live clearance status, or send a direct WhatsApp alert.
              </p>

              <div className="space-y-2 pt-1">
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-emerald-900">
                  <p className="font-bold text-[11px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    Waqf Jurisdiction
                  </p>
                  <p className="text-[10px] text-emerald-800 mt-0.5">
                    Edappal Central Mahallu spans 1.8 sq km encompassing 4 distinct administrative wards.
                  </p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <p className="font-bold text-[11px] text-slate-800">Quick Stats:</p>
                  <ul className="text-[11px] text-slate-600 space-y-1 mt-1">
                    <li>• Total Registered Houses: 482</li>
                    <li>• Masjid Capacity: 1,500 Musallis</li>
                    <li>• Madrasa Students: 420 Students</li>
                    <li>• Nearest Distance: 80m from Central Gate</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Quick Ward Navigator List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2.5">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ward Representatives</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" onClick={() => setSelectedWard('Ward 1')}>
                <p className="font-bold text-slate-800 text-[11px]">Ward 1 - Bilal Nagar</p>
                <p className="text-[10px] text-slate-500">Al-Haj P.K. Mohammed Haji • 124 Homes</p>
              </div>
              <div className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" onClick={() => setSelectedWard('Ward 2')}>
                <p className="font-bold text-slate-800 text-[11px]">Ward 2 - Madina Colony</p>
                <p className="text-[10px] text-slate-500">Dr. CH Mansoor Ahmed • 138 Homes</p>
              </div>
              <div className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" onClick={() => setSelectedWard('Ward 3')}>
                <p className="font-bold text-slate-800 text-[11px]">Ward 3 - Edappal Town</p>
                <p className="text-[10px] text-slate-500">K.T. Abdul Kareem • 110 Homes</p>
              </div>
              <div className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" onClick={() => setSelectedWard('Ward 4')}>
                <p className="font-bold text-slate-800 text-[11px]">Ward 4 - Quba Junction</p>
                <p className="text-[10px] text-slate-500">V.P. Hamza Haji • 110 Homes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
