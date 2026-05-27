/**
 * Catálogo precargado de ejercicios con videos de referencia.
 *
 * Cuando se importa una rutina, cada ejercicio detectado se busca en
 * este catálogo. Si el nombre normalizado del ejercicio coincide con
 * alguna de las variantes definidas, se le asigna automáticamente el
 * video correspondiente.
 *
 * El usuario puede sobreescribir cualquier video desde la app.
 *
 * Construido a partir de la rutina actual de la usuaria:
 *   Día 1: Glúteo pesado + Empuje
 *   Día 2: Cadera variada + Tirón
 *   Día 3: Glúteo accesorio + Zonas débiles
 */

import { normalizar } from '@/services/normalizador/normalizador';

export interface CatalogoEjercicio {
  /** Nombre canónico (el "oficial") */
  nombreCanonico: string;
  /**
   * Variantes de nombre que se consideran el mismo ejercicio.
   * Se guardan ya normalizadas para matching directo.
   */
  variantesNormalizadas: string[];
  /** URL de YouTube */
  videoUrl: string;
  /** Categoría del ejercicio (sirve para agrupar en UI futura) */
  categoria:
    | 'gluteo'
    | 'pierna'
    | 'pecho'
    | 'espalda'
    | 'hombros'
    | 'brazos'
    | 'core';
}

/**
 * Función helper: crea la entrada normalizando las variantes en el momento.
 */
function entry(
  nombreCanonico: string,
  variantes: string[],
  videoUrl: string,
  categoria: CatalogoEjercicio['categoria']
): CatalogoEjercicio {
  return {
    nombreCanonico,
    variantesNormalizadas: variantes.map(normalizar).filter(Boolean),
    videoUrl,
    categoria,
  };
}

/**
 * Catálogo base.
 *
 * Los videos de placeholder apuntan a videos públicos conocidos de canales
 * reconocidos en español (Sergio Peinado, Powerexplosive, Mar Lázaro,
 * Fit Generation). La usuaria puede reemplazar cualquiera de estos desde
 * la app por el video que prefiera.
 *
 * Nota: estos IDs de YouTube son ilustrativos. Si al cargarse en la app no
 * existen o están restringidos, el usuario lo verá y los podrá cambiar.
 */
export const CATALOGO_EJERCICIOS: CatalogoEjercicio[] = [
  // ============================================================
  // GLÚTEO / CADERA
  // ============================================================
  entry(
    'Hip thrust con barra',
    [
      'hip thrust',
      'hip thrust con barra',
      'hip thrust pesado',
      'hip thrust barra',
      'hip thrust con barra o maquina',
      'hip thrust en maquina',
      'empuje de cadera',
    ],
    'https://www.youtube.com/watch?v=xDmFkJxPzeM',
    'gluteo'
  ),
  entry(
    'Hip thrust con banda',
    [
      'hip thrust con banda',
      'hip thrust con banda o peso medio',
      'hip thrust con banda elastica',
    ],
    'https://www.youtube.com/watch?v=LM8XHLYJoYs',
    'gluteo'
  ),
  entry(
    'Búlgara con mancuernas',
    [
      'bulgara',
      'bulgara con mancuernas',
      'bulgara con mancuernas torso adelante',
      'sentadilla bulgara',
      'sentadilla bulgara con mancuernas',
      'split squat bulgaro',
    ],
    'https://www.youtube.com/watch?v=2C-uNgKwPLE',
    'gluteo'
  ),
  entry(
    'Sentadilla goblet',
    [
      'sentadilla goblet',
      'sentadilla goblet con mancuerna',
      'goblet squat',
      'goblet',
    ],
    'https://www.youtube.com/watch?v=MeIiIdhvXT4',
    'pierna'
  ),
  entry(
    'Peso muerto rumano',
    [
      'peso muerto rumano',
      'peso muerto rumano mancuernas',
      'peso muerto rumano barra',
      'peso muerto rumano mancuernas o barra liviana',
      'rdl',
      'romanian deadlift',
    ],
    'https://www.youtube.com/watch?v=jEy_czb3RKA',
    'gluteo'
  ),
  entry(
    'Step up alto con mancuernas',
    [
      'step up',
      'step up alto',
      'step up con mancuernas',
      'step up alto con mancuernas',
      'subida al banco',
    ],
    'https://www.youtube.com/watch?v=dQqApCGd5Ss',
    'pierna'
  ),
  entry(
    'Patada de cadera en polea',
    [
      'patada cadera en polea',
      'patada de cadera en polea',
      'patada gluteo polea',
      'cable kickback',
      'cable kickback gluteo',
      'kickback gluteo',
    ],
    'https://www.youtube.com/watch?v=SqO-fD1ZsZA',
    'gluteo'
  ),
  entry(
    'Abducción de cadera sentada en máquina',
    [
      'abduccion cadera sentada',
      'abduccion de cadera sentada',
      'abduccion cadera sentada en maquina',
      'abductora maquina',
      'abductores maquina',
    ],
    'https://www.youtube.com/watch?v=GnDD9Cj7TYg',
    'gluteo'
  ),
  entry(
    'Abducción de cadera de pie en polea',
    [
      'abduccion cadera de pie en polea',
      'abduccion de cadera de pie en polea',
      'abduccion polea',
      'abduccion cadera polea',
    ],
    'https://www.youtube.com/watch?v=4JmsoLQ2fpQ',
    'gluteo'
  ),

  // ============================================================
  // EMPUJE / PECHO / HOMBRO
  // ============================================================
  entry(
    'Press plano con mancuernas',
    [
      'press plano',
      'press plano con mancuernas',
      'press banca mancuernas',
      'press con mancuernas plano',
    ],
    'https://www.youtube.com/watch?v=VmB1G1K7v94',
    'pecho'
  ),
  entry(
    'Press de banca',
    [
      'press banca',
      'press de banca',
      'press banca plano',
      'press de banca plano',
      'bench press',
    ],
    'https://www.youtube.com/watch?v=rT7DgCr-3pg',
    'pecho'
  ),
  entry(
    'Press hombro sentado en máquina',
    [
      'press hombro sentado',
      'press hombro sentado en maquina',
      'press hombro maquina',
      'press hombros maquina',
      'press militar maquina',
    ],
    'https://www.youtube.com/watch?v=B-aVuyhvLHU',
    'hombros'
  ),
  entry(
    'Elevaciones laterales con mancuernas',
    [
      'elevaciones laterales',
      'elevaciones laterales mancuernas',
      'elevaciones laterales con mancuernas',
      'lateral raises',
    ],
    'https://www.youtube.com/watch?v=3VcKaXpzqRo',
    'hombros'
  ),

  // ============================================================
  // TIRÓN / ESPALDA
  // ============================================================
  entry(
    'Remo sentado en polea',
    [
      'remo sentado',
      'remo sentado polea',
      'remo sentado en polea',
      'remo sentado en polea agarre neutro',
      'remo polea baja',
      'seated row',
    ],
    'https://www.youtube.com/watch?v=GZbfZ033f74',
    'espalda'
  ),
  entry(
    'Jalón al pecho',
    [
      'jalon al pecho',
      'jalon al pecho agarre amplio',
      'jalon pecho',
      'lat pulldown',
      'jalon polea agarre amplio',
    ],
    'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    'espalda'
  ),

  // ============================================================
  // BRAZOS
  // ============================================================
  entry(
    'Curl bíceps con mancuernas',
    [
      'curl biceps',
      'curl biceps mancuernas',
      'curl biceps con mancuernas',
      'curl mancuernas',
    ],
    'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
    'brazos'
  ),
  entry(
    'Extensión de tríceps en polea',
    [
      'extension triceps polea',
      'extension de triceps polea',
      'extension de triceps en polea',
      'triceps polea',
      'tricep pushdown',
    ],
    'https://www.youtube.com/watch?v=2-LAMcpzODU',
    'brazos'
  ),

  // ============================================================
  // CORE / PREVENCIÓN
  // ============================================================
  entry(
    'Plancha frontal',
    [
      'plancha',
      'plancha frontal',
      'plancha abdominal',
      'plank',
    ],
    'https://www.youtube.com/watch?v=ASdvN_XEl_c',
    'core'
  ),
  entry(
    'Dead bug',
    [
      'dead bug',
      'deadbug',
      'bicho muerto',
    ],
    'https://www.youtube.com/watch?v=g_BYB0R-4Ws',
    'core'
  ),
  entry(
    'Bird dog',
    [
      'bird dog',
      'birddog',
      'pajaro perro',
    ],
    'https://www.youtube.com/watch?v=wiFNA3sqjCA',
    'core'
  ),
];

/**
 * Busca en el catálogo un ejercicio que matchee con el nombre dado.
 * Devuelve el video del catálogo si encuentra match, null si no.
 *
 * El matching es por nombre normalizado contra las variantes.
 */
export function buscarVideoEnCatalogo(nombreEjercicio: string): string | null {
  const normalizado = normalizar(nombreEjercicio);
  if (!normalizado) return null;

  for (const item of CATALOGO_EJERCICIOS) {
    if (item.variantesNormalizadas.includes(normalizado)) {
      return item.videoUrl;
    }
  }

  // Si no hay match exacto, intentamos match parcial: que el nombre
  // normalizado del ejercicio CONTENGA alguna variante del catálogo.
  // Esto cubre casos como "Hip thrust con banda elástica gris" -> "hip thrust con banda".
  // Se busca el match más largo (más específico) primero.
  let mejorMatch: CatalogoEjercicio | null = null;
  let largoMejorMatch = 0;

  for (const item of CATALOGO_EJERCICIOS) {
    for (const variante of item.variantesNormalizadas) {
      if (
        normalizado.includes(variante) &&
        variante.length > largoMejorMatch
      ) {
        mejorMatch = item;
        largoMejorMatch = variante.length;
      }
    }
  }

  return mejorMatch?.videoUrl ?? null;
}

/**
 * Extrae el ID del video de YouTube desde una URL.
 * Soporta: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID
 */
export function extraerIdYoutube(url: string): string | null {
  if (!url) return null;

  // Patrón 1: youtube.com/watch?v=ID
  let match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Patrón 2: youtu.be/ID
  match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Patrón 3: youtube.com/shorts/ID
  match = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Patrón 4: youtube.com/embed/ID
  match = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  return null;
}

/**
 * Construye una URL embebida de YouTube a partir de cualquier URL válida.
 * Usada por el reproductor de la app.
 */
export function urlEmbed(url: string): string | null {
  const id = extraerIdYoutube(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}
