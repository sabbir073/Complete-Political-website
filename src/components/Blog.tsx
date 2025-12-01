"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { getReadTimeText, stripHtml } from "@/lib/cms-utils";

interface NewsItem {
  id: string;
  title_en: string;
  title_bn?: string;
  slug: string;
  excerpt_en?: string;
  excerpt_bn?: string;
  content_en?: string;
  content_bn?: string;
  published_at: string;
  featured_image?: string;
  featured_image_alt_en?: string;
  featured_image_alt_bn?: string;
  author_name?: string;
  is_featured?: boolean;
  category?: {
    id: string;
    name_en: string;
    name_bn?: string;
  };
}

const Blog: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  const { isDark } = useTheme();

  // Helper function to get localized text
  const getText = (en?: string, bn?: string) => {
    if (language === 'bn' && bn) return bn;
    return en || '';
  };

  // Format date with Bangladesh timezone
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Dhaka' // Always show in Bangladesh time
    };
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', options);
  };


  useEffect(() => {
    const fetchNews = async () => {
      try {
        // ONLY fetch featured news - no fallback to non-featured
        const response = await fetch('/api/news?featured=true&limit=3');
        const data = await response.json();

        if (data.data) {
          // Only show news that are marked as featured
          setNews(data.data);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('blog-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  return (
    <section
      id="blog-section"
      className={`w-full px-6 md:px-16 py-16 overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center md:text-left mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className={`text-sm font-semibold mb-2 ${
            isDark ? "text-red-400" : "text-red-600"
          }`}>
            {t.blog?.sectionLabel || "Stay Informed"}
          </p>
          <div className={`w-10 h-[2px] mb-4 mx-auto md:mx-0 rounded-full ${
            isDark ? "bg-red-400" : "bg-red-600"
          }`} />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 md:mb-0 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              {t.blog?.title || "Latest News"}
            </h2>
            <Link href="/news" className="hidden md:inline-block">
              <button className={`relative px-5 py-2 rounded cursor-pointer group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${
                isDark
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-primaryRed hover:bg-red-600 text-white"
              }`}>
                <span className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded ${
                  isDark
                    ? "bg-gradient-to-r from-red-700 to-red-800"
                    : "bg-gradient-to-r from-primaryRed to-red-600"
                }`}></span>
                <span className="relative z-10 font-semibold">
                  {t.blog?.viewAll || "View All"}
                </span>
              </button>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && news.length === 0 && (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'bn' ? 'কোনো সংবাদ পাওয়া যায়নি।' : 'No news found.'}
          </div>
        )}

        {/* Blog Grid */}
        {!loading && news.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((post, index) => (
            <article
              key={post.id}
              className={`group cursor-pointer transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{
                transitionDelay: `${index * 200 + 300}ms`
              }}
            >
              <Link href={`/news/${post.slug}`}>
                {/* Blog Card */}
                <div className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden ${
                  isDark
                    ? "bg-gray-900 shadow-gray-900/50 hover:shadow-gray-900/70"
                    : "bg-white shadow-gray-500/30 hover:shadow-gray-500/40"
                }`}>
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.featured_image || '/events/event1.jpg'}
                      alt={getText(post.title_en, post.title_bn)}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      unoptimized={post.featured_image?.includes('cloudfront')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Meta Info */}
                    <div className={`flex items-center text-sm mb-3 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}>
                      <span>{formatDate(post.published_at)}</span>
                      <span className="mx-2">•</span>
                      <span>{getReadTimeText(post.content_en, post.content_bn, language as 'en' | 'bn')}</span>
                    </div>

                    {/* Title */}
                    <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 line-clamp-2 ${
                      isDark
                        ? "text-white group-hover:text-red-400"
                        : "text-gray-900 group-hover:text-red-600"
                    }`}>
                      {getText(post.title_en, post.title_bn)}
                    </h3>

                    {/* Excerpt */}
                    <p className={`mb-4 leading-relaxed line-clamp-3 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {getText(post.excerpt_en, post.excerpt_bn) ||
                        stripHtml(getText(post.content_en, post.content_bn) || '').substring(0, 150) + '...'}
                    </p>

                    {/* Author & Read More */}
                    <div className={`flex items-center justify-between pt-4 border-t ${
                      isDark ? "border-gray-700" : "border-gray-100"
                    }`}>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-red-600">
                          <span className="text-white text-xs font-semibold">
                            {(post.author_name || 'Admin').charAt(0)}
                          </span>
                        </div>
                        <span className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {post.author_name || 'Admin'}
                        </span>
                      </div>

                      <div className={`text-sm font-semibold transition-colors duration-300 ${
                        isDark
                          ? "text-red-400 group-hover:text-red-300"
                          : "text-red-600 group-hover:text-red-700"
                      }`}>
                        {t.blog?.readMore || "Read More"} →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
        )}

        {/* Mobile View More Button */}
        {!loading && news.length > 0 && (
        <div className="md:hidden text-center mt-8">
          <Link href="/news">
            <button className={`relative px-6 py-3 rounded cursor-pointer group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${
              isDark
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-primaryRed hover:bg-red-600 text-white"
            }`}>
              <span className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded ${
                isDark
                  ? "bg-gradient-to-r from-red-700 to-red-800"
                  : "bg-gradient-to-r from-primaryRed to-red-600"
              }`}></span>
              <span className="relative z-10 font-semibold">
                {t.blog?.viewAllNews || "View All News"}
              </span>
            </button>
          </Link>
        </div>
        )}
      </div>
    </section>
  );
};

export default Blog;
