/**
 * Componente raíz de la app.
 * Configura el router y todas las rutas principales.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PaginaHome } from './pages/PaginaHome';
import { PaginaImportar } from './pages/PaginaImportar';
import { PaginaPreviewRutina } from './pages/PaginaPreviewRutina';
import { PaginaProgreso } from './pages/PaginaProgreso';
import { PaginaEntrenamiento } from './pages/PaginaEntrenamiento';
import { PaginaEjercicio } from './pages/PaginaEjercicio';
import { PaginaResumenEntreno } from './pages/PaginaResumenEntreno';
import { RUTAS } from './rutas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={RUTAS.home} element={<PaginaHome />} />
        <Route path={RUTAS.importar} element={<PaginaImportar />} />
        <Route path={RUTAS.previewRutina} element={<PaginaPreviewRutina />} />
        <Route path={RUTAS.progreso} element={<PaginaProgreso />} />
        <Route path={`${RUTAS.entrenamiento}/:diaRutinaId`} element={<PaginaEntrenamiento />} />
        <Route path={`${RUTAS.entrenamiento}/:diaRutinaId/ejercicio/:ejercicioEnDiaId`} element={<PaginaEjercicio />} />
        <Route path={RUTAS.resumenEntreno} element={<PaginaResumenEntreno />} />
        <Route path="*" element={<Navigate to={RUTAS.home} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
