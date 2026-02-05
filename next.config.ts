import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Experimental features for larger file uploads via Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dahf45b8zc9m5.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'smjahangirhossain.s3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://apis.google.com https://*.firebaseapp.com https://*.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com",
              "frame-src 'self' https://www.google.com https://*.firebaseapp.com https://*.googleapis.com https://www.youtube.com https://www.youtube-nocookie.com https://youtube.com",
              "connect-src 'self' https://*.supabase.co https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://*.firebaseio.com https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://smjahangirhossain.s3.ap-south-1.amazonaws.com https://*.s3.ap-south-1.amazonaws.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https://dahf45b8zc9m5.cloudfront.net https://smjahangirhossain.s3.ap-south-1.amazonaws.com https://www.google-analytics.com https://www.googletagmanager.com https: blob:",
              "media-src 'self' blob: https://dahf45b8zc9m5.cloudfront.net https://smjahangirhossain.s3.ap-south-1.amazonaws.com https://*.s3.ap-south-1.amazonaws.com",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
