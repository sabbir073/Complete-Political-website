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
  const [smsPhone, setSmsPhone] = useState('');
  const [showSmsInput, setShowSmsInput] = useState(false);
  const [smsSending, setSmsSending] = useState(false);
  const [smsError, setSmsError] = useState('');
  const [smsSuccess, setSmsSuccess] = useState('');
  const printRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);
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
    setShowSmsInput(false);
    setSmsPhone('');
    setSmsError('');
    setSmsSuccess('');
  };

  const handlePrint = () => {
    if (!selectedVoter) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>ভোটার তথ্য - ${selectedVoter.voter_name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Noto Sans Bengali', 'SolaimanLipi', Arial, sans-serif;
              padding: 40px;
              background: #fff;
              color: #000;
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
              border: 2px solid #000;
              border-radius: 8px;
              overflow: hidden;
            }
            .header {
              background: #fff;
              color: #000;
              padding: 20px;
              text-align: center;
              border-bottom: 2px solid #000;
            }
            .header h1 { font-size: 24px; margin-bottom: 5px; font-weight: 700; }
            .header p { font-size: 14px; }
            .center-info {
              background: #fff;
              color: #000;
              padding: 12px;
              text-align: center;
              font-weight: 700;
              font-size: 15px;
              border-bottom: 2px solid #000;
            }
            .info-section { padding: 25px; }
            .info-row {
              display: flex;
              border-bottom: 1px solid #ccc;
              padding: 12px 0;
            }
            .info-row:last-child { border-bottom: none; }
            .info-label {
              font-weight: 700;
              color: #000;
              min-width: 140px;
              font-size: 14px;
            }
            .info-value {
              font-size: 14px;
              color: #000;
            }
            .info-value.highlight { font-weight: 600; }
            .footer {
              background: #fff;
              padding: 15px;
              text-align: center;
              font-size: 12px;
              color: #000;
              border-top: 1px solid #ccc;
            }
            @media print {
              body { padding: 20px; }
              .container { border-width: 2px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ভোটার তথ্য স্লিপ</h1>
              <p>ঢাকা-১৮ আসন</p>
            </div>
            <div class="center-info">
              ভোট কেন্দ্র: ${selectedVoter.voter_metadata?.voter_area_no}. ${selectedVoter.voter_metadata?.voter_area_name}
            </div>
            <div class="info-section">
              <div class="info-row">
                <span class="info-label">নাম:</span>
                <span class="info-value highlight">${selectedVoter.voter_name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">সিরিয়াল নং:</span>
                <span class="info-value">${selectedVoter.serial_no}</span>
              </div>
              <div class="info-row">
                <span class="info-label">ভোটার নং:</span>
                <span class="info-value">${selectedVoter.voter_no}</span>
              </div>
              <div class="info-row">
                <span class="info-label">জন্ম তারিখ:</span>
                <span class="info-value">${formatDateBengali(selectedVoter.date_of_birth)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">পিতা/স্বামী:</span>
                <span class="info-value">${selectedVoter.father_name || '-'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">মাতা:</span>
                <span class="info-value">${selectedVoter.mother_name || '-'}</span>
              </div>
              ${selectedVoter.voter_metadata?.union_pouro_ward_cant_board ? `
              <div class="info-row">
                <span class="info-label">ওয়ার্ড:</span>
                <span class="info-value">${selectedVoter.voter_metadata.union_pouro_ward_cant_board}</span>
              </div>
              ` : ''}
            </div>
            <div class="footer">
              এস এম জাহাঙ্গীর হোসেন | ঢাকা-১৮ আসন প্রার্থী
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  const handleDownload = async () => {
    if (!selectedVoter || !downloadRef.current) return;

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(downloadRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `voter-slip-${selectedVoter.voter_no}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Download error:', error);
      // Fallback to text download if html2canvas fails
      const content = `ভোটার তথ্য স্লিপ\n${'═'.repeat(30)}\n\nকেন্দ্র: ${selectedVoter.voter_metadata?.voter_area_no}. ${selectedVoter.voter_metadata?.voter_area_name}\n\nনাম: ${selectedVoter.voter_name}\nসিরিয়াল নং: ${selectedVoter.serial_no}\nভোটার নং: ${selectedVoter.voter_no}\nজন্ম তারিখ: ${formatDateBengali(selectedVoter.date_of_birth)}\nপিতা/স্বামী: ${selectedVoter.father_name || '-'}\nমাতা: ${selectedVoter.mother_name || '-'}\n${selectedVoter.voter_metadata?.union_pouro_ward_cant_board ? `ওয়ার্ড: ${selectedVoter.voter_metadata.union_pouro_ward_cant_board}\n` : ''}\n${'═'.repeat(30)}\nএস এম জাহাঙ্গীর হোসেন | ঢাকা-১৮`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voter-slip-${selectedVoter.voter_no}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSMS = () => {
    setShowSmsInput(true);
    setSmsError('');
    setSmsSuccess('');
  };

  const validateBDPhone = (phone: string): boolean => {
    // Bangladesh phone number validation: 01XXXXXXXXX (11 digits)
    const cleaned = phone.replace(/\D/g, '');
    return /^01[3-9]\d{8}$/.test(cleaned);
  };

  const sendSMS = async () => {
    if (!selectedVoter) return;

    const cleanPhone = smsPhone.replace(/\D/g, '');

    if (!validateBDPhone(cleanPhone)) {
      setSmsError('সঠিক বাংলাদেশী মোবাইল নম্বর দিন (01XXXXXXXXX)');
      return;
    }

    setSmsSending(true);
    setSmsError('');

    try {
      const message = `ভোটার তথ্য:\nনাম: ${selectedVoter.voter_name}\nসিরিয়াল নং: ${selectedVoter.serial_no}\nভোটার নং: ${selectedVoter.voter_no}\nজন্ম তারিখ: ${formatDateBengali(selectedVoter.date_of_birth)}\nভোট কেন্দ্র: ${selectedVoter.voter_metadata?.voter_area_no}. ${selectedVoter.voter_metadata?.voter_area_name}${selectedVoter.voter_metadata?.union_pouro_ward_cant_board ? `\nওয়ার্ড: ${selectedVoter.voter_metadata.union_pouro_ward_cant_board}` : ''}`;

      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          message: message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSmsSuccess('এসএমএস সফলভাবে পাঠানো হয়েছে!');
        setSmsPhone('');
        setTimeout(() => {
          setShowSmsInput(false);
          setSmsSuccess('');
        }, 2000);
      } else {
        setSmsError(data.error || 'এসএমএস পাঠাতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('SMS error:', error);
      setSmsError('এসএমএস পাঠাতে সমস্যা হয়েছে');
    } finally {
      setSmsSending(false);
    }
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
              {/* Left - Campaign Image (Full image, no cropping) */}
              <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center">
                <div className="relative w-full rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/vote.jpg"
                    alt="এস এম জাহাঙ্গীর হোসেন"
                    width={600}
                    height={450}
                    className="w-full h-auto object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Right - Search Form (Centered) */}
              <div className="p-4 md:p-6 lg:p-8 flex flex-col justify-center items-center">
                <div className="w-full max-w-md">
                  <div className="mb-6 text-center">
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
                        <option value="">ইউনিয়ন/পৌর ওয়ার্ড/ক্যান্টনমেন্ট বোর্ড সিলেক্ট করুন</option>
                        {wards.map((ward) => (
                          <option key={ward.id} value={ward.id}>
                            {ward.union_pouro_ward_cant_board || ward.voter_area_name}
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200`}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1e5631] to-[#2d7a4a] px-5 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">ভোটার তথ্য স্লিপ</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <FaXmark className="w-5 h-5" />
                </button>
              </div>
              <p className="text-green-100 text-sm mt-1">ঢাকা-১৮ আসন</p>
            </div>

            {/* Voter Info Card - For Download as PNG (Black & White only with inline styles) */}
            <div className="overflow-y-auto max-h-[calc(90vh-280px)]">
              <div
                ref={downloadRef}
                style={{ padding: '16px', backgroundColor: '#ffffff', fontFamily: 'Noto Sans Bengali, SolaimanLipi, Arial, sans-serif' }}
              >
                <div style={{ border: '2px solid #000000', borderRadius: '8px', overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ backgroundColor: '#ffffff', padding: '16px', textAlign: 'center', borderBottom: '2px solid #000000' }}>
                    <p style={{ fontWeight: '700', fontSize: '18px', color: '#000000', margin: '0 0 4px 0' }}>ভোটার তথ্য স্লিপ</p>
                    <p style={{ fontSize: '14px', color: '#000000', margin: 0 }}>ঢাকা-১৮ আসন</p>
                  </div>

                  {/* Center Info */}
                  <div style={{ backgroundColor: '#ffffff', padding: '12px', textAlign: 'center', borderBottom: '2px solid #000000' }}>
                    <p style={{ fontWeight: '700', fontSize: '14px', color: '#000000', margin: '0 0 4px 0' }}>ভোট কেন্দ্র</p>
                    <p style={{ fontWeight: '700', fontSize: '16px', color: '#000000', margin: 0 }}>{selectedVoter.voter_metadata?.voter_area_no}. {selectedVoter.voter_metadata?.voter_area_name}</p>
                  </div>

                  {/* Voter Details */}
                  <div style={{ padding: '20px', backgroundColor: '#ffffff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #cccccc', padding: '12px 0' }}>
                      <span style={{ fontWeight: '700', minWidth: '120px', color: '#000000', fontSize: '14px' }}>নাম:</span>
                      <span style={{ fontWeight: '700', color: '#000000', fontSize: '14px' }}>{selectedVoter.voter_name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #cccccc', padding: '12px 0' }}>
                      <span style={{ fontWeight: '700', minWidth: '120px', color: '#000000', fontSize: '14px' }}>সিরিয়াল নং:</span>
                      <span style={{ color: '#000000', fontSize: '14px' }}>{selectedVoter.serial_no}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #cccccc', padding: '12px 0' }}>
                      <span style={{ fontWeight: '700', minWidth: '120px', color: '#000000', fontSize: '14px' }}>ভোটার নং:</span>
                      <span style={{ color: '#000000', fontSize: '14px', fontFamily: 'monospace' }}>{selectedVoter.voter_no}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #cccccc', padding: '12px 0' }}>
                      <span style={{ fontWeight: '700', minWidth: '120px', color: '#000000', fontSize: '14px' }}>জন্ম তারিখ:</span>
                      <span style={{ color: '#000000', fontSize: '14px' }}>{formatDateBengali(selectedVoter.date_of_birth)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #cccccc', padding: '12px 0' }}>
                      <span style={{ fontWeight: '700', minWidth: '120px', color: '#000000', fontSize: '14px' }}>পিতা/স্বামী:</span>
                      <span style={{ color: '#000000', fontSize: '14px' }}>{selectedVoter.father_name || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #cccccc', padding: '12px 0' }}>
                      <span style={{ fontWeight: '700', minWidth: '120px', color: '#000000', fontSize: '14px' }}>মাতা:</span>
                      <span style={{ color: '#000000', fontSize: '14px' }}>{selectedVoter.mother_name || '-'}</span>
                    </div>
                    {selectedVoter.voter_metadata?.union_pouro_ward_cant_board && (
                      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
                        <span style={{ fontWeight: '700', minWidth: '120px', color: '#000000', fontSize: '14px' }}>ওয়ার্ড:</span>
                        <span style={{ color: '#000000', fontSize: '14px' }}>{selectedVoter.voter_metadata.union_pouro_ward_cant_board}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ backgroundColor: '#ffffff', padding: '12px', textAlign: 'center', fontSize: '12px', color: '#000000', borderTop: '1px solid #cccccc' }}>
                    এস এম জাহাঙ্গীর হোসেন | ঢাকা-১৮ আসন প্রার্থী
                  </div>
                </div>
              </div>
            </div>

            {/* SMS Input Section */}
            {showSmsInput && (
              <div className={`px-4 py-3 border-t ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={smsPhone}
                      onChange={(e) => setSmsPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className={`w-full px-4 py-2.5 rounded-lg border-2 ${isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-200 bg-white text-gray-900'} focus:border-[#1e5631] focus:outline-none`}
                    />
                  </div>
                  <button
                    onClick={sendSMS}
                    disabled={smsSending}
                    className="px-5 py-2.5 bg-[#1e5631] hover:bg-[#164425] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {smsSending ? 'পাঠানো হচ্ছে...' : 'পাঠান'}
                  </button>
                  <button
                    onClick={() => setShowSmsInput(false)}
                    className={`px-3 py-2.5 rounded-lg ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-colors`}
                  >
                    <FaXmark className="w-4 h-4" />
                  </button>
                </div>
                {smsError && <p className="text-red-500 text-sm mt-2">{smsError}</p>}
                {smsSuccess && <p className="text-green-500 text-sm mt-2">{smsSuccess}</p>}
              </div>
            )}

            {/* Action Buttons */}
            <div className={`flex gap-2 p-4 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#2196F3] hover:bg-[#1976D2] text-white font-medium rounded-xl transition-colors"
              >
                <FaDownload className="w-4 h-4" />
                ডাউনলোড
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1e5631] hover:bg-[#164425] text-white font-medium rounded-xl transition-colors"
              >
                <FaPrint className="w-4 h-4" />
                প্রিন্ট
              </button>
              <button
                onClick={handleSMS}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#e74c3c] hover:bg-[#c0392b] text-white font-medium rounded-xl transition-colors"
              >
                <FaCommentSms className="w-4 h-4" />
                এসএমএস
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
