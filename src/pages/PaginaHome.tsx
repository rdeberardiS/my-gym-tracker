/**
 * Pantalla Home.
 *
 * Estados:
 *  - Sin rutina activa: pantalla de bienvenida con CTA "Pegar mi rutina"
 *  - Con rutina activa: muestra día sugerido + indicador semanal + alertas
 *
 * Alertas proactivas:
 *  - Amarilla: vas atrasada pero todavía podés llegar
 *  - Roja: ya no se puede llegar al objetivo esta semana
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pantalla } from '@/components/Pantalla';
import { BottomBar } from '@/components/BottomBar';
import {
  obtenerRutinaActiva,
  obtenerDiasDeRutina,
} from '@/db/repositorios/rutinaRepo';
import { obtenerDiaSugerido } from '@/db/queries/diaSugerido';
import { calcularEstadoSemanal } from '@/db/queries/objetivoSemanal';
import { listarUltimasSesiones } from '@/db/repositorios/sesionRepo';
import { db } from '@/db/schema';
import type {
  Rutina,
  DiaRutina,
  EstadoSemanal,
  Sesion,
} from '@/types/dominio';
import { RUTAS } from '@/rutas';

interface SesionConDia {
  sesion: Sesion;
  diaNombre: string;
  diaOrden: number;
}

export function PaginaHome() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [rutina, setRutina] = useState<Rutina | null>(null);
  const [diaSugerido, setDiaSugerido] = useState<DiaRutina | null>(null);
  const [todosLosDias, setTodosLosDias] = useState<DiaRutina[]>([]);
  const [estadoSemanal, setEstadoSemanal] = useState<EstadoSemanal | null>(null);
  const [ultimasSesiones, setUltimasSesiones] = useState<SesionConDia[]>([]);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [selectorDiaAbierto, setSelectorDiaAbierto] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  // Recargar al volver a esta pantalla
  useEffect(() => {
    const onFocus = () => cargar();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const r = await obtenerRutinaActiva();
      setRutina(r);
      if (r) {
        const [dia, dias, semanal, sesiones] = await Promise.all([
          obtenerDiaSugerido(),
          obtenerDiasDeRutina(r.id),
          calcularEstadoSemanal(),
          listarUltimasSesiones(3),
        ]);
        setDiaSugerido(dia);
        setTodosLosDias(dias);
        setEstadoSemanal(semanal);

        // Enriquecer las últimas sesiones con info del día
        const conDia: SesionConDia[] = [];
        for (const s of sesiones) {
          const d = await db.diasRutina.get(s.diaRutinaId);
          if (d) {
            conDia.push({ sesion: s, diaNombre: d.nombre, diaOrden: d.orden });
          } else {
            conDia.push({ sesion: s, diaNombre: '', diaOrden: 0 });
          }
        }
        setUltimasSesiones(conDia);
      }
    } finally {
      setCargando(false);
    }
  };

  const empezarEntrenamiento = (diaId?: string) => {
    const id = diaId ?? diaSugerido?.id;
    if (!id) return;
    navigate(`${RUTAS.entrenamiento}/${id}`);
  };

  if (cargando) {
    return (
      <Pantalla>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-fg-subtle text-sm">Cargando...</p>
        </div>
      </Pantalla>
    );
  }

  // Estado 1: Primera vez, sin rutina
  if (!rutina) {
    return (
      <Pantalla>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-6xl mb-6">🏋️</div>
          <h1 className="text-2xl font-medium tracking-tight mb-2">Empecemos</h1>
          <p className="text-fg-muted text-sm mb-10 leading-relaxed">
            Pegá la rutina que te pasó tu coach.
            <br />
            La interpretamos automáticamente.
          </p>
          <button
            onClick={() => navigate(RUTAS.importar)}
            className="w-full max-w-sm bg-accent text-emerald-950 py-4 rounded-xl text-base font-medium"
          >
            Pegar mi rutina
          </button>
        </div>
        <BottomBar />
      </Pantalla>
    );
  }

  // Estado 2: Con rutina activa
  const fecha = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const fechaCapitalizada = fecha.charAt(0).toUpperCase() + fecha.slice(1);

  const alertaAmarilla =
    estadoSemanal &&
    !estadoSemanal.cumplido &&
    estadoSemanal.posibleCumplir &&
    estadoSemanal.entrenosCompletados < estadoSemanal.objetivo &&
    estadoSemanal.diasRestantes <= estadoSemanal.objetivo - estadoSemanal.entrenosCompletados + 1;

  const alertaRoja =
    estadoSemanal && !estadoSemanal.cumplido && !estadoSemanal.posibleCumplir;

  return (
    <Pantalla>
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="w-10" />
        <span className="text-fg font-medium">Gym Tracker</span>
        <button
          onClick={() => setMenuAbierto(true)}
          className="text-fg-muted text-2xl w-10 text-right"
          aria-label="Menú"
        >
          ⋯
        </button>
      </div>

      <div className="px-5 pb-6 flex-1 overflow-y-auto">
        {/* Alerta roja */}
        {alertaRoja && (
          <div className="bg-red-950/40 border border-red-800 rounded-xl p-3.5 mb-4 flex gap-3 items-start">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0 mt-0.5"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <p className="text-red-300 text-sm font-medium mb-0.5">
                No vas a llegar esta semana
              </p>
              <p className="text-red-300/80 text-xs leading-relaxed">
                Te faltan {estadoSemanal!.objetivo - estadoSemanal!.entrenosCompletados}{' '}
                entrenos. Cerrá la semana con lo que puedas, el lunes empezás de nuevo.
              </p>
            </div>
          </div>
        )}

        {/* Alerta amarilla */}
        {alertaAmarilla && (
          <div className="bg-amber-950/30 border border-amber-700/50 rounded-xl p-3.5 mb-4 flex gap-3 items-start">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <p className="text-amber-200 text-sm font-medium mb-0.5">
                Apretá el paso
              </p>
              <p className="text-amber-200/80 text-xs leading-relaxed">
                Vas {estadoSemanal!.entrenosCompletados} de {estadoSemanal!.objetivo}.
                Si entrenás{' '}
                {estadoSemanal!.objetivo - estadoSemanal!.entrenosCompletados === 1
                  ? 'hoy'
                  : `los próximos ${estadoSemanal!.objetivo - estadoSemanal!.entrenosCompletados} días`}
                , llegás al objetivo.
              </p>
            </div>
          </div>
        )}

        {/* Indicador semanal */}
        {estadoSemanal && (
          <div className="bg-bg-elevated border border-bg-subtle rounded-xl p-4 mb-7">
            <div className="flex items-center justify-between mb-2">
              <span className="text-fg-muted text-sm">Esta semana</span>
              <div className="flex gap-1.5">
                {Array.from({ length: estadoSemanal.objetivo }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full inline-block ${
                      i < estadoSemanal.entrenosCompletados
                        ? 'bg-accent'
                        : 'border border-fg-subtle'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-fg">
              {estadoSemanal.entrenosCompletados} de {estadoSemanal.objetivo}{' '}
              entrenos
            </p>
          </div>
        )}

        <p className="text-fg-subtle text-xs mb-1.5">{fechaCapitalizada}</p>
        <p className="text-fg-muted text-sm mb-1">Te toca</p>
        {diaSugerido ? (
          <>
            <h1 className="text-4xl font-medium tracking-tight leading-none mb-1.5">
              Día {diaSugerido.orden}
            </h1>
            <h2 className="text-2xl font-normal tracking-tight leading-tight mb-3">
              {diaSugerido.nombre}
            </h2>
          </>
        ) : (
          <p className="text-fg-muted text-sm mb-5">
            Tu rutina está cargada. Empezá cuando quieras.
          </p>
        )}

        <button
          onClick={() => empezarEntrenamiento()}
          className="w-full bg-accent text-emerald-950 py-4 rounded-xl text-base font-medium mt-5 mb-2"
        >
          Empezar entrenamiento →
        </button>

        {todosLosDias.length > 1 && (
          <button
            onClick={() => setSelectorDiaAbierto(true)}
            className="w-full text-fg-muted py-2 text-xs"
          >
            Quiero hacer otro día
          </button>
        )}

        {ultimasSesiones.length > 0 && (
          <>
            <p className="text-fg-subtle text-[11px] uppercase tracking-wider mt-7 mb-3">
              Últimos entrenos
            </p>
            {ultimasSesiones.map((u) => (
              <div
                key={u.sesion.id}
                className="bg-bg-elevated border border-bg-subtle rounded-lg px-3.5 py-3 mb-2 flex items-center justify-between"
              >
                <div>
                  <p className="text-fg text-sm mb-0.5">
                    {new Date(u.sesion.fechaFin ?? u.sesion.fechaInicio).toLocaleDateString(
                      'es-AR',
                      { weekday: 'short', day: 'numeric', month: 'short' }
                    )}
                    {u.diaNombre && <span className="text-fg-muted"> · Día {u.diaOrden} {u.diaNombre}</span>}
                  </p>
                </div>
                <span className="text-accent">✓</span>
              </div>
            ))}
          </>
        )}
      </div>

      <BottomBar />

      {/* Menú principal */}
      {menuAbierto && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end z-50"
          onClick={() => setMenuAbierto(false)}
        >
          <div
            className="w-full bg-bg-elevated border-t border-bg-subtle rounded-t-2xl p-5"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 20px)' }}
          >
            <p className="text-fg-subtle text-[11px] uppercase tracking-wider mb-3">
              Mi rutina
            </p>
            <button
              onClick={() => {
                setMenuAbierto(false);
                navigate(RUTAS.importar);
              }}
              className="w-full text-left bg-bg border border-bg-subtle rounded-lg px-4 py-3 text-sm mb-2 flex items-center gap-2"
            >
              📥 Importar nueva rutina
            </button>
            <button
              onClick={() => setMenuAbierto(false)}
              className="w-full text-fg-muted py-3 text-sm mt-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Selector "Quiero hacer otro día" */}
      {selectorDiaAbierto && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end z-50"
          onClick={() => setSelectorDiaAbierto(false)}
        >
          <div
            className="w-full bg-bg-elevated border-t border-bg-subtle rounded-t-2xl p-5"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 20px)' }}
          >
            <p className="text-fg-subtle text-[11px] uppercase tracking-wider mb-3">
              Elegí qué día querés entrenar
            </p>
            {todosLosDias.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setSelectorDiaAbierto(false);
                  empezarEntrenamiento(d.id);
                }}
                className={`w-full text-left bg-bg border rounded-lg px-4 py-3 text-sm mb-2 ${
                  d.id === diaSugerido?.id
                    ? 'border-accent text-accent'
                    : 'border-bg-subtle'
                }`}
              >
                Día {d.orden} · {d.nombre}
                {d.id === diaSugerido?.id && (
                  <span className="text-[11px] text-accent ml-2">(sugerido)</span>
                )}
              </button>
            ))}
            <button
              onClick={() => setSelectorDiaAbierto(false)}
              className="w-full text-fg-muted py-3 text-sm mt-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </Pantalla>
  );
}
