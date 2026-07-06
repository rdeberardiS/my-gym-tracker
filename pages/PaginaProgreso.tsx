/**
 * Pantalla de Progreso.
 *
 * Calendario mensual donde se ven los días entrenados:
 *  - Verde: ese día entrenaste Y esa semana cumpliste el objetivo
 *  - Amarillo: ese día entrenaste pero esa semana NO cumpliste
 *  - Sin color: no entrenaste ese día
 *
 * Al tocar un día con entreno, se muestra el resumen abajo.
 */

import { useEffect, useMemo, useState } from 'react';
import { Pantalla } from '@/components/Pantalla';
import { BottomBar } from '@/components/BottomBar';
import { db } from '@/db/schema';
import { obtenerConfiguracion } from '@/db/repositorios/configuracionRepo';
import { obtenerComentariosDeSesion } from '@/db/repositorios/comentarioRepo';
import type { Sesion, Serie, Ejercicio, DiaRutina } from '@/types/dominio';

interface ResumenDia {
  diaRutinaNombre: string;
  diaRutinaOrden: number;
  ejercicios: Array<{
    nombre: string;
    peso: number;
    series: number;
    comentario?: string;
  }>;
}

function getInicioSemana(fecha: Date): Date {
  // Lunes como inicio de semana
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Domingo, 1=Lunes
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function mismoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function PaginaProgreso() {
  const hoy = new Date();
  const [mesVisible, setMesVisible] = useState<Date>(
    new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  );
  const [cargando, setCargando] = useState(true);
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [objetivo, setObjetivo] = useState(3);
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(hoy);
  const [resumen, setResumen] = useState<ResumenDia | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    if (diaSeleccionado) cargarResumen(diaSeleccionado);
    else setResumen(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diaSeleccionado, sesiones]);

  const cargar = async () => {
    setCargando(true);
    try {
      const config = await obtenerConfiguracion();
      setObjetivo(config.objetivoSemanal);

      const todas = await db.sesiones
        .filter((s) => s.completada === true)
        .toArray();
      setSesiones(todas);
    } finally {
      setCargando(false);
    }
  };

  const cargarResumen = async (fecha: Date) => {
    const sesionesDelDia = sesiones.filter((s) => {
      if (!s.fechaFin) return false;
      return mismoDia(new Date(s.fechaFin), fecha);
    });

    if (sesionesDelDia.length === 0) {
      setResumen(null);
      return;
    }

    sesionesDelDia.sort((a, b) => (b.fechaFin ?? 0) - (a.fechaFin ?? 0));
    const sesion = sesionesDelDia[0];

    const dia: DiaRutina | undefined = await db.diasRutina.get(sesion.diaRutinaId);

    const series = await db.series
      .where('sesionId')
      .equals(sesion.id)
      .toArray();

    const porEjercicio = new Map<string, Serie[]>();
    for (const s of series) {
      const list = porEjercicio.get(s.ejercicioId) ?? [];
      list.push(s);
      porEjercicio.set(s.ejercicioId, list);
    }

    const comentarios = await obtenerComentariosDeSesion(sesion.id);

    const ejerciciosResumen: ResumenDia['ejercicios'] = [];
    for (const [ejId, ss] of porEjercicio.entries()) {
      const ej: Ejercicio | undefined = await db.ejercicios.get(ejId);
      if (!ej) continue;

      const conteo = new Map<number, number>();
      for (const s of ss) {
        conteo.set(s.peso, (conteo.get(s.peso) ?? 0) + 1);
      }
      let pesoMax = 0;
      let maxC = 0;
      for (const [peso, c] of conteo.entries()) {
        if (c > maxC || (c === maxC && peso > pesoMax)) {
          pesoMax = peso;
          maxC = c;
        }
      }

      ejerciciosResumen.push({
        nombre: ej.nombre,
        peso: pesoMax,
        series: ss.length,
        comentario: comentarios.get(ejId),
      });
    }

    setResumen({
      diaRutinaNombre: dia?.nombre ?? '',
      diaRutinaOrden: dia?.orden ?? 0,
      ejercicios: ejerciciosResumen,
    });
  };

  const semanasCumplidas = useMemo(() => {
    const set = new Set<string>();
    const conteoPorSemana = new Map<string, number>();

    for (const s of sesiones) {
      if (!s.fechaFin) continue;
      const ini = getInicioSemana(new Date(s.fechaFin));
      const key = `${ini.getFullYear()}-${ini.getMonth()}-${ini.getDate()}`;
      conteoPorSemana.set(key, (conteoPorSemana.get(key) ?? 0) + 1);
    }

    for (const [key, count] of conteoPorSemana.entries()) {
      if (count >= objetivo) set.add(key);
    }
    return set;
  }, [sesiones, objetivo]);

  const diasGrilla = useMemo(() => {
    const primerDelMes = new Date(mesVisible);
    const startOffset =
      primerDelMes.getDay() === 0 ? 6 : primerDelMes.getDay() - 1;
    const start = new Date(primerDelMes);
    start.setDate(primerDelMes.getDate() - startOffset);

    const grilla: Array<{
      fecha: Date;
      enEsteMes: boolean;
      entrenado: boolean;
      semanaCumplida: boolean;
      esHoy: boolean;
      esSeleccionado: boolean;
    }> = [];

    for (let i = 0; i < 42; i++) {
      const f = new Date(start);
      f.setDate(start.getDate() + i);

      const entrenado = sesiones.some((s) => {
        if (!s.fechaFin) return false;
        return mismoDia(new Date(s.fechaFin), f);
      });

      const lunes = getInicioSemana(f);
      const k = `${lunes.getFullYear()}-${lunes.getMonth()}-${lunes.getDate()}`;
      const semanaCumplida = semanasCumplidas.has(k);

      grilla.push({
        fecha: f,
        enEsteMes: f.getMonth() === mesVisible.getMonth(),
        entrenado,
        semanaCumplida,
        esHoy: mismoDia(f, hoy),
        esSeleccionado: diaSeleccionado ? mismoDia(f, diaSeleccionado) : false,
      });
    }
    return grilla;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesVisible, sesiones, semanasCumplidas, diaSeleccionado]);

  const cambiarMes = (delta: number) => {
    setMesVisible(
      new Date(mesVisible.getFullYear(), mesVisible.getMonth() + delta, 1)
    );
  };

  const titulo = `${MESES[mesVisible.getMonth()]} ${mesVisible.getFullYear()}`;

  return (
    <Pantalla>
      <div className="flex items-center justify-center px-5 pt-4 pb-2">
        <span className="text-fg font-medium">Progreso</span>
      </div>

      <div className="px-3 pt-2 pb-4 flex-1 overflow-y-auto">
        <div className="bg-bg-elevated border border-bg-subtle rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              onClick={() => cambiarMes(-1)}
              className="text-fg-muted text-xl px-2 py-1"
            >
              ‹
            </button>
            <p className="text-fg text-base font-medium">{titulo}</p>
            <button
              onClick={() => cambiarMes(1)}
              className="text-fg-muted text-xl px-2 py-1"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <div
                key={i}
                className="text-center text-[10px] text-fg-subtle uppercase"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {diasGrilla.map((c, i) => {
              if (!c.enEsteMes) {
                return (
                  <div
                    key={i}
                    className="aspect-square flex items-center justify-center text-xs text-fg-subtle/30"
                  >
                    {c.fecha.getDate()}
                  </div>
                );
              }

              if (c.entrenado) {
                const bg = c.semanaCumplida
                  ? 'bg-sage text-sage-ink'
                  : 'bg-caramel text-caramel-ink';

                return (
                  <button
                    key={i}
                    onClick={() => setDiaSeleccionado(c.fecha)}
                    className={`aspect-square flex items-center justify-center text-xs rounded-lg cursor-pointer ${bg} ${
                      c.esSeleccionado ? 'ring-2 ring-fg' : ''
                    }`}
                  >
                    {c.fecha.getDate()}
                  </button>
                );
              }

              return (
                <button
                  key={i}
                  onClick={() => setDiaSeleccionado(c.fecha)}
                  className={`aspect-square flex items-center justify-center text-xs text-fg-muted rounded-lg hover:bg-bg-subtle ${
                    c.esSeleccionado ? 'ring-2 ring-fg-subtle' : ''
                  } ${c.esHoy ? 'font-bold text-fg' : ''}`}
                >
                  {c.fecha.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 mt-3 pt-3 border-t border-bg-subtle flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-sage rounded inline-block" />
              <span className="text-[11px] text-fg-muted">Cumplí la semana</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-caramel rounded inline-block" />
              <span className="text-[11px] text-fg-muted">No llegué</span>
            </div>
          </div>
        </div>

        {cargando && (
          <p className="text-center text-fg-subtle text-sm py-6">Cargando...</p>
        )}

        {!cargando && resumen && (
          <div className="bg-bg-elevated border border-bg-subtle rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-fg-muted text-xs mb-0.5">
                  {diaSeleccionado?.toLocaleDateString('es-AR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
                <p className="text-fg font-medium text-sm">
                  Día {resumen.diaRutinaOrden} · {resumen.diaRutinaNombre}
                </p>
              </div>
              <span className="bg-accent-muted text-fucsia text-[11px] px-2 py-1 rounded">
                Completado
              </span>
            </div>

            {resumen.ejercicios.map((e, i) => (
              <div
                key={i}
                className="py-2.5 border-t border-bg-subtle"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-fg">{e.nombre}</span>
                  <span className="text-xs text-fg-muted">
                    {e.peso > 0 ? `${e.peso} kg · ` : ''}
                    {e.series} {e.series === 1 ? 'serie' : 'series'}
                  </span>
                </div>
                {e.comentario && (
                  <p className="mt-1.5 text-xs text-fg-muted bg-bg rounded-lg px-3 py-2 border border-bg-subtle">
                    📝 {e.comentario}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {!cargando && diaSeleccionado && !resumen && (
          <div className="text-center py-8">
            <p className="text-fg-muted text-sm">
              No entrenaste el{' '}
              {diaSeleccionado.toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
        )}
      </div>

      <BottomBar />
    </Pantalla>
  );
}
