import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { getMemberStatus, formatReadableDate } from '../utils/helpers';
import { Member, AttendanceRecord } from '../types';
import { 
  Search, CheckCircle, AlertTriangle, Users, Calendar, 
  Clock, Check, Eye, ChevronRight, QrCode
} from 'lucide-react';
import { MemberProfileModal } from '../components/MemberProfileModal';

export const Attendance: React.FC = () => {
  const { members, attendance, checkInMember } = useGym();

  // Mode tab state: search mode or QR scan simulator mode
  const [scanMode, setScanMode] = useState<'search' | 'qr'>('search');
  const [simulatedScanMemberId, setSimulatedScanMemberId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanBeep, setScanBeep] = useState(false);

  // Search input & results state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // Filtering for attendance history
  const [historyFilter, setHistoryFilter] = useState<'today' | 'yesterday' | 'week' | 'month'>('today');
  
  // Selected member to view detailed profile
  const [profileMember, setProfileMember] = useState<Member | null>(null);

  // Success alert notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Today is August 14, 2026
  const todayStr = '2026-08-14';
  const yesterdayStr = '2026-08-13';

  // Search results matching query (exclude if no query is typed to avoid massive lists)
  const searchResults = searchQuery.trim() 
    ? members.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.phone.includes(searchQuery) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  // Handle member click in search results
  const handleSelectMember = (m: Member) => {
    setSelectedMember(m);
    setSearchQuery(''); // Clear query to hide dropdown
  };

  // Perform actual check-in
  const handleCheckIn = () => {
    if (!selectedMember) return;
    
    const res = checkInMember(selectedMember.id);
    if (res.success) {
      setSuccessMsg(res.message);
      setErrorMsg(null);
      setSelectedMember(null); // Clear selected to allow next scan
      
      // Auto clear alert
      setTimeout(() => setSuccessMsg(null), 5000);
    } else {
      setErrorMsg(res.message);
      setSuccessMsg(null);
    }
  };

  // Compute attendance history list based on selected filter
  const getFilteredAttendance = () => {
    const today = new Date(todayStr);
    
    return attendance.filter(att => {
      if (historyFilter === 'today') {
        return att.date === todayStr;
      }
      if (historyFilter === 'yesterday') {
        return att.date === yesterdayStr;
      }
      
      const recordDate = new Date(att.date);
      const diffTime = today.getTime() - recordDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (historyFilter === 'week') {
        return diffDays >= 0 && diffDays <= 7;
      }
      if (historyFilter === 'month') {
        return diffDays >= 0 && diffDays <= 30;
      }
      
      return true;
    });
  };

  const filteredAttendance = getFilteredAttendance();

  // Status mapping
  const statusConfig = {
    active: { text: 'text-emerald-600', label: '🟢 Active' },
    expiring: { text: 'text-amber-500', label: '🟠 Expiring Soon' },
    expired: { text: 'text-rose-600', label: '🔴 Expired' },
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Desk Attendance Check-In</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Scan Member ID, type name or phone to check-in members instantly
        </p>
      </div>

      {/* Grid Layout: Top Row Check In panel, Bottom lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Rapid Check-In Desk (col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Check-In Terminal</h3>
              
              {/* Scan Mode Switcher */}
              <div className="flex gap-1 bg-zinc-50 dark:bg-zinc-950 p-1 rounded-lg border border-zinc-150 dark:border-zinc-850">
                <button
                  onClick={() => {
                    setScanMode('search');
                    setSelectedMember(null);
                    setSuccessMsg(null);
                    setErrorMsg(null);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                    scanMode === 'search'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                >
                  Standard Search
                </button>
                <button
                  onClick={() => {
                    setScanMode('qr');
                    setSelectedMember(null);
                    setSuccessMsg(null);
                    setErrorMsg(null);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                    scanMode === 'qr'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                >
                  Desk QR Simulator
                </button>
              </div>
            </div>
            
            {scanMode === 'search' ? (
              <div className="space-y-4">
                {/* Search Box */}
                <div className="relative">
                  <label className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                    Search Member to Check In...
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type Name, Phone or ID (e.g. Rahul, TF-0001)..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Floating Dropdown Results */}
                  {searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg shadow-lg overflow-hidden z-25 max-h-56 overflow-y-auto">
                      {searchResults.map((m) => {
                        const mStatus = getMemberStatus(m.expiryDate);
                        return (
                          <div
                            key={m.id}
                            onClick={() => handleSelectMember(m)}
                            className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer text-xs border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                          >
                            <div>
                              <p className="font-bold text-zinc-800 dark:text-zinc-200">{m.name} ({m.id})</p>
                              <p className="text-[10px] text-zinc-400">{m.phone}</p>
                            </div>
                            <span className={`font-semibold ${statusConfig[mStatus].text}`}>
                              {statusConfig[mStatus].label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Selected Member Checkout Panel */}
                {selectedMember ? (
                  <div className="bg-zinc-50 dark:bg-zinc-950/60 p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded font-mono font-bold">
                          {selectedMember.id}
                        </span>
                        <h4 className="text-base font-bold text-zinc-900 dark:text-white mt-1.5">{selectedMember.name}</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Phone: {selectedMember.phone}</p>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        getMemberStatus(selectedMember.expiryDate) === 'active' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20' :
                        getMemberStatus(selectedMember.expiryDate) === 'expiring' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20' :
                        'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20'
                      }`}>
                        {statusConfig[getMemberStatus(selectedMember.expiryDate)].label}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200/60 dark:border-zinc-800/80 pt-3">
                      <span>Membership Expires:</span>
                      <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                        {formatReadableDate(selectedMember.expiryDate)}
                      </span>
                    </div>

                    {/* Expiry Warning Alert if Expired */}
                    {getMemberStatus(selectedMember.expiryDate) === 'expired' && (
                      <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-3 rounded-lg flex items-start gap-2 text-xs text-rose-800 dark:text-rose-400">
                        <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 text-rose-500 mt-0.5" />
                        <div>
                          <p className="font-bold uppercase tracking-wider text-[10px]">Membership Blocked</p>
                          <p className="mt-0.5">This card has expired. Please renew the membership plan before checking in if possible, or advise member to renew.</p>
                        </div>
                      </div>
                    )}

                    {/* Confirm Buttons */}
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => setSelectedMember(null)}
                        className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCheckIn}
                        className={`flex-2 flex items-center justify-center gap-2 py-2 text-white font-bold rounded-lg text-xs transition-all cursor-pointer ${
                          getMemberStatus(selectedMember.expiryDate) === 'expired'
                            ? 'bg-rose-600 hover:bg-rose-700 shadow-md'
                            : 'bg-emerald-600 hover:bg-emerald-700 shadow-md'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        {getMemberStatus(selectedMember.expiryDate) === 'expired' ? 'Check In Anyway' : 'Confirm Check In'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-50 dark:bg-zinc-950/20 border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center rounded-xl">
                    <Users className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                    <p className="text-zinc-700 dark:text-zinc-300 font-bold text-xs">Ready for Next Member</p>
                    <p className="text-[10px] text-zinc-400 max-w-xs mx-auto mt-1">Search above or scan cards to pull up member details and check-in</p>
                  </div>
                )}
              </div>
            ) : (
              /* QR CODE SCANNER SIMULATOR VIEW */
              <div className="space-y-4">
                <div className="relative w-full h-44 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800/80 flex flex-col justify-center items-center text-center p-4">
                  {/* Glowing camera lens visual */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 text-rose-500 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    <span className="text-[9px] font-black tracking-widest font-mono uppercase">LIVE VIEW CAM_01</span>
                  </div>

                  {/* Active scanning bar */}
                  {isScanning && (
                    <div className="absolute inset-x-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_#10b981] animate-bounce top-0 bottom-0" />
                  )}

                  {/* Dynamic central scanning focus layout */}
                  <div className="relative p-3 border-2 border-indigo-500/45 rounded-lg w-28 h-28 flex items-center justify-center">
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-indigo-500" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-indigo-500" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-indigo-500" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-indigo-500" />
                    
                    {isScanning ? (
                      <QrCode className="w-14 h-14 text-indigo-400 animate-pulse" />
                    ) : scanBeep ? (
                      <div className="text-center">
                        <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto animate-scale" />
                        <span className="text-[10px] font-mono text-emerald-400 font-black tracking-widest block mt-1 animate-ping">BEEP!</span>
                      </div>
                    ) : (
                      <QrCode className="w-12 h-12 text-zinc-600" />
                    )}
                  </div>

                  <p className="text-[10px] text-zinc-500 tracking-wider mt-3 font-mono">
                    {isScanning ? 'DECODING SCANNER STREAM...' : 'SCANNER ACTIVE • READY FOR DIGITAL CARD'}
                  </p>
                </div>

                {/* Simulated Desk Selector */}
                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-150 dark:border-zinc-850 space-y-3">
                  <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Select Member Digital Pass (Simulate Touch Gate Sensor)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={simulatedScanMemberId}
                      onChange={(e) => {
                        const mId = e.target.value;
                        if (mId) {
                          setSimulatedScanMemberId(mId);
                          // Trigger scan
                          setIsScanning(true);
                          setSuccessMsg(null);
                          setErrorMsg(null);
                          setTimeout(() => {
                            setIsScanning(false);
                            setScanBeep(true);
                            setTimeout(() => setScanBeep(false), 600);
                            
                            const res = checkInMember(mId);
                            if (res.success) {
                              setSuccessMsg(res.message);
                              setSimulatedScanMemberId('');
                            } else {
                              setErrorMsg(res.message);
                            }
                          }, 1000);
                        }
                      }}
                      disabled={isScanning}
                      className="flex-1 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 font-bold focus:outline-hidden cursor-pointer"
                    >
                      <option value="">-- Present Pass to Scanner --</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Error notifications */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 text-xs font-semibold rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-500 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Success notifications */}
            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                {successMsg}
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Attendance Logs Feed (col-span-6) */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col h-[460px]">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4 flex-shrink-0 gap-3">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Attendance Logs</h3>
              <p className="text-[10px] text-zinc-400">Total volume for filtered range: <strong className="text-zinc-800 dark:text-zinc-200">{filteredAttendance.length}</strong></p>
            </div>
            
            {/* Range Filters */}
            <div className="flex gap-1 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-1 rounded-lg">
              {(['today', 'yesterday', 'week', 'month'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setHistoryFilter(range)}
                  className={`px-2 py-1 rounded text-[10px] font-extrabold capitalize transition-colors cursor-pointer ${
                    historyFilter === range
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                >
                  {range === 'week' ? 'this week' : range === 'month' ? 'this month' : range}
                </button>
              ))}
            </div>
          </div>

          {/* List scrollable */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredAttendance.length > 0 ? (
              filteredAttendance.map(att => {
                const relativeMember = members.find(m => m.id === att.memberId);
                return (
                  <div
                    key={att.id}
                    className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/80 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 rounded-lg">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{att.memberName}</p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{att.memberId} • Checked in on {formatReadableDate(att.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">{att.checkInTime}</p>
                        <span className={`text-[9px] font-bold ${statusConfig[att.status].text}`}>
                          {statusConfig[att.status].label}
                        </span>
                      </div>
                      <button
                        onClick={() => relativeMember && setProfileMember(relativeMember)}
                        className="p-1 border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 rounded text-zinc-500 dark:text-zinc-400 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 py-10">
                <Users className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mb-2" />
                <p className="text-xs italic">No check-in logs found for this period.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* --- SELECTED MEMBER PROFILE --- */}
      {profileMember && (
        <MemberProfileModal 
          member={profileMember}
          onClose={() => setProfileMember(null)}
        />
      )}

    </div>
  );
};
