/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'twilio'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
    ],
  },
  async headers() {
    return [
      // Global security headers
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff'                  },
          { key: 'X-Frame-Options',            value: 'DENY'                     },
          { key: 'X-XSS-Protection',           value: '1; mode=block'            },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'Strict-Transport-Security',  value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js requires unsafe-inline/unsafe-eval for hydration & dev
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://appleid.cdn-apple.com",
              "style-src 'self' 'unsafe-inline'",
              // Images: self + data URIs + all HTTPS (QR codes, CDN images)
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              // API connections
              "connect-src 'self' https://api.stripe.com https://www.googleapis.com https://accounts.google.com https://appleid.apple.com",
              // Stripe payment iframe
              "frame-src https://js.stripe.com",
              // Prevent plugin injection (Flash, etc.)
              "object-src 'none'",
              // Prevent base-tag injection
              "base-uri 'self'",
              // Restrict form submissions (Apple Sign-In posts back here)
              "form-action 'self' https://appleid.apple.com",
            ].join('; '),
          },
        ],
      },
      // PWA files — no-cache so updates propagate immediately
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type',  value: 'application/javascript' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type',  value: 'application/manifest+json' },
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
      // Icons — long cache
      {
        source: '/icons/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // .well-known for app verification
      {
        source: '/.well-known/(.*)',
        headers: [
          { key: 'Content-Type',  value: 'application/json' },
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Ensure HTTPS in production
      {
        source: '/(.*)',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://scruffs.vercel.app'}/:path*`,
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
