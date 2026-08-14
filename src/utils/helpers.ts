import { MemberStatus } from '../types';

/**
 * Format currency in Indian Rupees (₹)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to a readable form (e.g., "14 Aug 2026")
 */
export function formatReadableDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Parse date from string and get days remaining until expiry
 */
export function getDaysRemaining(expiryDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get membership status based on the expiry date
 */
export function getMemberStatus(expiryDateStr: string): MemberStatus {
  const daysRemaining = getDaysRemaining(expiryDateStr);
  if (daysRemaining < 0) {
    return 'expired';
  } else if (daysRemaining <= 7) {
    return 'expiring';
  } else {
    return 'active';
  }
}

/**
 * Calculate the expiry date based on a start date and plan duration in months
 */
export function calculateExpiryDate(startDateStr: string, durationMonths: number): string {
  const date = new Date(startDateStr);
  if (isNaN(date.getTime())) return startDateStr;
  
  // Add months
  date.setMonth(date.getMonth() + durationMonths);
  
  // Format as YYYY-MM-DD
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Generate standard WhatsApp message link for Goa, India numbers (+91)
 */
export function getWhatsAppLink(phone: string, name: string, expiryDateStr: string, daysRemaining: number): string {
  // Clean phone number (leave only digits)
  const cleanedPhone = phone.replace(/\D/g, '');
  const targetPhone = cleanedPhone.startsWith('91') && cleanedPhone.length === 12
    ? cleanedPhone 
    : cleanedPhone.length === 10 
      ? `91${cleanedPhone}` 
      : cleanedPhone;

  let message = '';
  if (daysRemaining < 0) {
    message = `Hi ${name}, your Technofit gym membership expired on ${formatReadableDate(expiryDateStr)}. Please contact us or visit the reception to renew your membership. Thank you!`;
  } else if (daysRemaining === 0) {
    message = `Hi ${name}, your Technofit gym membership expires today. Please contact us or visit the reception to renew your membership and continue your fitness journey!`;
  } else {
    message = `Hi ${name}, your Technofit gym membership is expiring soon on ${formatReadableDate(expiryDateStr)} (in ${daysRemaining} days). Please contact us if you'd like to renew. Thank you!`;
  }

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a dynamic WhatsApp link with custom message pre-fills
 */
export function getWhatsAppCustomLink(phone: string, message: string): string {
  const cleanedPhone = phone.replace(/\D/g, '');
  const targetPhone = cleanedPhone.startsWith('91') && cleanedPhone.length === 12
    ? cleanedPhone 
    : cleanedPhone.length === 10 
      ? `91${cleanedPhone}` 
      : cleanedPhone;
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Helper to generate unique Member ID (e.g. TF-0021)
 */
export function generateMemberId(lastIndex: number): string {
  const num = lastIndex + 1;
  return `TF-${String(num).padStart(4, '0')}`;
}

/**
 * Helper to generate unique Receipt ID (e.g. REC-00105)
 */
export function generateReceiptId(lastIndex: number): string {
  const num = lastIndex + 1;
  return `REC-${String(num).padStart(5, '0')}`;
}
