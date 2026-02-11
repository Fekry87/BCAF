import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                cookieDomainRewrite: 'localhost',
                configure: function (proxy) {
                    proxy.on('proxyRes', function (proxyRes) {
                        // Ensure cookies are passed through
                        var cookies = proxyRes.headers['set-cookie'];
                        if (cookies) {
                            proxyRes.headers['set-cookie'] = cookies.map(function (cookie) {
                                return cookie.replace(/; secure/gi, '');
                            });
                        }
                    });
                },
            },
        },
    },
    build: {
        // Optimize chunk size warnings threshold
        chunkSizeWarningLimit: 500,
        // Enable source maps for production debugging (optional)
        sourcemap: false,
        // Minification settings
        minify: 'esbuild',
        // Target modern browsers for smaller bundles
        target: 'es2020',
        rollupOptions: {
            output: {
                // Manual chunk splitting for better caching
                manualChunks: {
                    // React core - changes rarely
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    // React Query - separate for caching
                    'vendor-query': ['@tanstack/react-query'],
                    // UI utilities
                    'vendor-ui': ['react-hot-toast', 'lucide-react'],
                    // Form handling
                    'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
                },
                // Consistent chunk naming for better caching
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
            },
        },
    },
    // Optimize dependency pre-bundling
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            '@tanstack/react-query',
            'react-hot-toast',
            'lucide-react',
            'react-hook-form',
            'zod',
        ],
    },
});
