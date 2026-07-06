/**
 * Indicador visual de intensidad de un ejercicio (1 a 5).
 *
 * Muestra 5 puntos; se rellenan tantos como la intensidad indicada.
 * Escala gris → negro: cuanto más intenso, más oscuro el punto.
 *
 * Los puntos que NO están rellenos se dibujan como un círculo hueco (con
 * borde), no como un punto del color del fondo. Antes, sobre el fondo claro
 * de la app, los niveles bajos y los puntos vacíos se confundían con el
 * fondo y "parecía todo lo mismo". Ahora siempre se ve cuántos puntos hay
 * (los 5 huecos como riel) y cuántos están encendidos.
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

/**
 * Rampa de gris a negro (posición 1 → 5).
 * Arranca en un gris medio (no clarito) para que el primer punto también se
 * vea sobre el fondo claro de la app.
 */
const RAMPA = ['#9c9a93', '#74726c', '#524f4b', '#34322f', '#161616'];

/** Color del borde de los puntos vacíos (visible sobre el fondo claro). */
const HUECO = '#b4b1ac';

export function Intensidad({ valor, tamano = 'sm', conEtiqueta = false }: IntensidadProps) {
  if (!valor || valor < 1) return null;

  const v = Math.min(5, Math.max(1, Math.round(valor)));
  const puntoClase = tamano === 'md' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5';
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
        {[1, 2, 3, 4, 5].map((i) => {
          const encendido = i <= v;
          return (
            <span
              key={i}
              className={`rounded-full box-border ${puntoClase}`}
              style={
                encendido
                  ? { backgroundColor: RAMPA[i - 1] }
                  : { backgroundColor: 'transparent', border: `1.5px solid ${HUECO}` }
              }
            />
          );
        })}
      </span>
    </span>
  );
}
