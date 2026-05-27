import type { ReactNode } from 'react';

interface PantallaProps {
  children: ReactNode;
  /** Si true, no agrega padding inferior (útil cuando hay bottom bar) */
  sinPaddingInferior?: boolean;
}

/**
 * Layout base para todas las pantallas.
 * Centra el contenido en mobile, asegura background oscuro y safe area.
 */
export function Pantalla({ children, sinPaddingInferior = false }: PantallaProps) {
  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col">
      <div
        className={`flex-1 flex flex-col w-full max-w-md mx-auto ${
          sinPaddingInferior ? '' : 'pb-6'
        }`}
        style={{
          paddingTop: 'env(safe-area-inset-top, 0)',
          paddingLeft: 'env(safe-area-inset-left, 0)',
          paddingRight: 'env(safe-area-inset-right, 0)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
