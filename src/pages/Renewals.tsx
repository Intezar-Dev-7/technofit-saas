import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { getMemberStatus, getDaysRemaining, getWhatsAppLink, formatReadableDate } from '../utils/helpers';
import { Member } from '../types';
import { 
  AlertTriangle, Clock, RefreshCw, Eye, Phone, MessageSquare, 
  Search, ShieldAlert, ArrowRight, Sparkles, Calendar 
} from 'lucide-react';
import { MemberProfileModal } from '../components/MemberProfileModal';
import { RenewModal } from '../components/RenewModal';

export const Renewals: React.FC = () => {
  const { members, plans } = useGym();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'expired' | 'today' | '3days' | '7days' | '30days'>('expired');

  // Modals state
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [renewMember, setRenewMember] = useState<Member | null>(null);

  // Group members into expiration buckets
  const categorizeMember = (m: Member) => {
    const days = getDaysRemaining(m.expiryDate);
    if (days < 0) return 'expired';
    if (days === 0) return 'today';
    if (days > 0 && days <= 3) return '3days';
    if (days > 3 && days <= 7) return '7days';
    if (days > 7 && days <= 30) return '30days';
    return 'other';
  };

  // Filter members based on bucket and optional text search
  const getCategorizedMembers = (bucket: 'expired' | 'today' | '3days' | '7days' | '30days') => {
    return members.filter(m => {
      const mBucket = categorizeMember(m);
      if (mBucket !== bucket) return false;

      // Text search matching
      if (search.trim()) {
        const query = search.toLowerCase();
        return (
          m.name.toLowerCase().includes(query) ||
          m.phone.includes(query) ||
          m.id.toLowerCase().includes(query)
        );
      }
      return true;
    });
  };

  const activeCategoryMembers = getCategorizedMembers(activeTab);

  // Expiration counts for tab badges
  const counts = {
    expired: getCategorizedMembers('expired').length,
    today: getCategorizedMembers('today').length,
    '3days': getCategorizedMembers('3days').length,
    '7days': getCategorizedMembers('7days').length,
    '30days': getCategorizedMembers('30days').length,
  };

  const statusTabConfig = {
    expired: { border: 'border-rose-100', text: 'text-rose-600', bg: 'bg-rose-50/50', label: 'Expired' },
    today: { border: 'border-amber-200', text: 'text-amber-700', bg: 'bg-amber-100/60', label: 'Expires Today' },
    '3days': { border: 'border-amber-100', text: 'text-amber-600', bg: 'bg-amber-50/50', label: 'Expires in 3 Days' },
    '7days': { border: 'border-zinc-100', text: 'text-zinc-600', bg: 'bg-zinc-50/50', label: 'Expires in 7 Days' },
    '30days': { border: 'border-indigo-100', text: 'text-indigo-600', bg: 'bg-indigo-50/50', label: 'Expires in 30 Days' },
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Retention & Renewals</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Follow up with lapsed memberships and trigger pre-composed renewal reminders
        </p>
      </div>

      {/* Grid: Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Stat cards */}
        <div onClick={() => setActiveTab('expired')} className={`bg-white dark:bg-zinc-900 p-4 rounded-xl border transition-all cursor-pointer ${activeTab === 'expired' ? 'border-rose-500 ring-1 ring-rose-500/10' : 'border-zinc-200 dark:border-zinc-850 hover:border-rose-300'}`}>
          <div className="flex justify-between items-center text-[10px] text-rose-500 font-extrabold uppercase tracking-wider">
            <span>Expired</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-zinc-900 dark:text-white mt-1.5">{counts.expired} members</p>
        </div>

        <div onClick={() => setActiveTab('today')} className={`bg-white dark:bg-zinc-900 p-4 rounded-xl border transition-all cursor-pointer ${activeTab === 'today' ? 'border-amber-500 ring-1 ring-amber-500/10' : 'border-zinc-200 dark:border-zinc-850 hover:border-amber-400'}`}>
          <div className="flex justify-between items-center text-[10px] text-amber-600 font-extrabold uppercase tracking-wider">
            <span>Expires Today</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-zinc-900 dark:text-white mt-1.5">{counts.today} members</p>
        </div>

        <div onClick={() => setActiveTab('3days')} className={`bg-white dark:bg-zinc-900 p-4 rounded-xl border transition-all cursor-pointer ${activeTab === '3days' ? 'border-amber-400 ring-1 ring-amber-400/10' : 'border-zinc-200 dark:border-zinc-850 hover:border-amber-300'}`}>
          <div className="flex justify-between items-center text-[10px] text-amber-500 font-extrabold uppercase tracking-wider">
            <span>Expires 3 Days</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-zinc-900 dark:text-white mt-1.5">{counts['3days']} members</p>
        </div>

        <div onClick={() => setActiveTab('7days')} className={`bg-white dark:bg-zinc-900 p-4 rounded-xl border transition-all cursor-pointer ${activeTab === '7days' ? 'border-zinc-500 ring-1 ring-zinc-500/10' : 'border-zinc-200 dark:border-zinc-850 hover:border-zinc-400'}`}>
          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">
            <span>Expires 7 Days</span>
            <Calendar className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-zinc-900 dark:text-white mt-1.5">{counts['7days']} members</p>
        </div>

        <div onClick={() => setActiveTab('30days')} className={`bg-white dark:bg-zinc-900 p-4 rounded-xl border transition-all cursor-pointer ${activeTab === '30days' ? 'border-indigo-500 ring-1 ring-indigo-500/10' : 'border-zinc-200 dark:border-zinc-850 hover:border-indigo-400'}`}>
          <div className="flex justify-between items-center text-[10px] text-indigo-500 font-extrabold uppercase tracking-wider">
            <span>Expires 30 Days</span>
            <Calendar className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-zinc-900 dark:text-white mt-1.5">{counts['30days']} members</p>
        </div>
      </div>

      {/* Control row */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search renewal list..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {(['expired', 'today', '3days', '7days', '30days'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent'
              }`}
            >
              {tab === 'expired' ? 'Lapsed 🔴' : tab === 'today' ? 'Today ⚡' : tab === '3days' ? '3 Days ⏳' : tab === '7days' ? '7 Days 📅' : '30 Days 📅'}
              <span className="ml-1 opacity-60">({counts[tab]})</span>
            </button>
          ))}
        </div>

      </div>

      {/* Listing Cards / Spreadsheet */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        
        {activeCategoryMembers.length > 0 ? (
          <>
            {/* DESKTOP VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[950px] text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950/40 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800/80">
                    <th className="px-6 py-3.5">Member Details</th>
                    <th className="px-6 py-3.5">Current Plan</th>
                    <th className="px-6 py-3.5">Expiry Date</th>
                    <th className="px-6 py-3.5">Time Period Status</th>
                    <th className="px-6 py-3.5 text-right">Outreach Follow-Up Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-sm">
                  {activeCategoryMembers.map((m) => {
                    const plan = plans.find(p => p.id === m.planId);
                    const days = getDaysRemaining(m.expiryDate);
                    
                    return (
                      <tr key={m.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                              {m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-zinc-950 dark:text-white">{m.name}</p>
                              <p className="text-[10px] text-zinc-400">{m.phone} • ID: {m.id}</p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-3.5">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-300 block">{plan?.name}</span>
                          <span className="text-[10px] text-zinc-400 mt-0.5">₹{plan?.price}</span>
                        </td>

                        <td className="px-6 py-3.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                          {formatReadableDate(m.expiryDate)}
                        </td>

                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-bold ${
                            days < 0 ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/25' : 
                            days === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40' :
                            days <= 3 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/25' :
                            days <= 7 ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/40' :
                            'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/25'
                          }`}>
                            {days < 0 ? `Lapsed ${Math.abs(days)} days` : days === 0 ? 'Expires today!' : `Expires in ${days} days`}
                          </span>
                        </td>

                        <td className="px-6 py-3.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            {/* Profile View */}
                            <button
                              onClick={() => setSelectedMember(m)}
                              title="View Profile Details"
                              className="p-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded text-zinc-600 dark:text-zinc-400 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick Phone Call */}
                            <a
                              href={`tel:${m.phone}`}
                              title={`Call ${m.name}`}
                              className="p-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded text-indigo-600 dark:text-indigo-400 cursor-pointer"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>

                            {/* Quick WhatsApp Remind */}
                            <a
                              href={getWhatsAppLink(m.phone, m.name, m.expiryDate, days)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Send WhatsApp Reminder"
                              className="p-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 rounded cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>

                            {/* Renew Membership */}
                            <button
                              onClick={() => setRenewMember(m)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-sm cursor-pointer transition-colors"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Renew
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE TILES VIEW */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {activeCategoryMembers.map((m) => {
                const plan = plans.find(p => p.id === m.planId);
                const days = getDaysRemaining(m.expiryDate);
                
                return (
                  <div 
                    key={m.id} 
                    className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-800/80 p-4 rounded-xl space-y-3 shadow-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                          {m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{m.name}</h4>
                          <p className="text-[10px] text-zinc-400">ID: {m.id} • {m.phone}</p>
                        </div>
                      </div>
                      
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        days < 0 ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/25' : 
                        days === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40' :
                        days <= 3 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/25' :
                        days <= 7 ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/40' :
                        'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/25'
                      }`}>
                        {days < 0 ? `${Math.abs(days)}d Lapsed` : days === 0 ? 'Today' : `${days}d left`}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-150/50 dark:border-zinc-800/40 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-semibold block">Active Membership</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{plan?.name || 'Unknown Plan'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 font-semibold block">Expiry Date</span>
                        <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatReadableDate(m.expiryDate)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => setSelectedMember(m)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <a
                        href={`tel:${m.phone}`}
                        className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400 rounded-lg"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={getWhatsAppLink(m.phone, m.name, m.expiryDate, days)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => setRenewMember(m)}
                        className="flex-[1.5] flex items-center justify-center gap-1.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-xs"
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
            <Sparkles className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-800 dark:text-zinc-200 font-bold">No outreach targets found</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              No members are currently listed under <strong>{statusTabConfig[activeTab].label}</strong> matching search criteria.
            </p>
          </div>
        )}

      </div>

      {/* --- MODAL LAYERS --- */}
      {selectedMember && (
        <MemberProfileModal 
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {renewMember && (
        <RenewModal 
          member={renewMember}
          onClose={() => setRenewMember(null)}
          onSuccess={() => {
            setRenewMember(null);
          }}
        />
      )}

    </div>
  );
};
