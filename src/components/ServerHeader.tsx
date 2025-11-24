 
 
import Image from "next/image";
import Link from "next/link";
import { getHeaderSettings } from "@/lib/getHeaderSettings";
import ClientHeaderControls from "./ClientHeaderControls";
import ClientHeaderWrapper from "./ClientHeaderWrapper";

const menuItems = [
  { href: "/", key: "home" },
  {
    href: "/about",
    key: "about",
    dropdown: [
      { href: "/about", key: "personalInfo" },
      { href: "/about#journey", key: "politicalJourney" },
      { href: "/about#education", key: "education" },
      { href: "/about#position", key: "partyPosition" },
      { href: "/about#achievements", key: "awards" },
    ],
  },
  {
    href: "/activities",
    key: "activities",
    dropdown: [
      {
        href: "/events",
        key: "events",
        submenu: [
          { href: "/events", key: "upcomingEvents" },
          { href: "/events/archive", key: "pastEvents" },
          { href: "/events/calendar", key: "meetingCalendar" },
          { href: "/events/town-hall", key: "virtualTownHall" },
        ],
      },
      {
        href: "/news",
        key: "news",
        submenu: [
          { href: "/news", key: "latestNews" },
          { href: "/news/press-releases", key: "pressReleases" },
          { href: "/news/announcements", key: "announcements" },
          { href: "/news/media", key: "mediaCoverage" },
        ],
      },
      {
        href: "/gallery",
        key: "gallery",
        submenu: [
          { href: "/gallery", key: "photoGallery" },
          { href: "/gallery/videos", key: "videoStories" },
          { href: "/gallery/events", key: "eventPhotos" },
          { href: "/gallery/downloads", key: "downloads" },
        ],
      },
      { href: "/leaders", key: "leadership" },
    ],
  },
  {
    href: "/services",
    key: "services",
    dropdown: [
      {
        href: "/contact",
        key: "contactComplaints",
        submenu: [
          { href: "/contact", key: "contactUs" },
          { href: "/contact/complaints", key: "complaintBox" },
          { href: "/contact/area-problems", key: "areaProblems" },
          { href: "/emergency", key: "emergencyHelp" },
        ],
      },
      {
        href: "/participation",
        key: "publicParticipation",
        submenu: [
          { href: "/polls", key: "pollsSurveys" },
          { href: "/ama", key: "askMeAnything" },
          { href: "/forum", key: "communityForum" },
          { href: "/volunteer", key: "volunteer" },
        ],
      },
      {
        href: "/promises",
        key: "promisesProgress",
        submenu: [
          { href: "/promises", key: "promiseTracker" },
          { href: "/achievements", key: "achievements" },
          { href: "/testimonials", key: "testimonials" },
        ],
      },
    ],
  },
  {
    href: "/more",
    key: "more",
    dropdown: [
      {
        href: "/tools",
        key: "digitalTools",
        submenu: [
          { href: "/polls/live", key: "livePolling" },
          { href: "/challenges", key: "challenges" },
          { href: "/gamification", key: "gamification" },
          { href: "/store", key: "store" },
        ],
      },
      {
        href: "/support",
        key: "helpInfo",
        submenu: [
          { href: "/help", key: "help" },
          { href: "/privacy", key: "privacy" },
          { href: "/terms", key: "terms" },
          { href: "/accessibility", key: "accessibility" },
        ],
      },
      { href: "/sitemap", key: "siteMap" },
      { href: "/install", key: "installApp" },
    ],
  },
];

export default async function ServerHeader() {
  // Fetch settings on the server side
  const settings = await getHeaderSettings();

  return (
    <ClientHeaderWrapper settings={settings}>
      <header>
        <div className="container mx-auto">
          <div className="flex justify-between items-center px-6 py-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
              <Image 
                src={settings.header_logo_light} 
                alt={settings.header_logo_alt.en} 
                width={settings.header_logo_width} 
                height={settings.header_logo_height} 
                className="h-auto max-h-14" 
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4">
              {menuItems.map((item) => (
                <div
                  key={item.href}
                  className="relative group"
                >
                  <Link
                    href={item.href}
                    className="text-base font-semibold px-4 py-2 rounded-lg transition-all duration-300 flex items-center whitespace-nowrap text-gray-700 hover:text-red-600 hover:bg-gray-50"
                  >
                    {item.key}
                    {item.dropdown && (
                      <svg
                        className="ml-2 w-4 h-4 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {item.dropdown && (
                    <div className="absolute top-full left-0 w-80 rounded-xl shadow-2xl border bg-white border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[99999]">
                      <div className="py-3">
                        {item.dropdown.map((subItem) => (
                          <div key={subItem.href} className="relative group/sub">
                            <Link
                              href={subItem.href}
                              className="flex items-center justify-between px-6 py-3 text-sm font-medium transition-all duration-200 text-gray-700 hover:text-red-600 hover:bg-gray-50"
                            >
                              <span>{subItem.key}</span>
                              {subItem.submenu && (
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </Link>

                            {/* Submenu */}
                            {subItem.submenu && (
                              <div className="absolute left-full top-0 w-72 rounded-xl shadow-xl border bg-white border-gray-200 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-300 z-[999999]">
                                <div className="py-2">
                                  {subItem.submenu.map((subSubItem) => (
                                    <Link
                                      key={subSubItem.href}
                                      href={subSubItem.href}
                                      className="block px-6 py-2 text-sm transition-all duration-200 text-gray-600 hover:text-red-600 hover:bg-gray-50"
                                    >
                                      {subSubItem.key}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Language Toggle */}
              {settings.header_show_language_toggle && (
                <div className="px-4 py-2 text-sm font-semibold rounded-lg border text-gray-700 border-gray-300">
                  English
                </div>
              )}

              {/* Theme Toggle */}
              {settings.header_show_theme_toggle && (
                <div className="p-3 rounded-lg text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              )}

              {/* WhatsApp Button */}
              {settings.header_show_whatsapp_button && (
                <a
                  href={`https://wa.me/${settings.whatsapp_phone_number.replace(/[^\d+]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 2.006c-5.516 0-9.999 4.481-9.999 9.996 0 1.746.444 3.388 1.234 4.815L2.003 21.99l5.245-1.238c1.391.745 2.977 1.143 4.769 1.143 5.515 0 9.998-4.481 9.998-9.996S17.532 2.006 12.017 2.006zm5.818 14.186c-.244.687-1.213 1.266-1.973 1.43-.511.11-1.18.195-3.426-.731-2.871-1.184-4.727-4.073-4.871-4.26-.144-.187-1.174-1.563-1.174-2.982 0-1.419.744-2.118 1.008-2.407.264-.289.576-.361.768-.361.192 0 .384.009.552.017.177.008.414-.067.648.495.239.576.816 1.991.888 2.135.072.144.12.313.024.5-.096.187-.144.304-.288.472-.144.168-.304.374-.433.5-.144.144-.288.304-.12.6.168.296.744 1.227 1.596 1.986 1.092.973 2.016 1.274 2.304 1.418.288.144.456.12.624-.072.168-.192.72-.839.912-1.127.192-.288.384-.24.648-.144.264.096 1.68.792 1.968.936.288.144.48.216.552.336.072.12.072.697-.168 1.385z"/>
                  </svg>
                  <span>{settings.whatsapp_button_text.en}</span>
                </a>
              )}

              {/* Contact Button */}
              {settings.header_show_contact_button && (
                <Link
                  href={settings.contact_button_link}
                  className={`relative bg-gradient-to-r ${settings.contact_button_background} text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:${settings.contact_button_hover_background} hover:scale-105 shadow-lg hover:shadow-xl`}
                >
                  {settings.contact_button_text.en}
                </Link>
              )}
            </div>

            {/* Mobile Menu Button - This will need client-side interactivity */}
            <ClientHeaderControls settings={settings} />
          </div>
        </div>
      </header>
    </ClientHeaderWrapper>
  );
}