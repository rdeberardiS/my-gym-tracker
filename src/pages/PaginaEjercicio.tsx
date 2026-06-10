/**
 * Pantalla del Ejercicio durante el entrenamiento.
 *
 * Esta es la pantalla más usada y crítica. Pensada para usar CON UNA MANO,
 * mientras la persona entrena. Por eso la carga tiene que ser de un toque.
 *
 * Cómo funciona el registro (rediseñado por feedback de uso real):
 *  - Hay un peso grande arriba ("Peso para todas las series") con −2.5 / +2.5.
 *    Ese peso se aplica a TODAS las series que todavía no registraste.
 *  - Tocás una cajita de serie => queda registrada con el peso de arriba.
 *    Tocás de nuevo => se desmarca.
 *  - Botón grande "Registrar las N series": marca todas de una sola vez.
 *  - Si una serie necesita otro peso: registrás las que van con un peso,
 *    cambiás el peso de arriba, y registrás las que faltan. Cada serie
 *    conserva el peso que tenía cuando la marcaste.
 *
 * Una serie registrada guarda su peso (el de arriba) y las reps prescriptas.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Pantalla } from '@/components/Pantalla';
import { Header } from '@/components/Header';
import { ModalCambiarVideo } from '@/components/ModalCambiarVideo';
import { VideoTecnica } from '@/components/VideoTecnica';
import { Intensidad } from '@/components/Intensidad';
import { esEjercicioSinPeso, buscarVideoEnCatalogo } from '@/services/catalogo/catalogoVideos';
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
import {
  obtenerComentario,
  guardarComentario,
} from '@/db/repositorios/comentarioRepo';
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

/** Formatea 10 -> "10", 12.5 -> "12.5" (sin ".0" innecesario) */
function fmtPeso(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n);
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
  const [sinPeso, setSinPeso] = useState<boolean>(false);
  const [pesoGlobal, setPesoGlobal] = useState<number>(0);
  const [pesoTexto, setPesoTexto] = useState<string>('0');
  const [mostrarVideo, setMostrarVideo] = useState(false);
  const [modalVideoAbierto, setModalVideoAbierto] = useState(false);
  const [guardandoTodas, setGuardandoTodas] = useState(false);
  const [comentario, setComentario] = useState('');
  const timerComentario = useRef<ReturnType<typeof setTimeout> | null>(null);

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

      // ¿Es un ejercicio de core / peso corporal? Esos no llevan peso.
      const sinPesoEj = esEjercicioSinPeso(ej.nombre);
      setSinPeso(sinPesoEj);

      // Calcular última vez
      const ultima = await calcularUltimaVez(ej.id, sinPesoEj);
      setUltimaVez(ultima);

      // Cargar series ya registradas de esta sesión
      const seriesSesion = await obtenerSeriesDeSesion(sesionId);
      const seriesEsteEjercicio = seriesSesion
        .filter((s) => s.ejercicioId === ej.id)
        .sort((a, b) => a.numeroSerie - b.numeroSerie);

      // Peso inicial: en core siempre 0. Si no, si ya hay series hoy uso el
      // de la primera; si no, el de la última vez; si nunca entrenó, 10.
      const pesoInicial = sinPesoEj
        ? 0
        : seriesEsteEjercicio[0]?.peso ?? ultima.pesoPreRellenado ?? 10;
      setPesoGlobal(pesoInicial);
      setPesoTexto(fmtPeso(pesoInicial));

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

      // Cargar la nota de este ejercicio en esta sesión (si existe)
      const notaExistente = await obtenerComentario(sesionId, ej.id);
      setComentario(notaExistente);
    } finally {
      setCargando(false);
    }
  };

  // Aplica un peso nuevo: actualiza el número, el texto del input, y lo
  // propaga a todas las series NO marcadas (las marcadas conservan el suyo).
  const aplicarPeso = (nuevo: number) => {
    const limpio = Math.max(0, +nuevo.toFixed(2));
    setPesoGlobal(limpio);
    setPesoTexto(fmtPeso(limpio));
    setSeriesEnPantalla((prev) =>
      prev.map((s) => (s.marcada ? s : { ...s, peso: limpio }))
    );
  };

  // Botones −2.5 / +2.5
  const ajustarPesoGlobal = (delta: number) => {
    aplicarPeso(pesoGlobal + delta);
  };

  // Tipeo directo en el número (ej: escribir 40 de una)
  const onCambiarTextoPeso = (texto: string) => {
    // Permitimos coma o punto como decimal y dejamos el campo libre mientras tipea
    setPesoTexto(texto);
    const n = parseFloat(texto.replace(',', '.'));
    if (!isNaN(n) && n >= 0) {
      const limpio = +n.toFixed(2);
      setPesoGlobal(limpio);
      setSeriesEnPantalla((prev) =>
        prev.map((s) => (s.marcada ? s : { ...s, peso: limpio }))
      );
    }
  };

  // Al salir del campo, si quedó vacío o inválido, lo devolvemos al valor actual
  const onTerminarEdicionPeso = () => {
    const n = parseFloat(pesoTexto.replace(',', '.'));
    if (isNaN(n) || n < 0) {
      setPesoTexto(fmtPeso(pesoGlobal));
    } else {
      setPesoTexto(fmtPeso(+n.toFixed(2)));
    }
  };

  // Registra una serie con el peso actual (el de arriba).
  const marcarSerie = async (idx: number) => {
    if (!ejercicio || !sesionId || !prescripcion) return;
    const s = seriesEnPantalla[idx];
    if (s.marcada) return;

    const repsAGuardar =
      s.reps > 0 ? s.reps : parsearRepsObjetivo(prescripcion.repsPrescriptas) || 8;

    const serieGuardada = await registrarSerie({
      sesionId,
      ejercicioId: ejercicio.id,
      numeroSerie: s.numero,
      peso: pesoGlobal,
      reps: repsAGuardar,
    });

    setSeriesEnPantalla((prev) =>
      prev.map((sp, i) =>
        i === idx
          ? {
              ...sp,
              peso: pesoGlobal,
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
        i === idx
          ? { ...sp, marcada: false, serieGuardadaId: undefined, peso: pesoGlobal }
          : sp
      )
    );
  };

  const alternarSerie = (idx: number) => {
    const s = seriesEnPantalla[idx];
    if (s.marcada) {
      desmarcarSerie(idx);
    } else {
      marcarSerie(idx);
    }
  };

  // Registra de una sola vez todas las series que faltan, con el peso de arriba.
  const registrarTodas = async () => {
    if (!ejercicio || !sesionId || !prescripcion || guardandoTodas) return;
    setGuardandoTodas(true);
    try {
      const repsFallback =
        parsearRepsObjetivo(prescripcion.repsPrescriptas) || 8;
      const actualizaciones: { idx: number; id: string; reps: number }[] = [];

      for (let i = 0; i < seriesEnPantalla.length; i++) {
        const s = seriesEnPantalla[i];
        if (s.marcada) continue;
        const repsAGuardar = s.reps > 0 ? s.reps : repsFallback;
        const guardada = await registrarSerie({
          sesionId,
          ejercicioId: ejercicio.id,
          numeroSerie: s.numero,
          peso: pesoGlobal,
          reps: repsAGuardar,
        });
        actualizaciones.push({ idx: i, id: guardada.id, reps: repsAGuardar });
      }

      setSeriesEnPantalla((prev) =>
        prev.map((sp, i) => {
          const upd = actualizaciones.find((a) => a.idx === i);
          if (!upd) return sp;
          return {
            ...sp,
            peso: pesoGlobal,
            reps: upd.reps,
            marcada: true,
            serieGuardadaId: upd.id,
          };
        })
      );
    } finally {
      setGuardandoTodas(false);
    }
  };

  const cambiarVideo = async (nuevoUrl: string | null) => {
    if (!ejercicio) return;
    await actualizarVideoEjercicio(ejercicio.id, nuevoUrl);
    setEjercicio({ ...ejercicio, videoUrl: nuevoUrl ?? undefined });
  };

  // Guarda la nota. Mientras escribe, lo hacemos con un pequeño retraso
  // (debounce) para no escribir en cada tecla. También guardamos al salir.
  const onCambiarComentario = (texto: string) => {
    setComentario(texto);
    if (!ejercicio || !sesionId) return;
    if (timerComentario.current) clearTimeout(timerComentario.current);
    const ejId = ejercicio.id;
    const sId = sesionId;
    timerComentario.current = setTimeout(() => {
      guardarComentario(sId, ejId, texto);
    }, 500);
  };

  const guardarComentarioYa = () => {
    if (!ejercicio || !sesionId) return;
    if (timerComentario.current) clearTimeout(timerComentario.current);
    guardarComentario(sesionId, ejercicio.id, comentario);
  };

  // Al desmontar la pantalla, nos aseguramos de dejar la nota guardada.
  useEffect(() => {
    return () => {
      if (timerComentario.current) clearTimeout(timerComentario.current);
    };
  }, []);

  const todasMarcadas = useMemo(
    () => seriesEnPantalla.length > 0 && seriesEnPantalla.every((s) => s.marcada),
    [seriesEnPantalla]
  );

  const algunaMarcada = useMemo(
    () => seriesEnPantalla.some((s) => s.marcada),
    [seriesEnPantalla]
  );

  const faltantes = useMemo(
    () => seriesEnPantalla.filter((s) => !s.marcada).length,
    [seriesEnPantalla]
  );

  const porLado = useMemo(
    () =>
      prescripcion && ejercicio
        ? detectarPorLado(prescripcion.repsPrescriptas, ejercicio.nombre)
        : false,
    [prescripcion, ejercicio]
  );

  // Video a mostrar: el propio del ejercicio si lo tiene; si no, el del
  // catálogo (match por nombre). Así los videos del catálogo aparecen aunque
  // el ejercicio se haya importado antes, sin tener que reimportar la rutina.
  const videoResuelto = useMemo(
    () =>
      ejercicio?.videoUrl ||
      (ejercicio ? buscarVideoEnCatalogo(ejercicio.nombre) : null),
    [ejercicio]
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

  return (
    <Pantalla>
      <Header titulo="Ejercicio" />

      <div className="px-4 pt-3 pb-32 flex-1">
        {/* Botón Video */}
        {videoResuelto && (
          <>
            <button
              onClick={() => setMostrarVideo((v) => !v)}
              className="w-full mb-3 px-4 py-3 bg-accent-muted border border-accent/40 rounded-lg flex items-center justify-center gap-2"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#c97b84">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span className="text-accent text-sm font-medium">
                {mostrarVideo ? 'Ocultar video' : 'Ver técnica'}
              </span>
            </button>

            {mostrarVideo && (
              <VideoTecnica
                videoUrl={videoResuelto}
                nombreEjercicio={ejercicio.nombre}
              />
            )}
          </>
        )}

        {!videoResuelto && (
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
        <div className="flex items-center gap-3 mb-1">
          <p className="text-fg-muted text-xs">
            {prescripcion.seriesPrescriptas} × {prescripcion.repsPrescriptas}
          </p>
          {prescripcion.intensidad && (
            <Intensidad valor={prescripcion.intensidad} tamano="md" conEtiqueta />
          )}
        </div>
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
          <div className="mb-4 px-3 py-2 bg-warn-muted border border-warn/50 rounded-lg">
            <p className="text-warn-ink text-xs leading-relaxed">
              ℹ️ Este ejercicio es <strong>por lado</strong>. Cargá el peso y reps de
              un solo lado (la app guarda un único valor).
            </p>
          </div>
        )}

        {/* Peso global: editable directo + botones de ajuste fino.
            En ejercicios de core (sin peso) no se muestra. */}
        {!sinPeso && (
        <div className="bg-bg-elevated border border-bg-subtle rounded-xl p-4 mb-4">
          <p className="text-fg-muted text-xs mb-2">
            Peso para todas las series · tocá el número para escribirlo
          </p>
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => ajustarPesoGlobal(-2.5)}
              className="bg-bg border border-bg-subtle text-fg w-16 h-14 rounded-lg text-lg font-medium active:bg-bg-subtle shrink-0"
            >
              −2.5
            </button>
            <div className="flex-1 flex items-baseline justify-center gap-1 min-w-0">
              <input
                type="text"
                inputMode="decimal"
                value={pesoTexto}
                onChange={(e) => onCambiarTextoPeso(e.target.value)}
                onFocus={(e) => e.target.select()}
                onBlur={onTerminarEdicionPeso}
                aria-label="Peso en kilos"
                className="bg-transparent text-center text-4xl font-medium text-fg w-24 focus:outline-none focus:text-accent border-b border-transparent focus:border-accent"
              />
              <span className="text-fg-muted text-sm">kg</span>
            </div>
            <button
              onClick={() => ajustarPesoGlobal(2.5)}
              className="bg-bg border border-bg-subtle text-fg w-16 h-14 rounded-lg text-lg font-medium active:bg-bg-subtle shrink-0"
            >
              +2.5
            </button>
          </div>
        </div>
        )}

        {sinPeso && (
          <div className="bg-bg-elevated border border-bg-subtle rounded-xl p-3.5 mb-4">
            <p className="text-fg-muted text-xs leading-relaxed">
              🧘 Ejercicio de core · sin peso. Marcá cada serie a medida que la
              vas haciendo.
            </p>
          </div>
        )}

        {/* Botón grande: registrar todas de una */}
        {!todasMarcadas && (
          <button
            onClick={registrarTodas}
            disabled={guardandoTodas}
            className="w-full mb-4 py-4 rounded-xl text-base font-semibold bg-accent text-accent-ink active:opacity-80 disabled:opacity-50"
          >
            {guardandoTodas
              ? 'Registrando...'
              : sinPeso
              ? `✓ Registrar ${faltantes === 1 ? 'la serie' : `las ${faltantes} series`}`
              : `✓ Registrar ${faltantes === 1 ? 'la serie' : `las ${faltantes} series`} con ${fmtPeso(pesoGlobal)} kg`}
          </button>
        )}

        <p className="text-fg-subtle text-[11px] text-center mb-3">
          {todasMarcadas
            ? '¡Listo! Tocá una serie si querés desmarcarla.'
            : 'O tocá cada serie de a una para registrarla.'}
        </p>

        {/* Grilla de series */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {seriesEnPantalla.map((s, idx) => (
            <BotonSerie
              key={idx}
              serie={s}
              sinPeso={sinPeso}
              onTocar={() => alternarSerie(idx)}
            />
          ))}
        </div>

        {/* Nota del ejercicio (para vos / tu PT) */}
        <div className="bg-bg-elevated border border-bg-subtle rounded-xl p-4">
          <label className="block text-fg-muted text-xs mb-2">
            📝 Nota de hoy <span className="text-fg-subtle">· para vos o tu PT</span>
          </label>
          <textarea
            value={comentario}
            onChange={(e) => onCambiarComentario(e.target.value)}
            onBlur={guardarComentarioYa}
            rows={3}
            placeholder="Ej: me costó la última serie, ¿subo el peso? / la rodilla me molestó un poco"
            className="w-full bg-bg border border-bg-subtle text-fg px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-fg-muted resize-none placeholder:text-fg-subtle"
          />
          <p className="text-fg-subtle text-[11px] mt-1.5">
            Se guarda sola. La vas a poder leer en Progreso, tocando el día.
          </p>
        </div>
      </div>

      <div
        className="sticky bottom-0 left-0 right-0 px-4 py-3 bg-bg border-t border-bg-subtle"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 12px)' }}
      >
        <button
          onClick={() => {
            guardarComentarioYa();
            navigate(-1);
          }}
          className={`w-full py-4 rounded-xl text-base font-medium ${
            todasMarcadas
              ? 'bg-accent text-accent-ink'
              : 'bg-bg-elevated text-fg border border-bg-subtle'
          }`}
        >
          {todasMarcadas
            ? 'Ejercicio terminado · Volver'
            : algunaMarcada
            ? 'Guardar y volver'
            : 'Volver sin registrar'}
        </button>
      </div>

      <ModalCambiarVideo
        abierto={modalVideoAbierto}
        videoActual={videoResuelto ?? null}
        nombreEjercicio={ejercicio.nombre}
        onCerrar={() => setModalVideoAbierto(false)}
        onGuardar={cambiarVideo}
      />
    </Pantalla>
  );
}

/**
 * Botón de una serie individual. Un solo toque alterna registrada / no registrada.
 * Sin menús ni ventanas: rápido y a prueba de errores mientras se entrena.
 */
function BotonSerie({
  serie,
  sinPeso,
  onTocar,
}: {
  serie: SerieEnPantalla;
  sinPeso: boolean;
  onTocar: () => void;
}) {
  return (
    <button
      onClick={onTocar}
      className={`p-4 rounded-xl border text-left transition-colors select-none active:scale-[0.98] ${
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
          {sinPeso ? (
            <p className="text-xl font-medium leading-none">
              {serie.reps}
              <span className="text-sm text-fg-muted ml-0.5">reps</span>
            </p>
          ) : (
            <>
              <p className="text-xl font-medium leading-none">
                {fmtPeso(serie.peso)}
                <span className="text-sm text-fg-muted ml-0.5">kg</span>
              </p>
              <p className="text-xs text-fg-muted mt-1">× {serie.reps} reps</p>
            </>
          )}
        </div>
        <span className={`text-lg leading-none ${serie.marcada ? 'text-accent' : 'text-fg-subtle'}`}>
          {serie.marcada ? '✓' : '○'}
        </span>
      </div>
    </button>
  );
}
