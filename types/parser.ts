/**
 * Tipos relacionados al parser de rutinas.
 *
 * El parser toma texto crudo y devuelve una estructura que la app puede
 * usar para construir Rutina + DíaRutina + EjercicioEnDíaRutina.
 *
 * NO crea entidades de base de datos directamente; eso es trabajo de la
 * capa de servicios después del preview del usuario.
 */

/**
 * Estado de un ejercicio detectado por el parser.
 *
 * - 'ok': se interpretó correctamente, todos los campos válidos
 * - 'revisar': se interpretó pero algo es sospechoso (peso muy alto,
 *   conversión de libras, valores raros)
 * - 'no_interpretado': no se pudo parsear, se conserva el texto original
 *   para que el usuario decida
 */
export type EstadoEjercicioParseado = 'ok' | 'revisar' | 'no_interpretado';

export interface EjercicioParseado {
  estado: EstadoEjercicioParseado;
  // Si estado != 'no_interpretado', estos campos están definidos:
  nombre?: string;
  series?: number;
  reps?: string; // se guarda como texto (soporta "8", "8-10", "AMRAP", etc.)
  pesoSugerido?: number; // kg
  intensidad?: number; // 1 a 5, opcional (la indica el coach en el texto)
  // Si estado != 'ok', este campo trae el texto crudo y razón:
  textoOriginal?: string;
  motivoRevision?: string; // ej: "Peso convertido de libras"
}

export interface DiaParseado {
  nombre: string; // "Empuje", "Día 1", etc.
  orden: number; // 1, 2, 3, ...
  ejercicios: EjercicioParseado[];
}

export interface ResultadoParser {
  exito: boolean; // false solo si no se detectó NINGÚN ejercicio
  dias: DiaParseado[];
  lineasNoInterpretadas: string[]; // texto de líneas que no son ejercicios ni encabezados
}
