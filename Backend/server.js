import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta del directorio actual correctamente en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8000;

// Configuración de CORS
app.use(cors());
app.use(bodyParser.json());
/*
// Ruta para obtener los turnos
app.get('/api/turnos', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'turnos.json');
  
  console.log(`Leyendo archivo en: ${filePath}`);

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo:', err);
      return res.status(500).json({ message: 'Error al leer los datos' });
    }

    console.log('Archivo leído con éxito');

    try {
      const turnos = JSON.parse(data);
      return res.json(turnos);
    } catch (parseError) {
      console.error('Error al parsear JSON:', parseError);
      return res.status(500).json({ message: 'Error al procesar los datos' });
    }
  });
});

app.post('/api/turnos', (req, res) => {
    const nuevoTurno = req.body;
    
    // Validación básica
    if (!nuevoTurno.nombre) {
      return res.status(400).json({ message: 'Se requiere nombre para el turno' });
    }

    const fechaActual = new Date();

    // Si no se proporciona fecha, usar la fecha actual
    if (!nuevoTurno.fecha) {
      const dia = fechaActual.getDate().toString().padStart(2, '0');
      const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
      const anio = fechaActual.getFullYear();
      nuevoTurno.fecha = `${dia}/${mes}/${anio}`;
    }
    
    
    if (!nuevoTurno.hora) {
      const hora = fechaActual.getHours().toString().padStart(2, '0');
      const minutos = fechaActual.getMinutes().toString().padStart(2, '0');
      nuevoTurno.hora = `${hora}:${minutos}`;
    }

    nuevoTurno.estado = 'en espera';
    
    const filePath = path.join(__dirname, 'data', 'turnos.json');
    
    // Leer el archivo actual
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        // Si el archivo no existe, creamos un array vacío
        if (err.code === 'ENOENT') {
          const nuevosTurnos = [nuevoTurno];
          
          // Aseguramos que exista el directorio
          fs.mkdir(path.dirname(filePath), { recursive: true }, (mkdirErr) => {
            if (mkdirErr) {
              console.error('Error al crear el directorio:', mkdirErr);
              return res.status(500).json({ message: 'Error al crear el directorio para los datos' });
            }
            
            // Agregar ID único
            nuevoTurno.id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            // Guardar el nuevo array en el archivo
            fs.writeFile(filePath, JSON.stringify(nuevosTurnos, null, 2), 'utf-8', (writeErr) => {
              if (writeErr) {
                console.error('Error al escribir el archivo:', writeErr);
                return res.status(500).json({ message: 'Error al guardar los datos' });
              }
              return res.status(201).json({ message: 'Turno agregado exitosamente', turno: nuevoTurno });
            });
          });
          return;
        }        
        console.error('Error al leer el archivo:', err);
        return res.status(500).json({ message: 'Error al leer los datos existentes' });
      }
      
      try {
        // Parsear los turnos existentes
        let turnos = [];
        try {
          turnos = JSON.parse(data);
        } catch (parseError) {
          console.warn('El archivo estaba vacío o con formato incorrecto. Iniciando con array vacío.');
        }
        
        // Añadir ID único (timestamp + número aleatorio)
        nuevoTurno.id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Añadir el nuevo turno
        turnos.push(nuevoTurno);
        console.log('Turno añadido:', nuevoTurno);      
        // Guardar los turnos actualizados
        fs.writeFile(filePath, JSON.stringify(turnos, null, 2), 'utf-8', (writeErr) => {
          if (writeErr) {
            console.error('Error al escribir el archivo:', writeErr);
            return res.status(500).json({ message: 'Error al guardar los datos' });
          }
          return res.status(201).json({ message: 'Turno agregado exitosamente', turno: nuevoTurno });
        });
      } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        return res.status(500).json({ message: 'Error al procesar la solicitud' });
      }
    });
  });

  // Endpoint para actualizar el estado de un turno
app.put('/api/turnos/:id/estado', (req, res) => {
  const turnoId = req.params.id;
  const { estado } = req.body;
  
  // Validar que se proporcione un estado válido
  if (!estado || !['en espera', 'atendiendo', 'atendido'].includes(estado)) {
    return res.status(400).json({ message: 'Se requiere un estado válido (en espera, atendiendo, atendido)' });
  }
  
  const filePath = path.join(__dirname, 'data', 'turnos.json');
  
  // Leer el archivo actual
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo:', err);
      return res.status(500).json({ message: 'Error al leer los datos existentes' });
    }
    
    try {
      // Parsear los turnos existentes
      let turnos = JSON.parse(data);
      
      // Encontrar el turno por ID
      const index = turnos.findIndex(turno => turno.id === turnoId);
      
      if (index === -1) {
        return res.status(404).json({ message: 'Turno no encontrado' });
      }
      
      // Actualizar el estado del turno
      turnos[index].estado = estado;
      
      // Si cambia a "atendiendo", registrar la hora de inicio
      if (estado === 'atendiendo') {
        turnos[index].horaInicio = new Date().toLocaleTimeString();
      }
      
      // Si cambia a "atendido", registrar la hora de finalización
      if (estado === 'atendido') {
        turnos[index].horaFin = new Date().toLocaleTimeString();
      }
      
      // Guardar los turnos actualizados
      fs.writeFile(filePath, JSON.stringify(turnos, null, 2), 'utf-8', (writeErr) => {
        if (writeErr) {
          console.error('Error al escribir el archivo:', writeErr);
          return res.status(500).json({ message: 'Error al guardar los datos' });
        }
        return res.status(200).json({ 
          message: 'Estado del turno actualizado exitosamente', 
          turno: turnos[index] 
        });
      });
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      return res.status(500).json({ message: 'Error al procesar la solicitud' });
    }
  });
});

// Endpoint para eliminar un turno
app.delete('/api/turnos/eliminar/:id', (req, res) => {
  const turnoId = req.params.id;
  const filePath = path.join(__dirname, 'data', 'turnos.json');
  
  // Leer el archivo actual
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo:', err);
      return res.status(500).json({ message: 'Error al leer los datos existentes' });
    }
    
    try {
      // Parsear los turnos existentes
      let turnos = JSON.parse(data);
      
      // Encontrar el turno por ID
      const index = turnos.findIndex(turno => turno.id === turnoId);
      
      if (index === -1) {
        return res.status(404).json({ message: 'Turno no encontrado' });
      }
      
      // Eliminar el turno
      const turnoEliminado = turnos.splice(index, 1)[0];
      
      // Guardar los turnos actualizados
      fs.writeFile(filePath, JSON.stringify(turnos, null, 2), 'utf-8', (writeErr) => {
        if (writeErr) {
          console.error('Error al escribir el archivo:', writeErr);
          return res.status(500).json({ message: 'Error al guardar los datos' });
        }
        return res.status(200).json({ 
          message: 'Turno eliminado exitosamente', 
          turno: turnoEliminado 
        });
      });
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      return res.status(500).json({ message: 'Error al procesar la solicitud' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
*/
let turnos = []; // Se guardan en memoria

// GET: obtener todos los turnos
app.get('/api/turnos', (req, res) => {
  return res.json(turnos);
});

// POST: agregar nuevo turno
app.post('/api/turnos', (req, res) => {
  const nuevoTurno = req.body;

  if (!nuevoTurno.nombre) {
    return res.status(400).json({ message: 'Se requiere nombre para el turno' });
  }

  const fechaActual = new Date();

  if (!nuevoTurno.fecha) {
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaActual.getFullYear();
    nuevoTurno.fecha = `${dia}/${mes}/${anio}`;
  }

  if (!nuevoTurno.hora) {
    const hora = fechaActual.getHours().toString().padStart(2, '0');
    const minutos = fechaActual.getMinutes().toString().padStart(2, '0');
    nuevoTurno.hora = `${hora}:${minutos}`;
  }

  nuevoTurno.estado = 'en espera';
  nuevoTurno.id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  turnos.push(nuevoTurno);

  console.log('Turno añadido:', nuevoTurno);

  return res.status(201).json({ message: 'Turno agregado exitosamente', turno: nuevoTurno });
});

// PUT: actualizar estado
app.put('/api/turnos/:id/estado', (req, res) => {
  const turnoId = req.params.id;
  const { estado } = req.body;

  if (!estado || !['en espera', 'atendiendo', 'atendido'].includes(estado)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  const index = turnos.findIndex(turno => turno.id === turnoId);
  if (index === -1) {
    return res.status(404).json({ message: 'Turno no encontrado' });
  }

  turnos[index].estado = estado;

  if (estado === 'atendiendo') {
    turnos[index].horaInicio = new Date().toLocaleTimeString();
  } else if (estado === 'atendido') {
    turnos[index].horaFin = new Date().toLocaleTimeString();
  }

  return res.status(200).json({ message: 'Estado actualizado', turno: turnos[index] });
});

// DELETE: eliminar turno
app.delete('/api/turnos/eliminar/:id', (req, res) => {
  const turnoId = req.params.id;
  const index = turnos.findIndex(turno => turno.id === turnoId);
  if (index === -1) {
    return res.status(404).json({ message: 'Turno no encontrado' });
  }

  const eliminado = turnos.splice(index, 1)[0];
  return res.status(200).json({ message: 'Turno eliminado', turno: eliminado });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
