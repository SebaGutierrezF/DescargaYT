require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();

// Configuración de CORS simplificada
app.use(cors());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Ruta para obtener información del video
app.get('/info', async (req, res) => {
  try {
    const { url } = req.query;
    console.log('Processing URL:', url); // Log de la URL

    if (!url) {
      console.log('Error: No URL provided');
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validar que es una URL de YouTube válida
    if (!ytdl.validateURL(url)) {
      console.log('Error: Invalid YouTube URL');
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    console.log('Getting video info...');
    const videoInfo = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cookie': '' // YouTube puede requerir cookies
        }
      }
    });

    console.log('Video info retrieved successfully');
    
    const response = {
      title: videoInfo.videoDetails.title,
      thumbnail: videoInfo.videoDetails.thumbnails[0].url,
      qualities: videoInfo.formats
        .filter(format => format.hasVideo || format.hasAudio)
        .map(format => ({
          itag: format.itag,
          qualityLabel: format.qualityLabel || 'Audio only',
          hasVideo: format.hasVideo,
          hasAudio: format.hasAudio,
          container: format.container,
          codecs: format.codecs
        }))
    };

    console.log('Sending response...');
    res.json(response);
  } catch (error) {
    console.error('Error processing video:', error);
    
    // Mensaje de error más descriptivo
    const errorMessage = error.message.includes('410') 
      ? 'El video no está disponible (Error 410). YouTube puede estar bloqueando las solicitudes.'
      : error.message;

    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
  console.log('Environment:', process.env.NODE_ENV);
  console.log('CORS enabled for:', process.env.ALLOWED_ORIGINS);
}); 