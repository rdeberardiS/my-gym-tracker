/**
 * Tipos de dominio del MVP.
 *
 * Reflejan exactamente las 7 entidades definidas en el modelo de datos:
 * Configuracion, Ejercicio, Rutina, DiaRutina, EjercicioEnDiaRutina,
 * Sesion, Serie.
 *
 * Estos tipos son la fuente de verdad para toda la app.
 */

// ============================================================
// Configuración global
// ============================================================

export type Tema = 'oscuro' | 'claro';
export type UnidadPeso = 'kg' | 'lb';

export interface Configuracion {
  id: 1; // tabla de una sola fila, id fijo
  objetivoSemanal: number; // default: 3
  tema: Tema; // default: 'oscuro'
  unidadPeso: UnidadPeso; // default: 'kg'
}

// ============================================================
// Ejercicio: entidad permanente
// ============================================================

/**
 * El Ejercicio es la unidad atómica del producto.
 * Sobrevive a todos los cambios de rutina.
 * Su historial se acumula a lo largo del tiempo.
 */
export interface Ejercicio {
  id: string;
  nombre: string; // como lo escribió el coach
  nombreNormalizado: string; // para matching entre rutinas (indexado)
  fechaCreacion: number; // timestamp ms
  fechaUltimoUso: number; // timestamp ms (se actualiza al guardar serie)
  videoUrl?: string; // opcional, reservado para v1.1
}

// ============================================================
// Rutina: contenedor temporal
// ============================================================

export interface Rutina {
  id: string;
  nombre: string; // default: "Mi rutina"
  fechaImportacion: number; // timestamp ms
  textoOriginal: string; // texto crudo que pegó el usuario
  activa: boolean; // solo una con true a la vez (indexado)
}

// ============================================================
// DíaRutina: cada sesión dentro de una rutina
// ============================================================

export interface DiaRutina {
  id: string;
  rutinaId: string; // FK -> Rutina
  orden: number; // 1, 2, 3, ... (define el ciclo)
  nombre: string; // "Empuje", "Tracción", etc.
}

// ============================================================
// EjercicioEnDíaRutina: prescripción del coach
// ============================================================

export interface EjercicioEnDiaRutina {
  id: string;
  diaRutinaId: string; // FK -> DiaRutina
  ejercicioId: string; // FK -> Ejercicio
  orden: number; // posición dentro del día
  seriesPrescriptas: number; // ej: 4
  repsPrescriptas: string; // texto: "8", "8-10", "AMRAP", etc.
  pesoSugerido?: number; // opcional, si el coach lo indicó
  intensidad?: number; // 1 a 5, opcional (esfuerzo que pide el coach)
}

// ============================================================
// Sesión: un entrenamiento realizado
// ============================================================

export interface Sesion {
  id: string;
  diaRutinaId: string; // FK -> DiaRutina
  fechaInicio: number; // timestamp ms
  fechaFin?: number; // timestamp ms (null si en curso o abandonada)
  completada: boolean; // true solo si se tocó "Terminar entreno"
}

// ============================================================
// Serie: la unidad mínima registrada
// ============================================================

export interface Serie {
  id: string;
  sesionId: string; // FK -> Sesion
  ejercicioId: string; // FK -> Ejercicio (DIRECTO, no vía EjercicioEnDiaRutina)
  numeroSerie: number; // 1, 2, 3, ...
  peso: number; // en kg (o lb según config)
  reps: number; // cantidad realizada
  fechaRegistro: number; // timestamp ms
}

// ============================================================
// Comentario de ejercicio (nota de la sesión)
// ============================================================

/**
 * Nota libre que la persona escribe sobre un ejercicio DURANTE una sesión.
 * Es por sesión: la nota de hoy no pisa la de la semana pasada.
 * Se usa para anotar ajustes o dudas para consultarle al PT después.
 *
 * id determinístico = `${sesionId}__${ejercicioId}` para upsert directo.
 */
export interface ComentarioEjercicio {
  id: string;
  sesionId: string; // FK -> Sesion
  ejercicioId: string; // FK -> Ejercicio
  texto: string;
  fechaActualizacion: number; // timestamp ms
}

// ============================================================
// Tipos derivados (no se persisten, se computan)
// ============================================================

/**
 * Información calculada del "último entrenamiento" de un ejercicio.
 * Se computa al entrar a la pantalla de entrenamiento.
 */
export interface ResumenUltimaVez {
  pesoPreRellenado: number | null; // null si nunca se entrenó
  textoReferencia: string; // ej: "40kg × 8, 8, 8" o "Primera vez con este ejercicio"
  hace: string | null; // ej: "Hace 5 días", o null si es la primera vez
  fechaUltimaVez: number | null; // timestamp ms
}

/**
 * Estado del objetivo semanal calculado al vuelo.
 */
export interface EstadoSemanal {
  entrenosCompletados: number;
  objetivo: number;
  diasRestantes: number; // días que faltan hasta el domingo 23:59
  cumplido: boolean; // true si entrenosCompletados >= objetivo
  posibleCumplir: boolean; // false si quedan menos días que entrenos faltantes
}
