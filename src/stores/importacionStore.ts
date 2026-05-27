/**
 * Store para la rutina que se está importando.
 *
 * Mantiene en memoria los datos parseados entre la pantalla de Importar
 * y la pantalla de Preview, así no hay que volver a parsear.
 */

import { create } from 'zustand';
import type { ResultadoParser, DiaParseado } from '@/types/parser';

interface ImportacionStore {
  textoOriginal: string;
  resultado: ResultadoParser | null;

  setTexto: (texto: string) => void;
  setResultado: (resultado: ResultadoParser) => void;
  actualizarDias: (dias: DiaParseado[]) => void;
  limpiar: () => void;
}

export const useImportacionStore = create<ImportacionStore>((set) => ({
  textoOriginal: '',
  resultado: null,

  setTexto: (texto) => set({ textoOriginal: texto }),
  setResultado: (resultado) => set({ resultado }),
  actualizarDias: (dias) =>
    set((state) =>
      state.resultado
        ? { resultado: { ...state.resultado, dias } }
        : state
    ),
  limpiar: () => set({ textoOriginal: '', resultado: null }),
}));
