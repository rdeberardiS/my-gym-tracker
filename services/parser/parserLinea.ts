/**
 * Parser de una línea individual de ejercicio.
 *
 * Toma una línea ya limpia (sin prefijos de lista) y devuelve un
 * EjercicioParseado con estado 'ok', 'revisar' o 'no_interpretado'.
 *
 * Filosofía CONSERVADORA:
 *  - Si no encontramos un patrón NxM claro -> 'no_interpretado'
 *  - Si encontramos valores raros (peso 999kg, series 50) -> 'revisar'
 *  - Si todo se ve bien -> 'ok'
 */

import type { EjercicioParseado } from '@/types/parser';
import {
  REGEX_SERIES_X_REPS,
  REGEX_PESO,
  REGEX_PREFIJO_LISTA,
  REGEX_INTENSIDAD,
  LIMITES,
  LB_A_KG,
} from './patrones';

/**
 * Quita prefijos de lista comunes ("- ", "• ", "1. ", etc.) del inicio.
 */
function quitarPrefijoLista(linea: string): string {
  return linea.replace(REGEX_PREFIJO_LISTA, '');
}

/**
 * Convierte libras a kilos y redondea a 0.5 más cercano.
 */
function librasAKilos(libras: number): number {
  const kg = libras * LB_A_KG;
  return Math.round(kg * 2) / 2;
}

/**
 * Valida si un valor de reps es razonable.
 * Acepta números, rangos (8-10), esquemas (8,8,7,6), y palabras
 * conocidas (AMRAP, MAX, F, FALLO).
 */
function validarReps(reps: string): boolean {
  if (!reps) return false;

  const repsUpper = reps.toUpperCase();
  const palabrasFallo = ['AMRAP', 'MAX', 'F', 'FALLO'];
  if (palabrasFallo.includes(repsUpper)) return true;

  // Rango tipo "8-10"
  if (/^\d+-\d+$/.test(reps)) {
    const [min, max] = reps.split('-').map(Number);
    return min > 0 && max > 0 && min <= max && max <= LIMITES.REPS_NUMERICO_MAX;
  }

  // Esquema tipo "8,8,7,6"
  if (/^\d+(?:,\d+)+$/.test(reps)) {
    const nums = reps.split(',').map(Number);
    return nums.every((n) => n > 0 && n <= LIMITES.REPS_NUMERICO_MAX);
  }

  // Número simple
  if (/^\d+$/.test(reps)) {
    const n = Number(reps);
    return n > 0 && n <= LIMITES.REPS_NUMERICO_MAX;
  }

  return false;
}

/**
 * Detecta si una línea es probablemente texto narrativo y no un ejercicio.
 * Heurística usada solo cuando NO encontramos un patrón NxM.
 *
 * Se considera "texto narrativo" si la línea:
 *  - Termina con ":" (probablemente título de notas)
 *  - Empieza con palabras como "nota", "acordate", "recordá", "ojo"
 *  - Es muy larga sin números (más de 60 chars sin un solo dígito)
 *
 * No es perfecto, pero ayuda a clasificar mejor las "líneas no interpretadas".
 */
export function pareceTextoNarrativo(linea: string): boolean {
  const trimmed = linea.trim();
  if (!trimmed) return false;
  if (trimmed.endsWith(':')) return true;

  const inicio = trimmed.toLowerCase();
  const palabrasNarrativas = [
    'nota',
    'notas',
    'acordate',
    'acuerdate',
    'recorda',
    'recordá',
    'recordar',
    'ojo',
    'importante',
    'tip',
    'calentar',
    'calentamiento',
    'descanso',
    'descansar',
  ];
  for (const palabra of palabrasNarrativas) {
    // Acepta "Notas: ...", "Notas - ...", "Notas, ...", "Notas ..."
    const prefijos = [palabra + ' ', palabra + ':', palabra + ',', palabra + '.', palabra + '-'];
    for (const prefijo of prefijos) {
      if (inicio.startsWith(prefijo)) return true;
    }
    if (inicio === palabra) return true;
  }

  if (trimmed.length > 60 && !/\d/.test(trimmed)) return true;

  return false;
}

/**
 * Extrae la intensidad (1 a 5) de una línea, si está presente, y devuelve
 * la línea sin ese token para que no contamine el nombre del ejercicio.
 *
 * Ej: "Hip thrust 4x8 i4" -> { intensidad: 4, lineaSinIntensidad: "Hip thrust 4x8" }
 *     "Sentadilla 3x10"    -> { intensidad: undefined, lineaSinIntensidad: "Sentadilla 3x10" }
 */
function extraerIntensidad(linea: string): {
  intensidad: number | undefined;
  lineaSinIntensidad: string;
} {
  const match = linea.match(REGEX_INTENSIDAD);
  if (!match) {
    return { intensidad: undefined, lineaSinIntensidad: linea };
  }
  const valor = Number(match[1] ?? match[2]);
  const intensidad = valor >= 1 && valor <= 5 ? valor : undefined;
  // Quitamos el token detectado y colapsamos espacios sobrantes
  const lineaSinIntensidad = linea
    .replace(REGEX_INTENSIDAD, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { intensidad, lineaSinIntensidad };
}

/**
 * Parsea una línea de ejercicio.
 *
 * @param linea - Línea cruda (puede tener prefijo de lista, espacios, etc.)
 * @returns EjercicioParseado con su estado
 */
export function parsearLineaEjercicio(linea: string): EjercicioParseado {
  const lineaSinPrefijo = quitarPrefijoLista(linea).trim();

  // Extraemos la intensidad PRIMERO y la quitamos, así no interfiere con
  // el nombre ni con la detección de series/reps/peso.
  const { intensidad, lineaSinIntensidad } = extraerIntensidad(lineaSinPrefijo);
  const lineaLimpia = lineaSinIntensidad;

  if (!lineaLimpia) {
    return {
      estado: 'no_interpretado',
      textoOriginal: linea,
      motivoRevision: 'Línea vacía',
    };
  }

  // Buscar el patrón NxM
  const matchSeriesReps = lineaLimpia.match(REGEX_SERIES_X_REPS);
  if (!matchSeriesReps) {
    return {
      estado: 'no_interpretado',
      textoOriginal: linea,
      motivoRevision: 'No se detectó patrón series × reps',
    };
  }

  const seriesNum = Number(matchSeriesReps[1]);
  const repsStr = matchSeriesReps[3];

  // Validar series
  if (seriesNum < LIMITES.SERIES_MIN) {
    return {
      estado: 'no_interpretado',
      textoOriginal: linea,
      motivoRevision: 'Número de series inválido',
    };
  }

  // Validar reps
  if (!validarReps(repsStr)) {
    return {
      estado: 'no_interpretado',
      textoOriginal: linea,
      motivoRevision: 'Formato de reps no reconocido',
    };
  }

  // El nombre es lo que está ANTES del patrón NxM
  const indexInicioPatron = matchSeriesReps.index ?? 0;
  const nombre = lineaLimpia.slice(0, indexInicioPatron).trim();

  if (!nombre) {
    return {
      estado: 'no_interpretado',
      textoOriginal: linea,
      motivoRevision: 'No se detectó nombre del ejercicio',
    };
  }

  // El nombre no puede tener menos de 2 caracteres (sospechoso)
  if (nombre.length < 2) {
    return {
      estado: 'no_interpretado',
      textoOriginal: linea,
      motivoRevision: 'Nombre del ejercicio muy corto',
    };
  }

  // Buscar peso en lo que queda DESPUÉS del patrón NxM
  const restoLinea = lineaLimpia.slice(
    indexInicioPatron + matchSeriesReps[0].length
  );

  let pesoSugerido: number | undefined;
  let motivoRevision: string | undefined;
  let estadoPeso: 'ok' | 'revisar' = 'ok';

  const matchPeso = restoLinea.match(REGEX_PESO);
  if (matchPeso) {
    const pesoNum = Number(matchPeso[1].replace(',', '.'));
    const unidad = matchPeso[2].toLowerCase();

    if (unidad.startsWith('lb')) {
      pesoSugerido = librasAKilos(pesoNum);
      motivoRevision = 'Peso convertido de libras a kg';
      estadoPeso = 'revisar';
    } else {
      pesoSugerido = pesoNum;
    }

    // Validar rangos de peso
    if (pesoSugerido > LIMITES.PESO_MAX_KG || pesoSugerido < LIMITES.PESO_MIN_KG) {
      motivoRevision = `Peso fuera de rango razonable (${pesoSugerido}kg)`;
      estadoPeso = 'revisar';
    }
  }

  // Detectar si el resto de la línea sugiere ambigüedad (otro NxM)
  if (REGEX_SERIES_X_REPS.test(restoLinea)) {
    return {
      estado: 'revisar',
      nombre,
      series: seriesNum,
      reps: repsStr,
      pesoSugerido,
      ...(intensidad !== undefined ? { intensidad } : {}),
      textoOriginal: linea,
      motivoRevision: 'Posible esquema múltiple (drop set, periodización), tomamos solo el primero',
    };
  }

  // Validar series alto
  if (seriesNum > LIMITES.SERIES_MAX) {
    return {
      estado: 'revisar',
      nombre,
      series: seriesNum,
      reps: repsStr,
      pesoSugerido,
      ...(intensidad !== undefined ? { intensidad } : {}),
      textoOriginal: linea,
      motivoRevision: `Número de series alto (${seriesNum}), verificar`,
    };
  }

  return {
    estado: estadoPeso === 'revisar' ? 'revisar' : 'ok',
    nombre,
    series: seriesNum,
    reps: repsStr,
    pesoSugerido,
    ...(intensidad !== undefined ? { intensidad } : {}),
    ...(motivoRevision ? { motivoRevision } : {}),
  };
}
