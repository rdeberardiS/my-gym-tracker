# 📲 Cómo poner la app online

Esta guía te ayuda a subir tu app a internet **sin instalar nada en tu computadora**.

Cuando termines, vas a tener un link como `https://gym-tracker-tuyo.vercel.app` que podés abrir desde cualquier dispositivo.

**Tiempo total: 10-15 minutos**. Después, los updates son automáticos.

---

## Lo que vamos a hacer

1. Subir el código a **GitHub** (5 min)
2. Conectar **Vercel** con tu GitHub (3 min)
3. Esperar el build automático (3 min)
4. Listo, tenés tu link 🎉

---

## Paso 1: Subir el código a GitHub

GitHub ya lo conocés del intento anterior. Ahora vamos por un camino más directo.

### 1.1 — Crear el repositorio

1. Andá a https://github.com/new
2. **Repository name**: `gym-tracker`
3. **Visibility**: dejá en **Public** (necesario para Vercel gratis).
4. **NO marques** ninguna casilla de "Initialize repository with..." — dejá todo en blanco.
5. Hacé clic en **"Create repository"** (botón verde abajo).

### 1.2 — Subir los archivos

GitHub te muestra una página con instrucciones. Ignoralas todas. Hacé esto:

1. En esa misma página, vas a ver arriba la frase **"creating a new file"** y **"uploading an existing file"** (ambas son links celestes).
2. Hacé clic en **"uploading an existing file"**.
3. Se abre una pantalla que dice "Drag files here..."

### 1.3 — Subir el ZIP en vez de archivos sueltos

**Aquí está el truco**: en vez de arrastrar archivos uno por uno (que pierde estructura de carpetas), vamos a usar la opción de seleccionar el archivo ZIP.

⚠️ **Importante**: GitHub no acepta ZIPs directos, así que vamos a hacer esto:

**Opción A: Si tenés Windows 11 o Windows 10 reciente**

1. Abrí el Explorador de Archivos.
2. Andá a donde tenés descomprimido el zip (carpeta `gym-tracker`).
3. **Entrá adentro de la carpeta** (que veas package.json, README.md, src, etc.).
4. Hacé clic en la barra de direcciones de arriba.
5. Apretá **Ctrl + A** para seleccionar todo.
6. Sin soltar, **arrastrá TODOS los archivos + la carpeta src** a la zona azul de GitHub que dice "Drag files here".
7. Esperá a que aparezcan todos los archivos en la lista. Verificá que **src** aparezca como carpeta (con su flecha para expandir).

**Opción B: Si la opción A no te funciona o se complica**

Decime y te paso una alternativa: yo mismo te creo el repositorio en mi cuenta y vos lo "forkeás" (copiás) con un solo clic.

### 1.4 — Confirmar la subida

Abajo de la lista de archivos vas a ver una caja que dice "Commit changes".

1. Donde dice "Add files via upload" podés dejarlo así o escribir algo como "primera versión".
2. Hacé clic en el botón verde **"Commit changes"**.

⏳ Espera 1-2 minutos para que termine de procesar.

✅ Cuando termine, vas a ver el código en tu repositorio (carpetas y archivos listados).

---

## Paso 2: Conectar Vercel

### 2.1 — Crear cuenta en Vercel

1. Andá a https://vercel.com/signup
2. Hacé clic en **"Continue with GitHub"**.
3. Te va a pedir autorización: aceptá. Vercel necesita acceso a GitHub para leer tu repositorio.

### 2.2 — Importar el proyecto

1. Una vez dentro de Vercel, vas a ver una pantalla que dice "Import Git Repository".
2. Vas a ver tu repositorio `gym-tracker` en la lista.
3. Hacé clic en **"Import"** al lado del repositorio.

### 2.3 — Configurar el proyecto

En la siguiente pantalla, Vercel detecta automáticamente que es un proyecto de Vite.

1. **Project Name**: dejalo como está (`gym-tracker`) o cambiá el nombre si querés.
2. **Framework Preset**: debe decir **Vite** (auto-detectado).
3. **Root Directory**: dejalo en `./`.
4. **Build and Output Settings**: NO TOQUES NADA, ya está configurado.
5. **Environment Variables**: no agregues ninguna.

Hacé clic en el botón grande **"Deploy"**.

### 2.4 — Esperar el build

Vercel va a:
1. Bajar tu código de GitHub.
2. Instalar las dependencias.
3. Buildear la app.
4. Publicarla en internet.

⏳ Esto tarda **2-3 minutos**. Vas a ver una animación de loading.

✅ Cuando termine, vas a ver fuegos artificiales 🎉 y un botón "Continue to Dashboard".

---

## Paso 3: Obtener tu link

1. En el dashboard, vas a ver tu proyecto.
2. Arriba, vas a ver una URL parecida a `https://gym-tracker-abc123.vercel.app`.
3. **Esa es tu app**. Hacé clic y se abre. ✨

---

## Paso 4: Usarla en el iPhone

1. Abrí Safari en el iPhone.
2. Pegá la URL.
3. Tocá el botón de compartir (cuadrado con flecha hacia arriba).
4. Tocá **"Añadir a pantalla de inicio"**.
5. Tocá **"Añadir"**.

Listo. Ahora tenés el ícono en tu pantalla de inicio del iPhone, como una app nativa.

---

## Cómo actualizar la app en el futuro

Cuando yo te entregue una nueva versión (Parte 2, Parte 3, etc.), vas a tener que actualizar el código en GitHub. Hay dos formas:

**Forma A (más fácil)**: Yo te paso los archivos cambiados y vos los subís a GitHub reemplazando los anteriores. Vercel se va a re-deployar solo automáticamente.

**Forma B (la mejor)**: Yo me sumo como colaborador de tu GitHub y subo los cambios directamente, vos solo refrescás la app.

Lo vemos cuando llegue el momento.

---

## Si algo sale mal

- **No me sale el paso 1**: Decime cuál exactamente y te ayudo.
- **Vercel da error de build**: Mandame captura del error.
- **Veo la app pero está rara**: Decime qué pasa, yo lo arreglo.
- **No quiero hacer esto sola**: Decímelo y vemos una alternativa (puedo ayudarte de otra forma).

---

## Resumen ultra rápido

1. github.com/new → crear repo `gym-tracker` → subir archivos
2. vercel.com/signup → login con GitHub → import → deploy
3. Esperar 3 min → tener tu link → agregar al iPhone

¡Buena suerte!
