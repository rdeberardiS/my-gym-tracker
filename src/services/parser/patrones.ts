/**
 * Patrones regex usados por el parser.
 *
 * Los centralizamos acá para que sean fáciles de auditar y modificar.
 * Cada regex tiene un comentario explicando qué matchea y cuál es la
 * captura relevante.
 *
 * Diseño conservador: ante la duda, NO matcheamos.
 * Mejor pedir al usuario que edite que ensuciar el historial.
 */

/**
 * Detecta encabezados de día.
 *
 * Acepta:
 *   "Día 1", "Día 1 - Empuje", "Día 1: Empuje", "Día 1 Empuje"
 *   "Dia 1" (sin tilde)
 *   "Sesión 1", "Sesion 1"
 *   "Entrenamiento 1"
 *
 * Captura:
 *   grupo 1: número del día
 *   grupo 2: nombre del día (opcional, puede ser undefined)
 *
 * NO matchea encabezados solo con nombre tipo "EMPUJE" (sin "Día N");
 * eso se detecta por separado con heurística adicional.
 */
export const REGEX_ENCABEZADO_DIA =
  /^(?:d[íi]a|sesi[óo]n|entrenamiento)\s+(\d+)(?:\s*[-:.\s]\s*(.+))?$/i;

/**
 * Detecta encabezado solo con nombre en mayúsculas (sin "Día N").
 *
 * Solo matchea si la línea es:
 *   - Corta (1-3 palabras)
 *   - Toda en mayúsculas (con o sin tildes)
 *   - Sin números
 *
 * Esto es heurístico y conservador. Si no estamos seguros, NO la
 * tratamos como encabezado.
 */
export function esEncabezadoSoloNombre(linea: string): boolean {
  const trimmed = linea.trim();
  if (!trimmed) return false;

  // No debe contener números
  if (/\d/.test(trimmed)) return false;

  // No debe ser muy larga
  const palabras = trimmed.split(/\s+/);
  if (palabras.length === 0 || palabras.length > 4) return false;

  // Debe estar toda en mayúsculas (ignorando tildes/acentos)
  // Comparamos contra la versión upper para detectar si ya estaba upper
  const normalizada = trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return normalizada === normalizada.toUpperCase() && /[A-Z]/.test(normalizada);
}

/**
 * Detecta el patrón "NxM" dentro de una línea (series x reps).
 *
 * Acepta los multiplicadores: x, X, *, ×, por
 *
 * Captura:
 *   grupo 1: número de series
 *   grupo 2: multiplicador usado (para debug)
 *   grupo 3: reps (puede ser número, rango, AMRAP, etc.)
 *
 * Diseño conservador:
 *   - Series: 1 a 99 (más sería sospechoso)
 *   - Reps: puede ser cualquier secuencia no vacía que no incluya
 *     espacios ni símbolos raros (validamos después)
 */
export const REGEX_SERIES_X_REPS =
  /(\d{1,2})\s*(x|X|\*|×|\bpor\b)\s*([A-Za-z0-9,\-\u00C0-\u017F]+)/;

/**
 * Detecta peso en una línea.
 *
 * Acepta:
 *   "60kg", "60 kg", "60Kg", "60KG", "60kgs"
 *   "60lbs", "60 lbs", "60LBS"
 *   "@ 60kg", "@60kg"
 *
 * Captura:
 *   grupo 1: número (puede tener decimal con punto o coma)
 *   grupo 2: unidad (kg | lb)
 */
export const REGEX_PESO = /@?\s*(\d+(?:[.,]\d+)?)\s*(kgs?|lbs?)\b/i;

/**
 * Prefijos comunes a remover al inicio de una línea de ejercicio.
 *
 * Acepta: "- ", "• ", "* ", "1. ", "1) ", "1- "
 */
export const REGEX_PREFIJO_LISTA = /^\s*(?:[-•*]|\d+[.)\-])\s+/;

/**
 * Valores límite para detectar valores sospechosos.
 * Si un parseo arroja algo fuera de estos rangos, marcamos 'revisar'.
 */
export const LIMITES = {
  SERIES_MAX: 10,
  SERIES_MIN: 1,
  PESO_MAX_KG: 500,
  PESO_MIN_KG: 0.5,
  REPS_NUMERICO_MAX: 100,
} as const;

/**
 * Factor de conversión de libras a kilos.
 * Se redondea al múltiplo de 0.5 más cercano al usar.
 */
export const LB_A_KG = 0.453592;
