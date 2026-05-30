/**
 * Schema de la base de datos local con Dexie (IndexedDB).
 *
 * Esta es la fuente única de verdad para la estructura de datos persistida.
 * Cualquier cambio acá requiere bump de versión y migración.
 *
 * Notación de índices de Dexie:
 *   - "++id" significa autoincrement (NO lo usamos, usamos UUIDs)
 *   - "id" significa primary key
 *   - "campo" significa índice simple
 *   - "[campo1+campo2]" significa índice compuesto
 *
 * Para el MVP usamos UUIDs como id (string) generados con crypto.randomUUID().
 * Más portables que autoincrement si en el futuro queremos sync.
 */

import Dexie, { type Table } from 'dexie';
import type {
  Configuracion,
  Ejercicio,
  Rutina,
  DiaRutina,
  EjercicioEnDiaRutina,
  Sesion,
  Serie,
  ComentarioEjercicio,
} from '@/types/dominio';

export class GymDB extends Dexie {
  configuracion!: Table<Configuracion, number>;
  ejercicios!: Table<Ejercicio, string>;
  rutinas!: Table<Rutina, string>;
  diasRutina!: Table<DiaRutina, string>;
  ejerciciosEnDiaRutina!: Table<EjercicioEnDiaRutina, string>;
  sesiones!: Table<Sesion, string>;
  series!: Table<Serie, string>;
  comentarios!: Table<ComentarioEjercicio, string>;

  constructor() {
    super('gym-tracker-db');

    // Versión 1: schema inicial del MVP
    this.version(1).stores({
      configuracion: 'id',

      // Ejercicio: necesitamos buscar rápido por nombre normalizado (matching)
      // y ordenar por fecha último uso (lista de Progreso).
      ejercicios: 'id, nombreNormalizado, fechaUltimoUso',

      // Rutina: filtramos por activa en memoria (Dexie no indexa booleanos).
      rutinas: 'id, fechaImportacion',

      // DiaRutina: necesitamos listar los días de una rutina.
      diasRutina: 'id, rutinaId, [rutinaId+orden]',

      // EjercicioEnDiaRutina: listar ejercicios de un día.
      ejerciciosEnDiaRutina: 'id, diaRutinaId, [diaRutinaId+orden], ejercicioId',

      // Sesion: filtrar por fechaFin y completada (objetivo semanal).
      sesiones: 'id, diaRutinaId, fechaFin, completada, fechaInicio',

      // Serie: la query más caliente: "última serie de un ejercicio"
      // Indice compuesto [ejercicioId+fechaRegistro] para que el ORDER BY
      // sea instantáneo.
      series: 'id, sesionId, ejercicioId, [ejercicioId+fechaRegistro]',
    });

    // Versión 2: agrega comentarios por ejercicio dentro de una sesión.
    // Las tablas de la v1 se mantienen intactas; solo se suma 'comentarios'.
    this.version(2).stores({
      comentarios: 'id, sesionId',
    });
  }
}

// Instancia singleton de la DB. Se crea una sola vez al cargar el módulo.
export const db = new GymDB();
