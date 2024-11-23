# DescargaYT

## Configuración de Variables de Entorno

1. Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Configura tus variables en `.env`

3. Configura los secretos en GitHub:
   - CF_API_TOKEN
   - CF_ACCOUNT_ID
   - YOUTUBE_API_KEY

4. Configura los secretos en Cloudflare Workers:
```bash
npx wrangler secret put YOUTUBE_API_KEY
npx wrangler secret put CF_API_TOKEN
```

⚠️ IMPORTANTE: Nunca subas el archivo `.env` a GitHub

## Estructura
- `/docs`: Frontend (GitHub Pages)
- `/src`: Backend (Cloudflare Worker)

## Desarrollo Local

1. Instalar dependencias:
```bash
npm install
```

2. Configurar Cloudflare:
```bash
npx wrangler login
```

3. Iniciar desarrollo:
```bash
npm run dev
```

## Despliegue

### Frontend
Se despliega automáticamente a GitHub Pages al hacer push a main.

### Backend
Se despliega automáticamente a Cloudflare Workers al hacer push a main.

## Variables de Entorno
Crear en GitHub:
- `CF_API_TOKEN`: Token de API de Cloudflare
- `CF_ACCOUNT_ID`: ID de cuenta de Cloudflare

## Licencia
ISC