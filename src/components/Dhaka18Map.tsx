'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTheme } from '@/providers/ThemeProvider';

interface WardStats {
    ward: string;
    total: number;
    pending: number;
    in_progress: number;
    under_review: number;
    responded: number;
    resolved: number;
    rejected: number;
    intensity: number;
}

interface Dhaka18MapProps {
    stats: WardStats[];
    language?: 'en' | 'bn';
    onWardClick?: (ward: string) => void;
}

// Ward label positions on the SVG map (based on the user's SVG dimensions: 577x433)
// Positioned to match the actual Dhaka-18 constituency ward boundaries in the PDF
const wardLabels: Record<string, { x: number; y: number }> = {
    // Position 1 (top-left area)
    '54': { x: 130, y: 55 },

    // Other positions - will be adjusted based on user feedback
    '47': { x: 280, y: 118 },
    '50': { x: 270, y: 175 },
    '46': { x: 395, y: 70 },
    '48': { x: 375, y: 215 },
    '53': { x: 105, y: 120 },
    '01': { x: 230, y: 140 },
    '45': { x: 375, y: 125 },
    '52': { x: 120, y: 195 },
    '51': { x: 180, y: 140 },
    '49': { x: 315, y: 245 },
    '17': { x: 340, y: 330 },
    '43': { x: 480, y: 300 },
    '44': { x: 450, y: 155 },
};

export default function Dhaka18Map({ stats, language = 'en', onWardClick }: Dhaka18MapProps) {
    const { isDark } = useTheme();
    const [hoveredWard, setHoveredWard] = useState<string | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    // Get color based on intensity (0 = light, 1 = deep red)
    const getHeatColor = (intensity: number) => {
        if (intensity === 0) {
            return isDark ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.8)';
        }
        // Gradient from light red to deep red
        const r = 239;
        const g = Math.round(180 - (160 * intensity));
        const b = Math.round(180 - (160 * intensity));
        return `rgba(${r}, ${g}, ${b}, 0.85)`;
    };

    const getWardStats = (ward: string): WardStats | undefined => {
        return stats.find(s => s.ward === ward);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const hoveredStats = hoveredWard ? getWardStats(hoveredWard) : null;

    return (
        <div className="relative w-full">
            {/* Map Legend */}
            <div className={`mb-4 flex flex-wrap items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>{language === 'bn' ? 'সমস্যার তীব্রতা:' : 'Problem Intensity:'}</span>
                <div className="flex items-center gap-1">
                    <div className={`w-6 h-4 rounded ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-300'}`}></div>
                    <span>{language === 'bn' ? 'কম' : 'Low'}</span>
                </div>
                <div className="w-24 h-4 rounded" style={{ background: 'linear-gradient(to right, #fecaca, #ef4444, #991b1b)' }}></div>
                <span>{language === 'bn' ? 'বেশি' : 'High'}</span>
            </div>

            {/* Map Container */}
            <div
                className="relative"
                onMouseMove={handleMouseMove}
            >
                {/* SVG Map Image */}
                <div className={`relative rounded-xl border-2 overflow-hidden ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-white'}`}>
                    <Image
                        src="/dhaka-18-map.svg"
                        alt="Dhaka-18 Constituency Map"
                        width={577}
                        height={433}
                        className="w-full h-auto"
                        priority
                    />

                    {/* Ward Labels Overlay */}
                    <svg
                        viewBox="0 0 577 433"
                        className="absolute inset-0 w-full h-full"
                        style={{ pointerEvents: 'none' }}
                    >
                        {Object.entries(wardLabels).map(([ward, pos]) => {
                            const wardStats = getWardStats(ward);
                            const intensity = wardStats?.intensity || 0;
                            const isHovered = hoveredWard === ward;
                            return (
                                <g
                                    key={ward}
                                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                                    onMouseEnter={() => setHoveredWard(ward)}
                                    onMouseLeave={() => setHoveredWard(null)}
                                    onClick={() => onWardClick?.(ward)}
                                >
                                    {/* Ward marker circle */}
                                    <circle
                                        cx={pos.x}
                                        cy={pos.y}
                                        r={isHovered ? 16 : 13}
                                        fill={getHeatColor(intensity)}
                                        stroke={isHovered ? '#f97316' : (isDark ? '#6b7280' : '#374151')}
                                        strokeWidth={isHovered ? 2 : 1.5}
                                        className="transition-all duration-200"
                                        style={{
                                            filter: isHovered ? 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4))' : 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.2))',
                                        }}
                                    />

                                    {/* Ward number */}
                                    <text
                                        x={pos.x}
                                        y={pos.y + 4}
                                        textAnchor="middle"
                                        className="font-bold"
                                        fill={intensity > 0.4 ? '#ffffff' : (isDark ? '#f9fafb' : '#1f2937')}
                                        style={{
                                            fontSize: '10px',
                                            textShadow: intensity > 0.3 ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                                        }}
                                    >
                                        {ward}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Title */}
                <div className={`mt-3 text-center font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'bn' ? 'ঢাকা-১৮ সংসদীয় এলাকা' : 'Dhaka-18 Parliamentary Constituency'}
                </div>

                {/* Tooltip */}
                {hoveredWard && hoveredStats && (
                    <div
                        className={`absolute z-50 p-4 rounded-xl shadow-2xl pointer-events-none transition-opacity ${
                            isDark ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'
                        }`}
                        style={{
                            left: Math.min(tooltipPosition.x + 15, 280),
                            top: Math.max(tooltipPosition.y - 10, 10),
                            minWidth: '180px',
                        }}
                    >
                        <h4 className={`font-bold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {language === 'bn' ? `ওয়ার্ড ${hoveredWard}` : `Ward ${hoveredWard}`}
                        </h4>
                        <div className="space-y-1.5">
                            <div className="flex justify-between">
                                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                    {language === 'bn' ? 'মোট সমস্যা' : 'Total Issues'}
                                </span>
                                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {hoveredStats.total}
                                </span>
                            </div>
                            <hr className={isDark ? 'border-gray-700' : 'border-gray-200'} />
                            <div className="flex justify-between text-sm">
                                <span className="text-yellow-500">{language === 'bn' ? 'অমীমাংসিত' : 'Pending'}</span>
                                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{hoveredStats.pending}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-blue-500">{language === 'bn' ? 'চলমান' : 'In Progress'}</span>
                                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{hoveredStats.in_progress}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-green-500">{language === 'bn' ? 'সমাধান' : 'Resolved'}</span>
                                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{hoveredStats.resolved}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile: Ward grid for smaller screens */}
            <div className="mt-6 lg:hidden">
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'bn' ? 'ওয়ার্ড অনুযায়ী সমস্যা' : 'Issues by Ward'}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {stats.map(stat => (
                        <button
                            key={stat.ward}
                            onClick={() => onWardClick?.(stat.ward)}
                            className={`p-3 rounded-lg text-center transition-all ${
                                isDark
                                    ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                                    : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
                            }`}
                            style={{
                                borderLeftWidth: '4px',
                                borderLeftColor: getHeatColor(stat.intensity),
                            }}
                        >
                            <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {stat.ward}
                            </p>
                            <p className={`text-lg font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                                {stat.total}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
