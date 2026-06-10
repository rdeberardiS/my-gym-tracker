/**
 * Pantalla "Mis ejercicios".
 *
 * Objetivo: que Rocío vea, ejercicio por ejercicio, cuánto peso hizo en sus
 * últimas sesiones, con barras, para saber de un vistazo cuánto carga y si
 * viene progresando.
 *
 * - Lista de todos los ejercicios (con el último peso al costado).
 * - Al tocar uno: detalle con barras por sesión (la más pesada en fucsia = récord).
 */

import { useEffect, useMemo, useState } from 'react';
import { Pantalla } from '@/components/Pantalla';
import { BottomBar } from '@/components/BottomBar';
import { listarEjerciciosPorRecientes } from '@/db/repositorios/ejercicioRepo';
import {
  obtenerHistorialEjercicio,
  type PuntoHistorial,
} from '@/db/repositorios/sesionRepo';
import { esEjercicioSinPeso } from '@/services/catalogo/catalogoVideos';
import type { Ejercicio } from '@/types/dominio';

function fmtFecha(ts: number): string {
  const f = new Date(ts).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  });
  return f.replace('.', '');
}

export function PaginaMisEjercicios() {
  const [cargando, setCargando] = useState(true);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [ultimoPeso, setUltimoPeso] = useState<Record<string, number | null>>({});
  const [seleccionado, setSeleccionado] = useState<Ejercicio | null>(null);
  const [historial, setHistorial] = useState<PuntoHistorial[]>([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const ejs = await listarEjerciciosPorRecientes();
      setEjercicios(ejs);
      // Último peso de cada uno (1 sesión) para mostrar al costado.
      const pares = await Promise.all(
        ejs.map(async (e) => {
          const h = await obtenerHistorialEjercicio(e.id, 1);
          const sinPeso = esEjercicioSinPeso(e.nombre);
          return [e.id, sinPeso ? null : h[0]?.pesoMax ?? null] as const;
        })
      );
      setUltimoPeso(Object.fromEntries(pares));
    } finally {
      setCargando(false);
    }
  };

  const abrir = async (e: Ejercicio) => {
    setSeleccionado(e);
    setCargandoDetalle(true);
    try {
      const h = await obtenerHistorialEjercicio(e.id, 12);
      setHistorial(h);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const maxPeso = useMemo(
    () => historial.reduce((m, p) => Math.max(m, p.pesoMax), 0),
    [historial]
  );

  const sinPesoSel = seleccionado ? esEjercicioSinPeso(seleccionado.nombre) : false;

  // ---- Vista detalle ----
  if (seleccionado) {
    return (
      <Pantalla>
        <div className="flex items-center gap-3 px-5 pt-4 pb-3">
          <button
            onClick={() => setSeleccionado(null)}
            className="w-9 h-9 rounded-full bg-bg-elevated flex items-center justify-center shadow-sm"
            aria-label="Volver"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-display font-black text-lg tracking-tight">
            MIS EJERCICIOS
          </span>
        </div>
        <div className="px-5 pt-2 pb-8 flex-1 overflow-y-auto">
          <h1 className="font-display text-2xl font-black tracking-tight leading-tight mb-1">
            {seleccionado.nombre}
          </h1>
          <p className="text-fg-muted text-sm mb-6">
            {historial.length > 0
              ? `Últimas ${historial.length} ${
                  historial.length === 1 ? 'sesión' : 'sesiones'
                }`
              : 'Todavía no lo entrenaste'}
          </p>

          {cargandoDetalle ? (
            <p className="text-fg-subtle text-sm">Cargando...</p>
          ) : historial.length === 0 ? (
            <div className="bg-bg-elevated rounded-2xl p-5 text-center shadow-sm">
              <p className="text-fg-muted text-sm">
                Cuando entrenes este ejercicio, vas a ver acá cuánto cargaste cada vez.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historial.map((p) => {
                const esRecord = !sinPesoSel && p.pesoMax === maxPeso && maxPeso > 0;
                const ancho = sinPesoSel
                  ? 100
                  : maxPeso > 0
                  ? Math.max(8, (p.pesoMax / maxPeso) * 100)
                  : 8;
                return (
                  <div key={p.sesionId}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-fg-muted text-xs font-semibold">
                        {fmtFecha(p.fecha)}
                      </span>
                      <span className="text-sm font-black flex items-center gap-1.5">
                        {sinPesoSel
                          ? `${p.series} ${p.series === 1 ? 'serie' : 'series'}`
                          : `${p.pesoMax} kg`}
                        {esRecord && (
                          <span className="text-fucsia text-[10px] font-extrabold uppercase tracking-wide">
                            🔥 récord
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-4 rounded-lg bg-bg-subtle/60 overflow-hidden">
                      <div
                        className={`h-full rounded-lg ${
                          esRecord ? 'bg-fucsia' : 'bg-accent'
                        }`}
                        style={{ width: `${ancho}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <BottomBar />
      </Pantalla>
    );
  }

  // ---- Vista lista ----
  return (
    <Pantalla>
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <span className="font-display font-black text-xl tracking-tight">
          MIS EJERCICIOS
        </span>
      </div>
      <div className="px-5 pb-6 flex-1 overflow-y-auto">
        {cargando ? (
          <p className="text-fg-subtle text-sm">Cargando...</p>
        ) : ejercicios.length === 0 ? (
          <div className="bg-bg-elevated rounded-2xl p-6 text-center shadow-sm mt-4">
            <div className="text-4xl mb-3">🏋️</div>
            <p className="text-fg-muted text-sm">
              Todavía no hay ejercicios. Importá tu rutina y entrená para ver tu
              historial de pesos acá.
            </p>
          </div>
        ) : (
          ejercicios.map((e) => {
            const peso = ultimoPeso[e.id];
            return (
              <button
                key={e.id}
                onClick={() => abrir(e)}
                className="w-full text-left bg-bg-elevated rounded-2xl px-4 py-3.5 mb-2 flex items-center gap-3 shadow-sm border-l-[5px] border-l-accent"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{e.nombre}</p>
                  <p className="text-fg-muted text-xs mt-0.5">
                    {peso != null ? `Último: ${peso} kg` : 'Sin peso registrado'}
                  </p>
                </div>
                <span className="text-fg-subtle text-lg">›</span>
              </button>
            );
          })
        )}
      </div>
      <BottomBar />
    </Pantalla>
  );
}
