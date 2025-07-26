require('dotenv').config();

module.exports = {
  // Discord configuration
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    intents: [
      'Guilds',
      'GuildMessages',
      'MessageContent'
    ]
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL
  },

  // Bot settings
  bot: {
    name: 'Meowdex',
    version: '1.0.0',
    prefix: '!', // For potential message commands
    embedColor: 0x00ff00,
    defaultCoins: 100
  },

  // Card drop settings
  drops: {
    expirationTime: 5 * 60 * 1000, // 5 minutes in milliseconds
    defaultDropCost: 50 // coins
  },

  // Daily reward settings
  daily: {
    cooldownHours: 24,
    minCoins: 50,
    maxCoins: 100
  },

  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};