import { createServer } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Функция для получения всех HTML файлов в pages/
function getPages() {
  const pages = {};
  const pagesDir = resolve(process.cwd(), 'pages');
  
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

async function createDevServer() {
  const server = await createServer({
    root: '.',
    base: '/',
    
    server: {
      port: 8100,
      host: '0.0.0.0',
      open: false, // Отключаем автопереход в браузере
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

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      minify: 'terser',
      rollupOptions: {
        input: {
          main: resolve(process.cwd(), 'index.html'),
          app: resolve(process.cwd(), 'app/index.html'),
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
        '@': resolve(process.cwd(), './'),
        '@app': resolve(process.cwd(), './app'),
        '@site': resolve(process.cwd(), './site'),
        '@shared': resolve(process.cwd(), './shared')
      }
    },

    css: {
      devSourcemap: true
    },

    optimizeDeps: {
      include: ['eslint', 'prettier']
    }
  });

  // Middleware для обработки красивых URL
  server.middlewares.use((req, res, next) => {
    const url = req.url;
    
    // Если это запрос к API, пропускаем
    if (url.startsWith('/app/api') || url.startsWith('/api')) {
      return next();
    }
    
    // Если это статический файл (CSS, JS, изображения), пропускаем
    if (url.includes('.') && !url.endsWith('/')) {
      return next();
    }
    
    // Проверяем, есть ли соответствующий HTML файл в pages/
    const pages = getPages();
    const pathSegments = url.split('/').filter(Boolean);
    
    if (pathSegments.length === 1) {
      const pageName = pathSegments[0];
      if (pages[pageName]) {
        // Перенаправляем на соответствующий HTML файл
        req.url = `/pages/${pageName}/index.html`;
        return next();
      }
    }
    
    // Если это корневой путь или не найденная страница, показываем главную
    if (url === '/' || url === '') {
      req.url = '/index.html';
      return next();
    }
    
    // Для всех остальных случаев показываем главную страницу
    req.url = '/index.html';
    next();
  });

  await server.listen();
  
  console.log('🚀 Vite dev server running on http://localhost:8100');
  console.log('📍 Available pages:');
  Object.keys(getPages()).forEach(page => {
    console.log(`   - http://localhost:8100/${page}/`);
  });
}

createDevServer().catch(console.error);
