import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  titulo: string;
  /** Si se pasa, el botón atrás navega a esta ruta. Si no, va atrás en el historial. */
  atras?: string;
  /** Etiqueta del botón atrás. Default: "Atrás" */
  etiquetaAtras?: string;
  /** Acción opcional a la derecha */
  accionDerecha?: React.ReactNode;
}

export function Header({
  titulo,
  atras,
  etiquetaAtras = 'Atrás',
  accionDerecha,
}: HeaderProps) {
  const navigate = useNavigate();

  const irAtras = () => {
    if (atras) {
      navigate(atras);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-bg-subtle">
      <button
        onClick={irAtras}
        className="text-fucsia text-sm flex items-center gap-1 py-1 min-w-[60px]"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>{etiquetaAtras}</span>
      </button>
      <span className="text-fg font-medium text-base">{titulo}</span>
      <div className="min-w-[60px] flex justify-end">{accionDerecha}</div>
    </div>
  );
}
