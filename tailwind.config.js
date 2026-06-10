/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ============================================================
        // Tema "Power" — claro, atlético (blanco · negro · lima · fucsia)
        // ============================================================
        bg: {
          DEFAULT: '#e7e4df', // gris claro (fondo, un poco menos blanco)
          elevated: '#ffffff', // tarjetas (blanco)
          subtle: '#e4e2de', // bordes / separadores suaves
        },
        fg: {
          DEFAULT: '#161616', // negro (texto principal)
          muted: '#8c8c8c', // texto secundario
          subtle: '#b4b1ac', // texto terciario / placeholders
        },
        // Acento principal: LIMA (manda). Se usa de fondo; el texto encima va oscuro.
        accent: {
          DEFAULT: '#c2f000', // lima eléctrica (acción principal, anillo)
          muted: '#eef7c0', // lima muy suave (fondos/chips)
          ink: '#161616', // texto sobre la lima (oscuro, legible)
        },
        // Acento secundario: FUCSIA (toques). Legible como texto sobre claro.
        fucsia: {
          DEFAULT: '#ff2486',
          muted: '#ffe0ee',
          ink: '#ffffff',
        },
        // Cyan: solo para el timer de descanso / "en progreso"
        cyan: {
          DEFAULT: '#17c9d4',
          muted: '#d6f6f8',
          ink: '#08343a',
        },
        // Estados
        warn: {
          DEFAULT: '#e6a100', // ámbar
          muted: '#fdf0cc',
          ink: '#4a3600',
        },
        danger: {
          DEFAULT: '#e23b6d', // rojo-rosado (alerta)
          muted: '#ffe1ea',
          ink: '#5c0f24',
        },
        // Calendario: cumplí la semana = lima · entrené pero no llegué = fucsia
        sage: {
          DEFAULT: '#c2f000',
          muted: '#eef7c0',
          ink: '#161616',
        },
        caramel: {
          DEFAULT: '#ff2486',
          muted: '#ffe0ee',
          ink: '#ffffff',
        },
        brown: '#8c8c8c',
        line: '#e4e2de',
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Archivo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
