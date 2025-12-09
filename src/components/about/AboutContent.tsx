"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";
import { useTheme } from "@/providers/ThemeProvider";

const AboutContent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();
  const { isDark } = useTheme();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dynamic stats from translations
  const statsColors = ["from-blue-500 to-blue-600", "from-red-500 to-red-600", "from-purple-500 to-purple-600", "from-green-500 to-green-600"];
  const stats = t.aboutPage?.stats?.map((stat: { number: string; label: string }, index: number) => ({
    number: stat.number,
    label: stat.label,
    color: statsColors[index] || "from-gray-500 to-gray-600"
  })) || [];

  // Dynamic timeline from translations
  const timeline = t.aboutPage?.politicalJourney?.timeline || [];

  // Dynamic personal data from translations with icons
  const icons = ["👤", "👨", "👩", "🎂", "📍", "📱", "🏠"];
  const personalData = t.aboutPage?.personalInfo?.data?.map((item: { label: string; value: string }, index: number) => ({
    icon: icons[index] || "📋",
    label: item.label,
    value: item.value
  })) || [];

  // Dynamic education data from translations
  const educationData = t.aboutPage?.education?.data || [];

  // Vision areas from translations
  const visionAreas = t.aboutPage?.vision?.areas || [];

  // Achievements from translations
  const achievements = t.aboutPage?.achievements?.items || [];

  // Struggle sections
  const struggleSections = [
    { key: 'cases', icon: '⚖️' },
    { key: 'imprisonment', icon: '🔒' },
    { key: 'persecution', icon: '💪' },
    { key: 'resilience', icon: '🌟' }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" : "bg-gradient-to-br from-slate-50 via-white to-gray-50"
    }`}>
      {/* Hero Section */}
      <section className={`relative min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" : "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
      }`}>
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
          <div className={`absolute top-20 left-20 w-32 h-32 rounded-full blur-xl animate-float ${
            isDark ? "bg-red-500/20" : "bg-primaryRed/10"
          }`}></div>
          <div className={`absolute top-40 right-32 w-24 h-24 rounded-full blur-lg animate-float-delayed ${
            isDark ? "bg-green-400/20" : "bg-green-500/10"
          }`}></div>
          <div className={`absolute bottom-32 left-32 w-40 h-40 rounded-full blur-2xl animate-float-slow ${
            isDark ? "bg-purple-400/20" : "bg-purple-500/10"
          }`}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              {/* Election 2026 Badge */}
              <div className={`inline-flex items-center px-6 py-3 backdrop-blur-md border rounded-full mb-4 ${
                isDark ? "bg-red-600/30 border-red-500/50" : "bg-red-600/20 border-red-500/30"
              }`}>
                <div className={`w-2 h-2 rounded-full mr-3 animate-pulse bg-red-500`}></div>
                <span className="text-white text-sm font-bold">
                  {t.aboutPage?.electionBanner?.subtitle || "National Election 2026"}
                </span>
              </div>

              {/* Badge */}
              <div className={`inline-flex items-center px-6 py-3 backdrop-blur-md border rounded-full mb-8 ml-0 lg:ml-4 ${
                isDark ? "bg-gray-800/50 border-gray-600/50" : "bg-white/10 border-white/20"
              }`}>
                <div className={`w-2 h-2 rounded-full mr-3 animate-pulse ${
                  isDark ? "bg-green-400" : "bg-green-500"
                }`}></div>
                <span className="text-white/90 text-sm font-medium">
                  {t.aboutPage?.hero?.badge || "BNP Nominated MP Candidate | Dhaka-18"}
                </span>
              </div>

              {/* Name */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight text-white">
                <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                  {t.aboutPage?.hero?.name || "S M Jahangir"}{" "}
                </span>
                <span className={`bg-gradient-to-r bg-clip-text text-transparent ${
                  isDark ? "from-red-400 via-red-300 to-red-400" : "from-primaryRed via-red-400 to-primaryRed"
                }`}>
                  {t.aboutPage?.hero?.lastName || "Hossain"}
                </span>
              </h1>

              {/* Position */}
              <div className="mb-8">
                <p className="text-xl md:text-2xl text-gray-300 font-light mb-2">
                  {t.aboutPage?.hero?.position || "Joint Convener"}
                </p>
                <p className={`font-medium ${
                  isDark ? "text-red-400/80" : "text-primaryRed/80"
                }`}>
                  {t.aboutPage?.hero?.organization || "BNP Dhaka Metropolitan North"}
                </p>
              </div>

              {/* Description */}
              <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">
                {t.aboutPage?.hero?.description || "Nominated by Bangladesh Nationalist Party for the 2026 National Election from Dhaka-18 constituency."}
              </p>

              {/* Constituency Areas */}
              <div className={`mb-8 p-4 rounded-xl backdrop-blur-md ${
                isDark ? "bg-gray-800/30 border border-gray-700/50" : "bg-white/5 border border-white/10"
              }`}>
                <p className="text-sm text-gray-400 mb-2">{t.aboutPage?.electionBanner?.constituency || "Dhaka-18 Constituency"}</p>
                <p className="text-white font-medium">
                  {t.aboutPage?.electionBanner?.areas || "Uttara, Uttarkhan, Dakshinkhan, Turag, Khilkhet, Airport, Vatara (Partial)"}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => scrollToSection('biography-section')}
                  className={`group relative px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-white ${
                    isDark ? "bg-red-600 hover:bg-red-700" : "bg-primaryRed hover:bg-red-600"
                  }`}
                >
                  <span className="relative z-10">
                    {t.aboutPage?.hero?.detailsButton || "View Details"}
                  </span>
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl ${
                    isDark ? "bg-gradient-to-r from-red-700 to-red-600" : "bg-gradient-to-r from-red-600 to-red-500"
                  }`}></div>
                </button>
                <Link
                  href="/volunteer-hub"
                  className={`group px-8 py-4 backdrop-blur-md border rounded-xl font-semibold transition-all duration-300 text-white text-center ${
                    isDark ? "bg-green-600/30 hover:bg-green-600/50 border-green-500/50 hover:border-green-400/60" : "bg-green-500/20 hover:bg-green-500/30 border-green-500/30 hover:border-green-500/50"
                  }`}
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-2">🤝</span>
                    {t.aboutPage?.contact?.volunteerButton || "Become a Volunteer"}
                  </span>
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className="relative group">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 p-6">
                  <div className="relative rounded-2xl overflow-hidden">
                    <Image
                      src="/events/event2.jpg"
                      alt="S M Jahangir Hossain"
                      width={500}
                      height={600}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized={true}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className={`absolute -bottom-8 -left-8 backdrop-blur-md border rounded-2xl p-4 shadow-xl ${
                  isDark ? "bg-gray-800/90 border-gray-600/50" : "bg-gray-900/90 border-gray-700/50"
                }`}>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      isDark ? "text-red-400" : "text-primaryRed"
                    }`}>
                      {t.aboutPage?.hero?.experienceYears || "35+"}
                    </div>
                    <div className="text-xs text-gray-200">
                      {t.aboutPage?.hero?.experienceLabel || "Years of Experience"}
                    </div>
                  </div>
                </div>

                <div className={`absolute -top-4 -right-4 rounded-full p-4 shadow-xl border-2 border-white ${
                  isDark ? "bg-red-600" : "bg-primaryRed"
                }`}>
                  <div className="text-center text-white">
                    <div className="text-lg font-bold">
                      {t.aboutPage?.hero?.currentYear || "2026"}
                    </div>
                    <div className="text-xs opacity-95">
                      {t.aboutPage?.hero?.currentLabel || "MP Candidate"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-20 transition-colors duration-300 ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat: { number: string; label: string; color: string }, index: number) => (
              <div
                key={index}
                className={`group relative border rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-500 transform hover:scale-105 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } ${
                  isDark
                    ? "bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 hover:shadow-gray-900/50"
                    : "bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:shadow-gray-500/30"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className={`text-3xl font-black mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.number}
                </div>
                <div className={`text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                  {stat.label}
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Biography Section */}
      <section id="biography-section" className={`py-20 transition-colors duration-300 ${
        isDark ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-gray-50 to-white"
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              {t.aboutPage?.biography?.title || "Biography & Life Story"}
            </h2>
            <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {t.aboutPage?.biography?.subtitle || "A Journey of Dedication, Sacrifice, and Service"}
            </p>
            <div className={`w-24 h-1 mx-auto mt-6 rounded-full ${
              isDark ? "bg-red-500" : "bg-primaryRed"
            }`}></div>
          </div>

          {/* Biography Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {['earlyLife', 'education', 'politicalAwakening'].map((key, index) => (
              <div
                key={key}
                className={`rounded-2xl p-8 transition-all duration-500 hover:shadow-xl ${
                  isDark
                    ? "bg-gray-800 border border-gray-700 hover:border-red-500/30"
                    : "bg-white border border-gray-200 hover:border-primaryRed/30"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <h3 className={`text-xl font-bold mb-4 ${
                  isDark ? "text-red-400" : "text-primaryRed"
                }`}>
                  {t.aboutPage?.biography?.[key]?.title || key}
                </h3>
                <p className={`leading-relaxed ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                  {t.aboutPage?.biography?.[key]?.content || ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Struggle & Sacrifice Section */}
      <section className={`py-20 transition-colors duration-300 ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              {t.aboutPage?.struggle?.title || "Struggle & Sacrifice"}
            </h2>
            <p className={`text-lg max-w-3xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {t.aboutPage?.struggle?.subtitle || "Standing Firm Against All Odds"}
            </p>
            <div className={`w-24 h-1 mx-auto mt-6 rounded-full ${
              isDark ? "bg-red-500" : "bg-primaryRed"
            }`}></div>
          </div>

          {/* Intro */}
          <p className={`text-center text-lg mb-12 max-w-4xl mx-auto ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}>
            {t.aboutPage?.struggle?.intro || ""}
          </p>

          {/* Struggle Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {struggleSections.map((section, index) => (
              <div
                key={section.key}
                className={`rounded-2xl p-8 transition-all duration-500 hover:shadow-xl ${
                  isDark
                    ? "bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 hover:border-red-500/30"
                    : "bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-primaryRed/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{section.icon}</span>
                  <div>
                    <h3 className={`text-xl font-bold mb-3 ${
                      isDark ? "text-red-400" : "text-primaryRed"
                    }`}>
                      {t.aboutPage?.struggle?.[section.key]?.title || section.key}
                    </h3>
                    <p className={`leading-relaxed ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}>
                      {t.aboutPage?.struggle?.[section.key]?.content || ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision for Dhaka-18 Section */}
      <section className={`py-20 transition-colors duration-300 ${
        isDark ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-red-50 to-white"
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              {t.aboutPage?.vision?.title || "Vision for Dhaka-18"}
            </h2>
            <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {t.aboutPage?.vision?.subtitle || "A Promise for a Better Tomorrow"}
            </p>
            <div className={`w-24 h-1 mx-auto mt-6 rounded-full ${
              isDark ? "bg-red-500" : "bg-primaryRed"
            }`}></div>
          </div>

          {/* Intro */}
          <p className={`text-center text-lg mb-12 max-w-4xl mx-auto ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}>
            {t.aboutPage?.vision?.intro || ""}
          </p>

          {/* Vision Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visionAreas.map((area: { icon: string; title: string; description: string }, index: number) => (
              <div
                key={index}
                className={`rounded-2xl p-6 transition-all duration-500 hover:shadow-xl transform hover:scale-105 ${
                  isDark
                    ? "bg-gray-800 border border-gray-700 hover:border-green-500/30"
                    : "bg-white border border-gray-200 hover:border-green-500/30"
                }`}
              >
                <span className="text-4xl mb-4 block">{area.icon}</span>
                <h3 className={`text-lg font-bold mb-2 ${
                  isDark ? "text-green-400" : "text-green-600"
                }`}>
                  {area.title}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className={`py-20 transition-colors duration-300 ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              {t.aboutPage?.achievements?.title || "Achievements & Contributions"}
            </h2>
            <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {t.aboutPage?.achievements?.subtitle || "A Record of Service and Leadership"}
            </p>
            <div className={`w-24 h-1 mx-auto mt-6 rounded-full ${
              isDark ? "bg-red-500" : "bg-primaryRed"
            }`}></div>
          </div>

          {/* Achievement Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement: { title: string; description: string }, index: number) => (
              <div
                key={index}
                className={`rounded-2xl p-6 transition-all duration-500 hover:shadow-xl ${
                  isDark
                    ? "bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600"
                    : "bg-gradient-to-br from-gray-50 to-white border border-gray-200"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${
                  isDark ? "bg-red-600/20 text-red-400" : "bg-primaryRed/10 text-primaryRed"
                }`}>
                  <span className="font-bold">{index + 1}</span>
                </div>
                <h3 className={`text-lg font-bold mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  {achievement.title}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personal Information & Timeline Section */}
      <section id="personal-info" className={`py-20 transition-colors duration-300 ${
        isDark ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-gray-50 to-white"
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Personal Information */}
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
              <h2 className={`text-3xl font-bold mb-8 bg-gradient-to-r bg-clip-text text-transparent ${
                isDark ? "from-gray-200 to-gray-400" : "from-gray-800 to-gray-600"
              }`}>
                {t.aboutPage?.personalInfo?.title || "Personal Information"}
              </h2>
              <div className="space-y-4">
                {personalData.map((item: { icon: string; label: string; value: string }, index: number) => (
                  <div
                    key={index}
                    className={`group border rounded-xl p-4 hover:shadow-md transition-all duration-300 ${
                      isDark
                        ? "bg-gray-800 border-gray-600 hover:shadow-gray-900/50"
                        : "bg-white border-gray-200 hover:shadow-gray-500/30"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="text-2xl mr-4 group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}>
                          {item.label}
                        </div>
                        <div className={`font-medium ${
                          isDark ? "text-gray-200" : "text-gray-800"
                        }`}>
                          {item.value}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Education Section */}
              <h3 className={`text-2xl font-bold mt-12 mb-6 ${
                isDark ? "text-gray-200" : "text-gray-800"
              }`}>
                {t.aboutPage?.education?.title || "Educational Qualifications"}
              </h3>
              <div className="space-y-4">
                {educationData.map((edu: { level: string; degree: string; institution: string; year: string }, index: number) => (
                  <div key={index} className={`border rounded-xl p-4 hover:shadow-md transition-all duration-300 ${
                    isDark
                      ? "bg-gray-800 border-gray-600 hover:shadow-gray-900/50"
                      : "bg-white border-gray-200 hover:shadow-gray-500/30"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-semibold ${
                          isDark ? "text-gray-200" : "text-gray-800"
                        }`}>
                          {edu.degree} ({edu.year})
                        </div>
                        <div className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {edu.institution}
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        isDark
                          ? "bg-red-600/20 text-red-400"
                          : "bg-primaryRed/10 text-primaryRed"
                      }`}>
                        {edu.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Family Life */}
              <div className={`mt-12 rounded-2xl p-6 ${
                isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
              }`}>
                <h3 className={`text-xl font-bold mb-4 ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}>
                  {t.aboutPage?.familyLife?.title || "Family & Personal Life"}
                </h3>
                <p className={`leading-relaxed ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                  {t.aboutPage?.familyLife?.content || ""}
                </p>
              </div>
            </div>

            {/* Political Journey Timeline */}
            <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <h2 className={`text-3xl font-bold mb-8 bg-gradient-to-r bg-clip-text text-transparent ${
                isDark ? "from-red-400 to-red-300" : "from-primaryRed to-red-400"
              }`}>
                {t.aboutPage?.politicalJourney?.title || "Political Journey"}
              </h2>
              <div className="relative">
                <div className={`absolute left-6 top-0 bottom-0 w-px ${
                  isDark
                    ? "bg-gradient-to-b from-red-600/20 via-red-500 to-red-600/20"
                    : "bg-gradient-to-b from-primaryRed/20 via-primaryRed to-primaryRed/20"
                }`}></div>

                <div className="space-y-8">
                  {timeline.map((item: { year: string; event: string; details: string }, index: number) => (
                    <div
                      key={index}
                      className="relative flex items-start group"
                    >
                      <div className={`absolute left-6 w-3 h-3 rounded-full border-2 shadow-lg transform -translate-x-1/2 group-hover:scale-150 transition-transform duration-300 ${
                        isDark
                          ? "bg-red-600 border-gray-700"
                          : "bg-primaryRed border-white"
                      }`}></div>
                      <div className={`ml-12 border rounded-xl p-4 hover:shadow-md transition-all duration-300 flex-1 ${
                        isDark
                          ? "bg-gray-800 border-gray-600 hover:shadow-gray-900/50"
                          : "bg-white border-gray-200 hover:shadow-gray-500/30"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                            isDark
                              ? "bg-red-600/20 text-red-400 border-red-500/20"
                              : "bg-primaryRed/10 text-primaryRed border-primaryRed/20"
                          }`}>
                            {item.year}
                          </span>
                        </div>
                        <h4 className={`font-semibold mb-1 ${
                          isDark ? "text-gray-200" : "text-gray-800"
                        }`}>
                          {item.event}
                        </h4>
                        <p className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {item.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Message to People Section */}
      <section className={`py-20 transition-colors duration-300 ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}>
        <div className="max-w-4xl mx-auto px-6 md:px-16">
          <div className={`rounded-3xl p-8 md:p-12 ${
            isDark
              ? "bg-gradient-to-br from-red-900/30 to-gray-800 border border-red-500/20"
              : "bg-gradient-to-br from-red-50 to-white border border-red-200"
          }`}>
            <h3 className={`text-2xl md:text-3xl font-bold mb-6 text-center ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              {t.aboutPage?.message?.title || "Message to the People of Dhaka-18"}
            </h3>
            <p className={`text-lg leading-relaxed text-center ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}>
              {t.aboutPage?.message?.content || ""}
            </p>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className={`py-20 transition-colors duration-300 ${
        isDark ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-gray-50 to-white"
      }`}>
        <div className="max-w-4xl mx-auto px-6 md:px-16 text-center">
          <div className={`border rounded-3xl p-12 transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          } ${
            isDark
              ? "bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600"
              : "bg-gradient-to-br from-gray-50 to-white border-gray-200"
          }`}>
            <svg className={`w-12 h-12 mx-auto mb-6 ${
              isDark ? "text-red-400/50" : "text-primaryRed/50"
            }`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
            </svg>
            <blockquote className={`text-xl md:text-2xl font-light mb-6 italic leading-relaxed ${
              isDark ? "text-gray-200" : "text-gray-800"
            }`}>
              &quot;{t.aboutPage?.quote?.text || "My fight has never been for personal gain..."}&quot;
            </blockquote>
            <cite className={`font-semibold text-lg ${
              isDark ? "text-red-400" : "text-primaryRed"
            }`}>
              {t.aboutPage?.quote?.author || "— S M Jahangir Hossain"}
            </cite>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={`py-20 transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gray-900"
      }`}>
        <div className="max-w-4xl mx-auto px-6 md:px-16 text-center">
          <div className={`transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h3 className="text-3xl font-bold text-white mb-4">
              {t.aboutPage?.contact?.title || "Connect with S M Jahangir Hossain"}
            </h3>
            <p className="text-gray-300 mb-8 text-lg">
              {t.aboutPage?.contact?.subtitle || "Your voice matters. Reach out for support, suggestions, or to join the movement."}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="tel:01711563636"
                className={`group px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl text-white ${
                  isDark ? "bg-red-600 hover:bg-red-700" : "bg-primaryRed hover:bg-red-600"
                }`}
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {t.aboutPage?.contact?.callButton || "Call Now"}
                </span>
              </a>
              <Link
                href="/volunteer-hub"
                className={`group px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl text-white ${
                  isDark ? "bg-green-600 hover:bg-green-700" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <span className="flex items-center justify-center">
                  <span className="mr-2">🤝</span>
                  {t.aboutPage?.contact?.volunteerButton || "Become a Volunteer"}
                </span>
              </Link>
              <Link
                href="/"
                className={`group px-8 py-4 backdrop-blur-md border rounded-xl font-semibold transition-all duration-300 text-white ${
                  isDark ? "bg-gray-800/50 hover:bg-gray-700/60 border-gray-600/50 hover:border-gray-500/60" : "bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/40"
                }`}
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {t.aboutPage?.contact?.homeButton || "Home Page"}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer before footer */}
      <div className={`h-20 transition-colors duration-300 ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}></div>

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
