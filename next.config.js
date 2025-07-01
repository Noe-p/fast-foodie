const { i18n } = require('./next-i18next.config');
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern:
        /^https:\/\/api\.fast-foodie\.noe-philippe\.fr\/files\/.*\.(png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'external-images-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        },
      },
    },
    {
      urlPattern: /^http:\/\/localhost:8000\/api\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'local-api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // 1 heure
        },
      },
    },
    {
      urlPattern: /^https:\/\/api\.fast-foodie\.noe-philippe\.fr\/api\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'remote-api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // 1 heure
        },
      },
    },
    {
      urlPattern: /^\/api\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'nextjs-api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // 1 heure
        },
      },
    },
  ],
});

const settings = {
  reactStrictMode: true,
  swcMinify: true,
  i18n,
  staticPageGenerationTimeout: 20000,
  output: 'standalone',
  modularizeImports: {},
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/files/**',
      },
      {
        protocol: 'https',
        hostname: 'api.fast-foodie.noe-philippe.fr',
        port: '',
        pathname: '/files/**',
      },
    ],
  },
};

module.exports = withPWA(settings);
