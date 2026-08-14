import React, { useState, useEffect } from 'react';
import { Member, MembershipPlan, PaymentMethod } from '../types';
import { useGym } from '../context/GymContext';
import { calculateExpiryDate, formatReadableDate } from '../utils/helpers';
import { X, RefreshCw, Wallet } from 'lucide-react';

interface RenewModalProps {
  member: Member;
  onClose: () => void;
  onSuccess: () => void;
}

export const RenewModal: React.FC<RenewModalProps> = ({
  member,
  onClose,
  onSuccess,
}) => {
  const { plans, paymentMethods, renewMembership } = useGym();
  
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [newStartDate, setNewStartDate] = useState('2026-08-14');
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState(0);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const activePlans = plans.filter(p => p.isActive);

  // Set default plan and renewal start date
  useEffect(() => {
    if (activePlans.length > 0) {
      // Pick current plan if active, or first plan
      const currentPlanActive = activePlans.find(p => p.id === member.planId);
      if (currentPlanActive) {
        setSelectedPlanId(currentPlanActive.id);
        setPrice(currentPlanActive.price);
      } else {
        setSelectedPlanId(activePlans[0].id);
        setPrice(activePlans[0].price);
      }
    }

    // Smart renewal start date:
    // If membership is active/expiring soon, set start date as the day after expiryDate
    // If membership is expired, set start date as today '2026-08-14'
    const expiryDate = new Date(member.expiryDate);
    const today = new Date('2026-08-14');
    
    if (expiryDate >= today) {
      // Set to day after expiry date
      const nextDay = new Date(expiryDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const yyyy = nextDay.getFullYear();
      const mm = String(nextDay.getMonth() + 1).padStart(2, '0');
      const dd = String(nextDay.getDate()).padStart(2, '0');
      setNewStartDate(`${yyyy}-${mm}-${dd}`);
    } else {
      setNewStartDate('2026-08-14');
    }
  }, [member, plans]);

  // Recalculate new expiry date on start date or plan changes
  useEffect(() => {
    if (!selectedPlanId || !newStartDate) return;
    const plan = plans.find(p => p.id === selectedPlanId);
    if (plan) {
      const computedExpiry = calculateExpiryDate(newStartDate, plan.durationMonths);
      setNewExpiryDate(computedExpiry);
      setPrice(plan.price);
    }
  }, [selectedPlanId, newStartDate, plans]);

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (!selectedPlanId) newErrors.planId = 'Please select a renewal plan';
    if (!newStartDate) newErrors.startDate = 'Please specify a start date';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    renewMembership(
      member.id,
      selectedPlanId,
      newStartDate,
      price,
      paymentMethod,
      notes.trim() ? notes.trim() : `Membership renewal to ${plans.find(p => p.id === selectedPlanId)?.name}`
    );

    onSuccess();
  };

  const currentPlan = plans.find(p => p.id === member.planId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-[calc(100vh-2rem)] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-zinc-900 dark:text-white">Renew Gym Membership</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
 
        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            
            {/* Member Details Read-only */}
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Member Name:</span>
                <span className="font-bold text-zinc-900 dark:text-white">{member.name} ({member.id})</span>
              </div>
              <div className="flex justify-between">
                <span>Current Plan:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{currentPlan?.name || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Expiry:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatReadableDate(member.expiryDate)}</span>
              </div>
            </div>

            {/* Select Renewal Plan */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Select Renewal Plan *
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => handlePlanChange(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${errors.planId ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors`}
              >
                <option value="">Select Plan</option>
                {activePlans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.price})
                  </option>
                ))}
              </select>
              {errors.planId && <p className="text-red-500 text-xs mt-1">{errors.planId}</p>}
            </div>

            {/* New Plan Start & End Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  New Start Date *
                </label>
                <input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  New Expiry Date
                </label>
                <div className="w-full px-3 py-2 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 text-sm font-semibold select-all">
                  {formatReadableDate(newExpiryDate) || '-- -- --'}
                </div>
              </div>
            </div>

            {/* Price and Payment Method in Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Renewal Cost (₹)
                </label>
                <div className="w-full px-3 py-2 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 text-sm font-bold">
                  ₹{price}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Special birthday discount (optional)"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
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
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              Renew Membership
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
