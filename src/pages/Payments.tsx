import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { formatINR, formatReadableDate } from '../utils/helpers';
import { PaymentRecord, Member } from '../types';
import { 
  Plus, Search, IndianRupee, FileText, Calendar, 
  Filter, CheckCircle, TrendingUp, X 
} from 'lucide-react';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { ReceiptModal } from '../components/ReceiptModal';

export const Payments: React.FC = () => {
  const { payments, members, plans } = useGym();

  const [search, setSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month' | 'all'>('month'); // Defaults to month collections

  // Modal overlays state
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<PaymentRecord | null>(null);
  const [viewReceipt, setViewReceipt] = useState<PaymentRecord | null>(null);

  // Simulated August 14, 2026 reference
  const todayStr = '2026-08-14';

  // Compute filtered payment ledger
  const filteredPayments = payments.filter(pay => {
    // 1. Text Search matching member name or Receipt ID
    const matchesSearch = 
      pay.memberName.toLowerCase().includes(search.toLowerCase()) ||
      pay.id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Period Filter logic relative to August 14, 2026
    if (periodFilter === 'all') return true;
    if (periodFilter === 'today') return pay.date === todayStr;

    const today = new Date(todayStr);
    const payDate = new Date(pay.date);
    const diffTime = today.getTime() - payDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (periodFilter === 'week') {
      return diffDays >= 0 && diffDays <= 7;
    }
    if (periodFilter === 'month') {
      return diffDays >= 0 && diffDays <= 30;
    }

    return true;
  });

  // Calculate total sum for the active filtered set
  const totalCollections = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  // Retrieve the full member profile object for receipt rendering
  const getMemberForReceipt = (pay: PaymentRecord): Member | undefined => {
    return members.find(m => m.id === pay.memberId);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Payment Ledger</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Log, filter, and audit revenue collections or print invoices
          </p>
        </div>
        <button
          onClick={() => setShowRecordModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Record New Payment
        </button>
      </div>

      {/* Aggregate Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 rounded-xl">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">Period Revenue</span>
            <span className="text-xl font-black text-zinc-900 dark:text-white">{formatINR(totalCollections)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-zinc-200/50 dark:border-zinc-800 pt-3 md:pt-0 md:pl-5">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">Transactions logged</span>
            <span className="text-xl font-black text-zinc-900 dark:text-white">{filteredPayments.length} receipts</span>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-zinc-200/50 dark:border-zinc-800 pt-3 md:pt-0 md:pl-5">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">Active Filter Period</span>
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 capitalize">
              {periodFilter === 'all' ? 'All Time History' : `${periodFilter === 'week' ? 'Last 7 Days' : periodFilter === 'month' ? 'Last 30 Days' : 'Today (14 Aug)'}`}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Period Filter Tabs Row */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Member Name or Receipt ID..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
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
          {(['today', 'week', 'month', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setPeriodFilter(period)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                periodFilter === period 
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700'
              }`}
            >
              {period === 'today' ? 'Today' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All History'}
            </button>
          ))}
        </div>

      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        {filteredPayments.length > 0 ? (
          <>
            {/* DESKTOP VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[950px] text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950/40 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800/80">
                    <th className="px-6 py-3.5">Receipt No</th>
                    <th className="px-6 py-3.5">Member Name</th>
                    <th className="px-6 py-3.5">Membership Plan</th>
                    <th className="px-6 py-3.5">Amount Paid</th>
                    <th className="px-6 py-3.5">Payment Method</th>
                    <th className="px-6 py-3.5">Transaction Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-sm">
                  {filteredPayments.map((pay) => (
                    <tr 
                      key={pay.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors"
                    >
                      <td className="px-6 py-3.5 font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {pay.id}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-zinc-900 dark:text-white">
                        {pay.memberName}
                      </td>
                      <td className="px-6 py-3.5 text-zinc-600 dark:text-zinc-400 font-semibold">
                        {pay.planName}
                      </td>
                      <td className="px-6 py-3.5 font-black text-zinc-900 dark:text-white">
                        {formatINR(pay.amount)}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded uppercase">
                          {pay.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                        {formatReadableDate(pay.date)}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => setViewReceipt(pay)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded font-bold transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS VIEW */}
            <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
              {filteredPayments.map((pay) => (
                <div
                  key={pay.id}
                  className="bg-white dark:bg-zinc-950/20 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3"
                >
                  <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <span className="font-mono text-xs font-bold text-zinc-400">{pay.id}</span>
                    <span className="font-mono text-xs text-zinc-400">{formatReadableDate(pay.date)}</span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{pay.memberName}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{pay.planName}</p>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Payment</span>
                      <span className="text-base font-black text-zinc-900 dark:text-white">{formatINR(pay.amount)}</span>
                      <span className="ml-1 px-1.5 py-0.2 text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded uppercase">
                        {pay.paymentMethod}
                      </span>
                    </div>
                    <button
                      onClick={() => setViewReceipt(pay)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 px-4">
            <Search className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
            <p className="text-zinc-800 dark:text-zinc-200 font-bold">No payments found</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              We couldn't locate any transaction records matching "<strong>{search}</strong>" in the selected period.
            </p>
          </div>
        )}
      </div>

      {/* --- RENDER MODALS --- */}

      {/* 1. Record Payment Modal */}
      {showRecordModal && (
        <RecordPaymentModal 
          onClose={() => setShowRecordModal(false)}
          onSuccess={(payment) => {
            setShowRecordModal(false);
            setSuccessReceipt(payment); // Triggers success banner inside Receipt view
          }}
        />
      )}

      {/* 2. Success Receipt Modal (Post Registration) */}
      {successReceipt && getMemberForReceipt(successReceipt) && (
        <ReceiptModal 
          payment={successReceipt}
          member={getMemberForReceipt(successReceipt)!}
          showSuccessBanner={true}
          onClose={() => setSuccessReceipt(null)}
        />
      )}

      {/* 3. General View Receipt Modal */}
      {viewReceipt && getMemberForReceipt(viewReceipt) && (
        <ReceiptModal 
          payment={viewReceipt}
          member={getMemberForReceipt(viewReceipt)!}
          onClose={() => setViewReceipt(null)}
        />
      )}

    </div>
  );
};
