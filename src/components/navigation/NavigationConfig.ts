import { IconType } from 'react-icons';
import {
  FaHouse,
  FaUser,
  FaCalendarDays,
  FaNewspaper,
  FaHandHoldingHeart,
  FaBars,
  FaHeadset,
  FaLocationDot,
  FaImages,
  FaVideo,
  FaUsers,
  FaPeopleGroup,
  FaDroplet,
  FaComments,
  FaStar,
  FaEnvelope,
  FaFileLines,
  FaPhone,
  FaTriangleExclamation,
  FaShieldHeart,
  FaChartColumn,
  FaPeopleArrows,
  FaListCheck,
  FaGamepad,
  FaTrophy,
  FaDownload,
  FaCircleQuestion,
  FaLock,
  FaFileContract,
  FaUniversalAccess,
  FaSitemap,
} from 'react-icons/fa6';

// Main navigation items (top level)
export interface MainNavItem {
  key: string;
  href: string;
  labelEn: string;
  labelBn: string;
  icon: IconType;
  isMegaMenu?: boolean;
}

export const mainNavItems: MainNavItem[] = [
  {
    key: 'home',
    href: '/',
    labelEn: 'Home',
    labelBn: 'হোম',
    icon: FaHouse,
  },
  {
    key: 'about',
    href: '/about',
    labelEn: 'About',
    labelBn: 'সম্পর্কে',
    icon: FaUser,
  },
  {
    key: 'events',
    href: '/events',
    labelEn: 'Events',
    labelBn: 'ইভেন্ট',
    icon: FaCalendarDays,
  },
  {
    key: 'news',
    href: '/news',
    labelEn: 'News',
    labelBn: 'সংবাদ',
    icon: FaNewspaper,
  },
  {
    key: 'more',
    href: '#',
    labelEn: 'More',
    labelBn: 'আরও',
    icon: FaBars,
    isMegaMenu: true,
  },
  {
    key: 'support',
    href: '/election-2026',
    labelEn: 'Support',
    labelBn: 'সমর্থন',
    icon: FaHeadset,
  },
];

// Mega menu item structure
export interface MegaMenuItem {
  key: string;
  href: string;
  labelEn: string;
  labelBn: string;
  descriptionEn: string;
  descriptionBn: string;
  icon: IconType;
  isInstallAction?: boolean;
}

// Sub-category structure (for categories that have sub-sections like Participate + Gallery)
export interface MegaMenuSubCategory {
  key: string;
  labelEn: string;
  labelBn: string;
  items: MegaMenuItem[];
}

// Mega menu category structure
export interface MegaMenuCategory {
  key: string;
  labelEn: string;
  labelBn: string;
  items: MegaMenuItem[];
  subCategories?: MegaMenuSubCategory[];
}

// Mega menu categories with all items
export const megaMenuCategories: MegaMenuCategory[] = [
  {
    key: 'community',
    labelEn: 'Community',
    labelBn: 'কমিউনিটি',
    items: [
      {
        key: 'bloodHub',
        href: '/blood-hub',
        labelEn: 'Blood Hub',
        labelBn: 'ব্লাড হাব',
        descriptionEn: 'Find donors and donate blood',
        descriptionBn: 'রক্তদাতা খুঁজুন ও রক্তদান করুন',
        icon: FaDroplet,
      },
      {
        key: 'volunteerHub',
        href: '/volunteer-hub',
        labelEn: 'Volunteer Hub',
        labelBn: 'স্বেচ্ছাসেবক হাব',
        descriptionEn: 'Join our volunteer network',
        descriptionBn: 'স্বেচ্ছাসেবক হিসেবে যোগ দিন',
        icon: FaPeopleGroup,
      },
      {
        key: 'askMeAnything',
        href: '/ama',
        labelEn: 'Ask Me Anything',
        labelBn: 'প্রশ্নোত্তর',
        descriptionEn: 'Submit your questions',
        descriptionBn: 'আপনার প্রশ্ন জমা দিন',
        icon: FaComments,
      },
      {
        key: 'feedback',
        href: '/testimonials',
        labelEn: 'Feedback',
        labelBn: 'মতামত',
        descriptionEn: 'Share your feedback',
        descriptionBn: 'আপনার মতামত জানান',
        icon: FaStar,
      },
      {
        key: 'leadership',
        href: '/leadership',
        labelEn: 'Leadership',
        labelBn: 'নেতৃত্ব',
        descriptionEn: 'Meet our leaders',
        descriptionBn: 'আমাদের নেতাদের সাথে পরিচিত হন',
        icon: FaUsers,
      },
    ],
  },
  {
    key: 'contactHelp',
    labelEn: 'Contact & Help',
    labelBn: 'যোগাযোগ ও সহায়তা',
    items: [
      {
        key: 'contactUs',
        href: '/contact',
        labelEn: 'Contact Us',
        labelBn: 'যোগাযোগ করুন',
        descriptionEn: 'Get in touch with us',
        descriptionBn: 'আমাদের সাথে যোগাযোগ করুন',
        icon: FaEnvelope,
      },
      {
        key: 'complaints',
        href: '/complaints',
        labelEn: 'Complaint Box',
        labelBn: 'অভিযোগ বক্স',
        descriptionEn: 'Submit your complaints',
        descriptionBn: 'অভিযোগ জমা দিন',
        icon: FaFileLines,
      },
      {
        key: 'areaProblems',
        href: '/area-problems',
        labelEn: 'Area Problems',
        labelBn: 'এলাকার সমস্যা',
        descriptionEn: 'Report local issues',
        descriptionBn: 'এলাকার সমস্যা জানান',
        icon: FaLocationDot,
      },
      {
        key: 'emergencyContacts',
        href: '/emergency/contacts',
        labelEn: 'Emergency Contacts',
        labelBn: 'জরুরি যোগাযোগ',
        descriptionEn: 'Important emergency numbers',
        descriptionBn: 'জরুরি ফোন নম্বর',
        icon: FaPhone,
      },
      {
        key: 'emergencySOS',
        href: '/emergency/sos',
        labelEn: 'Emergency SOS',
        labelBn: 'জরুরি এসওএস',
        descriptionEn: 'Quick emergency assistance',
        descriptionBn: 'দ্রুত জরুরি সহায়তা',
        icon: FaTriangleExclamation,
      },
      {
        key: 'safetyResources',
        href: '/emergency/safety',
        labelEn: 'Safety Resources',
        labelBn: 'নিরাপত্তা সম্পদ',
        descriptionEn: 'Safety guides and resources',
        descriptionBn: 'নিরাপত্তা গাইড',
        icon: FaShieldHeart,
      },
    ],
  },
  {
    key: 'participate',
    labelEn: 'Participate',
    labelBn: 'অংশগ্রহণ',
    items: [
      {
        key: 'pollsSurveys',
        href: '/polls',
        labelEn: 'Polls & Surveys',
        labelBn: 'পোল ও সার্ভে',
        descriptionEn: 'Vote in polls and surveys',
        descriptionBn: 'পোল ও সার্ভেতে অংশ নিন',
        icon: FaChartColumn,
      },
      {
        key: 'communityForum',
        href: '/community-forum',
        labelEn: 'Community Forum',
        labelBn: 'কমিউনিটি ফোরাম',
        descriptionEn: 'Join community discussions',
        descriptionBn: 'আলোচনায় যোগ দিন',
        icon: FaPeopleArrows,
      },
      {
        key: 'promiseTracker',
        href: '/promises',
        labelEn: 'Promise Tracker',
        labelBn: 'প্রতিশ্রুতি ট্র্যাকার',
        descriptionEn: 'Track our commitments',
        descriptionBn: 'প্রতিশ্রুতি ট্র্যাক করুন',
        icon: FaListCheck,
      },
    ],
    subCategories: [
      {
        key: 'gallery',
        labelEn: 'Gallery',
        labelBn: 'গ্যালারি',
        items: [
          {
            key: 'photoGallery',
            href: '/gallery/photos',
            labelEn: 'Photo Gallery',
            labelBn: 'ফটো গ্যালারি',
            descriptionEn: 'View event photos and memories',
            descriptionBn: 'ইভেন্টের ছবি দেখুন',
            icon: FaImages,
          },
          {
            key: 'videoStories',
            href: '/gallery/videos',
            labelEn: 'Video Stories',
            labelBn: 'ভিডিও স্টোরিজ',
            descriptionEn: 'Watch video content',
            descriptionBn: 'ভিডিও দেখুন',
            icon: FaVideo,
          },
        ],
      },
    ],
  },
  {
    key: 'digitalTools',
    labelEn: 'Digital Tools',
    labelBn: 'ডিজিটাল টুলস',
    items: [
      {
        key: 'challenges',
        href: '/challenges',
        labelEn: 'Challenges',
        labelBn: 'চ্যালেঞ্জ',
        descriptionEn: 'Participate in challenges',
        descriptionBn: 'চ্যালেঞ্জে অংশ নিন',
        icon: FaTrophy,
      },
      {
        key: 'gamification',
        href: '/gamification',
        labelEn: 'Gamification',
        labelBn: 'গেমিফিকেশন',
        descriptionEn: 'Earn points and rewards',
        descriptionBn: 'পয়েন্ট ও পুরস্কার অর্জন করুন',
        icon: FaGamepad,
      },
      {
        key: 'installApp',
        href: '#install',
        labelEn: 'Install App',
        labelBn: 'অ্যাপ ইনস্টল',
        descriptionEn: 'Install our PWA app',
        descriptionBn: 'আমাদের অ্যাপ ইনস্টল করুন',
        icon: FaDownload,
        isInstallAction: true,
      },
    ],
  },
  {
    key: 'legalInfo',
    labelEn: 'Legal & Info',
    labelBn: 'আইনি ও তথ্য',
    items: [
      {
        key: 'help',
        href: '/help',
        labelEn: 'Help',
        labelBn: 'সাহায্য',
        descriptionEn: 'Get help and support',
        descriptionBn: 'সাহায্য পান',
        icon: FaCircleQuestion,
      },
      {
        key: 'privacy',
        href: '/privacy',
        labelEn: 'Privacy Policy',
        labelBn: 'গোপনীয়তা নীতি',
        descriptionEn: 'Read our privacy policy',
        descriptionBn: 'গোপনীয়তা নীতি পড়ুন',
        icon: FaLock,
      },
      {
        key: 'terms',
        href: '/terms',
        labelEn: 'Terms of Service',
        labelBn: 'সেবার শর্তাবলী',
        descriptionEn: 'Terms and conditions',
        descriptionBn: 'শর্তাবলী পড়ুন',
        icon: FaFileContract,
      },
      {
        key: 'accessibility',
        href: '/accessibility',
        labelEn: 'Accessibility',
        labelBn: 'অ্যাক্সেসিবিলিটি',
        descriptionEn: 'Accessibility features',
        descriptionBn: 'প্রবেশযোগ্যতা বৈশিষ্ট্য',
        icon: FaUniversalAccess,
      },
      {
        key: 'siteMap',
        href: '/site-map',
        labelEn: 'Site Map',
        labelBn: 'সাইট ম্যাপ',
        descriptionEn: 'Browse all pages',
        descriptionBn: 'সব পেজ দেখুন',
        icon: FaSitemap,
      },
    ],
  },
];

// Helper functions
export const getNavLabel = (item: { labelEn: string; labelBn: string }, language: 'en' | 'bn'): string => {
  return language === 'bn' ? item.labelBn : item.labelEn;
};

export const getNavDescription = (item: { descriptionEn: string; descriptionBn: string }, language: 'en' | 'bn'): string => {
  return language === 'bn' ? item.descriptionBn : item.descriptionEn;
};
