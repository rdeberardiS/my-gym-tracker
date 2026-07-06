/**
 * Normalizador de nombres de ejercicios.
 *
 * El nombre normalizado es el identificador funcional que permite que
 * "Press de banca plano" y "PRESS BANCA PLANO" se reconozcan como
 * el mismo ejercicio.
 *
 * Reglas (en orden):
 *  1. Pasar a minúsculas
 *  2. Sacar tildes/acentos
 *  3. Sacar palabras conectoras: de, con, el, la, los, las, en, a
 *  4. Colapsar espacios múltiples
 *  5. Trim
 *
 * Es una función PURA: misma entrada -> misma salida. Sin side effects.
 * Es la base del matching entre rutinas. Cualquier cambio acá impacta
 * cómo se agrupa el historial.
 */

const PALABRAS_CONECTORAS = new Set([
  'de',
  'con',
  'el',
  'la',
  'los',
  'las',
  'en',
  'a',
]);

/**
 * Normaliza un nombre de ejercicio para matching.
 *
 * @example
 * normalizar("Press de Banca Plano") // -> "press banca plano"
 * normalizar("PRESS BANCA") // -> "press banca"
 * normalizar("  Press  banca  ") // -> "press banca"
 */
export function normalizar(nombre: string): string {
  if (!nombre) return '';

  // 1. Minúsculas
  let resultado = nombre.toLowerCase();

  // 2. Sacar tildes y otros diacríticos (NFD descompone "á" en "a" + acento)
  resultado = resultado.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 2.5. Reemplazar guiones por espacios (step-up -> step up)
  resultado = resultado.replace(/[-_]/g, ' ');

  // 3. Sacar palabras conectoras y partir en tokens
  const tokens = resultado
    .split(/\s+/)
    .filter((token) => token.length > 0 && !PALABRAS_CONECTORAS.has(token));

  // 4 + 5. Unir con un solo espacio (colapsar) y trim implícito
  return tokens.join(' ');
}
