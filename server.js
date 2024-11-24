require('dotenv').config();
const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');

const app = express();
app.use(cors());

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
      cookiesFromBrowser: 'chrome',
      extractorArgs: [
        `youtube:player-client=web,default;po_token=web+${process.env.PO_TOKEN}`
      ],
      addHeader: [
        'User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    };

    console.log('Fetching video info for URL:', url);
    const videoInfo = await youtubedl(url, options);

    if (!videoInfo || !videoInfo.title) {
      console.error('Invalid video info received:', videoInfo);
      throw new Error('No se pudo obtener la información del video');
    }

    console.log('Video info received:', {
      title: videoInfo.title,
      formats: videoInfo.formats ? videoInfo.formats.length : 0
    });

    const response = {
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail || '',
      qualities: (videoInfo.formats || [])
        .filter(format => format && (format.ext === 'mp4' || format.ext === 'webm'))
        .map(format => ({
          itag: format.format_id || '',
          qualityLabel: format.height ? `${format.height}p` : 'Audio only',
          hasVideo: format.vcodec !== 'none',
          hasAudio: format.acodec !== 'none',
          container: format.ext || 'mp4'
        }))
    };

    if (!response.qualities.length) {
      throw new Error('No se encontraron formatos disponibles para este video');
    }

    res.json(response);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      url: req.query.url
    });

    res.status(500).json({
      error: 'Error al procesar el video. Por favor, intenta con otro video.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('PO Token configured:', process.env.PO_TOKEN ? 'Yes' : 'No');
}); 