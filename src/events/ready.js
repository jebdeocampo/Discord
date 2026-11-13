module.exports = (client) => {
  client.once('ready', () => {
    console.log(`✅ Bot online as ${client.user.tag}`);
  });
};
