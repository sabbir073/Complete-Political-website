import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Testimonials | S M Jahangir Hossain - Dhaka-18',
  description: 'Read testimonials from constituents and community members about S M Jahangir Hossain\'s dedication to serving Dhaka-18. Real stories from real people.',
  keywords: [
    'S M Jahangir Hossain testimonials',
    'Dhaka-18 testimonials',
    'constituent feedback',
    'community testimonials',
    'BNP leader reviews',
    'public opinion',
    'citizen stories',
    'জনগণের মতামত',
    'সাক্ষাৎকার'
  ],
  openGraph: {
    title: 'Testimonials | S M Jahangir Hossain',
    description: 'Read testimonials from constituents and community members about S M Jahangir Hossain\'s dedication to serving Dhaka-18.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'bn_BD',
    siteName: 'S M Jahangir Hossain',
    images: [
      {
        url: '/og-testimonials.jpg',
        width: 1200,
        height: 630,
        alt: 'Testimonials - S M Jahangir Hossain'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Testimonials | S M Jahangir Hossain',
    description: 'Read testimonials from constituents and community members about S M Jahangir Hossain\'s dedication to serving Dhaka-18.',
    images: ['/og-testimonials.jpg']
  },
  alternates: {
    canonical: '/testimonials',
    languages: {
      'en': '/testimonials',
      'bn': '/testimonials'
    }
  }
};

export default function TestimonialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Testimonials - S M Jahangir Hossain',
            description: 'Testimonials from constituents and community members',
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: 'https://smjahangir.com'
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Testimonials',
                  item: 'https://smjahangir.com/testimonials'
                }
              ]
            }
          })
        }}
      />
      {children}
    </>
  );
}
