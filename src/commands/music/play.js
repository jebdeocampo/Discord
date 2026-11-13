const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');
const play = require('play-dl');
const player = require('../../music/player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube')
    .addStringOption(o =>
      o
        .setName('query')
        .setDescription('YouTube URL or search query')
        .setRequired(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString('query');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ content: '❌ Join a voice channel first.', ephemeral: true });
    }

    await interaction.deferReply();

    const queue = player.getQueue(interaction.guild.id);
    queue.textChannel = interaction.channel;
    queue.voiceChannel = voiceChannel;

    let songInfo;

    try {
      if (play.yt_validate(query) === 'video') {
        const info = await play.video_info(query);
        songInfo = {
          title: info.video_details.title,
          url: info.video_details.url,
          artist: info.video_details.channel?.name || 'Unknown',
          thumbnail: info.video_details.thumbnails?.[0]?.url || null
        };
      } else {
        const results = await play.search(query, { limit: 1, source: { youtube: 'video' } });
        if (!results.length) {
          return interaction.editReply('❌ No results found.');
        }
        songInfo = {
          title: results[0].title,
          url: results[0].url,
          artist: results[0].channel?.name || 'Unknown',
          thumbnail: results[0].thumbnail?.url || null
        };
      }
    } catch (err) {
      console.error('❌ play.js search error:', err);
      return interaction.editReply('❌ Failed to search for that track.');
    }

    queue.songs.push(songInfo);

    const embed = new EmbedBuilder()
      .setColor('Green')
      .setDescription(`✅ Queued **${songInfo.title}**`);

    await interaction.editReply({ embeds: [embed] });

    if (!queue.connection) {
      try {
        queue.connection = await player.connectToChannel(voiceChannel);
        player.playNext(interaction.guild);
      } catch (err) {
        console.error('❌ play.js voice connection error:', err);
        return interaction.followUp({ content: '❌ Failed to join voice channel.', ephemeral: true });
      }
    } else if (queue.player && queue.player.state.status === 'idle' && !queue.current) {
      player.playNext(interaction.guild);
    }
  }
};
