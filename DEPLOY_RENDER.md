# 🚀 Despliegue en Render

## Prerrequisitos

1. Cuenta en [Render.com](https://render.com)
2. Repositorio de Git (GitHub, GitLab, etc.) con tu código

---

## Paso 1: Crear Base de Datos PostgreSQL

1. En Render Dashboard, haz clic en **"New +"** → **"PostgreSQL"**
2. Configuración:
   - **Name**: `pos-system-db` (o el nombre que prefieras)
   - **Database**: `posdb`
   - **User**: Se genera automáticamente
   - **Region**: Elige la más cercana a tus usuarios
   - **Plan**: Free (para pruebas) o Starter ($7/mes recomendado para producción)
3. Haz clic en **"Create Database"**
4. **Guarda las credenciales**:
   - Internal Database URL (para usar dentro de Render)
   - External Database URL (para acceso remoto)

---

## Paso 2: Crear Web Service con Docker

1. En Render Dashboard, haz clic en **"New +"** → **"Web Service"**
2. Conecta tu repositorio de Git
3. Configuración:
   - **Name**: `pos-system-api`
   - **Region**: La misma que tu base de datos
   - **Branch**: `main` (o la rama que uses)
   - **Runtime**: **Docker**
   - **Instance Type**: Free (para pruebas) o Starter ($7/mes)

---

## Paso 3: Variables de Entorno

En la sección **"Environment"** del Web Service, agrega las siguientes variables:

```bash
NODE_ENV=production
PORT=3000
FRONTEND_URL=<url-de-tu-frontend> # ej: https://mi-tienda.vercel.app

# Database (usa la Internal Database URL de tu PostgreSQL)
DB_HOST=<hostname-de-tu-db-en-render>
DB_PORT=5432
POSTGRES_USER=<usuario-generado>
POSTGRES_PASSWORD=<password-generado>
POSTGRES_DB=posdb

# JWT Secret (genera uno seguro)
JWT_SECRET=<tu-secreto-super-seguro-aqui>
```

> **Tip**: Para obtener los valores de la base de datos, ve a tu servicio PostgreSQL en Render y copia la "Internal Database URL". Extrae de ahí el host, user y password.

Alternativamente, puedes usar la URL completa:

```bash
DATABASE_URL=postgresql://user:password@hostname:5432/posdb
```

Y modificar `app.module.ts` para usar `DATABASE_URL` directamente.

---

## Paso 4: Build Command

Render automáticamente detectará el `Dockerfile` y lo usará. No necesitas configurar Build Command manualmente.

---

## Paso 5: Health Check Path (Opcional pero recomendado)

Si tienes un endpoint de health check (ej: `GET /health`), configúralo:

- **Health Check Path**: `/health`

Si no lo tienes, puedes agregar uno rápido en `app.controller.ts`:

```typescript
@Get('health')
health() {
  return { status: 'ok' };
}
```

---

## Paso 6: Deploy

1. Haz clic en **"Create Web Service"**
2. Render comenzará el build automáticamente
3. Espera a que el deploy termine (puede tardar 3-5 minutos)
4. Tu API estará disponible en: `https://pos-system-api.onrender.com`

---

## Verificación

### 1. Verifica que la API esté viva:

```bash
curl https://pos-system-api.onrender.com/health
```

### 2. Verifica el admin seeding:

Revisa los logs en Render Dashboard. Deberías ver:

```
[Nest] LOG [UsersService] Default admin user created: admin@admin.com / admin123
[Nest] LOG [ConfigurationService] Default configuration created: POS System
```

### 3. Prueba el login:

```bash
POST https://pos-system-api.onrender.com/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

---

## Dominio Personalizado (Opcional)

1. En tu Web Service, ve a **"Settings"** → **"Custom Domain"**
2. Agrega tu dominio (ej: `api.mitienda.com`)
3. Configura el DNS según las instrucciones de Render

---

## SSL/HTTPS

Render proporciona **SSL automático y gratuito** para todos los servicios, tanto en el dominio `.onrender.com` como en dominios personalizados.

---

## Monitoreo y Logs

- **Logs en vivo**: Render Dashboard → Tu servicio → "Logs"
- **Métricas**: Render Dashboard → Tu servicio → "Metrics"
- **Alertas**: Configura notificaciones en "Settings" → "Notifications"

---

## Costos Estimados

| Servicio    | Plan    | Costo/Mes             |
| ----------- | ------- | --------------------- |
| PostgreSQL  | Free    | $0                    |
| PostgreSQL  | Starter | $7                    |
| Web Service | Free    | $0 (con limitaciones) |
| Web Service | Starter | $7                    |

**Recomendación para Producción**: Starter Plan para ambos servicios ($14/mes total)

---

## Troubleshooting

### Error: "Application failed to respond"

- Verifica que `PORT=3000` esté configurado
- Verifica que la app escuche en `0.0.0.0`, no solo en `localhost`

### Error: "Can't connect to database"

- Usa la **Internal Database URL** (no External)
- Verifica las variables de entorno

### Error: "relation does not exist"

- Las migraciones se ejecutan automáticamente al iniciar la app
- Verifica en los logs que veas: `query: SELECT * FROM "migrations"`
- Si no se ejecutaron, las migraciones están en `dist/migrations/`

### El build falla

- Revisa los logs de build
- Asegúrate de que `Dockerfile` esté en la raíz del repo
- Verifica que `.dockerignore` no excluya archivos necesarios

---

## Actualizaciones

Render se actualiza automáticamente cuando haces `git push` a la rama configurada (ej: `main`).

### Despliegue manual:

Render Dashboard → Tu servicio → **"Manual Deploy"** → "Deploy latest commit"

---

## Backup de Base de Datos

Render hace backups automáticos en planes Starter y superiores. Para el plan Free, debes hacer backups manuales.

**Backup manual**:

```bash
pg_dump <EXTERNAL_DATABASE_URL> > backup.sql
```

**Restaurar**:

```bash
psql <EXTERNAL_DATABASE_URL> < backup.sql
```
