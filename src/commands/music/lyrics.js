const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');
const player = require('../../music/player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Get a lyrics link for the current or specified song')
    .addStringOption(o =>
      o
        .setName('song')
        .setDescription('Optional: song title (default: now playing)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const provided = interaction.options.getString('song');
    const queue = player.getQueue(interaction.guild.id);

    let title;
    let thumbnail;

    if (provided) {
      title = provided;
    } else if (queue && queue.current) {
      title = queue.current.title;
      thumbnail = queue.current.thumbnail || null;
    } else {
      return interaction.reply({ content: '❌ No song specified and nothing is playing.', ephemeral: true });
    }

    const query = encodeURIComponent(`${title} lyrics`);
    const url = `https://www.google.com/search?q=${query}`;

    const embed = new EmbedBuilder()
      .setTitle('🎤 Lyrics Finder')
      .setColor('Orange')
      .setDescription(
        `🔎 Searching lyrics for:\n` +
        `🎶 **${title}**\n\n` +
        `[📄 Open lyrics search](${url})`
      )
      .setThumbnail(thumbnail)
      .setFooter({ text: 'Lyrics are linked externally due to copyright.' });

    await interaction.reply({ embeds: [embed] });
  }
};
