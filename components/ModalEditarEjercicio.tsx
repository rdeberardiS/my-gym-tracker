import { useState, useEffect } from 'react';
import type { EjercicioParseado } from '@/types/parser';

interface ModalEditarEjercicioProps {
  ejercicio: EjercicioParseado | null;
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (ejercicioModificado: EjercicioParseado) => void;
}

export function ModalEditarEjercicio({
  ejercicio,
  abierto,
  onCerrar,
  onGuardar,
}: ModalEditarEjercicioProps) {
  const [nombre, setNombre] = useState('');
  const [series, setSeries] = useState('');
  const [reps, setReps] = useState('');
  const [intensidad, setIntensidad] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (ejercicio) {
      setNombre(ejercicio.nombre ?? '');
      setSeries(String(ejercicio.series ?? ''));
      setReps(ejercicio.reps ?? '');
      setIntensidad(ejercicio.intensidad);
    }
  }, [ejercicio]);

  if (!abierto || !ejercicio) return null;

  const guardar = () => {
    const seriesNum = parseInt(series, 10);
    if (!nombre.trim() || isNaN(seriesNum) || seriesNum < 1 || !reps.trim()) {
      return;
    }
    onGuardar({
      ...ejercicio,
      estado: 'ok',
      nombre: nombre.trim(),
      series: seriesNum,
      reps: reps.trim(),
      ...(intensidad ? { intensidad } : { intensidad: undefined }),
    });
    onCerrar();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 px-4"
      onClick={onCerrar}
    >
      <div
        className="bg-bg-elevated border border-bg-subtle rounded-2xl p-5 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-fg font-medium text-base">Editar ejercicio</p>
          <button onClick={onCerrar} className="text-fg-muted text-xl">
            ×
          </button>
        </div>

        <label className="block text-fg-muted text-xs mb-1.5">Nombre</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full bg-bg border border-bg-subtle text-fg px-3 py-3 rounded-lg text-sm mb-4 focus:outline-none focus:border-fg-muted"
        />

        <div className="flex gap-2.5 mb-5">
          <div className="flex-1">
            <label className="block text-fg-muted text-xs mb-1.5">Series</label>
            <input
              type="number"
              inputMode="numeric"
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              className="w-full bg-bg border border-bg-subtle text-fg px-3 py-3 rounded-lg text-sm focus:outline-none focus:border-fg-muted"
            />
          </div>
          <div className="flex-1">
            <label className="block text-fg-muted text-xs mb-1.5">Reps</label>
            <input
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full bg-bg border border-bg-subtle text-fg px-3 py-3 rounded-lg text-sm focus:outline-none focus:border-fg-muted"
            />
          </div>
        </div>

        <label className="block text-fg-muted text-xs mb-1.5">
          Intensidad <span className="text-fg-subtle">(opcional, 1 a 5)</span>
        </label>
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setIntensidad(undefined)}
            className={`flex-1 py-2.5 rounded-lg text-sm border ${
              intensidad === undefined
                ? 'bg-bg-subtle border-fg-muted text-fg'
                : 'bg-bg border-bg-subtle text-fg-muted'
            }`}
          >
            —
          </button>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setIntensidad(n)}
              className={`flex-1 py-2.5 rounded-lg text-sm border ${
                intensidad === n
                  ? 'bg-accent text-accent-ink border-fucsia font-semibold'
                  : 'bg-bg border-bg-subtle text-fg'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          onClick={guardar}
          className="w-full bg-accent text-accent-ink py-3 rounded-lg text-sm font-medium"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
