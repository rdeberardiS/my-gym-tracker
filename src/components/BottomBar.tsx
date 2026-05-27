import { Link, useLocation } from 'react-router-dom';
import { RUTAS } from '@/rutas';

export function BottomBar() {
  const location = useLocation();
  const esInicio = location.pathname === RUTAS.home;
  const esProgreso = location.pathname === RUTAS.progreso;

  return (
    <div
      className="border-t border-bg-subtle bg-bg flex sticky bottom-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <Link
        to={RUTAS.home}
        className={`flex-1 text-center py-3 ${
          esInicio ? 'text-accent' : 'text-fg-subtle'
        }`}
      >
        <svg
          className="mx-auto mb-1"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V9.5z" />
        </svg>
        <span className="text-[11px]">Inicio</span>
      </Link>
      <Link
        to={RUTAS.progreso}
        className={`flex-1 text-center py-3 ${
          esProgreso ? 'text-accent' : 'text-fg-subtle'
        }`}
      >
        <svg
          className="mx-auto mb-1"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18M7 14l4-4 4 4 5-5" />
        </svg>
        <span className="text-[11px]">Progreso</span>
      </Link>
    </div>
  );
}
