'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import Link from 'next/link';
import { format } from 'date-fns';
import { uploadFileWithMultipart, UploadConfig } from '@/lib/s3-multipart-upload';
import SocialShare from '@/components/SocialShare';

interface Winner {
  id: string;
  rank: number;
  name: string;
  image?: string;
}

interface Challenge {
  id: string;
  title_en: string;
  title_bn: string;
  description_en?: string;
  description_bn?: string;
  rules_en?: string;
  rules_bn?: string;
  cover_image?: string;
  start_date: string;
  end_date: string;
  status: string;
  computed_status: string;
  winners?: Winner[];
}

interface UploadedFile {
  url: string;
  s3Key: string;
  filename: string;
  fileType: string;
  fileSize: number;
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  result?: UploadedFile;
  error?: string;
  id: string;
}

const challengeUploadConfig: UploadConfig = {
  regularEndpoint: '/api/challenges/upload',
  initiateEndpoint: '/api/challenges/upload/multipart/initiate',
  completeEndpoint: '/api/challenges/upload/multipart/complete',
};

const MAX_FILES = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/mov', 'video/avi', 'video/quicktime', 'video/webm'];

export default function ChallengeDetailClient({ challengeId }: { challengeId: string }) {
  const { language } = useLanguage();
  const { isDark } = useTheme();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getText = useCallback((en: string, bn?: string) => {
    if (language === 'bn' && bn) return bn;
    return en;
  }, [language]);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/challenges/${challengeId}`);
        const data = await res.json();
        if (data.success) setChallenge(data.data);
        else setNotFound(true);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [challengeId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const remaining = MAX_FILES - files.length;
    if (remaining <= 0) return;

    const toAdd = selected.slice(0, remaining).filter(f => {
      if (!ACCEPTED_TYPES.includes(f.type)) return false;
      if (f.size > 200 * 1024 * 1024) return false;
      return true;
    });

    const newFiles: FileWithProgress[] = toAdd.map(f => ({
      file: f,
      progress: 0,
      status: 'pending' as const,
      id: `${Date.now()}-${Math.random()}`,
    }));

    setFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFiles = async (): Promise<UploadedFile[]> => {
    const results: UploadedFile[] = [];

    for (const fileItem of files) {
      if (fileItem.status === 'done' && fileItem.result) {
        results.push(fileItem.result);
        continue;
      }

      setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'uploading' } : f));

      const result = await uploadFileWithMultipart(
        fileItem.file,
        fileItem.file.name,
        challengeUploadConfig,
        {
          onProgress: (progress) => {
            setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, progress } : f));
          },
        }
      );

      if (result.success && result.url) {
        const uploaded: UploadedFile = {
          url: result.url,
          s3Key: result.s3Key || '',
          filename: result.filename || fileItem.file.name,
          fileType: fileItem.file.type,
          fileSize: fileItem.file.size,
        };
        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'done', progress: 100, result: uploaded } : f));
        results.push(uploaded);
      } else {
        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'error', error: result.error } : f));
        throw new Error(`Failed to upload ${fileItem.file.name}: ${result.error}`);
      }
    }

    return results;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;
    if (!name.trim()) {
      setSubmitError(getText('Please enter your name', 'আপনার নাম লিখুন'));
      return;
    }
    if (!mobile.trim() || mobile.replace(/\D/g, '').length < 10) {
      setSubmitError(getText('Please enter a valid mobile number', 'সঠিক মোবাইল নম্বর দিন'));
      return;
    }
    if (files.length === 0) {
      setSubmitError(getText('Please upload at least one photo or video', 'অন্তত একটি ছবি বা ভিডিও আপলোড করুন'));
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const uploadedFiles = await uploadFiles();

      const res = await fetch('/api/challenges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id: challenge.id,
          name: name.trim(),
          mobile: mobile.trim(),
          description: description.trim(),
          files: uploadedFiles,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setName('');
        setMobile('');
        setDescription('');
        setFiles([]);
      } else {
        setSubmitError(data.error || getText('Submission failed. Please try again.', 'জমা দিতে ব্যর্থ হয়েছে'));
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : getText('Something went wrong', 'কিছু একটা সমস্যা হয়েছে'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (notFound || !challenge) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <h1 className="text-2xl font-bold mb-4">{getText('Challenge Not Found', 'চ্যালেঞ্জ পাওয়া যায়নি')}</h1>
        <Link href="/challenges" className="text-green-600 hover:underline">{getText('Back to Challenges', 'চ্যালেঞ্জে ফিরুন')}</Link>
      </div>
    );
  }

  const isActive = challenge.computed_status === 'active';
  const isUpcoming = challenge.computed_status === 'upcoming';
  const isEnded = challenge.computed_status === 'ended';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero */}
      {challenge.cover_image ? (
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img src={challenge.cover_image} alt={getText(challenge.title_en, challenge.title_bn)} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
              <div className="mb-3">
                {isActive && <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500 text-white">{getText('Active', 'চলমান')}</span>}
                {isUpcoming && <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500 text-white">{getText('Upcoming', 'আসন্ন')}</span>}
                {isEnded && <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-500 text-white">{getText('Ended', 'সমাপ্ত')}</span>}
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white">{getText(challenge.title_en, challenge.title_bn)}</h1>
            </div>
          </div>
        </div>
      ) : (
        <div className={`py-12 ${isActive ? 'bg-gradient-to-r from-green-600 to-green-700' : isUpcoming ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-3">
              {isActive && <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">{getText('Active', 'চলমান')}</span>}
              {isUpcoming && <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">{getText('Upcoming', 'আসন্ন')}</span>}
              {isEnded && <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">{getText('Ended', 'সমাপ্ত')}</span>}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white">{getText(challenge.title_en, challenge.title_bn)}</h1>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link href="/" className={`hover:underline ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{getText('Home', 'হোম')}</Link>
          <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>/</span>
          <Link href="/challenges" className={`hover:underline ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{getText('Challenges', 'চ্যালেঞ্জ')}</Link>
          <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>/</span>
          <span className={isDark ? 'text-white' : 'text-gray-900'}>{getText(challenge.title_en, challenge.title_bn)}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {(challenge.description_en || challenge.description_bn) && (
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {getText('About This Challenge', 'এই চ্যালেঞ্জ সম্পর্কে')}
                </h2>
                <p className={`leading-relaxed whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {getText(challenge.description_en || '', challenge.description_bn)}
                </p>
              </div>
            )}

            {/* Rules */}
            {(challenge.rules_en || challenge.rules_bn) && (
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {getText('Rules & Guidelines', 'নিয়মাবলী')}
                </h2>
                <p className={`leading-relaxed whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {getText(challenge.rules_en || '', challenge.rules_bn)}
                </p>
              </div>
            )}

            {/* Submission Form */}
            {isActive && (
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {getText('Submit Your Entry', 'আপনার অংশগ্রহণ জমা দিন')}
                </h2>

                {submitSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {getText('Submitted Successfully!', 'সফলভাবে জমা হয়েছে!')}
                    </h3>
                    <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getText('Thank you for participating in this challenge.', 'চ্যালেঞ্জে অংশ নেওয়ার জন্য ধন্যবাদ।')}
                    </p>
                    <button
                      onClick={() => setSubmitSuccess(false)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      {getText('Submit Another', 'আরেকটি জমা দিন')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {submitError && (
                      <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
                        {submitError}
                      </div>
                    )}

                    {/* Name */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {getText('Your Name', 'আপনার নাম')} *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={getText('Enter your full name', 'পূর্ণ নাম লিখুন')}
                        className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                        disabled={submitting}
                      />
                    </div>

                    {/* Mobile */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {getText('Mobile Number', 'মোবাইল নম্বর')} *
                      </label>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                        disabled={submitting}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {getText('Description', 'বিবরণ')}
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={getText('Describe what you are doing / your activity for this challenge...', 'এই চ্যালেঞ্জে আপনি কী করছেন তা লিখুন...')}
                        rows={4}
                        className={`w-full px-4 py-3 rounded-lg border resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                        disabled={submitting}
                      />
                    </div>

                    {/* File Upload */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {getText(`Photos / Videos (max ${MAX_FILES})`, `ছবি / ভিডিও (সর্বোচ্চ ${MAX_FILES}টি)`)} *
                      </label>

                      {/* Drop area */}
                      {files.length < MAX_FILES && (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                            isDark
                              ? 'border-gray-600 hover:border-green-500 bg-gray-700/50'
                              : 'border-gray-300 hover:border-green-500 bg-gray-50'
                          }`}
                        >
                          <svg className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {getText('Click to upload photos or videos', 'ছবি বা ভিডিও আপলোড করতে ক্লিক করুন')}
                          </p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {getText(`Images & Videos • Max 200MB each • Up to ${MAX_FILES - files.length} more`, `ছবি ও ভিডিও • সর্বোচ্চ ২০০MB • আরো ${MAX_FILES - files.length}টি`)}
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPTED_TYPES.join(',')}
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={submitting}
                          />
                        </div>
                      )}

                      {/* File list */}
                      {files.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {files.map((f) => (
                            <div key={f.id} className={`rounded-lg overflow-hidden border ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                              {/* Image preview */}
                              {f.file.type.startsWith('image/') && f.status !== 'pending' && (
                                <div className="h-24 overflow-hidden">
                                  <img src={URL.createObjectURL(f.file)} alt={f.file.name} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="px-3 py-2 flex items-center gap-3">
                                {f.file.type.startsWith('video/') ? (
                                  <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                ) : (
                                  <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{f.file.name}</p>
                                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatFileSize(f.file.size)}</p>
                                  {f.status === 'uploading' && (
                                    <div className="mt-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                      <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${f.progress}%` }} />
                                    </div>
                                  )}
                                  {f.status === 'error' && (
                                    <p className="text-xs text-red-500 mt-0.5">{f.error}</p>
                                  )}
                                </div>
                                <div className="flex-shrink-0">
                                  {f.status === 'done' && (
                                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  {f.status === 'uploading' && (
                                    <svg className="animate-spin h-5 w-5 text-green-500" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                  )}
                                  {(f.status === 'pending' || f.status === 'error') && (
                                    <button onClick={() => removeFile(f.id)} className="text-red-500 hover:text-red-600" type="button" disabled={submitting}>
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting || files.length === 0}
                      className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {getText('Uploading & Submitting...', 'আপলোড ও জমা হচ্ছে...')}
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {getText('Submit Entry', 'জমা দিন')}
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Winners Leaderboard - only for ended challenges */}
            {isEnded && challenge.winners && challenge.winners.length > 0 && (
              <div className={`rounded-xl overflow-hidden shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                {/* Leaderboard Header */}
                <div className={`px-6 py-4 ${isDark ? 'bg-gradient-to-r from-yellow-900/40 to-amber-900/30' : 'bg-gradient-to-r from-yellow-50 to-amber-50'} border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-yellow-900/50' : 'bg-yellow-100'}`}>
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {getText('Winners Leaderboard', 'বিজয়ীদের তালিকা')}
                      </h2>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {getText(`${challenge.winners.length} winner${challenge.winners.length !== 1 ? 's' : ''} announced`, `${challenge.winners.length}জন বিজয়ী ঘোষণা করা হয়েছে`)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Top 3 podium */}
                {challenge.winners.length >= 2 && (
                  <div className={`px-6 pt-6 pb-2 ${isDark ? 'bg-gray-800/50' : 'bg-gradient-to-b from-yellow-50/50 to-transparent'}`}>
                    <div className="flex items-end justify-center gap-3">
                      {/* 2nd place */}
                      {challenge.winners.find(w => w.rank === 2) && (() => {
                        const w = challenge.winners!.find(w => w.rank === 2)!;
                        return (
                          <div className="flex flex-col items-center gap-2 flex-1 max-w-[100px]">
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-200 dark:bg-gray-600 dark:border-gray-500">
                              {w.image ? (
                                <img src={w.image} alt={w.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className={`w-full h-16 rounded-t-lg flex flex-col items-center justify-center ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
                              <span className="text-xl">🥈</span>
                              <span className={`text-xs font-semibold text-center px-1 line-clamp-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{w.name}</span>
                            </div>
                          </div>
                        );
                      })()}
                      {/* 1st place */}
                      {challenge.winners.find(w => w.rank === 1) && (() => {
                        const w = challenge.winners!.find(w => w.rank === 1)!;
                        return (
                          <div className="flex flex-col items-center gap-2 flex-1 max-w-[120px]">
                            <div className="relative">
                              <div className="w-18 h-18 w-[72px] h-[72px] rounded-full overflow-hidden border-4 border-yellow-400 bg-gray-200 dark:bg-gray-600 shadow-lg">
                                {w.image ? (
                                  <img src={w.image} alt={w.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <span className="absolute -top-2 -right-1 text-lg">👑</span>
                            </div>
                            <div className={`w-full h-24 rounded-t-lg flex flex-col items-center justify-center ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'} border-t-2 border-yellow-400`}>
                              <span className="text-2xl">🥇</span>
                              <span className={`text-xs font-bold text-center px-1 line-clamp-1 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>{w.name}</span>
                            </div>
                          </div>
                        );
                      })()}
                      {/* 3rd place */}
                      {challenge.winners.find(w => w.rank === 3) && (() => {
                        const w = challenge.winners!.find(w => w.rank === 3)!;
                        return (
                          <div className="flex flex-col items-center gap-2 flex-1 max-w-[100px]">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-600 bg-gray-200 dark:bg-gray-600">
                              {w.image ? (
                                <img src={w.image} alt={w.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className={`w-full h-12 rounded-t-lg flex flex-col items-center justify-center ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
                              <span className="text-xl">🥉</span>
                              <span className={`text-xs font-semibold text-center px-1 line-clamp-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{w.name}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Full ranked list */}
                <div className="p-6 space-y-2">
                  {challenge.winners.map((winner) => {
                    const medalMap: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
                    const colorMap: Record<number, string> = {
                      1: isDark ? 'border-yellow-500/40 bg-yellow-900/10' : 'border-yellow-200 bg-yellow-50',
                      2: isDark ? 'border-gray-500/40 bg-gray-700/20' : 'border-gray-200 bg-gray-50',
                      3: isDark ? 'border-amber-700/40 bg-amber-900/10' : 'border-amber-100 bg-amber-50',
                    };
                    const nameColorMap: Record<number, string> = {
                      1: isDark ? 'text-yellow-300' : 'text-yellow-700',
                      2: isDark ? 'text-gray-300' : 'text-gray-600',
                      3: isDark ? 'text-amber-400' : 'text-amber-700',
                    };
                    const rowBorder = colorMap[winner.rank] || (isDark ? 'border-gray-700 bg-gray-700/20' : 'border-gray-100 bg-white');
                    const nameColor = nameColorMap[winner.rank] || (isDark ? 'text-gray-400' : 'text-gray-500');

                    return (
                      <div key={winner.id} className={`flex items-center gap-3 p-3 rounded-xl border ${rowBorder} transition-all`}>
                        {/* Rank */}
                        <div className="w-10 text-center flex-shrink-0">
                          {medalMap[winner.rank] ? (
                            <span className="text-xl">{medalMap[winner.rank]}</span>
                          ) : (
                            <span className={`text-sm font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>#{winner.rank}</span>
                          )}
                        </div>
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-600">
                          {winner.image ? (
                            <img src={winner.image} alt={winner.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        {/* Name */}
                        <div className="flex-1">
                          <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{winner.name}</p>
                          <p className={`text-xs ${nameColor}`}>
                            {winner.rank === 1 ? getText('1st Place', '১ম স্থান')
                              : winner.rank === 2 ? getText('2nd Place', '২য় স্থান')
                              : winner.rank === 3 ? getText('3rd Place', '৩য় স্থান')
                              : getText(`Rank #${winner.rank}`, `র‍্যাংক #${winner.rank}`)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ended Notice */}
            {isEnded && (
              <div className={`rounded-xl p-6 text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <p className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {getText('This challenge has ended.', 'এই চ্যালেঞ্জ শেষ হয়ে গেছে।')}
                </p>
                <Link href="/challenges" className="mt-3 inline-block text-green-600 hover:underline text-sm">
                  {getText('View other challenges →', 'অন্য চ্যালেঞ্জ দেখুন →')}
                </Link>
              </div>
            )}

            {/* Upcoming Notice */}
            {isUpcoming && (
              <div className={`rounded-xl p-6 text-center ${isDark ? 'bg-blue-900/20 bg-gray-800' : 'bg-blue-50'} shadow`}>
                <p className={`text-lg font-semibold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                  {getText('This challenge has not started yet.', 'এই চ্যালেঞ্জ এখনো শুরু হয়নি।')}
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-blue-400/70' : 'text-blue-600'}`}>
                  {getText('Starts on', 'শুরু হবে')}: {format(new Date(challenge.start_date), 'MMMM d, yyyy')}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Challenge Info */}
            <div className={`rounded-xl p-5 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {getText('Challenge Info', 'চ্যালেঞ্জের তথ্য')}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{getText('Start Date', 'শুরুর তারিখ')}</p>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{format(new Date(challenge.start_date), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{getText('End Date', 'শেষের তারিখ')}</p>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{format(new Date(challenge.end_date), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{getText('Status', 'অবস্থা')}</p>
                  <p className={`text-sm font-semibold capitalize ${isActive ? 'text-green-500' : isUpcoming ? 'text-blue-500' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {isActive ? getText('Active', 'চলমান') : isUpcoming ? getText('Upcoming', 'আসন্ন') : getText('Ended', 'সমাপ্ত')}
                  </p>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className={`rounded-xl p-5 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {getText('Share This Challenge', 'শেয়ার করুন')}
              </h3>
              <SocialShare
                url={typeof window !== 'undefined' ? window.location.href : ''}
                title={getText(challenge.title_en, challenge.title_bn)}
                description={getText(challenge.description_en || '', challenge.description_bn)}
                image={challenge.cover_image}
                hashtags={['SMJahangir', 'Dhaka18', 'Challenge']}
                variant="icons"
                size="md"
              />
            </div>

            {/* Back link */}
            <Link
              href="/challenges"
              className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {getText('All Challenges', 'সব চ্যালেঞ্জ')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
