const { EmbedBuilder } = require('discord.js');
const { getRarityColor, getRarityEmoji, getElementEmoji } = require('./cards');

// Create daily reward embed
function createDailyRewardEmbed(coinsEarned, card) {
  return new EmbedBuilder()
    .setTitle('🎁 Daily Reward Claimed!')
    .setDescription(`You received **${coinsEarned} coins** and a **${card.name}**!`)
    .addFields(
      { name: 'Card Received', value: `${getRarityEmoji(card.rarity)} ${card.name} ${getElementEmoji(card.element)}`, inline: true },
      { name: 'Power', value: card.power.toString(), inline: true },
      { name: 'Element', value: card.element, inline: true }
    )
    .setColor(getRarityColor(card.rarity))
    .setTimestamp();
}

// Create daily cooldown embed
function createDailyCooldownEmbed(hoursLeft) {
  return new EmbedBuilder()
    .setTitle('⏰ Daily Cooldown')
    .setDescription(`You can claim your daily reward in **${hoursLeft} hours**!`)
    .setColor(0xff6b6b)
    .setTimestamp();
}

// Create collection embed
function createCollectionEmbed(targetUser, userCards, coins) {
  if (userCards.length === 0) {
    return new EmbedBuilder()
      .setTitle(`${targetUser.username}'s Collection`)
      .setDescription('No cards collected yet! Use `/daily` to get your first card.')
      .setColor(0x808080)
      .setTimestamp();
  }

  const { groupCardsByRarity } = require('./cards');
  const cardsByRarity = groupCardsByRarity(userCards);
  
  const embed = new EmbedBuilder()
    .setTitle(`${targetUser.username}'s Collection`)
    .setDescription(`**Total Cards:** ${userCards.reduce((sum, uc) => sum + uc.count, 0)}\n**Coins:** ${coins}`)
    .setColor(0x00ff00)
    .setTimestamp();

  // Add rarity sections in order
  const rarityOrder = ['Common', 'Rare', 'Epic', 'Legendary'];
  for (const rarity of rarityOrder) {
    if (cardsByRarity[rarity]) {
      embed.addFields({
        name: `${getRarityEmoji(rarity)} ${rarity} Cards`,
        value: cardsByRarity[rarity].join('\n'),
        inline: true
      });
    }
  }

  return embed;
}

// Create card drop embed
function createCardDropEmbed(card, username) {
  return new EmbedBuilder()
    .setTitle('🎁 Card Dropped!')
    .setDescription(`**${card.name}** has been dropped by ${username}!`)
    .addFields(
      { name: 'Rarity', value: `${getRarityEmoji(card.rarity)} ${card.rarity}`, inline: true },
      { name: 'Power', value: card.power.toString(), inline: true },
      { name: 'Element', value: `${getElementEmoji(card.element)} ${card.element}`, inline: true },
      { name: 'Description', value: card.description, inline: false }
    )
    .setColor(getRarityColor(card.rarity))
    .setFooter({ text: 'Click the button below to grab this card! Expires in 5 minutes.' })
    .setTimestamp();
}

// Create card grabbed embed
function createCardGrabbedEmbed(card, username) {
  return new EmbedBuilder()
    .setTitle('🎉 Card Grabbed!')
    .setDescription(`${username} grabbed **${card.name}**!`)
    .addFields(
      { name: 'Rarity', value: `${getRarityEmoji(card.rarity)} ${card.rarity}`, inline: true },
      { name: 'Power', value: card.power.toString(), inline: true },
      { name: 'Element', value: `${getElementEmoji(card.element)} ${card.element}`, inline: true }
    )
    .setColor(getRarityColor(card.rarity))
    .setTimestamp();
}

// Create balance embed
function createBalanceEmbed(coins) {
  return new EmbedBuilder()
    .setTitle('💰 Coin Balance')
    .setDescription(`You have **${coins} coins**!`)
    .setColor(0xffd700)
    .setTimestamp();
}

// Create help embed
function createHelpEmbed() {
  return new EmbedBuilder()
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
      { name: 'Card Rarities', value: '⚪ Common → 🔵 Rare → 🟣 Epic → 🟡 Legendary', inline: false },
      { name: 'Elements', value: '🔥 Fire, 💧 Water, 🌍 Earth, 💨 Air, ⚡ Lightning, ❄️ Ice, 🌑 Shadow, ✨ Cosmic', inline: false }
    )
    .setColor(0x00ff00)
    .setTimestamp();
}

// Create error embed
function createErrorEmbed(title, description) {
  return new EmbedBuilder()
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setColor(0xff0000)
    .setTimestamp();
}

// Create success embed
function createSuccessEmbed(title, description) {
  return new EmbedBuilder()
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setColor(0x00ff00)
    .setTimestamp();
}

module.exports = {
  createDailyRewardEmbed,
  createDailyCooldownEmbed,
  createCollectionEmbed,
  createCardDropEmbed,
  createCardGrabbedEmbed,
  createBalanceEmbed,
  createHelpEmbed,
  createErrorEmbed,
  createSuccessEmbed
};