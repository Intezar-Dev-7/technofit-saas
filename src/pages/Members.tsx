import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { getMemberStatus, formatReadableDate } from '../utils/helpers';
import { Member, MemberStatus } from '../types';
import { 
  Search, Filter, Eye, Edit2, RefreshCw, UserCheck, 
  Trash2, Phone, Calendar, Dumbbell, ShieldAlert, X, UserPlus, CheckCircle, CreditCard
} from 'lucide-react';
import { MemberFormModal } from '../components/MemberFormModal';
import { MemberProfileModal } from '../components/MemberProfileModal';
import { RenewModal } from '../components/RenewModal';

export const Members: React.FC = () => {
  const { members, plans, deleteMember, checkInMember } = useGym();
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');

  // Modal triggers
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [renewMember, setRenewMember] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // Success Options modal states
  const [successMemberOptions, setSuccessMemberOptions] = useState<Member | null>(null);
  const [successModalMessage, setSuccessModalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Success alert states
  const [alert, setAlert] = useState<string | null>(null);

  // Action helpers
  const triggerAlert = (message: string) => {
    setAlert(message);
    setTimeout(() => setAlert(null), 4000);
  };

  const handleDelete = (member: Member) => {
    if (window.confirm(`Are you sure you want to delete ${member.name} (${member.id})? This is irreversible.`)) {
      deleteMember(member.id);
      triggerAlert(`${member.name}'s account has been successfully deleted.`);
    }
  };

  // Filter and search computation
  const filteredMembers = members.filter(m => {
    const status = getMemberStatus(m.expiryDate);
    
    // Status Filter
    if (filter !== 'all' && status !== filter) {
      return false;
    }

    // Text Search (Name, Phone, ID)
    const matchesSearch = 
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.id.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  // Get status indicators
  const getBadgeClass = (status: MemberStatus) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'expiring':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'expired':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
      case 'frozen':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Gym Members</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Registered gym goers profile catalog and scheduling directory
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer w-full sm:w-auto transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <UserPlus className="w-4 h-4" />
          + Add Member
        </button>
      </div>

      {/* Success alert notifications */}
      {alert && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-xs font-semibold rounded-lg">
          {alert}
        </div>
      )}

      {members.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900/20">
            <UserPlus className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-base font-black text-zinc-900 dark:text-white">No members yet</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Add your first Technofit member to get started with profile cataloging, attendance tracking, and dues management.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-6 flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer mx-auto transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-4 h-4" />
            + Add Member
          </button>
        </div>
      ) : (
        <>
          {/* Search & Filters Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Name, Phone, or Member ID..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filters Selectors */}
            <div className="flex gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {(['all', 'active', 'expiring', 'expired'] as const).map((mode) => {
                const count = members.filter(m => mode === 'all' || getMemberStatus(m.expiryDate) === mode).length;
                return (
                  <button
                    key={mode}
                    onClick={() => setFilter(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                      filter === mode 
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700'
                    }`}
                  >
                    {mode === 'all' ? 'All' : mode === 'active' ? '🟢 Active' : mode === 'expiring' ? '🟠 Expiring' : '🔴 Expired'}
                    <span className="ml-1.5 opacity-60 text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Members Feed Grid */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            
            {filteredMembers.length > 0 ? (
              <>
                {/* DESKTOP TABLE VIEW */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full min-w-[950px] text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950/40 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800/80">
                    <th className="px-6 py-3.5">Member</th>
                    <th className="px-6 py-3.5">Phone</th>
                    <th className="px-6 py-3.5">Membership</th>
                    <th className="px-6 py-3.5">Start Date</th>
                    <th className="px-6 py-3.5">Expiry Date</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-sm">
                  {filteredMembers.map((m) => {
                    const status = getMemberStatus(m.expiryDate);
                    const plan = plans.find(p => p.id === m.planId);
                    
                    return (
                      <tr 
                        key={m.id}
                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors cursor-pointer group"
                        onClick={() => setSelectedMember(m)}
                      >
                        {/* Member Card cell */}
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            {m.profilePhoto ? (
                              <img 
                                src={m.profilePhoto} 
                                alt={m.name} 
                                referrerPolicy="no-referrer"
                                className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-100 dark:border-indigo-900/10">
                                {m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-zinc-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{m.name}</p>
                              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{m.id}</p>
                            </div>
                          </div>
                        </td>
                        
                        {/* Phone */}
                        <td className="px-6 py-3.5 font-medium text-zinc-600 dark:text-zinc-400">
                          {m.phone}
                        </td>
                        
                        {/* Membership */}
                        <td className="px-6 py-3.5">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-300 block">{plan?.name || 'No Plan'}</span>
                          <span className="text-[10px] text-zinc-400 mt-0.5">₹{plan?.price || 0}</span>
                        </td>
                        
                        {/* Dates */}
                        <td className="px-6 py-3.5 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                          {formatReadableDate(m.startDate)}
                        </td>
                        <td className="px-6 py-3.5 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                          {formatReadableDate(m.expiryDate)}
                        </td>
                        
                        {/* Status badge */}
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getBadgeClass(status)}`}>
                            {status === 'active' ? '🟢 Active' : status === 'expiring' ? '🟠 Expiring' : '🔴 Expired'}
                          </span>
                        </td>
                        
                        {/* Actions block */}
                        <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setSelectedMember(m)}
                              title="View Member Details"
                              className="p-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditMember(m)}
                              title="Edit Member"
                              className="p-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setRenewMember(m)}
                              title="Renew Plan"
                              className="p-1.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-950/40 border border-orange-100 dark:border-orange-900/20 rounded cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(m)}
                              title="Delete Member"
                              className="p-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS VIEW */}
            <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
              {filteredMembers.map((m) => {
                const status = getMemberStatus(m.expiryDate);
                const plan = plans.find(p => p.id === m.planId);
                
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    className="bg-white dark:bg-zinc-950/20 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs cursor-pointer hover:border-indigo-300 dark:hover:border-zinc-700"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-100 dark:border-indigo-900/10">
                          {m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 dark:text-white">{m.name}</h4>
                          <span className="text-[10px] text-zinc-400 font-mono">{m.id}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeClass(status)}`}>
                        {status === 'active' ? 'Active' : status === 'expiring' ? 'Expiring' : 'Expired'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/80">
                      <div>
                        <span className="text-[9px] text-zinc-400 block uppercase font-semibold">Phone</span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{m.phone}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 block uppercase font-semibold">Membership Plan</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block">{plan?.name}</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-[9px] text-zinc-400 block uppercase font-semibold">Start Date</span>
                        <span className="font-medium">{formatReadableDate(m.startDate)}</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-[9px] text-zinc-400 block uppercase font-semibold">Expiry Date</span>
                        <span className="font-medium">{formatReadableDate(m.expiryDate)}</span>
                      </div>
                    </div>

                    {/* Touch-Friendly Action Buttons */}
                    <div className="flex items-center gap-1.5 pt-1 justify-end" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedMember(m)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                      <button
                        onClick={() => setEditMember(m)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setRenewMember(m)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-950/40 border border-orange-100 dark:border-orange-900/20 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Renew
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-12 px-4">
            <Search className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-800 dark:text-zinc-200 font-bold">No members found</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              No registration logs matched your query "<strong>{search}</strong>" with filter <strong>{filter}</strong>. Clear filters or add a new record.
            </p>
            {search && (
              <button 
                onClick={() => { setSearch(''); setFilter('all'); }} 
                className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        )}

      </div>
      </>
      )}

      {/* --- RENDER MODAL LAYERS --- */}

      {/* 1. Add Member Modal */}
      {showAddModal && (
        <MemberFormModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={(newM) => {
            setShowAddModal(false);
            setSuccessMemberOptions(newM);
          }}
        />
      )}

      {/* Post-Registration Success Options Modal */}
      {successMemberOptions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800 p-6 space-y-6 animate-scale-up">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-100 dark:border-emerald-900/30">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Member Created Successfully</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                <strong className="text-zinc-800 dark:text-zinc-200">{successMemberOptions.name}</strong> has been added as member <strong className="text-zinc-800 dark:text-zinc-200">{successMemberOptions.id}</strong>.
              </p>
            </div>

            {/* Mini Summary Card */}
            <div className="bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-lg border border-zinc-150 dark:border-zinc-800/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400 font-semibold">Membership Plan:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {plans.find(p => p.id === successMemberOptions.planId)?.name || 'Unknown Plan'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 font-semibold">Expiry Date:</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200">{formatReadableDate(successMemberOptions.expiryDate)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-150/60 dark:border-zinc-800/40">
                <span className="text-zinc-400 font-semibold">Outstanding Balance:</span>
                <span className={`font-black ${successMemberOptions.outstandingBalance && successMemberOptions.outstandingBalance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  ₹{(successMemberOptions.outstandingBalance || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Live Beep / Check-In Notification Frame */}
            {successModalMessage && (
              <div className={`p-3 rounded-lg border text-xs font-semibold text-center ${
                successModalMessage.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400'
              }`}>
                {successModalMessage.text}
              </div>
            )}

            {/* Actions list */}
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSelectedMember(successMemberOptions);
                    setSuccessMemberOptions(null);
                    setSuccessModalMessage(null);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Member
                </button>
                
                <button
                  onClick={() => {
                    setSelectedMember(successMemberOptions);
                    setSuccessMemberOptions(null);
                    setSuccessModalMessage(null);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-indigo-50 dark:bg-indigo-950/25 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-900/20 cursor-pointer shadow-xs"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Record Payment
                </button>
              </div>

              <button
                onClick={() => {
                  const res = checkInMember(successMemberOptions.id);
                  if (res.success) {
                    setSuccessModalMessage({ type: 'success', text: `BEEP! ${res.message}` });
                  } else {
                    setSuccessModalMessage({ type: 'error', text: res.message });
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-md"
              >
                <UserCheck className="w-4 h-4" />
                Check In Member
              </button>

              <button
                onClick={() => {
                  setSuccessMemberOptions(null);
                  setSuccessModalMessage(null);
                }}
                className="w-full py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Member Modal */}
      {editMember && (
        <MemberFormModal 
          member={editMember}
          onClose={() => setEditMember(null)}
          onSuccess={(saved) => {
            setEditMember(null);
            triggerAlert(`${saved.name}'s profile has been updated.`);
          }}
        />
      )}

      {/* 3. Renew Member Modal */}
      {renewMember && (
        <RenewModal 
          member={renewMember}
          onClose={() => setRenewMember(null)}
          onSuccess={() => {
            setRenewMember(null);
            triggerAlert(`${renewMember.name}'s membership has been renewed successfully!`);
          }}
        />
      )}

      {/* 4. Selected Profile View Modal */}
      {selectedMember && (
        <MemberProfileModal 
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdate={() => {
            // Keep state synchronized
          }}
        />
      )}

    </div>
  );
};
