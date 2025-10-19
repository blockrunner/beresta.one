module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 80,
    host: process.env.HOST || '0.0.0.0'
  },

  // API configuration
  api: {
    port: process.env.API_PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    rateLimit: {
      windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 50 // Stricter in production
    }
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://beresta.one',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },

  // Bluetooth configuration
  bluetooth: {
    deviceName: process.env.BLUETOOTH_DEVICE_NAME || 'WEB-CLIENT',
    service: parseInt(process.env.BLUETOOTH_SERVICE) || 0xFFE0,
    characteristic: parseInt(process.env.BLUETOOTH_CHARACTERISTIC) || 0xFFE1
  },

  // File storage configuration
  storage: {
    dataDir: process.env.DATA_DIR || '/var/lib/beresta/data',
    queueFile: 'queue_data.json',
    logsFile: 'logs.log'
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'warn',
    timezone: process.env.LOG_TIMEZONE || 'Europe/Saratov'
  },

  // Security configuration
  security: {
    sessionSecret: process.env.SESSION_SECRET || (() => {
      throw new Error('SESSION_SECRET must be set in production');
    })(),
    apiKey: process.env.API_KEY || (() => {
      throw new Error('API_KEY must be set in production');
    })()
  },

  // Environment
  env: process.env.NODE_ENV || 'production',
  
  // Production specific settings
  prod: {
    hotReload: false,
    debugMode: false,
    verboseLogging: false,
    compression: true,
    caching: true
  }
};
