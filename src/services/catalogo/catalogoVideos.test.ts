import { describe, it, expect } from 'vitest';
import {
  buscarVideoEnCatalogo,
  esEjercicioSinPeso,
  extraerIdYoutube,
  urlEmbed,
} from './catalogoVideos';

describe('buscarVideoEnCatalogo', () => {
  it('encuentra match exacto por nombre canónico', () => {
    const v = buscarVideoEnCatalogo('Hip thrust');
    expect(v).toBeTruthy();
    expect(v).toContain('youtube.com');
  });

  it('encuentra match con variante "Hip thrust pesado"', () => {
    expect(buscarVideoEnCatalogo('Hip thrust pesado')).toBeTruthy();
  });

  it('matchea ignorando mayúsculas y conectores', () => {
    expect(buscarVideoEnCatalogo('HIP THRUST CON BARRA')).toBeTruthy();
    expect(buscarVideoEnCatalogo('Peso muerto rumano')).toBeTruthy();
  });

  it('matchea ejercicios con tildes', () => {
    expect(buscarVideoEnCatalogo('Búlgara con mancuernas')).toBeTruthy();
    expect(buscarVideoEnCatalogo('Abducción cadera polea')).toBeTruthy();
  });

  it('devuelve null si no hay match', () => {
    expect(buscarVideoEnCatalogo('Ejercicio inventado xyz')).toBeNull();
  });

  it('hace match parcial cuando hay info extra', () => {
    // "Hip thrust con banda gris fina" contiene "hip thrust con banda"
    const v = buscarVideoEnCatalogo('Hip thrust con banda gris fina');
    expect(v).toBeTruthy();
  });

  it('todos los ejercicios de la rutina tienen video', () => {
    const ejerciciosRutina = [
      'Hip thrust con barra',
      'Búlgara con mancuernas torso adelante',
      'Press plano con mancuernas',
      'Press hombro sentado en máquina',
      'Abducción de cadera sentada en máquina',
      'Plancha frontal',
      'Peso muerto rumano',
      'Step-up alto con mancuernas',
      'Patada de cadera en polea',
      'Remo sentado en polea agarre neutro',
      'Jalón al pecho agarre amplio',
      'Dead bug',
      'Hip thrust con banda',
      'Sentadilla goblet con mancuerna',
      'Elevaciones laterales con mancuernas',
      'Curl bíceps con mancuernas',
      'Extensión tríceps en polea',
      'Abducción de cadera de pie en polea',
      'Bird dog',
    ];

    for (const ej of ejerciciosRutina) {
      const video = buscarVideoEnCatalogo(ej);
      expect(video, `Falta video para: ${ej}`).toBeTruthy();
    }
  });
});

describe('rutina vigente: todos los ejercicios tienen video', () => {
  const rutinaVigente = [
    'Crunch bicicleta',
    'Toques de talón',
    'Crunch invertido',
    'Hip thrust con barra',
    'Búlgara con mancuernas',
    'Press plano con mancuernas',
    'Elevaciones laterales con mancuernas',
    'Abducción de cadera sentada en máquina',
    'Peso muerto rumano con barra',
    'Curl femoral en máquina',
    'Prensa con pies altos (foco glúteo)',
    'Remo sentado en polea',
    'Jalón al pecho',
    'Patada de glúteo en máquina',
    'Abducción en máquina multicadera',
    'Vuelos posteriores con mancuerna',
    'Curl de bíceps con mancuernas',
    'Press francés con mancuernas',
  ];

  for (const ej of rutinaVigente) {
    it(`tiene video: ${ej}`, () => {
      expect(buscarVideoEnCatalogo(ej), `Falta video para: ${ej}`).toBeTruthy();
    });
  }
});

describe('básicos de máquina agregados', () => {
  it('tiene video para los básicos de máquina', () => {
    expect(buscarVideoEnCatalogo('Prensa de piernas')).toBeTruthy();
    expect(buscarVideoEnCatalogo('Extensión de cuádriceps')).toBeTruthy();
    expect(buscarVideoEnCatalogo('Press de pecho en máquina')).toBeTruthy();
    expect(buscarVideoEnCatalogo('Remo en máquina')).toBeTruthy();
  });
});

describe('esEjercicioSinPeso', () => {
  it('marca como SIN peso los abdominales / core', () => {
    expect(esEjercicioSinPeso('Crunch bicicleta')).toBe(true);
    expect(esEjercicioSinPeso('Toques de talón')).toBe(true);
    expect(esEjercicioSinPeso('Crunch invertido')).toBe(true);
    expect(esEjercicioSinPeso('Plancha frontal')).toBe(true);
  });

  it('marca como CON peso los ejercicios de carga', () => {
    expect(esEjercicioSinPeso('Hip thrust con barra')).toBe(false);
    expect(esEjercicioSinPeso('Press plano con mancuernas')).toBe(false);
    expect(esEjercicioSinPeso('Curl femoral en máquina')).toBe(false);
    expect(esEjercicioSinPeso('Sentadilla goblet')).toBe(false);
  });
});

describe('extraerIdYoutube', () => {
  it('extrae ID de youtube.com/watch?v=', () => {
    expect(extraerIdYoutube('https://www.youtube.com/watch?v=abc12345678')).toBe(
      'abc12345678'
    );
  });

  it('extrae ID de youtu.be/', () => {
    expect(extraerIdYoutube('https://youtu.be/abc12345678')).toBe('abc12345678');
  });

  it('extrae ID de youtube.com/shorts/', () => {
    expect(extraerIdYoutube('https://www.youtube.com/shorts/abc12345678')).toBe(
      'abc12345678'
    );
  });

  it('devuelve null para URLs no-youtube', () => {
    expect(extraerIdYoutube('https://vimeo.com/123456')).toBeNull();
    expect(extraerIdYoutube('texto cualquiera')).toBeNull();
    expect(extraerIdYoutube('')).toBeNull();
  });
});

describe('urlEmbed', () => {
  it('construye URL embed válida (dominio sin cookies + playsinline)', () => {
    const embed = urlEmbed('https://www.youtube.com/watch?v=abc12345678');
    expect(embed).toContain('youtube-nocookie.com/embed/abc12345678');
    expect(embed).toContain('playsinline=1');
  });

  it('devuelve null para URL inválida', () => {
    expect(urlEmbed('no es url')).toBeNull();
  });
});
