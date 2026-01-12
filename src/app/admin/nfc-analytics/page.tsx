"use client";

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';

interface Stats {
  totalVisits: number;
  uniqueVisitors: number;
  totalClicks: number;
  visitsToday: number;
  visitsThisWeek: number;
  visitsThisMonth: number;
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  osBreakdown: Record<string, number>;
  topLinks: Array<{ name: string; url: string; count: number }>;
}

interface TimelineData {
  date: string;
  visits: number;
}

export default function NFCAnalyticsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [stats, setStats] = useState<Stats | null>(null);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'links'>('overview');

  useEffect(() => {
    fetchStats();
    fetchTimeline();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('[NFC Analytics] Fetching stats...');
      const response = await fetch('/api/admin/nfc/analytics?action=overview');
      console.log('[NFC Analytics] Response status:', response.status);
      const data = await response.json();
      console.log('[NFC Analytics] Response data:', data);
      if (data.success) {
        setStats(data.stats);
        console.log('[NFC Analytics] Stats set:', data.stats);
      } else {
        console.error('[NFC Analytics] API returned success=false:', data);
      }
    } catch (error) {
      console.error('[NFC Analytics] Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      const response = await fetch('/api/admin/nfc/analytics?action=timeline');
      const data = await response.json();
      if (data.success) {
        setTimeline(data.timeline);
      }
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
    }
  };

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
      <div className={`p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            NFC / QR Analytics
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Track visits and link clicks from your NFC card and QR codes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Visits */}
          <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Visits
                </p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats?.totalVisits.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-xs">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Today: <strong>{stats?.visitsToday}</strong>
              </span>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Week: <strong>{stats?.visitsThisWeek}</strong>
              </span>
            </div>
          </div>

          {/* Unique Visitors */}
          <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Unique Visitors
                </p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats?.uniqueVisitors.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 text-xs">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Unique session IDs tracked
              </span>
            </div>
          </div>

          {/* Total Link Clicks */}
          <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Clicks
                </p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats?.totalClicks.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
            </div>
            <div className="mt-4 text-xs">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Links clicked from NFC page
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className={`inline-flex rounded-lg p-1 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-green-600 text-white'
                  : isDark
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'timeline'
                  ? 'bg-green-600 text-white'
                  : isDark
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'links'
                  ? 'bg-green-600 text-white'
                  : isDark
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Top Links
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Breakdown */}
            <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Device Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(stats?.deviceBreakdown || {}).map(([device, count]) => (
                  <div key={device}>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {device}
                      </span>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {count} ({getPercentage(count, stats?.totalVisits || 0)}%)
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600"
                        style={{ width: `${getPercentage(count, stats?.totalVisits || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Browser Breakdown */}
            <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Browser Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(stats?.browserBreakdown || {}).map(([browser, count]) => (
                  <div key={browser}>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {browser}
                      </span>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {count} ({getPercentage(count, stats?.totalVisits || 0)}%)
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                        style={{ width: `${getPercentage(count, stats?.totalVisits || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OS Breakdown */}
            <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg lg:col-span-2`}>
              <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Operating System Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats?.osBreakdown || {}).map(([os, count]) => (
                  <div key={os} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {os}
                      </span>
                      <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {count}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {getPercentage(count, stats?.totalVisits || 0)}% of total
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Visits Timeline (Last 30 Days)
            </h3>
            <div className="h-64 flex items-end justify-between gap-1">
              {timeline.map((day, index) => {
                const maxVisits = Math.max(...timeline.map((d) => d.visits), 1);
                const heightPercent = (day.visits / maxVisits) * 100;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="relative w-full">
                      <div
                        className={`w-full rounded-t transition-all group-hover:opacity-80 ${
                          day.visits > 0 ? 'bg-gradient-to-t from-green-600 to-green-400' : 'bg-gray-300'
                        }`}
                        style={{ height: `${Math.max(heightPercent, 2)}%`, minHeight: '4px' }}
                        title={`${day.date}: ${day.visits} visits`}
                      ></div>
                    </div>
                    {index % 5 === 0 && (
                      <span className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(day.date).getDate()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Most Clicked Links
            </h3>
            <div className="space-y-3">
              {stats?.topLinks.map((link, index) => (
                <div
                  key={link.name}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0
                        ? 'bg-yellow-500 text-white'
                        : index === 1
                        ? 'bg-gray-400 text-white'
                        : index === 2
                        ? 'bg-orange-600 text-white'
                        : isDark
                        ? 'bg-gray-600 text-gray-300'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {link.name}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {link.url}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {link.count}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>clicks</p>
                  </div>
                </div>
              ))}

              {(!stats?.topLinks || stats.topLinks.length === 0) && (
                <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No link clicks recorded yet
                </p>
              )}
            </div>
          </div>
        )}
      </div>
  );
}
