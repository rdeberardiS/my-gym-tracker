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
 * Construido a partir de la rutina vigente de la usuaria + una base de
 * ejercicios básicos de máquina para que casi todo matchee:
 *   Día 1: Glúteo pesado + Empuje
 *   Día 2: Cadera + Tirón
 *   Día 3: Glúteo accesorio
 *
 * Los videos son cortos y explicativos (en español). Si alguno no carga,
 * no gusta o no corresponde, la usuaria lo cambia desde la pantalla del
 * ejercicio (botón "cambiar video").
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
 * Los ejercicios de categoría 'core' (abdominales / zona media) NO llevan
 * peso: se registran sólo marcando las series. Ver `esEjercicioSinPeso()`.
 */
export const CATALOGO_EJERCICIOS: CatalogoEjercicio[] = [
  // ============================================================
  // CORE / ABDOMINALES (sin peso)
  // ============================================================
  entry(
    'Crunch bicicleta',
    [
      'crunch bicicleta',
      'abdominal bicicleta',
      'abdominales bicicleta',
      'bicicleta abdominal',
      'bicycle crunch',
    ],
    'https://www.youtube.com/watch?v=dSp34wX3JpI',
    'core'
  ),
  entry(
    'Toques de talón',
    [
      'toques talon',
      'toque talon',
      'toques de talon',
      'toques talones',
      'toque de talones',
      'heel taps',
      'heel touches',
      'pinguinos',
    ],
    'https://www.youtube.com/watch?v=PmD8OjgsdrY',
    'core'
  ),
  entry(
    'Crunch invertido',
    [
      'crunch invertido',
      'crunch inverso',
      'crunch invertido abdominal',
      'abdominal invertido',
      'reverse crunch',
      'elevacion piernas tumbada',
    ],
    'https://www.youtube.com/watch?v=EZySfeq2uV4',
    'core'
  ),
  entry(
    'Plancha frontal',
    ['plancha', 'plancha frontal', 'plancha abdominal', 'plank'],
    'https://www.youtube.com/watch?v=ASdvN_XEl_c',
    'core'
  ),
  entry(
    'Dead bug',
    ['dead bug', 'deadbug', 'bicho muerto'],
    'https://www.youtube.com/watch?v=g_BYB0R-4Ws',
    'core'
  ),
  entry(
    'Bird dog',
    ['bird dog', 'birddog', 'pajaro perro'],
    'https://www.youtube.com/watch?v=wiFNA3sqjCA',
    'core'
  ),
  entry(
    'Mountain climbers',
    ['mountain climbers', 'mountain climber', 'escaladores', 'escalador'],
    'https://www.youtube.com/watch?v=mHg0OEUnLhw',
    'core'
  ),

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
    'https://www.youtube.com/watch?v=14wE63cK26I',
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
    'https://www.youtube.com/watch?v=ulNCO1lgv_w',
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
      'peso muerto rumano con barra',
      'peso muerto rumano mancuernas o barra liviana',
      'rdl',
      'romanian deadlift',
    ],
    'https://www.youtube.com/watch?v=BJgFG614Ljs',
    'gluteo'
  ),
  entry(
    'Prensa de piernas (pies altos para glúteo)',
    [
      'prensa',
      'prensa de piernas',
      'prensa piernas',
      'prensa pies altos',
      'prensa con pies altos',
      'prensa pies altos foco gluteo',
      'prensa inclinada',
      'leg press',
    ],
    'https://www.youtube.com/watch?v=xR5GRg_E6kk',
    'pierna'
  ),
  entry(
    'Extensión de cuádriceps en máquina',
    [
      'extension cuadriceps',
      'extension de cuadriceps',
      'extension cuadriceps maquina',
      'extension de cuadriceps en maquina',
      'extension de rodilla',
      'sillon de cuadriceps',
      'leg extension',
      'cuadriceps maquina',
    ],
    'https://www.youtube.com/watch?v=MyeQ1zCcfas',
    'pierna'
  ),
  entry(
    'Curl femoral en máquina',
    [
      'curl femoral',
      'curl femoral en maquina',
      'curl femoral tumbado',
      'curl femoral acostado',
      'curl femoral sentado',
      'femoral en maquina',
      'curl de pierna',
    ],
    'https://www.youtube.com/shorts/nmqG-tIr0hc',
    'pierna'
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
    'Patada de glúteo en máquina',
    [
      'patada de gluteo en maquina',
      'patada gluteo en maquina',
      'patada de gluteo maquina',
      'patada gluteo maquina',
    ],
    'https://www.youtube.com/shorts/7dAyon8VTz4',
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
    'https://www.youtube.com/shorts/Vw32LcBYYrI',
    'gluteo'
  ),
  entry(
    'Abducción en máquina multicadera',
    [
      'abduccion en maquina multicadera',
      'abduccion maquina multicadera',
      'abduccion multicadera',
      'multicadera',
      'abduccion de cadera en maquina',
      'abduccion en maquina',
    ],
    'https://www.youtube.com/shorts/VWbA5zvYmi4',
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
    'https://www.youtube.com/shorts/9sxKdYp4ndE',
    'pecho'
  ),
  entry(
    'Press de pecho en máquina',
    [
      'press pecho maquina',
      'press de pecho en maquina',
      'press de pecho maquina',
      'chest press',
      'press pectoral maquina',
      'press plano maquina',
    ],
    'https://www.youtube.com/watch?v=d-gwsl5BlMQ',
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
    'https://www.youtube.com/shorts/zEANAIh1l9g',
    'hombros'
  ),
  entry(
    'Vuelos posteriores con mancuerna',
    [
      'vuelos posteriores',
      'vuelos posteriores con mancuerna',
      'vuelos posteriores con mancuernas',
      'vuelo posterior',
      'pajaros',
      'pajaros con mancuernas',
      'deltoide posterior mancuerna',
      'reverse fly',
    ],
    'https://www.youtube.com/shorts/qv4mGZP0RGI',
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
    'https://www.youtube.com/shorts/357EP7EhmPs',
    'espalda'
  ),
  entry(
    'Remo en máquina',
    [
      'remo maquina',
      'remo en maquina',
      'remo horizontal maquina',
      'remo de espalda en maquina',
      'machine row',
    ],
    'https://www.youtube.com/watch?v=VWyhefUKTp4',
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
    'https://www.youtube.com/shorts/bPAqG0B8_HQ',
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
      'curl de biceps con mancuernas',
      'curl mancuernas',
    ],
    'https://www.youtube.com/shorts/1oum3XH1ohs',
    'brazos'
  ),
  entry(
    'Press francés con mancuernas',
    [
      'press frances con mancuernas',
      'press frances mancuernas',
      'press frances',
      'extension de triceps tumbado',
      'french press',
    ],
    'https://www.youtube.com/shorts/u8w3Us_FWb4',
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
];

/**
 * Conjunto de categorías cuyos ejercicios NO se registran con peso.
 */
const CATEGORIAS_SIN_PESO = new Set<CatalogoEjercicio['categoria']>(['core']);

/**
 * Palabras (ya normalizadas) que delatan un ejercicio de peso corporal /
 * core aunque no esté en el catálogo. Es una red de seguridad para que
 * ejercicios nuevos de abdominales tampoco pidan peso.
 */
const VARIANTES_SIN_PESO_EXTRA = [
  'crunch',
  'abdominal',
  'abdominales',
  'toques talon',
  'toque talon',
  'plancha',
  'plank',
  'dead bug',
  'bicho muerto',
  'bird dog',
  'pajaro perro',
  'mountain climbers',
  'escaladores',
  'elevacion de piernas',
  'elevaciones de piernas',
  'russian twist',
  'tijeras',
].map(normalizar);

/**
 * Busca en el catálogo la ENTRADA completa que matchea con el nombre dado.
 * Match exacto por variante normalizada; si no, match parcial eligiendo la
 * variante más larga (más específica). Devuelve null si no hay match.
 */
export function buscarEnCatalogo(
  nombreEjercicio: string
): CatalogoEjercicio | null {
  const normalizado = normalizar(nombreEjercicio);
  if (!normalizado) return null;

  for (const item of CATALOGO_EJERCICIOS) {
    if (item.variantesNormalizadas.includes(normalizado)) {
      return item;
    }
  }

  // Match parcial: el nombre normalizado CONTIENE alguna variante del
  // catálogo. Cubre casos como "Hip thrust con banda gris fina".
  // Se elige el match más largo (más específico).
  let mejorMatch: CatalogoEjercicio | null = null;
  let largoMejorMatch = 0;

  for (const item of CATALOGO_EJERCICIOS) {
    for (const variante of item.variantesNormalizadas) {
      if (normalizado.includes(variante) && variante.length > largoMejorMatch) {
        mejorMatch = item;
        largoMejorMatch = variante.length;
      }
    }
  }

  return mejorMatch;
}

/**
 * Busca en el catálogo un video que matchee con el nombre dado.
 * Devuelve el video del catálogo si encuentra match, null si no.
 */
export function buscarVideoEnCatalogo(nombreEjercicio: string): string | null {
  return buscarEnCatalogo(nombreEjercicio)?.videoUrl ?? null;
}

/**
 * Indica si un ejercicio se registra SIN peso (core / abdominales / peso
 * corporal). Para estos ejercicios la pantalla de entrenamiento no muestra
 * el peso ni los botones de ±2.5: sólo se marcan las series hechas.
 *
 * Decide por categoría del catálogo ('core') y, como red de seguridad, por
 * palabras típicas de abdominales aunque el ejercicio no esté en el catálogo.
 */
export function esEjercicioSinPeso(nombreEjercicio: string): boolean {
  const item = buscarEnCatalogo(nombreEjercicio);
  if (item && CATEGORIAS_SIN_PESO.has(item.categoria)) return true;

  const normalizado = normalizar(nombreEjercicio);
  if (!normalizado) return false;
  return VARIANTES_SIN_PESO_EXTRA.some(
    (v) => normalizado === v || normalizado.includes(v)
  );
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
  // Usamos el dominio sin cookies (más liviano y más privado).
  // playsinline=1 evita que iOS fuerce pantalla completa.
  return `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0`;
}

/**
 * Miniatura (thumbnail) liviana del video. Es una sola imagen (~15-30 KB)
 * en vez del reproductor completo, ideal para gimnasios con poca señal.
 * Devuelve la versión "hq" que existe para casi todos los videos.
 */
export function urlMiniatura(url: string): string | null {
  const id = extraerIdYoutube(url);
  if (!id) return null;
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/**
 * URL normal de "ver en YouTube" (para abrir en la app de YouTube como
 * alternativa si el reproductor embebido no carga).
 */
export function urlWatch(url: string): string | null {
  const id = extraerIdYoutube(url);
  if (!id) return null;
  return `https://www.youtube.com/watch?v=${id}`;
}
