import { useState, useEffect } from 'react';
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
}

const translations: Record<Language, LanguageData> = {
  bn: bnCommon,
  en: enCommon,
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('bn');

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && ['bn', 'en'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      // Default to Bengali, allow English only if browser explicitly prefers it
      const browserLanguage = navigator.language.toLowerCase();
      if (browserLanguage.includes('en')) {
        setLanguage('en');
      } else {
        setLanguage('bn');
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

  const t = translations[language];

  return {
    language,
    changeLanguage,
    t,
    isRTL: language === 'bn', // For future RTL support if needed
  };
};