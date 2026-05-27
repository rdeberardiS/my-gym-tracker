/**
 * Cálculo del estado del objetivo semanal.
 *
 * Cuenta sesiones completadas dentro de la semana calendario actual
 * (lunes 00:00 a domingo 23:59 hora local).
 *
 * Una sesión cuenta si:
 *   - completada === true
 *   - tiene al menos 1 serie registrada
 *   - fechaFin cae dentro de la semana actual
 */

import { db } from '../schema';
import { obtenerConfiguracion } from '../repositorios/configuracionRepo';
import type { EstadoSemanal } from '@/types/dominio';

/**
 * Calcula el timestamp del lunes a las 00:00 hora local de la semana
 * que contiene el timestamp dado.
 *
 * En JavaScript, getDay() devuelve 0=domingo, 1=lunes, ..., 6=sábado.
 * Queremos que la semana empiece el lunes, así que ajustamos.
 */
export function inicioSemana(timestamp: number = Date.now()): number {
  const d = new Date(timestamp);
  const dia = d.getDay(); // 0=dom, 1=lun, ..., 6=sab
  const diasDesdeLunes = dia === 0 ? 6 : dia - 1; // domingo cuenta como día 6 de la semana anterior
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - diasDesdeLunes);
  return d.getTime();
}

/**
 * Calcula el timestamp del domingo a las 23:59:59.999 hora local
 * de la semana que contiene el timestamp dado.
 */
export function finSemana(timestamp: number = Date.now()): number {
  const inicio = inicioSemana(timestamp);
  const d = new Date(inicio);
  d.setDate(d.getDate() + 7);
  d.setMilliseconds(d.getMilliseconds() - 1);
  return d.getTime();
}

/**
 * Días restantes (enteros) hasta el fin de la semana actual.
 * Si es lunes -> 6; si es viernes -> 2; si es domingo -> 0.
 */
function diasRestantesEnSemana(timestamp: number = Date.now()): number {
  const fin = finSemana(timestamp);
  const diffMs = fin - timestamp;
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Calcula el estado del objetivo semanal en el momento actual.
 */
export async function calcularEstadoSemanal(): Promise<EstadoSemanal> {
  const config = await obtenerConfiguracion();
  const objetivo = config.objetivoSemanal;

  const inicio = inicioSemana();
  const fin = finSemana();

  // Buscar sesiones completadas en la ventana de la semana
  const sesionesDeLaSemana = await db.sesiones
    .where('fechaFin')
    .between(inicio, fin, true, true)
    .toArray();

  // Filtrar las completadas
  const completadas = sesionesDeLaSemana.filter((s) => s.completada === true);

  // De esas, las que tengan al menos 1 serie
  let entrenosValidos = 0;
  for (const sesion of completadas) {
    const tieneSerie = (await db.series.where('sesionId').equals(sesion.id).count()) > 0;
    if (tieneSerie) entrenosValidos++;
  }

  const diasRestantes = diasRestantesEnSemana();
  const entrenosFaltantes = Math.max(0, objetivo - entrenosValidos);
  const posibleCumplir = entrenosFaltantes <= diasRestantes + 1; // +1 porque hoy todavía cuenta

  return {
    entrenosCompletados: entrenosValidos,
    objetivo,
    diasRestantes,
    cumplido: entrenosValidos >= objetivo,
    posibleCumplir: entrenosValidos >= objetivo || posibleCumplir,
  };
}
