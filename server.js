const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
const os = require('os');
const path = require('path');

const app = express();
app.use(cors());

// Determinar la ruta del navegador según el sistema operativo
const getBrowserPath = () => {
  switch (os.platform()) {
    case 'win32':
      return path.join(os.homedir(), 'AppData/Local/Google/Chrome');
    case 'darwin':
      return path.join(os.homedir(), 'Library/Application Support/Google/Chrome');
    default:
      return path.join(os.homedir(), '.config/google-chrome');
  }
};

app.get('/info', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const options = {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      cookiesFromBrowser: ['chrome'], // Usar cookies de Chrome
      addHeader: [
        'User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    };

    console.log('Getting video info with options:', JSON.stringify(options, null, 2));
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 