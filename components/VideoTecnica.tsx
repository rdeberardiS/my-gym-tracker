/**
 * Reproductor de video liviano para gimnasios con poca señal.
 *
 * Problema que resuelve: el reproductor embebido de YouTube pesa mucho y, con
 * datos lentos, queda en negro sin avisar nada. Acá mostramos primero la
 * MINIATURA (una sola imagen liviana) con un botón de play. Recién cuando la
 * usuaria toca play, cargamos el reproductor pesado. Así casi no gasta datos
 * hasta que de verdad quiere ver el video.
 *
 * Además ofrecemos "Abrir en YouTube", que funciona mejor con mala señal y
 * abre directamente la app de YouTube (que puede tener el video cacheado).
 */

import { useState } from 'react';
import { urlEmbed, urlMiniatura, urlWatch } from '@/services/catalogo/catalogoVideos';

interface VideoTecnicaProps {
  videoUrl: string;
  nombreEjercicio: string;
}

export function VideoTecnica({ videoUrl, nombreEjercicio }: VideoTecnicaProps) {
  const [reproduciendo, setReproduciendo] = useState(false);
  const [miniaturaFallo, setMiniaturaFallo] = useState(false);

  const embed = urlEmbed(videoUrl);
  const miniatura = urlMiniatura(videoUrl);
  const watch = urlWatch(videoUrl);

  if (!embed) return null;

  return (
    <div className="mb-4">
      <div className="rounded-xl overflow-hidden bg-black aspect-video relative">
        {reproduciendo ? (
          <iframe
            src={`${embed}&autoplay=1`}
            title={`Video de ${nombreEjercicio}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <button
            onClick={() => setReproduciendo(true)}
            className="w-full h-full relative flex items-center justify-center group"
            aria-label="Reproducir video de técnica"
          >
            {miniatura && !miniaturaFallo && (
              <img
                src={miniatura}
                alt=""
                loading="lazy"
                onError={() => setMiniaturaFallo(true)}
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
            )}
            {/* Botón de play encima */}
            <span className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-black/60 border border-white/20">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>

      {/* Alternativa: abrir en YouTube (mejor con mala señal) */}
      {watch && (
        <a
          href={watch}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-center text-fg-muted text-xs underline underline-offset-2 active:text-fg"
        >
          ¿No carga? Abrir en YouTube
        </a>
      )}
    </div>
  );
}
