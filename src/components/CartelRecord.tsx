/**
 * Cartel de "¡Récord!" — aparece brevemente cuando se supera el peso
 * máximo anterior de un ejercicio. Solo visual, se cierra solo.
 */

import { useEffect } from 'react';

interface CartelRecordProps {
  peso: number;
  onCerrar: () => void;
}

export function CartelRecord({ peso, onCerrar }: CartelRecordProps) {
  useEffect(() => {
    const t = setTimeout(onCerrar, 2600);
    return () => clearTimeout(t);
  }, [onCerrar]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center px-4">
      <style>{`
        @keyframes record-in {
          0%   { transform: translateY(-24px) scale(0.9); opacity: 0; }
          15%  { transform: translateY(0) scale(1.04); opacity: 1; }
          25%  { transform: scale(1); }
          85%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-12px); }
        }
      `}</style>
      <div
        className="mt-3 rounded-2xl px-5 py-3 flex items-center gap-2.5 bg-fucsia text-white shadow-lg"
        style={{ animation: 'record-in 2.6s ease forwards' }}
      >
        <span className="text-xl">🔥</span>
        <div>
          <p className="font-display font-black text-sm uppercase tracking-wide leading-none">
            ¡Récord!
          </p>
          <p className="text-[11px] font-semibold opacity-90 mt-0.5">
            Superaste tu marca: {peso} kg
          </p>
        </div>
      </div>
    </div>
  );
}
