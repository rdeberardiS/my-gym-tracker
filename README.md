# Gym Tracker — MVP

Tracker simple y rápido de musculación. PWA mobile-first.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Dexie.js (IndexedDB) para persistencia local
- Zustand para estado global
- Vitest para tests
- PWA via `vite-plugin-pwa`

## Setup inicial

```bash
npm install
```

## Comandos

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Tests (modo watch)
npm test

# Tests (modo single run, ideal para CI)
npm run test:run
```

## Estructura del proyecto

```
src/
├── types/                  Tipos de dominio y del parser
│   ├── dominio.ts          Las 7 entidades del modelo
│   └── parser.ts           Resultado del parser
│
├── services/               Lógica de negocio pura (sin UI, sin DB directa)
│   ├── normalizador/       Normalización de nombres de ejercicios
│   └── parser/             Parser de rutinas pegadas en texto
│
├── db/                     Capa de persistencia (Dexie + IndexedDB)
│   ├── schema.ts           Schema de la DB
│   ├── id.ts               Generación de IDs
│   ├── repositorios/       CRUD por entidad
│   └── queries/            Queries derivadas (último peso, semanal, etc.)
│
├── pages/                  Pantallas (próxima capa)
├── components/             Componentes reutilizables (próxima capa)
├── stores/                 Zustand stores (próxima capa)
│
├── App.tsx                 Componente raíz
├── main.tsx                Entry point
└── styles.css              Estilos base + Tailwind
```

## Filosofía del MVP

1. **Tracking primero, gestión de rutinas después.** La rutina es
   infraestructura, no contenido. Setup ocasional, tracking diario.

2. **Ejercicio es la unidad atómica.** Su historial sobrevive a todos
   los cambios de rutina. Matching automático por nombre normalizado.

3. **Conservadores con el parser.** Mejor que el usuario corrija a mano
   que ensuciar el historial con interpretaciones erróneas.

4. **Una sola pantalla crítica: la de entrenamiento.** Todo lo demás
   existe para llevarte ahí y sacarte rápido.

## Estado actual del MVP

Esta capa contiene la lógica pura del producto. La UI vendrá después.

- [x] Setup del proyecto (Vite + React + TS + Tailwind)
- [x] Tipos de dominio
- [x] Normalizador de nombres + tests
- [x] Parser de rutinas + tests
- [x] Modelo de datos local (Dexie + 7 entidades)
- [x] Repositorios CRUD
- [x] Queries derivadas (último peso, objetivo semanal, día sugerido)
- [ ] Pantallas: Importar / Preview / Home / Entrenamiento /
      Resumen / Progreso / Detalle ejercicio
- [ ] Routing y navegación
- [ ] Stores de estado para sesión en curso

## Próximos pasos

1. Construir pantallas en orden de prioridad:
   1. Entrenamiento (la más crítica)
   2. Home
   3. Importar + Preview
   4. Progreso + Detalle
   5. Resumen post-entreno
2. Integrar PWA: manifest, service worker, íconos.
3. Validar con usuarios reales y pulir según feedback.
