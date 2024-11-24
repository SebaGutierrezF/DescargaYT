require('dotenv').config();
const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs').promises;

const app = express();

// Configuración de CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS,
  methods: ['GET', 'POST'],
  credentials: true
}));

// Configuración de cookies
const COOKIES_CONTENT = `# Netscape HTTP Cookie File
.youtube.com	TRUE	/	TRUE	2597573456	CONSENT	YES+cb7
.youtube.com	TRUE	/	TRUE	2597573456	GPS	1
.youtube.com	TRUE	/	TRUE	2597573456	VISITOR_INFO1_LIVE	${process.env.VISITOR_INFO1_LIVE}
.youtube.com	TRUE	/	TRUE	2597573456	YSC	${process.env.YSC}
.youtube.com	TRUE	/	TRUE	2597573456	LOGIN_INFO	${process.env.LOGIN_INFO || ''}
.youtube.com	TRUE	/	TRUE	2597573456	PREF	${process.env.PREF || 'f4=4000000&tz=America.Santiago'}`;

const COOKIES_PATH = path.join(__dirname, 'cookies.txt');

// Inicialización de cookies
async function initCookies() {
  try {
    await fs.writeFile(COOKIES_PATH, COOKIES_CONTENT, { mode: 0o666 });
    console.log('✅ Cookies file created successfully');
    // Verificar que el archivo se creó correctamente
    const content = await fs.readFile(COOKIES_PATH, 'utf8');
    console.log('📝 Cookies file content length:', content.length);
  } catch (error) {
    console.error('❌ Error creating cookies file:', error);
    throw error;
  }
}

// Configuración de YouTube DL
const getYoutubeDLOptions = () => ({
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
});

// Procesamiento de formatos de video
const processVideoFormats = (formats) => {
  return (formats || [])
    .filter(format => format && (format.ext === 'mp4' || format.ext === 'webm'))
    .map(format => ({
      itag: format.format_id || '',
      qualityLabel: format.height ? `${format.height}p` : 'Audio only',
      hasVideo: format.vcodec !== 'none',
      hasAudio: format.acodec !== 'none',
      container: format.ext || 'mp4',
      url: format.url || ''
    }));
};

// Ruta principal para obtener información del video
app.get('/info', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    await initCookies();
    
    console.log('📹 Fetching video info for URL:', url);
    const options = getYoutubeDLOptions();
    console.log('🔧 Using options:', JSON.stringify(options, null, 2));
    
    const videoInfo = await youtubedl(url, options);

    if (!videoInfo || !videoInfo.title) {
      console.error('❌ Invalid video info received:', videoInfo);
      throw new Error('No se pudo obtener la información del video');
    }

    console.log('✅ Video info received:', {
      title: videoInfo.title,
      formats: videoInfo.formats ? videoInfo.formats.length : 0
    });

    const qualities = processVideoFormats(videoInfo.formats);

    if (!qualities.length) {
      throw new Error('No se encontraron formatos disponibles para este video');
    }

    const response = {
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail || '',
      qualities
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Error details:', {
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

// Inicialización del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🌍 Environment:', process.env.NODE_ENV);
  console.log('🔑 PO Token configured:', process.env.PO_TOKEN ? 'Yes' : 'No');
  console.log('🍪 Cookies configured:', process.env.VISITOR_INFO1_LIVE && process.env.YSC ? 'Yes' : 'No');
  
  // Inicializar cookies al arrancar
  try {
    await initCookies();
  } catch (error) {
    console.error('❌ Failed to initialize cookies:', error);
  }
});

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
}); 