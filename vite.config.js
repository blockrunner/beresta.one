import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Функция для получения всех HTML файлов в pages/
function getPages() {
  const pages = {};
  const pagesDir = resolve(__dirname, 'pages');
  
  if (fs.existsSync(pagesDir)) {
    const dirs = fs.readdirSync(pagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    dirs.forEach(dir => {
      const indexPath = resolve(pagesDir, dir, 'index.html');
      if (fs.existsSync(indexPath)) {
        pages[dir] = indexPath;
      }
    });
  }
  
  return pages;
}

export default defineConfig({
  root: '.',
  base: '/',
  
  server: {
    port: 8100,
    host: '0.0.0.0',
    open: true,
    cors: true,
    proxy: {
      '/app/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/app\/api/, '/api')
      }
    }
  },

  // Настройка для обработки красивых URL (MPA routing)
  appType: 'mpa', // Multi-Page Application

  preview: {
    port: 8100,
    host: '0.0.0.0',
    cors: true
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app/index.html'),
        ...getPages() // Добавляем все страницы из pages/
      },
      output: {
        manualChunks: {
          vendor: ['eslint', 'prettier']
        }
      }
    }
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@app': resolve(__dirname, './app'),
      '@site': resolve(__dirname, './site'),
      '@shared': resolve(__dirname, './shared')
    }
  },

  css: {
    devSourcemap: true
  },

  optimizeDeps: {
    include: ['eslint', 'prettier']
  }
});
