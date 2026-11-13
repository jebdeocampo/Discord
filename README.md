🎵 Discord Spotify Music Bot

A fully-featured Discord music bot designed to seamlessly import Spotify playlists and play them in your Discord voice channel.

Because Spotify does not allow direct audio streaming through its API for third-party bots, this bot intelligently fetches track metadata (title and artist) from Spotify and uses yt-dlp to find and stream matching audio from YouTube.

✨ Features
Spotify Playlist Import: Paste a Spotify playlist URL and the bot will automatically queue every track.
High-Quality Audio: Uses yt-dlp and ffmpeg for reliable, high-quality audio streaming.
Interactive UI: Control playback using Discord buttons (Pause, Resume, Skip, Stop, Shuffle).
Queue Management: View, shuffle, remove, and export the current queue.
Autoplay & Loop: Toggle autoplay for continuous music or loop the current track or entire queue.
Lyrics & Recommendations: Get external lyrics links and song recommendations based on the currently playing track.
🛠️ Prerequisites

Before installing, make sure you have the following:

Node.js (v16.9.0 or newer).
FFmpeg: Required for processing audio streams. Download here (Get release-essentials.zip).
yt-dlp: Required for extracting audio from YouTube. Download here.
🚀 Installation & Setup
1. Clone the Repository
bash
git clone https://github.com/jebdeocampo/Discord.git
cd Discord

2. Install Dependencies
bash
npm install

3. Set Up Local Tools

Create a folder named discord tools in the root directory of the project.

Place the following files inside it:

ffmpeg.exe
yt-dlp.exe

Note: The bot is already configured to look for these files in this specific folder.

4. Configure Environment Variables

Create a .env file in the root directory of the project. You can use .env.example as a template if available.

Add the following variables:

env
TOKEN=YOUR_DISCORD_BOT_TOKEN
CLIENT_ID=YOUR_DISCORD_APPLICATION_ID
SPOTIFY_CLIENT_ID=YOUR_SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET=YOUR_SPOTIFY_CLIENT_SECRET
SPOTIFY_REFRESH_TOKEN=YOUR_SPOTIFY_REFRESH_TOKEN


You can obtain your Discord credentials from the Discord Developer Portal and your Spotify credentials from the Spotify Developer Dashboard.

⚠️ Important: Spotify API Requirements

As of March 2026, Spotify requires the owner of a Developer App to have an active Spotify Premium subscription to use Development Mode apps.

Without Premium, Spotify API requests may return a 403 Forbidden error.

🔑 How to Get Your Spotify Refresh Token

You can generate your refresh token using the get-token.js script included in the repository.

Open get-token.js.
Make sure your clientId, clientSecret, and redirectUri are correct.
Use the following redirect URI:
text
http://127.0.0.1:8888/callback

Run the script:
bash
node get-token.js

A browser window will open. Log in to Spotify and click Agree.
Copy the refresh token displayed in your terminal.
Paste it into your .env file as SPOTIFY_REFRESH_TOKEN.

Important: Never share your .env file, Discord bot token, Spotify client secret, or refresh token publicly.

🎮 Running the Bot
1. Register Slash Commands

You only need to run this when adding or modifying bot commands.

bash
node src/deploy-commands.js

2. Start the Bot
bash
node src/index.js


Your Discord music bot should now be online and ready to use!

🕹️ Commands
Command	Description
/play <query>	Play a song from YouTube using a URL or search query.
/spotify <url>	Import and play a Spotify playlist.
/pause	Pause the current track.
/skip	Skip the current track.
/stop	Stop playback.
/queue	View upcoming tracks.
/nowplaying	Display information about the current track.
/loop <off|one|all>	Set the loop mode.
/shuffle	Randomize the queue.
/remove <index>	Remove a specific track from the queue.
/export	Export the current queue to a text file.
/lyrics [song]	Get a Google search link for song lyrics.
/recommend	Get song recommendations based on the current track.
/autoplay	Toggle autoplay mode.
/ping	Check bot latency.
👨‍💻 Credits

Developed and maintained by jebdeocampo.

Also known as Solo.

Feel free to fork, star ⭐, and contribute to the project!

⭐ If you find this project useful, consider giving the repository a star!
