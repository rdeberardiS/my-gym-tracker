/**
 * Pantalla de Importar Rutina.
 *
 * El usuario pega el texto que le pasó el coach. Al tocar "Interpretar
 * rutina" se parsea y se navega al Preview.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pantalla } from '@/components/Pantalla';
import { Header } from '@/components/Header';
import { parsearRutina } from '@/services/parser';
import { useImportacionStore } from '@/stores/importacionStore';
import { RUTAS } from '@/rutas';

const PLACEHOLDER = `Ejemplo:

Día 1 — Glúteo principal
Hip thrust pesado 5x6-8
Sentadilla goblet 3x12
...

Día 2 — Tren superior
Press banca 4x8
Remo con barra 4x8
...`;

export function PaginaImportar() {
  const navigate = useNavigate();
  const setTexto = useImportacionStore((s) => s.setTexto);
  const setResultado = useImportacionStore((s) => s.setResultado);
  const textoInicial = useImportacionStore((s) => s.textoOriginal);

  const [texto, setTextoLocal] = useState(textoInicial);
  const [procesando, setProcesando] = useState(false);

  const lineas = useMemo(
    () => texto.split('\n').filter((l) => l.trim().length > 0).length,
    [texto]
  );

  const puedeInterpretar = texto.trim().length > 10 && !procesando;

  const interpretar = () => {
    if (!puedeInterpretar) return;
    setProcesando(true);
    // Pequeño delay para que el botón muestre estado de carga
    setTimeout(() => {
      const resultado = parsearRutina(texto);
      setTexto(texto);
      setResultado(resultado);
      setProcesando(false);
      navigate(RUTAS.previewRutina);
    }, 200);
  };

  return (
    <Pantalla>
      <Header titulo="Importar rutina" atras={RUTAS.home} />

      <div className="px-5 py-6 flex-1">
        <h1 className="text-2xl font-medium tracking-tight mb-2">
          Pegá tu rutina
        </h1>
        <p className="text-fg-muted text-sm mb-6 leading-relaxed">
          La interpretamos automáticamente y armamos tus días de entrenamiento.
        </p>

        <textarea
          value={texto}
          onChange={(e) => setTextoLocal(e.target.value)}
          placeholder={PLACEHOLDER}
          className="w-full min-h-[260px] bg-bg-elevated border border-bg-subtle rounded-xl text-fg p-4 text-sm leading-relaxed resize-y font-sans placeholder:text-fg-subtle focus:outline-none focus:border-fg-muted"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />

        <p className="text-fg-subtle text-xs mt-2 text-right">
          {lineas} {lineas === 1 ? 'línea' : 'líneas'}
        </p>

        <button
          onClick={interpretar}
          disabled={!puedeInterpretar}
          className={`w-full mt-6 py-4 rounded-xl text-base font-medium transition-colors ${
            puedeInterpretar
              ? 'bg-accent text-accent-ink'
              : 'bg-bg-subtle text-fg-subtle border border-bg-subtle cursor-not-allowed'
          }`}
        >
          {procesando ? 'Interpretando...' : 'Interpretar rutina'}
        </button>

        <p className="text-fg-subtle text-xs text-center mt-4 leading-relaxed">
          No te preocupes si el formato no es perfecto. Después podés revisar y
          editar.
        </p>
      </div>
    </Pantalla>
  );
}
