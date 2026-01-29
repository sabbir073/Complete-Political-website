'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTheme } from '@/providers/ThemeProvider';
import { FaDownload, FaPrint, FaArrowLeft, FaMagnifyingGlass, FaRotateRight, FaCircleExclamation, FaCommentSms, FaXmark } from 'react-icons/fa6';

// Bengali number conversion utilities
const englishToBengali: { [key: string]: string } = {
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
  '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
};

const bengaliToEnglish: { [key: string]: string } = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

// Convert any number (Bengali or English) to English digits only
const toEnglishDigits = (str: string): string => {
  return str.split('').map(char => bengaliToEnglish[char] || char).join('');
};

// Convert English digits to Bengali
const toBengaliDigits = (str: string): string => {
  return str.split('').map(char => englishToBengali[char] || char).join('');
};

// Format date string as dd/mm/yyyy with Bengali numbers
// Adds slash immediately after 2 digits (day) and after 4 digits (month)
const formatDateInput = (value: string): string => {
  // Convert any Bengali digits to English for processing
  const englishValue = toEnglishDigits(value);

  // Remove all non-digit characters
  const digitsOnly = englishValue.replace(/\D/g, '');

  // Limit to 8 digits (ddmmyyyy)
  const limited = digitsOnly.slice(0, 8);

  // Format as dd/mm/yyyy - add slash after 2nd and 4th digit
  let formatted = '';
  for (let i = 0; i < limited.length; i++) {
    formatted += limited[i];
    // Add slash after 2nd digit (day) and 4th digit (month)
    if (i === 1 && limited.length > 2) {
      formatted += '/';
    } else if (i === 1 && limited.length === 2) {
      formatted += '/'; // Add slash immediately after typing 2nd digit
    } else if (i === 3 && limited.length > 4) {
      formatted += '/';
    } else if (i === 3 && limited.length === 4) {
      formatted += '/'; // Add slash immediately after typing 4th digit
    }
  }

  // Convert to Bengali digits for display
  return toBengaliDigits(formatted);
};

// Convert dd/mm/yyyy (Bengali) to YYYY-MM-DD (English) for API
const convertToApiFormat = (bengaliDate: string): string => {
  const englishDate = toEnglishDigits(bengaliDate);
  const parts = englishDate.split('/');
  if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }
  return '';
};

// Validate date format dd/mm/yyyy (complete date only)
const isValidDateFormat = (bengaliDate: string): boolean => {
  // Remove trailing slash for validation
  const cleanDate = bengaliDate.replace(/\/$/, '');
  const englishDate = toEnglishDigits(cleanDate);
  const parts = englishDate.split('/');
  if (parts.length !== 3) return false;

  const [day, month, year] = parts;
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) return false;

  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
  if (d < 1 || d > 31) return false;
  if (m < 1 || m > 12) return false;
  if (y < 1900 || y > 2100) return false;

  return true;
};

interface VoterMetadata {
  id: string;
  voter_area_name: string;
  voter_area_no: string;
  union_pouro_ward_cant_board?: string;
  ward_no_for_union?: string;
  district?: string;
  upazila_thana?: string;
  cc_pourosova?: string;
  post_office?: string;
  postal_code?: string;
}

interface Voter {
  id: string;
  serial_no: string;
  voter_no: string;
  voter_name: string;
  father_name: string;
  mother_name: string;
  profession?: string;
  date_of_birth: string;
  address?: string;
  voter_metadata: VoterMetadata;
}

interface Ward {
  id: string;
  voter_area_name: string;
  voter_area_no: string;
  union_pouro_ward_cant_board?: string;
  ward_no_for_union?: string;
}

export default function FindVoterPage() {
  const { isDark } = useTheme();
  const [voterName, setVoterName] = useState('');
  const [dateOfBirthDisplay, setDateOfBirthDisplay] = useState(''); // Bengali formatted dd/mm/yyyy
  const [dateOfBirth, setDateOfBirth] = useState(''); // API format YYYY-MM-DD
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [wards, setWards] = useState<Ward[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState<{ dob?: string; ward?: string }>({});
  const printRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Fetch wards on mount
  useEffect(() => {
    fetchWards();
  }, []);

  const fetchWards = async () => {
    try {
      const response = await fetch('/api/voters/wards');
      if (response.ok) {
        const data = await response.json();
        setWards(data.wards || []);
      }
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
  };

  // Handle date input with auto-formatting and cursor positioning
  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    const formatted = formatDateInput(inputValue);
    setDateOfBirthDisplay(formatted);

    // Convert to API format if valid
    if (isValidDateFormat(formatted)) {
      const apiFormat = convertToApiFormat(formatted);
      setDateOfBirth(apiFormat);
    } else {
      setDateOfBirth('');
    }

    // Clear error when typing
    if (errors.dob) {
      setErrors({ ...errors, dob: undefined });
    }

    // Set cursor position after React updates the input
    // Always move cursor to end of formatted string (after any auto-inserted slash)
    setTimeout(() => {
      if (dateInputRef.current) {
        const newCursorPos = formatted.length;
        dateInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle keydown for better UX (backspace handling)
  const handleDateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 46, 9, 27, 13].includes(e.keyCode)) {
      return;
    }

    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode)) {
      return;
    }

    // Allow: home, end, left, right
    if (e.keyCode >= 35 && e.keyCode <= 39) {
      return;
    }

    // Get the character
    const char = e.key;

    // Check if it's a number (English or Bengali)
    const isEnglishDigit = /^[0-9]$/.test(char);
    const isBengaliDigit = /^[০-৯]$/.test(char);

    if (!isEnglishDigit && !isBengaliDigit) {
      e.preventDefault();
    }
  };

  const validateForm = () => {
    const newErrors: { dob?: string; ward?: string } = {};

    if (!dateOfBirthDisplay) {
      newErrors.dob = 'জন্ম তারিখ আবশ্যক';
    } else if (!isValidDateFormat(dateOfBirthDisplay)) {
      newErrors.dob = 'সঠিক তারিখ প্রদান করুন (দিন/মাস/বছর)';
    }

    if (!selectedWard) {
      newErrors.ward = 'ওয়ার্ড নির্বাচন আবশ্যক';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams({
        dateOfBirth,
        wardId: selectedWard,
      });

      if (voterName) {
        params.append('voterName', voterName);
      }

      if (selectedArea) {
        params.append('areaId', selectedArea);
      }

      const response = await fetch(`/api/voters/search?${params}`);
      const data = await response.json();

      if (response.ok) {
        setVoters(data.voters || []);
      } else {
        console.error('Search error:', data.error);
        setVoters([]);
      }
    } catch (error) {
      console.error('Error searching voters:', error);
      setVoters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setVoterName('');
    setDateOfBirthDisplay('');
    setDateOfBirth('');
    setSelectedWard('');
    setSelectedArea('');
    setVoters([]);
    setSearched(false);
    setErrors({});
  };

  const handleViewVoter = (voter: Voter) => {
    setSelectedVoter(voter);
    setShowModal(true);
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>ভোটার তথ্য</title>
            <style>
              body { font-family: 'SolaimanLipi', 'Noto Sans Bengali', Arial, sans-serif; padding: 20px; }
              .print-container { max-width: 600px; margin: 0 auto; border: 3px solid #1e5631; padding: 20px; }
              .header { text-align: center; border-bottom: 2px solid #1e5631; padding-bottom: 15px; margin-bottom: 15px; }
              .header img { max-width: 100%; height: auto; }
              .slogan { background: #fff3cd; border: 2px solid #1e5631; padding: 10px; text-align: center; font-weight: bold; margin: 15px 0; }
              .center-info { background: #1e5631; color: white; padding: 10px; text-align: center; font-weight: bold; margin-bottom: 15px; }
              .info-row { display: flex; margin-bottom: 8px; }
              .info-label { font-weight: bold; min-width: 120px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownload = () => {
    if (!selectedVoter) return;

    const content = `
ভোটার তথ্য
━━━━━━━━━━━━━━━━━━━━━━

কেন্দ্র: ${selectedVoter.voter_metadata?.voter_area_name || ''} কেন্দ্র-${selectedVoter.voter_metadata?.voter_area_no || ''}

নাম: ${selectedVoter.voter_name}
সিরিয়াল নাম্বার: ${selectedVoter.serial_no}
ভোটার নং: ${selectedVoter.voter_no}
জন্ম তারিখ: ${formatDateBengali(selectedVoter.date_of_birth)}
পিতা/স্বামী: ${selectedVoter.father_name || '-'}
মাতা: ${selectedVoter.mother_name || '-'}
${selectedVoter.voter_metadata?.voter_area_name ? `এলাকা: ${selectedVoter.voter_metadata.voter_area_name}` : ''}
${selectedVoter.voter_metadata?.union_pouro_ward_cant_board ? `ওয়ার্ড: ${selectedVoter.voter_metadata.union_pouro_ward_cant_board}` : ''}

━━━━━━━━━━━━━━━━━━━━━━
এইসি, আইটি, ঢাকা।
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voter-${selectedVoter.voter_no}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSMS = () => {
    if (!selectedVoter) return;

    const message = `ভোটার তথ্য: ${selectedVoter.voter_name}, ভোটার নং: ${selectedVoter.voter_no}, কেন্দ্র: ${selectedVoter.voter_metadata?.voter_area_name || ''} কেন্দ্র-${selectedVoter.voter_metadata?.voter_area_no || ''}`;
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
  };

  const formatDateBengali = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return toBengaliDigits(`${day}/${month}/${year}`);
  };

  const selectedWardData = wards.find(w => w.id === selectedWard);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Hero Section - Image Left, Search Right */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} py-6 md:py-10`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left - Campaign Image */}
              <div className="p-4 md:p-6 lg:p-8">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/vote.jpg"
                    alt="এস এম জাহাঙ্গীর হোসেন"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                </div>
              </div>

              {/* Right - Search Form */}
              <div className="p-4 md:p-6 lg:p-8 flex flex-col justify-center">
                <div className="mb-6">
                  <h1 className={`text-xl md:text-2xl lg:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#1e5631]'}`}>
                    ভোটার তথ্য অনুসন্ধান
                  </h1>
                  <p className={`text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    আপনার ভোট কেন্দ্রের নাম জানতে নিচের তথ্য প্রদান করুন
                  </p>
                </div>

                <form onSubmit={handleSearch} className="space-y-4">
                  {/* Row 1: Voter Name & Date of Birth */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Voter Name */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        ভোটার নাম
                      </label>
                      <input
                        type="text"
                        value={voterName}
                        onChange={(e) => setVoterName(e.target.value)}
                        placeholder="ভোটার নাম প্রবেশ করুন"
                        className={`w-full px-4 py-3 rounded-lg border-2 ${isDark ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-500' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'} focus:border-[#1e5631] focus:ring-2 focus:ring-[#1e5631]/20 focus:outline-none transition-all`}
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        জন্ম তারিখ (দিন/মাস/বছর) <span className="text-red-500">*</span>
                      </label>
                      <input
                        ref={dateInputRef}
                        type="text"
                        inputMode="numeric"
                        value={dateOfBirthDisplay}
                        onChange={handleDateInput}
                        onKeyDown={handleDateKeyDown}
                        placeholder="দিন/মাস/বছর"
                        maxLength={10}
                        className={`w-full px-4 py-3 rounded-lg border-2 ${errors.dob ? 'border-red-400 bg-red-50' : isDark ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-500' : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'} focus:border-[#1e5631] focus:ring-2 focus:ring-[#1e5631]/20 focus:outline-none transition-all text-lg tracking-wider`}
                      />
                      {errors.dob && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <FaCircleExclamation className="w-3 h-3" /> {errors.dob}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Ward & Area Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ward Selection */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        ওয়ার্ড নির্বাচন করুন <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedWard}
                        onChange={(e) => {
                          setSelectedWard(e.target.value);
                          setSelectedArea('');
                          if (errors.ward) setErrors({ ...errors, ward: undefined });
                        }}
                        className={`w-full px-4 py-3 rounded-lg border-2 ${errors.ward ? 'border-red-400 bg-red-50' : isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-200 bg-gray-50 text-gray-900'} focus:border-[#1e5631] focus:ring-2 focus:ring-[#1e5631]/20 focus:outline-none transition-all`}
                      >
                        <option value="">ওয়ার্ড/ইউনিয়ন/এলাকা সিলেক্ট করুন</option>
                        {wards.map((ward) => (
                          <option key={ward.id} value={ward.id}>
                            {ward.voter_area_no}. {ward.voter_area_name}
                          </option>
                        ))}
                      </select>
                      {errors.ward && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <FaCircleExclamation className="w-3 h-3" /> {errors.ward}
                        </p>
                      )}
                    </div>

                    {/* Area Selection */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        এলাকা নির্বাচন করুন (ঐচ্ছিক)
                      </label>
                      <select
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        disabled={!selectedWard}
                        className={`w-full px-4 py-3 rounded-lg border-2 ${isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-200 bg-gray-50 text-gray-900'} focus:border-[#1e5631] focus:ring-2 focus:ring-[#1e5631]/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <option value="">প্রথমে ওয়ার্ড নির্বাচন করুন</option>
                        {selectedWardData && (
                          <option value={selectedWardData.id}>
                            {selectedWardData.voter_area_name}
                          </option>
                        )}
                      </select>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        (ওয়ার্ড নির্বাচনের পর এলাকা সিলেক্ট করুন)
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleReset}
                      className={`flex-1 px-6 py-3 border-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                      <FaRotateRight className="w-4 h-4" />
                      রিসেট
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-[#1e5631] hover:bg-[#164425] text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <FaMagnifyingGlass className="w-4 h-4" />
                      অনুসন্ধান
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Results Header */}
            <div className={`${isDark ? 'bg-[#1a4d3a]' : 'bg-[#1e5631]'} text-white px-6 py-4 rounded-t-xl flex items-center justify-between`}>
              <div>
                {loading ? (
                  <span className="text-lg">অনুসন্ধান করা হচ্ছে...</span>
                ) : (
                  <span className="text-lg font-semibold">{voters.length} টি ভোটার তথ্য পাওয়া গেছে</span>
                )}
              </div>
              {voters.length > 0 && dateOfBirthDisplay && (
                <span className="text-sm text-green-200">
                  জন্ম তারিখ: {dateOfBirthDisplay}
                </span>
              )}
            </div>

            {/* Results Table */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-b-xl overflow-hidden shadow-xl`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <tr>
                      <th className={`px-4 py-4 text-left text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>ক্রমিক</th>
                      <th className={`px-4 py-4 text-left text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>কেন্দ্র নাম</th>
                      <th className={`px-4 py-4 text-left text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>নাম</th>
                      <th className={`px-4 py-4 text-left text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>মাতার নাম</th>
                      <th className={`px-4 py-4 text-left text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>পিতা/স্বামী</th>
                      <th className={`px-4 py-4 text-left text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>জন্ম তারিখ</th>
                      <th className={`px-4 py-4 text-center text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>স্লিপ</th>
                    </tr>
                  </thead>
                  <tbody className={isDark ? 'text-gray-200' : 'text-gray-800'}>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#1e5631] border-t-transparent"></div>
                            <span className="text-lg">লোড হচ্ছে...</span>
                          </div>
                        </td>
                      </tr>
                    ) : voters.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center">
                          <div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            কোন ভোটার তথ্য পাওয়া যায়নি
                          </div>
                          <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            অনুগ্রহ করে আপনার তথ্য সঠিকভাবে প্রদান করুন
                          </p>
                        </td>
                      </tr>
                    ) : (
                      voters.map((voter) => (
                        <tr
                          key={voter.id}
                          className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
                        >
                          <td className="px-4 py-4 text-sm font-medium">{voter.serial_no}</td>
                          <td className="px-4 py-4 text-sm">
                            <span className="font-medium">{voter.voter_metadata?.voter_area_no}.</span> {voter.voter_metadata?.voter_area_name}
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold">{voter.voter_name}</td>
                          <td className="px-4 py-4 text-sm">{voter.mother_name || '-'}</td>
                          <td className="px-4 py-4 text-sm">{voter.father_name || '-'}</td>
                          <td className="px-4 py-4 text-sm">{formatDateBengali(voter.date_of_birth)}</td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => handleViewVoter(voter)}
                              className="px-5 py-2 bg-[#2196F3] hover:bg-[#1976D2] text-white text-sm font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                            >
                              ভোটার তথ্য
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voter Details Modal */}
      {showModal && selectedVoter && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'} transition-colors`}
                >
                  <FaArrowLeft className="w-5 h-5" />
                </button>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ভোটারের তথ্য
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'} transition-colors`}
              >
                <FaXmark className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 p-4 bg-gradient-to-r from-[#1e5631] to-[#2d7a4a]">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/20"
              >
                <FaDownload className="w-4 h-4" />
                ডাউনলোড
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/20"
              >
                <FaPrint className="w-4 h-4" />
                প্রিন্ট
              </button>
              <button
                onClick={handleSMS}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#e74c3c] hover:bg-[#c0392b] text-white font-medium rounded-xl transition-all"
              >
                <FaCommentSms className="w-4 h-4" />
                এসএমএস
              </button>
            </div>

            {/* Printable Content */}
            <div ref={printRef} className="overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="p-4">
                <div className="border-4 border-[#1e5631] rounded-xl overflow-hidden">
                  {/* Campaign Header Image */}
                  <div className="relative w-full aspect-[16/9]">
                    <Image
                      src="/vote.jpg"
                      alt="এস এম জাহাঙ্গীর হোসেন"
                      fill
                      className="object-cover object-top"
                    />
                  </div>

                  {/* Slogan */}
                  <div className="bg-[#fff3cd] border-y-2 border-[#1e5631] px-4 py-3 text-center">
                    <p className="font-bold text-[#1e5631] text-sm md:text-base">
                      এস এম জাহাঙ্গীর হোসেন এর সালাম নিন, ধানের শীষে ভোট দিন।
                    </p>
                    <p className="font-bold text-[#1e5631] text-sm md:text-base">
                      তারুণ্যের প্রথম ভোট, ধানের শীষের পক্ষে হোক।
                    </p>
                  </div>

                  {/* Center Info */}
                  <div className="bg-[#1e5631] text-white px-4 py-3 text-center font-bold">
                    কেন্দ্র: {selectedVoter.voter_metadata?.voter_area_no}. {selectedVoter.voter_metadata?.voter_area_name} কেন্দ্র-{selectedVoter.voter_metadata?.voter_area_no}
                  </div>

                  {/* Voter Details */}
                  <div className={`p-5 ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}>
                    <div className="space-y-3">
                      <div className="flex border-b border-gray-200 dark:border-gray-700 pb-2">
                        <span className="font-bold min-w-[140px] text-[#1e5631]">নাম:</span>
                        <span className="font-semibold">{selectedVoter.voter_name}</span>
                      </div>
                      <div className="flex border-b border-gray-200 dark:border-gray-700 pb-2">
                        <span className="font-bold min-w-[140px] text-[#1e5631]">সিরিয়াল নাম্বার:</span>
                        <span>{selectedVoter.serial_no}</span>
                      </div>
                      <div className="flex border-b border-gray-200 dark:border-gray-700 pb-2">
                        <span className="font-bold min-w-[140px] text-[#1e5631]">ভোটার নং:</span>
                        <span className="font-mono">{selectedVoter.voter_no}</span>
                      </div>
                      <div className="flex border-b border-gray-200 dark:border-gray-700 pb-2">
                        <span className="font-bold min-w-[140px] text-[#1e5631]">জন্ম তারিখ:</span>
                        <span>{formatDateBengali(selectedVoter.date_of_birth)}</span>
                      </div>
                      <div className="flex border-b border-gray-200 dark:border-gray-700 pb-2">
                        <span className="font-bold min-w-[140px] text-[#1e5631]">পিতা/স্বামী:</span>
                        <span>{selectedVoter.father_name || '-'}</span>
                      </div>
                      <div className="flex border-b border-gray-200 dark:border-gray-700 pb-2">
                        <span className="font-bold min-w-[140px] text-[#1e5631]">মাতা:</span>
                        <span>{selectedVoter.mother_name || '-'}</span>
                      </div>
                      {selectedVoter.voter_metadata?.voter_area_name && (
                        <div className="flex border-b border-gray-200 dark:border-gray-700 pb-2">
                          <span className="font-bold min-w-[140px] text-[#1e5631]">এলাকা:</span>
                          <span>{selectedVoter.voter_metadata.voter_area_name}</span>
                        </div>
                      )}
                      {selectedVoter.voter_metadata?.union_pouro_ward_cant_board && (
                        <div className="flex">
                          <span className="font-bold min-w-[140px] text-[#1e5631]">ওয়ার্ড:</span>
                          <span>{selectedVoter.voter_metadata.union_pouro_ward_cant_board}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={`px-4 py-3 text-center text-sm ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'} border-t border-gray-200`}>
                    এইসি, আইটি, ঢাকা।
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
