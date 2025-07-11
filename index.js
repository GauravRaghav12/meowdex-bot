const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const prisma = new PrismaClient();

// Card data with different rarities and elements
const CARDS = [
  { name: 'Fire Cat', description: 'A fierce feline with blazing claws', element: 'Fire', rarity: 'Common', power: 100 },
  { name: 'Water Cat', description: 'A graceful cat that controls the tides', element: 'Water', rarity: 'Common', power: 110 },
  { name: 'Earth Cat', description: 'A sturdy cat with rock-solid defense', element: 'Earth', rarity: 'Common', power: 120 },
  { name: 'Air Cat', description: 'A swift cat that rides the wind', element: 'Air', rarity: 'Common', power: 105 },
  { name: 'Lightning Cat', description: 'An electrifying feline with shocking speed', element: 'Lightning', rarity: 'Rare', power: 200 },
  { name: 'Ice Cat', description: 'A cool cat that freezes enemies solid', element: 'Ice', rarity: 'Rare', power: 210 },
  { name: 'Shadow Cat', description: 'A mysterious cat that lurks in darkness', element: 'Shadow', rarity: 'Epic', power: 350 },
  { name: 'Cosmic Cat', description: 'A legendary cat from the stars above', element: 'Cosmic', rarity: 'Legendary', power: 500 },
];

// Rarity weights for card drops
const RARITY_WEIGHTS = {
  'Common': 60,
  'Rare': 25,
  'Epic': 12,
  'Legendary': 3
};

// Helper function to get random card based on rarity weights
function getRandomCard() {
  const totalWeight = Object.values(RARITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    random -= weight;
    if (random <= 0) {
      const cardsOfRarity = CARDS.filter(card => card.rarity === rarity);
      return cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
    }
  }
  
  return CARDS[0]; // Fallback to first card
}

// Helper function to get rarity color
function getRarityColor(rarity) {
  const colors = {
    'Common': 0x808080,
    'Rare': 0x0099ff,
    'Epic': 0x9932cc,
    'Legendary': 0xffd700
  };
  return colors[rarity] || 0x808080;
}

// Helper function to ensure user exists in database
async function ensureUser(discordId, username) {
  let user = await prisma.user.findUnique({
    where: { discordId }
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        discordId,
        username,
        coins: 100
      }
    });
  }
  
  return user;
}

// Helper function to ensure cards exist in database
async function ensureCardsExist() {
  for (const cardData of CARDS) {
    const existingCard = await prisma.card.findFirst({
      where: { name: cardData.name }
    });
    
    if (!existingCard) {
      await prisma.card.create({
        data: cardData
      });
    }
  }
}

client.once('ready', async () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
  
  // Ensure all cards exist in database
  await ensureCardsExist();
  
  // Register slash commands
  const commands = [
    new SlashCommandBuilder()
      .setName('daily')
      .setDescription('Claim your daily coins and free card!'),
    
    new SlashCommandBuilder()
      .setName('view')
      .setDescription('View your card collection')
      .addUserOption(option =>
        option.setName('user')
          .setDescription('View another user\'s collection')
          .setRequired(false)),
    
    new SlashCommandBuilder()
      .setName('drop')
      .setDescription('Drop a card for others to grab')
      .addStringOption(option =>
        option.setName('card')
          .setDescription('Name of the card to drop')
          .setRequired(true)),
    
    new SlashCommandBuilder()
      .setName('grab')
      .setDescription('Grab the most recent card drop'),
    
    new SlashCommandBuilder()
      .setName('balance')
      .setDescription('Check your coin balance'),
    
    new SlashCommandBuilder()
      .setName('help')
      .setDescription('Get help with Meowdex commands')
  ];
  
  try {
    console.log('Started refreshing application (/) commands.');
    await client.application.commands.set(commands);
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;
  
  try {
    if (interaction.isChatInputCommand()) {
      const { commandName } = interaction;
      
      if (commandName === 'daily') {
        await handleDaily(interaction);
      } else if (commandName === 'view') {
        await handleView(interaction);
      } else if (commandName === 'drop') {
        await handleDrop(interaction);
      } else if (commandName === 'grab') {
        await handleGrab(interaction);
      } else if (commandName === 'balance') {
        await handleBalance(interaction);
      } else if (commandName === 'help') {
        await handleHelp(interaction);
      }
    } else if (interaction.isButton()) {
      if (interaction.customId.startsWith('grab_')) {
        await handleGrabButton(interaction);
      }
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
    }
  }
});

async function handleDaily(interaction) {
  const user = await ensureUser(interaction.user.id, interaction.user.username);
  
  const now = new Date();
  const lastDaily = user.lastDaily;
  
  if (lastDaily) {
    const timeDiff = now - lastDaily;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
      const hoursLeft = Math.ceil(24 - hoursDiff);
      const embed = new EmbedBuilder()
        .setTitle('⏰ Daily Cooldown')
        .setDescription(`You can claim your daily reward in **${hoursLeft} hours**!`)
        .setColor(0xff6b6b);
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
  
  // Give daily rewards
  const coinsEarned = Math.floor(Math.random() * 50) + 50; // 50-100 coins
  const freeCard = getRandomCard();
  
  // Update user coins and last daily
  await prisma.user.update({
    where: { id: user.id },
    data: {
      coins: user.coins + coinsEarned,
      lastDaily: now
    }
  });
  
  // Add the free card to user's collection
  const cardInDb = await prisma.card.findFirst({
    where: { name: freeCard.name }
  });
  
  if (cardInDb) {
    const existingUserCard = await prisma.userCard.findUnique({
      where: {
        userId_cardId: {
          userId: user.id,
          cardId: cardInDb.id
        }
      }
    });
    
    if (existingUserCard) {
      await prisma.userCard.update({
        where: { id: existingUserCard.id },
        data: { count: existingUserCard.count + 1 }
      });
    } else {
      await prisma.userCard.create({
        data: {
          userId: user.id,
          cardId: cardInDb.id,
          count: 1
        }
      });
    }
  }
  
  const embed = new EmbedBuilder()
    .setTitle('🎁 Daily Reward Claimed!')
    .setDescription(`You received **${coinsEarned} coins** and a **${freeCard.name}**!`)
    .addFields(
      { name: 'Card Received', value: `${freeCard.name} (${freeCard.rarity})`, inline: true },
      { name: 'Power', value: freeCard.power.toString(), inline: true },
      { name: 'Element', value: freeCard.element, inline: true }
    )
    .setColor(getRarityColor(freeCard.rarity));
  
  await interaction.reply({ embeds: [embed] });
}

async function handleView(interaction) {
  const targetUser = interaction.options.getUser('user') || interaction.user;
  const user = await ensureUser(targetUser.id, targetUser.username);
  
  const userCards = await prisma.userCard.findMany({
    where: { userId: user.id },
    include: { card: true },
    orderBy: { card: { rarity: 'asc' } }
  });
  
  if (userCards.length === 0) {
    const embed = new EmbedBuilder()
      .setTitle(`${targetUser.username}'s Collection`)
      .setDescription('No cards collected yet! Use `/daily` to get your first card.')
      .setColor(0x808080);
    
    return interaction.reply({ embeds: [embed] });
  }
  
  const cardsByRarity = {};
  userCards.forEach(userCard => {
    const rarity = userCard.card.rarity;
    if (!cardsByRarity[rarity]) cardsByRarity[rarity] = [];
    cardsByRarity[rarity].push(`${userCard.card.name} x${userCard.count}`);
  });
  
  const embed = new EmbedBuilder()
    .setTitle(`${targetUser.username}'s Collection`)
    .setDescription(`**Total Cards:** ${userCards.reduce((sum, uc) => sum + uc.count, 0)}\n**Coins:** ${user.coins}`)
    .setColor(0x00ff00);
  
  for (const [rarity, cards] of Object.entries(cardsByRarity)) {
    embed.addFields({
      name: `${rarity} Cards`,
      value: cards.join('\n'),
      inline: true
    });
  }
  
  await interaction.reply({ embeds: [embed] });
}

async function handleDrop(interaction) {
  const cardName = interaction.options.getString('card');
  const user = await ensureUser(interaction.user.id, interaction.user.username);
  
  // Find the card in database
  const card = await prisma.card.findFirst({
    where: { name: { contains: cardName, mode: 'insensitive' } }
  });
  
  if (!card) {
    return interaction.reply({ content: 'Card not found! Use `/view` to see your collection.', ephemeral: true });
  }
  
  // Check if user owns this card
  const userCard = await prisma.userCard.findUnique({
    where: {
      userId_cardId: {
        userId: user.id,
        cardId: card.id
      }
    }
  });
  
  if (!userCard || userCard.count === 0) {
    return interaction.reply({ content: 'You don\'t own this card!', ephemeral: true });
  }
  
  // Create the drop
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  const drop = await prisma.cardDrop.create({
    data: {
      cardId: card.id,
      dropperId: user.id,
      channelId: interaction.channel.id,
      expiresAt,
      isActive: true
    }
  });
  
  // Remove card from user's collection
  if (userCard.count === 1) {
    await prisma.userCard.delete({
      where: { id: userCard.id }
    });
  } else {
    await prisma.userCard.update({
      where: { id: userCard.id },
      data: { count: userCard.count - 1 }
    });
  }
  
  const embed = new EmbedBuilder()
    .setTitle('🎁 Card Dropped!')
    .setDescription(`**${card.name}** has been dropped by ${interaction.user.username}!`)
    .addFields(
      { name: 'Rarity', value: card.rarity, inline: true },
      { name: 'Power', value: card.power.toString(), inline: true },
      { name: 'Element', value: card.element, inline: true }
    )
    .setColor(getRarityColor(card.rarity))
    .setFooter({ text: 'Click the button below to grab this card! Expires in 5 minutes.' });
  
  const button = new ButtonBuilder()
    .setCustomId(`grab_${drop.id}`)
    .setLabel('Grab Card!')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('🐾');
  
  const row = new ActionRowBuilder().addComponents(button);
  
  await interaction.reply({ embeds: [embed], components: [row] });
  
  // Set timeout to deactivate drop
  setTimeout(async () => {
    try {
      await prisma.cardDrop.update({
        where: { id: drop.id },
        data: { isActive: false }
      });
    } catch (error) {
      console.error('Error deactivating drop:', error);
    }
  }, 5 * 60 * 1000);
}

async function handleGrab(interaction) {
  // Find the most recent active drop in this channel
  const drop = await prisma.cardDrop.findFirst({
    where: {
      channelId: interaction.channel.id,
      isActive: true,
      expiresAt: { gt: new Date() }
    },
    include: { card: true, dropper: true },
    orderBy: { createdAt: 'desc' }
  });
  
  if (!drop) {
    return interaction.reply({ content: 'No active card drops in this channel!', ephemeral: true });
  }
  
  await grabCard(interaction, drop);
}

async function handleGrabButton(interaction) {
  const dropId = interaction.customId.split('_')[1];
  
  const drop = await prisma.cardDrop.findUnique({
    where: { id: dropId },
    include: { card: true, dropper: true }
  });
  
  if (!drop || !drop.isActive || drop.expiresAt < new Date()) {
    return interaction.reply({ content: 'This card drop has expired!', ephemeral: true });
  }
  
  await grabCard(interaction, drop);
}

async function grabCard(interaction, drop) {
  const user = await ensureUser(interaction.user.id, interaction.user.username);
  
  // Check if user is trying to grab their own drop
  if (drop.dropperId === user.id) {
    return interaction.reply({ content: 'You can\'t grab your own card drop!', ephemeral: true });
  }
  
  // Deactivate the drop
  await prisma.cardDrop.update({
    where: { id: drop.id },
    data: { isActive: false }
  });
  
  // Add card to user's collection
  const existingUserCard = await prisma.userCard.findUnique({
    where: {
      userId_cardId: {
        userId: user.id,
        cardId: drop.card.id
      }
    }
  });
  
  if (existingUserCard) {
    await prisma.userCard.update({
      where: { id: existingUserCard.id },
      data: { count: existingUserCard.count + 1 }
    });
  } else {
    await prisma.userCard.create({
      data: {
        userId: user.id,
        cardId: drop.card.id,
        count: 1
      }
    });
  }
  
  const embed = new EmbedBuilder()
    .setTitle('🎉 Card Grabbed!')
    .setDescription(`${interaction.user.username} grabbed **${drop.card.name}**!`)
    .addFields(
      { name: 'Rarity', value: drop.card.rarity, inline: true },
      { name: 'Power', value: drop.card.power.toString(), inline: true },
      { name: 'Element', value: drop.card.element, inline: true }
    )
    .setColor(getRarityColor(drop.card.rarity));
  
  await interaction.reply({ embeds: [embed] });
}

async function handleBalance(interaction) {
  const user = await ensureUser(interaction.user.id, interaction.user.username);
  
  const embed = new EmbedBuilder()
    .setTitle('💰 Coin Balance')
    .setDescription(`You have **${user.coins} coins**!`)
    .setColor(0xffd700);
  
  await interaction.reply({ embeds: [embed] });
}

async function handleHelp(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('🐾 Meowdex Help')
    .setDescription('Welcome to Meowdex! Collect magical cat cards and build your collection.')
    .addFields(
      { name: '/daily', value: 'Claim daily coins and a free card (24h cooldown)', inline: false },
      { name: '/view [user]', value: 'View your card collection or another user\'s', inline: false },
      { name: '/drop <card>', value: 'Drop a card for others to grab', inline: false },
      { name: '/grab', value: 'Grab the most recent card drop', inline: false },
      { name: '/balance', value: 'Check your coin balance', inline: false },
      { name: '/help', value: 'Show this help message', inline: false }
    )
    .addFields(
      { name: 'Card Rarities', value: 'Common → Rare → Epic → Legendary', inline: false },
      { name: 'Elements', value: 'Fire, Water, Earth, Air, Lightning, Ice, Shadow, Cosmic', inline: false }
    )
    .setColor(0x00ff00);
  
  await interaction.reply({ embeds: [embed] });
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);