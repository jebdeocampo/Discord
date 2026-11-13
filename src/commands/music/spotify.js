const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const fetch = require('node-fetch');
const player = require('../../music/player');

async function getPlaylistData(url) {
  const id = url.match(/playlist\/([a-zA-Z0-9]+)/)?.[1];
  if (!id) return { title: null, tracks: [] };

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body:
      'grant_type=refresh_token&refresh_token=' +
      process.env.SPOTIFY_REFRESH_TOKEN
  });

  const { access_token } = await tokenRes.json();
  const playlistRes = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });

  if (!playlistRes.ok) {
    const errorText = await playlistRes.text();
    if (playlistRes.status === 403 && errorText.includes('Premium')) {
      throw new Error('Spotify requires the app owner to have an active Premium subscription. Please check your Spotify account.');
    }
    throw new Error(`Spotify API error: ${playlistRes.status} ${errorText}`);
  }

  const playlistJson = await playlistRes.json();
  const playlistTitle = playlistJson.name || 'Spotify Playlist';
  const tracks = [];
  let next = `https://api.spotify.com/v1/playlists/${id}/tracks?limit=100`;

  while (next) {
    const res = await fetch(next, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const json = await res.json();

    for (const i of json.items || []) {
      if (i.track?.name && i.track.artists?.length) {
        tracks.push({
          title: i.track.name,
          artist: i.track.artists[0].name
        });
      }
    }

    next = json.next;
  }

  return { title: playlistTitle, tracks };
}

function buildControls() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('pause').setLabel('⏸ Pause').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('resume').setLabel('▶ Resume').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('skip').setLabel('⏭ Skip').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('stop').setLabel('⏹ Stop').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('shuffle').setLabel('⇄ Shuffle').setStyle(ButtonStyle.Primary)
  );
}

function buildEmbed(queue) {
  const song = queue.current || queue.songs[0];
  return new EmbedBuilder()
    .setTitle('🎵 Spotify Playlist')
    .setColor('Green')
    .setDescription(
      `📑 Playlist: **${queue.playlistTitle || 'Unknown'}**\n` +
      `🎶 Tracks queued: **${queue.songs.length}**\n\n` +
      (song
        ? `▶️ **Now Playing:**\n**${song.title}**${song.artist ? `\n👤 ${song.artist}` : ''}`
        : '❌ No track currently playing.')
    )
    .setThumbnail(song?.thumbnail || null)
    .setFooter({ text: 'Use the buttons below to control playback.' });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spotify')
    .setDescription('Import a Spotify playlist')
    .addStringOption(o =>
      o.setName('url').setDescription('Spotify playlist URL').setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const vc = interaction.member.voice.channel;
    if (!vc) return interaction.editReply('❌ Join a voice channel first.');

    const { title: playlistTitle, tracks } = await getPlaylistData(
      interaction.options.getString('url')
    );

    const queue = player.getQueue(interaction.guild.id);
    queue.textChannel = interaction.channel;
    queue.playlistTitle = playlistTitle;

    for (const track of tracks) {
      queue.songs.push(track);
    }

    if (!queue.connection) {
      await player.connectToChannel(vc);
      player.playNext(interaction.guild);
    }

    const embed = buildEmbed(queue);
    const controls = buildControls();

    queue.lastMessage = await interaction.editReply({ embeds: [embed], components: [controls] });
  }
};
