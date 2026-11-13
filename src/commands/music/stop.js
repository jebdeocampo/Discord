const { SlashCommandBuilder } = require('discord.js');
const player = require('../../music/player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop music and leave the voice channel'),

  async execute(interaction) {
    const data = player.getQueue(interaction.guild.id);
    if (!data || !data.connection) {
      return interaction.reply({ content: '❌ Nothing is playing.', ephemeral: true });
    }

    player.stop(interaction.guild);
    await interaction.reply('⏹ Stopped and left the channel');
  }
};
