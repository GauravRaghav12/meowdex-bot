# 🐾 Meowdex Bot Structure

This directory contains the modular Discord bot code for Meowdex.

## 📁 Directory Structure

```
bot/
├── index.js                 # Main bot entry point
├── README.md               # This file
├── commands/               # Slash command handlers
│   ├── daily.js           # Daily reward command
│   ├── view.js            # View collection command
│   ├── drop.js            # Drop card command
│   ├── grab.js            # Grab card command
│   ├── balance.js         # Check balance command
│   └── help.js            # Help command
├── utils/                  # Utility modules
│   ├── index.js           # Central utility exports
│   ├── database.js        # Database operations
│   ├── cards.js           # Card data and logic
│   ├── embeds.js          # Discord embed builders
│   └── commandHandler.js  # Command loading system
└── config/                # Configuration
    └── config.js          # Bot configuration settings
```

## 🚀 Key Features

### Modular Design
- **Commands**: Each slash command is in its own file for easy maintenance
- **Utilities**: Reusable functions organized by purpose
- **Configuration**: Centralized settings with environment variable support

### Command System
- Dynamic command loading from the `commands/` directory
- Automatic slash command registration
- Error handling with user-friendly embeds

### Database Integration
- Prisma ORM with PostgreSQL
- User management and card collection system
- Automatic card seeding on startup

### Enhanced Error Handling
- Graceful shutdown procedures
- Comprehensive error logging
- User-friendly error messages

## 🔧 Adding New Commands

1. Create a new file in `bot/commands/` (e.g., `newcommand.js`)
2. Export an object with `data` and `execute` properties:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('newcommand')
    .setDescription('Description of your command'),

  async execute(interaction) {
    // Command logic here
    await interaction.reply('Hello!');
  },
};
```

3. The command will be automatically loaded on bot restart

## 🛠️ Adding New Utilities

1. Create or modify files in `bot/utils/`
2. Export functions from the utility module
3. Update `bot/utils/index.js` if needed for central exports
4. Import and use in commands: `const { utilityFunction } = require('../utils/database');`

## ⚙️ Configuration

Bot settings are managed in `bot/config/config.js`:

- **Discord settings**: Token, client ID, intents
- **Database settings**: Connection URL
- **Bot behavior**: Default coins, drop timers, daily cooldowns
- **Environment**: Development/production modes

## 📝 Best Practices

- Keep commands focused on a single responsibility
- Use utility functions for shared logic
- Handle errors gracefully with user feedback
- Use configuration values instead of hardcoded numbers
- Log important events for debugging

## 🐛 Debugging

The bot includes comprehensive logging:
- Command usage tracking
- Error logging with stack traces
- Startup sequence confirmation
- Database operation status

Check console output for detailed information about bot operations.