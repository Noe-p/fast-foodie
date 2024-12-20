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
      urlPattern: /^\/files\/.*\.(png|jpg|jpeg|svg|gif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'local-images-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
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
        protocol: 'https',
        hostname: 'www.jambase.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = withPWA(settings);
