/**
 * Repositorio de Sesión y Serie.
 *
 * Acá vive la lógica más caliente del producto: registrar series,
 * computar último peso, calcular objetivo semanal.
 */

import { db } from '../schema';
import { generarId } from '../id';
import { marcarEjercicioComoUsado } from './ejercicioRepo';
import type { Sesion, Serie, ResumenUltimaVez } from '@/types/dominio';

// ============================================================
// Sesión
// ============================================================

/**
 * Inicia una nueva sesión de entrenamiento.
 * El usuario está abriendo "Entrenar". La sesión queda incompleta hasta
 * que toque "Terminar entreno".
 */
export async function iniciarSesion(diaRutinaId: string): Promise<Sesion> {
  const sesion: Sesion = {
    id: generarId(),
    diaRutinaId,
    fechaInicio: Date.now(),
    completada: false,
  };
  await db.sesiones.put(sesion);
  return sesion;
}

/**
 * Marca una sesión como terminada ("Terminar entreno").
 * Solo las sesiones terminadas cuentan para el objetivo semanal.
 */
export async function terminarSesion(sesionId: string): Promise<void> {
  await db.sesiones.update(sesionId, {
    fechaFin: Date.now(),
    completada: true,
  });
}

/**
 * Obtiene la última sesión completada (de cualquier día).
 * Sirve para calcular cuál es el "siguiente día sugerido".
 */
export async function obtenerUltimaSesionCompletada(): Promise<Sesion | null> {
  const sesiones = await db.sesiones
    .filter((s) => s.completada === true)
    .toArray();
  if (sesiones.length === 0) return null;
  sesiones.sort((a, b) => (b.fechaFin ?? 0) - (a.fechaFin ?? 0));
  return sesiones[0];
}

/**
 * Lista las últimas N sesiones completadas, ordenadas por fechaFin desc.
 * Usado en la sección "Últimos entrenos" del home.
 */
export async function listarUltimasSesiones(limite: number = 10): Promise<Sesion[]> {
  const sesiones = await db.sesiones
    .filter((s) => s.completada === true)
    .toArray();
  sesiones.sort((a, b) => (b.fechaFin ?? 0) - (a.fechaFin ?? 0));
  return sesiones.slice(0, limite);
}

// ============================================================
// Serie
// ============================================================

export interface NuevaSerie {
  sesionId: string;
  ejercicioId: string;
  numeroSerie: number;
  peso: number;
  reps: number;
}

/**
 * Registra una serie.
 * Además de guardarla, actualiza el fechaUltimoUso del ejercicio.
 */
export async function registrarSerie(datos: NuevaSerie): Promise<Serie> {
  const ahora = Date.now();
  const serie: Serie = {
    id: generarId(),
    sesionId: datos.sesionId,
    ejercicioId: datos.ejercicioId,
    numeroSerie: datos.numeroSerie,
    peso: datos.peso,
    reps: datos.reps,
    fechaRegistro: ahora,
  };

  await db.transaction('rw', [db.series, db.ejercicios], async () => {
    await db.series.put(serie);
    await marcarEjercicioComoUsado(datos.ejercicioId, ahora);
  });

  return serie;
}

/**
 * Obtiene todas las series de una sesión.
 */
export async function obtenerSeriesDeSesion(sesionId: string): Promise<Serie[]> {
  return db.series.where('sesionId').equals(sesionId).toArray();
}

/**
 * Obtiene todas las series de un ejercicio, ordenadas por fecha desc.
 * Usado en la pantalla de Progreso del ejercicio.
 */
export async function obtenerSeriesDeEjercicio(
  ejercicioId: string
): Promise<Serie[]> {
  const series = await db.series
    .where('[ejercicioId+fechaRegistro]')
    .between([ejercicioId, 0], [ejercicioId, Number.MAX_SAFE_INTEGER])
    .toArray();
  series.sort((a, b) => b.fechaRegistro - a.fechaRegistro);
  return series;
}

// ============================================================
// Queries derivadas: el "último peso" y "última vez"
// ============================================================

/**
 * Calcula el resumen de la última vez que se entrenó este ejercicio.
 * Es la query más importante de la pantalla de entrenamiento.
 *
 * Devuelve:
 *   - pesoPreRellenado: el peso más frecuente de la última sesión
 *     (la "moda"). Si todos fueron distintos, el de la primera serie.
 *   - textoReferencia: "40kg × 8, 8, 8" o "Primera vez con este ejercicio"
 *   - hace: "Hace X días" o null
 *
 * Cruza todas las rutinas: el último peso es global al ejercicio.
 */
export async function calcularUltimaVez(
  ejercicioId: string
): Promise<ResumenUltimaVez> {
  const todasLasSeries = await obtenerSeriesDeEjercicio(ejercicioId);

  if (todasLasSeries.length === 0) {
    return {
      pesoPreRellenado: null,
      textoReferencia: 'Primera vez con este ejercicio',
      hace: null,
      fechaUltimaVez: null,
    };
  }

  // Identificar la última sesión (sesionId de la primera serie del array,
  // que es la más reciente por orden desc)
  const ultimaSesionId = todasLasSeries[0].sesionId;
  const seriesUltimaSesion = todasLasSeries
    .filter((s) => s.sesionId === ultimaSesionId)
    .sort((a, b) => a.numeroSerie - b.numeroSerie);

  // Calcular peso pre-rellenado: la MODA (peso más frecuente)
  const pesoPreRellenado = calcularPesoModa(seriesUltimaSesion.map((s) => s.peso));

  // Construir texto de referencia
  const textoReferencia = construirTextoReferencia(seriesUltimaSesion);

  // Calcular "hace X días"
  const fechaUltimaVez = todasLasSeries[0].fechaRegistro;
  const hace = formatearHace(fechaUltimaVez);

  return {
    pesoPreRellenado,
    textoReferencia,
    hace,
    fechaUltimaVez,
  };
}

/**
 * Calcula la moda (valor más frecuente) de un array de pesos.
 * Si todos son distintos, devuelve el primero.
 * Si hay empate, devuelve el más alto entre los empatados.
 */
function calcularPesoModa(pesos: number[]): number {
  if (pesos.length === 0) return 0;

  const conteo = new Map<number, number>();
  for (const p of pesos) {
    conteo.set(p, (conteo.get(p) ?? 0) + 1);
  }

  let maxConteo = 0;
  let pesoModa = pesos[0];

  for (const [peso, count] of conteo.entries()) {
    if (count > maxConteo || (count === maxConteo && peso > pesoModa)) {
      maxConteo = count;
      pesoModa = peso;
    }
  }

  // Si todos los pesos aparecen una sola vez (sin moda real),
  // devolvemos el de la primera serie.
  if (maxConteo === 1) {
    return pesos[0];
  }

  return pesoModa;
}

/**
 * Construye texto tipo "40kg × 8, 8, 8" o "40kg × 8, 8 · 42.5kg × 6"
 * cuando los pesos varían entre series.
 */
function construirTextoReferencia(series: Serie[]): string {
  if (series.length === 0) return '';

  // Agrupar series consecutivas con el mismo peso
  const grupos: { peso: number; reps: number[] }[] = [];
  for (const s of series) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.peso === s.peso) {
      ultimo.reps.push(s.reps);
    } else {
      grupos.push({ peso: s.peso, reps: [s.reps] });
    }
  }

  return grupos
    .map((g) => `${formatearPeso(g.peso)} × ${g.reps.join(', ')}`)
    .join(' · ');
}

function formatearPeso(peso: number): string {
  // Si es entero, sin decimales. Si tiene .5, mostrarlo.
  return Number.isInteger(peso) ? `${peso}kg` : `${peso}kg`;
}

/**
 * Formatea timestamp -> "Hoy", "Ayer", "Hace 3 días", "Hace 2 meses".
 */
export function formatearHace(timestamp: number): string {
  const ahora = Date.now();
  const diffMs = ahora - timestamp;
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias === 0) return 'Hoy';
  if (diffDias === 1) return 'Ayer';
  if (diffDias < 30) return `Hace ${diffDias} días`;

  const diffMeses = Math.floor(diffDias / 30);
  if (diffMeses === 1) return 'Hace 1 mes';
  if (diffMeses < 12) return `Hace ${diffMeses} meses`;

  const diffAnios = Math.floor(diffMeses / 12);
  if (diffAnios === 1) return 'Hace 1 año';
  return `Hace ${diffAnios} años`;
}
