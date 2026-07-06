/**
 * Calcula el "siguiente día sugerido" en el ciclo de la rutina activa.
 *
 * Lógica:
 *   1. Obtener la rutina activa y sus días.
 *   2. Obtener la última sesión completada.
 *   3. Si esa sesión es de un día de la rutina activa actual:
 *        siguiente = (orden_ultimo % total_dias) + 1
 *      Si no (vino de una rutina anterior, o no hay sesiones):
 *        siguiente = día con orden 1
 */

import { db } from '../schema';
import { obtenerRutinaActiva, obtenerDiasDeRutina } from '../repositorios/rutinaRepo';
import { obtenerUltimaSesionCompletada } from '../repositorios/sesionRepo';
import type { DiaRutina } from '@/types/dominio';

export async function obtenerDiaSugerido(): Promise<DiaRutina | null> {
  const rutinaActiva = await obtenerRutinaActiva();
  if (!rutinaActiva) return null;

  const dias = await obtenerDiasDeRutina(rutinaActiva.id);
  if (dias.length === 0) return null;

  const ultimaSesion = await obtenerUltimaSesionCompletada();
  if (!ultimaSesion) {
    // Primera vez: sugerir el día 1
    return dias[0];
  }

  // ¿La última sesión es de un día de la rutina ACTUAL?
  const ultimoDia = await db.diasRutina.get(ultimaSesion.diaRutinaId);
  if (!ultimoDia || ultimoDia.rutinaId !== rutinaActiva.id) {
    // La última sesión fue de una rutina anterior; arrancamos por día 1
    return dias[0];
  }

  // Avanzar al siguiente en el ciclo
  const ordenSiguiente = (ultimoDia.orden % dias.length) + 1;
  return dias.find((d) => d.orden === ordenSiguiente) ?? dias[0];
}
