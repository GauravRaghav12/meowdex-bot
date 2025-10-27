const { SlashCommandBuilder } = require('discord.js');
const { ensureUser } = require('../utils/database');
const { createBalanceEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your coin balance'),

  async execute(interaction) {
    const user = await ensureUser(interaction.user.id, interaction.user.username);
    
    const embed = createBalanceEmbed(user.coins);
    await interaction.reply({ embeds: [embed] });
  },
};