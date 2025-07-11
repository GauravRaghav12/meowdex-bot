# 🐾 Meowdex - Discord Card Collection Bot

Meowdex is a Discord bot that brings the excitement of card collection to your server! Collect magical cat cards, trade with friends, and build the ultimate feline collection.

## ✨ Features

- **Daily Rewards**: Claim daily coins and free cards
- **Card Collection**: Collect cards with different rarities and elements
- **Card Drops**: Drop cards for other users to grab
- **Interactive Grabbing**: Quick-grab system with buttons
- **User Profiles**: View collections and balances
- **Rarity System**: Common, Rare, Epic, and Legendary cards

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Discord Developer Account

### 1. Discord Bot Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application and name it "Meowdex"
3. Go to the "Bot" section and create a bot
4. Copy the bot token
5. In the "OAuth2" section, generate an invite URL with:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Use Slash Commands`, `Embed Links`

### 2. Database Setup

1. Install PostgreSQL and create a new database called `meowdex_db`
2. Note your database connection details

### 3. Project Setup

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```env
   DISCORD_TOKEN=your_discord_bot_token_here
   CLIENT_ID=your_discord_application_id_here
   DATABASE_URL="postgresql://username:password@localhost:5432/meowdex_db"
   ```

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Start the bot:
   ```bash
   npm start
   ```

## 🎮 Commands

- `/daily` - Claim your daily coins and get a free card
- `/view [user]` - View your or another user's card collection
- `/drop` - Drop a random card for others to grab (costs 50 coins)
- `/grab` - Grab a dropped card before it disappears
- `/balance [user]` - Check coin balance
- `/help` - Show help information

## 🃏 Card System

### Rarities
- **Common** (60% drop rate) - 10 coins value
- **Rare** (25% drop rate) - 25 coins value  
- **Epic** (12% drop rate) - 50 coins value
- **Legendary** (3% drop rate) - 100 coins value

### Elements
- Magic, Fire, Water, Earth, Air, Dark, Light, Ice

### Card Templates
- Mystic Cat, Fire Kitten, Water Lynx, Earth Tiger
- Wind Panther, Shadow Leopard, Light Lion, Ice Bobcat

## 🛠️ Development

### Scripts
- `npm start` - Start the bot
- `npm run dev` - Start with nodemon for development
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Prisma Studio

### Database Schema
The bot uses Prisma with PostgreSQL and includes:
- **Users**: Discord user data, coins, last daily claim
- **Cards**: Card collection with stats and ownership
- **Drops**: Active card drops in channels

## 📝 License

MIT License - feel free to modify and use for your own Discord servers!

## 🐱 Contributing

Contributions are welcome! Feel free to submit issues and pull requests to make Meowdex even better.

---

