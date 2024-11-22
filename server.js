const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const app = express();
const { PassThrough } = require('stream');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ruta para obtener información del video
app.get('/info', async (req, res) => {
    try {
        const { url } = req.query;
        const info = await ytdl.getInfo(url);
        
        const qualities = info.formats
            .filter(format => format.hasVideo && format.hasAudio)
            .map(format => ({
                itag: format.itag,
                qualityLabel: format.qualityLabel,
                container: format.container
            }));

        res.json({
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails[0].url,
            qualities: qualities
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta de descarga
app.get('/download', async (req, res) => {
    try {
        const { url, quality, format } = req.query;
        const info = await ytdl.getInfo(url);
        const videoTitle = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        const passThrough = new PassThrough();
        const stream = ytdl(url, {
            quality: quality || 'highest',
            filter: format === 'mp3' ? 'audioonly' : 'audioandvideo'
        });

        stream.pipe(passThrough);

        let data = [];
        passThrough.on('data', chunk => {
            data.push(chunk);
        });

        passThrough.on('end', () => {
            const buffer = Buffer.concat(data);
            res.header('Content-Disposition', `attachment; filename="${videoTitle}.${format}"`);
            res.header('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');
            res.send(buffer);
        });

        passThrough.on('error', error => {
            console.error('Error en descarga:', error);
            res.status(500).json({ error: error.message });
        });

    } catch (error) {
        console.error('Error en descarga:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
}); 