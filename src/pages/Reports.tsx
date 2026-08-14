import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { formatINR, formatReadableDate, getDaysRemaining } from '../utils/helpers';
import { 
  TrendingUp, Users, Calendar, CreditCard, AlertCircle, 
  DollarSign, CheckCircle2, ShoppingBag, BarChart3, PieChart
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { members, plans, attendance, payments } = useGym();
  const [activeReportTab, setActiveReportTab] = useState<'today' | 'monthly' | 'payments' | 'attendance' | 'plans'>('today');

  const todayStr = '2026-08-14';

  // --- COMPUTE STATISTICS ---
  // Today's Stats
  const todayRegs = members.filter(m => m.createdAt && m.createdAt.startsWith(todayStr)).length;
  const todayCheckIns = attendance.filter(a => a.date === todayStr).length;
  const todayRevenue = payments.filter(p => p.date === todayStr).reduce((sum, p) => sum + p.amount, 0);
  const todayExpires = members.filter(m => m.expiryDate === todayStr).length;

  // Monthly Stats (Assume August 2026)
  const monthlyRegs = members.filter(m => m.createdAt && m.createdAt.includes('2026-08')).length;
  const monthlyCheckIns = attendance.filter(a => a.date && a.date.includes('2026-08')).length;
  const monthlyRevenue = payments.filter(p => p.date && p.date.includes('2026-08')).reduce((sum, p) => sum + p.amount, 0);

  // Payments & Outstanding balances
  const totalOutstanding = members.reduce((sum, m) => sum + (m.outstandingBalance || 0), 0);
  const membersWithOutstanding = members.filter(m => (m.outstandingBalance || 0) > 0);
  const totalPaymentsCount = payments.length;
  const totalRevenueAllTime = payments.reduce((sum, p) => sum + p.amount, 0);

  // Payment methods summary
  const paymentMethodsCounts: Record<string, number> = {};
  payments.forEach(p => {
    paymentMethodsCounts[p.paymentMethod] = (paymentMethodsCounts[p.paymentMethod] || 0) + p.amount;
  });

  // Attendance summary
  // Group attendance by date for the last 7 available days
  const attendanceByDate: Record<string, number> = {};
  attendance.forEach(a => {
    attendanceByDate[a.date] = (attendanceByDate[a.date] || 0) + 1;
  });
  // Sort dates
  const sortedAttendanceDates = Object.keys(attendanceByDate).sort().slice(-7);

  // Popular plans summary
  const planDistribution: Record<string, { name: string; count: number; revenue: number }> = {};
  plans.forEach(p => {
    planDistribution[p.id] = { name: p.name, count: 0, revenue: 0 };
  });
  members.forEach(m => {
    if (planDistribution[m.planId]) {
      planDistribution[m.planId].count += 1;
    }
  });
  payments.forEach(p => {
    if (planDistribution[p.planId]) {
      planDistribution[p.planId].revenue += p.amount;
    }
  });

  const popularPlans = Object.values(planDistribution).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Business Reports</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Real-time summary of front-desk check-ins, payment logs, and membership metrics
        </p>
      </div>

      {/* Primary Report Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveReportTab('today')}
          className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer border-b-2 whitespace-nowrap ${
            activeReportTab === 'today'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Today's Overview
        </button>
        <button
          onClick={() => setActiveReportTab('monthly')}
          className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer border-b-2 whitespace-nowrap ${
            activeReportTab === 'monthly'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Monthly Overview
        </button>
        <button
          onClick={() => setActiveReportTab('payments')}
          className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer border-b-2 whitespace-nowrap ${
            activeReportTab === 'payments'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Payments & Balances
        </button>
        <button
          onClick={() => setActiveReportTab('attendance')}
          className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer border-b-2 whitespace-nowrap ${
            activeReportTab === 'attendance'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Attendance Insights
        </button>
        <button
          onClick={() => setActiveReportTab('plans')}
          className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer border-b-2 whitespace-nowrap ${
            activeReportTab === 'plans'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Membership Metrics
        </button>
      </div>

      {/* VIEW PANEL ROUTER */}
      {activeReportTab === 'today' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">Today's Revenue</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{formatINR(todayRevenue)}</p>
              <span className="text-[10px] text-zinc-400 block mt-1">From daily receipts</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">Today's Check-ins</span>
              <p className="text-2xl font-black text-zinc-900 dark:text-white mt-2">{todayCheckIns}</p>
              <span className="text-[10px] text-emerald-500 font-bold block mt-1">Active entries today</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">New Registrations</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{todayRegs}</p>
              <span className="text-[10px] text-zinc-400 block mt-1">Added to system today</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">Expired Today</span>
              <p className={`text-2xl font-black mt-2 ${todayExpires > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-white'}`}>{todayExpires}</p>
              <span className="text-[10px] text-zinc-400 block mt-1">Require immediate renewal</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Today's Ledger Actions</h3>
            {payments.filter(p => p.date === todayStr).length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {payments.filter(p => p.date === todayStr).map(p => (
                  <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white">{p.memberName}</p>
                      <p className="text-[10px] text-zinc-400">{p.planName} • {p.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-600 dark:text-emerald-400">+{formatINR(p.amount)}</p>
                      <p className="text-[9px] text-zinc-400 font-mono">{p.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-400 text-xs py-4 text-center">No transactions recorded today yet.</p>
            )}
          </div>
        </div>
      )}

      {activeReportTab === 'monthly' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">Monthly Gross Income (August)</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{formatINR(monthlyRevenue)}</p>
              <span className="text-[10px] text-zinc-400 block mt-1">Total revenue collected this month</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">Monthly Registrations</span>
              <p className="text-2xl font-black text-zinc-900 dark:text-white mt-2">{monthlyRegs} members</p>
              <span className="text-[10px] text-zinc-400 block mt-1">New profiles registered in August</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">Total Gym Check-ins</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{monthlyCheckIns}</p>
              <span className="text-[10px] text-zinc-400 block mt-1">Monthly front-desk traffic logs</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Monthly Financial Performance Trend</h3>
            {/* Elegant SVG bar chart for daily revenue in August */}
            <div className="h-64 flex items-end justify-between gap-2 pt-6 px-4">
              {[10, 11, 12, 13, 14].map(day => {
                const dateStr = `2026-08-${day}`;
                const dailyRev = payments.filter(p => p.date === dateStr).reduce((sum, p) => sum + p.amount, 0);
                const maxVal = Math.max(...[10, 11, 12, 13, 14].map(d => payments.filter(p => p.date === `2026-08-${d}`).reduce((sum, p) => sum + p.amount, 0))) || 1;
                const heightPct = (dailyRev / maxVal) * 100;

                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{dailyRev}
                    </div>
                    <div 
                      style={{ height: `${Math.max(10, heightPct)}%` }}
                      className="w-full bg-indigo-500/85 hover:bg-indigo-600 dark:bg-indigo-600/85 dark:hover:bg-indigo-500 rounded-t-xs transition-all cursor-pointer relative"
                    />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      {day} Aug
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'payments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">Total Gross Revenue</span>
              <p className="text-2xl font-black text-zinc-900 dark:text-white mt-2">{formatINR(totalRevenueAllTime)}</p>
              <span className="text-[10px] text-zinc-400 block mt-1">From all recorded receipts</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 block">Total Outstanding Balances</span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">{formatINR(totalOutstanding)}</p>
              <span className="text-[10px] text-zinc-400 block mt-1">To be collected from members</span>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500 block">Outstanding Members</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{membersWithOutstanding.length} members</p>
              <span className="text-[10px] text-zinc-400 block mt-1">With partial payment balances</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4">Payment Methods split</h3>
              <div className="space-y-3">
                {Object.entries(paymentMethodsCounts).map(([method, amount]) => {
                  const maxAmount = Math.max(...Object.values(paymentMethodsCounts)) || 1;
                  const pct = (amount / maxAmount) * 100;
                  return (
                    <div key={method} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-zinc-850 dark:text-zinc-200">
                        <span>{method}</span>
                        <span>{formatINR(amount)}</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${pct}%` }}
                          className="bg-indigo-600 h-full rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-rose-500 mb-4">Lapsed Balances list</h3>
              {membersWithOutstanding.length > 0 ? (
                <div className="max-h-56 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {membersWithOutstanding.map(m => (
                    <div key={m.id} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">{m.name}</p>
                        <p className="text-[10px] text-zinc-400">Phone: {m.phone}</p>
                      </div>
                      <p className="font-black text-rose-600 dark:text-rose-400">{formatINR(m.outstandingBalance || 0)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400 text-xs py-4 text-center">Perfect score! No outstanding balances.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Daily Attendance logs trend</h3>
            {/* SVG line chart for Daily Attendance Trend */}
            <div className="h-64 flex items-end justify-between gap-4 pt-6 px-4">
              {sortedAttendanceDates.map((date, index) => {
                const count = attendanceByDate[date] || 0;
                const maxAttendance = Math.max(...Object.values(attendanceByDate)) || 1;
                const pctHeight = (count / maxAttendance) * 100;
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="text-[10px] font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {count} entries
                    </div>
                    <div 
                      style={{ height: `${Math.max(12, pctHeight)}%` }}
                      className="w-8 bg-emerald-500/80 hover:bg-emerald-600 rounded-t-xs transition-all relative"
                    />
                    <span className="text-[10px] font-bold text-zinc-500 font-mono">
                      {date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'plans' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Popularity Index by Pricing Plan</h3>
            <div className="space-y-4">
              {popularPlans.map(plan => {
                const maxPlanMembers = Math.max(...popularPlans.map(p => p.count)) || 1;
                const pct = (plan.count / maxPlanMembers) * 100;
                return (
                  <div key={plan.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-zinc-900 dark:text-zinc-200">
                      <span>{plan.name}</span>
                      <span>{plan.count} active members</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${pct}%` }}
                        className="bg-indigo-600 h-full rounded-full"
                      />
                    </div>
                    <span className="text-[9px] text-zinc-400 block">Total revenue from renewals: {formatINR(plan.revenue)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
