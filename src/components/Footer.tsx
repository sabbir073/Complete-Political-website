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
  FaLinkedinIn,
  FaWhatsapp,
  FaDiscord,
} from 'react-icons/fa6';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useFooterSettings } from '@/hooks/useFooterSettings';
import { useState, useEffect } from 'react';

export default function BNPFooter() {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { settings: footerSettings, loading: footerLoading, getText, getMenuItemsByColumn } = useFooterSettings();
  const [logoAltText, setLogoAltText] = useState('');

  // Fetch alt text from media library
  useEffect(() => {
    const fetchLogoAltText = async () => {
      if (!footerSettings?.footer_logo_src) return;
      
      try {
        const response = await fetch(`/api/media/alt-text?url=${encodeURIComponent(footerSettings.footer_logo_src)}`);
        const data = await response.json();
        
        if (data.success && data.alt_text) {
          setLogoAltText(data.alt_text);
        } else {
          setLogoAltText('Footer Logo');
        }
      } catch (error) {
        console.error('Error fetching logo alt text:', error);
        setLogoAltText('Footer Logo');
      }
    };

    fetchLogoAltText();
  }, [footerSettings?.footer_logo_src]);

  // CTA Component - Only check footer_cta_show (cta setting)
  const showCTA = footerSettings?.footer_cta_show;
  
  const CTASection = () => (
    showCTA ? (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-screen-xl px-6">
        <div 
          className={`bg-cover bg-center rounded-3xl px-6 py-12 text-center transition-all duration-300 ${
            isDark ? "shadow-2xl shadow-gray-900/70" : "shadow-lg shadow-gray-500/30"
          }`}
          style={{
            backgroundImage: `url('${footerSettings.footer_cta_bg_image}')`
          }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-white drop-shadow">
            {footerSettings ? getText(footerSettings.footer_cta_title) : t.footer?.cta?.title || "Join the Nationalists"}
          </h2>
          <p className="text-lg md:text-xl mb-6 text-white drop-shadow">
            {footerSettings ? getText(footerSettings.footer_cta_subtitle) : t.footer?.cta?.subtitle || "Join the Fight for Democracy & Voting Rights"}
          </p>
          <Link
            href={footerSettings?.footer_cta_button_url || "https://www.bnpbd.org/login/primary-member-fee"}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-block font-semibold px-6 py-3 rounded-md transition-all duration-300 hover:scale-105 ${
              isDark
                ? "bg-gray-100 text-gray-900 hover:bg-white"
                : "bg-white text-[#003B2F] hover:bg-gray-200"
            }`}
          >
            {footerSettings ? getText(footerSettings.footer_cta_button_text) : t.footer?.cta?.joinButton || "Join Now"}
          </Link>
        </div>
      </div>
    ) : null
  );

  return (
    <>
      {/* CTA at Top */}
      {showCTA && footerSettings?.footer_cta_position === 'top' && (
        <div className="relative">
          <div className={`h-32 md:h-40 transition-colors duration-300 ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}></div>
          <div 
            className="h-32 md:h-40 transition-colors duration-300"
            style={{
              backgroundColor: isDark ? '#111827' : (footerSettings?.footer_bg_color || '#003B2F')
            }}
          ></div>
          <CTASection />
        </div>
      )}

      {/* Main Footer */}
      <footer
        className="transition-colors duration-300"
        style={{
          backgroundColor: isDark ? '#111827' : (footerSettings?.footer_bg_color || '#003B2F'),
          color: isDark ? '#E5E7EB' : (footerSettings?.footer_text_color || '#FFFFFF')
        }}
      >
        <div className="w-full px-4 sm:px-6 max-w-screen-xl mx-auto py-8 sm:py-10 md:py-8">
          {/* Mobile: Logo & Social centered at top */}
          <div className="md:hidden mb-8 text-center">
            {footerSettings?.footer_logo_show && (
              <div className="flex justify-center mb-4">
                <Image
                  src={footerSettings?.footer_logo_src || "/logo.png"}
                  alt={logoAltText || "Footer Logo"}
                  width={footerSettings?.footer_logo_width || 64}
                  height={footerSettings?.footer_logo_height || 48}
                />
              </div>
            )}
            {footerSettings?.footer_social_show && (
              <>
                <p className="mb-3 font-semibold text-sm">
                  {footerSettings ? getText(footerSettings.footer_social_title) : t.footer?.followUs || "Follow us"}
                </p>
                <div className={`flex justify-center space-x-4 text-xl ${
                  isDark ? "text-gray-300" : "text-white"
                }`}>
                  {footerSettings?.footer_social_youtube_url && (
                    <Link href={footerSettings.footer_social_youtube_url} aria-label="YouTube" className={`transition-colors duration-300 ${
                      isDark ? "hover:text-red-400" : "hover:text-red-300"
                    }`}><FaYoutube /></Link>
                  )}
                  {footerSettings?.footer_social_facebook_url && (
                    <Link href={footerSettings.footer_social_facebook_url} aria-label="Facebook" className={`transition-colors duration-300 ${
                      isDark ? "hover:text-blue-400" : "hover:text-blue-300"
                    }`}><FaFacebookF /></Link>
                  )}
                  {footerSettings?.footer_social_twitter_url && (
                    <Link href={footerSettings.footer_social_twitter_url} aria-label="X" className={`transition-colors duration-300 ${
                      isDark ? "hover:text-gray-400" : "hover:text-gray-300"
                    }`}><FaXTwitter /></Link>
                  )}
                  {footerSettings?.footer_social_instagram_url && (
                    <Link href={footerSettings.footer_social_instagram_url} aria-label="Instagram" className={`transition-colors duration-300 ${
                      isDark ? "hover:text-pink-400" : "hover:text-pink-300"
                    }`}><FaInstagram /></Link>
                  )}
                  {footerSettings?.footer_social_telegram_url && (
                    <Link href={footerSettings.footer_social_telegram_url} aria-label="Telegram" className={`transition-colors duration-300 ${
                      isDark ? "hover:text-blue-400" : "hover:text-blue-300"
                    }`}><FaTelegram /></Link>
                  )}
                  {footerSettings?.footer_social_tiktok_url && (
                    <Link href={footerSettings.footer_social_tiktok_url} aria-label="TikTok" className={`transition-colors duration-300 ${
                      isDark ? "hover:text-gray-400" : "hover:text-gray-300"
                    }`}><FaTiktok /></Link>
                  )}
                  {footerSettings?.footer_social_linkedin_url && (
                    <Link href={footerSettings.footer_social_linkedin_url} aria-label="LinkedIn" className={`transition-colors duration-300 ${
                      isDark ? "hover:text-blue-400" : "hover:text-blue-300"
                    }`}><FaLinkedinIn /></Link>
                  )}
                  {footerSettings?.footer_social_whatsapp_url && (
                    <Link href={footerSettings.footer_social_whatsapp_url} aria-label="WhatsApp" className={`transition-colors duration-300 ${
                      isDark ? "hover:text-green-400" : "hover:text-green-300"
                    }`}><FaWhatsapp /></Link>
                  )}
                  {footerSettings?.footer_social_discord_url && (
                    <Link href={footerSettings.footer_social_discord_url} aria-label="Discord" className={`transition-colors duration-300 ${
                      isDark ? "hover:text-indigo-400" : "hover:text-indigo-300"
                    }`}><FaDiscord /></Link>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile: About Us, Resources, Updates - 3 columns in one row */}
          <div className="md:hidden grid grid-cols-3 gap-x-4 mb-6">
            {/* About Us */}
            {footerSettings?.footer_column_1_show && footerSettings?.footer_layout !== '3-column' && (
              <div>
                <h4 className="font-bold text-xs mb-2 pb-2 border-b border-white/20">
                  {footerSettings ? getText(footerSettings.footer_column_1_title) : t.footer?.sections?.aboutUs?.title || "About Us"}
                </h4>
                <ul className="space-y-1.5 text-xs">
                  {getMenuItemsByColumn(1).map((menuItem, index) => (
                    <li key={`column1-mobile-${index}`}>
                      <Link href={menuItem.url} className={`transition-colors duration-300 opacity-90 hover:opacity-100 ${
                        isDark ? "hover:text-red-400" : "hover:text-green-300"
                      }`}>
                        {getText({ en: menuItem.text_en, bn: menuItem.text_bn })}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Resources */}
            {footerSettings?.footer_column_2_show && (
              <div>
                <h4 className="font-bold text-xs mb-2 pb-2 border-b border-white/20">
                  {footerSettings ? getText(footerSettings.footer_column_2_title) : t.footer?.sections?.resources?.title || "Resources"}
                </h4>
                <ul className="space-y-1.5 text-xs">
                  {getMenuItemsByColumn(2).map((menuItem, index) => (
                    <li key={`column2-mobile-${index}`}>
                      <Link href={menuItem.url} className={`transition-colors duration-300 opacity-90 hover:opacity-100 ${
                        isDark ? "hover:text-red-400" : "hover:text-green-300"
                      }`}>
                        {getText({ en: menuItem.text_en, bn: menuItem.text_bn })}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Updates */}
            {footerSettings?.footer_column_3_show && footerSettings?.footer_layout !== '3-column' && (
              <div>
                <h4 className="font-bold text-xs mb-2 pb-2 border-b border-white/20">
                  {footerSettings ? getText(footerSettings.footer_column_3_title) : t.footer?.sections?.updates?.title || "Updates"}
                </h4>
                <ul className="space-y-1.5 text-xs">
                  {getMenuItemsByColumn(3).map((menuItem, index) => (
                    <li key={`column3-mobile-${index}`}>
                      <Link href={menuItem.url} className={`transition-colors duration-300 opacity-90 hover:opacity-100 ${
                        isDark ? "hover:text-red-400" : "hover:text-green-300"
                      }`}>
                        {getText({ en: menuItem.text_en, bn: menuItem.text_bn })}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Mobile: Join Us - Single column, full width buttons */}
          {footerSettings?.footer_column_4_show && footerSettings?.footer_layout === '5-column' && (
            <div className="md:hidden mb-6">
              <h4 className="font-bold text-sm mb-3 text-center">
                {footerSettings ? getText(footerSettings.footer_column_4_title) : t.footer?.sections?.joinUs?.title || "Join Us"}
              </h4>
              <div className="flex flex-col space-y-2">
                {footerSettings?.footer_column_4_button_1_show && (
                  <Link href={footerSettings?.footer_column_4_button_1_url || "/membership"} className={`w-full px-4 py-3 rounded-md text-center text-sm font-semibold transition-all duration-300 ${
                    isDark
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}>
                    {footerSettings ? getText(footerSettings.footer_column_4_button_1_text) : t.footer?.sections?.joinUs?.buttons?.membership || "Membership"}
                  </Link>
                )}
                {footerSettings?.footer_column_4_button_2_show && (
                  <Link href={footerSettings?.footer_column_4_button_2_url || "/general-membership"} className={`w-full px-4 py-3 rounded-md text-center text-sm font-semibold transition-all duration-300 ${
                    isDark
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}>
                    {footerSettings ? getText(footerSettings.footer_column_4_button_2_text) : t.footer?.sections?.joinUs?.buttons?.generalMembership || "General"}
                  </Link>
                )}
                {footerSettings?.footer_column_4_button_3_show && (
                  <Link href={footerSettings?.footer_column_4_button_3_url || "/donate"} className={`w-full px-4 py-3 rounded-md text-center text-sm font-semibold transition-all duration-300 ${
                    isDark
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}>
                    {footerSettings ? getText(footerSettings.footer_column_4_button_3_text) : t.footer?.sections?.joinUs?.buttons?.donate || "Donate"}
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Desktop: Original 5-column grid */}
          <div className={`hidden md:grid gap-x-8 gap-y-6 ${
            footerSettings?.footer_layout === '3-column'
              ? 'grid-cols-3'
              : footerSettings?.footer_layout === '4-column'
              ? 'grid-cols-4'
              : 'grid-cols-5'
          }`}>
            {/* Column 1: Logo + Socials - Desktop */}
            <div className="flex flex-col items-start">
              {footerSettings?.footer_logo_show && (
                <Image
                  src={footerSettings?.footer_logo_src || "/logo.png"}
                  alt={logoAltText || "Footer Logo"}
                  width={footerSettings?.footer_logo_width || 64}
                  height={footerSettings?.footer_logo_height || 48}
                />
              )}
              {footerSettings?.footer_social_show && (
                <>
                  <p className="mt-4 mb-2 font-semibold">
                    {footerSettings ? getText(footerSettings.footer_social_title) : t.footer?.followUs || "Follow us"}
                  </p>
                  <div className={`flex space-x-2 text-xl ${
                    isDark ? "text-gray-300" : "text-white"
                  }`}>
                    {footerSettings?.footer_social_youtube_url && (
                      <Link href={footerSettings.footer_social_youtube_url} aria-label="YouTube" className={`transition-colors duration-300 ${
                        isDark ? "hover:text-red-400" : "hover:text-red-300"
                      }`}><FaYoutube /></Link>
                    )}
                    {footerSettings?.footer_social_facebook_url && (
                      <Link href={footerSettings.footer_social_facebook_url} aria-label="Facebook" className={`transition-colors duration-300 ${
                        isDark ? "hover:text-blue-400" : "hover:text-blue-300"
                      }`}><FaFacebookF /></Link>
                    )}
                    {footerSettings?.footer_social_twitter_url && (
                      <Link href={footerSettings.footer_social_twitter_url} aria-label="X" className={`transition-colors duration-300 ${
                        isDark ? "hover:text-gray-400" : "hover:text-gray-300"
                      }`}><FaXTwitter /></Link>
                    )}
                    {footerSettings?.footer_social_instagram_url && (
                      <Link href={footerSettings.footer_social_instagram_url} aria-label="Instagram" className={`transition-colors duration-300 ${
                        isDark ? "hover:text-pink-400" : "hover:text-pink-300"
                      }`}><FaInstagram /></Link>
                    )}
                    {footerSettings?.footer_social_telegram_url && (
                      <Link href={footerSettings.footer_social_telegram_url} aria-label="Telegram" className={`transition-colors duration-300 ${
                        isDark ? "hover:text-blue-400" : "hover:text-blue-300"
                      }`}><FaTelegram /></Link>
                    )}
                    {footerSettings?.footer_social_tiktok_url && (
                      <Link href={footerSettings.footer_social_tiktok_url} aria-label="TikTok" className={`transition-colors duration-300 ${
                        isDark ? "hover:text-gray-400" : "hover:text-gray-300"
                      }`}><FaTiktok /></Link>
                    )}
                    {footerSettings?.footer_social_linkedin_url && (
                      <Link href={footerSettings.footer_social_linkedin_url} aria-label="LinkedIn" className={`transition-colors duration-300 ${
                        isDark ? "hover:text-blue-400" : "hover:text-blue-300"
                      }`}><FaLinkedinIn /></Link>
                    )}
                    {footerSettings?.footer_social_whatsapp_url && (
                      <Link href={footerSettings.footer_social_whatsapp_url} aria-label="WhatsApp" className={`transition-colors duration-300 ${
                        isDark ? "hover:text-green-400" : "hover:text-green-300"
                      }`}><FaWhatsapp /></Link>
                    )}
                    {footerSettings?.footer_social_discord_url && (
                      <Link href={footerSettings.footer_social_discord_url} aria-label="Discord" className={`transition-colors duration-300 ${
                        isDark ? "hover:text-indigo-400" : "hover:text-indigo-300"
                      }`}><FaDiscord /></Link>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Column 2: About Us - Desktop */}
            {footerSettings?.footer_column_1_show && footerSettings?.footer_layout !== '3-column' && (
              <div>
                <h4 className="font-bold mb-3">
                  {footerSettings ? getText(footerSettings.footer_column_1_title) : t.footer?.sections?.aboutUs?.title || "About Us"}
                </h4>
                <ul className="space-y-1.5">
                  {getMenuItemsByColumn(1).map((menuItem, index) => (
                    <li key={`column1-desktop-${index}`}>
                      <Link href={menuItem.url} className={`transition-colors duration-300 ${
                        isDark ? "hover:text-red-400" : "hover:text-green-300"
                      }`}>
                        {getText({ en: menuItem.text_en, bn: menuItem.text_bn })}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Column 3: Resources - Desktop */}
            {footerSettings?.footer_column_2_show && (
              <div>
                <h4 className="font-bold mb-3">
                  {footerSettings ? getText(footerSettings.footer_column_2_title) : t.footer?.sections?.resources?.title || "Resources"}
                </h4>
                <ul className="space-y-1.5">
                  {getMenuItemsByColumn(2).map((menuItem, index) => (
                    <li key={`column2-desktop-${index}`}>
                      <Link href={menuItem.url} className={`transition-colors duration-300 ${
                        isDark ? "hover:text-red-400" : "hover:text-green-300"
                      }`}>
                        {getText({ en: menuItem.text_en, bn: menuItem.text_bn })}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Column 4: Updates - Desktop */}
            {footerSettings?.footer_column_3_show && footerSettings?.footer_layout !== '3-column' && (
              <div>
                <h4 className="font-bold mb-3">
                  {footerSettings ? getText(footerSettings.footer_column_3_title) : t.footer?.sections?.updates?.title || "Updates"}
                </h4>
                <ul className="space-y-1.5">
                  {getMenuItemsByColumn(3).map((menuItem, index) => (
                    <li key={`column3-desktop-${index}`}>
                      <Link href={menuItem.url} className={`transition-colors duration-300 ${
                        isDark ? "hover:text-red-400" : "hover:text-green-300"
                      }`}>
                        {getText({ en: menuItem.text_en, bn: menuItem.text_bn })}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Column 5: Join Us Buttons - Desktop */}
            {footerSettings?.footer_column_4_show && footerSettings?.footer_layout === '5-column' && (
              <div>
                <h4 className="font-bold mb-3">
                  {footerSettings ? getText(footerSettings.footer_column_4_title) : t.footer?.sections?.joinUs?.title || "Join Us"}
                </h4>
                <div className="flex flex-col space-y-2">
                  {footerSettings?.footer_column_4_button_1_show && (
                    <Link href={footerSettings?.footer_column_4_button_1_url || "/membership"} className={`px-4 py-2 rounded-md text-center font-semibold transition-all duration-300 hover:scale-105 ${
                      isDark
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}>
                      {footerSettings ? getText(footerSettings.footer_column_4_button_1_text) : t.footer?.sections?.joinUs?.buttons?.membership || "Membership Free"}
                    </Link>
                  )}
                  {footerSettings?.footer_column_4_button_2_show && (
                    <Link href={footerSettings?.footer_column_4_button_2_url || "/general-membership"} className={`px-4 py-2 rounded-md text-center font-semibold transition-all duration-300 hover:scale-105 ${
                      isDark
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}>
                      {footerSettings ? getText(footerSettings.footer_column_4_button_2_text) : t.footer?.sections?.joinUs?.buttons?.generalMembership || "General Membership Free"}
                    </Link>
                  )}
                  {footerSettings?.footer_column_4_button_3_show && (
                    <Link href={footerSettings?.footer_column_4_button_3_url || "/donate"} className={`px-4 py-2 rounded-md text-center font-semibold transition-all duration-300 hover:scale-105 ${
                      isDark
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}>
                      {footerSettings ? getText(footerSettings.footer_column_4_button_3_text) : t.footer?.sections?.joinUs?.buttons?.donate || "Donate"}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Bottom */}
        <div
          className="py-4 px-6 text-sm text-center transition-colors duration-300"
          style={{
            borderTop: footerSettings?.footer_border_show ?
              `1px solid ${isDark ? '#374151' : (footerSettings?.footer_bottom_border_color || '#22C55E')}` :
              'none',
            color: isDark ? '#9CA3AF' : (footerSettings?.footer_text_color || '#FFFFFF'),
            opacity: 0.9
          }}
        >
          <p>© S M Jahangir Hossain | 2025 | BNP</p>
          <p>
            Developed by{' '}
            <Link
              href="https://wa.me/8801974134628"
              target="_blank"
              rel="noopener noreferrer"
              className={`underline transition-colors duration-300 ${
                isDark ? "hover:text-green-400" : "hover:text-green-300"
              }`}
            >
              Velocita Infosys
            </Link>
          </p>
        </div>
      </footer>

      {/* CTA at Bottom */}
      {showCTA && footerSettings?.footer_cta_position === 'bottom' && (
        <div className="relative">
          <div className={`h-32 md:h-40 transition-colors duration-300 ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}></div>
          <div 
            className="h-32 md:h-40 transition-colors duration-300"
            style={{
              backgroundColor: isDark ? '#111827' : (footerSettings?.footer_bg_color || '#003B2F')
            }}
          ></div>
          <CTASection />
        </div>
      )}
    </>
  );
}