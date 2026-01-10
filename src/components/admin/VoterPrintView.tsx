'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { useEffect } from 'react';

interface VoterMetadata {
  district: string;
  upazila_thana: string;
  ward_no: string;
  voter_area_name: string;
  voter_area_no: string;
  city_corporation_pourashava: string;
  post_office: string;
  post_code: string;
}

interface Voter {
  id: string;
  serial_no: string;
  voter_no: string;
  voter_name: string;
  father_name: string;
  mother_name: string;
  profession: string;
  date_of_birth: string;
  address: string;
  voter_metadata: VoterMetadata;
}

interface VoterPrintViewProps {
  voter: Voter;
  onClose: () => void;
}

export default function VoterPrintView({ voter, onClose }: VoterPrintViewProps) {
  const { language } = useLanguage();

  useEffect(() => {
    // Add print-specific styles
    document.body.classList.add('print-mode');
    return () => {
      document.body.classList.remove('print-mode');
    };
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 print:p-0 print:bg-white">
      {/* Print Actions - Hidden during print */}
      <div className="max-w-4xl mx-auto mb-4 print:hidden">
        <div className="flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {language === 'bn' ? 'প্রিন্ট করুন' : 'Print'}
          </button>
        </div>
      </div>

      {/* Printable Content */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 print:bg-white shadow-lg print:shadow-none rounded-lg print:rounded-none p-8">
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-300 print:border-black">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white print:text-black mb-2">
            {language === 'bn' ? 'ভোটার তথ্য' : 'Voter Information'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 print:text-gray-700">
            {language === 'bn' ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার' : 'Government of the People\'s Republic of Bangladesh'}
          </p>
        </div>

        {/* Metadata Section */}
        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 print:bg-gray-50 rounded-lg print:rounded-none border border-gray-200 dark:border-gray-600 print:border-gray-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white print:text-black mb-4">
            {language === 'bn' ? 'এলাকার তথ্য' : 'Area Information'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-700">
                {language === 'bn' ? 'জেলা' : 'District'}
              </p>
              <p className="font-semibold text-gray-900 dark:text-white print:text-black">
                {voter.voter_metadata?.district || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-700">
                {language === 'bn' ? 'উপজেলা/থানা' : 'Upazila/Thana'}
              </p>
              <p className="font-semibold text-gray-900 dark:text-white print:text-black">
                {voter.voter_metadata?.upazila_thana || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-700">
                {language === 'bn' ? 'ওয়ার্ড নং' : 'Ward No'}
              </p>
              <p className="font-semibold text-gray-900 dark:text-white print:text-black">
                {voter.voter_metadata?.ward_no || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-700">
                {language === 'bn' ? 'ভোটার এলাকা' : 'Voter Area'}
              </p>
              <p className="font-semibold text-gray-900 dark:text-white print:text-black">
                {voter.voter_metadata?.voter_area_name || '-'} ({voter.voter_metadata?.voter_area_no || '-'})
              </p>
            </div>
            {voter.voter_metadata?.city_corporation_pourashava && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-700">
                  {language === 'bn' ? 'সিটি কর্পোরেশন/পৌরসভা' : 'City Corporation/Pourashava'}
                </p>
                <p className="font-semibold text-gray-900 dark:text-white print:text-black">
                  {voter.voter_metadata.city_corporation_pourashava}
                </p>
              </div>
            )}
            {voter.voter_metadata?.post_office && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-700">
                  {language === 'bn' ? 'ডাকঘর' : 'Post Office'}
                </p>
                <p className="font-semibold text-gray-900 dark:text-white print:text-black">
                  {voter.voter_metadata.post_office} - {voter.voter_metadata.post_code || ''}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Voter Details */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white print:text-black mb-6 pb-2 border-b border-gray-300 dark:border-gray-600 print:border-gray-400">
            {language === 'bn' ? 'ভোটারের বিবরণ' : 'Voter Details'}
          </h2>

          <div className="space-y-6">
            {/* Serial and Voter Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="w-40 flex-shrink-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 print:text-gray-700">
                    {language === 'bn' ? 'ক্রমিক নং' : 'Serial No'}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white print:text-black">
                    {voter.serial_no}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-40 flex-shrink-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 print:text-gray-700">
                    {language === 'bn' ? 'ভোটার নং' : 'Voter No'}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-primary-600 dark:text-primary-400 print:text-black">
                    {voter.voter_no}
                  </p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="flex items-start bg-primary-50 dark:bg-primary-900/20 print:bg-primary-50 p-4 rounded-lg print:rounded-none">
              <div className="w-40 flex-shrink-0">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 print:text-gray-700">
                  {language === 'bn' ? 'নাম' : 'Name'}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold text-gray-900 dark:text-white print:text-black">
                  {voter.voter_name}
                </p>
              </div>
            </div>

            {/* Father's Name */}
            <div className="flex items-start">
              <div className="w-40 flex-shrink-0">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 print:text-gray-700">
                  {language === 'bn' ? 'পিতার নাম' : "Father's Name"}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-lg text-gray-900 dark:text-white print:text-black">
                  {voter.father_name || '-'}
                </p>
              </div>
            </div>

            {/* Mother's Name */}
            <div className="flex items-start">
              <div className="w-40 flex-shrink-0">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 print:text-gray-700">
                  {language === 'bn' ? 'মাতার নাম' : "Mother's Name"}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-lg text-gray-900 dark:text-white print:text-black">
                  {voter.mother_name || '-'}
                </p>
              </div>
            </div>

            {/* Profession */}
            {voter.profession && (
              <div className="flex items-start">
                <div className="w-40 flex-shrink-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 print:text-gray-700">
                    {language === 'bn' ? 'পেশা' : 'Profession'}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-lg text-gray-900 dark:text-white print:text-black">
                    {voter.profession}
                  </p>
                </div>
              </div>
            )}

            {/* Date of Birth */}
            <div className="flex items-start">
              <div className="w-40 flex-shrink-0">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 print:text-gray-700">
                  {language === 'bn' ? 'জন্ম তারিখ' : 'Date of Birth'}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-lg text-gray-900 dark:text-white print:text-black">
                  {formatDate(voter.date_of_birth)}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start">
              <div className="w-40 flex-shrink-0">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 print:text-gray-700">
                  {language === 'bn' ? 'ঠিকানা' : 'Address'}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-lg text-gray-900 dark:text-white print:text-black">
                  {voter.address || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600 print:border-gray-400 text-center text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">
          <p>
            {language === 'bn'
              ? 'এই তথ্য নির্বাচন কমিশন, বাংলাদেশ কর্তৃক প্রদত্ত ভোটার তালিকা থেকে সংগৃহীত'
              : 'This information is compiled from the voter list provided by the Election Commission, Bangladesh'}
          </p>
          <p className="mt-2">
            {language === 'bn' ? 'মুদ্রণ তারিখ' : 'Print Date'}: {new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
          </p>
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body.print-mode {
            margin: 0;
            padding: 0;
          }

          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}
