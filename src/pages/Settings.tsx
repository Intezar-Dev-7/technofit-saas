import React, { useState, useRef } from 'react';
import { useGym, GymInfo } from '../context/GymContext';
import { MembershipPlan } from '../types';
import { formatINR } from '../utils/helpers';
import { 
  Building2, Sliders, CreditCard, Paintbrush, Plus, Edit2, 
  Check, Trash, Save, Dumbbell, User, Shield, Phone, MessageSquare, 
  Mail, MapPin, Clock, Eye, EyeOff, AlertCircle, Bell 
} from 'lucide-react';
import { PlanFormModal } from '../components/PlanFormModal';

export const Settings: React.FC = () => {
  const { 
    gymInfo, updateGymInfo, plans, deletePlan, 
    paymentMethods, updatePaymentMethods, theme, setTheme,
    adminUser, updateAdminCredentials, futureSettings, updateFutureSettings
  } = useGym();

  // Settings tabs
  const [activeTab, setActiveTab] = useState<'gym' | 'admin' | 'plans' | 'payments' | 'notifications' | 'theme'>('gym');

  // Success toast helper states
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Gym info form states
  const [gymName, setGymName] = useState(gymInfo.name);
  const [gymAddress, setGymAddress] = useState(gymInfo.address);
  const [gymPhone, setGymPhone] = useState(gymInfo.phone);
  const [gymWhatsapp, setGymWhatsapp] = useState(gymInfo.whatsapp || gymInfo.phone || '077768 99179');
  const [gymEmail, setGymEmail] = useState(gymInfo.email || 'info@technofit.in');
  const [gymCity, setGymCity] = useState(gymInfo.city || 'Mapusa');
  const [gymState, setGymState] = useState(gymInfo.state || 'Goa');
  const [gymCountry, setGymCountry] = useState(gymInfo.country || 'India');
  const [gymPin, setGymPin] = useState(gymInfo.pinCode || '403507');
  const [gymOpening, setGymOpening] = useState(gymInfo.openingTime || '06:00 AM');
  const [gymClosing, setGymClosing] = useState(gymInfo.closingTime || '10:00 PM');
  const [logoUrl, setLogoUrl] = useState(gymInfo.logoUrl || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin account form states
  const [username, setUsername] = useState(adminUser);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Payment settings state
  const [newMethod, setNewMethod] = useState('');
  const [methods, setMethods] = useState<string[]>(paymentMethods);

  // Future membership parameters
  const [gracePeriod, setGracePeriod] = useState(futureSettings.gracePeriodDays);
  const [regFee, setRegFee] = useState(futureSettings.registrationFee);

  // Future notification parameters
  const [enableExpiryReminders, setEnableExpiryReminders] = useState(futureSettings.enableExpiryReminders);
  const [expiryReminderDays, setExpiryReminderDays] = useState(futureSettings.expiryReminderDays);
  const [whatsappTemplate, setWhatsappTemplate] = useState(futureSettings.whatsappTemplate);
  const [paymentTemplate, setPaymentTemplate] = useState(futureSettings.paymentTemplate);

  // Plans list state
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | undefined>(undefined);
  const [showPlanForm, setShowPlanForm] = useState(false);

  // Trigger temporary toast notifications
  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setErrorMessage(null), 4000);
  };

  // 1. Save Gym Details Form
  const handleGymDetailsSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymName.trim()) return triggerError('Gym name is required.');
    if (!gymAddress.trim()) return triggerError('Gym address is required.');
    if (!gymPhone.trim()) return triggerError('Phone number is required.');

    updateGymInfo({
      name: gymName.trim(),
      address: gymAddress.trim(),
      phone: gymPhone.trim(),
      whatsapp: gymWhatsapp.trim(),
      email: gymEmail.trim(),
      city: gymCity.trim(),
      state: gymState.trim(),
      country: gymCountry.trim(),
      pinCode: gymPin.trim(),
      openingTime: gymOpening.trim(),
      closingTime: gymClosing.trim(),
      logoUrl: logoUrl,
    });

    triggerSuccess('Settings updated successfully.');
  };

  // Handle Logo uploading (Base64 file reader)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      triggerError('Logo image file should be under 1.5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoUrl(reader.result);
        updateGymInfo({
          ...gymInfo,
          logoUrl: reader.result
        });
        triggerSuccess('Logo uploaded successfully.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove existing Logo
  const handleRemoveLogo = () => {
    setLogoUrl('');
    updateGymInfo({
      ...gymInfo,
      logoUrl: ''
    });
    triggerSuccess('Logo removed successfully.');
  };

  // 2. Save Admin Account Form
  const handleAdminAccountSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      return triggerError('Username cannot be empty.');
    }

    // Changing username only without changing password
    if (!currentPassword && !newPassword && !confirmPassword) {
      updateAdminCredentials(username.trim(), '', ''); // Safe update
      // Manually trigger safe save in context
      localStorage.setItem('tf_admin_user', username.trim());
      triggerSuccess('Settings updated successfully.');
      return;
    }

    // Changing Password
    if (!currentPassword) {
      return triggerError('Please provide current password to change account credentials.');
    }
    if (!newPassword.trim()) {
      return triggerError('New password cannot be empty.');
    }
    if (newPassword !== confirmPassword) {
      return triggerError('New password and password confirmation do not match.');
    }

    const res = updateAdminCredentials(username.trim(), currentPassword, newPassword);
    if (res.success) {
      triggerSuccess('Password changed successfully.');
      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      triggerError(res.message);
    }
  };

  // 3. Save Future Membership config settings
  const handleMembershipSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateFutureSettings({
      gracePeriodDays: Number(gracePeriod),
      registrationFee: Number(regFee)
    });
    triggerSuccess('Settings updated successfully.');
  };

  // 4. Payment synchronized options
  const handleAddPaymentMethod = () => {
    const cleaned = newMethod.trim();
    if (!cleaned) return;
    if (methods.includes(cleaned)) {
      triggerError('Payment method already exists.');
      return;
    }
    const updated = [...methods, cleaned];
    setMethods(updated);
    updatePaymentMethods(updated);
    setNewMethod('');
    triggerSuccess('Settings updated successfully.');
  };

  const handleRemovePaymentMethod = (methodToRemove: string) => {
    if (methods.length <= 1) {
      triggerError('You must retain at least one payment method.');
      return;
    }
    const updated = methods.filter(m => m !== methodToRemove);
    setMethods(updated);
    updatePaymentMethods(updated);
    triggerSuccess('Settings updated successfully.');
  };

  // 5. Save Notifications settings
  const handleNotificationsSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateFutureSettings({
      enableExpiryReminders,
      expiryReminderDays: Number(expiryReminderDays),
      whatsappTemplate: whatsappTemplate.trim(),
      paymentTemplate: paymentTemplate.trim()
    });
    triggerSuccess('Settings updated successfully.');
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">System Configuration</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Configure Technofit branding, front-desk accounts, pricing schedules, future integrations, and appearance.
        </p>
      </div>

      {/* Floating alert banners */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-2.5 shadow-xs animate-fade-in">
          <Check className="w-4 h-4 text-emerald-500" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 text-xs font-bold rounded-lg flex items-center gap-2.5 shadow-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          {errorMessage}
        </div>
      )}

      {/* Split Tab Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side Tab Navigation Controls */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-none border-b lg:border-b-0 border-zinc-200 dark:border-zinc-800">
          
          <button
            onClick={() => setActiveTab('gym')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'gym' 
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
            }`}
          >
            <Building2 className="w-4 h-4 flex-shrink-0" />
            Gym branding
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'admin' 
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
            }`}
          >
            <User className="w-4 h-4 flex-shrink-0" />
            Admin Credentials
          </button>
          
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'plans' 
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
            }`}
          >
            <Sliders className="w-4 h-4 flex-shrink-0" />
            Pricing Plans
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'payments' 
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
            }`}
          >
            <CreditCard className="w-4 h-4 flex-shrink-0" />
            Payments Config
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'notifications' 
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
            }`}
          >
            <Bell className="w-4 h-4 flex-shrink-0" />
            Notification Setup
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'theme' 
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
            }`}
          >
            <Paintbrush className="w-4 h-4 flex-shrink-0" />
            Theme Appearance
          </button>
        </div>

        {/* Right Side Settings Dashboard Content Panels (9 cols) */}
        <div className="lg:col-span-9 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 sm:p-6 shadow-xs">
          
          {/* TAB 1: Gym Details & Business Hours */}
          {activeTab === 'gym' && (
            <form onSubmit={handleGymDetailsSave} className="space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-800/60 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white">Business / Gym details</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Control outward receipt addresses, phone indices, logo uploads, and schedule boundaries.</p>
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-center"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>

              {/* Logo Uploader Block */}
              <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800/60 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-950 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Gym Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Dumbbell className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <div className="text-center sm:text-left space-y-2 flex-1">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Gym Identity Logo</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Change the logo seen on the Login screen, Sidebar, and Receipts.</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      Choose Image
                    </button>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/20 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        Remove Logo
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Grid Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Gym Name */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    Gym Name
                  </label>
                  <input
                    type="text"
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Technofit"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={gymEmail}
                    onChange={(e) => setGymEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="info@technofit.in"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={gymPhone}
                    onChange={(e) => setGymPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="077768 99179"
                  />
                </div>

                {/* WhatsApp Number */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    WhatsApp Contact Number
                  </label>
                  <input
                    type="text"
                    value={gymWhatsapp}
                    onChange={(e) => setGymWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="077768 99179"
                  />
                </div>

                {/* Opening Hours */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    Opening Time
                  </label>
                  <input
                    type="text"
                    value={gymOpening}
                    onChange={(e) => setGymOpening(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="06:00 AM"
                  />
                </div>

                {/* Closing Hours */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    Closing Time
                  </label>
                  <input
                    type="text"
                    value={gymClosing}
                    onChange={(e) => setGymClosing(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="10:00 PM"
                  />
                </div>

                {/* Full Address */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    value={gymAddress}
                    onChange={(e) => setGymAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Aarkay Pearl, Duler Ground Rd, Alto Duler, Mapusa"
                  />
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    City
                  </label>
                  <input
                    type="text"
                    value={gymCity}
                    onChange={(e) => setGymCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Mapusa"
                  />
                </div>

                {/* State */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    State
                  </label>
                  <input
                    type="text"
                    value={gymState}
                    onChange={(e) => setGymState(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Goa"
                  />
                </div>

                {/* Country */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    Country
                  </label>
                  <input
                    type="text"
                    value={gymCountry}
                    onChange={(e) => setCountryValue()}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-zinc-400 dark:text-zinc-500 font-semibold focus:outline-hidden"
                    placeholder="India"
                  />
                </div>

                {/* Pin Code */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={gymPin}
                    onChange={(e) => setGymPin(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="403507"
                  />
                </div>

              </div>
            </form>
          )}

          {/* TAB 2: Admin Account Credentials */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminAccountSave} className="space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-800/60 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white">Admin Credentials</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Modify the administrative username and entry passkey.</p>
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-center"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Username */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    Administrative Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                      <User className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                {/* Password modification fields */}
                <div className="sm:col-span-2 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-[11px] text-amber-600 dark:text-amber-400/85">
                  Leave the password fields blank below if you only want to change your username without setting a new login key.
                </div>

                {/* Current Password */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </div>
            </form>
          )}

          {/* TAB 3: Pricing Plans & Future Membership settings */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              
              {/* Future parameters first */}
              <form onSubmit={handleMembershipSettingsSave} className="space-y-4">
                <div className="border-b border-zinc-100 dark:border-zinc-800/60 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white font-black">Membership Rules</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Control default signup values, penalty rules, and late-fee grace margins.</p>
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-center"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Rules
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Grace period */}
                  <div className="space-y-1">
                    <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                      Check-in Grace Period (Days)
                    </label>
                    <input
                      type="number"
                      value={gracePeriod}
                      onChange={(e) => setGracePeriod(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Signup Registration fee */}
                  <div className="space-y-1">
                    <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                      One-time Registration Fee
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 font-extrabold text-[11px]">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={regFee}
                        onChange={(e) => setRegFee(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                </div>
              </form>

              {/* The existing plans list editor */}
              <div className="space-y-4 pt-4 border-t border-zinc-150 dark:border-zinc-800/80">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">Active Pricing Tariffs</h3>
                    <p className="text-[10px] text-zinc-400">Add or deactivate active gym subscription plans.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingPlan(undefined);
                      setShowPlanForm(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Plan
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  {plans.map(p => (
                    <div 
                      key={p.id}
                      className="flex justify-between items-center p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-zinc-900 dark:text-white">{p.name}</span>
                          <span className={`px-2 py-0.2 rounded-sm text-[9px] font-black uppercase ${
                            p.isActive 
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                              : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}>
                            {p.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1">Duration: {p.durationMonths} Month(s) • price: {formatINR(p.price)}</p>
                        {p.description && <p className="text-[10px] text-zinc-500 mt-1 italic">{p.description}</p>}
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingPlan(p);
                            setShowPlanForm(true);
                          }}
                          className="p-1 border border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 rounded cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deletePlan(p.id)}
                          disabled={!p.isActive}
                          className="p-1 border border-zinc-200 dark:border-zinc-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 disabled:opacity-40 rounded cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: Payments configuration and Payment methods */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-800/60 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white">Currency & Accepted Methods</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">View transaction symbols and adjust front-desk register options.</p>
                </div>
              </div>

              {/* Currency field (Disabled / INR Only) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    Base Ledger Currency
                  </label>
                  <input
                    type="text"
                    value="INR (₹)"
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 font-bold"
                  />
                  <span className="text-[9px] text-zinc-400">Indian Rupee is the standard currency module.</span>
                </div>
              </div>

              {/* Add Custom Method Form */}
              <div className="space-y-3 pt-4 border-t border-zinc-150 dark:border-zinc-800/80">
                <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Accepted Front-Desk payment methods</h4>
                <div className="flex gap-2 text-xs">
                  <input
                    type="text"
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value)}
                    placeholder="e.g. Netbanking, Sodexo"
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddPaymentMethod}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Method
                  </button>
                </div>

                {/* Lists */}
                <div className="space-y-1.5 pt-2 text-xs">
                  {methods.map(method => (
                    <div 
                      key={method}
                      className="flex justify-between items-center p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                    >
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 uppercase">{method}</span>
                      <button
                        onClick={() => handleRemovePaymentMethod(method)}
                        className="p-1 border border-zinc-200 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded cursor-pointer"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: Notifications (Future Integrations) */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleNotificationsSave} className="space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-800/60 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white">Retention & Notifications</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Enable membership reminders and templates for future messaging API routes.</p>
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-center"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Expiring Soon Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <div>
                    <h4 className="font-bold text-zinc-800 dark:text-zinc-200">Enable Expiration Alerts</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Toggle automatic notification prompts for expiring memberships on desk terminal.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={enableExpiryReminders}
                      onChange={(e) => setEnableExpiryReminders(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Offset days */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    Alert Offset (Days Before Expiry)
                  </label>
                  <input
                    type="number"
                    value={expiryReminderDays}
                    onChange={(e) => setExpiryReminderDays(Number(e.target.value))}
                    className="w-full max-w-sm px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* WhatsApp message Template */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    WhatsApp Expiration message Template (Simulated draft)
                  </label>
                  <textarea
                    value={whatsappTemplate}
                    onChange={(e) => setWhatsappTemplate(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold h-20 resize-none focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Hi {name}, your membership expires on {expiryDate}."
                  />
                  <span className="text-[9px] text-zinc-400">Tokens available for replacements: {`{name}, {expiryDate}, {daysRemaining}`}</span>
                </div>

                {/* Invoice Confirmation Template */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    Receipt Confirmation message Template
                  </label>
                  <textarea
                    value={paymentTemplate}
                    onChange={(e) => setPaymentTemplate(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-semibold h-20 resize-none focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Hi {name}, thank you for your payment of {amount}."
                  />
                  <span className="text-[9px] text-zinc-400">Tokens available: {`{name}, {amount}, {planName}, {receiptId}`}</span>
                </div>

              </div>
            </form>
          )}

          {/* TAB 6: Appearance (Theme) */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <div className="border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
                <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white">Appearance Settings</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Synchronize the visual palette scheme of your front-desk terminal.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                
                {/* Light */}
                <div 
                  onClick={() => {
                    setTheme('light');
                    triggerSuccess('Appearance settings saved.');
                  }}
                  className={`p-4 rounded-xl border flex flex-col justify-between h-28 cursor-pointer transition-all ${
                    theme === 'light'
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/15 border-indigo-500'
                      : 'bg-zinc-50 dark:bg-zinc-950/30 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div>
                    <span className="font-black text-zinc-900 dark:text-zinc-100 block">Light Mode</span>
                    <span className="text-[10px] text-zinc-400 mt-1 block leading-relaxed">Elegant off-white grids, clean shadows, readable high-contrast text.</span>
                  </div>
                  <div className="flex justify-end">
                    {theme === 'light' && <div className="p-0.5 bg-indigo-600 rounded-full text-white"><Check className="w-3 h-3" /></div>}
                  </div>
                </div>

                {/* Dark */}
                <div 
                  onClick={() => {
                    setTheme('dark');
                    triggerSuccess('Appearance settings saved.');
                  }}
                  className={`p-4 rounded-xl border flex flex-col justify-between h-28 cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/15 border-indigo-500'
                      : 'bg-zinc-50 dark:bg-zinc-950/30 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div>
                    <span className="font-black text-zinc-100 block">Dark Mode</span>
                    <span className="text-[10px] text-zinc-400 mt-1 block leading-relaxed">Comfortable charcoal canvas, soft borders, and low visual fatigue.</span>
                  </div>
                  <div className="flex justify-end">
                    {theme === 'dark' && <div className="p-0.5 bg-indigo-600 rounded-full text-white"><Check className="w-3 h-3" /></div>}
                  </div>
                </div>

                {/* System */}
                <div 
                  onClick={() => {
                    setTheme('system');
                    triggerSuccess('Appearance settings saved.');
                  }}
                  className={`p-4 rounded-xl border flex flex-col justify-between h-28 cursor-pointer transition-all ${
                    theme === 'system'
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/15 border-indigo-500'
                      : 'bg-zinc-50 dark:bg-zinc-950/30 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div>
                    <span className="font-black text-zinc-900 dark:text-zinc-100 block">System Default</span>
                    <span className="text-[10px] text-zinc-400 mt-1 block leading-relaxed">Automatically align workspace layout with local OS preferences.</span>
                  </div>
                  <div className="flex justify-end">
                    {theme === 'system' && <div className="p-0.5 bg-indigo-600 rounded-full text-white"><Check className="w-3 h-3" /></div>}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* --- RENDER SUB-MODALS --- */}
      {showPlanForm && (
        <PlanFormModal 
          plan={editingPlan}
          onClose={() => setShowPlanForm(false)}
          onSuccess={() => {
            setShowPlanForm(false);
            triggerSuccess('Settings updated successfully.');
          }}
        />
      )}

    </div>
  );

  // Helper method to satisfy linter for typescript expressions
  function setCountryValue() {
    return 'India';
  }
};
