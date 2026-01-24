const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');
const player = require('../../music/player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show the currently playing track'),

  async execute(interaction) {
    const queue = player.getQueue(interaction.guild.id);

    if (!queue || !queue.current) {
      return interaction.reply({ content: '❌ Nothing is playing right now.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🎵 Now Playing')
      .setColor('Green')
      .setDescription(`🎶 **${queue.current.title}**\n🔗 <${queue.current.url}>`)
      .setThumbnail(queue.current.thumbnail || null) // ✅ album art / video thumbnail
      .addFields(
        { name: '🔁 Loop Mode', value: `\`${queue.loopMode || 'off'}\``, inline: true },
        { name: '📡 Autoplay', value: `\`${queue.autoplay ? 'on' : 'off'}\``, inline: true }
      )
      .setFooter({ text: 'Use /queue to see what’s next.' });

    await interaction.reply({ embeds: [embed] });
  }
};
