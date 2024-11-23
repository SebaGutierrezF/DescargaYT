require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { exec } = require('youtube-dl-exec');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL
}));

class DownloadService {
  static async downloadVideo(url, format) {
    const outputFormat = format === 'mp3' ? 'bestaudio' : 'bestvideo+bestaudio';
    return await exec(url, {
      format: outputFormat,
      output: '%(title)s.%(ext)s',
      extractAudio: format === 'mp3',
      audioFormat: format === 'mp3' ? 'mp3' : null,
    });
  }
}

app.get('/download', async (req, res) => {
  try {
    const { url, format } = req.query;
    const output = await DownloadService.downloadVideo(url, format);
    res.download(output);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
}); 