const SpotifyWebApi = require('spotify-web-api-node');
const http = require('http');
const { exec } = require('child_process');

const spotifyApi = new SpotifyWebApi({
  clientId: '1789a36bb24148cc9afd070c9476573d',
  clientSecret: '0d91ef39976e42bb872366e9042340d4',
  redirectUri: 'http://127.0.0.1:8888/callback' 
});

const scopes = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read'
];

const authUrl = spotifyApi.createAuthorizeURL(scopes, 'state');
console.log('\n======================================================');
console.log('Opening browser for Spotify authorization...');
console.log('If it does not open automatically, manually copy and paste this URL:\n\n', authUrl);
console.log('\n======================================================\n');

exec(`start "" "${authUrl}"`);

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/callback')) {
    const code = new URL(req.url, 'http://localhost:8888').searchParams.get('code');
    try {
      const data = await spotifyApi.authorizationCodeGrant(code);
      res.end('<h1>Success!</h1><p>Check your terminal/console for the token. You can close this window now.</p>');
      
      console.log('\n======================================================');
      console.log('✅ SUCCESS! Copy the line below into your .env file:');
      console.log('======================================================\n');
      console.log(`SPOTIFY_REFRESH_TOKEN=${data.body.refresh_token}\n`);
      
      setTimeout(() => { server.close(); process.exit(0); }, 1000);
    } catch (error) {
      console.error('❌ Error getting tokens:', error);
      res.end('Error getting tokens. Check your terminal.');
      server.close();
    }
  }
});

server.listen(8888, () => {
  console.log('Waiting for you to click "Agree" in the browser...');
});