/**
 * Timer de descanso entre series.
 *
 * - Cuenta regresiva (60s por defecto).
 * - Color cyan (su único lugar en la app).
 * - Solo visual: al llegar a 0 hace una vibración suave si el dispositivo
 *   lo permite (sin sonido).
 * - La persona puede sumar +15s, reiniciar o cerrarlo.
 */

import { useEffect, useRef, useState } from 'react';

interface TimerDescansoProps {
  /** Segundos iniciales (default 60) */
  segundos?: number;
  /** Se llama cuando la persona cierra el timer */
  onCerrar: () => void;
}

export function TimerDescanso({ segundos = 60, onCerrar }: TimerDescansoProps) {
  const total = useRef(segundos);
  const [restante, setRestante] = useState(segundos);
  const [terminado, setTerminado] = useState(false);

  useEffect(() => {
    if (restante <= 0) {
      if (!terminado) {
        setTerminado(true);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate?.(180);
          } catch {
            /* algunos navegadores lo bloquean; no pasa nada */
          }
        }
      }
      return;
    }
    const t = setTimeout(() => setRestante((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [restante, terminado]);

  const mmss = `${Math.floor(restante / 60)}:${String(restante % 60).padStart(2, '0')}`;
  const pct = Math.max(0, (restante / total.current) * 100);

  const sumar15 = () => {
    total.current = total.current + 15;
    setRestante((r) => r + 15);
    setTerminado(false);
  };

  return (
    <div
      className="rounded-2xl px-4 py-3 mb-3 flex items-center gap-3"
      style={{
        background: 'rgba(23,201,212,0.10)',
        border: '1px solid rgba(23,201,212,0.45)',
        boxShadow: '0 0 22px rgba(23,201,212,0.16)',
      }}
    >
      <span className="text-cyan font-display font-extrabold text-sm whitespace-nowrap">
        {terminado ? '¡A darle! 💪' : `Descanso ${mmss}`}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-cyan/15 overflow-hidden">
        <div
          className="h-full bg-cyan rounded-full"
          style={{ width: `${pct}%`, transition: 'width 1s linear' }}
        />
      </div>
      {!terminado && (
        <button
          onClick={sumar15}
          className="text-cyan text-xs font-bold whitespace-nowrap"
          aria-label="Sumar 15 segundos"
        >
          +15s
        </button>
      )}
      <button
        onClick={onCerrar}
        className="text-cyan/70 text-lg leading-none"
        aria-label="Cerrar descanso"
      >
        ✕
      </button>
    </div>
  );
}
