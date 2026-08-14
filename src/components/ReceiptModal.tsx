import React, { useRef } from 'react';
import { PaymentRecord, Member } from '../types';
import { formatINR, formatReadableDate } from '../utils/helpers';
import { Printer, X, CheckCircle } from 'lucide-react';
import { useGym } from '../context/GymContext';

interface ReceiptModalProps {
  payment: PaymentRecord;
  member: Member;
  onClose: () => void;
  showSuccessBanner?: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  member,
  onClose,
  showSuccessBanner = false,
}) => {
  const { gymInfo } = useGym();
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      // Create a print window or style nicely
      const style = document.createElement('style');
      style.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section, #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            font-family: monospace;
          }
        }
      `;
      document.head.appendChild(style);
      window.print();
      document.head.removeChild(style);
    }
  };

  return (
    <div id="receipt-modal" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-[calc(100vh-2rem)] flex flex-col">
        
        {/* Success Alert Banner if just completed */}
        {showSuccessBanner && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3 flex-shrink-0">
            <CheckCircle className="text-emerald-500 w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Payment Recorded Successfully</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500">Receipt #{payment.id} has been generated.</p>
            </div>
          </div>
        )}

        {/* Modal Controls */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Payment Receipt</h3>
          <button 
            id="close-receipt-btn"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Area */}
        <div className="p-6 bg-zinc-50 dark:bg-zinc-950/40 flex-1 overflow-y-auto">
          <div 
            id="print-section"
            ref={printAreaRef}
            className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xs font-mono text-zinc-800 dark:text-zinc-200 text-sm"
          >
            {/* Gym Header */}
            <div className="text-center pb-4 border-b border-dashed border-zinc-300 dark:border-zinc-700">
              {gymInfo.logoUrl && (
                <div className="mx-auto w-10 h-10 mb-2 rounded-lg bg-indigo-600/15 border border-indigo-100 flex items-center justify-center overflow-hidden">
                  <img src={gymInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
              )}
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-wider">{gymInfo.name}</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed max-w-xs mx-auto">
                {gymInfo.address}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-semibold">
                Phone: {gymInfo.phone}
              </p>
            </div>

            {/* Receipt Metadata */}
            <div className="py-4 border-b border-dashed border-zinc-300 dark:border-zinc-700 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span>Receipt No:</span>
                <span className="font-bold text-zinc-900 dark:text-white">{payment.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{formatReadableDate(payment.date)}</span>
              </div>
              <div className="flex justify-between">
                <span>Member ID:</span>
                <span className="font-bold">{member.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Member Name:</span>
                <span className="font-bold text-zinc-900 dark:text-white">{payment.memberName}</span>
              </div>
            </div>

            {/* Membership Details */}
            <div className="py-4 border-b border-dashed border-zinc-300 dark:border-zinc-700 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span>Membership Plan:</span>
                <span className="font-bold text-zinc-900 dark:text-white">{payment.planName}</span>
              </div>
              <div className="flex justify-between">
                <span>Start Date:</span>
                <span>{formatReadableDate(member.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Expiry Date:</span>
                <span>{formatReadableDate(member.expiryDate)}</span>
              </div>
            </div>

            {/* Financial Details */}
            <div className="py-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Payment Method:</span>
                <span className="font-semibold uppercase">{payment.paymentMethod}</span>
              </div>
              
              {payment.notes && (
                <div className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded border border-zinc-100 dark:border-zinc-800">
                  <span className="font-bold block text-[10px] uppercase text-zinc-400">Notes:</span>
                  {payment.notes}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-zinc-800 mt-2">
                <span className="font-bold uppercase text-zinc-900 dark:text-white">Amount Paid</span>
                <span className="text-lg font-black text-zinc-900 dark:text-white">
                  {formatINR(payment.amount)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-dashed border-zinc-300 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400">
              <p className="font-semibold italic text-zinc-600 dark:text-zinc-300">Thank you for choosing {gymInfo.name}.</p>
              <p className="text-[10px] mt-2 text-zinc-400">Computer Generated Receipt — No Signature Required</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button
            id="receipt-print-btn"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors duration-150 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            id="receipt-close-footer-btn"
            onClick={onClose}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors duration-150 cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
