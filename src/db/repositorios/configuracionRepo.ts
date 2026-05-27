/**
 * Repositorio de Configuración.
 *
 * Tabla con una sola fila (id fijo = 1). Encapsula la lógica de
 * inicialización con valores por defecto.
 */

import { db } from '../schema';
import type { Configuracion } from '@/types/dominio';

const ID_CONFIG: 1 = 1;

const CONFIG_DEFAULT: Configuracion = {
  id: ID_CONFIG,
  objetivoSemanal: 3,
  tema: 'oscuro',
  unidadPeso: 'kg',
};

/**
 * Obtiene la configuración actual. Si no existe (primera apertura de
 * la app), la crea con los defaults.
 */
export async function obtenerConfiguracion(): Promise<Configuracion> {
  const existente = await db.configuracion.get(ID_CONFIG);
  if (existente) return existente;

  await db.configuracion.put(CONFIG_DEFAULT);
  return CONFIG_DEFAULT;
}

/**
 * Actualiza campos de la configuración. Acepta updates parciales.
 */
export async function actualizarConfiguracion(
  cambios: Partial<Omit<Configuracion, 'id'>>
): Promise<Configuracion> {
  const actual = await obtenerConfiguracion();
  const nueva: Configuracion = { ...actual, ...cambios };
  await db.configuracion.put(nueva);
  return nueva;
}
