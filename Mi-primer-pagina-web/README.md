# Mi-primer-pagina-web

Pequeña web ejemplo con backend en Express para recibir contactos.

Instrucciones rápidas:

1. Instalar dependencias:

```bash
npm install
```

2. Iniciar servidor local:

```bash
npm start
```

3. Abrir en el navegador: http://localhost:3000

Credenciales de admin (para pruebas): establece la variable `ADMIN_TOKEN` o usa el valor por defecto `cambiame123`.

Variables de entorno:

- Crea un fichero `.env` en la raíz del proyecto (puedes copiar `.env.example`).
- Ejemplo de `.env`:

```
ADMIN_TOKEN=valor-seguro-que-debes-cambiar
PORT=3000
```

Para cargar las variables automáticamente en desarrollo usamos `dotenv`. Ejecuta `npm install` si añades nuevas dependencias.

Despliegue (GitHub → Render / Railway / Heroku)
--------------------------------------------

Opciones rápidas:

- Render: crea un nuevo Web Service y conecta tu repositorio de GitHub. En la configuración de Environment (Environment Variables) añade `ADMIN_TOKEN` con un valor seguro. También puedes definir `PORT` si es necesario.
- Railway: crea un proyecto, conecta el repo y define `ADMIN_TOKEN` en Environment.
- Heroku: `git push heroku main` (usa `Procfile` incluido). Define `ADMIN_TOKEN` en el panel de Config Vars.

Vercel
------

Para desplegar en Vercel (servidor Node):

1. Conecta tu repositorio a Vercel.
2. Asegúrate de que `vercel.json` existe en la raíz (ya incluido en este repo).
3. En Project Settings > Environment Variables añade `ADMIN_TOKEN` y pon el valor seguro.
4. Despliegue automático: Vercel desplegará en cada push a la rama conectada.

Nota: Vercel trata `@admin_token` en `vercel.json` como referencia a un secreto configurado en el proyecto; también puedes definir `ADMIN_TOKEN` manualmente en las Environment Variables.

Railway
-------

1. Crea un nuevo proyecto en Railway y conecta el repo de GitHub.
2. Define `ADMIN_TOKEN` en Environment variables dentro del proyecto Railway.
3. Railway detecta automáticamente el `start` script; si no, configura el comando `npm start`.

Configurar dominio y HTTPS
--------------------------

Vercel (pasos detallados):

1. En Vercel, ve a tu Project > Settings > Domains y haz clic en "Add" para añadir tu dominio (por ejemplo `midominio.com`).
2. Vercel mostrará los registros DNS que debes crear en el panel de tu proveedor de DNS (Cloudflare, GoDaddy, Namecheap, etc.).
	- Para un subdominio (`www.midominio.com`) añade un `CNAME` apuntando al valor que Vercel indique (por ejemplo `cname.vercel-dns.com`).
	- Para el dominio raíz (`midominio.com`) añade `A` records o usa `ALIAS`/`ANAME` si tu proveedor lo soporta. Vercel también podría recomendar un `A` record con IPs concretas.
3. Añade los registros en tu proveedor de DNS y espera la propagación (puede tardar minutos u horas). En Vercel, la interfaz mostrará el estado de verificación.
4. Vercel activa SSL automáticamente con Let's Encrypt; en `Settings > Domains` verás que el certificado se emite y el dominio pasa a `Secure`.
5. Opcional: configura la redirección canónica (forzar `www` o el root) en la sección de Domains o con reglas de redirección en `vercel.json`.

Consejos para Vercel:
- Si tu DNS no soporta `ALIAS/ANAME`, usa `www` y redirige desde el root en el proveedor de DNS o en Vercel.
- Si usas Cloudflare, desactiva temporalmente el proxy (modo naranja/Proxied) para la verificación; una vez verificado, puedes volver a activarlo y usar Cloudflare TLS.

Railway (pasos detallados):

1. En Railway, abre tu proyecto y ve a `Settings > Domains` (la UI puede variar según actualizaciones).
2. Añade tu dominio y Railway mostrará los registros DNS necesarios.
	- Para subdominio: añade un `CNAME` apuntando al host que Railway indique.
	- Para dominio raíz: añade los `A` records que Railway sugiera, o usa `ALIAS/ANAME` si lo permite tu DNS.
3. Una vez añadidos los registros en tu proveedor, Railway verificará el dominio; espera la propagación DNS.
4. Railway proporciona certificados SSL automáticos (Let's Encrypt) y los renovará por ti; confirma que el certificado aparece como activo en la UI.

Consejos para Railway:
- Evita registros DNS conflictivos (por ejemplo un `CNAME` en el root junto a `A` records).
- Con Cloudflare, desactiva el proxy durante la verificación y activa el proxy después si necesitas funcionalidades de Cloudflare.

Buenas prácticas comunes:

- Verifica la propagación DNS con `dig` o herramientas web (ej. https://dnschecker.org/).
- Comprueba el SSL con https://www.ssllabs.com/ssltest/ y prueba la URL en distintos navegadores y dispositivos.
- Configura redirecciones de `http` a `https` y canonicalización (`www` vs root) para SEO y evitar contenido duplicado.
- Añade `Strict-Transport-Security` si tu servidor lo soporta y tras verificar HTTPS estable.
- Mantén `ADMIN_TOKEN` y otros secretos en el panel de variables de entorno del proveedor; no los escribas en el repo.



GitHub Actions
---------------

Se incluye un workflow en `.github/workflows/ci.yml` que instala dependencias y ejecuta `npm test`. Si quieres desplegar automáticamente a Render, añade los siguientes Secrets en GitHub (`Settings > Secrets > Actions`):

- `RENDER_API_KEY` — tu API Key de Render
- `RENDER_SERVICE_ID` — el id del servicio en Render

Despliegue automático a Vercel desde GitHub Actions
-------------------------------------------------

Se incluye un workflow en `.github/workflows/vercel-deploy.yml` que usa el Vercel CLI para desplegar a producción cuando hay push a `main`.

Pasos para configurar:

1. Genera un `Token` en Vercel: en tu cuenta, ve a `Settings > Tokens` y crea un token de acceso.
2. En tu repositorio de GitHub, ve a `Settings > Secrets and variables > Actions` y añade un secret llamado `VERCEL_TOKEN` con el token generado.
3. Añade también `ADMIN_TOKEN` como secret en GitHub para que la variable de entorno se pase al despliegue (o configúrala directamente en Vercel si prefieres).
4. Al hacer push a `main` el workflow instalará la CLI y ejecutará `vercel --prod` usando el token.

Notas:
- Si prefieres usar `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID`, puedes configurarlos como secretos y adaptarlos en el workflow.
- Vercel también puede desplegar automáticamente si conectas el repositorio desde su panel; este workflow es una alternativa que fuerza `vercel --prod` desde Actions.


Al hacer push a `main` el workflow intentará disparar un deploy en Render si ambos secretos están presentes.

Configurar `ADMIN_TOKEN` en el entorno de producción
---------------------------------------------------

Independientemente del proveedor, establece la variable `ADMIN_TOKEN` (no la incluyas en el repositorio). Ejemplo en Render/Railway/Heroku: agrega `ADMIN_TOKEN` en la sección de variables de entorno con un valor fuerte.


Endpoints principales:

- `POST /api/contact` - enviar contacto (body JSON: nombre, email, mensaje)
- `POST /api/admin/login` - login admin (body JSON: password)
- `GET /api/contacts` - listar (header `x-admin-token` requerido)
- `DELETE /api/contacts/:id` - eliminar (header `x-admin-token` requerido)

Notas de despliegue:

- Usa HTTPS y un secreto fuerte para `ADMIN_TOKEN` en producción.
- Reemplaza el almacenamiento por archivo por una base de datos para mayor escalabilidad.
