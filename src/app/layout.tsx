import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import AuthInitializer from "@/components/AuthInitializer";

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
      <body className="min-h-screen flex flex-col bg-white">
        <ThemeProvider>
          <LanguageProvider>
            <AuthInitializer>
              {children}
            </AuthInitializer>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}