# 🐾 Meowdex Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js v16 or higher
- PostgreSQL database
- Discord Developer Account

### 2. Discord Bot Setup

1. **Create Discord Application**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application" and name it "Meowdex"
   - Save the Application ID (you'll need this as CLIENT_ID)

2. **Create Bot**
   - Go to the "Bot" section
   - Click "Add Bot"
   - Copy the bot token (you'll need this as DISCORD_TOKEN)
   - Enable "Message Content Intent" if you plan to use message commands

3. **Set Bot Permissions**
   - Go to OAuth2 > URL Generator
   - Select scopes: `bot`, `applications.commands`
   - Select bot permissions:
     - Send Messages
     - Use Slash Commands
     - Embed Links
     - Read Message History
     - Use External Emojis

4. **Invite Bot to Server**
   - Use the generated URL to invite your bot to a Discord server

### 3. Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb meowdex_db

# Create user (optional)
sudo -u postgres createuser --interactive
```

#### Option B: Docker PostgreSQL
```bash
docker run --name meowdex-postgres \
  -e POSTGRES_DB=meowdex_db \
  -e POSTGRES_USER=meowdex \
  -e POSTGRES_PASSWORD=yourpassword \
  -p 5432:5432 \
  -d postgres:15
```

### 4. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```env
   DISCORD_TOKEN=your_actual_bot_token
   CLIENT_ID=your_actual_application_id
   DATABASE_URL="postgresql://username:password@localhost:5432/meowdex_db"
   ```

### 5. Database Setup

```bash
# Push database schema
npm run db:push

# Optional: View database with Prisma Studio
npm run db:studio
```

### 6. Start the Bot

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

## Commands

Once running, use these slash commands in Discord:

- `/daily` - Claim daily coins and free card
- `/view [user]` - View card collection
- `/drop <card>` - Drop a card for others to grab
- `/grab` - Grab a dropped card
- `/balance` - Check coin balance
- `/help` - Show help information

## Troubleshooting

### Common Issues

1. **"Invalid Token" Error**
   - Double-check your DISCORD_TOKEN in .env
   - Make sure there are no extra spaces or quotes

2. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check DATABASE_URL format and credentials
   - Ensure database exists

3. **Commands Not Showing**
   - Bot needs "applications.commands" scope
   - May take up to 1 hour for global commands to appear
   - Try inviting bot again with correct permissions

4. **Permission Errors**
   - Bot needs Send Messages, Embed Links permissions
   - Check Discord server role hierarchy

### Logs

The bot logs important events to console. Check for:
- "Ready! Logged in as..." (successful startup)
- "Successfully reloaded application (/) commands" (commands registered)
- Database connection confirmations

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all setup steps were completed
3. Check bot permissions in Discord
4. Review console logs for error messages