/**
 * Pantalla Home.
 *
 * Tiene dos estados:
 *  - Sin rutina activa: muestra mensaje de bienvenida + CTA "Pegar mi rutina"
 *  - Con rutina activa: muestra el día sugerido + CTA "Empezar entrenamiento"
 *
 * En esta primera entrega, el camino "con rutina" muestra el día sugerido
 * pero el botón de entrenar todavía no funciona (esa pantalla viene en la
 * Parte 2 de la entrega).
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
import type { Rutina, DiaRutina, EstadoSemanal, Sesion } from '@/types/dominio';
import { RUTAS } from '@/rutas';

export function PaginaHome() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [rutina, setRutina] = useState<Rutina | null>(null);
  const [diaSugerido, setDiaSugerido] = useState<DiaRutina | null>(null);
  const [totalDias, setTotalDias] = useState(0);
  const [estadoSemanal, setEstadoSemanal] = useState<EstadoSemanal | null>(null);
  const [ultimasSesiones, setUltimasSesiones] = useState<Sesion[]>([]);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
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
        setTotalDias(dias.length);
        setEstadoSemanal(semanal);
        setUltimasSesiones(sesiones);
      }
    } finally {
      setCargando(false);
    }
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
          <h1 className="text-2xl font-medium tracking-tight mb-2">
            Empecemos
          </h1>
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

  // Estado 2: Con rutina
  const fecha = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const fechaCapitalizada = fecha.charAt(0).toUpperCase() + fecha.slice(1);

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
            <p className="text-fg-subtle text-xs mb-5">
              {totalDias > 0 && `Rutina de ${totalDias} días`}
            </p>
          </>
        ) : (
          <p className="text-fg-muted text-sm mb-5">
            Tu rutina está cargada. Empezá cuando quieras.
          </p>
        )}

        <button
          onClick={() => {
            // En esta entrega todavía no implementamos la pantalla de entrenamiento.
            // La conectamos en la Parte 2.
            alert(
              'La pantalla de entrenamiento se programa en la siguiente entrega.'
            );
          }}
          className="w-full bg-accent text-emerald-950 py-4 rounded-xl text-base font-medium mb-3"
        >
          Empezar entrenamiento →
        </button>

        {ultimasSesiones.length > 0 && (
          <>
            <p className="text-fg-subtle text-[11px] uppercase tracking-wider mt-7 mb-3">
              Últimos entrenos
            </p>
            {ultimasSesiones.map((s) => (
              <div
                key={s.id}
                className="bg-bg-elevated border border-bg-subtle rounded-lg px-3.5 py-3 mb-2 flex items-center justify-between"
              >
                <p className="text-fg text-sm">
                  {new Date(s.fechaFin ?? s.fechaInicio).toLocaleDateString(
                    'es-AR',
                    { day: 'numeric', month: 'short' }
                  )}
                </p>
                <span className="text-accent">✓</span>
              </div>
            ))}
          </>
        )}
      </div>

      <BottomBar />

      {menuAbierto && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end z-50"
          onClick={() => setMenuAbierto(false)}
        >
          <div
            className="w-full bg-bg-elevated border-t border-bg-subtle rounded-t-2xl p-5"
            onClick={(e) => e.stopPropagation()}
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
    </Pantalla>
  );
}
