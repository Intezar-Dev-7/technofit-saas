import React, { useState } from 'react';
import { Member, PaymentRecord, PaymentMethod, MemberNote, FreezeRecord } from '../types';
import { useGym } from '../context/GymContext';
import { getMemberStatus, getDaysRemaining, formatINR, formatReadableDate } from '../utils/helpers';
import { 
  X, Phone, Mail, Calendar, MapPin, User, ChevronRight, 
  CheckCircle, Clock, CreditCard, RefreshCw, Edit, Plus, FileText, 
  Trash2, QrCode, ClipboardList, Snowflake, Upload, CheckSquare, Sparkles
} from 'lucide-react';
import { MemberFormModal } from './MemberFormModal';
import { RenewModal } from './RenewModal';
import { RecordPaymentModal } from './RecordPaymentModal';
import { ReceiptModal } from './ReceiptModal';

interface MemberProfileModalProps {
  member: Member;
  onClose: () => void;
  onUpdate?: () => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  member,
  onClose,
  onUpdate,
}) => {
  const { 
    plans, 
    attendance, 
    payments, 
    checkInMember, 
    deleteMember,
    addMemberNote,
    deleteMemberNote,
    freezeMembership,
    unfreezeMembership,
    payOutstanding,
    updateMember
  } = useGym();
  
  // Local sub-modal triggers
  const [showEdit, setShowEdit] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState<PaymentRecord | null>(null);
  
  // Custom check-in status message
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile tabs state
  const [activeTab, setActiveTab] = useState<'attendance' | 'payments' | 'history' | 'freeze' | 'notes' | 'qrcode'>('attendance');

  // Freeze Form State
  const [freezeDays, setFreezeDays] = useState<number>(7);
  const [freezeReason, setFreezeReason] = useState<string>('');

  // Note Form State
  const [newNoteText, setNewNoteText] = useState<string>('');

  // Outstanding Payment Form State
  const [outstandingPayMethod, setOutstandingPayMethod] = useState<PaymentMethod>('UPI');
  const [outstandingPayAmount, setOutstandingPayAmount] = useState<number>(member.outstandingBalance || 0);

  // Derive plans and details
  const plan = plans.find(p => p.id === member.planId);
  const status = getMemberStatus(member.expiryDate);
  const daysRemaining = getDaysRemaining(member.expiryDate);
  
  // Member's attendance records
  const memberAttendance = attendance.filter(a => a.memberId === member.id);
  
  // Member's payment records
  const memberPayments = payments.filter(p => p.memberId === member.id);
  const totalPaid = memberPayments.reduce((sum, p) => sum + p.amount, 0);

  // Actions
  const handleCheckIn = () => {
    const res = checkInMember(member.id);
    if (res.success) {
      setNotification({ type: 'success', text: res.message });
      if (onUpdate) onUpdate();
    } else {
      setNotification({ type: 'error', text: res.message });
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${member.name}? This will permanently delete their profile and history.`)) {
      deleteMember(member.id);
      onClose();
      if (onUpdate) onUpdate();
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateMember(member.id, { profilePhoto: reader.result });
          setNotification({ type: 'success', text: 'Profile photo updated successfully!' });
          setTimeout(() => setNotification(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addMemberNote(member.id, newNoteText.trim());
    setNewNoteText('');
    setNotification({ type: 'success', text: 'Note appended successfully!' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFreezeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = '2026-08-14';
    freezeMembership(member.id, todayStr, freezeDays, freezeReason || 'Unspecified freeze period');
    setFreezeReason('');
    setNotification({ type: 'success', text: `Membership frozen successfully for ${freezeDays} days!` });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePayOutstandingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (outstandingPayAmount <= 0) return;
    payOutstanding(member.id, outstandingPayAmount, outstandingPayMethod);
    setNotification({ type: 'success', text: `Payment of ${formatINR(outstandingPayAmount)} logged! Outstanding cleared.` });
    setTimeout(() => setNotification(null), 3000);
  };

  // Status visual mapping
  const statusConfig = {
    active: { bg: 'bg-emerald-50 dark:bg-emerald-950/25', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/30', label: '🟢 Active', dot: 'bg-emerald-500' },
    expiring: { bg: 'bg-amber-50 dark:bg-amber-950/25', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/30', label: '🟠 Expiring', dot: 'bg-amber-500' },
    expired: { bg: 'bg-rose-50 dark:bg-rose-950/25', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900/30', label: '🔴 Expired', dot: 'bg-rose-500' },
  };

  const visualStatus = statusConfig[status];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-40 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-4xl overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-[calc(100vh-2rem)] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded font-bold font-mono">
              {member.id}
            </span>
            <h3 className="font-semibold text-zinc-900 dark:text-white">Technofit Member Management Console</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
 
        {/* Profile Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Notification Overlay/Alert */}
          {notification && (
            <div className={`p-3 rounded-lg border text-xs font-semibold ${
              notification.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-400' 
                : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/30 dark:text-rose-400'
            }`}>
              {notification.text}
            </div>
          )}

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left: Avatar + Personal Info */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex flex-col items-center text-center p-4 bg-zinc-50 dark:bg-zinc-950/20 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                <div className="relative group">
                  {member.profilePhoto ? (
                    <img 
                      src={member.profilePhoto} 
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 dark:border-zinc-800"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-3xl border-4 border-indigo-100 dark:border-zinc-800">
                      {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  
                  {/* Base64 Upload Button */}
                  <label className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full cursor-pointer shadow-md transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
                
                <h4 className="text-base font-black text-zinc-950 dark:text-white mt-3 leading-tight">{member.name}</h4>
                <p className="text-[10px] text-zinc-400 mt-1">ID: {member.id} • Registered Aug 2026</p>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3">
                <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <Phone className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <span className="font-medium">{member.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <Mail className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <span className="truncate">{member.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <Calendar className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <span>
                    DOB: {member.dob ? formatReadableDate(member.dob) : 'Not specified'}
                    {member.gender ? ` • ${member.gender}` : ''}
                  </span>
                </div>
                <div className="flex items-start gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{member.address || 'No address provided'}</span>
                </div>
              </div>

              {/* Action Buttons Hub */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleCheckIn}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  Quick Desk Check-In
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowEdit(true)}
                    className="flex items-center justify-center gap-1.5 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Info
                  </button>
                  <button
                    onClick={() => setShowRenew(true)}
                    className="flex items-center justify-center gap-1.5 py-1.5 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Renew Plan
                  </button>
                </div>
                <button
                  onClick={() => setShowPayment(true)}
                  className="w-full flex items-center justify-center gap-2 py-1.5 bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-950/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Record New Payment
                </button>

                <div className="pt-4 text-center">
                  <button
                    onClick={handleDelete}
                    className="text-[10px] text-zinc-400 hover:text-red-500 transition-colors font-medium hover:underline cursor-pointer"
                  >
                    Delete Member Account
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Tabbed Details Panel */}
            <div className="md:col-span-8 space-y-4">
              
              {/* Membership Status Card & Outstanding warning */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl border ${visualStatus.border} ${visualStatus.bg}`}>
                  <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest block">Current Pricing Plan</span>
                  <h5 className="text-sm font-black text-zinc-950 dark:text-white mt-1">{plan?.name || 'No Plan'}</h5>
                  <div className="flex justify-between items-center mt-3 text-xs">
                    <span className="text-[10px] font-mono text-zinc-400">Expires: {formatReadableDate(member.expiryDate)}</span>
                    <span className={`text-[10px] font-bold ${daysRemaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {daysRemaining < 0 ? `${Math.abs(daysRemaining)}d expired` : `${daysRemaining}d left`}
                    </span>
                  </div>
                </div>

                {/* Outstanding Payment card */}
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-widest block">Outstanding Ledger Balance</span>
                    <p className={`text-lg font-black mt-1 ${member.outstandingBalance && member.outstandingBalance > 0 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-zinc-400'}`}>
                      {formatINR(member.outstandingBalance || 0)}
                    </p>
                  </div>
                  {member.outstandingBalance && member.outstandingBalance > 0 ? (
                    <form onSubmit={handlePayOutstandingSubmit} className="mt-2 flex gap-1.5 items-center">
                      <select 
                        value={outstandingPayMethod}
                        onChange={(e) => setOutstandingPayMethod(e.target.value as PaymentMethod)}
                        className="py-1 px-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-[10px] font-bold text-zinc-700 dark:text-zinc-300"
                      >
                        <option value="UPI">UPI</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                      </select>
                      <button
                        type="submit"
                        className="flex-1 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[10px] transition-colors cursor-pointer"
                      >
                        Clear Balance
                      </button>
                    </form>
                  ) : (
                    <p className="text-[10px] text-zinc-400 italic">No balance dues outstanding</p>
                  )}
                </div>
              </div>

              {/* Sub-Tabs Selector */}
              <div className="flex gap-1 overflow-x-auto pb-1 border-b border-zinc-150 dark:border-zinc-800/80">
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'attendance'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Visits Logs ({memberAttendance.length})
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'payments'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Payment History ({memberPayments.length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'history'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Plan Timeline
                </button>
                <button
                  onClick={() => setActiveTab('freeze')}
                  className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'freeze'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Freeze Membership
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'notes'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Staff Notes ({member.notes?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('qrcode')}
                  className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'qrcode'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  QR Member ID
                </button>
              </div>

              {/* Tab Panels */}
              <div className="bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 min-h-64">
                
                {/* 1. VISITS LOG PANEL */}
                {activeTab === 'attendance' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-500 uppercase">
                      <span>Check-In Date</span>
                      <span>Gate Pass Time</span>
                    </div>
                    {memberAttendance.length > 0 ? (
                      <div className="space-y-1.5 max-h-56 overflow-y-auto">
                        {memberAttendance.map((att) => (
                          <div key={att.id} className="flex justify-between items-center text-xs bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-150 dark:border-zinc-800/60">
                            <span className="font-bold text-zinc-700 dark:text-zinc-300">{formatReadableDate(att.date)}</span>
                            <span className="font-mono text-zinc-500">{att.checkInTime}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-400 text-xs italic py-8 text-center">No desk check-ins recorded for this member yet.</p>
                    )}
                  </div>
                )}

                {/* 2. PAYMENT LEDGER HISTORIES PANEL */}
                {activeTab === 'payments' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-500 uppercase">
                      <span>Receipt Item</span>
                      <span>Amount Collected</span>
                    </div>
                    {memberPayments.length > 0 ? (
                      <div className="space-y-1.5 max-h-56 overflow-y-auto">
                        {memberPayments.map((pay) => (
                          <div key={pay.id} className="flex justify-between items-center text-xs bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-150 dark:border-zinc-800/60">
                            <div>
                              <p className="font-black text-zinc-900 dark:text-white">{pay.planName}</p>
                              <p className="text-[9px] text-zinc-400 mt-0.5">{formatReadableDate(pay.date)} • Method: {pay.paymentMethod}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-emerald-600 dark:text-emerald-400">{formatINR(pay.amount)}</span>
                              <button
                                onClick={() => setShowReceipt(pay)}
                                className="p-1 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 cursor-pointer"
                                title="Print Receipt"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-400 text-xs italic py-8 text-center">No billing activities logged yet.</p>
                    )}
                  </div>
                )}

                {/* 3. PLAN TIMELINE HISTORY PANEL */}
                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Past Plan Registrations</h5>
                    {member.membershipHistory && member.membershipHistory.length > 0 ? (
                      <div className="relative border-l border-indigo-200 dark:border-zinc-800 ml-2.5 pl-4 space-y-4 max-h-56 overflow-y-auto">
                        {member.membershipHistory.map((hist, index) => (
                          <div key={index} className="relative">
                            <span className="absolute -left-6 top-1.5 w-3.5 h-3.5 bg-indigo-600 rounded-full border-2 border-white dark:border-zinc-900" />
                            <div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-black text-zinc-900 dark:text-white">{hist.planName}</span>
                                <span className={`text-[9px] font-bold px-1.5 rounded uppercase ${
                                  hist.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'
                                }`}>
                                  {hist.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-400 mt-0.5">
                                Period: {formatReadableDate(hist.startDate)} to {formatReadableDate(hist.expiryDate)}
                              </p>
                              <p className="text-[10px] text-zinc-500 font-medium">
                                Renewed: {formatReadableDate(hist.renewedAt)} • Paid: {formatINR(hist.amountPaid)} (Outstanding: {formatINR(hist.outstandingAmount)})
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-400 text-xs italic py-8 text-center">No plan migration history found.</p>
                    )}
                  </div>
                )}

                {/* 4. FREEZE MEMBERSHIP PANEL */}
                {activeTab === 'freeze' && (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <h5 className="text-xs font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-1.5">
                        <Snowflake className="w-4 h-4 text-indigo-500" />
                        Apply Freeze Period
                      </h5>
                      <form onSubmit={handleFreezeSubmit} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Duration (Days)</label>
                            <select
                              value={freezeDays}
                              onChange={(e) => setFreezeDays(Number(e.target.value))}
                              className="w-full mt-1 p-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-800 dark:text-zinc-200 font-bold"
                            >
                              <option value={7}>7 Days</option>
                              <option value={14}>14 Days</option>
                              <option value={30}>30 Days</option>
                              <option value={60}>60 Days</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Reason</label>
                            <input
                              type="text"
                              placeholder="e.g. Travel, Injury..."
                              value={freezeReason}
                              onChange={(e) => setFreezeReason(e.target.value)}
                              className="w-full mt-1 p-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-850 dark:text-zinc-100"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Apply Freeze Period
                        </button>
                      </form>
                    </div>

                    {/* Freeze History */}
                    {member.freezeHistory && member.freezeHistory.length > 0 && (
                      <div className="space-y-2">
                        <h6 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Past Freeze Records</h6>
                        <div className="space-y-1.5">
                          {member.freezeHistory.map((frz) => (
                            <div key={frz.id} className="flex justify-between items-center text-xs bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-150 dark:border-zinc-800">
                              <div>
                                <span className="font-bold text-zinc-800 dark:text-zinc-200">{frz.freezeDays} Days</span>
                                <span className="text-[9px] text-zinc-400 ml-1.5">Reason: {frz.reason}</span>
                              </div>
                              <span className="text-[9px] text-zinc-400 font-mono">Started: {formatReadableDate(frz.startDate)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. STAFF NOTES MANAGER */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Append a quick desk staff note..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="flex-1 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-850 dark:text-zinc-100 focus:outline-hidden"
                      />
                      <button
                        type="submit"
                        className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Add Note
                      </button>
                    </form>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {member.notes && member.notes.length > 0 ? (
                        member.notes.map((note) => (
                          <div key={note.id} className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 flex justify-between items-start gap-2">
                            <div className="space-y-1">
                              <p className="text-xs text-zinc-850 dark:text-zinc-200 leading-relaxed font-medium">
                                {note.content}
                              </p>
                              <span className="text-[9px] text-zinc-400 font-mono block">
                                {formatReadableDate(note.date)} at {note.time} • by {note.createdBy}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this staff note?')) {
                                  deleteMemberNote(member.id, note.id);
                                }
                              }}
                              className="text-zinc-400 hover:text-rose-500 p-1 rounded-sm transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-400 text-xs italic py-8 text-center">No staff remarks or alerts logged for this member.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. QR CODE MEMBER ID PANEL */}
                {activeTab === 'qrcode' && (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Print or scan this QR Code at the reception desk terminal for zero-touch gate check-in
                    </p>
                    <div className="p-3 bg-white rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${member.id}`}
                        alt={`QR Code for ${member.id}`}
                        referrerPolicy="no-referrer"
                        className="w-36 h-36"
                      />
                    </div>
                    <div className="text-xs font-bold font-mono text-zinc-700 dark:text-zinc-300">
                      MEMBER ID: {member.id}
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            Close Terminal Profile
          </button>
        </div>

      </div>

      {/* --- NESTED SUB-MODALS --- */}
      
      {/* 1. Edit Member Modal */}
      {showEdit && (
        <MemberFormModal 
          member={member}
          onClose={() => setShowEdit(false)}
          onSuccess={(saved) => {
            setShowEdit(false);
            if (onUpdate) onUpdate();
          }}
        />
      )}

      {/* 2. Renew Modal */}
      {showRenew && (
        <RenewModal 
          member={member}
          onClose={() => setShowRenew(false)}
          onSuccess={() => {
            setShowRenew(false);
            if (onUpdate) onUpdate();
          }}
        />
      )}

      {/* 3. Record Payment Modal */}
      {showPayment && (
        <RecordPaymentModal 
          member={member}
          onClose={() => setShowPayment(false)}
          onSuccess={(pay) => {
            setShowPayment(false);
            setShowReceipt(pay);
            if (onUpdate) onUpdate();
          }}
        />
      )}

      {/* 4. Receipt View Modal */}
      {showReceipt && (
        <ReceiptModal 
          payment={showReceipt}
          member={member}
          onClose={() => setShowReceipt(null)}
        />
      )}

    </div>
  );
};
