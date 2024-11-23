# DescargaYT

Descargador de videos de YouTube usando Cloudflare Workers y GitHub Pages.

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