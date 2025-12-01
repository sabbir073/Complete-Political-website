"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import bnCommon from '../locales/bn/common.json';
import enCommon from '../locales/en/common.json';

export type Language = 'bn' | 'en';

interface LanguageData {
  navigation: {
    home: string;
    about: string;
    activities: string;
    services: string;
    more: string;
  };
  about: {
    personalInfo: string;
    politicalJourney: string;
    education: string;
    partyPosition: string;
    awards: string;
  };
  activities: {
    events: string;
    upcomingEvents: string;
    pastEvents: string;
    meetingCalendar: string;
    virtualTownHall: string;
    news: string;
    latestNews: string;
    pressReleases: string;
    announcements: string;
    mediaCoverage: string;
    gallery: string;
    photoGallery: string;
    videoStories: string;
    eventPhotos: string;
    downloads: string;
    leadership: string;
  };
  services: {
    contactComplaints: string;
    contactUs: string;
    complaintBox: string;
    areaProblems: string;
    emergencyContacts: string;
    emergencySOS: string;
    safetyResources: string;
    bloodHub: string;
    bloodHubHome: string;
    findBlood: string;
    becomeDonor: string;
    requestBlood: string;
    publicParticipation: string;
    pollsSurveys: string;
    askMeAnything: string;
    communityForum: string;
    volunteer: string;
    promisesProgress: string;
    promiseTracker: string;
    achievements: string;
    testimonials: string;
  };
  more: {
    digitalTools: string;
    livePolling: string;
    challenges: string;
    gamification: string;
    store: string;
    helpInfo: string;
    help: string;
    privacy: string;
    terms: string;
    accessibility: string;
    siteMap: string;
    installApp: string;
  };
  buttons: {
    whatsapp: string;
    contact: string;
    language: string;
    theme: string;
    menu: string;
    close: string;
  };
  theme: {
    light: string;
    dark: string;
    toggle: string;
  };
  404: {
    title: string;
    subtitle: string;
    description: string;
    homeButton: string;
    contactButton: string;
    searchPlaceholder: string;
    popularPages: string;
    helpText: string;
  };
  hero: {
    slides: Array<{
      title: string;
      subtitle: string;
    }>;
    learnMore: string;
  };
  leaders: {
    sectionLabel: string;
    title: string;
    viewMore: string;
    names: string[];
  };
  events: {
    sectionLabel: string;
    title: string;
    viewAll: string;
    viewAllEvents: string;
    eventList: Array<{
      title: string;
      description: string;
      date: string;
      category: string;
    }>;
  };
  aboutMe: {
    sectionLabel: string;
    title: string;
    titleHighlight: string;
    paragraph1: string;
    paragraph2: string;
    learnMore: string;
    videoTitle: string;
    videoSubtitle: string;
  };
  photoGallery: {
    sectionLabel: string;
    title: string;
    viewAll: string;
    viewAllPhotos: string;
    images: Array<{
      alt: string;
      caption: string;
    }>;
  };
  blog: {
    sectionLabel: string;
    title: string;
    viewAll: string;
    viewAllNews: string;
    readMore: string;
    posts: Array<{
      title: string;
      excerpt: string;
      date: string;
      author: string;
      readTime: string;
    }>;
  };
  videoGallery: {
    sectionLabel: string;
    title: string;
    viewAll: string;
    viewAllVideos: string;
    watchNow: string;
    videos: Array<{
      title: string;
      description: string;
      duration: string;
    }>;
  };
  footer: {
    cta: {
      title: string;
      subtitle: string;
      joinButton: string;
    };
    followUs: string;
    sections: {
      aboutUs: {
        title: string;
        links: {
          ourLeaders: string;
          constitution: string;
        };
      };
      resources: {
        title: string;
        links: {
          vision2030: string;
          "19points": string;
        };
      };
      updates: {
        title: string;
        links: {
          pressReleases: string;
          announcements: string;
        };
      };
      joinUs: {
        title: string;
        buttons: {
          membership: string;
          generalMembership: string;
          donate: string;
        };
      };
    };
    copyright: string;
    developer: string;
  };
  aboutPage: {
    hero: {
      badge: string;
      name: string;
      lastName: string;
      position: string;
      organization: string;
      description: string;
      detailsButton: string;
      contactButton: string;
      experienceYears: string;
      experienceLabel: string;
      currentYear: string;
      currentLabel: string;
    };
    stats: Array<{
      number: string;
      label: string;
    }>;
    personalInfo: {
      title: string;
      data: Array<{
        label: string;
        value: string;
      }>;
    };
    education: {
      title: string;
      data: Array<{
        level: string;
        degree: string;
        institution: string;
        year: string;
      }>;
    };
    politicalJourney: {
      title: string;
      timeline: Array<{
        year: string;
        event: string;
        details: string;
      }>;
    };
    quote: {
      text: string;
      author: string;
    };
    contact: {
      title: string;
      subtitle: string;
      callButton: string;
      homeButton: string;
    };
  };
}

const translations: Record<Language, LanguageData> = {
  bn: bnCommon,
  en: enCommon,
};

interface LanguageContextType {
  language: Language;
  changeLanguage: (newLanguage: Language) => void;
  t: LanguageData;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && ['bn', 'en'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      // Set default language based on browser preference
      const browserLanguage = navigator.language.toLowerCase();
      if (browserLanguage.includes('bn') || browserLanguage.includes('bd')) {
        setLanguage('bn');
      } else {
        setLanguage('en');
      }
    }
  }, []);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('preferred-language', newLanguage);
    
    // Update document direction for Bangla
    document.documentElement.dir = newLanguage === 'bn' ? 'ltr' : 'ltr';
    document.documentElement.lang = newLanguage === 'bn' ? 'bn-BD' : 'en-US';
  };

  const value = {
    language,
    changeLanguage,
    t: translations[language],
    isRTL: language === 'bn',
  };

  // Don't block rendering - use default language until mounted
  if (!mounted) {
    const defaultValue = {
      language: 'en' as Language,
      changeLanguage: () => {},
      t: translations['en'],
      isRTL: false,
    };
    
    return (
      <LanguageContext.Provider value={defaultValue}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}