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

[... resto del README igual ...]