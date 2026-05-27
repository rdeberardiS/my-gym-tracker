/**
 * Pantalla de Resumen post-entrenamiento.
 *
 * Aparece después de tocar "Terminar entreno".
 *
 * Tiene 3 estados según el avance semanal:
 *  1. Vas avanzando (ej: 1/3) -> mensaje neutro motivador
 *  2. Cumpliste (3/3) -> ¡Felicitaciones! con trofeo
 *  3. Sábado/Domingo + no llegás -> alerta roja "No vas a llegar"
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Pantalla } from '@/components/Pantalla';
import { calcularEstadoSemanal } from '@/db/queries/objetivoSemanal';
import { db } from '@/db/schema';
import { RUTAS } from '@/rutas';
import type { EstadoSemanal } from '@/types/dominio';

export function PaginaResumenEntreno() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const sesionId = search.get('sesion');
  const [estado, setEstado] = useState<EstadoSemanal | null>(null);
  const [duracionMin, setDuracionMin] = useState<number>(0);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargar = async () => {
    const e = await calcularEstadoSemanal();
    setEstado(e);

    if (sesionId) {
      const s = await db.sesiones.get(sesionId);
      if (s && s.fechaFin) {
        const ms = s.fechaFin - s.fechaInicio;
        setDuracionMin(Math.max(1, Math.round(ms / 60000)));
      }
    }
  };

  if (!estado) {
    return (
      <Pantalla>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-fg-subtle text-sm">Cargando...</p>
        </div>
      </Pantalla>
    );
  }

  const completado = estado.cumplido;
  const noLlega = !completado && !estado.posibleCumplir;

  return (
    <Pantalla>
      <div className="flex-1 px-6 pt-14 pb-8 flex flex-col">
        {/* Ícono central */}
        <div className="text-center mb-6">
          <div
            className={`w-20 h-20 rounded-full inline-flex items-center justify-center ${
              completado ? 'bg-emerald-950' : 'bg-emerald-950'
            }`}
          >
            {completado ? (
              <svg width="42" height="42" viewBox="0 0 24 24" fill="#fbbf24">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v3H5v-3z"/>
              </svg>
            ) : (
              <svg
                width="42"
                height="42"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </div>
        </div>

        <h1 className="text-3xl font-medium tracking-tight text-center mb-2">
          {completado ? '¡Felicitaciones!' : '¡Buen trabajo!'}
        </h1>
        <p className="text-fg-muted text-sm text-center mb-8">
          {completado
            ? 'Completaste tu semana'
            : `${duracionMin} min · Entrenamiento completado`}
        </p>

        {/* Bloque principal: avance semanal */}
        <div
          className={`rounded-2xl p-5 mb-4 text-center border ${
            completado
              ? 'bg-emerald-950/40 border-accent'
              : 'bg-bg-elevated border-bg-subtle'
          }`}
        >
          <p
            className={`text-[11px] uppercase tracking-wider mb-3 ${
              completado ? 'text-emerald-200' : 'text-fg-subtle'
            }`}
          >
            Esta semana
          </p>
          <p className="text-4xl font-medium mb-3">
            {estado.entrenosCompletados}{' '}
            <span className={completado ? 'text-emerald-200 text-xl' : 'text-fg-subtle text-xl'}>
              / {estado.objetivo}
            </span>
          </p>
          <div className="flex gap-2 justify-center">
            {Array.from({ length: estado.objetivo }).map((_, i) => (
              <span
                key={i}
                className={`w-4 h-4 rounded-full inline-block ${
                  i < estado.entrenosCompletados
                    ? 'bg-accent'
                    : 'border-2 border-fg-subtle'
                }`}
              />
            ))}
          </div>
          {!completado && (
            <p className="text-fg-muted text-xs mt-4">
              Te {estado.objetivo - estado.entrenosCompletados === 1 ? 'queda' : 'quedan'}{' '}
              {estado.objetivo - estado.entrenosCompletados}{' '}
              {estado.objetivo - estado.entrenosCompletados === 1
                ? 'entrenamiento'
                : 'entrenamientos'}{' '}
              esta semana
            </p>
          )}
          {completado && (
            <p className="text-emerald-200 text-xs mt-4">Objetivo cumplido 🔥</p>
          )}
        </div>

        {/* Alerta si no llega */}
        {noLlega && (
          <div className="rounded-2xl p-4 mb-4 bg-red-950/40 border border-red-800 flex items-start gap-3">
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
              <p className="text-red-300 text-sm font-medium mb-1">
                No vas a llegar al objetivo
              </p>
              <p className="text-red-300/80 text-xs leading-relaxed">
                Te quedan {estado.objetivo - estado.entrenosCompletados} entrenos
                para hacer en {estado.diasRestantes}{' '}
                {estado.diasRestantes === 1 ? 'día' : 'días'}. Cerrá la semana
                con lo que puedas y el lunes empezás de nuevo.
              </p>
            </div>
          </div>
        )}

        <div className="flex-1" />

        <button
          onClick={() => navigate(RUTAS.home, { replace: true })}
          className="w-full bg-accent text-emerald-950 py-4 rounded-xl text-base font-medium"
        >
          Volver al inicio
        </button>
      </div>
    </Pantalla>
  );
}
