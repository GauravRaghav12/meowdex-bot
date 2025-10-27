const { SlashCommandBuilder } = require('discord.js');
const { ensureUser, getUserCollection } = require('../utils/database');
const { createCollectionEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('view')
    .setDescription('View your card collection')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('View another user\'s collection')
        .setRequired(false)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const user = await ensureUser(targetUser.id, targetUser.username);
    
    const userCards = await getUserCollection(user.id);
    
    const embed = createCollectionEmbed(targetUser, userCards, user.coins);
    await interaction.reply({ embeds: [embed] });
  },
};