require('dotenv').config();
const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs').promises;

const app = express();
app.use(cors());

const COOKIES_CONTENT = `# Netscape HTTP Cookie File
.youtube.com	TRUE	/	TRUE	2597573456	VISITOR_INFO1_LIVE	iM7JxrxvQCE
.youtube.com	TRUE	/	TRUE	2597573456	CONSENT	YES+
.youtube.com	TRUE	/	TRUE	2597573456	GPS	1
.youtube.com	TRUE	/	TRUE	2597573456	YSC	w2HOvq_5p1A`;

const COOKIES_PATH = path.join(__dirname, 'cookies.txt');

async function initCookies() {
  try {
    await fs.writeFile(COOKIES_PATH, COOKIES_CONTENT);
    console.log('Cookies file created successfully');
  } catch (error) {
    console.error('Error creating cookies file:', error);
  }
}

app.get('/info', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    await initCookies();

    const options = {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      cookies: COOKIES_PATH,
      extractorArgs: [
        `youtube:player-client=web,default;po_token=web+${process.env.PO_TOKEN}`
      ],
      addHeader: [
        'User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language:en-US,en;q=0.5',
        'Connection:keep-alive'
      ]
    };

    console.log('Getting video info with options:', {
      ...options,
      extractorArgs: options.extractorArgs // Log para verificar el token
    });

    const videoInfo = await youtubedl(url, options);

    const response = {
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      qualities: videoInfo.formats
        .filter(format => format.ext === 'mp4' || format.ext === 'webm')
        .map(format => ({
          itag: format.format_id,
          qualityLabel: format.height ? `${format.height}p` : 'Audio only',
          hasVideo: format.vcodec !== 'none',
          hasAudio: format.acodec !== 'none',
          container: format.ext
        }))
    };

    res.json(response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Error al procesar el video. Por favor, intenta con otro video.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('PO Token configured:', process.env.PO_TOKEN ? 'Yes' : 'No');
  initCookies();
}); 