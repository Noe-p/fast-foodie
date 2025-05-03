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
        /^https:\/\/api\.fast-foodie\.sakana-san\.fr\/files\/.*\.(png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'external-images-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        },
      },
    },
    // Autres configurations de mise en cache
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
