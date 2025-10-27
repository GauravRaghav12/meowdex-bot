const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ensureUser, removeCardFromUser, prisma } = require('../utils/database');
const { findCardByName } = require('../utils/cards');
const { createCardDropEmbed, createErrorEmbed } = require('../utils/embeds');
const config = require('../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('drop')
    .setDescription('Drop a card for others to grab')
    .addStringOption(option =>
      option.setName('card')
        .setDescription('Name of the card to drop')
        .setRequired(true)),

  async execute(interaction) {
    const cardName = interaction.options.getString('card');
    const user = await ensureUser(interaction.user.id, interaction.user.username);
    
    // Find the card in database
    const card = await prisma.card.findFirst({
      where: { name: { contains: cardName, mode: 'insensitive' } }
    });
    
    if (!card) {
      const embed = createErrorEmbed('Card Not Found', 'Card not found! Use `/view` to see your collection.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
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
      const embed = createErrorEmbed('Card Not Owned', 'You don\'t own this card!');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    // Create the drop
    const expiresAt = new Date(Date.now() + config.drops.expirationTime);
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
    await removeCardFromUser(user.id, card.id, 1);
    
    const embed = createCardDropEmbed(card, interaction.user.username);
    
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
    }, config.drops.expirationTime);
  },
};