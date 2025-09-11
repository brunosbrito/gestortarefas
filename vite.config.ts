import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'gestortarefas',
      filename: 'remoteEntry.js',
      exposes: {
        './TaskApp': './src/components/TaskApp.tsx',
        './SimpleTest': './src/components/SimpleTest.tsx',
      },
      shared: {
        react: { 
          singleton: true, 
          requiredVersion: "^18.3.1",
          strictVersion: false
        },
        'react-dom': { 
          singleton: true, 
          requiredVersion: "^18.3.1",
          strictVersion: false
        },
        'react-router-dom': { 
          singleton: true, 
          requiredVersion: "^6.30.1",
          strictVersion: false
        },
      },
    }),
  ],

  server: {
    port: 8080,
    host: '0.0.0.0',
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    fs: {
      allow: ['..']
    }
  },

  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      external: [],
    }
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  define: {
    global: 'globalThis',
  },
});
