/**
 * Indicador visual de intensidad de un ejercicio (1 a 5).
 *
 * Muestra 5 puntos; se rellenan tantos como la intensidad indicada.
 * Escala gris → negro: cuanto más intenso, más oscuro el punto.
 *
 * Si no hay intensidad (undefined), no renderiza nada.
 */

interface IntensidadProps {
  valor?: number;
  /** 'sm' para listas, 'md' para la pantalla del ejercicio (más grande) */
  tamano?: 'sm' | 'md';
  /** Mostrar la palabra "Intensidad" al lado de los puntos */
  conEtiqueta?: boolean;
}

/** Rampa de gris claro a negro (posición 1 → 5). */
const RAMPA = ['#c4c2bd', '#9a988f', '#6e6c67', '#403e3b', '#161616'];

export function Intensidad({ valor, tamano = 'sm', conEtiqueta = false }: IntensidadProps) {
  if (!valor || valor < 1) return null;

  const v = Math.min(5, Math.max(1, Math.round(valor)));
  const puntoClase = tamano === 'md' ? 'w-3.5 h-3.5' : 'w-2 h-2';
  const gap = tamano === 'md' ? 'gap-1.5' : 'gap-1';

  return (
    <span className="inline-flex items-center gap-2" aria-label={`Intensidad ${v} de 5`}>
      {conEtiqueta && (
        <span
          className={`text-fg-muted uppercase tracking-wider ${
            tamano === 'md' ? 'text-xs' : 'text-[11px]'
          }`}
        >
          Intensidad
        </span>
      )}
      <span className={`inline-flex items-center ${gap}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`rounded-full ${puntoClase} ${i <= v ? '' : 'bg-bg-subtle'}`}
            style={i <= v ? { backgroundColor: RAMPA[i - 1] } : undefined}
          />
        ))}
      </span>
    </span>
  );
}
