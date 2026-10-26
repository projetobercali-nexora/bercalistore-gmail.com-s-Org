import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifestFilename: 'manifest.webmanifest',
        includeAssets: [
          'offline.html',
          'assets/aistudio/file_00000000d4ac8243a4a41ff6e2cc5b63_b707e5fc.png',
        ],
        manifest: {
          id: '/',
          name: 'Bercali Store',
          short_name: 'Bercali',
          description: 'O futuro das compras começa aqui. Loja virtual da Bercali Store em Angola.',
          lang: 'pt',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: '#0A0A0A',
          theme_color: '#0A0A0A',
          orientation: 'portrait-primary',
          icons: [
            {
              src: '/assets/aistudio/file_00000000d4ac8243a4a41ff6e2cc5b63_b707e5fc.png',
              sizes: '1254x1254',
              type: 'image/png',
              purpose: 'any',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          globIgnores: ['**/Manual_de_Marca_*', '**/Paste_*'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//, /\.mp4$/, /\.webm$/, /\.pdf$/],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'bercali-google-fonts-stylesheets',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'bercali-google-fonts-webfonts',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

