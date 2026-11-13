const queues = new Map();

function getQueue(guildId) {
  if (!queues.has(guildId)) {
    queues.set(guildId, {
      guildId,
      songs: [],
      current: null,
      previous: null,
      connection: null,
      player: null,
      textChannel: null,
      voiceChannel: null,
      volume: 1,
      loopMode: 'off',
      autoplay: false,
      playlistTitle: null,
      lastMessage: null,
      stopping: false,
      skipping: false,
      ytProcess: null,
      ffmpegProcess: null
    });
  }
  return queues.get(guildId);
}

function deleteQueue(guildId) {
  queues.delete(guildId);
}

function getAllQueues() {
  return queues;
}

module.exports = {
  getQueue,
  deleteQueue,
  getAllQueues
};
