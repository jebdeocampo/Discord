const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');
const player = require('../../music/player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoplay')
    .setDescription('Toggle autoplay for the current server'),

  async execute(interaction) {
    const queue = player.getQueue(interaction.guild.id);

    if (!queue || (!queue.current && !queue.songs.length)) {
      return interaction.reply({ content: '❌ Nothing is playing right now.', ephemeral: true });
    }

    const state = player.toggleAutoplay(interaction.guild);
    const embed = new EmbedBuilder()
      .setColor('Blue')
      .setDescription(`🔁 Autoplay is now **${state ? 'enabled' : 'disabled'}**.`);

    await interaction.reply({ embeds: [embed] });
  }
};