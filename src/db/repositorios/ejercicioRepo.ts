/**
 * Repositorio de Ejercicio.
 *
 * El Ejercicio es la entidad permanente del sistema. Este repositorio
 * encapsula la lógica de matching automático: cuando importamos una rutina
 * nueva, si un ejercicio "Press banca" ya existe, lo reutilizamos en vez
 * de crear uno nuevo. Así el historial sobrevive a cambios de rutina.
 */

import { db } from '../schema';
import { generarId } from '../id';
import { normalizar } from '@/services/normalizador/normalizador';
import { buscarVideoEnCatalogo } from '@/services/catalogo/catalogoVideos';
import type { Ejercicio } from '@/types/dominio';

/**
 * Busca un ejercicio existente por nombre normalizado.
 * Devuelve null si no existe.
 */
export async function buscarEjercicioPorNombre(
  nombre: string
): Promise<Ejercicio | null> {
  const normalizado = normalizar(nombre);
  if (!normalizado) return null;
  const encontrado = await db.ejercicios
    .where('nombreNormalizado')
    .equals(normalizado)
    .first();
  return encontrado ?? null;
}

/**
 * Obtiene un ejercicio existente o lo crea si no existe.
 * Esta es la función clave usada al importar rutinas.
 *
 * Si el ejercicio ya existe, se preserva intacto (con todo su historial).
 * Si no existe, se crea uno nuevo con timestamps al momento.
 *
 * Al crear uno nuevo: busca en el catálogo de videos para asignarle uno
 * automáticamente si hay match.
 */
export async function obtenerOCrearEjercicio(nombre: string): Promise<Ejercicio> {
  const existente = await buscarEjercicioPorNombre(nombre);
  if (existente) return existente;

  const ahora = Date.now();
  const videoCatalogo = buscarVideoEnCatalogo(nombre);

  const nuevo: Ejercicio = {
    id: generarId(),
    nombre: nombre.trim(),
    nombreNormalizado: normalizar(nombre),
    fechaCreacion: ahora,
    fechaUltimoUso: ahora,
    ...(videoCatalogo ? { videoUrl: videoCatalogo } : {}),
  };
  await db.ejercicios.put(nuevo);
  return nuevo;
}

/**
 * Actualiza la fechaUltimoUso de un ejercicio.
 * Se llama cada vez que se registra una serie de ese ejercicio.
 * Sirve para que la lista de Progreso ordene por "más reciente".
 */
export async function marcarEjercicioComoUsado(
  ejercicioId: string,
  timestamp: number = Date.now()
): Promise<void> {
  await db.ejercicios.update(ejercicioId, { fechaUltimoUso: timestamp });
}

/**
 * Lista todos los ejercicios ordenados por fechaUltimoUso descendente.
 * Usado por la pantalla de Progreso.
 */
export async function listarEjerciciosPorRecientes(): Promise<Ejercicio[]> {
  return db.ejercicios.orderBy('fechaUltimoUso').reverse().toArray();
}

/**
 * Obtiene un ejercicio por su ID.
 */
export async function obtenerEjercicio(id: string): Promise<Ejercicio | null> {
  return (await db.ejercicios.get(id)) ?? null;
}

/**
 * Actualiza el video URL de un ejercicio.
 * Pasar null/undefined para borrar el video.
 */
export async function actualizarVideoEjercicio(
  ejercicioId: string,
  videoUrl: string | null
): Promise<void> {
  if (videoUrl) {
    await db.ejercicios.update(ejercicioId, { videoUrl });
  } else {
    // Dexie: para borrar un campo, lo seteamos a undefined
    await db.ejercicios.update(ejercicioId, { videoUrl: undefined });
  }
}
