"use client";

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import toast from 'react-hot-toast';

interface ComplaintStatus {
    tracking_id: string;
    category: string;
    subject: string;
    status: string;
    admin_response: string | null;
    responded_at: string | null;
    created_at: string;
    updated_at: string;
}

interface Attachment {
    url: string;
    s3Key: string;
    filename: string;
    fileType: string;
    fileSize: number;
}

interface UploadingFile {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
    attachment?: Attachment;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
const MAX_FILES = 5;
const SUPPORTED_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/mov', 'video/avi', 'video/quicktime', 'video/webm'
];

export default function ComplaintsPage() {
    const { language } = useLanguage();
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submittedTrackingId, setSubmittedTrackingId] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Track complaint state
    const [trackingId, setTrackingId] = useState('');
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [complaintStatus, setComplaintStatus] = useState<ComplaintStatus | null>(null);
    const [trackingError, setTrackingError] = useState('');

    // File upload state
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        ward: '',
        category: '',
        priority: 'medium',
        location: '',
        subject: '',
        message: '',
    });

    // Dhaka-18 Constituency Wards
    const wards = [
        { value: '01', en: 'Ward 01', bn: 'ওয়ার্ড ০১' },
        { value: '17', en: 'Ward 17', bn: 'ওয়ার্ড ১৭' },
        { value: '43', en: 'Ward 43', bn: 'ওয়ার্ড ৪৩' },
        { value: '44', en: 'Ward 44', bn: 'ওয়ার্ড ৪৪' },
        { value: '45', en: 'Ward 45', bn: 'ওয়ার্ড ৪৫' },
        { value: '46', en: 'Ward 46', bn: 'ওয়ার্ড ৪৬' },
        { value: '47', en: 'Ward 47', bn: 'ওয়ার্ড ৪৭' },
        { value: '48', en: 'Ward 48', bn: 'ওয়ার্ড ৪৮' },
        { value: '49', en: 'Ward 49', bn: 'ওয়ার্ড ৪৯' },
        { value: '50', en: 'Ward 50', bn: 'ওয়ার্ড ৫০' },
        { value: '51', en: 'Ward 51', bn: 'ওয়ার্ড ৫১' },
        { value: '52', en: 'Ward 52', bn: 'ওয়ার্ড ৫২' },
        { value: '53', en: 'Ward 53', bn: 'ওয়ার্ড ৫৩' },
        { value: '54', en: 'Ward 54', bn: 'ওয়ার্ড ৫৪' },
    ];

    const categories = [
        { value: 'infrastructure', en: 'Infrastructure', bn: 'অবকাঠামো' },
        { value: 'corruption', en: 'Corruption', bn: 'দুর্নীতি' },
        { value: 'public-service', en: 'Public Service', bn: 'জনসেবা' },
        { value: 'law-order', en: 'Law & Order', bn: 'আইনশৃঙ্খলা' },
        { value: 'education', en: 'Education', bn: 'শিক্ষা' },
        { value: 'healthcare', en: 'Healthcare', bn: 'স্বাস্থ্যসেবা' },
        { value: 'environment', en: 'Environment', bn: 'পরিবেশ' },
        { value: 'other', en: 'Other', bn: 'অন্যান্য' },
    ];

    const priorities = [
        { value: 'low', en: 'Low', bn: 'কম' },
        { value: 'medium', en: 'Medium', bn: 'মাঝারি' },
        { value: 'high', en: 'High', bn: 'উচ্চ' },
        { value: 'urgent', en: 'Urgent', bn: 'জরুরি' },
    ];

    const statusColors: Record<string, { bg: string; text: string; label: { en: string; bn: string } }> = {
        pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400', label: { en: 'Pending', bn: 'অপেক্ষমান' } },
        in_progress: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-400', label: { en: 'In Progress', bn: 'প্রক্রিয়াধীন' } },
        under_review: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-400', label: { en: 'Under Review', bn: 'পর্যালোচনাধীন' } },
        responded: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', label: { en: 'Responded', bn: 'জবাব দেওয়া হয়েছে' } },
        resolved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', label: { en: 'Resolved', bn: 'সমাধান হয়েছে' } },
        rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', label: { en: 'Rejected', bn: 'প্রত্যাখ্যাত' } },
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Upload file using chunked upload for large files
    const uploadFile = useCallback(async (file: File, index: number) => {
        const updateProgress = (progress: number, status: UploadingFile['status'], error?: string, attachment?: Attachment) => {
            setUploadingFiles(prev => prev.map((f, i) =>
                i === index ? { ...f, progress, status, error, attachment } : f
            ));
        };

        try {
            // For smaller files (< 10MB), use direct upload
            if (file.size < 10 * 1024 * 1024) {
                updateProgress(0, 'uploading');

                const formData = new FormData();
                formData.append('file', file);

                const xhr = new XMLHttpRequest();

                await new Promise<void>((resolve, reject) => {
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            const progress = Math.round((e.loaded / e.total) * 100);
                            updateProgress(progress, 'uploading');
                        }
                    };

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            const result = JSON.parse(xhr.responseText);
                            if (result.success) {
                                const attachment: Attachment = {
                                    url: result.url,
                                    s3Key: result.s3Key,
                                    filename: result.filename || file.name,
                                    fileType: file.type,
                                    fileSize: file.size,
                                };
                                updateProgress(100, 'completed', undefined, attachment);
                                setAttachments(prev => [...prev, attachment]);
                                resolve();
                            } else {
                                reject(new Error(result.error || 'Upload failed'));
                            }
                        } else {
                            reject(new Error('Upload failed'));
                        }
                    };

                    xhr.onerror = () => reject(new Error('Network error'));

                    xhr.open('POST', '/api/complaints/upload');
                    xhr.send(formData);
                });
            } else {
                // For larger files, use chunked multipart upload
                updateProgress(0, 'uploading');

                // Step 1: Initialize multipart upload
                const initResponse = await fetch('/api/complaints/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'init-multipart',
                        filename: file.name,
                        fileType: file.type,
                        fileSize: file.size,
                    }),
                });

                const initResult = await initResponse.json();
                if (!initResult.success) {
                    throw new Error(initResult.error || 'Failed to initialize upload');
                }

                const { uploadId, key } = initResult;
                const totalParts = Math.ceil(file.size / CHUNK_SIZE);
                const parts: { ETag: string; PartNumber: number }[] = [];

                // Step 2: Upload each part
                for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
                    const start = (partNumber - 1) * CHUNK_SIZE;
                    const end = Math.min(start + CHUNK_SIZE, file.size);
                    const chunk = file.slice(start, end);

                    const partFormData = new FormData();
                    partFormData.append('file', chunk);
                    partFormData.append('uploadId', uploadId);
                    partFormData.append('key', key);
                    partFormData.append('partNumber', partNumber.toString());

                    const partResponse = await fetch('/api/complaints/upload', {
                        method: 'POST',
                        body: partFormData,
                    });

                    const partResult = await partResponse.json();
                    if (!partResult.success) {
                        // Abort the upload on error
                        await fetch('/api/complaints/upload', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'abort-multipart', uploadId, key }),
                        });
                        throw new Error(partResult.error || 'Failed to upload part');
                    }

                    parts.push({ ETag: partResult.etag, PartNumber: partResult.partNumber });

                    const progress = Math.round((partNumber / totalParts) * 100);
                    updateProgress(progress, 'uploading');
                }

                // Step 3: Complete multipart upload
                const completeResponse = await fetch('/api/complaints/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'complete-multipart',
                        uploadId,
                        key,
                        parts,
                    }),
                });

                const completeResult = await completeResponse.json();
                if (!completeResult.success) {
                    throw new Error(completeResult.error || 'Failed to complete upload');
                }

                const attachment: Attachment = {
                    url: completeResult.url,
                    s3Key: completeResult.s3Key,
                    filename: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                };
                updateProgress(100, 'completed', undefined, attachment);
                setAttachments(prev => [...prev, attachment]);
            }
        } catch (error) {
            console.error('Upload error:', error);
            updateProgress(0, 'error', error instanceof Error ? error.message : 'Upload failed');
        }
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Validate files
        const validFiles: File[] = [];
        for (const file of files) {
            if (!SUPPORTED_TYPES.includes(file.type)) {
                toast.error(`${file.name}: ${language === 'bn' ? 'অসমর্থিত ফাইল টাইপ' : 'Unsupported file type'}`);
                continue;
            }
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`${file.name}: ${language === 'bn' ? 'ফাইল অতিরিক্ত বড় (সর্বোচ্চ 200MB)' : 'File too large (max 200MB)'}`);
                continue;
            }
            if (attachments.length + uploadingFiles.length + validFiles.length >= MAX_FILES) {
                toast.error(language === 'bn' ? `সর্বোচ্চ ${MAX_FILES}টি ফাইল আপলোড করা যাবে` : `Maximum ${MAX_FILES} files allowed`);
                break;
            }
            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        // Add files to uploading state
        const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
            file,
            progress: 0,
            status: 'pending' as const,
        }));

        setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

        // Start uploading
        const startIndex = uploadingFiles.length;
        for (let i = 0; i < validFiles.length; i++) {
            await uploadFile(validFiles[i], startIndex + i);
        }

        // Clear input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (index: number) => {
        setUploadingFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if any files are still uploading
        if (uploadingFiles.some(f => f.status === 'uploading')) {
            toast.error(language === 'bn' ? 'ফাইল আপলোড শেষ হওয়া পর্যন্ত অপেক্ষা করুন' : 'Please wait for files to finish uploading');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    is_anonymous: isAnonymous,
                    attachments: attachments,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setSubmitted(true);
                setSubmittedTrackingId(result.tracking_id);
                toast.success(language === 'bn' ? 'অভিযোগ সফলভাবে দাখিল হয়েছে!' : 'Complaint submitted successfully!');
                setFormData({ name: '', email: '', phone: '', ward: '', category: '', priority: 'medium', location: '', subject: '', message: '' });
                setAttachments([]);
                setUploadingFiles([]);
            } else {
                toast.error(result.error || (language === 'bn' ? 'অভিযোগ দাখিল ব্যর্থ হয়েছে' : 'Failed to submit complaint'));
            }
        } catch (error) {
            console.error('Error submitting complaint:', error);
            toast.error(language === 'bn' ? 'অভিযোগ দাখিল ব্যর্থ হয়েছে' : 'Failed to submit complaint');
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingId.trim()) {
            setTrackingError(language === 'bn' ? 'ট্র্যাকিং আইডি প্রয়োজন' : 'Tracking ID is required');
            return;
        }

        setTrackingLoading(true);
        setTrackingError('');
        setComplaintStatus(null);

        try {
            const response = await fetch(`/api/complaints?tracking_id=${trackingId.trim()}`);
            const result = await response.json();

            if (response.ok) {
                setComplaintStatus(result.data);
            } else {
                setTrackingError(result.error || (language === 'bn' ? 'অভিযোগ পাওয়া যায়নি' : 'Complaint not found'));
            }
        } catch (error) {
            console.error('Error tracking complaint:', error);
            setTrackingError(language === 'bn' ? 'ট্র্যাকিং ব্যর্থ হয়েছে' : 'Failed to track complaint');
        } finally {
            setTrackingLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Hero Header */}
            <div className={`relative py-16 md:py-24 ${isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-orange-600 to-red-600'}`}>
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-6 md:px-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {language === 'bn' ? 'অভিযোগ' : 'Complaints'}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {language === 'bn' ? 'অভিযোগ বাক্স' : 'Complaint Box'}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                        {language === 'bn'
                            ? 'আপনার সমস্যা জানান অথবা পূর্বের অভিযোগের অবস্থা দেখুন'
                            : 'Report your issues or check the status of previous complaints'
                        }
                    </p>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className={`${isDark ? 'bg-gray-800/50' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-6 md:px-16 py-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link href="/" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>
                            {language === 'bn' ? 'হোম' : 'Home'}
                        </Link>
                        <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>/</span>
                        <span className={isDark ? 'text-orange-400' : 'text-orange-600'}>
                            {language === 'bn' ? 'অভিযোগ বাক্স' : 'Complaint Box'}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Privacy Notice */}
            <div className="max-w-7xl mx-auto px-6 md:px-16 pt-8">
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-start gap-3">
                        <svg className={`w-6 h-6 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className={`font-semibold mb-1 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                                {language === 'bn' ? 'গোপনীয়তার নোটিশ' : 'Privacy Notice'}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-blue-200/80' : 'text-blue-700'}`}>
                                {language === 'bn'
                                    ? 'আপনি আপনার পরিচয় প্রকাশ করে অথবা বেনামে অভিযোগ দাখিল করতে পারেন। বেনামে অভিযোগ করলে আপনার কোনো ব্যক্তিগত তথ্য সংগ্রহ করা হবে না। তবে, বেনামে অভিযোগে সরাসরি যোগাযোগ সম্ভব হবে না।'
                                    : 'You can submit complaints with your identity or anonymously. If you choose to be anonymous, no personal information will be collected. However, we won\'t be able to contact you directly for anonymous complaints.'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-7xl mx-auto px-6 md:px-16 pt-8">
                <div className={`inline-flex rounded-xl p-1 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <button
                        onClick={() => setActiveTab('submit')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            activeTab === 'submit'
                                ? 'bg-orange-600 text-white shadow-lg'
                                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            {language === 'bn' ? 'অভিযোগ দাখিল করুন' : 'Submit Complaint'}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('track')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            activeTab === 'track'
                                ? 'bg-orange-600 text-white shadow-lg'
                                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            {language === 'bn' ? 'অভিযোগ ট্র্যাক করুন' : 'Track Complaint'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 md:px-16 py-8">
                {activeTab === 'submit' ? (
                    <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white shadow-xl'}`}>
                        {submitted ? (
                            <div className="text-center py-12">
                                <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                                    <svg className={`w-10 h-10 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {language === 'bn' ? 'অভিযোগ দাখিল হয়েছে!' : 'Complaint Submitted!'}
                                </h2>
                                <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {language === 'bn'
                                        ? 'আপনার অভিযোগ সফলভাবে দাখিল হয়েছে।'
                                        : 'Your complaint has been submitted successfully.'
                                    }
                                </p>
                                <div className={`inline-block px-6 py-4 rounded-xl mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {language === 'bn' ? 'আপনার ট্র্যাকিং আইডি:' : 'Your Tracking ID:'}
                                    </p>
                                    <p className={`text-2xl font-mono font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                                        {submittedTrackingId}
                                    </p>
                                    <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                        {language === 'bn' ? 'এই আইডি সংরক্ষণ করুন অভিযোগের অবস্থা দেখতে' : 'Save this ID to track your complaint status'}
                                    </p>
                                </div>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => {
                                            setSubmitted(false);
                                            setIsAnonymous(false);
                                        }}
                                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                                    >
                                        {language === 'bn' ? 'নতুন অভিযোগ' : 'New Complaint'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setTrackingId(submittedTrackingId);
                                            setActiveTab('track');
                                        }}
                                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        {language === 'bn' ? 'অবস্থা দেখুন' : 'Track Status'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {language === 'bn' ? 'অভিযোগ দাখিল করুন' : 'Submit a Complaint'}
                                </h2>

                                {/* Anonymous Toggle */}
                                <div className={`mb-8 p-4 rounded-xl border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <div>
                                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {language === 'bn' ? 'বেনামে অভিযোগ করুন' : 'Submit Anonymously'}
                                            </p>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {language === 'bn'
                                                    ? 'আপনার পরিচয় গোপন রাখা হবে'
                                                    : 'Your identity will be kept confidential'
                                                }
                                            </p>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={isAnonymous}
                                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                                className="sr-only"
                                            />
                                            <div className={`w-14 h-7 rounded-full transition-colors ${isAnonymous ? 'bg-orange-600' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`}>
                                                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform absolute top-1 ${isAnonymous ? 'translate-x-8' : 'translate-x-1'}`}></div>
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Personal Info - Only show if not anonymous */}
                                    {!isAnonymous && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <label className={`block mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'নাম' : 'Name'} *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required={!isAnonymous}
                                                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                                                        isDark
                                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                                                            : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                                                    placeholder={language === 'bn' ? 'আপনার নাম' : 'Your name'}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'ইমেইল' : 'Email'} *
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required={!isAnonymous}
                                                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                                                        isDark
                                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                                                            : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                                                    placeholder={language === 'bn' ? 'আপনার ইমেইল' : 'Your email'}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'ফোন' : 'Phone'}
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                                                        isDark
                                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                                                            : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                                                    placeholder={language === 'bn' ? 'আপনার ফোন নম্বর' : 'Your phone number'}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Ward Selection */}
                                    <div className="mb-6">
                                        <label className={`block mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {language === 'bn' ? 'ওয়ার্ড নির্বাচন করুন (ঢাকা-১৮)' : 'Select Ward (Dhaka-18)'} *
                                        </label>
                                        <select
                                            name="ward"
                                            value={formData.ward}
                                            onChange={handleChange}
                                            required
                                            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                                                isDark
                                                    ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                                                    : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                                            } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                                        >
                                            <option value="">{language === 'bn' ? '-- ওয়ার্ড নির্বাচন করুন --' : '-- Select Ward --'}</option>
                                            {wards.map(ward => (
                                                <option key={ward.value} value={ward.value}>
                                                    {language === 'bn' ? ward.bn : ward.en}
                                                </option>
                                            ))}
                                        </select>
                                        <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                            {language === 'bn'
                                                ? 'আপনার সমস্যার এলাকা অনুযায়ী ওয়ার্ড নির্বাচন করুন'
                                                : 'Select the ward based on the area of your problem'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className={`block mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {language === 'bn' ? 'বিভাগ' : 'Category'} *
                                            </label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                required
                                                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                                                    isDark
                                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                                                        : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                                                } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                                            >
                                                <option value="">{language === 'bn' ? '-- বিভাগ নির্বাচন করুন --' : '-- Select Category --'}</option>
                                                {categories.map(cat => (
                                                    <option key={cat.value} value={cat.value}>
                                                        {language === 'bn' ? cat.bn : cat.en}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {language === 'bn' ? 'অগ্রাধিকার' : 'Priority'}
                                            </label>
                                            <select
                                                name="priority"
                                                value={formData.priority}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                                                    isDark
                                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                                                        : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                                                } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                                            >
                                                {priorities.map(p => (
                                                    <option key={p.value} value={p.value}>
                                                        {language === 'bn' ? p.bn : p.en}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {language === 'bn' ? 'এলাকা/স্থান' : 'Location'}
                                            </label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                                                    isDark
                                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                                                        : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                                                } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                                                placeholder={language === 'bn' ? 'ঘটনার স্থান' : 'Location of incident'}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {language === 'bn' ? 'বিষয়' : 'Subject'} *
                                        </label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                                                isDark
                                                    ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                                                    : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                                            } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                                            placeholder={language === 'bn' ? 'অভিযোগের সংক্ষিপ্ত বিষয়' : 'Brief subject of complaint'}
                                        />
                                    </div>

                                    <div>
                                        <label className={`block mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {language === 'bn' ? 'বিস্তারিত বিবরণ' : 'Detailed Description'} *
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={6}
                                            className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
                                                isDark
                                                    ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                                                    : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                                            } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                                            placeholder={language === 'bn' ? 'আপনার অভিযোগের বিস্তারিত বিবরণ লিখুন...' : 'Write detailed description of your complaint...'}
                                        />
                                    </div>

                                    {/* File Upload Section */}
                                    <div>
                                        <label className={`block mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {language === 'bn' ? 'প্রমাণ সংযুক্ত করুন (ঐচ্ছিক)' : 'Attach Evidence (Optional)'}
                                        </label>
                                        <p className={`text-sm mb-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                            {language === 'bn'
                                                ? `ছবি বা ভিডিও আপলোড করুন (সর্বোচ্চ ${MAX_FILES}টি ফাইল, প্রতিটি সর্বোচ্চ 200MB)`
                                                : `Upload images or videos (max ${MAX_FILES} files, each up to 200MB)`
                                            }
                                        </p>

                                        {/* Upload Area */}
                                        <div
                                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                                                isDark
                                                    ? 'border-gray-600 hover:border-orange-500 bg-gray-700/30'
                                                    : 'border-gray-300 hover:border-orange-500 bg-gray-50'
                                            }`}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                accept={SUPPORTED_TYPES.join(',')}
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                            <svg className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {language === 'bn' ? 'ফাইল আপলোড করতে ক্লিক করুন' : 'Click to upload files'}
                                            </p>
                                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                {language === 'bn' ? 'অথবা ড্র্যাগ এন্ড ড্রপ করুন' : 'or drag and drop'}
                                            </p>
                                        </div>

                                        {/* Uploading Files */}
                                        {uploadingFiles.length > 0 && (
                                            <div className="mt-4 space-y-3">
                                                {uploadingFiles.map((uf, index) => (
                                                    <div
                                                        key={index}
                                                        className={`flex items-center gap-4 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                                                    >
                                                        {/* File Icon */}
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                            uf.file.type.startsWith('video/')
                                                                ? 'bg-purple-100 dark:bg-purple-900/30'
                                                                : 'bg-blue-100 dark:bg-blue-900/30'
                                                        }`}>
                                                            {uf.file.type.startsWith('video/') ? (
                                                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            )}
                                                        </div>

                                                        {/* File Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                                {uf.file.name}
                                                            </p>
                                                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {formatFileSize(uf.file.size)}
                                                            </p>

                                                            {/* Progress Bar */}
                                                            {uf.status === 'uploading' && (
                                                                <div className="mt-2">
                                                                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                                                        <div
                                                                            className="h-full bg-orange-500 transition-all duration-300"
                                                                            style={{ width: `${uf.progress}%` }}
                                                                        />
                                                                    </div>
                                                                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        {uf.progress}%
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Error */}
                                                            {uf.status === 'error' && (
                                                                <p className="text-xs text-red-500 mt-1">{uf.error}</p>
                                                            )}
                                                        </div>

                                                        {/* Status/Remove */}
                                                        <div className="flex-shrink-0">
                                                            {uf.status === 'completed' ? (
                                                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            ) : uf.status === 'error' ? (
                                                                <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-600">
                                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            ) : uf.status === 'uploading' ? (
                                                                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Uploaded Attachments Preview */}
                                        {attachments.length > 0 && (
                                            <div className="mt-4">
                                                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'আপলোড সম্পন্ন:' : 'Uploaded:'}
                                                </p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {attachments.map((att, index) => (
                                                        <div
                                                            key={index}
                                                            className={`relative group rounded-lg overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                                                        >
                                                            {att.fileType.startsWith('video/') ? (
                                                                <div className="aspect-video flex items-center justify-center bg-gray-800">
                                                                    <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            ) : (
                                                                <div className="aspect-video relative">
                                                                    <Image
                                                                        src={att.url}
                                                                        alt={att.filename}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            )}
                                                            <button
                                                                onClick={() => removeAttachment(index)}
                                                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                            <p className={`p-2 text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                {att.filename}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || uploadingFiles.some(f => f.status === 'uploading')}
                                        className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                {language === 'bn' ? 'দাখিল হচ্ছে...' : 'Submitting...'}
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                                {language === 'bn' ? 'অভিযোগ দাখিল করুন' : 'Submit Complaint'}
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                ) : (
                    <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white shadow-xl'}`}>
                        <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {language === 'bn' ? 'অভিযোগের অবস্থা ট্র্যাক করুন' : 'Track Your Complaint'}
                        </h2>

                        <form onSubmit={handleTrack} className="mb-8">
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={trackingId}
                                    onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                                    placeholder={language === 'bn' ? 'ট্র্যাকিং আইডি লিখুন (যেমন: CMP-20250130-A1B2)' : 'Enter Tracking ID (e.g., CMP-20250130-A1B2)'}
                                    className={`flex-1 px-4 py-3 rounded-lg border transition-colors font-mono ${
                                        isDark
                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                                    } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                                />
                                <button
                                    type="submit"
                                    disabled={trackingLoading}
                                    className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                                >
                                    {trackingLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    )}
                                    {language === 'bn' ? 'খুঁজুন' : 'Search'}
                                </button>
                            </div>
                        </form>

                        {trackingError && (
                            <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                                <div className="flex items-center gap-3">
                                    <svg className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className={isDark ? 'text-red-400' : 'text-red-700'}>{trackingError}</p>
                                </div>
                            </div>
                        )}

                        {complaintStatus && (
                            <div className={`rounded-xl border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className={`p-6 border-b ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {language === 'bn' ? 'ট্র্যাকিং আইডি' : 'Tracking ID'}
                                            </p>
                                            <p className={`text-xl font-mono font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                                                {complaintStatus.tracking_id}
                                            </p>
                                        </div>
                                        <div className={`px-4 py-2 rounded-full ${statusColors[complaintStatus.status]?.bg || 'bg-gray-100'} ${statusColors[complaintStatus.status]?.text || 'text-gray-800'}`}>
                                            <span className="font-semibold">
                                                {language === 'bn'
                                                    ? statusColors[complaintStatus.status]?.label.bn || complaintStatus.status
                                                    : statusColors[complaintStatus.status]?.label.en || complaintStatus.status
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {language === 'bn' ? 'বিভাগ' : 'Category'}
                                            </p>
                                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {categories.find(c => c.value === complaintStatus.category)?.[language === 'bn' ? 'bn' : 'en'] || complaintStatus.category}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {language === 'bn' ? 'দাখিলের তারিখ' : 'Submitted On'}
                                            </p>
                                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {formatDate(complaintStatus.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {language === 'bn' ? 'বিষয়' : 'Subject'}
                                        </p>
                                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {complaintStatus.subject}
                                        </p>
                                    </div>

                                    {complaintStatus.admin_response && (
                                        <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <svg className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                                                    {language === 'bn' ? 'প্রশাসনিক জবাব' : 'Admin Response'}
                                                </p>
                                            </div>
                                            <p className={`${isDark ? 'text-green-200/80' : 'text-green-800'}`}>
                                                {complaintStatus.admin_response}
                                            </p>
                                            {complaintStatus.responded_at && (
                                                <p className={`text-sm mt-2 ${isDark ? 'text-green-400/60' : 'text-green-600'}`}>
                                                    {language === 'bn' ? 'জবাব দেওয়া হয়েছে:' : 'Responded on:'} {formatDate(complaintStatus.responded_at)}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {!complaintStatus.admin_response && (
                                        <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
                                            <div className="flex items-center gap-2">
                                                <svg className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className={`${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                                                    {language === 'bn'
                                                        ? 'আপনার অভিযোগ পর্যালোচনাধীন আছে। অনুগ্রহ করে অপেক্ষা করুন।'
                                                        : 'Your complaint is being reviewed. Please wait for a response.'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {!complaintStatus && !trackingError && (
                            <div className="text-center py-12">
                                <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <svg className={`w-10 h-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {language === 'bn'
                                        ? 'আপনার ট্র্যাকিং আইডি দিয়ে অভিযোগের অবস্থা দেখুন'
                                        : 'Enter your tracking ID to check complaint status'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
