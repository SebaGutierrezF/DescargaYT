const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const { PassThrough } = require('stream');

class VideoDownloader {
    constructor() {
        this.app = express();
        this.server = null;
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors({
            origin: true,
            methods: ['GET', 'POST'],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        
        // Añadir headers de seguridad
        this.app.use((req, res, next) => {
            res.header('Cross-Origin-Resource-Policy', 'cross-origin');
            res.header('Cross-Origin-Embedder-Policy', 'require-corp');
            res.header('Cross-Origin-Opener-Policy', 'same-origin');
            next();
        });

        this.app.use(express.json());
        
        // Servir archivos estáticos desde la carpeta docs
        this.app.use('/DescargaYT', express.static('docs'));
    }

    setupRoutes() {
        this.app.get('/DescargaYT/backend/info', this.getVideoInfo.bind(this));
        this.app.get('/DescargaYT/backend/download', this.downloadVideo.bind(this));
    }

    async getVideoInfo(req, res) {
        try {
            const { url } = req.query;
            const info = await ytdl.getInfo(url);
            
            const qualities = info.formats
                .filter(format => format.hasVideo && format.hasAudio)
                .map(({ itag, qualityLabel, container }) => ({
                    itag,
                    qualityLabel,
                    container
                }));

            res.json({
                title: info.videoDetails.title,
                thumbnail: info.videoDetails.thumbnails[0].url,
                qualities
            });
        } catch (error) {
            console.error('Error al obtener información:', error);
            res.status(500).json({ error: 'Error al obtener información del video' });
        }
    }

    async downloadVideo(req, res) {
        try {
            const { url, quality, format } = req.query;
            const info = await ytdl.getInfo(url);
            const videoTitle = this.sanitizeFileName(info.videoDetails.title);

            const stream = this.createDownloadStream(url, quality, format);
            await this.handleVideoStream(stream, res, videoTitle, format);

        } catch (error) {
            console.error('Error en descarga:', error);
            res.status(500).json({ error: 'Error al descargar el video' });
        }
    }

    sanitizeFileName(fileName) {
        return fileName.replace(/[^\w\s]/gi, '');
    }

    createDownloadStream(url, quality, format) {
        return ytdl(url, {
            quality: quality || 'highest',
            filter: format === 'mp3' ? 'audioonly' : 'audioandvideo'
        });
    }

    async handleVideoStream(stream, res, videoTitle, format) {
        const passThrough = new PassThrough();
        stream.pipe(passThrough);

        const chunks = [];
        
        return new Promise((resolve, reject) => {
            passThrough.on('data', chunk => chunks.push(chunk));
            
            passThrough.on('end', () => {
                const buffer = Buffer.concat(chunks);
                this.setResponseHeaders(res, videoTitle, format);
                res.send(buffer);
                resolve();
            });

            passThrough.on('error', error => {
                console.error('Error en el stream:', error);
                reject(error);
            });
        });
    }

    setResponseHeaders(res, videoTitle, format) {
        res.header('Content-Disposition', `attachment; filename="${videoTitle}.${format}"`);
        res.header('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');
    }

    start(port = 3000) {
        return new Promise((resolve) => {
            this.server = this.app.listen(port, () => {
                console.log(`Servidor corriendo en http://localhost:${port}`);
                resolve(this.server);
            });
        });
    }

    stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    this.server = null;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

// Solo exportamos la clase si no estamos en el entorno principal
if (require.main !== module) {
    module.exports = { VideoDownloader };
} else {
    const downloader = new VideoDownloader();
    downloader.start();
} 