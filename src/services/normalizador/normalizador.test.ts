import { describe, it, expect } from 'vitest';
import { normalizar } from './normalizador';

describe('normalizar', () => {
  describe('casos básicos', () => {
    it('pasa a minúsculas', () => {
      expect(normalizar('PRESS BANCA')).toBe('press banca');
      expect(normalizar('Press Banca')).toBe('press banca');
    });

    it('saca tildes', () => {
      expect(normalizar('Tracción')).toBe('traccion');
      expect(normalizar('Día')).toBe('dia');
      expect(normalizar('Sentadilla búlgara')).toBe('sentadilla bulgara');
    });

    it('saca palabras conectoras', () => {
      expect(normalizar('Press de banca')).toBe('press banca');
      expect(normalizar('Curl con barra')).toBe('curl barra');
      expect(normalizar('Peso muerto con mancuernas')).toBe('peso muerto mancuernas');
    });

    it('colapsa espacios múltiples', () => {
      expect(normalizar('Press   banca')).toBe('press banca');
      expect(normalizar('  Press banca  ')).toBe('press banca');
    });

    it('combina todas las reglas', () => {
      expect(normalizar('  PRESS  de  BANCA  plano  ')).toBe('press banca plano');
    });
  });

  describe('casos del mundo real', () => {
    it('agrupa variaciones del mismo ejercicio', () => {
      const variaciones = [
        'Press banca plano',
        'PRESS BANCA PLANO',
        'press de banca plano',
        '  Press  banca  plano  ',
        'PRESS de BANCA plano',
      ];
      const normalizadas = variaciones.map(normalizar);
      // Todas deberían colapsar al mismo string
      expect(new Set(normalizadas).size).toBe(1);
      expect(normalizadas[0]).toBe('press banca plano');
    });

    it('mantiene como distintos ejercicios realmente diferentes', () => {
      expect(normalizar('Press banca plano')).not.toBe(
        normalizar('Press banca inclinado')
      );
      expect(normalizar('Press militar')).not.toBe(normalizar('Press francés'));
    });

    it('maneja casos con dos palabras conectoras seguidas', () => {
      // Esto no debería pasar mucho, pero por las dudas
      expect(normalizar('Press de la banca')).toBe('press banca');
    });
  });

  describe('casos edge', () => {
    it('string vacío devuelve string vacío', () => {
      expect(normalizar('')).toBe('');
    });

    it('solo espacios devuelve string vacío', () => {
      expect(normalizar('   ')).toBe('');
    });

    it('solo palabras conectoras devuelve string vacío', () => {
      expect(normalizar('de la con')).toBe('');
    });

    it('un solo carácter no conector', () => {
      expect(normalizar('Z')).toBe('z');
    });

    it('un solo carácter conector se elimina', () => {
      // "a" es palabra conectora, queda vacío
      expect(normalizar('A')).toBe('');
    });
  });
});
