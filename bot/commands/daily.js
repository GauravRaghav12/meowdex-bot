const { SlashCommandBuilder } = require('discord.js');
const { ensureUser, addCardToUser, updateUserCoins, updateLastDaily, prisma } = require('../utils/database');
const { getRandomCard, CARDS } = require('../utils/cards');
const { createDailyRewardEmbed, createDailyCooldownEmbed } = require('../utils/embeds');
const config = require('../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily coins and free card!'),

  async execute(interaction) {
    const user = await ensureUser(interaction.user.id, interaction.user.username);
    
    const now = new Date();
    const lastDaily = user.lastDaily;
    
    if (lastDaily) {
      const timeDiff = now - lastDaily;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff < config.daily.cooldownHours) {
        const hoursLeft = Math.ceil(config.daily.cooldownHours - hoursDiff);
        const embed = createDailyCooldownEmbed(hoursLeft);
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
    
    // Give daily rewards
    const coinsEarned = Math.floor(Math.random() * (config.daily.maxCoins - config.daily.minCoins + 1)) + config.daily.minCoins;
    const freeCard = getRandomCard();
    
    // Update user coins and last daily
    await updateUserCoins(user.id, coinsEarned);
    await updateLastDaily(user.id);
    
    // Add the free card to user's collection
    const cardInDb = await prisma.card.findFirst({
      where: { name: freeCard.name }
    });
    
    if (cardInDb) {
      await addCardToUser(user.id, cardInDb.id, 1);
    }
    
    const embed = createDailyRewardEmbed(coinsEarned, freeCard);
    await interaction.reply({ embeds: [embed] });
  },
};