'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import Link from 'next/link';

interface SafetyResource {
    id: string;
    title_en: string;
    title_bn: string;
    content_en: string | null;
    content_bn: string | null;
    summary_en: string | null;
    summary_bn: string | null;
    category: string;
    image_url: string | null;
    pdf_url: string | null;
    video_url: string | null;
    is_featured: boolean;
}


const categoryIcons: Record<string, React.ReactNode> = {
    guide: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    ),
    tips: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    ),
    legal: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
    ),
    health: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    ),
    disaster: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
};

const categoryColors: Record<string, string> = {
    guide: 'from-blue-500 to-blue-600',
    tips: 'from-green-500 to-green-600',
    legal: 'from-purple-500 to-purple-600',
    health: 'from-pink-500 to-pink-600',
    disaster: 'from-red-500 to-red-600',
};

const categoryLabels: Record<string, { en: string; bn: string }> = {
    all: { en: 'All', bn: 'সব' },
    guide: { en: 'Guide', bn: 'গাইড' },
    tips: { en: 'Tips', bn: 'টিপস' },
    legal: { en: 'Legal', bn: 'আইনি' },
    health: { en: 'Health', bn: 'স্বাস্থ্য' },
    disaster: { en: 'Disaster', bn: 'দুর্যোগ' },
};

// Default safety resources (hardcoded for now)
const defaultResources: SafetyResource[] = [
    {
        id: '1',
        title_en: 'Women Safety Tips',
        title_bn: 'নারী নিরাপত্তা টিপস',
        summary_en: 'Essential safety tips every woman should know for personal protection',
        summary_bn: 'ব্যক্তিগত সুরক্ষার জন্য প্রতিটি নারীর জানা উচিত এমন প্রয়োজনীয় নিরাপত্তা টিপস',
        content_en: `
## Personal Safety Tips

1. **Stay Alert**: Always be aware of your surroundings
2. **Trust Your Instincts**: If something feels wrong, leave immediately
3. **Keep Emergency Numbers Ready**: Save 999 and other emergency contacts
4. **Share Your Location**: Let trusted people know where you are
5. **Avoid Isolated Areas**: Especially at night
6. **Self-Defense**: Consider learning basic self-defense techniques
7. **Carry Safety Tools**: Whistle, pepper spray (where legal)
8. **Keep Phone Charged**: Always have a way to call for help
        `,
        content_bn: `
## ব্যক্তিগত নিরাপত্তা টিপস

১. **সতর্ক থাকুন**: সর্বদা আপনার চারপাশে সচেতন থাকুন
২. **প্রবৃত্তিকে বিশ্বাস করুন**: কিছু ভুল মনে হলে, অবিলম্বে চলে যান
৩. **জরুরি নম্বর প্রস্তুত রাখুন**: ৯৯৯ এবং অন্যান্য জরুরি যোগাযোগ সংরক্ষণ করুন
৪. **আপনার অবস্থান শেয়ার করুন**: বিশ্বস্ত মানুষদের জানান আপনি কোথায় আছেন
৫. **নির্জন এলাকা এড়িয়ে চলুন**: বিশেষ করে রাতে
৬. **আত্মরক্ষা**: মৌলিক আত্মরক্ষা কৌশল শেখার কথা বিবেচনা করুন
৭. **নিরাপত্তা সরঞ্জাম বহন করুন**: হুইসেল, পেপার স্প্রে
৮. **ফোন চার্জ রাখুন**: সাহায্যের জন্য কল করার উপায় সবসময় রাখুন
        `,
        category: 'tips',
        image_url: null,
        pdf_url: null,
        video_url: null,
        is_featured: true,
    },
    {
        id: '2',
        title_en: 'Child Protection Guide',
        title_bn: 'শিশু সুরক্ষা গাইড',
        summary_en: 'Guide for protecting children from abuse and exploitation',
        summary_bn: 'নির্যাতন এবং শোষণ থেকে শিশুদের রক্ষা করার গাইড',
        content_en: `
## Child Protection Guidelines

1. **Teach Body Safety**: Help children understand good touch vs bad touch
2. **Open Communication**: Create an environment where children can talk freely
3. **Know the Warning Signs**: Behavioral changes, fear of certain people
4. **Supervise Online Activity**: Monitor internet usage
5. **Verify Caregivers**: Background check anyone who cares for your child
6. **Report Concerns**: Call 10921 for child abuse helpline
        `,
        content_bn: `
## শিশু সুরক্ষা নির্দেশিকা

১. **শরীরের নিরাপত্তা শেখান**: শিশুদের ভালো স্পর্শ বনাম খারাপ স্পর্শ বুঝতে সাহায্য করুন
২. **খোলা যোগাযোগ**: এমন পরিবেশ তৈরি করুন যেখানে শিশুরা অবাধে কথা বলতে পারে
৩. **সতর্কতা চিহ্নগুলি জানুন**: আচরণগত পরিবর্তন, নির্দিষ্ট মানুষের ভয়
৪. **অনলাইন কার্যকলাপ তত্ত্বাবধান**: ইন্টারনেট ব্যবহার নিরীক্ষণ করুন
৫. **পরিচর্যাকারীদের যাচাই করুন**: যারা আপনার সন্তানের যত্ন নেয় তাদের পটভূমি পরীক্ষা করুন
৬. **উদ্বেগ রিপোর্ট করুন**: শিশু নির্যাতন হেল্পলাইনের জন্য ১০৯২১ কল করুন
        `,
        category: 'guide',
        image_url: null,
        pdf_url: null,
        video_url: null,
        is_featured: true,
    },
    {
        id: '3',
        title_en: 'Legal Rights for Women',
        title_bn: 'নারীদের আইনি অধিকার',
        summary_en: 'Know your legal rights against harassment and violence',
        summary_bn: 'হয়রানি এবং সহিংসতার বিরুদ্ধে আপনার আইনি অধিকার জানুন',
        content_en: `
## Your Legal Rights

### Protection Against Domestic Violence
- Nari O Shishu Nirjatan Daman Ain 2000
- Right to file complaint at any police station
- Protection orders available from courts

### Workplace Harassment
- High Court Guidelines on Sexual Harassment (2009)
- Right to file complaint with employer
- Legal action through labor courts

### How to Report
1. Police: Dial 999
2. Women Helpline: 10921
3. Human Rights Commission
        `,
        content_bn: `
## আপনার আইনি অধিকার

### পারিবারিক সহিংসতার বিরুদ্ধে সুরক্ষা
- নারী ও শিশু নির্যাতন দমন আইন ২০০০
- যেকোনো থানায় অভিযোগ দায়ের করার অধিকার
- আদালত থেকে সুরক্ষা আদেশ পাওয়া যায়

### কর্মক্ষেত্রে হয়রানি
- যৌন হয়রানি বিষয়ে হাইকোর্টের নির্দেশনা (২০০৯)
- নিয়োগকর্তার কাছে অভিযোগ দায়ের করার অধিকার
- শ্রম আদালতের মাধ্যমে আইনি পদক্ষেপ

### কিভাবে রিপোর্ট করবেন
১. পুলিশ: ৯৯৯ ডায়াল করুন
২. নারী হেল্পলাইন: ১০৯২১
৩. মানবাধিকার কমিশন
        `,
        category: 'legal',
        image_url: null,
        pdf_url: null,
        video_url: null,
        is_featured: true,
    },
    {
        id: '4',
        title_en: 'Flood Safety Guide',
        title_bn: 'বন্যা নিরাপত্তা গাইড',
        summary_en: 'How to stay safe before, during, and after floods',
        summary_bn: 'বন্যার আগে, সময় এবং পরে কীভাবে নিরাপদ থাকবেন',
        content_en: `
## Flood Safety

### Before Flood
- Keep emergency kit ready
- Know evacuation routes
- Store important documents safely

### During Flood
- Move to higher ground immediately
- Avoid walking through moving water
- Stay away from electrical equipment

### After Flood
- Avoid flood water - may be contaminated
- Check for structural damage before entering buildings
- Document damage for insurance
        `,
        content_bn: `
## বন্যা নিরাপত্তা

### বন্যার আগে
- জরুরি কিট প্রস্তুত রাখুন
- সরিয়ে নেওয়ার পথ জানুন
- গুরুত্বপূর্ণ নথি নিরাপদে রাখুন

### বন্যার সময়
- অবিলম্বে উঁচু জায়গায় যান
- চলন্ত পানির মধ্য দিয়ে হাঁটা এড়িয়ে চলুন
- বৈদ্যুতিক সরঞ্জাম থেকে দূরে থাকুন

### বন্যার পরে
- বন্যার পানি এড়িয়ে চলুন - দূষিত হতে পারে
- বিল্ডিংয়ে প্রবেশের আগে কাঠামোগত ক্ষতি পরীক্ষা করুন
- বীমার জন্য ক্ষতি নথিভুক্ত করুন
        `,
        category: 'disaster',
        image_url: null,
        pdf_url: null,
        video_url: null,
        is_featured: false,
    },
];

export default function SafetyResourcesPage() {
    const { language } = useLanguage();
    const { isDark } = useTheme();
    const [resources, setResources] = useState<SafetyResource[]>(defaultResources);
    const [, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [expandedResource, setExpandedResource] = useState<string | null>(null);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const response = await fetch('/api/emergency/resources');
            const data = await response.json();
            if (data.success && data.data.length > 0) {
                setResources(data.data);
            }
        } catch (error) {
            console.error('Error fetching resources:', error);
            // Keep default resources
        } finally {
            setLoading(false);
        }
    };

    const getText = (en: string | null, bn: string | null) => {
        if (language === 'bn') return bn || en || '';
        return en || bn || '';
    };

    const categories = ['all', ...Array.from(new Set(resources.map(r => r.category)))];
    const filteredResources = selectedCategory === 'all'
        ? resources
        : resources.filter(r => r.category === selectedCategory);

    // Featured resources can be used for a special section if needed
    // const featuredResources = resources.filter(r => r.is_featured);

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Hero Header */}
            <div className={`relative py-16 md:py-24 ${isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-green-600 to-green-700'}`}>
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-6 md:px-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        {language === 'bn' ? 'নিরাপত্তা' : 'Safety'}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {language === 'bn' ? 'নিরাপত্তা সম্পদ' : 'Safety Resources'}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                        {language === 'bn'
                            ? 'গাইড, টিপস এবং হেল্পলাইন তথ্য আপনাকে এবং আপনার পরিবারকে নিরাপদ রাখতে'
                            : 'Guides, tips, and helpline information to keep you and your family safe'}
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
                        <span className={isDark ? 'text-green-400' : 'text-green-600'}>
                            {language === 'bn' ? 'নিরাপত্তা সম্পদ' : 'Safety Resources'}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Quick Access Cards */}
            <div className="max-w-7xl mx-auto px-6 md:px-16 py-8">
                <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'bn' ? 'দ্রুত অ্যাক্সেস' : 'Quick Access'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <Link
                        href="/emergency/contacts"
                        className={`p-6 rounded-xl text-center transition-all hover:scale-105 ${
                            isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 shadow-lg'
                        }`}
                    >
                        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {language === 'bn' ? 'জরুরি নম্বর' : 'Emergency Numbers'}
                        </h3>
                    </Link>
                    <Link
                        href="/emergency/sos"
                        className={`p-6 rounded-xl text-center transition-all hover:scale-105 ${
                            isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 shadow-lg'
                        }`}
                    >
                        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 flex items-center justify-center text-white">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {language === 'bn' ? 'এসওএস বাটন' : 'SOS Button'}
                        </h3>
                    </Link>
                    <a
                        href="tel:999"
                        className={`p-6 rounded-xl text-center transition-all hover:scale-105 ${
                            isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 shadow-lg'
                        }`}
                    >
                        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
                            <span className="text-2xl font-bold">999</span>
                        </div>
                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {language === 'bn' ? '৯৯৯ কল' : 'Call 999'}
                        </h3>
                    </a>
                    <a
                        href="tel:10921"
                        className={`p-6 rounded-xl text-center transition-all hover:scale-105 ${
                            isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 shadow-lg'
                        }`}
                    >
                        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white">
                            <span className="text-lg font-bold">10921</span>
                        </div>
                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {language === 'bn' ? 'নারী হেল্পলাইন' : 'Women Helpline'}
                        </h3>
                    </a>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                                selectedCategory === category
                                    ? 'bg-green-600 text-white shadow-lg'
                                    : isDark
                                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                            }`}
                        >
                            {categoryLabels[category]
                                ? (language === 'bn' ? categoryLabels[category].bn : categoryLabels[category].en)
                                : category.charAt(0).toUpperCase() + category.slice(1)
                            }
                        </button>
                    ))}
                </div>

                {/* Resources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((resource) => (
                        <div
                            key={resource.id}
                            className={`rounded-xl overflow-hidden ${
                                isDark ? 'bg-gray-800' : 'bg-white shadow-lg'
                            } hover:shadow-xl transition-all duration-300`}
                        >
                            {/* Header */}
                            <div className={`p-4 bg-gradient-to-r ${categoryColors[resource.category] || 'from-gray-500 to-gray-600'} text-white`}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        {categoryIcons[resource.category] || categoryIcons.guide}
                                    </div>
                                    <div>
                                        <span className="text-xs uppercase tracking-wide opacity-80">
                                            {categoryLabels[resource.category]
                                                ? (language === 'bn' ? categoryLabels[resource.category].bn : categoryLabels[resource.category].en)
                                                : resource.category}
                                        </span>
                                        <h3 className="font-bold">
                                            {getText(resource.title_en, resource.title_bn)}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {getText(resource.summary_en, resource.summary_bn)}
                                </p>

                                {expandedResource === resource.id && (
                                    <div className={`prose prose-sm max-w-none mb-4 ${isDark ? 'prose-invert' : ''}`}>
                                        <div
                                            className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                                            dangerouslySetInnerHTML={{
                                                __html: getText(resource.content_en, resource.content_bn)?.replace(/\n/g, '<br />') || ''
                                            }}
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={() => setExpandedResource(
                                        expandedResource === resource.id ? null : resource.id
                                    )}
                                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                                        isDark
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {expandedResource === resource.id
                                        ? (language === 'bn' ? 'কম দেখুন' : 'Show Less')
                                        : (language === 'bn' ? 'বিস্তারিত দেখুন' : 'Read More')
                                    }
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Helplines Section */}
            <div className={`py-16 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className="max-w-7xl mx-auto px-6 md:px-16">
                    <h2 className={`text-2xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {language === 'bn' ? 'গুরুত্বপূর্ণ হেল্পলাইন' : 'Important Helplines'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                        <a
                            href="tel:999"
                            className={`p-6 rounded-xl text-center ${isDark ? 'bg-gray-700' : 'bg-white shadow'}`}
                        >
                            <div className="text-3xl font-bold text-red-500 mb-2">999</div>
                            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                {language === 'bn' ? 'জাতীয় জরুরি সেবা' : 'National Emergency'}
                            </p>
                        </a>
                        <a
                            href="tel:10921"
                            className={`p-6 rounded-xl text-center ${isDark ? 'bg-gray-700' : 'bg-white shadow'}`}
                        >
                            <div className="text-3xl font-bold text-purple-500 mb-2">10921</div>
                            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                {language === 'bn' ? 'নারী ও শিশু হেল্পলাইন' : 'Women & Child Helpline'}
                            </p>
                        </a>
                        <a
                            href="tel:106"
                            className={`p-6 rounded-xl text-center ${isDark ? 'bg-gray-700' : 'bg-white shadow'}`}
                        >
                            <div className="text-3xl font-bold text-blue-500 mb-2">106</div>
                            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                {language === 'bn' ? 'দুর্নীতি দমন' : 'Anti-Corruption'}
                            </p>
                        </a>
                        <a
                            href="tel:16263"
                            className={`p-6 rounded-xl text-center ${isDark ? 'bg-gray-700' : 'bg-white shadow'}`}
                        >
                            <div className="text-3xl font-bold text-green-500 mb-2">16263</div>
                            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                {language === 'bn' ? 'স্বাস্থ্য হেল্পলাইন' : 'Health Helpline'}
                            </p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
