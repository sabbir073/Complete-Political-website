import type { Metadata } from "next";
import "./globals.css";
import "../styles/sweetalert.css";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import AuthInitializer from "@/components/AuthInitializer";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Political Party - A Country That Belongs To Everyone",
  description: "Join us in the fight for democracy, voting rights, and a thriving community.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yourdomain.com/",
    siteName: "Political Party",
    images: [
      {
        url: "https://yourdomain.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Political Party Banner",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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