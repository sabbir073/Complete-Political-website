import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dahf45b8zc9m5.cloudfront.net',
        port: '',
        pathname: '/media/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'none'; img-src 'self' data: https://dahf45b8zc9m5.cloudfront.net https:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
