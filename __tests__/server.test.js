const request = require('supertest');
const { VideoDownloader } = require('../server');

describe('VideoDownloader', () => {
    let downloader;
    
    beforeEach(() => {
        downloader = new VideoDownloader();
    });

    describe('GET /info', () => {
        it('debería obtener información del video correctamente', async () => {
            const response = await request(downloader.app)
                .get('/info')
                .query({ url: 'https://www.youtube.com/watch?v=ejemplo' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('title');
            expect(response.body).toHaveProperty('thumbnail');
            expect(response.body).toHaveProperty('qualities');
        });

        it('debería manejar errores en la URL', async () => {
            const response = await request(downloader.app)
                .get('/info')
                .query({ url: 'url-invalida' });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /download', () => {
        it('debería iniciar la descarga del video', async () => {
            const response = await request(downloader.app)
                .get('/download')
                .query({
                    url: 'https://www.youtube.com/watch?v=ejemplo',
                    quality: 'highest',
                    format: 'mp4'
                });

            expect(response.status).toBe(200);
            expect(response.header['content-type']).toBe('video/mp4');
        });
    });
}); 