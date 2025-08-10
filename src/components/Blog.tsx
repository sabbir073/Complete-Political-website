"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

const Blog: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

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

  const blogPosts = [
    {
      id: 1,
      image: "/blog/blog1.jpg",
      title: "Building Stronger Communities Through Unity",
      excerpt: "Our commitment to fostering community bonds continues to strengthen relationships across all sectors of society, creating lasting positive change.",
      date: "December 15, 2024",
      author: "Editorial Team",
      readTime: "3 min read"
    },
    {
      id: 2,
      image: "/blog/blog2.jpg", 
      title: "Economic Development Initiatives Show Promise",
      excerpt: "Recent policy implementations demonstrate significant progress in rural development and infrastructure improvement across the nation.",
      date: "December 12, 2024",
      author: "Policy Analysis",
      readTime: "5 min read"
    },
    {
      id: 3,
      image: "/blog/blog3.jpg",
      title: "Youth Engagement in Democratic Processes",
      excerpt: "Encouraging young voices in political discourse ensures a brighter future for democratic values and participatory governance.",
      date: "December 10, 2024",
      author: "Youth Affairs",
      readTime: "4 min read"
    }
  ];

  return (
    <section id="blog-section" className="w-full px-6 md:px-16 py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center md:text-left mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-sm text-red-600 font-semibold mb-2">Stay Informed</p>
          <div className="w-10 h-[2px] bg-red-600 mb-4 mx-auto md:mx-0 rounded-full" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-0">
              Latest News
            </h2>
            <button className="relative bg-primaryRed text-white px-5 py-2 rounded cursor-pointer group">
              <span className="absolute inset-0 bg-gradient-to-r from-primaryRed to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10">View All</span>
            </button>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <article
              key={post.id}
              className={`group cursor-pointer transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ 
                transitionDelay: `${index * 200 + 300}ms` 
              }}
            >
              {/* Blog Card */}
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Meta Info */}
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <span>{post.readTime}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-700 mb-4 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Author & Read More */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-semibold">
                          {post.author.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">{post.author}</span>
                    </div>
                    
                    <div className="text-red-600 text-sm font-semibold group-hover:text-red-700 transition-colors duration-300">
                      Read More →
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;