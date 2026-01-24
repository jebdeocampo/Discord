# 🎵 Music-Bot

A modular Discord music bot built with Node.js, designed for clean playback control, dynamic embeds, and extensible command architecture. This public version is stripped of secrets and binaries, ready for showcase and customization.

---

## ⚙️ Requirements

To run this bot locally or on a cloud server, you’ll need:

### 🧠 Language & Runtime
- **Node.js**: v18+  
  [Download Node.js](https://nodejs.org/en/download)

- **JavaScript**: ES6+ syntax

### 🛠 Development Environment
- **IDE**: Visual Studio Code or any modern editor  
  [Download VS Code](https://code.visualstudio.com/download)

- **Package Manager**: npm (comes with Node.js)

### 🎧 External Dependencies
- **FFmpeg**: Required for audio streaming  
  [Download FFmpeg](https://ffmpeg.org/download.html)

- **yt-dlp**: Used for extracting audio from YouTube  
  [Download yt-dlp](https://github.com/yt-dlp/yt-dlp/releases)

---

## 🔐 Environment Variables

This bot uses a `.env` file to store sensitive credentials. The public repo includes a `.env.example` to guide setup.

### Example `.env` structure:
```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_bot_client_id
GUILD_ID=your_guild_id
# Discord

🚀 Installation

npm install

node src/index.js

🙌 Credits
Crafted by jebdeocampo | https://github.com/jebdeocampo  
Powered by Discord.js
