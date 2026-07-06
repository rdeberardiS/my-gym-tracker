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
 * Devuelve el texto del último comentario (no vacío) que se escribió para este
 * ejercicio en CUALQUIER sesión anterior. Se usa para mostrarlo por default al
 * volver a entrar al ejercicio, así te acordás de tu última anotación.
 *
 * Opcionalmente excluye una sesión (normalmente la actual).
 */
export async function obtenerUltimoComentarioDeEjercicio(
  ejercicioId: string,
  excluirSesionId?: string
): Promise<string> {
  const todos = await db.comentarios.toArray();
  const delEjercicio = todos
    .filter((c) => c.ejercicioId === ejercicioId && c.texto.trim())
    .filter((c) => !excluirSesionId || c.sesionId !== excluirSesionId)
    .sort((a, b) => b.fechaActualizacion - a.fechaActualizacion);
  return delEjercicio[0]?.texto ?? '';
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
