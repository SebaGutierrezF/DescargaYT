# DescargaYT

## Demo en vivo
La aplicación está disponible en: https://sebagutierrezf.github.io/DescargaYT/

## Estructura
El proyecto está desplegado completamente en GitHub Pages:
- Frontend: `/docs`
- Backend: `/backend`

## Desarrollo Local

1. Clonar el repositorio:
```bash
git clone https://github.com/sebagutierrezf/DescargaYT.git
cd DescargaYT
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

4. Abrir http://localhost:3000 en el navegador

## Despliegue
El proyecto se despliega automáticamente en GitHub Pages cuando se hace push a main.
- Frontend: Los archivos en `/docs` se despliegan en la raíz
- Backend: Los archivos del servidor se despliegan en `/backend`

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