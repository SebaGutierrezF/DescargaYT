class YouTubeDownloader {
    constructor(config) {
        this.config = config;
        this.elements = this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        return {
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
    }

    initializeEventListeners() {
        this.elements.infoButton.addEventListener('click', () => this.obtenerInfo());
        this.elements.format.addEventListener('change', () => this.toggleQualitySelect());
        this.elements.downloadButton.addEventListener('click', () => this.descargar());
    }

    async obtenerInfo() {
        if (!this.validateUrl()) return;

        this.elements.infoButton.disabled = true;

        this.clearPreviousData();

        try {
            const timestamp = new Date().getTime();
            const url = `${this.config.API_URL}/info?url=${encodeURIComponent(this.elements.url.value)}&_t=${timestamp}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                cache: 'no-store'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.updateVideoInterface(data);
        } catch (error) {
            console.error('Error fetching video info:', error);
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
            const response = await fetch(`${this.config.API_URL}/info?url=${encodeURIComponent(this.elements.url.value)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
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
        return `${this.config.API_URL}/download?${params.toString()}`;
    }

    initiateDownload(url) {
        window.location.href = url;
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

    clearPreviousData() {
        this.elements.videoTitle.textContent = '';
        this.elements.thumbnail.src = '';
        this.elements.quality.innerHTML = '';
        this.elements.error.textContent = '';
        this.elements.videoInfo.style.display = 'none';
        this.elements.progressContainer.style.display = 'none';
        this.elements.progressBar.style.width = '0%';
        this.elements.progressText.textContent = '';
        
        this.elements.format.selectedIndex = 0;
        this.elements.quality.selectedIndex = 0;
        
        if (this.elements.thumbnail.src) {
            const oldSrc = this.elements.thumbnail.src;
            this.elements.thumbnail.src = '';
            URL.revokeObjectURL(oldSrc);
        }
    }
}

// Configuración directa
const developmentConfig = {
    "API_URL": "http://localhost:3000",
    "allowedFormats": ["mp4", "mp3"],
    "maxFileSize": "2GB"
};

const productionConfig = {
    "API_URL": "https://youtube-downloader.onrender.com",
    "allowedFormats": ["mp4", "mp3"],
    "maxFileSize": "2GB"
};

// Inicialización
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const config = isDevelopment ? developmentConfig : productionConfig;

window.downloader = new YouTubeDownloader(config); 