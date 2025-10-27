const { SlashCommandBuilder } = require('discord.js');
const { createHelpEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help with Meowdex commands'),

  async execute(interaction) {
    const embed = createHelpEmbed();
    await interaction.reply({ embeds: [embed] });
  },
};