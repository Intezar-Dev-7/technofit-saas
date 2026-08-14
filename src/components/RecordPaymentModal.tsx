import React, { useState, useEffect } from 'react';
import { Member, MembershipPlan, PaymentMethod, PaymentRecord } from '../types';
import { useGym } from '../context/GymContext';
import { X, DollarSign, Wallet } from 'lucide-react';

interface RecordPaymentModalProps {
  member?: Member; // Pre-selected member if opened from their profile
  onClose: () => void;
  onSuccess: (payment: PaymentRecord) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  member,
  onClose,
  onSuccess,
}) => {
  const { members, plans, paymentMethods, recordPayment } = useGym();

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState('2026-08-14'); // Default simulated date
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Populate form if pre-selected member is provided
  useEffect(() => {
    if (member) {
      setSelectedMemberId(member.id);
      setSelectedPlanId(member.planId);
      
      const plan = plans.find(p => p.id === member.planId);
      if (plan) {
        setAmount(plan.price);
      }
    } else if (members.length > 0) {
      setSelectedMemberId(members[0].id);
      const firstMember = members[0];
      setSelectedPlanId(firstMember.planId);
      const plan = plans.find(p => p.id === firstMember.planId);
      if (plan) {
        setAmount(plan.price);
      }
    }
  }, [member, members, plans]);

  // Adjust amount when plan changes
  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setAmount(plan.price);
    }
  };

  // Sync plan if member changes globally
  const handleMemberChange = (memberId: string) => {
    setSelectedMemberId(memberId);
    const m = members.find(item => item.id === memberId);
    if (m) {
      setSelectedPlanId(m.planId);
      const plan = plans.find(p => p.id === m.planId);
      if (plan) {
        setAmount(plan.price);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    if (!selectedMemberId) newErrors.memberId = 'Please select a member';
    if (!selectedPlanId) newErrors.planId = 'Please select a membership plan';
    if (amount <= 0) newErrors.amount = 'Amount must be greater than zero';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const currentMember = members.find(m => m.id === selectedMemberId);
    const currentPlan = plans.find(p => p.id === selectedPlanId);

    if (!currentMember || !currentPlan) return;

    const payment = recordPayment({
      memberId: selectedMemberId,
      memberName: currentMember.name,
      planId: selectedPlanId,
      planName: currentPlan.name,
      amount,
      paymentMethod,
      notes: notes.trim() || undefined,
      date: paymentDate,
    });

    onSuccess(payment);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-[calc(100vh-2rem)] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-teal-500" />
            <h3 className="font-semibold text-zinc-900 dark:text-white">Record Gym Payment</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
 
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            
            {/* Member Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Select Gym Member *
              </label>
              {member ? (
                <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {member.name} ({member.id}) — {member.phone}
                </div>
              ) : (
                <select
                  value={selectedMemberId}
                  onChange={(e) => handleMemberChange(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${errors.memberId ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors`}
                >
                  <option value="">Select Member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id})
                    </option>
                  ))}
                </select>
              )}
              {errors.memberId && <p className="text-red-500 text-xs mt-1">{errors.memberId}</p>}
            </div>

            {/* Plan Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                For Membership Plan *
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => handlePlanChange(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${errors.planId ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors`}
              >
                <option value="">Select Plan</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.price}) {p.isActive ? '' : '(Inactive)'}
                  </option>
                ))}
              </select>
              {errors.planId && <p className="text-red-500 text-xs mt-1">{errors.planId}</p>}
            </div>

            {/* Amount & Method in Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Amount Paid (₹) *
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(Number(e.target.value));
                    if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                  }}
                  placeholder="1500"
                  className={`w-full px-3 py-2 rounded-lg border ${errors.amount ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors`}
                />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Locker charges, registration fee waiver, etc. (optional)"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors h-16 resize-none"
              />
            </div>

          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              Record Payment
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
