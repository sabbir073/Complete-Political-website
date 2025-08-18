'use client';

import { useAuth } from '@/stores/auth-clean';
import { useTheme } from '@/providers/ThemeProvider';
import MediaLibrary from '@/components/media/MediaLibrary';

export default function MediaManagerPage() {
  const { canAccessContent } = useAuth();
  const { isDark } = useTheme();

  if (!canAccessContent) {
    return (
      <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        <p className="text-lg">You don't have permission to access media management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Media Manager
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Upload, organize, and manage all media files for your political campaign website
        </p>
      </div>

      {/* Media Library */}
      <div className={`rounded-lg border p-6 ${
        isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <MediaLibrary 
          showUploader={true}
        />
      </div>
    </div>
  );
}