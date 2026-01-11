import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../styles/sweetalert.css";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import AuthInitializer from "@/components/AuthInitializer";
import { Toaster } from "react-hot-toast";
import { siteConfig, generatePersonJsonLd, generateWebsiteJsonLd } from "@/lib/seo";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | BNP Nominated MP Candidate - Dhaka-18`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author, url: siteConfig.url }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    alternateLocale: siteConfig.alternateLocale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | BNP Nominated MP Candidate - Dhaka-18`,
    description: siteConfig.description,
    images: [
      {
        url: `${siteConfig.url}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - BNP Nominated MP Candidate for Dhaka-18`,
      },
    ],
  },
  facebook: siteConfig.facebookAppId ? {
    appId: siteConfig.facebookAppId,
  } : undefined,
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | BNP Nominated MP Candidate - Dhaka-18`,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og-default.jpg`],
    creator: siteConfig.twitter,
    site: siteConfig.twitter,
  },
  verification: {
    google: siteConfig.googleVerification || undefined,
    yandex: siteConfig.yandexVerification || undefined,
    other: {
      ...(siteConfig.bingVerification ? { "msvalidate.01": siteConfig.bingVerification } : {}),
    },
  },
  alternates: {
    canonical: siteConfig.url,
    languages: {
      "en-US": siteConfig.url,
      "bn-BD": `${siteConfig.url}?lang=bn`,
    },
  },
  category: "politics",
  applicationName: siteConfig.name,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteConfig.shortName,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: [{ url: '/favicon.ico' }],
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const personJsonLd = generatePersonJsonLd();
  const websiteJsonLd = generateWebsiteJsonLd();

  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors" suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <AuthInitializer>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    style: {
                      background: '#10b981',
                    },
                  },
                  error: {
                    duration: 5000,
                    style: {
                      background: '#ef4444',
                    },
                  },
                }}
              />
            </AuthInitializer>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}