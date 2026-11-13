const player = require('../music/player');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function buildControls() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('pause').setLabel('⏸ Pause').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('resume').setLabel('▶ Resume').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('skip').setLabel('⏭ Skip').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('stop').setLabel('⏹ Stop').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('shuffle').setLabel('⇄ Shuffle').setStyle(ButtonStyle.Primary)
  );
}

function buildEmbed(queue, stateText = null) {
  const song = queue.current;
  return new EmbedBuilder()
    .setTitle(stateText || '🎵 Spotify Playlist')
    .setColor('Green')
    .setDescription(
      `📑 Playlist: **${queue.playlistTitle || 'Unknown'}**\n` +
      `🎶 Tracks queued: **${queue.songs.length}**\n\n` +
      (song
        ? `▶️ **Now Playing:**\n**${song.title}**${song.artist ? `\n👤 ${song.artist}` : ''}\n🔗 <${song.url}>`
        : '❌ No track currently playing.')
    )
    .setThumbnail(song?.thumbnail || null)
    .setFooter({ text: 'Use the buttons below to control playback.' });
}

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (err) {
        console.error('❌ Command error:', err);
        if (!interaction.replied && !interaction.deferred) {
          interaction.reply({ content: '❌ Error occurred.', flags: 64 });
        }
      }
    }

    if (interaction.isButton()) {
      if (!interaction.guild) return;

      const queue = player.getQueue(interaction.guild.id);

      if (!queue?.player) {
        return interaction.reply({ content: '❌ Nothing playing.', flags: 64 });
      }

      try {
        switch (interaction.customId) {
          case 'pause':
            await queue.player.pause();
            break;
          case 'resume':
            await queue.player.unpause();
            break;
          case 'skip':
            player.skip(interaction.guild);
            await interaction.deferUpdate();
            return;
          case 'stop':
            player.stop(interaction.guild);
            if (queue.lastMessage) {
              const stoppedEmbed = new EmbedBuilder()
                .setTitle('⏹ Playback Stopped')
                .setColor('Red')
                .setDescription('The queue has been cleared and the bot left the channel.');
              await queue.lastMessage.edit({ embeds: [stoppedEmbed], components: [] }).catch(() => {});
            }
            await interaction.deferUpdate();
            return;
          case 'vol_up':
            player.setVolume(interaction.guild, Math.min(1, queue.volume + 0.1));
            break;
          case 'vol_down':
            player.setVolume(interaction.guild, Math.max(0, queue.volume - 0.1));
            break;
          case 'loop': {
            const modes = ['off', 'one', 'all'];
            const next = modes[(modes.indexOf(queue.loopMode) + 1) % modes.length];
            player.setLoopMode(interaction.guild, next);
            break;
          }
          case 'shuffle': {
            if (queue.songs.length > 1) {
              for (let i = queue.songs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]];
              }
            }
            break;
          }
        }

        if (queue.lastMessage) {
          const embed = buildEmbed(queue);
          const controls = buildControls();
          await queue.lastMessage.edit({ embeds: [embed], components: [controls] });
        }

        if (!interaction.replied) {
          await interaction.deferUpdate();
        }
      } catch (err) {
        console.error('❌ Button error:', err);
        if (!interaction.replied && !interaction.deferred) {
          interaction.reply({ content: '❌ Button failed.', flags: 64 });
        }
      }
    }
  });
};
