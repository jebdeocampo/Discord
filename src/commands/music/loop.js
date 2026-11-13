const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');
const player = require('../../music/player');

const modes = ['off', 'one', 'all'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Change loop mode')
    .addStringOption(o =>
      o
        .setName('mode')
        .setDescription('off, one, or all')
        .addChoices(
          { name: 'off', value: 'off' },
          { name: 'one (repeat current)', value: 'one' },
          { name: 'all (loop queue)', value: 'all' }
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    const queue = player.getQueue(interaction.guild.id);

    if (!queue || (!queue.current && !queue.songs.length)) {
      return interaction.reply({ content: '❌ Nothing is playing right now.', ephemeral: true });
    }

    let mode = interaction.options.getString('mode');

    if (!mode) {
      const idx = modes.indexOf(queue.loopMode || 'off');
      mode = modes[(idx + 1) % modes.length];
    }

    player.setLoopMode(interaction.guild, mode);

    const embed = new EmbedBuilder()
      .setColor('Purple')
      .setDescription(`🔁 Loop mode set to **${mode}**.`);

    await interaction.reply({ embeds: [embed] });
  }
};
