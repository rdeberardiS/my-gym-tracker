/**
 * Confeti decorativo. Cae durante unos segundos al montarse.
 * Solo visual, sin dependencias externas. Pensado para celebraciones.
 */

import { useMemo } from 'react';

const COLORES = ['#c2f000', '#ff2486', '#17c9d4', '#161616', '#ffd23f'];

interface ConfetiProps {
  /** Cantidad de papelitos (default 80) */
  cantidad?: number;
}

export function Confeti({ cantidad = 80 }: ConfetiProps) {
  const piezas = useMemo(
    () =>
      Array.from({ length: cantidad }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.8;
        const dur = 2.4 + Math.random() * 1.8;
        const size = 7 + Math.random() * 7;
        const color = COLORES[i % COLORES.length];
        const giro = Math.random() * 360;
        return { left, delay, dur, size, color, giro, i };
      }),
    [cantidad]
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden z-[60]"
    >
      <style>{`
        @keyframes confeti-caer {
          0%   { transform: translateY(-12vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(112vh) rotate(720deg); opacity: 1; }
        }
      `}</style>
      {piezas.map((p) => (
        <span
          key={p.i}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            background: p.color,
            borderRadius: '2px',
            transform: `rotate(${p.giro}deg)`,
            animation: `confeti-caer ${p.dur}s linear ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
