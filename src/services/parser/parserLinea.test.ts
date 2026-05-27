import { describe, it, expect } from 'vitest';
import { parsearLineaEjercicio } from './parserLinea';

describe('parsearLineaEjercicio', () => {
  describe('formato básico Nombre NxM', () => {
    it('parsea "Press banca 4x8"', () => {
      const r = parsearLineaEjercicio('Press banca 4x8');
      expect(r.estado).toBe('ok');
      expect(r.nombre).toBe('Press banca');
      expect(r.series).toBe(4);
      expect(r.reps).toBe('8');
      expect(r.pesoSugerido).toBeUndefined();
    });

    it('acepta X mayúscula', () => {
      const r = parsearLineaEjercicio('Press banca 4X8');
      expect(r.estado).toBe('ok');
      expect(r.series).toBe(4);
    });

    it('acepta asterisco', () => {
      const r = parsearLineaEjercicio('Press banca 4*8');
      expect(r.estado).toBe('ok');
    });

    it('acepta × Unicode', () => {
      const r = parsearLineaEjercicio('Press banca 4×8');
      expect(r.estado).toBe('ok');
      expect(r.series).toBe(4);
      expect(r.reps).toBe('8');
    });
  });

  describe('formato con peso', () => {
    it('parsea peso pegado: 60kg', () => {
      const r = parsearLineaEjercicio('Press banca 4x8 60kg');
      expect(r.estado).toBe('ok');
      expect(r.pesoSugerido).toBe(60);
    });

    it('parsea peso con espacio: 60 kg', () => {
      const r = parsearLineaEjercicio('Press banca 4x8 60 kg');
      expect(r.estado).toBe('ok');
      expect(r.pesoSugerido).toBe(60);
    });

    it('parsea con arroba: @ 60kg', () => {
      const r = parsearLineaEjercicio('Press banca 4x8 @ 60kg');
      expect(r.estado).toBe('ok');
      expect(r.pesoSugerido).toBe(60);
    });

    it('parsea peso decimal con punto', () => {
      const r = parsearLineaEjercicio('Press banca 4x8 62.5kg');
      expect(r.estado).toBe('ok');
      expect(r.pesoSugerido).toBe(62.5);
    });

    it('parsea peso decimal con coma', () => {
      const r = parsearLineaEjercicio('Press banca 4x8 62,5kg');
      expect(r.estado).toBe('ok');
      expect(r.pesoSugerido).toBe(62.5);
    });

    it('convierte libras a kilos y marca como revisar', () => {
      const r = parsearLineaEjercicio('Press banca 4x8 100lbs');
      expect(r.estado).toBe('revisar');
      expect(r.pesoSugerido).toBe(45.5); // 100 * 0.453592 = 45.3592 -> redondeado a 0.5
      expect(r.motivoRevision).toContain('libras');
    });
  });

  describe('formatos de reps', () => {
    it('acepta rango 8-10', () => {
      const r = parsearLineaEjercicio('Press banca 4x8-10');
      expect(r.estado).toBe('ok');
      expect(r.reps).toBe('8-10');
    });

    it('acepta esquema 8,8,7,6', () => {
      const r = parsearLineaEjercicio('Press banca 4x8,8,7,6');
      expect(r.estado).toBe('ok');
      expect(r.reps).toBe('8,8,7,6');
    });

    it('acepta AMRAP', () => {
      const r = parsearLineaEjercicio('Dominadas 4xAMRAP');
      expect(r.estado).toBe('ok');
      expect(r.reps).toBe('AMRAP');
    });

    it('acepta MAX', () => {
      const r = parsearLineaEjercicio('Dominadas 4xMAX');
      expect(r.estado).toBe('ok');
      expect(r.reps).toBe('MAX');
    });
  });

  describe('prefijos de lista', () => {
    it('quita prefijo de guión', () => {
      const r = parsearLineaEjercicio('- Press banca 4x8');
      expect(r.estado).toBe('ok');
      expect(r.nombre).toBe('Press banca');
    });

    it('quita prefijo de bullet', () => {
      const r = parsearLineaEjercicio('• Press banca 4x8');
      expect(r.estado).toBe('ok');
      expect(r.nombre).toBe('Press banca');
    });

    it('quita prefijo numérico con punto', () => {
      const r = parsearLineaEjercicio('1. Press banca 4x8');
      expect(r.estado).toBe('ok');
      expect(r.nombre).toBe('Press banca');
    });

    it('quita prefijo numérico con paréntesis', () => {
      const r = parsearLineaEjercicio('1) Press banca 4x8');
      expect(r.estado).toBe('ok');
      expect(r.nombre).toBe('Press banca');
    });
  });

  describe('casos no interpretados (conservador)', () => {
    it('línea vacía', () => {
      const r = parsearLineaEjercicio('');
      expect(r.estado).toBe('no_interpretado');
    });

    it('línea sin patrón NxM', () => {
      const r = parsearLineaEjercicio('Press banca');
      expect(r.estado).toBe('no_interpretado');
    });

    it('línea sin nombre', () => {
      const r = parsearLineaEjercicio('4x8');
      expect(r.estado).toBe('no_interpretado');
    });

    it('reps con formato raro no se interpreta', () => {
      // "4x???" no es una rep válida
      const r = parsearLineaEjercicio('Press banca 4x???');
      expect(r.estado).toBe('no_interpretado');
    });
  });

  describe('casos de revisión', () => {
    it('series muy alto -> revisar', () => {
      const r = parsearLineaEjercicio('Press banca 15x8');
      expect(r.estado).toBe('revisar');
      expect(r.series).toBe(15);
      expect(r.motivoRevision).toContain('series');
    });

    it('peso muy alto -> revisar', () => {
      const r = parsearLineaEjercicio('Press banca 4x8 800kg');
      expect(r.estado).toBe('revisar');
      expect(r.motivoRevision).toContain('rango');
    });

    it('múltiples patrones NxM en una línea -> revisar', () => {
      const r = parsearLineaEjercicio('Press banca 4x8 luego 3x10');
      expect(r.estado).toBe('revisar');
      expect(r.series).toBe(4); // toma el primero
      expect(r.motivoRevision).toContain('múltiple');
    });
  });

  describe('nombres con caracteres especiales', () => {
    it('mantiene tildes en el nombre original', () => {
      const r = parsearLineaEjercicio('Tracción 4x8');
      expect(r.estado).toBe('ok');
      expect(r.nombre).toBe('Tracción');
    });

    it('nombre con varias palabras', () => {
      const r = parsearLineaEjercicio('Press inclinado con mancuernas 3x10');
      expect(r.estado).toBe('ok');
      expect(r.nombre).toBe('Press inclinado con mancuernas');
    });
  });
});
