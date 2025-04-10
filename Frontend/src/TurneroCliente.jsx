import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TurneroCliente = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const url = "https://turnero-pi.vercel.app";

  // Función para obtener los turnos desde la API
  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        const response = await axios.get(`${url}/api/turnos`);
        setTurnos(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchTurnos();
    
    // Configurar intervalo para refrescar los datos cada 10 segundos
    const interval = setInterval(fetchTurnos, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Obtener colores para los diferentes estados
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'en espera': return 'bg-blue-100 text-blue-800';
      case 'atendiendo': return 'bg-yellow-100 text-yellow-800';
      case 'atendido': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para mostrar los turnos por tipo y área
  const renderTurnosList = (turnosFiltrados, area) => {
    if (turnosFiltrados.length === 0) {
      return <p className="text-sm text-gray-500 mb-2">No hay turnos en espera.</p>;
    }

    // Ordenamos para mostrar primero los que están siendo atendidos
    const turnosOrdenados = [...turnosFiltrados].sort((a, b) => {
      if (a.estado === 'atendiendo' && b.estado !== 'atendiendo') return -1;
      if (a.estado !== 'atendiendo' && b.estado === 'atendiendo') return 1;
      return 0;
    });

    return (
      <div className="space-y-2 mb-4">
        {turnosOrdenados.map((turno) => (
          <div 
            key={turno.id}
            className={`p-4 rounded-lg shadow-sm border-l-4 flex justify-between items-center ${
              turno.estado === 'atendiendo' 
                ? 'border-l-yellow-500 bg-yellow-50 animate-pulse' 
                : turno.estado === 'en espera'
                  ? 'border-l-blue-500 bg-blue-50'
                  : 'border-l-green-500 bg-green-50'
            }`}
          >
            <div>
              <h4 className="font-semibold text-lg">{turno.nombre}</h4>
              <p className="text-sm text-gray-600">Turno tomado: {turno.hora}</p>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(turno.estado)}`}>
                {turno.estado === 'atendiendo' ? '¡LLAMANDO!' : turno.estado}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Filtrar turnos por tipo y estado (excluyendo los ya atendidos)
  const turnosReclamo = turnos.filter(t => t.tipo === 'reclamo' && t.estado !== 'atendido');
  const turnosCompra = turnos.filter(t => t.tipo === 'compra' && t.estado !== 'atendido');
  
  // Áreas para turnos de compra
  const areas = ['área 1', 'área 2', 'área 3'];

  // Obtener números totales
  const turnosAtendiendoReclamo = turnosReclamo.filter(t => t.estado === 'atendiendo').length;
  const turnosEnEsperaReclamo = turnosReclamo.filter(t => t.estado === 'en espera').length;

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
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Lista de Turnos</h1>
        <p className="text-gray-600 mt-2">Estado actual de los turnos en espera</p>
      </header>

      {/* Panel Informativo con Totales */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-blue-800 font-medium text-lg">En espera</p>
          <p className="text-3xl font-bold text-blue-700">{turnosEnEsperaReclamo + turnosCompra.filter(t => t.estado === 'en espera').length}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <p className="text-yellow-800 font-medium text-lg">Siendo atendidos</p>
          <p className="text-3xl font-bold text-yellow-700">{turnosAtendiendoReclamo + turnosCompra.filter(t => t.estado === 'atendiendo').length}</p>
        </div>
      </div>

      {/* Turnos siendo atendidos - Destacados */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-yellow-700 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          Llamando Ahora
        </h2>
        
        {turnos.filter(t => t.estado === 'atendiendo').length === 0 ? (
          <p className="text-center text-gray-500 p-6 bg-gray-50 rounded-lg">No hay clientes siendo atendidos en este momento</p>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            {turnos.filter(t => t.estado === 'atendiendo').map(turno => (
              <div key={turno.id} className="flex justify-between items-center p-4 bg-white rounded-lg shadow-md border-l-4 border-yellow-500 mb-2 animate-pulse">
                <div>
                  <h3 className="text-xl font-bold">{turno.nombre}</h3>
                  <p className="text-gray-600">
                    {turno.tipo === 'compra' ? `Compra - ${turno.area.toUpperCase()}` : 'Reclamo'}
                  </p>
                </div>
                <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold">
                  ¡SU TURNO!
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección de Reclamos */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-700 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Reclamos
        </h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          {renderTurnosList(turnosReclamo.filter(t => t.estado !== 'atendiendo'), 'reclamo')}
        </div>
      </div>

      {/* Secciones por Áreas de Compra */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-green-700 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
          </svg>
          Compras
        </h2>
        
        {areas.map(area => {
          const turnosArea = turnosCompra.filter(t => t.area === area && t.estado !== 'atendiendo');
          return (
            <div key={area} className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-gray-700">{area.toUpperCase()}</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {renderTurnosList(turnosArea, area)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TurneroCliente;