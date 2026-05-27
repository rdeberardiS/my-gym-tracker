/**
 * Pantalla de Preview de rutina importada.
 *
 * Muestra los días detectados con sus ejercicios. Permite:
 *  - Expandir/colapsar cada día
 *  - Editar nombre del día
 *  - Editar cada ejercicio (nombre, series, reps)
 *  - Borrar ejercicios
 *  - Agregar nuevos
 *
 * Al confirmar: se guarda la rutina en la DB y se navega al Home.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pantalla } from '@/components/Pantalla';
import { Header } from '@/components/Header';
import { ModalEditarEjercicio } from '@/components/ModalEditarEjercicio';
import { useImportacionStore } from '@/stores/importacionStore';
import { importarRutina } from '@/db/repositorios/rutinaRepo';
import { RUTAS } from '@/rutas';
import type { DiaParseado, EjercicioParseado } from '@/types/parser';

export function PaginaPreviewRutina() {
  const navigate = useNavigate();
  const resultado = useImportacionStore((s) => s.resultado);
  const textoOriginal = useImportacionStore((s) => s.textoOriginal);
  const actualizarDias = useImportacionStore((s) => s.actualizarDias);
  const limpiar = useImportacionStore((s) => s.limpiar);

  const [diasExpandidos, setDiasExpandidos] = useState<Set<number>>(
    new Set([0]) // primer día abierto por default
  );
  const [editando, setEditando] = useState<{
    diaIdx: number;
    ejIdx: number;
    ejercicio: EjercicioParseado;
  } | null>(null);
  const [editandoDia, setEditandoDia] = useState<number | null>(null);
  const [nombreNuevoDia, setNombreNuevoDia] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Si no hay resultado (refresh accidental), volvemos a importar
  useEffect(() => {
    if (!resultado) {
      navigate(RUTAS.importar, { replace: true });
    }
  }, [resultado, navigate]);

  if (!resultado) return null;

  const totalEjercicios = resultado.dias.reduce(
    (acc, d) => acc + d.ejercicios.filter((e) => e.estado !== 'no_interpretado').length,
    0
  );

  const toggleDia = (idx: number) => {
    const nuevo = new Set(diasExpandidos);
    if (nuevo.has(idx)) nuevo.delete(idx);
    else nuevo.add(idx);
    setDiasExpandidos(nuevo);
  };

  const borrarEjercicio = (diaIdx: number, ejIdx: number) => {
    const dias = resultado.dias.map((d, i) => {
      if (i !== diaIdx) return d;
      return {
        ...d,
        ejercicios: d.ejercicios.filter((_, j) => j !== ejIdx),
      };
    });
    actualizarDias(dias);
  };

  const guardarEdicionEjercicio = (
    diaIdx: number,
    ejIdx: number,
    ejercicioModificado: EjercicioParseado
  ) => {
    const dias = resultado.dias.map((d, i) => {
      if (i !== diaIdx) return d;
      const nuevos = [...d.ejercicios];
      nuevos[ejIdx] = ejercicioModificado;
      return { ...d, ejercicios: nuevos };
    });
    actualizarDias(dias);
  };

  const agregarEjercicio = (diaIdx: number) => {
    const nuevoEjercicio: EjercicioParseado = {
      estado: 'ok',
      nombre: 'Nuevo ejercicio',
      series: 3,
      reps: '10',
    };
    setEditando({
      diaIdx,
      ejIdx: resultado.dias[diaIdx].ejercicios.length,
      ejercicio: nuevoEjercicio,
    });
    // Agregamos preventivamente, después al guardar se actualiza
    const dias = resultado.dias.map((d, i) => {
      if (i !== diaIdx) return d;
      return { ...d, ejercicios: [...d.ejercicios, nuevoEjercicio] };
    });
    actualizarDias(dias);
  };

  const empezarEdicionNombreDia = (diaIdx: number) => {
    setEditandoDia(diaIdx);
    setNombreNuevoDia(resultado.dias[diaIdx].nombre);
  };

  const guardarNombreDia = () => {
    if (editandoDia === null) return;
    if (!nombreNuevoDia.trim()) {
      setEditandoDia(null);
      return;
    }
    const dias = resultado.dias.map((d, i) =>
      i === editandoDia ? { ...d, nombre: nombreNuevoDia.trim() } : d
    );
    actualizarDias(dias);
    setEditandoDia(null);
  };

  const confirmar = async () => {
    if (guardando) return;
    setGuardando(true);
    try {
      // Filtramos ejercicios no interpretados antes de guardar
      const diasFiltrados: DiaParseado[] = resultado.dias
        .map((d) => ({
          ...d,
          ejercicios: d.ejercicios.filter(
            (e) => e.estado !== 'no_interpretado' && e.nombre && e.series && e.reps
          ),
        }))
        .filter((d) => d.ejercicios.length > 0);

      await importarRutina({
        nombre: 'Mi rutina',
        textoOriginal,
        dias: diasFiltrados,
      });
      limpiar();
      navigate(RUTAS.home, { replace: true });
    } catch (e) {
      console.error(e);
      alert('Hubo un error al guardar la rutina. Intentá de nuevo.');
      setGuardando(false);
    }
  };

  if (!resultado.exito || resultado.dias.length === 0) {
    return (
      <Pantalla>
        <Header titulo="Revisá tu rutina" atras={RUTAS.importar} />
        <div className="px-5 py-8 text-center">
          <h1 className="text-xl font-medium mb-3">
            No pudimos interpretar tu rutina
          </h1>
          <p className="text-fg-muted text-sm leading-relaxed mb-8">
            Probá con un formato más estructurado o pegá los ejercicios línea
            por línea.
          </p>
          <button
            onClick={() => navigate(RUTAS.importar)}
            className="bg-accent text-emerald-950 py-3 px-6 rounded-xl text-sm font-medium"
          >
            Volver a pegar
          </button>
        </div>
      </Pantalla>
    );
  }

  return (
    <Pantalla>
      <Header titulo="Revisá tu rutina" atras={RUTAS.importar} />

      <div className="px-4 py-5 flex-1">
        <h1 className="text-xl font-medium tracking-tight mb-1.5">
          Listo, encontramos esto
        </h1>
        <p className="text-fg-muted text-xs mb-5">
          {resultado.dias.length}{' '}
          {resultado.dias.length === 1 ? 'día' : 'días'} · {totalEjercicios}{' '}
          ejercicios · Tocá cualquier ítem para editarlo
        </p>

        {resultado.dias.map((dia, diaIdx) => {
          const expandido = diasExpandidos.has(diaIdx);
          const ejerciciosValidos = dia.ejercicios.filter(
            (e) => e.estado !== 'no_interpretado'
          );

          return (
            <div
              key={diaIdx}
              className="bg-bg-elevated border border-bg-subtle rounded-xl mb-2.5 overflow-hidden"
            >
              <div className="flex items-center justify-between p-3.5 px-4 border-b border-transparent">
                <div
                  className="flex-1 cursor-pointer flex items-center gap-2"
                  onClick={() => toggleDia(diaIdx)}
                >
                  <div>
                    {editandoDia === diaIdx ? (
                      <input
                        autoFocus
                        value={nombreNuevoDia}
                        onChange={(e) => setNombreNuevoDia(e.target.value)}
                        onBlur={guardarNombreDia}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') guardarNombreDia();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-bg border border-bg-subtle text-fg text-sm font-medium px-2 py-1 rounded w-full focus:outline-none focus:border-fg-muted"
                      />
                    ) : (
                      <p
                        className="text-sm font-medium mb-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          empezarEdicionNombreDia(diaIdx);
                        }}
                      >
                        {dia.nombre}{' '}
                        <span className="text-fg-subtle ml-1">✎</span>
                      </p>
                    )}
                    <p className="text-xs text-fg-muted">
                      {ejerciciosValidos.length} ejercicios
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleDia(diaIdx)}
                  className="text-fg-muted text-xl px-2"
                >
                  {expandido ? '▾' : '▸'}
                </button>
              </div>

              {expandido && (
                <div className="border-t border-bg-subtle px-4 py-2 pb-3">
                  {ejerciciosValidos.map((ej, ejIdx) => (
                    <div
                      key={ejIdx}
                      className="py-3 flex justify-between items-center gap-3 border-b border-bg-subtle/40 last:border-b-0"
                    >
                      <div
                        className="flex-1 cursor-pointer flex items-center gap-2"
                        onClick={() =>
                          setEditando({ diaIdx, ejIdx, ejercicio: ej })
                        }
                      >
                        <span className="text-sm">{ej.nombre}</span>
                        <span className="text-fg-subtle text-xs">✎</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-fg-muted">
                          {ej.series} × {ej.reps}
                        </span>
                        <button
                          onClick={() => borrarEjercicio(diaIdx, ejIdx)}
                          className="text-fg-subtle hover:text-danger text-lg"
                          aria-label="Borrar"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => agregarEjercicio(diaIdx)}
                    className="w-full mt-2 py-2.5 border border-dashed border-fg-subtle text-fg-muted text-xs rounded-lg hover:border-fg-muted hover:text-fg"
                  >
                    + Agregar ejercicio
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={confirmar}
          disabled={guardando || totalEjercicios === 0}
          className="w-full mt-6 bg-accent text-emerald-950 py-4 rounded-xl text-sm font-medium disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Confirmar y empezar →'}
        </button>

        <button
          onClick={() => navigate(RUTAS.importar)}
          className="w-full mt-2 text-fg-muted py-2.5 text-xs"
        >
          Volver y pegar de nuevo
        </button>
      </div>

      <ModalEditarEjercicio
        ejercicio={editando?.ejercicio ?? null}
        abierto={!!editando}
        onCerrar={() => setEditando(null)}
        onGuardar={(modificado) => {
          if (editando) {
            guardarEdicionEjercicio(editando.diaIdx, editando.ejIdx, modificado);
          }
        }}
      />
    </Pantalla>
  );
}
