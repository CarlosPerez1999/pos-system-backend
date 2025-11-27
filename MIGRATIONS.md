# Migraciones de Base de Datos

Este proyecto utiliza **TypeORM Migrations** para manejar el esquema de la base de datos de forma controlada y versionada.

## ¿Por qué usar migraciones?

✅ **Control de versiones**: Cada cambio en la base de datos queda registrado  
✅ **Reversibilidad**: Puedes revertir cambios si algo sale mal  
✅ **Seguridad en producción**: No se borran datos accidentalmente  
✅ **Trabajo en equipo**: Todos los desarrolladores tienen el mismo esquema

---

## Comandos disponibles

### Generar una nueva migración

Compara tu esquema actual (entidades) con la base de datos y genera los cambios necesarios:

```bash
pnpm run migration:generate src/migrations/NombreDeLaMigracion
```

**Ejemplo:**

```bash
pnpm run migration:generate src/migrations/AddPhoneToUsers
```

### Ejecutar migraciones pendientes

Aplica todas las migraciones que aún no se han ejecutado:

```bash
pnpm run migration:run
```

### Revertir la última migración

Deshace la última migración ejecutada:

```bash
pnpm run migration:revert
```

---

## Cómo funciona en producción

1. **Build**: El Dockerfile compila todo el código TypeScript a JavaScript en `dist/`
2. **Startup**: Al iniciar la app, TypeORM ejecuta automáticamente las migraciones pendientes gracias a `migrationsRun: true` en `app.module.ts`
3. **Tracking**: TypeORM crea una tabla `migrations` en tu base de datos para saber qué migraciones ya se ejecutaron

---

## Flujo de trabajo típico

### 1. Modificas una entidad

Ejemplo: agregas un campo `phoneNumber` a `User`:

```typescript
@Column({ nullable: true })
phoneNumber?: string;
```

### 2. Generas la migración

```bash
pnpm run migration:generate src/migrations/AddPhoneToUsers
```

Esto crea un archivo como `src/migrations/1732690123456-AddPhoneToUsers.ts` con:

- Método `up()`: Agrega la columna
- Método `down()`: Elimina la columna (para revertir)

### 3. Verificas la migración

Abre el archivo generado y revisa que los cambios sean correctos.

### 4. Haces commit

```bash
git add src/migrations/
git commit -m "feat: add phone number to users"
git push
```

### 5. Despliegas

Render detecta el nuevo código, hace build y al iniciar la app ejecuta la migración automáticamente.

---

## Migración inicial

La migración `1732690000000-InitialSchema.ts` crea todas las tablas del sistema:

- ✅ `users` (con roles)
- ✅ `products`
- ✅ `sales` y `sale_items`
- ✅ `inventory`
- ✅ `configuration`

Esta migración se ejecuta automáticamente la primera vez que despliegas.

---

## ⚠️ IMPORTANTE

- **NUNCA** modifiques una migración que ya fue ejecutada en producción
- **NUNCA** borres archivos de migración
- Si necesitas hacer un cambio, crea una **nueva migración**
- En producción, `synchronize` está en `false` para evitar cambios automáticos

---

## Troubleshooting

### "No changes in database schema were found"

✅ Esto es normal, significa que tus entidades ya están sincronizadas con la BD

### "Error: relation already exists"

❌ Probablemente intentaste ejecutar una migración dos veces  
**Solución**: Revisa la tabla `migrations` en tu base de datos

### Las migraciones no se ejecutan en producción

1. Verifica que el build haya incluido `dist/migrations/*.js`
2. Revisa los logs al iniciar la app
3. Confirma que `migrationsRun: true` esté en `app.module.ts`

---

## Para desarrollo local

Si quieres probar las migraciones localmente:

1. Asegúrate de tener PostgreSQL corriendo
2. Configura tu `.env` con las credenciales locales
3. Ejecuta: `pnpm run migration:run`

**Nota**: Si tienes `synchronize: true` en desarrollo, no necesitas migraciones (TypeORM crea/actualiza las tablas automáticamente).
