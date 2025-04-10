import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CrearTurno = () => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [area, setArea] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const url = "https://turnero-pi.vercel.app";

  // Función para obtener la fecha y hora actual
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje('');

    if (!tipo) {
      setMensaje("Por favor selecciona un tipo de turno");
      setCargando(false);
      return;
    }

    if (tipo === 'compra' && !area) {
      setMensaje("Por favor selecciona un área");
      setCargando(false);
      return;
    }

    const turno = {
      nombre,
      tipo,
      area: tipo === 'compra' ? area : '',
      fecha: obtenerFechaActual(),
      hora: obtenerHoraActual(),
    };

    try {
      const response = await axios.post(`${url}/api/turnos`, turno);
      setCargando(false);
      if (response.status === 201) {
        setMensaje(`Turno agregado exitosamente para ${response.data.turno.nombre}`);
        setTimeout(() => setMensaje(""), 2000);
      } else {
        setMensaje('Hubo un problema al agregar el turno');
      }
    } catch (error) {
      setCargando(false);
      console.error('Error al agregar turno:', error);
      setMensaje('Hubo un problema al agregar el turno');
    }
  };

  const handleVolver = () => {
    setTipo('');
    setArea('');
    setNombre('');
    setMensaje('');
  };

  return (
    <div className="container mx-auto p-6 max-w-md bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Reservar un turno</h1>

      {mensaje && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border-l-4 border-red-500">
          <p className="text-red-700">{mensaje}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Botón Volver - REDUCIDO DE TAMAÑO */}
        {(tipo || area) && (
          <button
            type="button"
            onClick={handleVolver}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm transition-colors duration-300 hover:bg-gray-700 flex items-center justify-center ml-auto mr-0"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Volver
          </button>
        )}

        {/* Selección de Tipo */}
        {!tipo && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl text-center text-gray-600 font-medium mb-2">Seleccione tipo de turno</h2>
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={() => setTipo('reclamo')}
                className="w-40 h-40 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex flex-col items-center justify-center text-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md"
              >
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Reclamo
              </button>
              <button
                type="button"
                onClick={() => setTipo('compra')}
                className="w-40 h-40 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl flex flex-col items-center justify-center text-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md"
              >
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                Compra
              </button>
            </div>
          </div>
        )}

        {/* Selección de Área (Solo si el tipo es Compra) */}
        {tipo === 'compra' && !area && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl text-center text-gray-600 font-medium mb-2">Seleccione un área</h2>
            <div className="grid grid-cols-3 gap-4 justify-center">
              <button
                type="button"
                onClick={() => setArea('área 1')}
                className="h-32 bg-gradient-to-br from-yellow-400 to-yellow-500 text-white rounded-xl flex items-center justify-center text-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-md"
              >
                Área 1
              </button>
              <button
                type="button"
                onClick={() => setArea('área 2')}
                className="h-32 bg-gradient-to-br from-yellow-400 to-yellow-500 text-white rounded-xl flex items-center justify-center text-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-md"
              >
                Área 2
              </button>
              <button
                type="button"
                onClick={() => setArea('área 3')}
                className="h-32 bg-gradient-to-br from-yellow-400 to-yellow-500 text-white rounded-xl flex items-center justify-center text-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-md"
              >
                Área 3
              </button>
            </div>
          </div>
        )}

        {/* Input para Nombre */}
        {(tipo === 'reclamo' || (tipo === 'compra' && area)) && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <label className="block text-lg font-medium text-gray-700 mb-2">Nombre y apellido</label>
            <div className="relative">
              <svg className="w-6 h-6 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                required
                placeholder="Ingrese su nombre completo"
              />
            </div>
          </div>
        )}

        {/* Botón Agregar Turno */}
        {(tipo && (tipo === 'reclamo' || area)) && (
          <button
            type="submit"
            className={`w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-lg font-medium transition-all duration-300 hover:from-blue-700 hover:to-blue-800 ${
              cargando ? 'opacity-50 cursor-not-allowed' : 'transform hover:-translate-y-1'
            } shadow-md flex items-center justify-center`}
            disabled={cargando}
          >
            {cargando ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Agregar Turno
              </>
            )}
          </button>
        )}
      </form>

      {/* Info de selección */}
      {(tipo || area) && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col gap-2">
            {tipo && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Tipo seleccionado:</span> {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </p>
            )}
            {area && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Área seleccionada:</span> {area.charAt(0).toUpperCase() + area.slice(1)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearTurno;