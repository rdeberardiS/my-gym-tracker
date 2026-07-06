import { describe, it, expect } from 'vitest';
import { inicioSemana, finSemana } from './objetivoSemanal';

describe('inicioSemana / finSemana', () => {
  it('lunes a las 10am -> inicio es ese mismo lunes 00:00', () => {
    // Lunes 26 de mayo de 2025 a las 10:00 hora local
    const lunes10am = new Date(2025, 4, 26, 10, 0, 0, 0).getTime();
    const inicio = new Date(inicioSemana(lunes10am));
    expect(inicio.getDay()).toBe(1); // lunes
    expect(inicio.getHours()).toBe(0);
    expect(inicio.getMinutes()).toBe(0);
    expect(inicio.getDate()).toBe(26);
  });

  it('miércoles -> inicio es el lunes de esa misma semana', () => {
    // Miércoles 28 de mayo de 2025
    const mie = new Date(2025, 4, 28, 15, 30, 0, 0).getTime();
    const inicio = new Date(inicioSemana(mie));
    expect(inicio.getDay()).toBe(1);
    expect(inicio.getDate()).toBe(26);
  });

  it('domingo -> inicio es el lunes anterior', () => {
    // Domingo 1 de junio de 2025
    const dom = new Date(2025, 5, 1, 23, 59, 0, 0).getTime();
    const inicio = new Date(inicioSemana(dom));
    expect(inicio.getDay()).toBe(1);
    expect(inicio.getDate()).toBe(26); // lunes 26 de mayo
  });

  it('finSemana es 7 días después menos 1ms del inicio', () => {
    const lunes = new Date(2025, 4, 26, 0, 0, 0, 0).getTime();
    const fin = finSemana(lunes);
    const finDate = new Date(fin);
    expect(finDate.getDay()).toBe(0); // domingo
    expect(finDate.getDate()).toBe(1); // 1 de junio
    expect(finDate.getHours()).toBe(23);
    expect(finDate.getMinutes()).toBe(59);
  });

  it('lunes -> miércoles de la misma semana cae entre inicio y fin', () => {
    const lunes = new Date(2025, 4, 26, 10, 0, 0, 0).getTime();
    const inicio = inicioSemana(lunes);
    const fin = finSemana(lunes);
    const mie = new Date(2025, 4, 28, 15, 30, 0, 0).getTime();
    expect(mie >= inicio && mie <= fin).toBe(true);
  });
});
