/**
 * Pantalla de Progreso.
 *
 * Placeholder en esta entrega. Se implementa con calendario completo en
 * la Parte 3.
 */

import { Pantalla } from '@/components/Pantalla';
import { BottomBar } from '@/components/BottomBar';

export function PaginaProgreso() {
  return (
    <Pantalla>
      <div className="flex items-center justify-center px-5 pt-4 pb-2">
        <span className="text-fg font-medium">Progreso</span>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <div>
          <div className="text-5xl mb-4">📈</div>
          <h2 className="text-lg font-medium mb-2">Próximamente</h2>
          <p className="text-fg-muted text-sm">
            El calendario de progreso se habilita en la siguiente entrega,
            cuando ya tengas entrenamientos registrados.
          </p>
        </div>
      </div>
      <BottomBar />
    </Pantalla>
  );
}
