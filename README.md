# DescargaYT

## Configuración de Variables de Entorno

1. Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Configura tus variables en `.env`

## Estructura
- `/docs`: Frontend (GitHub Pages)
- `/`: Backend (Render)

## Desarrollo Local

1. Instalar dependencias:
```bash
yarn install
```

2. Iniciar desarrollo:
```bash
yarn dev
```

## Despliegue

### Frontend
Se despliega automáticamente a GitHub Pages al hacer push a main.

### Backend
Se despliega automáticamente a Render al hacer push a main.

## Variables de Entorno
Crear en Render:
- `YOUTUBE_API_KEY`: Clave de API de YouTube
- `FRONTEND_URL`: URL del frontend
- `ALLOWED_ORIGINS`: Orígenes permitidos para CORS

## Licencia
ISC