/**
 * Arma un título corto para un día de rutina: "Día N · <músculo principal>".
 *
 * El coach nombra cada día con el foco principal, a veces con un "+" y una
 * parte secundaria (ej: "Glúteo pesado + empuje"). Nos quedamos con la parte
 * antes del "+" (el músculo que más se ejercita) y le anteponemos "Día N".
 *
 * Ejemplos:
 *   musculoDia("Glúteo pesado + empuje")     -> "Glúteo pesado"
 *   tituloDia(1, "Glúteo pesado + empuje")   -> "Día 1 · Glúteo pesado"
 *   tituloDia(2, "Cadena posterior + tirón") -> "Día 2 · Cadena posterior"
 */

/** Devuelve sólo el músculo principal (parte antes del "+"), sin "Día N". */
export function musculoDia(nombre: string): string {
  // Sacar un posible "Día N" / "Día N -" al inicio (por si quedó en el nombre).
  let limpio = nombre.replace(/^d[ií]a\s*\d+\s*[-·:]?\s*/i, '').trim();
  // Quedarnos con la parte principal (antes del primer "+").
  limpio = (limpio.split('+')[0] ?? limpio).trim();
  return limpio || nombre.trim();
}

/** Título completo: "Día N · <músculo principal>". */
export function tituloDia(orden: number, nombre: string): string {
  const m = musculoDia(nombre);
  return m ? `Día ${orden} · ${m}` : `Día ${orden}`;
}
