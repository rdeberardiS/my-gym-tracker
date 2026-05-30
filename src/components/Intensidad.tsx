/**
 * Indicador visual de intensidad de un ejercicio (1 a 5).
 *
 * Muestra 5 puntos; se rellenan tantos como la intensidad indicada.
 * El color sube de tono con la intensidad para que se "lea" de un vistazo:
 *   1-2 = suave, 3 = media, 4-5 = exigente.
 *
 * Si no hay intensidad (undefined), no renderiza nada.
 */

interface IntensidadProps {
  valor?: number;
  /** 'sm' para listas, 'md' para la pantalla del ejercicio */
  tamano?: 'sm' | 'md';
  /** Mostrar la palabra "Intensidad" al lado de los puntos */
  conEtiqueta?: boolean;
}

function colorPorValor(valor: number): string {
  if (valor >= 4) return 'bg-amber-400';
  if (valor === 3) return 'bg-accent';
  return 'bg-emerald-600';
}

export function Intensidad({ valor, tamano = 'sm', conEtiqueta = false }: IntensidadProps) {
  if (!valor || valor < 1) return null;

  const v = Math.min(5, Math.max(1, Math.round(valor)));
  const puntoClase = tamano === 'md' ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5';
  const colorLleno = colorPorValor(v);

  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`Intensidad ${v} de 5`}>
      {conEtiqueta && (
        <span className="text-fg-muted text-[11px] uppercase tracking-wider">
          Intensidad
        </span>
      )}
      <span className="inline-flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`rounded-full ${puntoClase} ${
              i <= v ? colorLleno : 'bg-bg-subtle'
            }`}
          />
        ))}
      </span>
    </span>
  );
}
