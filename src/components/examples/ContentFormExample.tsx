"use client";

import { useState } from 'react';
import { MediaItem } from '@/types/media.types';
import { MediaPicker, useMediaPicker } from '@/components/media';
import { useTheme } from '@/providers/ThemeProvider';

// Example of how to use MediaPicker in a content creation form
export default function ContentFormExample() {
  const { isDark } = useTheme();
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Media pickers using the hook
  const featuredImage = useMediaPicker();
  const galleryImages = useMediaPicker();
  const featuredVideo = useMediaPicker();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form data with media
    const formData = {
      title,
      content,
      featured_image: featuredImage.value,
      gallery_images: galleryImages.value,
      featured_video: featuredVideo.value
    };
    
    console.log('Form Data:', formData);
    alert('Check console for form data with media selections!');
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Content Creation Form (Example)
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="Enter article title"
            required
          />
        </div>

        {/* Content */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="Write your content here..."
            required
          />
        </div>

        {/* Featured Image */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Featured Image
          </label>
          <MediaPicker
            value={featuredImage.value}
            onChange={featuredImage.setValue}
            fileType="image"
            placeholder="Choose a featured image"
          />
        </div>

        {/* Gallery Images */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Gallery Images (Optional)
          </label>
          <MediaPicker
            value={galleryImages.value}
            onChange={galleryImages.setValue}
            multiple={true}
            fileType="image"
            maxSelections={10}
            placeholder="Select gallery images"
          />
        </div>

        {/* Featured Video */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Featured Video (Optional)
          </label>
          <MediaPicker
            value={featuredVideo.value}
            onChange={featuredVideo.setValue}
            fileType="video"
            placeholder="Choose a video"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setTitle('');
              setContent('');
              featuredImage.clear();
              galleryImages.clear();
              featuredVideo.clear();
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Clear Form
          </button>
          
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Publish Article
          </button>
        </div>
      </form>

      {/* Debug Info */}
      <div className="mt-8 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
        <h3 className="font-medium mb-2">Form State (Debug):</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify({
            title,
            content: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
            featured_image: featuredImage.value ? 'Selected' : 'None',
            gallery_images: Array.isArray(galleryImages.value) ? `${galleryImages.value.length} items` : 'None',
            featured_video: featuredVideo.value ? 'Selected' : 'None'
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}