require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

process.env.YTDL_NO_UPDATE = 'true';

const app = express();
app.use(cors());

const getVideoInfo = async (url) => {
  const options = {
    requestOptions: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.youtube.com/',
        'X-YouTube-Client-Name': '1',
        'X-YouTube-Client-Version': '2.20231121.08.00',
        'Cookie': process.env.YOUTUBE_COOKIE || ''
      }
    }
  };

  try {
    return await ytdl.getInfo(url, options);
  } catch (error) {
    if (error.statusCode === 410) {
      options.requestOptions.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1';
      return await ytdl.getInfo(url, options);
    }
    throw error;
  }
};

app.get('/info', async (req, res) => {
  try {
    const { url } = req.query;
    console.log('Processing URL:', url);

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const videoInfo = await getVideoInfo(url);
    console.log('Video info retrieved successfully');

    const formats = videoInfo.formats.filter(format => {
      return (format.hasVideo || format.hasAudio) && 
             !format.isHLS;
    });

    const response = {
      title: videoInfo.videoDetails.title,
      thumbnail: videoInfo.videoDetails.thumbnails[0].url,
      qualities: formats.map(format => ({
        itag: format.itag,
        qualityLabel: format.qualityLabel || 'Audio only',
        hasVideo: format.hasVideo,
        hasAudio: format.hasAudio,
        container: format.container,
        mimeType: format.mimeType
      }))
    };

    res.json(response);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode
    });

    if (error.statusCode === 410) {
      return res.status(400).json({
        error: 'Este video no está disponible temporalmente. Por favor, intenta con otro video o más tarde.'
      });
    }

    res.status(500).json({
      error: 'Error al procesar el video. Por favor, intenta con otro video.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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