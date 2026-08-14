import React, { createContext, useContext, useState, useEffect } from 'react';
import { Member, MembershipPlan, AttendanceRecord, PaymentRecord, GymStats, Gender, PaymentMethod, ActivityLog, MemberNote, FreezeRecord, MembershipHistoryRecord } from '../types';
import { initialMembers, initialPlans, initialAttendance, initialPayments } from '../data/mockData';
import { calculateExpiryDate, getMemberStatus, generateMemberId, generateReceiptId } from '../utils/helpers';

export interface GymInfo {
  name: string;
  address: string;
  phone: string;
  logoUrl: string;
  whatsapp: string;
  email: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  openingTime: string;
  closingTime: string;
}

export interface FutureBusinessSettings {
  gracePeriodDays: number;
  registrationFee: number;
  currency: string;
  enableExpiryReminders: boolean;
  expiryReminderDays: number;
  whatsappTemplate: string;
  paymentTemplate: string;
}

interface GymContextType {
  members: Member[];
  plans: MembershipPlan[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  gymInfo: GymInfo;
  paymentMethods: string[];
  theme: 'light' | 'dark' | 'system';
  activityLogs: ActivityLog[];
  
  // Auth & Credentials
  isAuthenticated: boolean;
  adminUser: string;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  updateAdminCredentials: (user: string, oldPass: string, newPass: string) => { success: boolean; message: string };

  // Future Settings
  futureSettings: FutureBusinessSettings;
  updateFutureSettings: (settings: Partial<FutureBusinessSettings>) => void;
  
  // Member Operations
  addMember: (member: Omit<Member, 'id' | 'createdAt' | 'expiryDate'> & { initialPaymentPaid?: number }) => Member;
  updateMember: (id: string, memberData: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  
  // Plan Operations
  addPlan: (plan: Omit<MembershipPlan, 'id'>) => void;
  updatePlan: (id: string, planData: Partial<MembershipPlan>) => void;
  deletePlan: (id: string) => void;
  
  // Attendance Operations
  checkInMember: (memberId: string) => { success: boolean; message: string; record?: AttendanceRecord };
  
  // Payment & Renewal Operations
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'date'> & { date?: string }) => PaymentRecord;
  renewMembership: (memberId: string, planId: string, startDate: string, amount: number, paymentMethod: PaymentMethod, notes?: string) => void;
  payOutstanding: (memberId: string, amount: number, paymentMethod: PaymentMethod) => void;
  
  // Settings Operations
  updateGymInfo: (info: GymInfo) => void;
  updatePaymentMethods: (methods: string[]) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Stats
  getStats: () => GymStats;

  // New features
  addActivityLog: (action: string) => void;
  addMemberNote: (memberId: string, content: string) => void;
  editMemberNote: (memberId: string, noteId: string, content: string) => void;
  deleteMemberNote: (memberId: string, noteId: string) => void;
  freezeMembership: (memberId: string, startDate: string, freezeDays: number, reason?: string) => void;
  unfreezeMembership: (memberId: string) => void;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage or mock data
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('tf_members');
    return saved ? JSON.parse(saved) : initialMembers;
  });

  const [plans, setPlans] = useState<MembershipPlan[]>(() => {
    const saved = localStorage.getItem('tf_plans');
    return saved ? JSON.parse(saved) : initialPlans;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('tf_attendance');
    return saved ? JSON.parse(saved) : initialAttendance;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('tf_payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [gymInfo, setGymInfo] = useState<GymInfo>(() => {
    const saved = localStorage.getItem('tf_gym_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || 'Technofit',
          address: parsed.address || 'Aarkay Pearl, Duler Ground Rd, Alto Duler, Mapusa, Goa 403507',
          phone: parsed.phone || '077768 99179',
          logoUrl: parsed.logoUrl || '',
          whatsapp: parsed.whatsapp || parsed.phone || '077768 99179',
          email: parsed.email || 'info@technofit.in',
          city: parsed.city || 'Mapusa',
          state: parsed.state || 'Goa',
          country: parsed.country || 'India',
          pinCode: parsed.pinCode || '403507',
          openingTime: parsed.openingTime || '06:00 AM',
          closingTime: parsed.closingTime || '10:00 PM',
        };
      } catch (e) {
        // Fallback below
      }
    }
    return {
      name: 'Technofit',
      address: 'Aarkay Pearl, Duler Ground Rd, Alto Duler, Mapusa, Goa 403507',
      phone: '077768 99179',
      logoUrl: '',
      whatsapp: '077768 99179',
      email: 'info@technofit.in',
      city: 'Mapusa',
      state: 'Goa',
      country: 'India',
      pinCode: '403507',
      openingTime: '06:00 AM',
      closingTime: '10:00 PM',
    };
  });

  const [paymentMethods, setPaymentMethods] = useState<string[]>(() => {
    const saved = localStorage.getItem('tf_payment_methods');
    return saved ? JSON.parse(saved) : ['Cash', 'UPI', 'Card', 'Other'];
  });

  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('tf_theme');
    return (saved as 'light' | 'dark' | 'system') || 'light';
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('tf_activity_logs');
    return saved ? JSON.parse(saved) : [
      { id: 'act-1', user: 'Admin', action: 'System terminal initialized', date: '2026-08-14', time: '09:00 AM' },
      { id: 'act-2', user: 'Admin', action: 'Admin logged in', date: '2026-08-14', time: '09:05 AM' }
    ];
  });

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('tf_auth_active') === 'true';
  });

  const [adminUser, setAdminUser] = useState<string>(() => {
    return localStorage.getItem('tf_admin_user') || 'admin';
  });

  const [adminPass, setAdminPass] = useState<string>(() => {
    return localStorage.getItem('tf_admin_pass') || 'admin123';
  });

  // Future Settings State
  const [futureSettings, setFutureSettings] = useState<FutureBusinessSettings>(() => {
    const saved = localStorage.getItem('tf_future_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      gracePeriodDays: 3,
      registrationFee: 500,
      currency: 'INR (₹)',
      enableExpiryReminders: true,
      expiryReminderDays: 3,
      whatsappTemplate: 'Hi {name}, your Technofit gym membership expires on {expiryDate}. Please renew to continue your training!',
      paymentTemplate: 'Thank you {name} for your payment of {amount} for {planName} membership. Receipt ID: {receiptId}.',
    };
  });

  const login = (user: string, pass: string): boolean => {
    if (user === adminUser && pass === adminPass) {
      setIsAuthenticated(true);
      localStorage.setItem('tf_auth_active', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('tf_auth_active');
  };

  const updateAdminCredentials = (user: string, oldPass: string, newPass: string) => {
    if (oldPass !== adminPass) {
      return { success: false, message: 'Current password is incorrect' };
    }
    if (!newPass.trim()) {
      return { success: false, message: 'New password cannot be empty' };
    }
    setAdminUser(user);
    setAdminPass(newPass);
    localStorage.setItem('tf_admin_user', user);
    localStorage.setItem('tf_admin_pass', newPass);
    return { success: true, message: 'Password changed successfully.' };
  };

  const updateFutureSettings = (newSettings: Partial<FutureBusinessSettings>) => {
    setFutureSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('tf_future_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('tf_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('tf_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('tf_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('tf_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('tf_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('tf_gym_info', JSON.stringify(gymInfo));
  }, [gymInfo]);

  useEffect(() => {
    localStorage.setItem('tf_payment_methods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  useEffect(() => {
    localStorage.setItem('tf_theme', theme);
    
    const root = window.document.documentElement;
    
    const updateTheme = () => {
      root.classList.remove('light', 'dark');
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    };

    updateTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', listener);
      return () => {
        mediaQuery.removeEventListener('change', listener);
      };
    }
  }, [theme]);

  // 1. Members CRUD
  const addMember = (memberData: Omit<Member, 'id' | 'createdAt' | 'expiryDate'> & { initialPaymentPaid?: number; initialPaymentMethod?: PaymentMethod }) => {
    // Dynamically calculate the highest numerical Member ID to ensure total uniqueness and prevent duplicates
    let maxIdNum = 0;
    members.forEach(m => {
      if (m.id.startsWith('TF-')) {
        const idNum = parseInt(m.id.replace('TF-', ''), 10);
        if (!isNaN(idNum) && idNum > maxIdNum) {
          maxIdNum = idNum;
        }
      }
    });
    const nextId = `TF-${String(maxIdNum + 1).padStart(4, '0')}`;
    const selectedPlan = plans.find(p => p.id === memberData.planId);
    const duration = selectedPlan ? selectedPlan.durationMonths : 1;
    const expiryDate = calculateExpiryDate(memberData.startDate, duration);
    
    const price = selectedPlan ? selectedPlan.price : 0;
    const paid = memberData.initialPaymentPaid !== undefined ? memberData.initialPaymentPaid : price;
    const outstanding = Math.max(0, price - paid);

    const historyRecord: MembershipHistoryRecord = {
      id: `hist-${Date.now()}`,
      planId: memberData.planId,
      planName: selectedPlan ? selectedPlan.name : 'Unknown Plan',
      startDate: memberData.startDate,
      expiryDate,
      price,
      amountPaid: paid,
      outstandingAmount: outstanding,
      status: 'Active'
    };

    const newMember: Member = {
      ...memberData,
      id: nextId,
      expiryDate,
      createdAt: new Date().toISOString(),
      notes: [],
      freezeHistory: [],
      membershipHistory: [historyRecord],
      outstandingBalance: outstanding,
    };
    
    setMembers(prev => [newMember, ...prev]);

    // Record the payment
    if (paid > 0) {
      recordPayment({
        memberId: nextId,
        memberName: memberData.name,
        planId: memberData.planId,
        planName: selectedPlan ? selectedPlan.name : 'Unknown Plan',
        amount: paid,
        totalAmount: price,
        outstandingAmount: outstanding,
        paymentMethod: memberData.initialPaymentMethod || 'UPI',
        notes: `Initial registration payment for ${selectedPlan ? selectedPlan.name : 'Plan'}`,
        date: memberData.startDate,
      });
    }

    addActivityLog(`Registered new member: ${memberData.name} (${nextId})`);
    return newMember;
  };

  const updateMember = (id: string, memberData: Partial<Member>) => {
    setMembers(prev => prev.map(m => {
      if (m.id !== id) return m;
      
      const updated = { ...m, ...memberData };
      
      if (memberData.startDate !== undefined || memberData.planId !== undefined) {
        const planId = memberData.planId ?? m.planId;
        const startDate = memberData.startDate ?? m.startDate;
        const selectedPlan = plans.find(p => p.id === planId);
        const duration = selectedPlan ? selectedPlan.durationMonths : 1;
        updated.expiryDate = calculateExpiryDate(startDate, duration);
      }
      
      return updated;
    }));

    const mem = members.find(m => m.id === id);
    if (mem) {
      addActivityLog(`Edited member details for: ${mem.name} (${id})`);
    }
  };

  const deleteMember = (id: string) => {
    const mem = members.find(m => m.id === id);
    if (mem) {
      addActivityLog(`Deleted member: ${mem.name} (${id})`);
    }
    setMembers(prev => prev.filter(m => m.id !== id));
    setAttendance(prev => prev.filter(a => a.memberId !== id));
    setPayments(prev => prev.filter(p => p.memberId !== id));
  };

  // 2. Plans CRUD
  const addPlan = (planData: Omit<MembershipPlan, 'id'>) => {
    const nextId = `plan-${Date.now()}`;
    const newPlan: MembershipPlan = {
      ...planData,
      id: nextId,
    };
    setPlans(prev => [...prev, newPlan]);
    addActivityLog(`Created membership plan: ${planData.name}`);
  };

  const updatePlan = (id: string, planData: Partial<MembershipPlan>) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...planData } : p));
    const p = plans.find(plan => plan.id === id);
    if (p) {
      addActivityLog(`Updated membership plan: ${p.name}`);
    }
  };

  const deletePlan = (id: string) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, isActive: false } : p));
    const p = plans.find(plan => plan.id === id);
    if (p) {
      addActivityLog(`Deactivated membership plan: ${p.name}`);
    }
  };

  // 3. Attendance
  const checkInMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) {
      return { success: false, message: 'Member not found.' };
    }
    
    const isFrozen = (member.freezeHistory || []).some(f => f.status === 'active');
    if (isFrozen) {
      return { success: false, message: `Check-in denied. ${member.name}'s membership is Frozen.` };
    }

    const status = getMemberStatus(member.expiryDate);
    const todayStr = '2026-08-14';
    
    if (status === 'expired') {
      return { success: false, message: `Check-in denied. ${member.name}'s membership is Expired.` };
    }

    const alreadyCheckedIn = attendance.some(a => a.memberId === memberId && a.date === todayStr);
    if (alreadyCheckedIn) {
      return { success: false, message: `${member.name} is already checked in for today.` };
    }

    const now = new Date();
    const checkInTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      memberId,
      memberName: member.name,
      memberPhone: member.phone,
      date: todayStr,
      checkInTime,
      status,
    };

    setAttendance(prev => [newRecord, ...prev]);
    addActivityLog(`Attendance recorded (Check-In) for ${member.name} (${memberId})`);
    return { success: true, message: `${member.name} checked in successfully at ${checkInTime}.`, record: newRecord };
  };

  // 4. Payments
  const recordPayment = (paymentData: Omit<PaymentRecord, 'id' | 'date'> & { date?: string }) => {
    const nextReceipt = generateReceiptId(payments.length);
    const todayStr = '2026-08-14';
    
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: nextReceipt,
      date: paymentData.date || todayStr,
    };

    setPayments(prev => [newPayment, ...prev]);
    addActivityLog(`Recorded payment of ₹${paymentData.amount} from ${paymentData.memberName || paymentData.memberId}`);
    return newPayment;
  };

  // 5. Renew Membership
  const renewMembership = (
    memberId: string, 
    planId: string, 
    startDate: string, 
    amount: number, 
    paymentMethod: PaymentMethod,
    notes?: string
  ) => {
    const member = members.find(m => m.id === memberId);
    const plan = plans.find(p => p.id === planId);
    
    if (!member || !plan) return;

    const expiryDate = calculateExpiryDate(startDate, plan.durationMonths);
    const price = plan.price;
    const outstanding = Math.max(0, price - amount);

    const updatedHistory = (member.membershipHistory || []).map(h => ({
      ...h,
      status: h.status === 'Active' ? 'Completed' as const : h.status
    }));

    const newHistoryEntry: MembershipHistoryRecord = {
      id: `hist-${Date.now()}`,
      planId,
      planName: plan.name,
      startDate,
      expiryDate,
      price,
      amountPaid: amount,
      outstandingAmount: outstanding,
      status: 'Active'
    };

    setMembers(prev => prev.map(m => {
      if (m.id !== memberId) return m;
      return {
        ...m,
        planId,
        startDate,
        expiryDate,
        outstandingBalance: (m.outstandingBalance || 0) + outstanding,
        membershipHistory: [newHistoryEntry, ...updatedHistory]
      };
    }));

    recordPayment({
      memberId,
      memberName: member.name,
      planId,
      planName: plan.name,
      amount,
      totalAmount: price,
      outstandingAmount: outstanding,
      paymentMethod,
      notes: notes || `Membership renewal to ${plan.name}`,
      date: startDate,
    });

    addActivityLog(`Renewed membership for ${member.name} (${memberId}) to ${plan.name}`);
  };

  // 6. Pay Outstanding
  const payOutstanding = (memberId: string, amount: number, paymentMethod: PaymentMethod) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const currentBalance = member.outstandingBalance || 0;
    const newBalance = Math.max(0, currentBalance - amount);

    setMembers(prev => prev.map(m => {
      if (m.id !== memberId) return m;
      
      const updatedHistory = (m.membershipHistory || []).map(h => {
        if (h.status === 'Active' && h.outstandingAmount > 0) {
          const paidToThis = Math.min(h.outstandingAmount, amount);
          return {
            ...h,
            amountPaid: h.amountPaid + paidToThis,
            outstandingAmount: h.outstandingAmount - paidToThis
          };
        }
        return h;
      });

      return {
        ...m,
        outstandingBalance: newBalance,
        membershipHistory: updatedHistory
      };
    }));

    recordPayment({
      memberId,
      memberName: member.name,
      planId: member.planId,
      planName: plans.find(p => p.id === member.planId)?.name || 'Plan',
      amount,
      totalAmount: amount,
      outstandingAmount: 0,
      paymentMethod,
      notes: `Paid outstanding balance`,
      date: '2026-08-14'
    });

    addActivityLog(`Outstanding payment of ₹${amount} received from ${member.name} (${memberId})`);
  };

  // 7. Note actions
  const addMemberNote = (memberId: string, content: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const todayStr = '2026-08-14';

    const newNote: MemberNote = {
      id: `note-${Date.now()}`,
      content,
      date: todayStr,
      time,
      createdBy: 'Admin',
    };

    setMembers(prev => prev.map(m => {
      if (m.id !== memberId) return m;
      return {
        ...m,
        notes: [newNote, ...(m.notes || [])]
      };
    }));

    addActivityLog(`Added note for ${members.find(m => m.id === memberId)?.name || memberId}`);
  };

  const editMemberNote = (memberId: string, noteId: string, content: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id !== memberId) return m;
      return {
        ...m,
        notes: (m.notes || []).map(n => n.id === noteId ? { ...n, content } : n)
      };
    }));
    addActivityLog(`Edited note on member ID ${memberId}`);
  };

  const deleteMemberNote = (memberId: string, noteId: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id !== memberId) return m;
      return {
        ...m,
        notes: (m.notes || []).filter(n => n.id !== noteId)
      };
    }));
    addActivityLog(`Deleted note on member ID ${memberId}`);
  };

  // 8. Membership Freeze Actions
  const freezeMembership = (memberId: string, startDate: string, freezeDays: number, reason?: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const currentExpiry = new Date(member.expiryDate);
    currentExpiry.setDate(currentExpiry.getDate() + freezeDays);
    const newExpiryDateStr = currentExpiry.toISOString().split('T')[0];

    const newFreeze: FreezeRecord = {
      id: `frz-${Date.now()}`,
      startDate,
      freezeDays,
      reason,
      status: 'active',
    };

    setMembers(prev => prev.map(m => {
      if (m.id !== memberId) return m;

      const updatedHistory = (m.membershipHistory || []).map(h => {
        if (h.status === 'Active') {
          return { ...h, expiryDate: newExpiryDateStr, status: 'Frozen' as const };
        }
        return h;
      });

      return {
        ...m,
        expiryDate: newExpiryDateStr,
        freezeHistory: [newFreeze, ...(m.freezeHistory || [])],
        membershipHistory: updatedHistory,
      };
    }));

    addActivityLog(`Membership frozen for ${member.name} (${memberId}) for ${freezeDays} days`);
  };

  const unfreezeMembership = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    setMembers(prev => prev.map(m => {
      if (m.id !== memberId) return m;

      const updatedHistory = (m.membershipHistory || []).map(h => {
        if (h.status === 'Frozen') {
          return { ...h, status: 'Active' as const };
        }
        return h;
      });

      return {
        ...m,
        freezeHistory: (m.freezeHistory || []).map(f => {
          if (f.status === 'active') {
            return { ...f, status: 'unfrozen' as const, unfreezeDate: '2026-08-14' };
          }
          return f;
        }),
        membershipHistory: updatedHistory,
      };
    }));

    addActivityLog(`Membership unfrozen for ${member.name} (${memberId})`);
  };

  // 9. Settings Actions
  const updateGymInfo = (info: GymInfo) => {
    setGymInfo(info);
    addActivityLog('Gym profile updated');
  };

  const updatePaymentMethods = (methods: string[]) => {
    setPaymentMethods(methods);
    addActivityLog('Accepted payment methods configuration updated');
  };

  const setTheme = (themeMode: 'light' | 'dark' | 'system') => {
    setThemeState(themeMode);
    addActivityLog(`Theme changed to ${themeMode}`);
  };

  // 10. Get live stats relative to Aug 14, 2026
  const getStats = (): GymStats => {
    const todayStr = '2026-08-14';
    
    const totalActiveMembers = members.filter(m => {
      const isFrozen = (m.freezeHistory || []).some(f => f.status === 'active');
      return !isFrozen && getMemberStatus(m.expiryDate) !== 'expired';
    }).length;
    
    const todayAttendance = attendance.filter(a => a.date === todayStr).length;
    
    const expiringSoon = members.filter(m => {
      const isFrozen = (m.freezeHistory || []).some(f => f.status === 'active');
      return !isFrozen && getMemberStatus(m.expiryDate) === 'expiring';
    }).length;
    
    const todayPayments = payments
      .filter(p => p.date === todayStr)
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalActiveMembers,
      todayAttendance,
      expiringSoon,
      todayPayments,
    };
  };

  const addActivityLog = (action: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const todayStr = '2026-08-14';
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      user: 'Admin',
      action,
      date: todayStr,
      time,
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  return (
    <GymContext.Provider value={{
      members,
      plans,
      attendance,
      payments,
      gymInfo,
      paymentMethods,
      theme,
      activityLogs,
      isAuthenticated,
      adminUser,
      login,
      logout,
      updateAdminCredentials,
      futureSettings,
      updateFutureSettings,
      addMember,
      updateMember,
      deleteMember,
      addPlan,
      updatePlan,
      deletePlan,
      checkInMember,
      recordPayment,
      renewMembership,
      payOutstanding,
      updateGymInfo,
      updatePaymentMethods,
      setTheme,
      getStats,
      addActivityLog,
      addMemberNote,
      editMemberNote,
      deleteMemberNote,
      freezeMembership,
      unfreezeMembership,
    }}>
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (context === undefined) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};
