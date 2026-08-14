import React, { useState, useEffect } from 'react';
import { Member, MembershipPlan, Gender, PaymentMethod } from '../types';
import { useGym } from '../context/GymContext';
import { X, Save, UserPlus, Edit, Info, AlertTriangle } from 'lucide-react';
import { calculateExpiryDate, formatReadableDate } from '../utils/helpers';

interface MemberFormModalProps {
  member?: Member; // If provided, we are editing
  onClose: () => void;
  onSuccess: (savedMember: Member) => void;
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  member,
  onClose,
  onSuccess,
}) => {
  const { plans, members, addMember, updateMember } = useGym();
  
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [address, setAddress] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [planId, setPlanId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // Use today as default start date
  
  // Initial payment states
  const [initialPaymentPaid, setInitialPaymentPaid] = useState<number | ''>('');
  const [initialPaymentMethod, setInitialPaymentMethod] = useState<PaymentMethod>('UPI');
  const [duplicateMember, setDuplicateMember] = useState<Member | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Filter plans to show active ones
  const activePlans = plans.filter(p => p.isActive);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setPhone(member.phone);
      setEmail(member.email || '');
      setDob(member.dob || '');
      setGender(member.gender || '');
      setAddress(member.address || '');
      setProfilePhoto(member.profilePhoto || '');
      setPlanId(member.planId);
      setStartDate(member.startDate);
    } else {
      // Pre-select first active plan if adding new
      if (activePlans.length > 0) {
        setPlanId(activePlans[0].id);
        setInitialPaymentPaid(activePlans[0].price);
      }
    }
  }, [member, plans]);

  // Sync initial payment when planId changes
  useEffect(() => {
    if (!member && planId) {
      const selectedPlan = plans.find(p => p.id === planId);
      if (selectedPlan) {
        setInitialPaymentPaid(selectedPlan.price);
      }
    }
  }, [planId, member, plans]);

  const selectedPlan = plans.find(p => p.id === planId);
  const calculatedExpiry = selectedPlan && startDate
    ? calculateExpiryDate(startDate, selectedPlan.durationMonths)
    : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateMember(null);
    
    // Simple validation
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = "Please enter the member's name.";
    if (!phone.trim()) {
      newErrors.phone = "Please enter the phone number.";
    } else if (phone.trim().length !== 10) {
      newErrors.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!planId) newErrors.planId = 'Please select a membership plan.';
    if (!startDate) newErrors.startDate = 'Start date is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check for duplicate phone number
    const existing = members.find(m => m.phone === phone.trim() && (!member || m.id !== member.id));
    if (existing) {
      setErrors({ phone: 'A member with this phone number already exists.' });
      setDuplicateMember(existing);
      return;
    }

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      dob: dob || undefined,
      gender: gender ? (gender as Gender) : undefined,
      address: address.trim() || undefined,
      profilePhoto: profilePhoto.trim() || undefined,
      planId,
      startDate,
      initialPaymentPaid: !member && initialPaymentPaid !== '' ? Number(initialPaymentPaid) : undefined,
      initialPaymentMethod: !member ? initialPaymentMethod : undefined,
    };

    let resultMember: Member;
    if (member) {
      updateMember(member.id, payload);
      resultMember = {
        ...member,
        ...payload,
        // Calculate dynamic expiry for immediate success callback
        expiryDate: calculatedExpiry || member.expiryDate, 
      };
    } else {
      resultMember = addMember(payload);
    }

    onSuccess(resultMember);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-[calc(100vh-2rem)] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            {member ? (
              <Edit className="w-5 h-5 text-indigo-500" />
            ) : (
              <UserPlus className="w-5 h-5 text-indigo-500" />
            )}
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              {member ? `Edit Member: ${member.id}` : 'Register New Member'}
            </h3>
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
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="Rahul Sharma"
                className={`w-full px-3 py-2 rounded-lg border ${errors.name ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Grid for Phone and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); // Limit to 10 digits
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                    if (duplicateMember) setDuplicateMember(null);
                  }}
                  placeholder="9822114400"
                  className={`w-full px-3 py-2 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul.sharma@gmail.com"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Phone Duplicate Banner */}
            {duplicateMember && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/30 p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-400">
                <div>
                  <p className="font-bold">A member with this phone number already exists.</p>
                  <p className="mt-0.5">{duplicateMember.name} is already registered as <strong>{duplicateMember.id}</strong>.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSuccess(duplicateMember);
                  }}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap self-start sm:self-center shadow-xs"
                >
                  View Existing Member
                </button>
              </div>
            )}

            {/* DOB and Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alto Duler, Mapusa, Goa"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Profile Photo URL Optional */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Profile Photo URL (Optional)
              </label>
              <input
                type="url"
                value={profilePhoto}
                onChange={(e) => setProfilePhoto(e.target.value)}
                placeholder="https://images.unsplash.com/... (optional)"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-4">
              <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">Membership Plan Details</h4>
            </div>

            {/* Plan selection and Start Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Membership Plan *
                </label>
                <select
                  value={planId}
                  onChange={(e) => {
                    setPlanId(e.target.value);
                    if (errors.planId) setErrors(prev => ({ ...prev, planId: '' }));
                  }}
                  className={`w-full px-3 py-2 rounded-lg border ${errors.planId ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors`}
                  disabled={!!member} // Block plan change from here if editing - guide to renew or edit specifically
                >
                  <option value="">Select Plan</option>
                  {activePlans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.price})
                    </option>
                  ))}
                </select>
                {errors.planId && <p className="text-red-500 text-xs mt-1">{errors.planId}</p>}
                {member && (
                  <p className="text-[11px] text-zinc-500 mt-1">
                    To change plans, use the <strong>Renew Membership</strong> feature.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (errors.startDate) setErrors(prev => ({ ...prev, startDate: '' }));
                  }}
                  className={`w-full px-3 py-2 rounded-lg border ${errors.startDate ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors`}
                  disabled={!!member} // Expiry date handles edits or renewals specifically
                />
                {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
              </div>
            </div>

            {/* Dynamic Plan Display and computed expiry */}
            {selectedPlan && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                <div className="p-3 rounded-lg bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/60 dark:border-indigo-900/20">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-500 block">Plan Cost</span>
                  <span className="text-base font-black text-indigo-600 dark:text-indigo-400">₹{selectedPlan.price.toLocaleString()}</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">{selectedPlan.name}</span>
                </div>
                {calculatedExpiry && (
                  <div className="p-3 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/60 dark:border-emerald-900/20">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-500 block">Calculated Expiry</span>
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{formatReadableDate(calculatedExpiry)}</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Duration: {selectedPlan.durationMonths} {selectedPlan.durationMonths === 1 ? 'Month' : 'Months'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Initial Payment Recording Fields for New Registrations */}
            {!member && selectedPlan && (
              <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-4 space-y-3">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Initial Payment (Optional)</h4>
                  <Info className="w-3.5 h-3.5 text-zinc-400" title="Log full or partial payments instantly" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                      Amount Paid (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedPlan.price}
                      value={initialPaymentPaid}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Math.min(selectedPlan.price, Math.max(0, Number(e.target.value)));
                        setInitialPaymentPaid(val);
                      }}
                      placeholder="e.g. 4000"
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Max: ₹{selectedPlan.price.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                      Payment Method
                    </label>
                    <select
                      value={initialPaymentMethod}
                      onChange={(e) => setInitialPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Live math calculation display block */}
                <div className="bg-zinc-50 dark:bg-zinc-950/30 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400">Total Plan Price:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">₹{selectedPlan.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400">Total Amount Paid:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{(initialPaymentPaid === '' ? 0 : Number(initialPaymentPaid)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 dark:text-zinc-400 font-semibold">Outstanding Balance:</span>
                    <span className={`font-black text-sm ${selectedPlan.price - (initialPaymentPaid === '' ? 0 : Number(initialPaymentPaid)) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                      ₹{(selectedPlan.price - (initialPaymentPaid === '' ? 0 : Number(initialPaymentPaid))).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Form Actions */}
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
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {member ? 'Save Changes' : 'Create Member'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
