/**
 * Pantalla del Ejercicio durante el entrenamiento.
 *
 * Esta es la pantalla más usada y crítica. Decisiones de diseño cerradas:
 *  - Peso pre-rellenado con el ÚLTIMO peso usado (la moda de la última sesión)
 *  - Si es la primera vez con el ejercicio: peso vacío (placeholder)
 *  - Grilla de cajitas con peso pre-cargado en todas, vos solo tocás para "marcar"
 *  - Steppers [-2.5] [+2.5] para ajustar peso global
 *  - Botón "Ver técnica" con video embebido arriba (modo A)
 *  - Botón verde "Registrar ejercicio" al final que cierra y vuelve a la lista
 *
 * Una "serie marcada" se considera con peso (el del input) y reps (las prescriptas
 * o lo que el usuario haya escrito).
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Pantalla } from '@/components/Pantalla';
import { Header } from '@/components/Header';
import { ModalCambiarVideo } from '@/components/ModalCambiarVideo';
import { db } from '@/db/schema';
import {
  obtenerSeriesDeSesion,
  registrarSerie,
  calcularUltimaVez,
} from '@/db/repositorios/sesionRepo';
import {
  actualizarVideoEjercicio,
  obtenerEjercicio,
} from '@/db/repositorios/ejercicioRepo';
import { urlEmbed } from '@/services/catalogo/catalogoVideos';
import { RUTAS } from '@/rutas';
import type {
  Ejercicio,
  EjercicioEnDiaRutina,
  ResumenUltimaVez,
} from '@/types/dominio';

interface SerieEnPantalla {
  numero: number;
  peso: number;
  reps: number;
  marcada: boolean; // si ya fue registrada en la DB
  serieGuardadaId?: string;
}

/**
 * Detecta si una prescripción de reps incluye "c/lado" o "c/pierna" o similar.
 * Estos ejercicios se cargan como un solo número, no por lado, pero mostramos aviso.
 */
function detectarPorLado(reps: string, nombre: string): boolean {
  const t = `${reps} ${nombre}`.toLowerCase();
  return /(c\/lado|c\/pierna|c\/brazo|por lado|por pierna|por brazo|cada lado|cada pierna|unilateral)/i.test(
    t
  );
}

/**
 * Convierte "8-10" -> 10, "8" -> 8, "AMRAP" -> 0, "8,8,7,6" -> 8 (primer valor)
 */
function parsearRepsObjetivo(reps: string): number {
  const limpio = reps.trim();
  // "8-10" -> tomar el máximo
  const rango = limpio.match(/^(\d+)\s*-\s*(\d+)$/);
  if (rango) return parseInt(rango[2], 10);
  // "8,8,7,6" -> primer número
  const csv = limpio.match(/^(\d+)/);
  if (csv) return parseInt(csv[1], 10);
  return 0;
}

export function PaginaEjercicio() {
  const navigate = useNavigate();
  const params = useParams<{ diaRutinaId: string; ejercicioEnDiaId: string }>();
  const [search] = useSearchParams();
  const sesionId = search.get('sesion');

  const [cargando, setCargando] = useState(true);
  const [ejercicio, setEjercicio] = useState<Ejercicio | null>(null);
  const [prescripcion, setPrescripcion] = useState<EjercicioEnDiaRutina | null>(null);
  const [ultimaVez, setUltimaVez] = useState<ResumenUltimaVez | null>(null);
  const [seriesEnPantalla, setSeriesEnPantalla] = useState<SerieEnPantalla[]>([]);
  const [pesoGlobal, setPesoGlobal] = useState<number>(0);
  const [pesoCustomIndices, setPesoCustomIndices] = useState<Set<number>>(new Set());
  const [mostrarVideo, setMostrarVideo] = useState(false);
  const [modalVideoAbierto, setModalVideoAbierto] = useState(false);
  const [editandoSerie, setEditandoSerie] = useState<number | null>(null);
  const [valoresEdicion, setValoresEdicion] = useState<{ peso: string; reps: string }>({
    peso: '',
    reps: '',
  });

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      if (!params.ejercicioEnDiaId || !sesionId) {
        navigate(RUTAS.home);
        return;
      }

      // Buscar prescripción
      const presc = await db.ejerciciosEnDiaRutina.get(params.ejercicioEnDiaId);
      if (!presc) {
        navigate(-1);
        return;
      }
      setPrescripcion(presc);

      // Buscar ejercicio
      const ej = await obtenerEjercicio(presc.ejercicioId);
      if (!ej) {
        navigate(-1);
        return;
      }
      setEjercicio(ej);

      // Calcular última vez
      const ultima = await calcularUltimaVez(ej.id);
      setUltimaVez(ultima);

      // Cargar series ya registradas de esta sesión
      const seriesSesion = await obtenerSeriesDeSesion(sesionId);
      const seriesEsteEjercicio = seriesSesion
        .filter((s) => s.ejercicioId === ej.id)
        .sort((a, b) => a.numeroSerie - b.numeroSerie);

      // Peso inicial: si ya hay series registradas hoy, usar el de la primera.
      // Si no, usar el de la última vez. Si nunca entrenó, default 10.
      const pesoInicial = seriesEsteEjercicio[0]?.peso ?? ultima.pesoPreRellenado ?? 10;
      setPesoGlobal(pesoInicial);

      const repsObjetivo = parsearRepsObjetivo(presc.repsPrescriptas);

      // Armar las series en pantalla
      const en: SerieEnPantalla[] = [];
      for (let i = 1; i <= presc.seriesPrescriptas; i++) {
        const yaGuardada = seriesEsteEjercicio.find((s) => s.numeroSerie === i);
        if (yaGuardada) {
          en.push({
            numero: i,
            peso: yaGuardada.peso,
            reps: yaGuardada.reps,
            marcada: true,
            serieGuardadaId: yaGuardada.id,
          });
        } else {
          en.push({
            numero: i,
            peso: pesoInicial,
            reps: repsObjetivo,
            marcada: false,
          });
        }
      }
      setSeriesEnPantalla(en);
    } finally {
      setCargando(false);
    }
  };

  // Cuando cambia el peso global, propagamos a todas las series no marcadas y sin peso custom
  const ajustarPesoGlobal = (delta: number) => {
    const nuevo = Math.max(0, +(pesoGlobal + delta).toFixed(2));
    setPesoGlobal(nuevo);
    setSeriesEnPantalla((prev) =>
      prev.map((s, i) => {
        if (s.marcada) return s;
        if (pesoCustomIndices.has(i)) return s;
        return { ...s, peso: nuevo };
      })
    );
  };

  const marcarSerie = async (idx: number) => {
    if (!ejercicio || !sesionId || !prescripcion) return;
    const s = seriesEnPantalla[idx];
    if (s.marcada) return;

    // Si reps es 0 (AMRAP), pedimos que edite primero
    const repsAGuardar = s.reps > 0 ? s.reps : parsearRepsObjetivo(prescripcion.repsPrescriptas) || 8;

    const serieGuardada = await registrarSerie({
      sesionId,
      ejercicioId: ejercicio.id,
      numeroSerie: s.numero,
      peso: s.peso,
      reps: repsAGuardar,
    });

    setSeriesEnPantalla((prev) =>
      prev.map((sp, i) =>
        i === idx
          ? {
              ...sp,
              marcada: true,
              reps: repsAGuardar,
              serieGuardadaId: serieGuardada.id,
            }
          : sp
      )
    );
  };

  const desmarcarSerie = async (idx: number) => {
    const s = seriesEnPantalla[idx];
    if (!s.marcada || !s.serieGuardadaId) return;
    await db.series.delete(s.serieGuardadaId);
    setSeriesEnPantalla((prev) =>
      prev.map((sp, i) =>
        i === idx ? { ...sp, marcada: false, serieGuardadaId: undefined } : sp
      )
    );
  };

  const abrirEdicion = (idx: number) => {
    const s = seriesEnPantalla[idx];
    setEditandoSerie(idx);
    setValoresEdicion({ peso: String(s.peso), reps: String(s.reps) });
  };

  const guardarEdicion = async () => {
    if (editandoSerie === null || !ejercicio || !sesionId) return;
    const nuevoPeso = parseFloat(valoresEdicion.peso.replace(',', '.'));
    const nuevoReps = parseInt(valoresEdicion.reps, 10);
    if (isNaN(nuevoPeso) || isNaN(nuevoReps) || nuevoPeso < 0 || nuevoReps < 0) {
      setEditandoSerie(null);
      return;
    }

    const s = seriesEnPantalla[editandoSerie];

    // Si ya estaba marcada, hay que actualizar la serie en DB
    if (s.marcada && s.serieGuardadaId) {
      await db.series.update(s.serieGuardadaId, {
        peso: nuevoPeso,
        reps: nuevoReps,
      });
    }

    setPesoCustomIndices((prev) => new Set([...prev, editandoSerie]));
    setSeriesEnPantalla((prev) =>
      prev.map((sp, i) =>
        i === editandoSerie ? { ...sp, peso: nuevoPeso, reps: nuevoReps } : sp
      )
    );
    setEditandoSerie(null);
  };

  const cambiarVideo = async (nuevoUrl: string | null) => {
    if (!ejercicio) return;
    await actualizarVideoEjercicio(ejercicio.id, nuevoUrl);
    setEjercicio({ ...ejercicio, videoUrl: nuevoUrl ?? undefined });
  };

  const todasMarcadas = useMemo(
    () => seriesEnPantalla.length > 0 && seriesEnPantalla.every((s) => s.marcada),
    [seriesEnPantalla]
  );

  const porLado = useMemo(
    () =>
      prescripcion && ejercicio
        ? detectarPorLado(prescripcion.repsPrescriptas, ejercicio.nombre)
        : false,
    [prescripcion, ejercicio]
  );

  if (cargando) {
    return (
      <Pantalla>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-fg-subtle text-sm">Cargando...</p>
        </div>
      </Pantalla>
    );
  }

  if (!ejercicio || !prescripcion) return null;

  const videoEmbed = ejercicio.videoUrl ? urlEmbed(ejercicio.videoUrl) : null;

  return (
    <Pantalla>
      <Header titulo="Ejercicio" />

      <div className="px-4 pt-3 pb-32 flex-1">
        {/* Botón Video */}
        {ejercicio.videoUrl && videoEmbed && (
          <>
            <button
              onClick={() => setMostrarVideo((v) => !v)}
              className="w-full mb-3 px-4 py-3 bg-red-950/30 border border-red-700/50 rounded-lg flex items-center justify-center gap-2"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#ef4444">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span className="text-fg text-sm font-medium">
                {mostrarVideo ? 'Ocultar video' : 'Ver técnica en YouTube'}
              </span>
            </button>

            {mostrarVideo && (
              <div className="mb-4 rounded-xl overflow-hidden bg-black aspect-video">
                <iframe
                  src={videoEmbed}
                  title={`Video de ${ejercicio.nombre}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}
          </>
        )}

        {!ejercicio.videoUrl && (
          <button
            onClick={() => setModalVideoAbierto(true)}
            className="w-full mb-3 px-4 py-3 border border-dashed border-fg-subtle rounded-lg flex items-center justify-center gap-2 text-fg-muted hover:text-fg hover:border-fg-muted"
          >
            <span className="text-sm">+ Agregar video de técnica</span>
          </button>
        )}

        {/* Título + última vez */}
        <h1 className="text-xl font-medium tracking-tight mb-1">
          {ejercicio.nombre}
        </h1>
        <p className="text-fg-muted text-xs mb-1">
          {prescripcion.seriesPrescriptas} × {prescripcion.repsPrescriptas}
        </p>
        {ultimaVez && ultimaVez.fechaUltimaVez && (
          <p className="text-fg-subtle text-xs mb-4">
            Última vez: {ultimaVez.textoReferencia} · {ultimaVez.hace}
          </p>
        )}
        {ultimaVez && !ultimaVez.fechaUltimaVez && (
          <p className="text-fg-subtle text-xs mb-4">
            Primera vez con este ejercicio
          </p>
        )}

        {porLado && (
          <div className="mb-4 px-3 py-2 bg-amber-950/30 border border-amber-700/50 rounded-lg">
            <p className="text-amber-200 text-xs leading-relaxed">
              ℹ️ Este ejercicio es <strong>por lado</strong>. Cargá el peso y reps de
              un solo lado (la app guarda un único valor).
            </p>
          </div>
        )}

        {/* Stepper de peso global */}
        <div className="bg-bg-elevated border border-bg-subtle rounded-xl p-4 mb-5">
          <p className="text-fg-muted text-xs mb-2">Peso para todas las series</p>
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => ajustarPesoGlobal(-2.5)}
              className="bg-bg border border-bg-subtle text-fg w-14 h-12 rounded-lg text-base font-medium active:bg-bg-subtle"
            >
              −2.5
            </button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-medium text-fg">{pesoGlobal}</span>
              <span className="text-fg-muted text-sm ml-1">kg</span>
            </div>
            <button
              onClick={() => ajustarPesoGlobal(2.5)}
              className="bg-bg border border-bg-subtle text-fg w-14 h-12 rounded-lg text-base font-medium active:bg-bg-subtle"
            >
              +2.5
            </button>
          </div>
          <p className="text-fg-subtle text-[11px] text-center mt-2">
            Tocá una serie para registrarla. Mantené apretado para cambiarle el peso individual.
          </p>
        </div>

        {/* Grilla de series */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {seriesEnPantalla.map((s, idx) => (
            <BotonSerie
              key={idx}
              serie={s}
              onMarcar={() => marcarSerie(idx)}
              onDesmarcar={() => desmarcarSerie(idx)}
              onMantenerPresionado={() => abrirEdicion(idx)}
            />
          ))}
        </div>
      </div>

      <div
        className="sticky bottom-0 left-0 right-0 px-4 py-3 bg-bg border-t border-bg-subtle"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 12px)' }}
      >
        <button
          onClick={() => navigate(-1)}
          className={`w-full py-4 rounded-xl text-base font-medium ${
            todasMarcadas
              ? 'bg-accent text-emerald-950'
              : 'bg-bg-elevated text-fg border border-bg-subtle'
          }`}
        >
          {todasMarcadas
            ? 'Ejercicio terminado · Volver'
            : seriesEnPantalla.some((s) => s.marcada)
            ? 'Guardar y volver'
            : 'Volver sin registrar'}
        </button>
      </div>

      {/* Modal de edición de serie individual */}
      {editandoSerie !== null && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 px-4"
          onClick={() => setEditandoSerie(null)}
        >
          <div
            className="bg-bg-elevated border border-bg-subtle rounded-2xl p-5 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-fg font-medium text-base mb-4">
              Serie {editandoSerie + 1}
            </p>
            <div className="flex gap-2.5 mb-5">
              <div className="flex-1">
                <label className="block text-fg-muted text-xs mb-1.5">Peso (kg)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  value={valoresEdicion.peso}
                  onChange={(e) =>
                    setValoresEdicion({ ...valoresEdicion, peso: e.target.value })
                  }
                  className="w-full bg-bg border border-bg-subtle text-fg px-3 py-3 rounded-lg text-sm focus:outline-none focus:border-fg-muted"
                />
              </div>
              <div className="flex-1">
                <label className="block text-fg-muted text-xs mb-1.5">Reps</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={valoresEdicion.reps}
                  onChange={(e) =>
                    setValoresEdicion({ ...valoresEdicion, reps: e.target.value })
                  }
                  className="w-full bg-bg border border-bg-subtle text-fg px-3 py-3 rounded-lg text-sm focus:outline-none focus:border-fg-muted"
                />
              </div>
            </div>
            <button
              onClick={guardarEdicion}
              className="w-full bg-accent text-emerald-950 py-3 rounded-lg text-sm font-medium"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      <ModalCambiarVideo
        abierto={modalVideoAbierto}
        videoActual={ejercicio.videoUrl ?? null}
        nombreEjercicio={ejercicio.nombre}
        onCerrar={() => setModalVideoAbierto(false)}
        onGuardar={cambiarVideo}
      />
    </Pantalla>
  );
}

/**
 * Botón de una serie individual. Maneja:
 *  - clic corto: marca/desmarca como hecha
 *  - clic largo (long press): abre edición de peso/reps
 */
function BotonSerie({
  serie,
  onMarcar,
  onDesmarcar,
  onMantenerPresionado,
}: {
  serie: SerieEnPantalla;
  onMarcar: () => void;
  onDesmarcar: () => void;
  onMantenerPresionado: () => void;
}) {
  const [presionando, setPresionando] = useState(false);
  let timerId: ReturnType<typeof setTimeout> | null = null;

  const onMouseDown = () => {
    setPresionando(true);
    timerId = setTimeout(() => {
      setPresionando(false);
      onMantenerPresionado();
      timerId = null;
    }, 500);
  };

  const onMouseUp = () => {
    setPresionando(false);
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
      // Era un tap corto
      if (serie.marcada) {
        onDesmarcar();
      } else {
        onMarcar();
      }
    }
  };

  const onMouseLeave = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    setPresionando(false);
  };

  return (
    <button
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onMouseDown}
      onTouchEnd={onMouseUp}
      onTouchCancel={onMouseLeave}
      onContextMenu={(e) => e.preventDefault()}
      className={`p-4 rounded-xl border text-left transition-all select-none ${
        presionando ? 'scale-95' : ''
      } ${
        serie.marcada
          ? 'bg-accent/15 border-accent text-fg'
          : 'bg-bg-elevated border-bg-subtle text-fg'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-fg-muted text-[11px] uppercase tracking-wider mb-1">
            Serie {serie.numero}
          </p>
          <p className="text-xl font-medium leading-none">{serie.peso}<span className="text-sm text-fg-muted ml-0.5">kg</span></p>
          <p className="text-xs text-fg-muted mt-1">× {serie.reps} reps</p>
        </div>
        {serie.marcada && (
          <span className="text-accent text-lg leading-none">✓</span>
        )}
      </div>
    </button>
  );
}
