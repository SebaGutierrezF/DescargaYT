class YouTubeDownloader {
    constructor() {
        this.API_URL = 'https://youtube-downloader-backend.sebagutierrezf.com';
        this.elements = {
            url: document.getElementById('url'),
            error: document.getElementById('error'),
            videoInfo: document.getElementById('video-info'),
            infoButton: document.getElementById('info-button'),
            videoTitle: document.getElementById('video-title'),
            thumbnail: document.getElementById('thumbnail'),
            quality: document.getElementById('quality'),
            format: document.getElementById('format'),
            downloadButton: document.getElementById('download-button'),
            progressContainer: document.getElementById('progress-container'),
            progressBar: document.getElementById('progress'),
            progressText: document.getElementById('progress-text')
        };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.elements.infoButton.addEventListener('click', () => this.obtenerInfo());
        this.elements.format.addEventListener('change', () => this.toggleQualitySelect());
        this.elements.downloadButton.addEventListener('click', () => this.descargar());
    }

    async obtenerInfo() {
        if (!this.validateUrl()) return;

        this.elements.infoButton.disabled = true;

        try {
            const data = await this.fetchVideoInfo();
            this.updateVideoInterface(data);
        } catch (error) {
            this.showError('Error al obtener información del video');
        } finally {
            this.elements.infoButton.disabled = false;
        }
    }

    validateUrl() {
        const url = this.elements.url.value;
        if (!url) {
            this.showError('Por favor ingresa una URL');
            return false;
        }
        return true;
    }

    async fetchVideoInfo() {
        try {
            const response = await fetch(`${this.API_URL}/info?url=${encodeURIComponent(this.elements.url.value)}`, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching video info:', error);
            throw error;
        }
    }

    updateVideoInterface(data) {
        this.elements.videoTitle.textContent = data.title;
        this.elements.thumbnail.src = data.thumbnail;
        this.updateQualityOptions(data.qualities);
        this.elements.videoInfo.style.display = 'block';
        this.elements.error.textContent = '';
    }

    updateQualityOptions(qualities) {
        this.elements.quality.innerHTML = qualities
            .map(quality => `
                <option value="${quality.itag}">
                    ${quality.qualityLabel}
                </option>
            `)
            .join('');
    }

    toggleQualitySelect() {
        const isVideo = this.elements.format.value === 'mp4';
        this.elements.quality.parentElement.style.display = isVideo ? 'block' : 'none';
    }

    descargar() {
        this.elements.downloadButton.disabled = true;
        this.showProgressUI();

        const downloadUrl = this.createDownloadUrl();
        this.initiateDownload(downloadUrl);
    }

    createDownloadUrl() {
        const params = new URLSearchParams({
            url: this.elements.url.value,
            format: this.elements.format.value,
            quality: this.elements.quality.value
        });
        return `${this.API_URL}/download?${params.toString()}`;
    }

    initiateDownload(url) {
        try {
            const link = document.createElement('a');
            link.href = url;
            link.rel = 'noopener noreferrer';
            link.target = '_blank';
            link.download = '';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.finalizeDownload();
        } catch (error) {
            console.error('Error initiating download:', error);
            this.showError('Error al iniciar la descarga');
        }
    }

    showProgressUI() {
        this.elements.progressContainer.style.display = 'block';
        this.elements.progressBar.style.width = '0%';
        this.elements.progressText.textContent = 'Iniciando descarga...';
    }

    finalizeDownload() {
        this.elements.progressText.textContent = 'Descarga iniciada. Revisa tu carpeta de descargas.';
        this.elements.downloadButton.disabled = false;
    }

    showError(message) {
        this.elements.error.textContent = message;
        this.elements.videoInfo.style.display = 'none';
    }
}

// Inicializar la aplicación y hacerla globalmente accesible
let downloader;
document.addEventListener('DOMContentLoaded', () => {
    downloader = new YouTubeDownloader();
}); 