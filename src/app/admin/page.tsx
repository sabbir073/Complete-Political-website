/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useAuth } from '@/stores/auth-clean';
import { useTheme } from '@/providers/ThemeProvider';

function AdminDashboardContent() {
  const { user, profile, isAdmin, canAccessUserManagement, canAccessContent } = useAuth();
  const { isDark } = useTheme();

  // Get user role for display logic
  const userRole = profile?.role || 'user';

  // Static dummy data for different roles
  const getDashboardData = () => {
    switch (userRole) {
      case 'admin':
        return {
          stats: [
            // User Management Statistics (Admin only)
            { title: 'Total Users', value: 156, icon: '👥', color: 'blue' },
            { title: 'Active Users', value: 142, icon: '✅', color: 'green' },
            { title: 'Inactive Users', value: 14, icon: '❌', color: 'red' },
            { title: 'Administrators', value: 3, icon: '🛡️', color: 'purple' },
            { title: 'Moderators', value: 8, icon: '⚖️', color: 'indigo' },
            
            // Content & Engagement Statistics
            { title: 'Contact/Complaints', value: 45, icon: '📧', color: 'orange' },
            { title: 'Live Polls & Surveys', value: 12, icon: '🗳️', color: 'pink' },
            { title: 'News Articles', value: 28, icon: '📰', color: 'cyan' },
            { title: 'Events', value: 15, icon: '📅', color: 'teal' },
            { title: 'Gallery Items', value: 234, icon: '🖼️', color: 'emerald' },
            { title: 'Volunteers', value: 89, icon: '🤝', color: 'lime' },
            { title: 'Forum Discussions', value: 67, icon: '💬', color: 'amber' },
            { title: 'Problem Reports', value: 32, icon: '⚠️', color: 'rose' },
            
            // Technical & System Statistics (Admin only)
            { title: 'System Uptime', value: '99.8%', icon: '⚡', color: 'green' },
            { title: 'Storage Usage', value: '2.4GB', icon: '💾', color: 'blue' },
            { title: 'Email/SMS Sent', value: 1247, icon: '📨', color: 'purple' }
          ],
          quickActions: [
            { title: 'User Management', icon: '👥', href: '/admin/users', color: 'red' },
            { title: 'Content Management', icon: '📝', href: '/admin/content', color: 'green' },
            { title: 'System Settings', icon: '⚙️', href: '/admin/settings', color: 'blue' },
            { title: 'Analytics Dashboard', icon: '📊', href: '/admin/analytics', color: 'purple' },
            { title: 'Backup & Maintenance', icon: '🔧', href: '/admin/backup', color: 'orange' },
            { title: 'Email/SMS Templates', icon: '📧', href: '/admin/templates', color: 'pink' },
            { title: 'SEO Management', icon: '🔍', href: '/admin/seo', color: 'cyan' },
            { title: 'Activity Logs', icon: '📋', href: '/admin/logs', color: 'indigo' }
          ],
          systemStatus: [
            { name: 'Database Connection', status: 'Online', color: 'green' },
            { name: 'Authentication Service', status: 'Active', color: 'green' },
            { name: 'S3 Storage', status: 'Available', color: 'green' },
            { name: 'Email Service', status: 'Working', color: 'green' },
            { name: 'CDN Status', status: 'Optimal', color: 'blue' }
          ]
        };

      case 'moderator':
        return {
          stats: [
            // Content & Engagement Statistics (Same as Admin but no user management/technical)
            { title: 'Contact/Complaints', value: 45, icon: '📧', color: 'orange' },
            { title: 'Live Polls & Surveys', value: 12, icon: '🗳️', color: 'pink' },
            { title: 'News Articles', value: 28, icon: '📰', color: 'cyan' },
            { title: 'Events', value: 15, icon: '📅', color: 'teal' },
            { title: 'Gallery Items', value: 234, icon: '🖼️', color: 'emerald' },
            { title: 'Volunteers', value: 89, icon: '🤝', color: 'lime' },
            { title: 'Forum Discussions', value: 67, icon: '💬', color: 'amber' },
            { title: 'Problem Reports', value: 32, icon: '⚠️', color: 'rose' }
          ],
          quickActions: [
            { title: 'Content Management', icon: '📝', href: '/admin/content', color: 'green' },
            { title: 'Event Management', icon: '📅', href: '/admin/events', color: 'blue' },
            { title: 'Volunteer Coordination', icon: '🤝', href: '/admin/volunteers', color: 'purple' },
            { title: 'Poll/Survey Creation', icon: '🗳️', href: '/admin/polls', color: 'pink' },
            { title: 'Community Moderation', icon: '⚖️', href: '/admin/moderation', color: 'orange' },
            { title: 'Gallery Management', icon: '🖼️', href: '/admin/gallery', color: 'cyan' }
          ],
          systemStatus: null // No system status for moderators
        };

      default: // user/volunteer
        return {
          stats: [
            // Personal Participation Statistics
            { title: 'My Submissions', value: 3, icon: '📝', color: 'blue' },
            { title: 'My Poll Responses', value: 8, icon: '🗳️', color: 'green' },
            { title: 'My Volunteer Activities', value: 5, icon: '🤝', color: 'purple' },
            { title: 'My Event Attendance', value: 2, icon: '📅', color: 'orange' }
          ],
          quickActions: [
            { title: 'Submit Complaint', icon: '📧', href: '/submit-complaint', color: 'red' },
            { title: 'Join Poll/Survey', icon: '🗳️', href: '/polls', color: 'green' },
            { title: 'My Volunteer Profile', icon: '🤝', href: '/my-profile', color: 'blue' },
            { title: 'Register for Events', icon: '📅', href: '/events', color: 'purple' }
          ],
          systemStatus: null // No system status for users
        };
    }
  };

  const dashboardData = getDashboardData();

  // Color mapping for Tailwind classes
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500' },
      green: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500' },
      red: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500' },
      orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500' },
      pink: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500' },
      cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500' },
      teal: { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500' },
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500' },
      lime: { bg: 'bg-lime-500/10', text: 'text-lime-500', border: 'border-lime-500' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500' },
      rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500' },
      indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500' }
    };
    return colorMap[color] || colorMap.blue;
  };

  // Get welcome message based on role
  const getWelcomeMessage = () => {
    switch (userRole) {
      case 'admin':
        return {
          title: 'Welcome to Admin Dashboard',
          subtitle: 'Complete campaign management and system administration'
        };
      case 'moderator':
        return {
          title: 'Welcome to Moderator Dashboard',
          subtitle: 'Content management and community moderation tools'
        };
      default:
        return {
          title: 'Welcome to Your Dashboard',
          subtitle: 'Your participation in our political campaign'
        };
    }
  };

  const welcomeMessage = getWelcomeMessage();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`p-6 rounded-xl shadow-lg transition-colors ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold mb-2 transition-colors ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {welcomeMessage.title}
              </h2>
              <p className={`transition-colors ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {welcomeMessage.subtitle}
              </p>
              <p className={`text-sm mt-1 transition-colors ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Role: <span className="font-medium capitalize">{userRole}</span> | 
                Welcome, {profile?.full_name || user?.email}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              isDark ? 'bg-red-600/10' : 'bg-red-500/10'
            }`}>
              <span className="text-3xl">
                {userRole === 'admin' ? '🛡️' : userRole === 'moderator' ? '⚖️' : '🗳️'}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className={`grid gap-6 ${
          userRole === 'admin' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5' 
            : userRole === 'moderator'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {dashboardData.stats.map((stat, index) => {
            const colors = getColorClasses(stat.color);
            return (
              <div
                key={index}
                className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 transform ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colors.bg}`}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <span className={`text-3xl font-bold transition-colors ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </span>
                </div>
                <h3 className={`text-sm font-medium transition-colors ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stat.title}
                </h3>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className={`p-6 rounded-xl shadow-lg transition-colors ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-xl font-bold mb-6 transition-colors ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Quick Actions
          </h3>
          <div className={`grid gap-4 ${
            userRole === 'admin' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
              : userRole === 'moderator'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}>
            {dashboardData.quickActions.map((action, index) => {
              const colors = getColorClasses(action.color);
              return (
                <a
                  key={index}
                  href={action.href}
                  className={`group p-6 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105 text-center ${
                    isDark 
                      ? `border-gray-600 hover:${colors.border} hover:bg-gray-700` 
                      : `border-gray-300 hover:${colors.border} hover:bg-gray-50`
                  }`}
                >
                  <div className={`text-3xl mb-3 transition-colors ${
                    isDark ? `text-gray-400 group-hover:${colors.text}` : `text-gray-600 group-hover:${colors.text}`
                  }`}>
                    {action.icon}
                  </div>
                  <span className={`font-medium transition-colors ${
                    isDark ? `text-gray-300 group-hover:${colors.text}` : `text-gray-700 group-hover:${colors.text}`
                  }`}>
                    {action.title}
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* System Status (Admin Only) */}
        {dashboardData.systemStatus && (
          <div className={`p-6 rounded-xl shadow-lg transition-colors ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-xl font-bold mb-4 transition-colors ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              System Status
            </h3>
            <div className="space-y-3">
              {dashboardData.systemStatus.map((status, index) => {
                const colors = getColorClasses(status.color);
                return (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${colors.bg}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${status.color === 'green' ? 'bg-green-500' : 'bg-blue-500'} rounded-full ${status.color === 'green' ? 'animate-pulse' : ''}`}></div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {status.name}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${colors.text}`}>
                      {status.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
  );
}

export default function AdminDashboard() {
  return <AdminDashboardContent />;
}