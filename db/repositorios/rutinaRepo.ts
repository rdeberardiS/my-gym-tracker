/**
 * Repositorio de Rutina.
 *
 * Encapsula la operación crítica de importar una rutina nueva, que
 * involucra varias entidades en una sola transacción:
 *   - Desactivar la rutina activa anterior (si existe)
 *   - Crear la nueva Rutina
 *   - Crear sus DiaRutina
 *   - Para cada ejercicio: obtenerOCrearEjercicio (mantiene historial)
 *   - Crear los EjercicioEnDiaRutina con la prescripción
 */

import { db } from '../schema';
import { generarId } from '../id';
import { obtenerOCrearEjercicio } from './ejercicioRepo';
import type {
  Rutina,
  DiaRutina,
  EjercicioEnDiaRutina,
} from '@/types/dominio';
import type { DiaParseado } from '@/types/parser';

export interface DatosImportacion {
  nombre: string; // nombre de la rutina, default "Mi rutina"
  textoOriginal: string; // lo que pegó el usuario
  dias: DiaParseado[]; // del parser
}

export interface RutinaImportada {
  rutina: Rutina;
  dias: DiaRutina[];
}

/**
 * Importa una rutina completa de forma atómica.
 *
 * Si algo falla a mitad de camino, Dexie hace rollback automático de toda
 * la transacción.
 *
 * Solo importa ejercicios con estado 'ok' o 'revisar'. Los 'no_interpretado'
 * deberían haberse filtrado antes (el usuario los edita o los descarta en
 * el preview).
 */
export async function importarRutina(datos: DatosImportacion): Promise<RutinaImportada> {
  return db.transaction(
    'rw',
    [db.rutinas, db.diasRutina, db.ejercicios, db.ejerciciosEnDiaRutina],
    async () => {
      // 1. Desactivar rutina activa anterior (si hay)
      // Dexie no indexa booleanos directamente, así que filtramos en memoria.
      // Es una sola operación y la tabla de rutinas es chica.
      const todasLasActivas = await db.rutinas
        .filter((r) => r.activa === true)
        .toArray();
      for (const r of todasLasActivas) {
        await db.rutinas.update(r.id, { activa: false });
      }

      // 2. Crear nueva Rutina
      const rutina: Rutina = {
        id: generarId(),
        nombre: datos.nombre || 'Mi rutina',
        fechaImportacion: Date.now(),
        textoOriginal: datos.textoOriginal,
        activa: true,
      };
      await db.rutinas.put(rutina);

      // 3. Crear DiaRutina + EjercicioEnDiaRutina
      const diasCreados: DiaRutina[] = [];
      for (const diaParseado of datos.dias) {
        const diaRutina: DiaRutina = {
          id: generarId(),
          rutinaId: rutina.id,
          orden: diaParseado.orden,
          nombre: diaParseado.nombre,
        };
        await db.diasRutina.put(diaRutina);
        diasCreados.push(diaRutina);

        // Crear ejercicios del día
        let ordenEjercicio = 1;
        for (const ej of diaParseado.ejercicios) {
          if (ej.estado === 'no_interpretado') continue;
          if (!ej.nombre || !ej.series || !ej.reps) continue;

          // Obtener o crear el Ejercicio (matching automático)
          const ejercicio = await obtenerOCrearEjercicio(ej.nombre);

          const enDia: EjercicioEnDiaRutina = {
            id: generarId(),
            diaRutinaId: diaRutina.id,
            ejercicioId: ejercicio.id,
            orden: ordenEjercicio++,
            seriesPrescriptas: ej.series,
            repsPrescriptas: ej.reps,
            ...(ej.pesoSugerido !== undefined
              ? { pesoSugerido: ej.pesoSugerido }
              : {}),
            ...(ej.intensidad !== undefined
              ? { intensidad: ej.intensidad }
              : {}),
          };
          await db.ejerciciosEnDiaRutina.put(enDia);
        }
      }

      return { rutina, dias: diasCreados };
    }
  );
}

/**
 * Obtiene la rutina activa actual. Null si no hay ninguna (primer uso).
 */
export async function obtenerRutinaActiva(): Promise<Rutina | null> {
  // Filtramos en memoria por la limitación de booleanos en índices de Dexie
  const activa = await db.rutinas.filter((r) => r.activa === true).first();
  return activa ?? null;
}

/**
 * Obtiene los días de una rutina ordenados por orden ascendente.
 */
export async function obtenerDiasDeRutina(rutinaId: string): Promise<DiaRutina[]> {
  return db.diasRutina
    .where('rutinaId')
    .equals(rutinaId)
    .sortBy('orden');
}

/**
 * Obtiene los ejercicios prescriptos de un día, ordenados.
 */
export async function obtenerEjerciciosDeDia(
  diaRutinaId: string
): Promise<EjercicioEnDiaRutina[]> {
  return db.ejerciciosEnDiaRutina
    .where('diaRutinaId')
    .equals(diaRutinaId)
    .sortBy('orden');
}
