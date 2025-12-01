'use client';

import Link from 'next/link';
import { useTheme } from '@/providers/ThemeProvider';

export default function ServicesPage() {
    const { isDark } = useTheme();

    const services = [
        {
            title: 'Contacts',
            description: 'View and manage contact form submissions from the public website.',
            href: '/admin/services/contacts',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            color: 'blue',
        },
        {
            title: 'Complaints',
            description: 'Track and resolve user complaints and issues with tracking system.',
            href: '/admin/services/complaints',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            color: 'orange',
        },
    ];

    const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
        blue: {
            bg: isDark ? 'bg-blue-900/30' : 'bg-blue-100',
            text: isDark ? 'text-blue-400' : 'text-blue-600',
            border: isDark ? 'border-blue-800' : 'border-blue-200',
        },
        orange: {
            bg: isDark ? 'bg-orange-900/30' : 'bg-orange-100',
            text: isDark ? 'text-orange-400' : 'text-orange-600',
            border: isDark ? 'border-orange-800' : 'border-orange-200',
        },
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Services
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Manage public services and user submissions
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => {
                    const colors = colorClasses[service.color];
                    return (
                        <Link
                            key={service.title}
                            href={service.href}
                            className={`relative block p-6 rounded-xl border transition-all duration-200 hover:shadow-lg ${
                                isDark
                                    ? `bg-gray-800 ${colors.border} hover:bg-gray-750`
                                    : `bg-white ${colors.border} hover:shadow-xl`
                            }`}
                        >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${colors.bg}`}>
                                <div className={colors.text}>{service.icon}</div>
                            </div>
                            <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {service.title}
                            </h2>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {service.description}
                            </p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
