export type Gender = 'Male' | 'Female' | 'Other';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Other';
export type MemberStatus = 'active' | 'expiring' | 'expired' | 'frozen';

export interface FreezeRecord {
  id: string;
  startDate: string; // YYYY-MM-DD
  freezeDays: number;
  reason?: string;
  status: 'active' | 'completed' | 'unfrozen';
  unfreezeDate?: string; // YYYY-MM-DD
}

export interface MembershipHistoryRecord {
  id: string;
  planId: string;
  planName: string;
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  price: number;
  amountPaid: number;
  outstandingAmount: number;
  status: 'Active' | 'Completed' | 'Frozen' | 'Cancelled';
}

export interface MemberNote {
  id: string;
  content: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  createdBy: string;
}

export interface Member {
  id: string; // e.g. TF-0001
  name: string;
  phone: string;
  email?: string;
  dob?: string;
  gender?: Gender;
  address?: string;
  profilePhoto?: string;
  planId: string;
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  createdAt: string; // ISO String
  notes?: MemberNote[];
  freezeHistory?: FreezeRecord[];
  membershipHistory?: MembershipHistoryRecord[];
  outstandingBalance?: number;
}

export interface MembershipPlan {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  description?: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:MM AM/PM
  checkOutTime?: string;
  status: MemberStatus; // Status of membership at the time of check-in
}

export interface PaymentRecord {
  id: string; // REC-00001
  memberId: string;
  memberName: string;
  planId: string;
  planName: string;
  amount: number; // The amount paid in this transaction
  totalAmount?: number; // Total cost of the plan
  outstandingAmount?: number; // Outstanding balance calculated
  paymentMethod: PaymentMethod;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface GymStats {
  totalActiveMembers: number;
  todayAttendance: number;
  expiringSoon: number;
  todayPayments: number;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
}

