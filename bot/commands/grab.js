const { SlashCommandBuilder } = require('discord.js');
const { ensureUser, addCardToUser, prisma } = require('../utils/database');
const { createCardGrabbedEmbed, createErrorEmbed } = require('../utils/embeds');

async function grabCard(interaction, drop) {
  const user = await ensureUser(interaction.user.id, interaction.user.username);
  
  // Check if user is trying to grab their own drop
  if (drop.dropperId === user.id) {
    const embed = createErrorEmbed('Cannot Grab Own Card', 'You can\'t grab your own card drop!');
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
  
  // Deactivate the drop
  await prisma.cardDrop.update({
    where: { id: drop.id },
    data: { isActive: false }
  });
  
  // Add card to user's collection
  await addCardToUser(user.id, drop.card.id, 1);
  
  const embed = createCardGrabbedEmbed(drop.card, interaction.user.username);
  await interaction.reply({ embeds: [embed] });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('grab')
    .setDescription('Grab the most recent card drop'),

  async execute(interaction) {
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
      const embed = createErrorEmbed('No Active Drops', 'No active card drops in this channel!');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    await grabCard(interaction, drop);
  },

  // Export the grabCard function for use in button interactions
  grabCard
};