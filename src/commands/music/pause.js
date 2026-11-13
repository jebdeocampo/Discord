const { SlashCommandBuilder } = require('discord.js');
const player = require('../../music/player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the current song'),

  async execute(interaction) {
    const data = player.getQueue(interaction.guild.id);
    if (!data || !data.connection) {
      return interaction.reply({ content: '❌ Nothing is playing.', ephemeral: true });
    }

    data.player.pause();
    await interaction.reply('⏸ Paused');
  }
};
