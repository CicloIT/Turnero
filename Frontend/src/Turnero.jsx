import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Turnero = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const url = "https://turnero-pi.vercel.app";
  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        const response = await axios.get(`${url}/api/turnos`);
        const data = response.data;
        console.log(data);
        setTurnos(data);
        setLoading(false);
      } catch (error) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    }
    fetchTurnos();
  }, []);

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const response = await axios.put(`${url}/api/turnos/${id}/estado`, { estado: nuevoEstado });

      // Actualizar la lista de turnos
      setTurnos(turnos.map(turno =>
        turno.id === id ? response.data.turno : turno
      ));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // Eliminar turno
  const eliminarTurno = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este turno?')) {
      return;
    }

    try {
      await axios.delete(`${url}/api/turnos/eliminar/${id}`);
      // Actualizar la lista de turnos eliminando el turno
      setTurnos(turnos.filter(turno => turno.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };


  const renderAcciones = (turno) => {
    switch (turno.estado) {
      case 'en espera':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => cambiarEstado(turno.id, 'atendiendo')}
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              Atender
            </button>
            <button
              onClick={() => eliminarTurno(turno.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Eliminar
            </button>
          </div>
        );
      case 'atendiendo':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => cambiarEstado(turno.id, 'atendido')}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Finalizar
            </button>
          </div>
        );
      case 'atendido':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => eliminarTurno(turno.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Eliminar
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  // Obtener color de estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'en espera': return 'bg-blue-100 text-blue-800';
      case 'atendiendo': return 'bg-yellow-100 text-yellow-800';
      case 'atendido': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTablaTurnos = (turnosFiltrados) => (
    <div className="overflow-x-auto mb-10">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-left">Nombre</th>
            <th className="py-2 px-4 text-left">Fecha</th>
            <th className="py-2 px-4 text-left">Hora</th>
            <th className="py-2 px-4 text-left">Estado</th>
            <th className="py-2 px-4 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {turnosFiltrados.map((turno) => (
            <tr key={turno.id} className="border-b">
              <td className="py-2 px-4">{turno.nombre}</td>
              <td className="py-2 px-4">{turno.fecha}</td>
              <td className="py-2 px-4">{turno.hora}</td>
              <td className="py-2 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(turno.estado)}`}>
                  {turno.estado}
                </span>
              </td>
              <td className="py-2 px-4">{renderAcciones(turno)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const turnosReclamo = turnos.filter(t => t.tipo === 'reclamo');
  const turnosCompra = turnos.filter(t => t.tipo === 'compra');
  const areas = ['área 1', 'área 2', 'área 3'];

  if (loading) return <div className="text-center mt-10">Cargando turnos...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>;


  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Gestión de Turnos</h2>

      {turnos.length === 0 ? (
        <p className="text-center text-gray-500">No hay turnos disponibles</p>
      ) : (
        <>
          <h3 className="text-xl font-semibold mb-4 text-blue-700">Turnos de Reclamo</h3>
          {renderTablaTurnos(turnosReclamo)}

          <h3 className="text-xl font-semibold mb-4 text-green-700">Turnos de Compra</h3>
          {areas.map(area => {
            const turnosArea = turnosCompra.filter(t => t.area === area);
            return (
              <div key={area}>
                <h4 className="text-lg font-semibold mb-2 text-gray-700">{area.toUpperCase()}</h4>
                {turnosArea.length > 0 ? renderTablaTurnos(turnosArea) : <p className="text-sm text-gray-500 mb-6">No hay turnos en esta área.</p>}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default Turnero;
