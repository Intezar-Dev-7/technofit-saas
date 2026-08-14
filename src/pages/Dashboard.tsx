import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { getMemberStatus, getDaysRemaining, formatINR } from '../utils/helpers';
import { Member, PaymentRecord } from '../types';
import { 
  Users, CheckCircle, AlertTriangle, IndianRupee, ArrowRight, 
  Calendar, RefreshCw, Eye, Sparkles 
} from 'lucide-react';
import { MemberProfileModal } from '../components/MemberProfileModal';
import { RenewModal } from '../components/RenewModal';

export const Dashboard: React.FC<{ onViewChange: (view: 'members' | 'attendance' | 'payments' | 'renewals') => void }> = ({ onViewChange }) => {
  const { members, attendance, payments, getStats, plans } = useGym();
  const stats = getStats();

  // Local state for modals opened from dashboard
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [renewMember, setRenewMember] = useState<Member | null>(null);

  // Today is simulated as August 14, 2026
  const todayStr = '2026-08-14';

  // 1. Recent Attendance (Today's check-ins)
  const todayCheckIns = attendance.filter(a => a.date === todayStr);

  // 2. Memberships Expiring Soon (status === 'expiring' or 'expired')
  const expiringMembers = members
    .filter(m => {
      const status = getMemberStatus(m.expiryDate);
      return status === 'expiring' || status === 'expired';
    })
    .map(m => ({
      member: m,
      days: getDaysRemaining(m.expiryDate)
    }))
    // Sort so expired are at the top, then closest to expiring
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  // 3. Recent Payments (Latest 5 payments globally)
  const recentPayments = payments.slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            Dashboard
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time operations center for Technofit, Goa • Simulated local date: 14 Aug 2026
          </p>
        </div>
      </div>

      {/* 4 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        
        {/* Stat 1: Total Active Members */}
        <div 
          onClick={() => onViewChange('members')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Members</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {stats.totalActiveMembers}
              </p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 mt-4">
            <span>Manage database</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Stat 2: Today's Attendance */}
        <div 
          onClick={() => onViewChange('attendance')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Today's Attendance</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {stats.todayAttendance}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 mt-4">
            <span>Fast desk check-in</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Stat 3: Expiring Soon */}
        <div 
          onClick={() => onViewChange('renewals')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Expiring Soon</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {stats.expiringSoon}
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 mt-4">
            <span>WhatsApp reminders</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Stat 4: Today's Payments */}
        <div 
          onClick={() => onViewChange('payments')}
          className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Today's Collections</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1.5 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {formatINR(stats.todayPayments)}
              </p>
            </div>
            <div className="p-3 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 rounded-lg">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 mt-4">
            <span>Payment ledger</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Attendance Feed (col-span-5) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col h-[400px]">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4 flex-shrink-0">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Recent Attendance Feed</h3>
              <p className="text-[10px] text-zinc-400">Members checked-in today</p>
            </div>
            <button 
              onClick={() => onViewChange('attendance')}
              className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold cursor-pointer"
            >
              Check In Screen
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {todayCheckIns.length > 0 ? (
              todayCheckIns.map(att => {
                const relativeMember = members.find(m => m.id === att.memberId);
                return (
                  <div 
                    key={att.id}
                    onClick={() => relativeMember && setSelectedMember(relativeMember)}
                    className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/60 hover:border-indigo-200 dark:hover:border-zinc-700 hover:bg-zinc-100/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {att.memberName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{att.memberName}</p>
                        <p className="text-[10px] text-zinc-400">Member ID: {att.memberId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{att.checkInTime}</p>
                      <span className={`text-[9px] font-semibold uppercase ${
                        att.status === 'active' ? 'text-emerald-500' :
                        att.status === 'expiring' ? 'text-amber-500' :
                        'text-rose-500'
                      }`}>
                        {att.status === 'active' ? '🟢 Active' : att.status === 'expiring' ? '🟠 Expiring' : '🔴 Expired'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 dark:text-zinc-500 p-4">
                <Calendar className="w-10 h-10 text-zinc-300 mb-2" />
                <p className="text-xs italic">No check-ins recorded for today yet.</p>
                <p className="text-[10px] text-zinc-400 mt-1">Open the Check In screen to start marking attendance.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Expiring Members and Payments (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Memberships Expiring Soon / Expired */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col h-[230px]">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800 mb-3 flex-shrink-0">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Memberships Expiring Soon</h3>
                <p className="text-[10px] text-zinc-400">Urgent renewal follow-ups</p>
              </div>
              <button 
                onClick={() => onViewChange('renewals')}
                className="text-xs text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 font-semibold cursor-pointer"
              >
                Renewals Dashboard
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {expiringMembers.length > 0 ? (
                expiringMembers.map(({ member, days }) => {
                  const mPlan = plans.find(p => p.id === member.planId);
                  return (
                    <div 
                      key={member.id}
                      className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60"
                    >
                      <div>
                        <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{member.name}</span>
                        <p className="text-[10px] text-zinc-500">{mPlan?.name} • {member.phone}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                          days < 0 ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' : 
                          days === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40' :
                          'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                        }`}>
                          {days < 0 ? `Expired ${Math.abs(days)}d ago` : days === 0 ? 'Expires today' : `Expires in ${days} days`}
                        </span>
                        
                        {/* Quick Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedMember(member)}
                            title="View Profile"
                            className="p-1 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRenewMember(member)}
                            title="Renew Membership"
                            className="p-1 bg-orange-50 dark:bg-orange-950/20 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-950/40 border border-orange-100 dark:border-orange-900/20 rounded cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-zinc-400 italic text-center py-6">No expiring or expired memberships detected.</p>
              )}
            </div>
          </div>

          {/* Recent Payments Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col h-[230px]">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800 mb-3 flex-shrink-0">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Recent Collections</h3>
                <p className="text-[10px] text-zinc-400">Latest payment audit records</p>
              </div>
              <button 
                onClick={() => onViewChange('payments')}
                className="text-xs text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-semibold cursor-pointer"
              >
                Full Ledger
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {recentPayments.length > 0 ? (
                recentPayments.map(pay => (
                  <div 
                    key={pay.id}
                    className="flex justify-between items-center text-xs bg-zinc-50 dark:bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60"
                  >
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">{pay.memberName}</p>
                      <p className="text-[9px] text-zinc-400">{pay.planName} • {pay.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-zinc-900 dark:text-white text-xs">{formatINR(pay.amount)}</span>
                      <p className="text-[8px] font-mono text-zinc-400 mt-0.5">{pay.id}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400 italic text-center py-6">No payment transactions recorded.</p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* --- RENDER MODALS --- */}
      {selectedMember && (
        <MemberProfileModal 
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdate={() => {
            // Keep state in sync on operations
          }}
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
