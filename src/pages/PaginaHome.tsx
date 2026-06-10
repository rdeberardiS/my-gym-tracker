/**
 * Pantalla Home.
 *
 * Estados:
 *  - Sin rutina activa: pantalla de bienvenida con CTA "Pegar mi rutina"
 *  - Con rutina activa: anillo de progreso semanal + mensaje vivo + día sugerido + alertas
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
import {
  calcularEstadoSemanal,
  inicioSemana,
  finSemana,
} from '@/db/queries/objetivoSemanal';
import { listarSesionesValidasEnVentana } from '@/db/repositorios/sesionRepo';
import { db } from '@/db/schema';
import type { Rutina, DiaRutina, EstadoSemanal } from '@/types/dominio';
import { RUTAS } from '@/rutas';

/** Anillo de progreso semanal (reemplaza los puntitos ●●○). */
function AnilloProgreso({
  completados,
  objetivo,
}: {
  completados: number;
  objetivo: number;
}) {
  const r = 68;
  const circ = 2 * Math.PI * r;
  const frac = objetivo > 0 ? Math.min(completados / objetivo, 1) : 0;
  const offset = circ * (1 - frac);
  return (
    <div className="relative w-[168px] h-[168px] mx-auto">
      <svg
        width="168"
        height="168"
        viewBox="0 0 168 168"
        className="-rotate-90"
      >
        <circle cx="84" cy="84" r={r} fill="none" stroke="#2c2c2c" strokeWidth="15" />
        <circle
          cx="84"
          cy="84"
          r={r}
          fill="none"
          stroke="#c2f000"
          strokeWidth="15"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 700ms ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-black text-[46px] leading-none tracking-tight text-white">
          {completados}/{objetivo}
        </span>
        <span className="text-[#9a9a9a] text-[10.5px] uppercase tracking-[0.12em] font-bold mt-1">
          esta semana
        </span>
      </div>
    </div>
  );
}

/** Mensaje vivo según cómo viene la semana. */
function mensajeSemanal(e: EstadoSemanal): string {
  const faltan = e.objetivo - e.entrenosCompletados;
  if (e.cumplido) return '¡Semana completa! 🔥';
  if (!e.posibleCumplir) return 'Cerrá la semana con todo 💪';
  if (e.entrenosCompletados === 0) return '¡Arrancá tu semana!';
  if (faltan === 1) return '¡Una más y la rompés!';
  return `¡Te faltan ${faltan} para tu objetivo!`;
}

export function PaginaHome() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [rutina, setRutina] = useState<Rutina | null>(null);
  const [diaSugerido, setDiaSugerido] = useState<DiaRutina | null>(null);
  const [todosLosDias, setTodosLosDias] = useState<DiaRutina[]>([]);
  const [estadoSemanal, setEstadoSemanal] = useState<EstadoSemanal | null>(null);
  const [diasEntrenadosSemana, setDiasEntrenadosSemana] = useState<Set<number>>(
    new Set()
  );
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [selectorDiaAbierto, setSelectorDiaAbierto] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

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
        const [dia, dias, semanal, sesionesSemana] = await Promise.all([
          obtenerDiaSugerido(),
          obtenerDiasDeRutina(r.id),
          calcularEstadoSemanal(),
          listarSesionesValidasEnVentana(inicioSemana(), finSemana()),
        ]);
        setDiaSugerido(dia);
        setTodosLosDias(dias);
        setEstadoSemanal(semanal);

        const entrenados = new Set<number>();
        for (const s of sesionesSemana) {
          const d = await db.diasRutina.get(s.diaRutinaId);
          if (d) entrenados.add(d.orden);
        }
        setDiasEntrenadosSemana(entrenados);
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
          <h1 className="font-display text-3xl font-black tracking-tight mb-2">
            EMPECEMOS
          </h1>
          <p className="text-fg-muted text-sm mb-10 leading-relaxed">
            Pegá la rutina que te pasó tu coach.
            <br />
            La interpretamos automáticamente.
          </p>
          <button
            onClick={() => navigate(RUTAS.importar)}
            className="w-full max-w-sm bg-accent text-accent-ink py-4 rounded-2xl text-base font-black uppercase tracking-wide"
          >
            Pegar mi rutina
          </button>
        </div>
        <BottomBar />
      </Pantalla>
    );
  }

  // Estado 2: Con rutina activa
  const alertaAmarilla =
    estadoSemanal &&
    !estadoSemanal.cumplido &&
    estadoSemanal.posibleCumplir &&
    estadoSemanal.entrenosCompletados < estadoSemanal.objetivo &&
    estadoSemanal.diasRestantes <=
      estadoSemanal.objetivo - estadoSemanal.entrenosCompletados + 1;

  const alertaRoja =
    estadoSemanal && !estadoSemanal.cumplido && !estadoSemanal.posibleCumplir;

  return (
    <Pantalla>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <span className="font-display font-black text-xl tracking-tight">
          GYM TRACKER
        </span>
        <button
          onClick={() => setMenuAbierto(true)}
          className="w-9 h-9 rounded-full bg-fucsia text-white flex items-center justify-center text-lg"
          aria-label="Menú"
        >
          ⋯
        </button>
      </div>

      <div className="px-5 pb-6 flex-1 overflow-y-auto">
        {/* Anillo + mensaje vivo */}
        {estadoSemanal && (
          <div className="bg-fg rounded-3xl p-6 mb-4 text-center shadow-sm">
            <AnilloProgreso
              completados={estadoSemanal.entrenosCompletados}
              objetivo={estadoSemanal.objetivo}
            />
            <p className="font-display font-extrabold text-fucsia text-base mt-3">
              {mensajeSemanal(estadoSemanal)}
            </p>
          </div>
        )}

        {/* Alerta roja */}
        {alertaRoja && (
          <div className="bg-danger-muted border border-danger/40 rounded-2xl p-3.5 mb-4 flex gap-3 items-start">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e23b6d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <p className="text-danger-ink text-sm font-bold mb-0.5">
                No vas a llegar esta semana
              </p>
              <p className="text-danger-ink/80 text-xs leading-relaxed">
                Te faltan {estadoSemanal!.objetivo - estadoSemanal!.entrenosCompletados}{' '}
                entrenos. Cerrá la semana con lo que puedas, el lunes empezás de nuevo.
              </p>
            </div>
          </div>
        )}

        {/* Alerta amarilla */}
        {alertaAmarilla && (
          <div className="bg-warn-muted border border-warn/50 rounded-2xl p-3.5 mb-4 flex gap-3 items-start">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6a100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <p className="text-warn-ink text-sm font-bold mb-0.5">Apretá el paso</p>
              <p className="text-warn-ink/80 text-xs leading-relaxed">
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

        {/* Tarjeta del día sugerido */}
        <div className="bg-bg-elevated rounded-3xl p-5 shadow-sm">
          {diaSugerido ? (
            <>
              <span className="inline-block bg-fucsia text-white text-[10.5px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg mb-2.5">
                Día {diaSugerido.orden}
              </span>
              <h1 className="font-display text-2xl font-black tracking-tight leading-tight mb-2">
                {diaSugerido.nombre}
              </h1>
              <div className="w-11 h-[5px] rounded bg-fucsia mb-4" />
            </>
          ) : (
            <p className="text-fg-muted text-sm mb-4">
              Tu rutina está cargada. Empezá cuando quieras.
            </p>
          )}

          <button
            onClick={() => empezarEntrenamiento()}
            className="w-full bg-accent text-accent-ink py-4 rounded-2xl text-base font-black uppercase tracking-wide"
          >
            Empezar entrenamiento
          </button>

          {todosLosDias.length > 1 && (
            <button
              onClick={() => setSelectorDiaAbierto(true)}
              className="w-full text-fg-muted py-2.5 text-xs font-semibold mt-1"
            >
              Quiero hacer otro día
            </button>
          )}
        </div>

        {/* Lista de días de la semana */}
        {todosLosDias.length > 0 && (
          <>
            <p className="text-fg-subtle text-[11px] uppercase tracking-wider font-bold mt-7 mb-3">
              Esta semana
            </p>
            {todosLosDias.map((d) => {
              const hecho = diasEntrenadosSemana.has(d.orden);
              return (
                <div
                  key={d.id}
                  className={`rounded-2xl px-4 py-3.5 mb-2 flex items-center justify-between ${
                    'bg-bg-elevated'
                  } shadow-sm`}
                >
                  <p className={`text-sm font-semibold ${hecho ? 'text-fg' : 'text-fg-muted'}`}>
                    Día {d.orden}
                    <span className="text-fg-muted font-normal"> · {d.nombre}</span>
                  </p>
                  {hecho ? (
                    <span className="text-fucsia text-sm font-extrabold flex items-center gap-1">✓</span>
                  ) : (
                    <span className="text-fg-subtle text-xs">Te falta</span>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      <BottomBar />

      {/* Menú principal */}
      {menuAbierto && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end z-50"
          onClick={() => setMenuAbierto(false)}
        >
          <div
            className="w-full bg-bg-elevated rounded-t-3xl p-5"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 20px)' }}
          >
            <p className="text-fg-subtle text-[11px] uppercase tracking-wider font-bold mb-3">
              Mi rutina
            </p>
            <button
              onClick={() => {
                setMenuAbierto(false);
                navigate(RUTAS.importar);
              }}
              className="w-full text-left bg-bg rounded-2xl px-4 py-3.5 text-sm font-semibold mb-2 flex items-center gap-2"
            >
              📥 Importar nueva rutina
            </button>
            <button
              onClick={() => setMenuAbierto(false)}
              className="w-full text-fg-muted py-3 text-sm font-semibold mt-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Selector "Quiero hacer otro día" */}
      {selectorDiaAbierto && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end z-50"
          onClick={() => setSelectorDiaAbierto(false)}
        >
          <div
            className="w-full bg-bg-elevated rounded-t-3xl p-5"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 20px)' }}
          >
            <p className="text-fg-subtle text-[11px] uppercase tracking-wider font-bold mb-3">
              Elegí qué día querés entrenar
            </p>
            {todosLosDias.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setSelectorDiaAbierto(false);
                  empezarEntrenamiento(d.id);
                }}
                className={`w-full text-left bg-bg rounded-2xl px-4 py-3.5 text-sm font-semibold mb-2 ${
                  d.id === diaSugerido?.id ? 'border-2 border-fucsia text-fucsia' : ''
                }`}
              >
                Día {d.orden} · {d.nombre}
                {d.id === diaSugerido?.id && (
                  <span className="text-[11px] text-fucsia ml-2">(sugerido)</span>
                )}
              </button>
            ))}
            <button
              onClick={() => setSelectorDiaAbierto(false)}
              className="w-full text-fg-muted py-3 text-sm font-semibold mt-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </Pantalla>
  );
}
