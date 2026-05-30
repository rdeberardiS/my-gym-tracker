/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ============================================================
        // Tema "Café con Leche" (claro, cálido, chic)
        // ============================================================
        bg: {
          DEFAULT: '#f3ebe4', // crema (fondo)
          elevated: '#fffaf6', // tarjetas (casi blanco cálido)
          subtle: '#e7dace', // bordes / separadores suaves
        },
        fg: {
          DEFAULT: '#3b2f2a', // cocoa (texto principal)
          muted: '#8a7a70', // texto secundario
          subtle: '#b0a298', // texto terciario / placeholders
        },
        accent: {
          DEFAULT: '#c97b84', // rosa palo (acción principal)
          muted: '#f6e3e4', // rosa muy suave (fondos/chips)
          ink: '#ffffff', // texto sobre el acento
        },
        // Estados (adaptados a la paleta cálida)
        warn: {
          DEFAULT: '#d8a24a', // ámbar cálido
          muted: '#f4e6cc',
          ink: '#5a4215',
        },
        danger: {
          DEFAULT: '#cf6b63', // rojo cálido
          muted: '#f6ddd9',
          ink: '#5c2520',
        },
        sage: {
          DEFAULT: '#8fa36b', // verde salvia (cumplí la semana)
          muted: '#e4ead4',
          ink: '#2c3814',
        },
        caramel: {
          DEFAULT: '#d9b08c', // caramelo (no llegué / dorado)
          muted: '#f1e4d4',
          ink: '#4a3411',
        },
        brown: '#b08968', // marrón suave (detalles)
        line: '#e2d4c6', // línea/borde cálido
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
