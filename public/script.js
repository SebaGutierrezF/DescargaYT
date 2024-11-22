async function obtenerInfo() {
    const url = document.getElementById('url').value;
    const errorDiv = document.getElementById('error');
    const videoInfo = document.getElementById('video-info');
    const infoButton = document.getElementById('info-button');

    if (!url) {
        errorDiv.textContent = 'Por favor ingresa una URL';
        return;
    }

    infoButton.disabled = true;

    try {
        const response = await fetch(`/info?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        if (response.ok) {
            document.getElementById('video-title').textContent = data.title;
            document.getElementById('thumbnail').src = data.thumbnail;
            
            const qualitySelect = document.getElementById('quality');
            qualitySelect.innerHTML = '';
            
            data.qualities.forEach(quality => {
                const option = document.createElement('option');
                option.value = quality.itag;
                option.textContent = quality.qualityLabel;
                qualitySelect.appendChild(option);
            });

            videoInfo.style.display = 'block';
            errorDiv.textContent = '';
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        errorDiv.textContent = 'Error al obtener información del video';
        videoInfo.style.display = 'none';
    } finally {
        infoButton.disabled = false;
    }
}

function toggleQualitySelect() {
    const format = document.getElementById('format').value;
    const qualityContainer = document.getElementById('quality-container');
    qualityContainer.style.display = format === 'mp4' ? 'block' : 'none';
}

function descargar() {
    const url = document.getElementById('url').value;
    const format = document.getElementById('format').value;
    const quality = document.getElementById('quality').value;
    const downloadButton = document.getElementById('download-button');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress');
    const progressText = document.getElementById('progress-text');

    downloadButton.disabled = true;
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.textContent = 'Iniciando descarga...';

    // Crear un elemento <a> invisible para la descarga
    const link = document.createElement('a');
    link.href = `/download?url=${encodeURIComponent(url)}&format=${format}&quality=${quality}`;
    link.style.display = 'none';
    document.body.appendChild(link);
    
    // Iniciar la descarga
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    
    // Mostrar mensaje
    progressText.textContent = 'Descarga iniciada. Revisa tu carpeta de descargas.';
    downloadButton.disabled = false;
} 