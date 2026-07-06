/**
 * Parser principal de rutinas.
 *
 * Toma el texto crudo pegado por el usuario y devuelve una estructura
 * con días + ejercicios + estado.
 *
 * Estrategia:
 *   1. Limpieza inicial del texto
 *   2. Recorrer líneas detectando encabezados de día
 *   3. Para cada línea no-encabezado, intentar parsearla como ejercicio
 *   4. Líneas que no son ni encabezado ni ejercicio -> "no interpretadas"
 *   5. Si no hay encabezados detectados, todo es "Día 1"
 */

import type { DiaParseado, ResultadoParser } from '@/types/parser';
import {
  REGEX_ENCABEZADO_DIA,
  esEncabezadoSoloNombre,
} from './patrones';
import { parsearLineaEjercicio, pareceTextoNarrativo } from './parserLinea';

/**
 * Limpia el texto inicial:
 *  - Normaliza saltos de línea
 *  - Trim de cada línea
 *  - Colapsa espacios múltiples en cada línea
 *  - Mantiene líneas vacías intermedias (son separadores visuales,
 *    pero no afectan el parseo)
 */
function limpiarTexto(texto: string): string[] {
  return texto
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((linea) => linea.trim().replace(/\s+/g, ' '));
}

/**
 * Intenta detectar un encabezado de día.
 * Devuelve { numero, nombre } si matchea, null si no.
 */
function detectarEncabezadoDia(
  linea: string
): { numero: number; nombre: string } | null {
  if (!linea) return null;

  // Patrón explícito: "Día N", "Sesión N", "Entrenamiento N"
  const match = linea.match(REGEX_ENCABEZADO_DIA);
  if (match) {
    const numero = Number(match[1]);
    const nombreCrudo = (match[2] || '').trim();
    const nombre = nombreCrudo || `Día ${numero}`;
    return { numero, nombre };
  }

  return null;
}

export function parsearRutina(textoCrudo: string): ResultadoParser {
  const lineas = limpiarTexto(textoCrudo);

  const dias: DiaParseado[] = [];
  const lineasNoInterpretadas: string[] = [];

  let diaActual: DiaParseado | null = null;
  let proximoOrdenDia = 1;

  // Recorremos línea por línea
  for (const linea of lineas) {
    if (!linea) continue; // ignorar vacías

    // ¿Es encabezado de día explícito?
    const encabezadoExplicito = detectarEncabezadoDia(linea);
    if (encabezadoExplicito) {
      diaActual = {
        nombre: encabezadoExplicito.nombre,
        orden: proximoOrdenDia++,
        ejercicios: [],
      };
      dias.push(diaActual);
      continue;
    }

    // ¿Es encabezado solo con nombre (ej: "EMPUJE")?
    // Solo lo consideramos si no estamos a la mitad de detectar ejercicios
    // de un día actual (heurística conservadora).
    if (esEncabezadoSoloNombre(linea)) {
      // Si el día actual ya tiene ejercicios, lo cerramos y abrimos uno nuevo.
      // Si NO tiene ejercicios, sobreescribimos el nombre (caso: encabezado
      // doble como "Día 1\nEMPUJE").
      if (!diaActual || diaActual.ejercicios.length > 0) {
        diaActual = {
          nombre: capitalizar(linea),
          orden: proximoOrdenDia++,
          ejercicios: [],
        };
        dias.push(diaActual);
      } else {
        diaActual.nombre = capitalizar(linea);
      }
      continue;
    }

    // No es encabezado, intentamos parsear como ejercicio
    const ejercicio = parsearLineaEjercicio(linea);

    if (ejercicio.estado === 'no_interpretado') {
      // Si parece texto narrativo, va a la bolsa de no interpretadas
      if (pareceTextoNarrativo(linea)) {
        lineasNoInterpretadas.push(linea);
      } else {
        // Línea ambigua: la guardamos como no interpretada del día actual
        // si hay un día abierto, sino a la bolsa general.
        if (diaActual) {
          diaActual.ejercicios.push(ejercicio);
        } else {
          lineasNoInterpretadas.push(linea);
        }
      }
      continue;
    }

    // Es un ejercicio válido. Si no hay día abierto, creamos "Día 1".
    if (!diaActual) {
      diaActual = {
        nombre: 'Día 1',
        orden: proximoOrdenDia++,
        ejercicios: [],
      };
      dias.push(diaActual);
    }

    diaActual.ejercicios.push(ejercicio);
  }

  // Filtrar días que quedaron sin ningún ejercicio interpretado válido.
  // (Caso: encabezado huérfano sin nada debajo)
  const diasConContenido = dias.filter((d) =>
    d.ejercicios.some((e) => e.estado === 'ok' || e.estado === 'revisar')
  );

  // Reordenamos los días por si filtramos alguno del medio
  diasConContenido.forEach((dia, idx) => {
    dia.orden = idx + 1;
  });

  // Determinar éxito global: al menos un ejercicio 'ok' o 'revisar'
  const hayAlgunEjercicioValido = diasConContenido.some((d) =>
    d.ejercicios.some((e) => e.estado === 'ok' || e.estado === 'revisar')
  );

  return {
    exito: hayAlgunEjercicioValido,
    dias: diasConContenido,
    lineasNoInterpretadas,
  };
}

/**
 * Capitaliza la primera letra de cada palabra del nombre del día.
 * "EMPUJE" -> "Empuje"
 * "TREN INFERIOR" -> "Tren Inferior"
 */
function capitalizar(texto: string): string {
  return texto
    .toLowerCase()
    .split(/\s+/)
    .map((palabra) =>
      palabra.length > 0 ? palabra[0].toUpperCase() + palabra.slice(1) : palabra
    )
    .join(' ');
}
