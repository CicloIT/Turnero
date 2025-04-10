import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Turnero = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/turnos');
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
      const response = await axios.put(`http://localhost:8000/api/turnos/${id}/estado`, { estado: nuevoEstado });

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
      await axios.delete(`http://localhost:8000/api/turnos/eliminar/${id}`);
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

  if (loading) return <div className="text-center mt-10">Cargando turnos...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>;


  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Gestión de Turnos</h2>

      {turnos.length === 0 ? (
        <p className="text-center text-gray-500">No hay turnos disponibles</p>
      ) : (
        <div className="overflow-x-auto">
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
              {turnos.map((turno) => (
                <tr key={turno.id} className="border-b">
                  <td className="py-2 px-4">{turno.nombre}</td>
                  <td className="py-2 px-4">{turno.fecha}</td>
                  <td className="py-2 px-4">{turno.hora}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(turno.estado)}`}>
                      {turno.estado}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    {renderAcciones(turno)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Turnero;
