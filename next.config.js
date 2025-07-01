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
    // Cache pour les API locales (backend local)
    {
      urlPattern: /^http:\/\/localhost:8000\/api\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'local-api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60, // 1 heure
        },
        networkTimeoutSeconds: 10, // Timeout de 10 secondes
      },
    },
    // Cache pour les API Next.js
    {
      urlPattern: /^\/api\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'nextjs-api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60, // 1 heure
        },
        networkTimeoutSeconds: 10,
      },
    },
    // Cache pour les assets statiques
    {
      urlPattern:
        /\.(?:js|css|html|json|webp|svg|png|jpg|jpeg|woff2?|ttf|eot)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-assets-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 heures
        },
      },
    },
  ],
  // Configuration pour les fallbacks hors-ligne
  fallbacks: {
    // Pas de page offline.html comme demandé
  },
  // Optimisations supplémentaires
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  sourcemap: false,
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
