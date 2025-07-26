const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config/config');
const { loadCommands, getCommandsForRegistration } = require('./utils/commandHandler');
const { ensureCardsExist, prisma } = require('./utils/database');
const { CARDS } = require('./utils/cards');
const { grabCard } = require('./commands/grab');
const { createErrorEmbed } = require('./utils/embeds');

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Load all commands
const commands = loadCommands();

client.once('ready', async () => {
  console.log(`🐾 ${config.bot.name} v${config.bot.version} is ready!`);
  console.log(`📊 Logged in as ${client.user.tag}`);
  console.log(`🎮 Serving ${client.guilds.cache.size} guilds`);
  
  try {
    // Ensure all cards exist in database
    await ensureCardsExist(CARDS);
    console.log('✅ Card database initialized');
    
    // Register slash commands
    const commandData = getCommandsForRegistration(commands);
    console.log('🔄 Refreshing application (/) commands...');
    
    await client.application.commands.set(commandData);
    console.log(`✅ Successfully registered ${commandData.length} application (/) commands`);
    
  } catch (error) {
    console.error('❌ Error during startup:', error);
  }
});

// Handle interactions (slash commands and button clicks)
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;
  
  try {
    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(interaction);
    } else if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    }
  } catch (error) {
    console.error('❌ Error handling interaction:', error);
    
    const errorEmbed = createErrorEmbed(
      'Something went wrong!', 
      'An error occurred while processing your request. Please try again later.'
    );
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    } else if (interaction.deferred) {
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
});

// Handle slash commands
async function handleSlashCommand(interaction) {
  const command = commands.get(interaction.commandName);
  
  if (!command) {
    console.error(`❌ No command matching ${interaction.commandName} was found.`);
    return;
  }
  
  console.log(`🎮 ${interaction.user.tag} used /${interaction.commandName} in ${interaction.guild?.name || 'DM'}`);
  await command.execute(interaction);
}

// Handle button interactions
async function handleButtonInteraction(interaction) {
  if (interaction.customId.startsWith('grab_')) {
    await handleGrabButton(interaction);
  }
}

// Handle grab button clicks
async function handleGrabButton(interaction) {
  const dropId = interaction.customId.split('_')[1];
  
  const drop = await prisma.cardDrop.findUnique({
    where: { id: dropId },
    include: { card: true, dropper: true }
  });
  
  if (!drop || !drop.isActive || drop.expiresAt < new Date()) {
    const embed = createErrorEmbed('Drop Expired', 'This card drop has expired!');
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
  
  await grabCard(interaction, drop);
}

// Handle process termination gracefully
async function gracefulShutdown() {
  console.log('🔄 Shutting down gracefully...');
  
  try {
    await prisma.$disconnect();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
  }
  
  process.exit(0);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown();
});

// Login to Discord
client.login(config.discord.token).catch(error => {
  console.error('❌ Failed to login to Discord:', error);
  process.exit(1);
});