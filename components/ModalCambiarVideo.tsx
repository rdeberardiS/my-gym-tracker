import { useState, useEffect } from 'react';
import { extraerIdYoutube } from '@/services/catalogo/catalogoVideos';

interface ModalCambiarVideoProps {
  abierto: boolean;
  videoActual: string | null;
  nombreEjercicio: string;
  onCerrar: () => void;
  onGuardar: (nuevoVideoUrl: string | null) => void;
}

export function ModalCambiarVideo({
  abierto,
  videoActual,
  nombreEjercicio,
  onCerrar,
  onGuardar,
}: ModalCambiarVideoProps) {
  const [url, setUrl] = useState(videoActual ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (abierto) {
      setUrl(videoActual ?? '');
      setError(null);
    }
  }, [abierto, videoActual]);

  if (!abierto) return null;

  const guardar = () => {
    const limpio = url.trim();
    if (!limpio) {
      onGuardar(null);
      onCerrar();
      return;
    }

    const id = extraerIdYoutube(limpio);
    if (!id) {
      setError('No reconozco ese link. Pegá un link de YouTube válido.');
      return;
    }

    onGuardar(limpio);
    onCerrar();
  };

  const sacarVideo = () => {
    onGuardar(null);
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
        <div className="flex items-center justify-between mb-3">
          <p className="text-fg font-medium text-base">
            {videoActual ? 'Cambiar video' : 'Agregar video'}
          </p>
          <button onClick={onCerrar} className="text-fg-muted text-xl">
            ×
          </button>
        </div>

        <p className="text-fg-muted text-xs mb-4 leading-relaxed">
          {nombreEjercicio}
        </p>

        <label className="block text-fg-muted text-xs mb-1.5">
          Link de YouTube
        </label>
        <input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full bg-bg border border-bg-subtle text-fg px-3 py-3 rounded-lg text-sm mb-1 focus:outline-none focus:border-fg-muted"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {error && (
          <p className="text-danger text-xs mt-1 mb-3">{error}</p>
        )}
        {!error && (
          <p className="text-fg-subtle text-xs mb-3 leading-relaxed">
            Copiá el link desde YouTube y pegalo acá.
          </p>
        )}

        <button
          onClick={guardar}
          className="w-full bg-accent text-accent-ink py-3 rounded-lg text-sm font-medium mb-2"
        >
          Guardar video
        </button>

        {videoActual && (
          <button
            onClick={sacarVideo}
            className="w-full text-danger py-2 text-xs"
          >
            Quitar video
          </button>
        )}
      </div>
    </div>
  );
}
