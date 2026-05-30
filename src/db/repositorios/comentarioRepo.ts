/**
 * Repositorio de Comentarios de ejercicio.
 *
 * Una nota por (sesión + ejercicio). Es la nota "de hoy": cada entreno tiene
 * la suya. Se usa para anotar ajustes o dudas para el PT durante el entreno
 * y leerlas después en el detalle del día (Progreso).
 */

import { db } from '../schema';
import type { ComentarioEjercicio } from '@/types/dominio';

function idComentario(sesionId: string, ejercicioId: string): string {
  return `${sesionId}__${ejercicioId}`;
}

/**
 * Devuelve el texto del comentario para (sesión, ejercicio), o '' si no hay.
 */
export async function obtenerComentario(
  sesionId: string,
  ejercicioId: string
): Promise<string> {
  const c = await db.comentarios.get(idComentario(sesionId, ejercicioId));
  return c?.texto ?? '';
}

/**
 * Guarda (o borra si queda vacío) el comentario para (sesión, ejercicio).
 */
export async function guardarComentario(
  sesionId: string,
  ejercicioId: string,
  texto: string
): Promise<void> {
  const id = idComentario(sesionId, ejercicioId);
  const limpio = texto.trim();
  if (!limpio) {
    await db.comentarios.delete(id);
    return;
  }
  const registro: ComentarioEjercicio = {
    id,
    sesionId,
    ejercicioId,
    texto: limpio,
    fechaActualizacion: Date.now(),
  };
  await db.comentarios.put(registro);
}

/**
 * Devuelve un mapa { ejercicioId -> texto } con todos los comentarios de una
 * sesión. Usado en el detalle del día (Progreso) para leerlos después.
 */
export async function obtenerComentariosDeSesion(
  sesionId: string
): Promise<Map<string, string>> {
  const lista = await db.comentarios.where('sesionId').equals(sesionId).toArray();
  const mapa = new Map<string, string>();
  for (const c of lista) {
    if (c.texto.trim()) mapa.set(c.ejercicioId, c.texto);
  }
  return mapa;
}
