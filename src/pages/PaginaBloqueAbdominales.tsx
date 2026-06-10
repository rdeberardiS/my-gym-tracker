/**
 * Pantalla del Bloque de Abdominales (core).
 *
 * Agrupa los ejercicios de core del día (crunch bicicleta, toques de talón,
 * crunch invertido, etc.) en una sola pantalla. Ninguno lleva peso: se
 * registran tocando cada serie. Es el "un solo bloque con los 3 ejercicios".
 *
 * Cada serie registrada se guarda con peso 0 (en Progreso figura sin kg).
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Pantalla } from '@/components/Pantalla';
import { Header } from '@/components/Header';
import { db } from '@/db/schema';
import {
  obtenerSeriesDeSesion,
  registrarSerie,
} from '@/db/repositorios/sesionRepo';
import { obtenerEjerciciosDeDia } from '@/db/repositorios/rutinaRepo';
import { esEjercicioSinPeso } from '@/services/catalogo/catalogoVideos';
import { RUTAS } from '@/rutas';
import type { Ejercicio, EjercicioEnDiaRutina } from '@/types/dominio';

interface SerieEnPantalla {
  numero: number;
  reps: number;
  marcada: boolean;
  serieGuardadaId?: string;
}

interface EjercicioCore {
  enDia: EjercicioEnDiaRutina;
  ejercicio: Ejercicio;
  series: SerieEnPantalla[];
}

/** Convierte "8-10" -> 10, "8" -> 8, "20" -> 20, "AMRAP" -> 0 */
function parsearRepsObjetivo(reps: string): number {
  const limpio = reps.trim();
  const rango = limpio.match(/^(\d+)\s*-\s*(\d+)$/);
  if (rango) return parseInt(rango[2], 10);
  const csv = limpio.match(/^(\d+)/);
  if (csv) return parseInt(csv[1], 10);
  return 0;
}

export function PaginaBloqueAbdominales() {
  const navigate = useNavigate();
  const params = useParams<{ diaRutinaId: string }>();
  const [search] = useSearchParams();
  const sesionId = search.get('sesion');

  const [cargando, setCargando] = useState(true);
  const [ejercicios, setEjercicios] = useState<EjercicioCore[]>([]);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      if (!params.diaRutinaId || !sesionId) {
        navigate(RUTAS.home);
        return;
      }

      const todosLosDelDia = await obtenerEjerciciosDeDia(params.diaRutinaId);
      const seriesSesion = await obtenerSeriesDeSesion(sesionId);

      const armados: EjercicioCore[] = [];
      for (const enDia of todosLosDelDia) {
        const ej = await db.ejercicios.get(enDia.ejercicioId);
        if (!ej) continue;
        if (!esEjercicioSinPeso(ej.nombre)) continue; // solo core

        const reps = parsearRepsObjetivo(enDia.repsPrescriptas);
        const yaRegistradas = seriesSesion
          .filter((s) => s.ejercicioId === ej.id)
          .sort((a, b) => a.numeroSerie - b.numeroSerie);

        const series: SerieEnPantalla[] = [];
        for (let i = 1; i <= enDia.seriesPrescriptas; i++) {
          const guardada = yaRegistradas.find((s) => s.numeroSerie === i);
          series.push({
            numero: i,
            reps: guardada?.reps ?? reps,
            marcada: !!guardada,
            serieGuardadaId: guardada?.id,
          });
        }

        armados.push({ enDia, ejercicio: ej, series });
      }

      setEjercicios(armados);
    } finally {
      setCargando(false);
    }
  };

  const alternarSerie = async (ejIdx: number, serieIdx: number) => {
    if (!sesionId) return;
    const grupo = ejercicios[ejIdx];
    const s = grupo.series[serieIdx];

    if (s.marcada) {
      // Desmarcar: borrar la serie guardada
      if (s.serieGuardadaId) {
        await db.series.delete(s.serieGuardadaId);
      }
      setEjercicios((prev) =>
        prev.map((g, gi) =>
          gi !== ejIdx
            ? g
            : {
                ...g,
                series: g.series.map((sp, si) =>
                  si === serieIdx
                    ? { ...sp, marcada: false, serieGuardadaId: undefined }
                    : sp
                ),
              }
        )
      );
    } else {
      // Marcar: registrar con peso 0
      const repsAGuardar = s.reps > 0 ? s.reps : 12;
      const guardada = await registrarSerie({
        sesionId,
        ejercicioId: grupo.ejercicio.id,
        numeroSerie: s.numero,
        peso: 0,
        reps: repsAGuardar,
      });
      setEjercicios((prev) =>
        prev.map((g, gi) =>
          gi !== ejIdx
            ? g
            : {
                ...g,
                series: g.series.map((sp, si) =>
                  si === serieIdx
                    ? {
                        ...sp,
                        marcada: true,
                        reps: repsAGuardar,
                        serieGuardadaId: guardada.id,
                      }
                    : sp
                ),
              }
        )
      );
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

  return (
    <Pantalla>
      <Header titulo="Abdominales" />

      <div className="px-4 pt-4 pb-32 flex-1">
        <div className="bg-bg-elevated border border-bg-subtle rounded-xl p-3.5 mb-5">
          <p className="text-fg-muted text-xs leading-relaxed">
            🧘 Bloque de core · sin peso. Tocá cada serie a medida que la vas
            haciendo.
          </p>
        </div>

        {ejercicios.map((grupo, ejIdx) => (
          <div key={grupo.enDia.id} className="mb-6">
            <p className="text-sm font-medium mb-2">
              {grupo.ejercicio.nombre}
              <span className="text-fg-muted text-xs font-normal">
                {' '}
                · {grupo.series[0]?.reps ?? ''} reps
              </span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {grupo.series.map((s, serieIdx) => (
                <button
                  key={serieIdx}
                  onClick={() => alternarSerie(ejIdx, serieIdx)}
                  className={`rounded-xl border py-3 text-center transition-colors select-none active:scale-[0.98] ${
                    s.marcada
                      ? 'bg-accent/15 border-accent'
                      : 'bg-bg-elevated border-bg-subtle'
                  }`}
                >
                  <span className="block text-[11px] uppercase tracking-wider text-fg-muted mb-1">
                    Serie {s.numero}
                  </span>
                  <span
                    className={`text-lg leading-none ${
                      s.marcada ? 'text-accent' : 'text-fg-subtle'
                    }`}
                  >
                    {s.marcada ? '✓' : '○'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {ejercicios.length === 0 && (
          <p className="text-fg-muted text-sm text-center py-8">
            Este día no tiene ejercicios de core.
          </p>
        )}
      </div>

      <div
        className="sticky bottom-0 left-0 right-0 px-4 py-3 bg-bg border-t border-bg-subtle"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 12px)' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-full py-4 rounded-xl text-base font-medium bg-accent text-accent-ink"
        >
          Listo · volver al día
        </button>
      </div>
    </Pantalla>
  );
}
