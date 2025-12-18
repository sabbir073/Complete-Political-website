import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'S M Jahangir Hossain - BNP Dhaka-18',
    short_name: 'SM Jahangir',
    description: 'Official website of S M Jahangir Hossain - BNP Nominated MP Candidate for Dhaka-18 Constituency in National Election 2026',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e40af',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en',
    dir: 'ltr',
    categories: ['politics', 'news', 'social'],
    icons: [
      {
        src: '/Logo-PNG.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/Logo-PNG.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/Logo-PNG.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'News',
        short_name: 'News',
        description: 'Read latest news and updates',
        url: '/news',
      },
      {
        name: 'Events',
        short_name: 'Events',
        description: 'View upcoming events',
        url: '/events',
      },
      {
        name: 'Contact',
        short_name: 'Contact',
        description: 'Get in touch',
        url: '/contact',
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
