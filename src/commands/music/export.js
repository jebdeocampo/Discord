const {
  SlashCommandBuilder,
  AttachmentBuilder
} = require('discord.js');
const player = require('../../music/player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('export')
    .setDescription('Export the current queue as a text file'),

  async execute(interaction) {
    const queue = player.getQueue(interaction.guild.id);
    if (!queue || (!queue.current && !queue.songs.length)) {
      return interaction.reply({ content: '❌ Nothing to export.', ephemeral: true });
    }

    const lines = [];

    if (queue.current) {
      lines.push(`# Now playing: ${queue.current.title}`);
      lines.push(queue.current.url);
      lines.push('');
    }

    queue.songs.forEach((s, i) => {
      lines.push(`${i + 1}. ${s.title}`);
      lines.push(s.url);
      lines.push('');
    });

    const content = lines.join('\n');
    const buffer = Buffer.from(content, 'utf-8');
    const attachment = new AttachmentBuilder(buffer, { name: 'queue.txt' });

    await interaction.reply({
      content: '📦 Exported queue as `queue.txt`.',
      files: [attachment]
    });
  }
};
