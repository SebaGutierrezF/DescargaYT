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

    const videoInfo = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true
    });

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