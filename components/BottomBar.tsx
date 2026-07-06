import { Link, useLocation } from 'react-router-dom';
import { RUTAS } from '@/rutas';

export function BottomBar() {
  const location = useLocation();
  const esInicio = location.pathname === RUTAS.home;
  const esEjercicios = location.pathname === RUTAS.misEjercicios;
  const esProgreso = location.pathname === RUTAS.progreso;

  const claseTab = (activo: boolean) =>
    `flex-1 text-center py-3 ${activo ? 'text-fucsia' : 'text-fg-subtle'}`;

  return (
    <div
      className="border-t border-bg-subtle bg-bg-elevated flex sticky bottom-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <Link to={RUTAS.home} className={claseTab(esInicio)}>
        <svg className="mx-auto mb-1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V9.5z" />
        </svg>
        <span className="text-[11px] font-semibold">Inicio</span>
      </Link>

      <Link to={RUTAS.misEjercicios} className={claseTab(esEjercicios)}>
        <svg className="mx-auto mb-1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 6.5l11 11M21 21l-1.5-1.5M3 3l1.5 1.5M18 5l1 1M5 18l1 1M7 4L4 7l3 3M17 20l3-3-3-3" />
        </svg>
        <span className="text-[11px] font-semibold">Ejercicios</span>
      </Link>

      <Link to={RUTAS.progreso} className={claseTab(esProgreso)}>
        <svg className="mx-auto mb-1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18M7 14l4-4 4 4 5-5" />
        </svg>
        <span className="text-[11px] font-semibold">Progreso</span>
      </Link>
    </div>
  );
}
