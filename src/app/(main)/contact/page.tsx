"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import toast from 'react-hot-toast';

export default function ContactPage() {
    const { language } = useLanguage();
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                setSubmitted(true);
                toast.success(language === 'bn' ? 'বার্তা সফলভাবে পাঠানো হয়েছে!' : 'Message sent successfully!');
                setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            } else {
                toast.error(result.error || (language === 'bn' ? 'বার্তা পাঠাতে ব্যর্থ হয়েছে' : 'Failed to send message'));
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            toast.error(language === 'bn' ? 'বার্তা পাঠাতে ব্যর্থ হয়েছে' : 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {language === 'bn' ? 'যোগাযোগ' : 'Contact'}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                        {language === 'bn'
                            ? 'আমাদের সাথে যোগাযোগ করতে নিচের ফর্মটি পূরণ করুন'
                            : 'Fill out the form below to get in touch with us'
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
                        <span className={isDark ? 'text-red-400' : 'text-red-600'}>
                            {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 md:px-16 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
                                <svg className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className={`font-semibold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {language === 'bn' ? 'ঠিকানা' : 'Address'}
                            </h3>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {language === 'bn' ? 'বাড়ি-৭২, রোড-৬, সেক্টর-৯, উত্তরা, ঢাকা-১২৩০' : 'House-72, Road-6, Sector-9, Uttara, Dhaka-1230'}
                            </p>
                        </div>

                        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                                <svg className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <h3 className={`font-semibold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {language === 'bn' ? 'ফোন' : 'Phone'}
                            </h3>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                +8801711563636
                            </p>
                        </div>

                        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                                <svg className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className={`font-semibold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {language === 'bn' ? 'ইমেইল' : 'Email'}
                            </h3>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                inf0@smjahangir.com
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white shadow-xl'}`}>
                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                                        <svg className={`w-10 h-10 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {language === 'bn' ? 'ধন্যবাদ!' : 'Thank You!'}
                                    </h2>
                                    <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {language === 'bn'
                                            ? 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।'
                                            : 'Your message has been sent successfully. We will get back to you soon.'
                                        }
                                    </p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        {language === 'bn' ? 'আরেকটি বার্তা পাঠান' : 'Send Another Message'}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {language === 'bn' ? 'আমাদের বার্তা পাঠান' : 'Send us a Message'}
                                    </h2>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className={`block mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'নাম' : 'Name'} *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                                                        isDark
                                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                                                            : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
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
                                                    required
                                                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                                                        isDark
                                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                                                            : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                                                    placeholder={language === 'bn' ? 'আপনার ইমেইল' : 'Your email'}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                                                            : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                                                    placeholder={language === 'bn' ? 'আপনার ফোন নম্বর' : 'Your phone number'}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'বিষয়' : 'Subject'} *
                                                </label>
                                                <select
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    required
                                                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                                                        isDark
                                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                                                            : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                                                >
                                                    <option value="">{language === 'bn' ? '-- বিষয় নির্বাচন করুন --' : '-- Select Subject --'}</option>
                                                    <option value="general">{language === 'bn' ? 'সাধারণ জিজ্ঞাসা' : 'General Inquiry'}</option>
                                                    <option value="support">{language === 'bn' ? 'সাপোর্ট' : 'Support'}</option>
                                                    <option value="feedback">{language === 'bn' ? 'মতামত' : 'Feedback'}</option>
                                                    <option value="suggestion">{language === 'bn' ? 'পরামর্শ' : 'Suggestion'}</option>
                                                    <option value="other">{language === 'bn' ? 'অন্যান্য' : 'Other'}</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className={`block mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {language === 'bn' ? 'বার্তা' : 'Message'} *
                                            </label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                rows={6}
                                                className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
                                                    isDark
                                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                                                        : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
                                                } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                                                placeholder={language === 'bn' ? 'আপনার বার্তা লিখুন...' : 'Write your message...'}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    {language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...'}
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                    </svg>
                                                    {language === 'bn' ? 'বার্তা পাঠান' : 'Send Message'}
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
