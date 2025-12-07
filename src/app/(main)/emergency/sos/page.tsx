'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { uploadEmergencyFile } from '@/lib/s3-multipart-upload';

interface LocationData {
    latitude: number;
    longitude: number;
    address?: string;
}

export default function EmergencySOSPage() {
    const { language } = useLanguage();
    const { isDark } = useTheme();

    // Form state
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [requestType, setRequestType] = useState<'women_safety' | 'child_safety' | 'general'>('general');
    const [message, setMessage] = useState('');

    // Location state
    const [location, setLocation] = useState<LocationData | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    // Audio recording state
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioPermission, setAudioPermission] = useState<boolean | null>(null);

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Get user's location
    const getLocation = () => {
        setLocationLoading(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError(language === 'bn' ? 'আপনার ব্রাউজার জিপিএস সাপোর্ট করে না' : 'Your browser does not support GPS');
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });

                // Try to get address using reverse geocoding
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${language}`
                    );
                    const data = await response.json();
                    if (data.display_name) {
                        setLocation(prev => prev ? { ...prev, address: data.display_name } : null);
                    }
                } catch (err) {
                    console.error('Error getting address:', err);
                }

                setLocationLoading(false);
            },
            (error) => {
                let errorMessage = '';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = language === 'bn' ? 'অবস্থান অনুমতি প্রত্যাখ্যান করা হয়েছে' : 'Location permission denied';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = language === 'bn' ? 'অবস্থান তথ্য অনুপলব্ধ' : 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = language === 'bn' ? 'অবস্থান অনুরোধ সময় শেষ' : 'Location request timed out';
                        break;
                    default:
                        errorMessage = language === 'bn' ? 'অজানা ত্রুটি ঘটেছে' : 'An unknown error occurred';
                }
                setLocationError(errorMessage);
                setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Check audio permission on mount
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => setAudioPermission(true))
            .catch(() => setAudioPermission(false));
    }, []);

    // Start audio recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Error starting recording:', err);
            setAudioPermission(false);
        }
    };

    // Stop audio recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    // Delete recorded audio
    const deleteRecording = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
    };

    // Format time for display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Submit emergency request
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent submission while recording is in progress
        if (isRecording) {
            setSubmitError(language === 'bn' ? 'অনুগ্রহ করে প্রথমে রেকর্ডিং বন্ধ করুন' : 'Please stop recording first');
            return;
        }

        if (!name || !phone) {
            setSubmitError(language === 'bn' ? 'নাম এবং ফোন নম্বর প্রয়োজন' : 'Name and phone number are required');
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Upload audio if exists using S3 multipart utility
            let audioUrlForDb = null;
            if (audioBlob) {
                setUploadProgress(0);

                const uploadResult = await uploadEmergencyFile(audioBlob, 'emergency-audio.webm', {
                    onProgress: (progress) => {
                        setUploadProgress(progress);
                    },
                });

                if (uploadResult.success && uploadResult.url) {
                    audioUrlForDb = uploadResult.url;
                    setUploadProgress(100);
                } else {
                    throw new Error(uploadResult.error || 'Audio upload failed');
                }
            }

            // Submit emergency request
            const response = await fetch('/api/emergency/sos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    phone,
                    request_type: requestType,
                    message,
                    latitude: location?.latitude,
                    longitude: location?.longitude,
                    address: location?.address,
                    audio_url: audioUrlForDb,
                    audio_duration: recordingTime,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSubmitSuccess(true);
                // Reset form
                setName('');
                setPhone('');
                setMessage('');
                setLocation(null);
                deleteRecording();
            } else {
                setSubmitError(data.error || (language === 'bn' ? 'অনুরোধ জমা দিতে ব্যর্থ' : 'Failed to submit request'));
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            setSubmitError(language === 'bn' ? 'অনুরোধ জমা দিতে ব্যর্থ' : 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    // One-click SOS button
    const handleOneClickSOS = async () => {
        if (!phone) {
            setSubmitError(language === 'bn' ? 'ফোন নম্বর প্রয়োজন' : 'Phone number is required');
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        // Get location first
        getLocation();

        // Wait for location (max 5 seconds)
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
            const response = await fetch('/api/emergency/sos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name || 'Anonymous',
                    phone,
                    request_type: requestType,
                    message: 'ONE-CLICK SOS - Urgent Help Needed',
                    latitude: location?.latitude,
                    longitude: location?.longitude,
                    address: location?.address,
                    priority: 'critical',
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSubmitSuccess(true);
            } else {
                setSubmitError(data.error || (language === 'bn' ? 'অনুরোধ জমা দিতে ব্যর্থ' : 'Failed to submit request'));
            }
        } catch (error) {
            console.error('Error submitting SOS:', error);
            setSubmitError(language === 'bn' ? 'অনুরোধ জমা দিতে ব্যর্থ' : 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                {/* Hero Header */}
                <div className={`relative py-16 md:py-24 ${isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-red-600 to-red-700'}`}>
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative max-w-7xl mx-auto px-6 md:px-16 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            {language === 'bn' ? 'অনুরোধ জমা হয়েছে!' : 'Request Submitted!'}
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                            {language === 'bn'
                                ? 'আপনার জরুরি অনুরোধ সফলভাবে জমা হয়েছে। আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।'
                                : 'Your emergency request has been submitted successfully. Our team will contact you shortly.'}
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
                            <span className={isDark ? 'text-red-400' : 'text-red-600'}>
                                {language === 'bn' ? 'জরুরি এসওএস' : 'Emergency SOS'}
                            </span>
                        </nav>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
                    <div className={`max-w-md mx-auto rounded-2xl p-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                        <button
                            onClick={() => setSubmitSuccess(false)}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all"
                        >
                            {language === 'bn' ? 'নতুন অনুরোধ' : 'New Request'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Hero Header */}
            <div className={`relative py-16 md:py-24 ${isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-red-600 to-red-700'}`}>
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
                        {language === 'bn' ? 'জরুরি' : 'Emergency'}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {language === 'bn' ? 'জরুরি এসওএস' : 'Emergency SOS'}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                        {language === 'bn'
                            ? 'নারী ও শিশুদের জন্য জরুরি সাহায্য - এক ক্লিকে সাহায্য পান'
                            : 'Emergency help for women & children - Get help with one click'}
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
                        <span className={isDark ? 'text-red-400' : 'text-red-600'}>
                            {language === 'bn' ? 'জরুরি এসওএস' : 'Emergency SOS'}
                        </span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-16 py-8">
                    {/* Request Type Selection */}
                    <div className={`rounded-2xl p-6 mb-6 max-w-2xl mx-auto ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                        <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {language === 'bn' ? 'সাহায্যের ধরন নির্বাচন করুন' : 'Select Help Type'}
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setRequestType('women_safety')}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    requestType === 'women_safety'
                                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                                        : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="text-3xl mb-2">👩</div>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {language === 'bn' ? 'নারী নিরাপত্তা' : 'Women Safety'}
                                </p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRequestType('child_safety')}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    requestType === 'child_safety'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="text-3xl mb-2">👶</div>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {language === 'bn' ? 'শিশু নিরাপত্তা' : 'Child Safety'}
                                </p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRequestType('general')}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    requestType === 'general'
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="text-3xl mb-2">🆘</div>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {language === 'bn' ? 'সাধারণ জরুরি' : 'General Emergency'}
                                </p>
                            </button>
                        </div>
                    </div>

                    {/* Phone Number (Required) */}
                    <div className={`rounded-2xl p-6 mb-6 max-w-2xl mx-auto ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {language === 'bn' ? 'ফোন নম্বর *' : 'Phone Number *'}
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder={language === 'bn' ? '০১XXXXXXXXX' : '01XXXXXXXXX'}
                            className={`w-full px-4 py-3 rounded-xl border text-lg ${
                                isDark
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                            } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                            required
                        />
                    </div>

                    {/* One-Click SOS Button */}
                    <button
                        type="button"
                        onClick={handleOneClickSOS}
                        disabled={isSubmitting || !phone}
                        className="w-full max-w-2xl mx-auto block mb-8 py-6 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white text-2xl font-bold shadow-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <div className="flex items-center justify-center gap-3">
                            <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {isSubmitting
                                ? (language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...')
                                : (language === 'bn' ? 'এক ক্লিকে সাহায্য চান' : 'ONE-CLICK SOS')
                            }
                        </div>
                    </button>

                    <div className={`text-center mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <span className="px-4 bg-inherit">{language === 'bn' ? 'অথবা বিস্তারিত দিন' : 'OR provide details'}</span>
                    </div>

                    {/* Detailed Form */}
                    <form onSubmit={handleSubmit} className={`rounded-2xl p-6 max-w-2xl mx-auto ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                        {/* Name */}
                        <div className="mb-4">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {language === 'bn' ? 'নাম' : 'Name'}
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border ${
                                    isDark
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-gray-50 border-gray-200 text-gray-900'
                                } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                            />
                        </div>

                        {/* Location */}
                        <div className="mb-4">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {language === 'bn' ? 'অবস্থান (GPS)' : 'Location (GPS)'}
                            </label>
                            <button
                                type="button"
                                onClick={getLocation}
                                disabled={locationLoading}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border ${
                                    location
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                        : isDark
                                            ? 'border-gray-600 hover:border-gray-500 text-gray-300'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                } transition-all`}
                            >
                                {locationLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                                        {language === 'bn' ? 'অবস্থান খোঁজা হচ্ছে...' : 'Getting location...'}
                                    </>
                                ) : location ? (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {language === 'bn' ? 'অবস্থান পাওয়া গেছে' : 'Location captured'}
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {language === 'bn' ? 'অবস্থান শেয়ার করুন' : 'Share Location'}
                                    </>
                                )}
                            </button>
                            {locationError && (
                                <p className="mt-2 text-sm text-red-500">{locationError}</p>
                            )}
                            {location?.address && (
                                <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {location.address}
                                </p>
                            )}
                        </div>

                        {/* Audio Recording */}
                        <div className="mb-4">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {language === 'bn' ? 'ভয়েস রেকর্ড (ঐচ্ছিক)' : 'Voice Recording (Optional)'}
                            </label>
                            {audioPermission === false ? (
                                <p className="text-sm text-red-500">
                                    {language === 'bn' ? 'মাইক্রোফোন অনুমতি প্রয়োজন' : 'Microphone permission required'}
                                </p>
                            ) : audioUrl ? (
                                <div className={`p-4 rounded-xl border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                            {language === 'bn' ? `রেকর্ড করা হয়েছে (${formatTime(recordingTime)})` : `Recorded (${formatTime(recordingTime)})`}
                                        </span>
                                    </div>
                                    <audio src={audioUrl} controls className="w-full mb-3" />
                                    <button
                                        type="button"
                                        onClick={deleteRecording}
                                        className="text-sm text-red-500 hover:text-red-600"
                                    >
                                        {language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                                        isRecording
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 animate-pulse'
                                            : isDark
                                                ? 'border-gray-600 hover:border-gray-500 text-gray-300'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                    }`}
                                >
                                    {isRecording ? (
                                        <>
                                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                            {language === 'bn' ? `রেকর্ডিং... ${formatTime(recordingTime)}` : `Recording... ${formatTime(recordingTime)}`}
                                            <span className="ml-auto text-sm">
                                                {language === 'bn' ? 'থামান' : 'Stop'}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                            </svg>
                                            {language === 'bn' ? 'রেকর্ড শুরু করুন' : 'Start Recording'}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Message */}
                        <div className="mb-6">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {language === 'bn' ? 'বার্তা (ঐচ্ছিক)' : 'Message (Optional)'}
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={3}
                                className={`w-full px-4 py-3 rounded-xl border ${
                                    isDark
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-gray-50 border-gray-200 text-gray-900'
                                } focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                                placeholder={language === 'bn' ? 'আপনার পরিস্থিতি বর্ণনা করুন...' : 'Describe your situation...'}
                            />
                        </div>

                        {submitError && (
                            <div className="mb-4 p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
                                {submitError}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !phone || isRecording}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-lg font-bold shadow-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isRecording
                                ? (language === 'bn' ? 'রেকর্ডিং বন্ধ করুন...' : 'Stop Recording First...')
                                : isSubmitting
                                    ? (language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Submitting...')
                                    : (language === 'bn' ? 'সাহায্যের জন্য জমা দিন' : 'Submit for Help')
                            }
                        </button>
                    </form>

                    {/* Emergency Notice */}
                    <div className={`mt-6 rounded-2xl p-6 max-w-2xl mx-auto ${isDark ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-full bg-red-500/20">
                                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className={`font-bold mb-2 ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                                    {language === 'bn' ? 'জরুরি অবস্থায়?' : 'In Immediate Danger?'}
                                </h3>
                                <p className={isDark ? 'text-red-300/80' : 'text-red-700'}>
                                    {language === 'bn'
                                        ? 'এখনই ৯৯৯ নম্বরে কল করুন। এটি সবচেয়ে দ্রুত সাহায্য পাওয়ার উপায়।'
                                        : 'Call 999 immediately. This is the fastest way to get help.'}
                                </p>
                                <a
                                    href="tel:999"
                                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {language === 'bn' ? '৯৯৯ কল করুন' : 'Call 999'}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
}
