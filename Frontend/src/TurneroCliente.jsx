import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TurneroCliente = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ultimoLlamado, setUltimoLlamado] = useState(null);
  const url = "https://turnero-pi.vercel.app";

  // Función para obtener los turnos desde la API
  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        const response = await axios.get(`${url}/api/turnos`);
        
        // Verificar si algún turno cambió a "atendiendo" para mostrar notificación
        if (turnos.length > 0) {
          const nuevoAtendiendo = response.data.find(
            t => t.estado === 'atendiendo' && 
            !turnos.find(oldT => oldT.id === t.id && oldT.estado === 'atendiendo')
          );
          
          if (nuevoAtendiendo) {
            setUltimoLlamado(nuevoAtendiendo);
            // Reproducir sonido si está disponible
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Error reproduciendo audio:', e));
            
            // Reiniciar después de 10 segundos
            setTimeout(() => setUltimoLlamado(null), 10000);
          }
        }
        
        setTurnos(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchTurnos();
    
    // Configurar intervalo para refrescar los datos cada 5 segundos
    const interval = setInterval(fetchTurnos, 5000);
    
    return () => clearInterval(interval);
  }, [turnos]);

  // Función para mostrar los turnos por tipo y área
  const renderTurnosList = (turnosFiltrados) => {
    if (turnosFiltrados.length === 0) {
      return <p className="text-sm text-gray-500 mb-2">No hay turnos en espera.</p>;
    }

    // Ordenamos por hora de llegada (más antiguos primero)
    const turnosOrdenados = [...turnosFiltrados].sort((a, b) => {
      const timeA = new Date(`2000-01-01 ${a.hora}`).getTime();
      const timeB = new Date(`2000-01-01 ${b.hora}`).getTime();
      return timeA - timeB;
    });

    return (
      <div className="space-y-3">
        {turnosOrdenados.map((turno) => (
          <div 
            key={turno.id}
            className={`p-4 rounded-lg shadow-sm border-l-4 flex justify-between items-center ${
              turno.estado === 'en espera' ? 'border-l-blue-500 bg-blue-50' : 'border-l-green-500 bg-green-50'
            }`}
          >
            <div>
              <h4 className="font-semibold text-lg">{turno.nombre}</h4>
              <div className="text-sm text-gray-600">
                <span>Turno tomado: {turno.hora}</span>
                {turno.tipo === 'compra' && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full">{turno.area.toUpperCase()}</span>}
                {turno.tipo === 'reclamo' && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 rounded-full">RECLAMO</span>}
              </div>
            </div>
            <div>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                En espera
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Filtrar turnos por estado
  const turnosAtendiendo = turnos.filter(t => t.estado === 'atendiendo');
  const turnosEnEspera = turnos.filter(t => t.estado === 'en espera');

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
      <p className="font-medium">Error al cargar los turnos</p>
      <p className="text-sm">{error}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 bg-white rounded-lg shadow-lg">
      {/* Notificación de nuevo cliente llamado */}
      {ultimoLlamado && (
        <div className="fixed top-4 right-4 left-4 bg-yellow-500 text-white p-4 rounded-lg shadow-lg z-50 animate-bounce">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              <div>
                <p className="font-bold text-xl">¡LLAMANDO A {ultimoLlamado.nombre.toUpperCase()}!</p>
                <p className="text-sm">
                  {ultimoLlamado.tipo === 'compra' 
                    ? `Para compra en ${ultimoLlamado.area.toUpperCase()}` 
                    : 'Para atender su reclamo'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Turnos</h1>
        <p className="text-gray-600 mt-2">Estado actual de los clientes</p>
      </header>

      {/* Panel Informativo con Totales */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-blue-800 font-medium text-lg">Clientes en espera</p>
          <p className="text-3xl font-bold text-blue-700">{turnosEnEspera.length}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <p className="text-yellow-800 font-medium text-lg">Siendo atendidos</p>
          <p className="text-3xl font-bold text-yellow-700">{turnosAtendiendo.length}</p>
        </div>
      </div>

      {/* Clientes siendo atendidos */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-yellow-700 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          LLAMANDO AHORA
        </h2>
        
        {turnosAtendiendo.length === 0 ? (
          <p className="text-center text-gray-500 p-6 bg-gray-50 rounded-lg">No hay clientes siendo atendidos en este momento</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {turnosAtendiendo.map(turno => (
              <div key={turno.id} className="flex flex-col p-4 bg-yellow-100 rounded-lg shadow-md border-l-4 border-yellow-500 animate-pulse">
                <div className="bg-yellow-500 text-white px-4 py-2 rounded-t-lg font-bold text-center text-xl mb-3">
                  ¡SU TURNO!
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">{turno.nombre}</h3>
                    <p className="text-gray-700">
                      {turno.tipo === 'compra' 
                        ? <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-sm font-medium">Compra - {turno.area.toUpperCase()}</span>
                        : <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-sm font-medium">Reclamo</span>
                      }
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Turno tomado: {turno.hora}</p>
                  </div>
                  <div className="text-5xl font-bold text-yellow-700">
                    {turno.tipo === 'compra' ? turno.area.charAt(0).toUpperCase() : 'R'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clientes en espera */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-700 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          CLIENTES EN ESPERA
        </h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          {renderTurnosList(turnosEnEspera)}
        </div>
      </div>
      
      {/* Tiempo de actualización */}
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Los datos se actualizan automáticamente cada 5 segundos</p>
      </div>
    </div>
  );
};

export default TurneroCliente;