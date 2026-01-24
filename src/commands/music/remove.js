const {
  SlashCommandBuilder
} = require('discord.js');
const player = require('../../music/player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a track from the queue by its number')
    .addIntegerOption(o =>
      o
        .setName('index')
        .setDescription('Queue position (see /queue)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const queue = player.getQueue(interaction.guild.id);
    if (!queue || !queue.songs.length) {
      return interaction.reply({ content: '❌ The queue is empty.', ephemeral: true });
    }

    const index = interaction.options.getInteger('index');

    if (index < 1 || index > queue.songs.length) {
      return interaction.reply({ content: '❌ Invalid index.', ephemeral: true });
    }

    const [removed] = queue.songs.splice(index - 1, 1);

    await interaction.reply(`🗑 Removed **${removed.title}** from the queue.`);
  }
};
