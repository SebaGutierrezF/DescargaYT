require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();

// Configuración de CORS
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://sebagutierrezf.github.io'
];

app.use(cors({
    origin: function(origin, callback) {
        // Permitir requests sin origin (como Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Origin not allowed:', origin); // Para debugging
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Origin']
}));

// Middleware para prevenir caché
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});

class YouTubeAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async getVideoInfo(videoId) {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${this.apiKey}`
    );
    return response.json();
  }
}

const youtubeAPI = new YouTubeAPI(process.env.YOUTUBE_API_KEY);

// Ruta para obtener información del video
app.get('/info', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const videoId = ytdl.getVideoID(url);
    const videoInfo = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      }
    });
    
    const response = {
      title: videoInfo.videoDetails.title,
      thumbnail: videoInfo.videoDetails.thumbnails[0].url,
      qualities: videoInfo.formats
        .filter(format => format.hasVideo || format.hasAudio)
        .map(format => ({
          itag: format.itag,
          qualityLabel: format.qualityLabel || 'Audio only',
          hasVideo: format.hasVideo,
          hasAudio: format.hasAudio
        }))
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in /info:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para descargar
app.get('/download', async (req, res) => {
  try {
    const { url, format, quality } = req.query;
    const options = {
      quality: quality || 'highest',
      filter: format === 'mp3' ? 'audioonly' : 'videoandaudio',
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        }
      }
    };

    const videoStream = ytdl(url, options);
    const videoInfo = await ytdl.getInfo(url, options);
    
    res.header('Content-Disposition', `attachment; filename="${videoInfo.videoDetails.title}.${format}"`);
    videoStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
}); 