import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { MembershipPlan } from '../types';
import { formatINR } from '../utils/helpers';
import { 
  Sliders, Plus, Edit2, Trash2, ShieldAlert, CheckCircle, 
  HelpCircle, Dumbbell, Award, ArrowUpRight 
} from 'lucide-react';
import { PlanFormModal } from '../components/PlanFormModal';

export const Memberships: React.FC = () => {
  const { plans, deletePlan } = useGym();

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | undefined>(undefined);

  const [alert, setAlert] = useState<string | null>(null);

  const triggerAlert = (message: string) => {
    setAlert(message);
    setTimeout(() => setAlert(null), 3500);
  };

  const handleDelete = (plan: MembershipPlan) => {
    if (window.confirm(`Are you sure you want to deactivate the "${plan.name}" plan? New members will not be able to join this plan.`)) {
      deletePlan(plan.id);
      triggerAlert(`The plan "${plan.name}" has been successfully deactivated.`);
    }
  };

  const handleEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setShowFormModal(true);
  };

  const handleAdd = () => {
    setEditingPlan(undefined);
    setShowFormModal(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Membership Plans</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Design and configure subscription lengths, price matrix, and package benefits
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Create Pricing Plan
        </button>
      </div>

      {/* Success Notification Alert banner */}
      {alert && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          {alert}
        </div>
      )}

      {/* Grid displaying Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => (
          <div 
            key={p.id}
            className={`bg-white dark:bg-zinc-900 rounded-xl border p-5 flex flex-col justify-between transition-all hover:shadow-md relative ${
              p.isActive 
                ? 'border-zinc-200 dark:border-zinc-800' 
                : 'border-zinc-200 dark:border-zinc-800 opacity-60'
            }`}
          >
            {/* Visual Icon Badge */}
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${
                p.durationMonths === 1 ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' :
                p.durationMonths === 3 ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400' :
                p.durationMonths === 6 ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400' :
                'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
              }`}>
                <Award className="w-5 h-5" />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                p.isActive 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}>
                {p.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Core Info */}
            <div className="space-y-1 mb-6">
              <h3 className="font-extrabold text-zinc-900 dark:text-white text-base leading-snug">{p.name}</h3>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Duration: {p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'}</p>
              
              {p.description ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 h-8 leading-relaxed">
                  {p.description}
                </p>
              ) : (
                <p className="text-xs text-zinc-400 italic mt-2 h-8">No summary description provided.</p>
              )}
            </div>

            {/* Price and Action Hub */}
            <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-auto">
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-xs text-zinc-400 font-semibold">Total Price</span>
                <span className="text-xl font-black text-zinc-950 dark:text-white">{formatINR(p.price)}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Plan
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  disabled={!p.isActive}
                  className="p-1.5 border border-zinc-200 dark:border-zinc-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 disabled:opacity-40 rounded-lg cursor-pointer transition-colors"
                  title="Deactivate Plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* --- FORM OVERLAY MODAL --- */}
      {showFormModal && (
        <PlanFormModal 
          plan={editingPlan}
          onClose={() => setShowFormModal(false)}
          onSuccess={() => {
            setShowFormModal(false);
            triggerAlert(editingPlan ? `Plan "${editingPlan.name}" updated successfully.` : 'Created new pricing plan successfully.');
          }}
        />
      )}

    </div>
  );
};
