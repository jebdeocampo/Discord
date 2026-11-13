const path = require('path');
process.env.FFMPEG_PATH = path.join(__dirname, '../../discord tools/ffmpeg.exe');

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  getVoiceConnection,
  StreamType
} = require('@discordjs/voice');

const { YouTube } = require('youtube-sr');
const { spawn } = require('child_process');
const { getQueue, deleteQueue } = require('./queue');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const YTDLP_PATH = path.join(__dirname, '../../discord tools/yt-dlp.exe');

function getGuildQueue(guildId) {
  return getQueue(guildId);
}

async function connectToChannel(voiceChannel) {
  const guildId = voiceChannel.guild.id;
  const queue = getGuildQueue(guildId);

  let connection = getVoiceConnection(guildId);
  if (!connection) {
    connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator
    });
  }

  queue.connection = connection;
  queue.voiceChannel = voiceChannel;

  if (!queue.player) {
    const player = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Pause }
    });

    player.on(AudioPlayerStatus.Idle, () => handleTrackEnd(voiceChannel.guild));
    player.on('error', (error) => {
      console.error(`Audio player error in guild ${guildId}:`, error);
      handleTrackEnd(voiceChannel.guild);
    });

    connection.subscribe(player);
    queue.player = player;
  }

  return connection;
}

function handleTrackEnd(guild) {
  const queue = getGuildQueue(guild.id);
  if (!queue) return;

  if (queue.stopping) return;

  const { loopMode, songs, current } = queue;
  if (current) queue.previous = current;

  if (queue.skipping) {
    queue.skipping = false;
  } else {
    if (loopMode === 'one' && current) songs.unshift(current);
    else if (loopMode === 'all' && current) songs.push(current);
  }

  if (songs.length && songs[0] === current) songs.shift();

  if (!songs.length) {
    if (queue.autoplay && queue.previous) {
    }
    stop(guild);
    return;
  }

  playNext(guild);
}

function spawnYtDlpAudio(url, queue) {
  const args = [
    url,
    '-f', 'bestaudio/best',
    '--no-playlist',
    '--quiet',
    '--no-warnings',
    '-o', '-'
  ];

  const yt = spawn(YTDLP_PATH, args, { windowsHide: true });
  queue.ytProcess = yt;

  yt.on('error', (err) => console.error('yt-dlp spawn error:', err));
  yt.stderr.on('data', (d) => {
    const msg = d.toString();
    if (/WARNING|ERROR/i.test(msg)) console.warn('[yt-dlp]', msg.trim());
  });

  return yt.stdout;
}

function spawnFfmpegPcm(inputStream, queue) {
  const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
  const args = [
    '-hide_banner',
    '-loglevel', 'error',
    '-i', 'pipe:0',
    '-vn',
    '-ac', '2',
    '-ar', '48000',
    '-f', 's16le',
    'pipe:1'
  ];

  const ff = spawn(ffmpegPath, args, { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
  queue.ffmpegProcess = ff;

  ff.on('error', (err) => console.error('ffmpeg spawn error:', err));
  ff.stderr.on('data', (d) => {
    const msg = d.toString();
    if (msg.trim()) console.warn('[ffmpeg]', msg.trim());
  });

  try {
    inputStream.pipe(ff.stdin);
  } catch (err) {
    console.error('Pipe error:', err);
  }

  return ff.stdout;
}

async function playNext(guild) {
  const queue = getGuildQueue(guild.id);
  if (!queue || !queue.connection || !queue.player) return;
  if (!queue.songs.length) return;

  const song = queue.songs[0];
  queue.current = song;

  try {
    let videoUrl;

    if (!song.url) {
      const query = song.artist ? `${song.title} ${song.artist}` : song.title;
      console.log(`🔍 Searching YouTube for: ${query}`);

      const results = await YouTube.search(query, { limit: 1 });
      if (!results.length) {
        console.warn(`⚠️ No playable result for: ${song.title}`);
        queue.songs.shift();
        return playNext(guild);
      }

      videoUrl = results[0].url;
      song.url = videoUrl;
      song.thumbnail = results[0].thumbnail.url;
    } else {
      videoUrl = song.url;
    }

    const ytStream = spawnYtDlpAudio(videoUrl, queue);
    const pcmStream = spawnFfmpegPcm(ytStream, queue);

    const resource = createAudioResource(pcmStream, {
      inputType: StreamType.Raw,
      inlineVolume: true
    });

    if (resource.volume) resource.volume.setVolume(queue.volume);
    queue.player.play(resource);

    console.log(`🎧 Now playing: ${song.title}${song.artist ? ' by ' + song.artist : ''}`);

    if (queue.textChannel) {
      const embed = new EmbedBuilder()
        .setTitle('🎵 Now Playing')
        .setColor('Green')
        .setDescription(`🎶 **${song.title}**${song.artist ? `\n👤 ${song.artist}` : ''}\n🔗 <${song.url}>`)
        .setThumbnail(song.thumbnail || null)
        .setFooter({ text: 'Use the buttons below to control playback.' });

      const controls = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pause').setLabel('⏸ Pause').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('resume').setLabel('▶ Resume').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('skip').setLabel('⏭ Skip').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('stop').setLabel('⏹ Stop').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('shuffle').setLabel('⇄ Shuffle').setStyle(ButtonStyle.Primary)
      );

      if (queue.lastMessage) {
        try {
          await queue.lastMessage.edit({ embeds: [embed], components: [controls] });
        } catch {
          queue.lastMessage = await queue.textChannel.send({ embeds: [embed], components: [controls] });
        }
      } else {
        queue.lastMessage = await queue.textChannel.send({ embeds: [embed], components: [controls] });
      }
    }
  } catch (err) {
    console.error(`❌ Failed playing ${song.title}:`, err);
    queue.songs.shift();
    if (queue.songs.length) playNext(guild);
    else stop(guild);
  }
}

function skip(guild) {
  const queue = getQueue(guild.id);
  if (!queue || !queue.player) return;

  queue.skipping = true;

  try {
    queue.ffmpegProcess?.stdin?.on('error', () => {});
    queue.ffmpegProcess?.stdout?.on('error', () => {});
    queue.ffmpegProcess?.kill('SIGKILL');
    queue.ytProcess?.on('error', () => {});
    queue.ytProcess?.kill('SIGKILL');
  } catch (err) {
    console.error('❌ Skip cleanup error:', err);
  }

  queue.player.stop(true);
}

function stop(guild) {
  const queue = getQueue(guild.id);
  if (!queue) return;

  queue.stopping = true;

  try {
    queue.ffmpegProcess?.stdin?.on('error', () => {});
    queue.ffmpegProcess?.stdout?.on('error', () => {});
    queue.ffmpegProcess?.kill('SIGKILL');
    queue.ytProcess?.on('error', () => {});
    queue.ytProcess?.kill('SIGKILL');
  } catch (err) {
    console.error('❌ Stop cleanup error:', err);
  }

  if (queue.player) queue.player.stop(true);

  const connection = getVoiceConnection(guild.id);
  if (connection) connection.destroy();

  deleteQueue(guild.id);
}

function setVolume(guild, volume) {
  const queue = getGuildQueue(guild.id);
  if (!queue) return;
  queue.volume = volume;

  const resource = queue.player?.state.resource;
  if (resource?.volume) resource.volume.setVolume(volume);
}

function setLoopMode(guild, mode) {
  const queue = getGuildQueue(guild.id);
  if (!queue) return;
  if (!['off', 'one', 'all'].includes(mode)) return;
  queue.loopMode = mode;
}

function toggleAutoplay(guild) {
  const queue = getGuildQueue(guild.id);
  if (!queue) return;
  queue.autoplay = !queue.autoplay;
  return queue.autoplay;
}

module.exports = {
  getQueue: getGuildQueue,
  connectToChannel,
  playNext,
  skip,
  stop,
  setVolume,
  setLoopMode,
  toggleAutoplay
};