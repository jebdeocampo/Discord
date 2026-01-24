const {
  SlashCommandBuilder
} = require('discord.js');
const player = require('../../music/player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current track'),

  async execute(interaction) {
    const queue = player.getQueue(interaction.guild.id);
    if (!queue || !queue.current) {
      return interaction.reply({ content: '❌ Nothing to skip.', ephemeral: true });
    }

    player.skip(interaction.guild);

    await interaction.reply('⏭ Skipped the current track.');
  }
};
