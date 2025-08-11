"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const AboutContent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const stats = [
    { number: "৩৫+", label: "বছরের অভিজ্ঞতা", color: "from-blue-500 to-blue-600" },
    { number: "১০+", label: "গুরুত্বপূর্ণ পদ", color: "from-green-500 to-green-600" },
    { number: "২০২০", label: "সংসদ সদস্য প্রার্থী", color: "from-purple-500 to-purple-600" },
    { number: "২০২৫", label: "বর্তমান দায়িত্ব", color: "from-red-500 to-red-600" }
  ];

  const timeline = [
    { year: "১৯৯০", event: "রাজনৈতিক যাত্রা শুরু", details: "তেজগাঁও কলেজ ছাত্রদলের সদস্য সচিব" },
    { year: "১৯৯১", event: "ছাত্র সংসদের ভি.পি", details: "ছাত্র-ছাত্রীদের প্রত্যক্ষ ভোটে নির্বাচিত" },
    { year: "২০০১", event: "ছাত্রদল সভাপতি", details: "ঢাকা মহানগর উত্তর ও কেন্দ্রীয় যুগ্ম-সম্পাদক" },
    { year: "২০১৭", event: "যুবদল সভাপতি", details: "ঢাকা মহানগর উত্তর ও কেন্দ্রীয় সহ-সভাপতি" },
    { year: "২০২০", event: "সংসদ সদস্য প্রার্থী", details: "ঢাকা-১৮ আসনের উপনির্বাচনে" },
    { year: "২০২৪-২০২৫", event: "যুগ্ম আহ্বায়ক", details: "বিএনপি ঢাকা মহানগর উত্তর (বর্তমান)" }
  ];

  const personalData = [
    { icon: "👤", label: "পূর্ণ নাম", value: "এস এম জাহাঙ্গীর হোসেন" },
    { icon: "👨", label: "পিতার নাম", value: "মৃত এ কে এম নুরুজ্জামান" },
    { icon: "👩", label: "মাতার নাম", value: "মৃত খায়রুন নেসা" },
    { icon: "🎂", label: "জন্ম তারিখ", value: "০১ জানুয়ারি, ১৯৭৩" },
    { icon: "📱", label: "মোবাইল", value: "০১৭১১-৫৬৩৬৩৬" },
    { icon: "🏠", label: "স্থায়ী ঠিকানা", value: "উত্তর চরকুমারিয়া, সখীপুর, শরীয়তপুর" },
    { icon: "🏢", label: "বর্তমান ঠিকানা", value: "বাড়ি-৭২, রোড-৬, সেক্টর-৯, উত্তরা, ঢাকা" }
  ];

  const educationData = [
    { level: "S.S.C", degree: "মাধ্যমিক স্কুল সার্টিফিকেট", institution: "বিজি প্রেস স্কুল", year: "১৯৮৭" },
    { level: "H.S.C", degree: "উচ্চ মাধ্যমিক স্কুল সার্টিফিকেট", institution: "তেজগাঁও কলেজ", year: "১৯৮৯" },
    { level: "B.A", degree: "স্নাতক", institution: "তেজগাঁও কলেজ", year: "১৯৯১" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="/events/event1.jpg"
            alt="Background"
            fill
            className="object-cover opacity-20"
            unoptimized={true}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-primaryRed/10 rounded-full blur-xl animate-float"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-blue-500/10 rounded-full blur-lg animate-float-delayed"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl animate-float-slow"></div>
        </div>

        <div className="relative z-30 max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              {/* Badge */}
              <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8">
                <div className="w-2 h-2 bg-primaryRed rounded-full mr-3 animate-pulse"></div>
                <span className="text-white/90 text-sm font-medium">রাজনৈতিক নেতা ও সমাজসেবক</span>
              </div>

              {/* Name */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight text-white">
                <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                  এস এম জাহাঙ্গীর </span>
                <span className="bg-gradient-to-r from-primaryRed via-red-400 to-primaryRed bg-clip-text text-transparent">
                  হোসেন
                </span>
              </h1>

              {/* Position */}
              <div className="mb-8">
                <p className="text-xl md:text-2xl text-gray-300 font-light mb-2">যুগ্ম আহ্বায়ক</p>
                <p className="text-primaryRed/80 font-medium">বিএনপি ঢাকা মহানগর উত্তর</p>
              </div>

              {/* Description */}
              <p className="text-lg text-gray-400 leading-relaxed mb-12 max-w-2xl mx-auto lg:mx-0">
                ৩৫ বছরের রাজনৈতিক অভিজ্ঞতায় সমৃদ্ধ একজন নিবেদিতপ্রাণ নেতা। 
                ছাত্র রাজনীতি থেকে জাতীয় পর্যায় পর্যন্ত দীর্ঘ সফল যাত্রা।
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => scrollToSection('personal-info')}
                  className="group relative px-8 py-4 bg-primaryRed hover:bg-red-600 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-white"
                >
                  <span className="relative z-10">বিস্তারিত দেখুন</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </button>
                <a 
                  href="tel:01711563636"
                  className="group px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-xl font-semibold transition-all duration-300 text-white"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    যোগাযোগ
                  </span>
                </a>
              </div>
            </div>

            {/* Right Image */}
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className="relative group">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 p-6">
                  <div className="relative rounded-2xl overflow-hidden">
                    <Image
                      src="/events/event2.jpg"
                      alt="এস এম জাহাঙ্গীর হোসেন"
                      width={500}
                      height={600}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized={true}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -bottom-8 -left-8 bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-4 shadow-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primaryRed">৩৫+</div>
                    <div className="text-xs text-gray-200">বছরের অভিজ্ঞতা</div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-primaryRed rounded-full p-4 shadow-xl border-2 border-white">
                  <div className="text-center text-white">
                    <div className="text-lg font-bold">২০২৫</div>
                    <div className="text-xs opacity-95">বর্তমান</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`group relative bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-500 transform hover:scale-105 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className={`text-3xl font-black mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personal Information & Timeline Section */}
      <section id="personal-info" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Personal Information */}
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
              <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                ব্যক্তিগত তথ্য
              </h2>
              <div className="space-y-4">
                {personalData.map((item, index) => (
                  <div 
                    key={index} 
                    className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center">
                      <div className="text-2xl mr-4 group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-500 text-sm">{item.label}</div>
                        <div className="text-gray-800 font-medium">{item.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Education Section */}
              <h3 className="text-2xl font-bold mt-12 mb-6 text-gray-800">শিক্ষাগত যোগ্যতা</h3>
              <div className="space-y-4">
                {educationData.map((edu, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-800">{edu.degree} ({edu.year})</div>
                        <div className="text-gray-600 text-sm">{edu.institution}</div>
                      </div>
                      <span className="px-3 py-1 bg-primaryRed/10 text-primaryRed text-xs font-bold rounded-full">
                        {edu.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Political Journey Timeline */}
            <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primaryRed to-red-400 bg-clip-text text-transparent">
                রাজনৈতিক যাত্রা
              </h2>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primaryRed/20 via-primaryRed to-primaryRed/20"></div>
                
                <div className="space-y-8">
                  {timeline.map((item, index) => (
                    <div 
                      key={index} 
                      className="relative flex items-start group"
                    >
                      <div className="absolute left-6 w-3 h-3 bg-primaryRed rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 group-hover:scale-150 transition-transform duration-300"></div>
                      <div className="ml-12 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-3 py-1 bg-primaryRed/10 text-primaryRed text-xs font-bold rounded-full border border-primaryRed/20">
                            {item.year}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">{item.event}</h4>
                        <p className="text-gray-600 text-sm">{item.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 md:px-16 text-center">
          <div className={`bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-3xl p-12 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <svg className="w-12 h-12 text-primaryRed/50 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
            </svg>
            <blockquote className="text-2xl md:text-3xl font-light text-gray-800 mb-6 italic leading-relaxed">
              &quot;রাজনীতি হলো জনসেবার একটি মাধ্যম। আমি সর্বদা মানুষের কল্যাণে কাজ করে যেতে প্রতিশ্রুতিবদ্ধ।&quot;
            </blockquote>
            <cite className="text-primaryRed font-semibold text-lg">— এস এম জাহাঙ্গীর হোসেন</cite>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 md:px-16 text-center">
          <div className={`transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h3 className="text-3xl font-bold text-white mb-4">যোগাযোগ করুন</h3>
            <p className="text-gray-300 mb-8 text-lg">
              আপনার মতামত ও পরামর্শের জন্য সরাসরি যোগাযোগ করুন
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="tel:01711563636"
                className="group px-8 py-4 bg-primaryRed hover:bg-red-600 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl text-white"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  ফোন করুন
                </span>
              </a>
              <Link
                href="/"
                className="group px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-xl font-semibold transition-all duration-300 text-white"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  হোম পেজ
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AboutContent;