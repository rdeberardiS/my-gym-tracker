# 🔄 Cómo actualizar la app

Esta es la **versión 2** de la app, con todas las pantallas funcionando.

Como tu app ya está online en `my-gym-tracker-iota.vercel.app`, **solo necesitás reemplazar los archivos en GitHub** y Vercel deploya solo la nueva versión.

**Tiempo total: 5 minutos**.

---

## Lo que vas a hacer

1. Borrar los archivos viejos del repo en GitHub.
2. Subir los nuevos.
3. Esperar que Vercel re-deploye solo.
4. Listo, refrescás la app y ves la nueva versión.

---

## Paso 1: Descomprimir el ZIP nuevo

1. Andá a Descargas y buscá el ZIP nuevo (algo como `gym-tracker-parte-completa.zip`).
2. **Clic derecho** → "Extraer todo..." → Elegí el Escritorio como destino.
3. Te crea una carpeta `gym-tracker` con todos los archivos.

---

## Paso 2: Borrar archivos viejos en GitHub

1. Andá a tu repositorio: **https://github.com/rdeberardiS/my-gym-tracker**
2. Vas a ver la lista de archivos y carpetas.
3. **Tenés que borrar TODOS los archivos y carpetas** que están ahí.

### Cómo borrar todos los archivos rápido

GitHub no tiene un "seleccionar todo y borrar", pero podés hacer lo siguiente:

**Forma rápida (recomendada): borrar y subir todo en un mismo commit**

1. Andá a tu repo.
2. Hacé clic en cualquier carpeta o archivo (por ejemplo `src`).
3. Adentro vas a ver más archivos.
4. Buscá un ícono que diga ⋯ o "..." arriba a la derecha → puede haber opción de "Delete file" o similar.
5. Borrá uno por uno (es tedioso pero seguro).

**Forma alternativa (más fácil): reemplazá los archivos subiendo encima**

GitHub permite subir un archivo con el mismo nombre y lo sobrescribe. Pero como hay carpetas nuevas (`pages/PaginaEjercicio.tsx`, etc.) lo más limpio es borrar y empezar de cero.

---

## Paso 2 (alternativa más fácil): Volver a subir TODO de cero

Lo más simple y a prueba de errores:

1. Andá a tu repo: **https://github.com/rdeberardiS/my-gym-tracker**
2. **Clic en "Settings"** (arriba a la derecha del repo, no de tu cuenta).
3. Bajá hasta abajo del todo, en la sección **"Danger Zone"** (en rojo).
4. Hacé clic en **"Delete this repository"**.
5. Te va a pedir confirmar escribiendo el nombre del repo: `rdeberardiS/my-gym-tracker`. Lo pegás y confirmás.

Esto **borra el repo viejo**. Después:

6. Andá a https://github.com/new y creá uno con el MISMO nombre: `my-gym-tracker`
7. Subí todos los archivos de la carpeta `gym-tracker` (como hicimos la primera vez).
8. Vercel va a notar que cambió el repo y deployar automáticamente la nueva versión.

⚠️ **Importante**: si elegís borrar el repo, **NO se borra tu app de Vercel** (porque ya está deployada). Pero los próximos deploys necesitan el repo, por eso lo recreás.

---

## Paso 3: Esperar Vercel

Cuando termines de subir los archivos, Vercel detecta el cambio y empieza a deployar solo.

1. Andá a https://vercel.com
2. Entrá a tu proyecto `my-gym-tracker`.
3. En "Deployments" vas a ver uno **"Building..."** (en amarillo). Espera 2-3 minutos.
4. Cuando termina cambia a **"Ready"** (verde).

---

## Paso 4: Probar la versión nueva

1. Abrí tu app: `https://my-gym-tracker-iota.vercel.app`
2. Si la tenés en el iPhone, abrila desde el ícono.
3. **Refrescá la página** (en el iPhone: cerrá y volvé a abrir desde la pantalla de inicio).
4. Vas a ver:
   - Toda tu rutina cargada anteriormente sigue ahí (no se pierde).
   - El botón "Empezar entrenamiento" ahora **funciona**.
   - La pantalla de entrenamiento con grilla de series.
   - El calendario de Progreso.

---

## Si algo sale mal

- **El botón "Empezar" sigue con el alert viejo**: cerrá la app totalmente y volvé a abrirla.
- **Vercel da error de build**: mostrame captura.
- **Otra cosa rara**: cualquier captura me sirve.

---

¡Ánimo, ya casi! Es el último paso.
