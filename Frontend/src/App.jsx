import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import CrearTurno from './CrearTurno'
import Turnero from './Turnero'
import './Tailwond.css'
function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 bg-gray-100">
        <ul className="flex gap-4">
          <li>
            <Link to="/crear" className="text-blue-600 hover:text-blue-800">Crear Turno</Link>
          </li>
          <li>
            <Link to="/ver" className="text-blue-600 hover:text-blue-800">Ver Turnos</Link>
          </li>
        </ul>
      </nav>

      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<div>Bienvenido al sistema de turnos</div>} />
          <Route path="/crear" element={<CrearTurno />} />
          <Route path="/ver" element={<Turnero />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App