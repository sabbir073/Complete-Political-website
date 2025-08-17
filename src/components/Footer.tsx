"use client";

import Image from 'next/image';
import Link from 'next/link';
import {
  FaYoutube,
  FaFacebookF,
  FaXTwitter,
  FaInstagram,
  FaTelegram,
  FaTiktok,
} from 'react-icons/fa6';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';

export default function BNPFooter() {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  return (
    <>
      {/* Split Background Section: White/Gray top half, Green/Dark bottom half */}
      <div className="relative">
        <div className={`h-32 md:h-40 transition-colors duration-300 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}></div>
        <div className={`h-32 md:h-40 transition-colors duration-300 ${
          isDark ? "bg-gray-900" : "bg-[#003B2F]"
        }`}></div>

        {/* CTA Box */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-screen-xl px-6">
          <div className={`bg-[url('/footerbg.png')] bg-cover bg-center rounded-3xl px-6 py-12 text-center transition-all duration-300 ${
            isDark ? "shadow-2xl shadow-gray-900/70" : "shadow-lg shadow-gray-500/30"
          }`}>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-white drop-shadow">
              {t.footer?.cta?.title || "Join the Nationalists"}
            </h2>
            <p className="text-lg md:text-xl mb-6 text-white drop-shadow">
              {t.footer?.cta?.subtitle || "Join the Fight for Democracy & Voting Rights"}
            </p>
            <Link
              href="/join"
              className={`inline-block font-semibold px-6 py-3 rounded-md transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? "bg-gray-100 text-gray-900 hover:bg-white" 
                  : "bg-white text-[#003B2F] hover:bg-gray-200"
              }`}
            >
              {t.footer?.cta?.joinButton || "Join Now"}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <footer className={`transition-colors duration-300 ${
        isDark ? "bg-gray-900 text-gray-200" : "bg-[#003B2F] text-white"
      }`}>
        <div className="w-full px-6 max-w-screen-xl mx-auto py-10 md:py-5 grid grid-cols-2 grid-rows-3 gap-x-8 md:grid-cols-3 lg:grid-cols-5 lg:grid-rows-1">

          {/* Column 1: Logo + Socials */}
          <div className="flex flex-col items-start">
            <Image src="/logo.png" alt="BNP Flag" width={64} height={48} />
            <p className="mt-4 mb-2 font-semibold">
              {t.footer?.followUs || "Follow us"}
            </p>
            <div className={`flex space-x-2 text-xl ${
              isDark ? "text-gray-300" : "text-white"
            }`}>
              <Link href="#" aria-label="YouTube" className={`transition-colors duration-300 ${
                isDark ? "hover:text-red-400" : "hover:text-red-300"
              }`}><FaYoutube /></Link>
              <Link href="#" aria-label="Facebook" className={`transition-colors duration-300 ${
                isDark ? "hover:text-blue-400" : "hover:text-blue-300"
              }`}><FaFacebookF /></Link>
              <Link href="#" aria-label="X" className={`transition-colors duration-300 ${
                isDark ? "hover:text-gray-400" : "hover:text-gray-300"
              }`}><FaXTwitter /></Link>
              <Link href="#" aria-label="Instagram" className={`transition-colors duration-300 ${
                isDark ? "hover:text-pink-400" : "hover:text-pink-300"
              }`}><FaInstagram /></Link>
              <Link href="#" aria-label="Telegram" className={`transition-colors duration-300 ${
                isDark ? "hover:text-blue-400" : "hover:text-blue-300"
              }`}><FaTelegram /></Link>
              <Link href="#" aria-label="TikTok" className={`transition-colors duration-300 ${
                isDark ? "hover:text-gray-400" : "hover:text-gray-300"
              }`}><FaTiktok /></Link>
            </div>
          </div>

          {/* Column 2: About Us */}
          <div>
            <h4 className="font-bold mb-2">
              {t.footer?.sections?.aboutUs?.title || "About Us"}
            </h4>
            <ul className="space-y-1">
              <li><Link href="/leaders" className={`transition-colors duration-300 ${
                isDark ? "hover:text-red-400" : "hover:text-green-300"
              }`}>
                {t.footer?.sections?.aboutUs?.links?.ourLeaders || "Our Leaders"}
              </Link></li>
              <li><Link href="/constitution" className={`transition-colors duration-300 ${
                isDark ? "hover:text-red-400" : "hover:text-green-300"
              }`}>
                {t.footer?.sections?.aboutUs?.links?.constitution || "Constitution"}
              </Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="font-bold mb-2">
              {t.footer?.sections?.resources?.title || "Resources"}
            </h4>
            <ul className="space-y-1">
              <li><Link href="/vision-2030" className={`transition-colors duration-300 ${
                isDark ? "hover:text-red-400" : "hover:text-green-300"
              }`}>
                {t.footer?.sections?.resources?.links?.vision2030 || "Vision 2030"}
              </Link></li>
              <li><Link href="/19-points" className={`transition-colors duration-300 ${
                isDark ? "hover:text-red-400" : "hover:text-green-300"
              }`}>
                {t.footer?.sections?.resources?.links?.["19points"] || "19 Points"}
              </Link></li>
            </ul>
          </div>

          {/* Column 4: Updates */}
          <div>
            <h4 className="font-bold mb-2">
              {t.footer?.sections?.updates?.title || "Updates"}
            </h4>
            <ul className="space-y-1">
              <li><Link href="/press-releases" className={`transition-colors duration-300 ${
                isDark ? "hover:text-red-400" : "hover:text-green-300"
              }`}>
                {t.footer?.sections?.updates?.links?.pressReleases || "Press Releases"}
              </Link></li>
              <li><Link href="/announcements" className={`transition-colors duration-300 ${
                isDark ? "hover:text-red-400" : "hover:text-green-300"
              }`}>
                {t.footer?.sections?.updates?.links?.announcements || "Announcements"}
              </Link></li>
            </ul>
          </div>

          {/* Column 5: Join Us Buttons */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-bold mb-2">
              {t.footer?.sections?.joinUs?.title || "Join Us"}
            </h4>
            <div className="flex flex-col space-y-2">
              <Link href="/membership" className={`px-4 py-2 rounded-md text-center font-semibold transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}>
                {t.footer?.sections?.joinUs?.buttons?.membership || "Membership Free"}
              </Link>
              <Link href="/general-membership" className={`px-4 py-2 rounded-md text-center font-semibold transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}>
                {t.footer?.sections?.joinUs?.buttons?.generalMembership || "General Membership Free"}
              </Link>
              <Link href="/donate" className={`px-4 py-2 rounded-md text-center font-semibold transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}>
                {t.footer?.sections?.joinUs?.buttons?.donate || "Donate"}
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={`py-4 px-6 text-sm text-center transition-colors duration-300 ${
          isDark 
            ? "border-t border-gray-700 text-gray-400" 
            : "border-t border-green-800 text-gray-300"
        }`}>
          <p>{t.footer?.copyright || "© 2023 to 2025 Bangladesh Nationalist Party - BNP"}</p>
          <p>{t.footer?.developer || "Develop And Maintained By Md Sabbir Ahmed"}</p>
        </div>
      </footer>
    </>
  );
}
