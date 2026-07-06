/**
 * Genera un identificador único.
 *
 * Usamos crypto.randomUUID() que está disponible en todos los navegadores
 * modernos y en Node 19+. Devuelve un string tipo:
 *   "550e8400-e29b-41d4-a716-446655440000"
 */
export function generarId(): string {
  return crypto.randomUUID();
}
