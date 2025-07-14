const express = require('express');
const reclamosRouter = express.Router();
const db = require('./db');




reclamosRouter.use(express.json());
reclamosRouter.use(express.text());

class reclamos {
    constructor(codigo_reclamo, tipo_reclamo, descripcion, ubicacion, fecha_reclamo, estado, imagenes, DNI_usuario ) {
        this.codigo_reclamo = codigo_reclamo;
        this.tipo_reclamo = tipo_reclamo;
        this.descripcion = descripcion;
        this.ubicacion = ubicacion;
        this.fecha_reclamo = fecha_reclamo;
        this.estado = estado;
        this.imagenes = imagenes; // Puede ser un array de URLs o nombres de archivos
        this.DNI_usuario = DNI_usuario;
    }
}

// Función para saber si el array está vacío
const arrayVacio = (arr) => !Array.isArray(arr) || arr.length === 0;

// Ruta para obtener todos los reclamos
reclamosRouter.get('/', (req, res) => {
    const sql = 'SELECT * FROM reclamos ORDER BY fecha_reclamo DESC';
    db.query(sql, (err, rows) => {
        if (err) {
            console.error('Error al consultar la base de datos', err);
            return res.status(500).json({ message: 'Error interno del servidor.' });
        }
        res.json(rows);
    });
});




// Endopoints específicos //

//Buscar reclamos por tipo, estado, ubicación o fecha

reclamosRouter.get('/buscar', (req, res)=> {
    const { tipo_reclamo, estado, ubicacion, fecha_reclamo } = req.query;
    let sql = 'SELECT * FROM reclamos WHERE 1=1';
    let params = [];
    
    if (tipo_reclamo) {
        sql += ' AND tipo_reclamo = ?';
        params.push(tipo_reclamo);
    }
    if (estado) {
        sql += ' AND estado = ?';
        params.push(estado);
    }
    if (ubicacion) {
        sql += ' AND ubicacion = ?';
        params.push(ubicacion);
    }
    if (fecha_reclamo) {
        sql += ' AND fecha_reclamo = ?';
        params.push(fecha_reclamo);
    }

    db.query(sql, params, (err, rows) => {
        if (err) {
            console.error('Error al consultar la base de datos', err);
            return res.status(500).json({ message: 'Error interno del servidor.' });
        }
        if (arrayVacio(rows)) {
            return res.status(404).json({ message: 'No se encontraron reclamos con los criterios especificados.' });
        }
        res.json(rows);
    })
})

// Ruta para obtener un reclamo por su código
reclamosRouter.get('/:codigo_reclamo', (req, res) => {
    const { codigo_reclamo } = req.params;
    const sql = 'SELECT * FROM reclamos WHERE codigo_reclamo = ?';
    db.query(sql, [codigo_reclamo], (err, rows) => {
        if (err) {
            console.error('Error al consultar la base de datos', err);
            return res.status(500).json({ message: 'Error interno del servidor.' });
        }
        if (arrayVacio(rows)) {
            return res.status(404).json({ message: 'No existe el reclamo solicitado.' });
        }
        res.json(rows[0]);
    });
});


// Obtener todos los reclamos asignados por un usuario específico
reclamosRouter.get('/usuario/:dni', (req, res) => {
    const dni = req.params.dni;

    // --- LÍNEA DE DEPURACIÓN ---
    console.log(`[DEBUG] Buscando reclamos para el DNI recibido: |${dni}|`);

    const sql = 'SELECT * FROM reclamos WHERE DNI_usuario = ?';
    db.query(sql, [dni], (err, rows) => {
        if (err) {
            console.error('Error al consultar la base de datos', err);
            return res.status(500).json({ message: 'Error interno del servidor.' });
        }
        // Siempre devolvemos un array. Si no hay reclamos, será un array vacío.
        // El frontend ya está preparado para mostrar el mensaje "Aún no has generado ningún reclamo".
        res.json(rows); // Devuelve los reclamos encontrados o un array vacío []
    });
})

// Listar todos los reclamos asignados a un personalAsignado.
reclamosRouter.get('/personal/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM reclamos WHERE personal_asignado = ?'; 

    db.query(sql, [id], (err, rows) => {
        if (err) {
            console.error('Error al consultar la base de datos', err);
            return res.status(500).json({ message: 'Error interno del servidor.'})
        } 
        if (arrayVacio(rows)) {
            return res.status(404).json({ message: 'No existen reclamos asignados al personal solicitado.' });
        }
        res.json(rows);
    });
});

// Ruta para crear un nuevo reclamo
reclamosRouter.post('/nuevo', (req, res) => {
    const { tipo_reclamo, descripcion, ubicacion, fecha_reclamo, estado, imagenes, DNI_usuario, personal_asignado } = req.body;
    const sql = 'INSERT INTO reclamos (tipo_reclamo, descripcion, ubicacion, fecha_reclamo, estado, imagenes, DNI_usuario, personal_asignado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [tipo_reclamo, descripcion, ubicacion, fecha_reclamo, estado || 'pendiente', imagenes, DNI_usuario, personal_asignado];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error al insertar el reclamo en la base de datos', err);
            return res.status(500).json({ message: 'Los datos no se pudieron agregar en la base de datos.' });
        }
        const nuevoReclamo = { codigo_reclamo: result.insertId, ...req.body };
        res.status(201).json({ mensaje: 'El Reclamo se agregó correctamente.', reclamo: nuevoReclamo });
    });
});

// Ruta para modificar un reclamo (usada por el panel de gestión)
reclamosRouter.put('/modificar', (req, res, next) => {
    const {
        codigo_reclamo,
        tipo_reclamo,
        descripcion,
        ubicacion,
        fecha_reclamo,
        estado,
        imagenes,
        DNI_usuario,
        personal_asignado
    } = req.body;

    if (!codigo_reclamo) {
        return res.status(400).json({ error: 'El código de reclamo es obligatorio para modificar.' });
    }

    const sql = `UPDATE reclamos SET 
                    tipo_reclamo = ?, 
                    descripcion = ?, 
                    ubicacion = ?, 
                    fecha_reclamo = ?, 
                    estado = ?, 
                    imagenes = ?, 
                    DNI_usuario = ?, 
                    personal_asignado = ? 
                 WHERE codigo_reclamo = ?`;
    
    const values = [
        tipo_reclamo,
        descripcion,
        ubicacion,
        fecha_reclamo,
        estado,
        imagenes,
        DNI_usuario,
        personal_asignado,
        codigo_reclamo
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error al actualizar el reclamo en la base de datos:', err);
            return next(err);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Reclamo no encontrado para modificar.' });
        }

        // Después de actualizar, buscamos el reclamo actualizado para devolverlo
        const sqlSelect = 'SELECT * FROM reclamos WHERE codigo_reclamo = ?';
        db.query(sqlSelect, [codigo_reclamo], (err, rows) => {
            if (err) {
                console.error('Error al buscar el reclamo después de modificar:', err);
                return next(err);
            }
            if (arrayVacio(rows)) {
                return res.status(404).json({ error: 'No se pudo encontrar el reclamo después de modificar.' });
            }
            // Devolvemos el objeto del reclamo actualizado para que el frontend pueda actualizar la fila específica.
            res.json({ mensaje: 'Reclamo modificado con éxito.', reclamo: rows[0] });
        });
    });
});

// --- RUTA PARA ACTUALIZAR UN RECLAMO (PUT) ---
// Esta ruta responde a la petición de "Guardar Cambios" del frontend.
reclamosRouter.put('/:codigo_reclamo', (req, res, next) => {
    const { codigo_reclamo } = req.params;
    const { tipo_reclamo, descripcion, ubicacion, estado } = req.body;

    // Validación de los datos recibidos
    if (!tipo_reclamo || !descripcion || !ubicacion || !estado) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: tipo, descripción, ubicación y estado.' });
    }

    // Normalizamos el estado a minúsculas antes de guardarlo para mantener la consistencia.
    const estadoNormalizado = estado.toLowerCase();

    const sql = 'UPDATE reclamos SET tipo_reclamo = ?, descripcion = ?, ubicacion = ?, estado = ? WHERE codigo_reclamo = ?';
    
    db.query(sql, [tipo_reclamo, descripcion, ubicacion, estadoNormalizado, codigo_reclamo], (err, result) => {
        if (err) {
            // Si hay un error en la consulta, lo pasamos al manejador de errores
            return next(err);
        }

        if (result.affectedRows === 0) {
            // Si no se actualizó ninguna fila, significa que el reclamo no fue encontrado
            return res.status(404).json({ message: 'Reclamo no encontrado para modificar.' });
        }

        // Si la actualización fue exitosa, buscamos y devolvemos el reclamo actualizado
        // para que el frontend pueda refrescar la vista con los datos correctos.
        db.query('SELECT * FROM reclamos WHERE codigo_reclamo = ?', [codigo_reclamo], (err, rows) => {
            if (err) {
                console.error('Error al buscar el reclamo después de actualizar:', err);
                return next(err);
            }
            if (arrayVacio(rows)) {
                 return res.status(404).json({ error: 'No se pudo encontrar el reclamo después de actualizar.' });
            }
            // Enviamos el reclamo actualizado como JSON, que es lo que el frontend espera
            res.json(rows[0]);
        });
    });
});

// --- RUTA PARA ELIMINAR UN RECLAMO (DELETE) ---
// Esta ruta responde a la petición de "Cancelar Reclamo" y lo elimina de la base de datos.
reclamosRouter.delete('/:codigo_reclamo', (req, res, next) => {
    const { codigo_reclamo } = req.params;
    const sql = 'DELETE FROM reclamos WHERE codigo_reclamo = ?';
    db.query(sql, [codigo_reclamo], (err, result) => {
        if (err) {
            return next(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reclamo no encontrado para cancelar.' });
        }
        // Enviamos una confirmación como JSON, que es lo que el frontend espera
        res.status(200).json({ message: 'Reclamo cancelado con éxito.' });
    });
});

// Consultar estadísticas de cantidad de reclamos por tipo_reclamo, resueltos vs pendientes, etc.

reclamosRouter.get('/estadisticas', (req, res) => {
    const sql = `
        SELECT 
            tipo_reclamo, 
            COUNT(*) AS cantidad, 
            SUM(CASE WHEN estado = 'resuelto' THEN 1 ELSE 0 END) AS resueltos,
            SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) AS pendiente,
            SUM(CASE WHEN estado = 'en proceso' THEN 1 ELSE 0 END) AS en_proceso,
            SUM(CASE WHEN estado = 'rechazado' THEN 1 ELSE 0 END) AS rechazados
        FROM reclamos
        GROUP BY tipo_reclamo
    `;

    db.query(sql, (err, rows) => {
        if (err) {
            console.error('Error al consultar las estadísticas de reclamos', err);
            return res.status(500).json({ message: 'Error interno del servidor.' });
        }
        res.json(rows);
    });
});

module.exports = reclamosRouter; 