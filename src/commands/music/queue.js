const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');
const player = require('../../music/player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current queue'),

  async execute(interaction) {
    const queue = player.getQueue(interaction.guild.id);

    if (!queue || (!queue.current && !queue.songs.length)) {
      return interaction.reply({ content: '❌ The queue is empty.', ephemeral: true });
    }

    const lines = [];

    if (queue.current) {
      lines.push(`▶️ **Now Playing:** ${queue.current.title}`);
    }

    queue.songs.forEach((song, i) => {
      const index = i + 1;
      lines.push(`🎵 ${index}. ${song.title}`);
    });

    const embed = new EmbedBuilder()
      .setTitle('📜 Current Queue')
      .setColor('DarkBlue')
      .setDescription(lines.join('\n').slice(0, 4000))
      .setThumbnail(queue.current?.thumbnail || null) // ✅ show current song image
      .setFooter({ text: 'Use /shuffle to randomize the order.' });

    await interaction.reply({ embeds: [embed] });
  }
};
