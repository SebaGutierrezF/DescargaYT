# DescargaYT

## Estructura
El proyecto está dividido en:
- Frontend: Alojado en GitHub Pages (`/docs`)
- Backend: Cloudflare Worker (`worker.js`)

## Desarrollo Local

1. Instalar Wrangler (CLI de Cloudflare Workers):
```bash
npm install -g wrangler
```

2. Autenticarse:
```bash
wrangler login
```

3. Desarrollar localmente:
```bash
wrangler dev
```

## Despliegue

1. Frontend (automático con GitHub Actions)
2. Backend:
```bash
wrangler publish
```

## Demo en vivo
La aplicación está disponible en: https://sebagutierrezf.github.io/DescargaYT/

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