/**
 * Pantalla de Inicio de Entrenamiento.
 *
 * Cuando el usuario toca "Empezar entrenamiento" desde el Home, llega acá:
 *  - Lista los ejercicios del día que toca
 *  - Permite entrar a cada uno tocándolo
 *  - Permite "Terminar entreno" cuando ya hizo al menos un ejercicio
 *
 * El "estado de progreso" del entreno se calcula en vivo:
 *  - Un ejercicio queda marcado como "completado" si tiene al menos 1 serie
 *    registrada para esa sesión.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pantalla } from '@/components/Pantalla';
import { Header } from '@/components/Header';
import { db } from '@/db/schema';
import { iniciarSesion, terminarSesion, obtenerSeriesDeSesion } from '@/db/repositorios/sesionRepo';
import {
  obtenerDiasDeRutina,
  obtenerEjerciciosDeDia,
  obtenerRutinaActiva,
} from '@/db/repositorios/rutinaRepo';
import { RUTAS } from '@/rutas';
import type {
  DiaRutina,
  EjercicioEnDiaRutina,
  Ejercicio,
  Sesion,
  Serie,
} from '@/types/dominio';

interface EjercicioFila {
  enDia: EjercicioEnDiaRutina;
  ejercicio: Ejercicio;
  seriesHechas: number;
}

export function PaginaEntrenamiento() {
  const navigate = useNavigate();
  const params = useParams<{ diaRutinaId?: string }>();
  const [cargando, setCargando] = useState(true);
  const [terminando, setTerminando] = useState(false);
  const [dia, setDia] = useState<DiaRutina | null>(null);
  const [filas, setFilas] = useState<EjercicioFila[]>([]);
  const [sesion, setSesion] = useState<Sesion | null>(null);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuando volvemos a esta pantalla desde un ejercicio, recargamos los conteos
  useEffect(() => {
    const onFocus = () => {
      if (sesion) cargarConteos(sesion);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion]);

  const cargar = async () => {
    setCargando(true);
    try {
      const rutina = await obtenerRutinaActiva();
      if (!rutina) {
        navigate(RUTAS.home, { replace: true });
        return;
      }

      // Buscar el día a entrenar
      const dias = await obtenerDiasDeRutina(rutina.id);
      let diaElegido: DiaRutina | undefined;

      if (params.diaRutinaId) {
        diaElegido = dias.find((d) => d.id === params.diaRutinaId);
      }
      if (!diaElegido) {
        // Si no se pasó día explícito, usar el sugerido (el de menor orden por default,
        // pero el Home siempre debería pasarlo)
        diaElegido = dias[0];
      }

      if (!diaElegido) {
        navigate(RUTAS.home, { replace: true });
        return;
      }

      setDia(diaElegido);

      // Buscar si ya hay una sesión "en curso" para este día (no terminada y de hoy)
      const hoy = Date.now();
      const haceMenosDe12h = (s: Sesion) =>
        !s.completada &&
        s.diaRutinaId === diaElegido!.id &&
        hoy - s.fechaInicio < 12 * 60 * 60 * 1000;

      const sesionesPrevias = await db.sesiones
        .filter(haceMenosDe12h)
        .toArray();

      let sesionActual: Sesion;
      if (sesionesPrevias.length > 0) {
        // Continuamos la más reciente
        sesionesPrevias.sort((a, b) => b.fechaInicio - a.fechaInicio);
        sesionActual = sesionesPrevias[0];
      } else {
        sesionActual = await iniciarSesion(diaElegido.id);
      }
      setSesion(sesionActual);

      // Cargar ejercicios + conteo de series por ejercicio
      const ejs = await obtenerEjerciciosDeDia(diaElegido.id);
      const series = await obtenerSeriesDeSesion(sesionActual.id);

      const filasArm: EjercicioFila[] = [];
      for (const e of ejs) {
        const ejObj = await db.ejercicios.get(e.ejercicioId);
        if (!ejObj) continue;
        const cuantas = series.filter((s) => s.ejercicioId === e.ejercicioId).length;
        filasArm.push({ enDia: e, ejercicio: ejObj, seriesHechas: cuantas });
      }
      setFilas(filasArm);
    } finally {
      setCargando(false);
    }
  };

  const cargarConteos = async (s: Sesion) => {
    const series = await obtenerSeriesDeSesion(s.id);
    setFilas((prev) =>
      prev.map((f) => ({
        ...f,
        seriesHechas: series.filter((sr: Serie) => sr.ejercicioId === f.ejercicio.id).length,
      }))
    );
  };

  const abrirEjercicio = (fila: EjercicioFila) => {
    if (!sesion) return;
    navigate(
      `${RUTAS.entrenamiento}/${dia!.id}/ejercicio/${fila.enDia.id}?sesion=${sesion.id}`
    );
  };

  const terminarEntreno = async () => {
    if (!sesion || terminando) return;
    setTerminando(true);
    try {
      await terminarSesion(sesion.id);
      navigate(`${RUTAS.resumenEntreno}?sesion=${sesion.id}`, { replace: true });
    } catch (e) {
      console.error(e);
      setTerminando(false);
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

  if (!dia) return null;

  const ejerciciosCompletados = filas.filter((f) => f.seriesHechas > 0).length;
  const algunoCompletado = ejerciciosCompletados > 0;

  return (
    <Pantalla>
      <Header titulo={`Día ${dia.orden}`} atras={RUTAS.home} />

      <div className="px-4 pt-5 pb-32 flex-1">
        <p className="text-fg-muted text-xs mb-1.5">
          Tocá un ejercicio para entrenarlo
        </p>
        <h1 className="text-2xl font-medium tracking-tight mb-1">
          {dia.nombre}
        </h1>
        <p className="text-fg-subtle text-xs mb-6">
          {ejerciciosCompletados} de {filas.length} ejercicios completados
        </p>

        {filas.map((fila) => {
          const hecho = fila.seriesHechas > 0;
          return (
            <button
              key={fila.enDia.id}
              onClick={() => abrirEjercicio(fila)}
              className={`w-full text-left mb-2 px-4 py-3.5 rounded-xl border transition-colors ${
                hecho
                  ? 'bg-accent/10 border-accent/40'
                  : 'bg-bg-elevated border-bg-subtle hover:border-fg-subtle'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${hecho ? 'text-accent' : 'text-fg'}`}>
                    {fila.ejercicio.nombre}
                  </p>
                  <p className="text-xs text-fg-muted mt-0.5">
                    {hecho
                      ? `${fila.seriesHechas} ${
                          fila.seriesHechas === 1 ? 'serie hecha' : 'series hechas'
                        }`
                      : `${fila.enDia.seriesPrescriptas} × ${fila.enDia.repsPrescriptas}`}
                  </p>
                </div>
                <div className="ml-3 text-fg-subtle">
                  {hecho ? (
                    <span className="text-accent text-xl">✓</span>
                  ) : (
                    <span>›</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div
        className="sticky bottom-0 left-0 right-0 px-4 py-3 bg-bg border-t border-bg-subtle"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 12px)' }}
      >
        <button
          onClick={terminarEntreno}
          disabled={!algunoCompletado || terminando}
          className={`w-full py-4 rounded-xl text-base font-medium ${
            algunoCompletado
              ? 'bg-accent text-emerald-950'
              : 'bg-bg-elevated text-fg-subtle border border-bg-subtle cursor-not-allowed'
          }`}
        >
          {terminando
            ? 'Guardando...'
            : algunoCompletado
            ? 'Terminar entreno'
            : 'Empezá con un ejercicio'}
        </button>
      </div>
    </Pantalla>
  );
}
