import React, { useState, useEffect } from 'react';
import { MembershipPlan } from '../types';
import { useGym } from '../context/GymContext';
import { X, Save, ShieldAlert } from 'lucide-react';

interface PlanFormModalProps {
  plan?: MembershipPlan;
  onClose: () => void;
  onSuccess: () => void;
}

export const PlanFormModal: React.FC<PlanFormModalProps> = ({
  plan,
  onClose,
  onSuccess,
}) => {
  const { addPlan, updatePlan } = useGym();

  const [name, setName] = useState('');
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setDurationMonths(plan.durationMonths);
      setPrice(plan.price);
      setDescription(plan.description || '');
      setIsActive(plan.isActive);
    }
  }, [plan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Plan Name is required';
    if (durationMonths <= 0) newErrors.duration = 'Duration must be at least 1 month';
    if (price < 0) newErrors.price = 'Price cannot be negative';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name: name.trim(),
      durationMonths,
      price,
      description: description.trim() || undefined,
      isActive,
    };

    if (plan) {
      updatePlan(plan.id, payload);
    } else {
      addPlan(payload);
    }

    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-[calc(100vh-2rem)] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex-shrink-0">
          <h3 className="font-semibold text-zinc-900 dark:text-white">
            {plan ? 'Edit Membership Plan' : 'Add New Plan'}
          </h3>
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
            
            {/* Plan Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Plan Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="e.g. 3 Months Save"
                className={`w-full px-3 py-2 rounded-lg border ${errors.name ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Duration and Price in Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Duration (Months) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Description / Inclusions
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Locker access, free steam bath twice, etc."
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors h-16 resize-none"
              />
            </div>

            {/* Is Active Toggle */}
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800/80">
              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Plan Availability</span>
                <span className="text-[10px] text-zinc-400">Inactive plans cannot be assigned to new members.</span>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
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
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {plan ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
