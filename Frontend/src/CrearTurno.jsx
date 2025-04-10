import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';

const CrearTurno = () => {
   const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate(); 
  const url = "https://turnero-pi.vercel.app/";
  // Función para obtener la fecha actual en formato DD/MM/YYYY
  const obtenerFechaActual = () => {
    const fechaActual = new Date();
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaActual.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  const obtenerHoraActual = () => {
    const fechaActual = new Date();
    const hora = fechaActual.getHours().toString().padStart(2, '0');
    const minutos = fechaActual.getMinutes().toString().padStart(2, '0');
    return `${hora}:${minutos}`;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje('');

    // Crear objeto con los datos del turno (fecha actual + nombre)
    const turno = { nombre, fecha: obtenerFechaActual(),hora: obtenerHoraActual() };

    try {
      const response = await axios.post(`${url}/api/turnos`, turno);
      setCargando(false);
      if (response.status === 201 ) {
        setMensaje(`Turno agregado exitosamente: ${response.data.turno.nombre} - ${response.data.turno.fecha}`);
        setTimeout(() => {
          navigate('/ver');
        }, 2000); 
      } else {
        setMensaje('Hubo un problema al agregar el turno');
      }
    } catch (error) {
      setCargando(false);
      console.error('Error al agregar turno:', error);
      setMensaje('Hubo un problema al agregar el turno');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reservar un turno</h1>

      {mensaje && <p className="text-lg mb-4">{mensaje}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nombre y apellido</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className={`w-full p-2 bg-blue-500 text-white rounded ${cargando ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={cargando}
        >
          {cargando ? 'Cargando...' : 'Agregar Turno'}
        </button>
      </form>
    </div>
  );
};

export default CrearTurno;
