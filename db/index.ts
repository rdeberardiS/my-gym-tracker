/**
 * Punto de entrada del módulo de base de datos.
 *
 * Toda la app debería importar desde acá:
 *   import { db, obtenerConfiguracion, importarRutina, ... } from '@/db';
 */
export { db } from './schema';
export { generarId } from './id';

// Repositorios
export * from './repositorios/configuracionRepo';
export * from './repositorios/ejercicioRepo';
export * from './repositorios/rutinaRepo';
export * from './repositorios/sesionRepo';

// Queries derivadas
export * from './queries/objetivoSemanal';
export * from './queries/diaSugerido';
