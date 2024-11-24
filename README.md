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
npm ci
```

2. Iniciar desarrollo:
```bash
npm run dev
```

## Variables de Entorno
Configurar en GitHub Secrets:
- `YOUTUBE_API_KEY`: Clave de API de YouTube
- `PO_TOKEN`: Token de YouTube
- `FRONTEND_URL`: URL del frontend
- `ALLOWED_ORIGINS`: Orígenes permitidos para CORS

## Despliegue
El proyecto se despliega automáticamente a:
- Frontend: GitHub Pages
- Backend: Render

Los despliegues se activan al hacer push a la rama main.

## Licencia
ISC