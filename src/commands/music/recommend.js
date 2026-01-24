const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');
const play = require('play-dl');
const player = require('../../music/player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('recommend')
    .setDescription('Recommend similar tracks based on the current song')
    .addIntegerOption(o =>
      o
        .setName('count')
        .setDescription('How many recommendations (1–10)')
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(false)
    ),

  async execute(interaction) {
    const queue = player.getQueue(interaction.guild.id);
    if (!queue || !queue.current) {
      return interaction.reply({ content: '❌ Nothing is playing to base recommendations on.', ephemeral: true });
    }

    const count = interaction.options.getInteger('count') || 5;
    const baseTitle = queue.current.title;

    await interaction.deferReply();

    let results;
    try {
      results = await play.search(`${baseTitle} song`, {
        limit: count + 2,
        source: { youtube: 'video' }
      });
    } catch (err) {
      console.error('❌ recommend.js search error:', err);
      return interaction.editReply('❌ Failed to fetch recommendations.');
    }

    if (!results.length) {
      return interaction.editReply('❌ No recommendations found.');
    }

    const picks = results.slice(0, count);

    const lines = picks.map((r, i) => `🎧 ${i + 1}. [${r.title}](${r.url})`);

    const embed = new EmbedBuilder()
      .setTitle('🎧 Recommended Tracks')
      .setColor('DarkVividPink')
      .setDescription(lines.join('\n').slice(0, 4000))
      .setThumbnail(queue.current?.thumbnail || null) // ✅ show current song image
      .setFooter({ text: `🔍 Based on: ${baseTitle}` });

    await interaction.editReply({ embeds: [embed] });
  }
};
