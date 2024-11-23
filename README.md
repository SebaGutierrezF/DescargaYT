# DescargaYT

Un descargador de videos de YouTube moderno y eficiente construido con Node.js.

## Demo en vivo
Frontend: https://sebagutierrezf.github.io/DescargaYT/
Backend: https://tu-backend-url.herokuapp.com

## Estructura
El proyecto está dividido en dos partes:
- Frontend: Alojado en GitHub Pages
- Backend: API REST alojada en un servidor (Heroku, Railway, etc.)

## Configuración

1. Frontend (GitHub Pages):
   - Los archivos estáticos están en la carpeta `/docs`
   - Se despliega automáticamente con GitHub Actions

2. Backend:
   - Servidor Express con ytdl-core
   - Necesita las siguientes variables de entorno:
     ```
     PORT=3000
     CORS_ORIGIN=https://sebagutierrezf.github.io
     ```

## Despliegue

### Backend
El backend se despliega automáticamente en GitHub Container Registry cuando se hace push a main.

Para ejecutar el contenedor localmente:

```bash
# Descargar la imagen
docker pull ghcr.io/sebagutierrezf/descargayt:latest

# Ejecutar el contenedor
docker run -p 3000:3000 ghcr.io/sebagutierrezf/descargayt:latest
```

### Frontend
El frontend se despliega automáticamente en GitHub Pages.

## Seguridad
El proyecto implementa las siguientes medidas de seguridad:

- CORS configurado para orígenes específicos
- Headers de seguridad para prevenir ataques XSS
- Manejo seguro de descargas
- Validación de URLs
- Sanitización de nombres de archivo

## Variables de Entorno
El backend requiere las siguientes variables:

```bash
NODE_ENV=production
CORS_ORIGIN=https://sebagutierrezf.github.io
```