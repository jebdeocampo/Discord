const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');
const player = require('../../music/player');

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the current queue'),

  async execute(interaction) {
    const queue = player.getQueue(interaction.guild.id);
    if (!queue || queue.songs.length < 2) {
      return interaction.reply({ content: '❌ Not enough songs to shuffle.', ephemeral: true });
    }

    shuffle(queue.songs);

    const embed = new EmbedBuilder()
      .setTitle('🔀 Queue Shuffled')
      .setColor('Blurple')
      .setDescription('Your playlist has been randomized.\nEnjoy the surprise order!')
      .setThumbnail(queue.current?.thumbnail || null)
      .setFooter({ text: 'Use /queue to view the new order.' });

    await interaction.reply({ embeds: [embed] });
  }
};
