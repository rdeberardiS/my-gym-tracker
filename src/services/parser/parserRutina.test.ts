import { describe, it, expect } from 'vitest';
import { parsearRutina } from './parserRutina';

describe('parsearRutina', () => {
  describe('rutinas perfectas', () => {
    it('rutina simple con 2 días', () => {
      const texto = `Día 1 - Empuje
Press banca 4x8
Press militar 3x10
Aperturas 3x12

Día 2 - Tracción
Dominadas 4x6
Remo con barra 4x8
Curl barra 3x10`;

      const r = parsearRutina(texto);
      expect(r.exito).toBe(true);
      expect(r.dias).toHaveLength(2);

      expect(r.dias[0].nombre).toBe('Empuje');
      expect(r.dias[0].orden).toBe(1);
      expect(r.dias[0].ejercicios).toHaveLength(3);
      expect(r.dias[0].ejercicios[0].nombre).toBe('Press banca');

      expect(r.dias[1].nombre).toBe('Tracción');
      expect(r.dias[1].ejercicios).toHaveLength(3);
    });

    it('rutina con peso sugerido', () => {
      const texto = `Día 1 - Pierna
Sentadilla 4x8 80kg
Prensa 4x12 120kg`;

      const r = parsearRutina(texto);
      expect(r.dias[0].ejercicios[0].pesoSugerido).toBe(80);
      expect(r.dias[0].ejercicios[1].pesoSugerido).toBe(120);
    });
  });

  describe('formato variable', () => {
    it('acepta "Día 1:" con dos puntos', () => {
      const texto = `Día 1: Empuje
Press banca 4x8`;
      const r = parsearRutina(texto);
      expect(r.dias[0].nombre).toBe('Empuje');
    });

    it('acepta "DIA 1" sin tilde y en mayúsculas', () => {
      const texto = `DIA 1 - PIERNA
Sentadilla 4x8`;
      const r = parsearRutina(texto);
      expect(r.dias).toHaveLength(1);
      expect(r.dias[0].ejercicios).toHaveLength(1);
    });

    it('acepta prefijos variados de ejercicios', () => {
      const texto = `Día 1
- Press banca 4x8
• Press militar 3x10
1. Aperturas 3x12
2) Fondos 3x10`;
      const r = parsearRutina(texto);
      expect(r.dias[0].ejercicios).toHaveLength(4);
    });

    it('acepta "Sesión N"', () => {
      const texto = `Sesión 1 - Pecho
Press banca 4x8`;
      const r = parsearRutina(texto);
      expect(r.dias).toHaveLength(1);
      expect(r.dias[0].nombre).toBe('Pecho');
    });

    it('acepta encabezado solo con nombre en mayúsculas', () => {
      const texto = `EMPUJE
Press banca 4x8
Press militar 3x10

TRACCION
Dominadas 4x6
Remo 4x8`;
      const r = parsearRutina(texto);
      expect(r.dias).toHaveLength(2);
      expect(r.dias[0].nombre).toBe('Empuje');
      expect(r.dias[1].nombre).toBe('Traccion');
    });
  });

  describe('rutina sin encabezados', () => {
    it('asume "Día 1" si no hay encabezados', () => {
      const texto = `Press banca 4x8
Press militar 3x10
Aperturas 3x12`;
      const r = parsearRutina(texto);
      expect(r.exito).toBe(true);
      expect(r.dias).toHaveLength(1);
      expect(r.dias[0].nombre).toBe('Día 1');
      expect(r.dias[0].ejercicios).toHaveLength(3);
    });
  });

  describe('manejo de texto narrativo', () => {
    it('ignora líneas narrativas y las pone en lineasNoInterpretadas', () => {
      const texto = `Día 1 - Empuje
Press banca 4x8 60kg
Acordate de calentar bien antes de empezar
Press militar 3x10
Aperturas 3x12

Notas: hacer 90 segundos de descanso entre series`;

      const r = parsearRutina(texto);
      expect(r.exito).toBe(true);
      expect(r.dias[0].ejercicios.filter((e) => e.estado === 'ok')).toHaveLength(3);
      expect(r.lineasNoInterpretadas.length).toBeGreaterThanOrEqual(2);
      expect(r.lineasNoInterpretadas.some((l) => l.toLowerCase().includes('acordate'))).toBe(
        true
      );
    });
  });

  describe('rangos y esquemas en reps', () => {
    it('rango 8-10', () => {
      const texto = `Día 1
Press banca 4x8-10`;
      const r = parsearRutina(texto);
      expect(r.dias[0].ejercicios[0].reps).toBe('8-10');
    });

    it('esquema explícito 8,8,7,6', () => {
      const texto = `Día 1
Press banca 4x8,8,7,6`;
      const r = parsearRutina(texto);
      expect(r.dias[0].ejercicios[0].reps).toBe('8,8,7,6');
    });

    it('AMRAP', () => {
      const texto = `Día 1
Dominadas 4xAMRAP`;
      const r = parsearRutina(texto);
      expect(r.dias[0].ejercicios[0].reps).toBe('AMRAP');
    });
  });

  describe('casos límite', () => {
    it('texto vacío -> exito false', () => {
      const r = parsearRutina('');
      expect(r.exito).toBe(false);
      expect(r.dias).toHaveLength(0);
    });

    it('solo espacios y líneas vacías -> exito false', () => {
      const r = parsearRutina('\n\n   \n  \n');
      expect(r.exito).toBe(false);
    });

    it('encabezado de día sin ejercicios -> día se filtra', () => {
      const texto = `Día 1 - Empuje

Día 2 - Tracción
Dominadas 4x6`;
      const r = parsearRutina(texto);
      expect(r.dias).toHaveLength(1);
      expect(r.dias[0].nombre).toBe('Tracción');
      // El orden se renumera
      expect(r.dias[0].orden).toBe(1);
    });

    it('mezcla de basura y ejercicios válidos', () => {
      const texto = `Hola coach!!!
Día 1
Press banca 4x8
???????
Press militar 3x10
gibberish line`;
      const r = parsearRutina(texto);
      expect(r.exito).toBe(true);
      // Debe haber capturado los 2 ejercicios reales
      const ejerciciosValidos = r.dias[0].ejercicios.filter(
        (e) => e.estado === 'ok' || e.estado === 'revisar'
      );
      expect(ejerciciosValidos).toHaveLength(2);
    });
  });

  describe('caracteres especiales', () => {
    it('caracteres × Unicode', () => {
      const texto = `Día 1
Press banca 4×8`;
      const r = parsearRutina(texto);
      expect(r.dias[0].ejercicios[0].estado).toBe('ok');
      expect(r.dias[0].ejercicios[0].series).toBe(4);
    });

    it('saltos de línea Windows (CRLF)', () => {
      const texto = 'Día 1\r\nPress banca 4x8\r\nPress militar 3x10';
      const r = parsearRutina(texto);
      expect(r.dias).toHaveLength(1);
      expect(r.dias[0].ejercicios).toHaveLength(2);
    });
  });

  describe('renumeración de días', () => {
    it('orden de días siempre empieza en 1 y es secuencial', () => {
      const texto = `Día 5 - Empuje
Press banca 4x8

Día 7 - Tracción
Dominadas 4x6`;
      const r = parsearRutina(texto);
      expect(r.dias[0].orden).toBe(1);
      expect(r.dias[1].orden).toBe(2);
    });
  });
});
