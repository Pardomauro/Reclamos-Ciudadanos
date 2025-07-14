
const express = require('express');
const db = require('./db'); // Corregido: La ruta correcta para acceder a db.js
const usuariosCiudadanosRouter = express.Router();

usuariosCiudadanosRouter.use(express.json());
usuariosCiudadanosRouter.use(express.text());

// Función para saber si el array está vacío
const arrayVacio = (arr) => !Array.isArray(arr) || arr.length === 0;



// Ruta para obtener todos los usuarios ciudadanos

usuariosCiudadanosRouter.get('/', (req, res) => {
    // Seleccionamos las columnas relevantes para mostrar en una lista, excluyendo la contraseña.
    const sql = 'SELECT DNI, Nombre_completo, email, Telefono, Direccion FROM usuarios_ciudadanos';
    db.query(sql, (err, rows) => {
        if (err) {
            console.error('Error al consultar la base de datos', err);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        res.json(rows);
    });
});

// Ruta para obtener a un Usuario por su DNI (para el login y para la página de Editar Perfil)
usuariosCiudadanosRouter.get('/:dni', (req, res, next) => {
    const { dni } = req.params;
    // Seleccionamos las columnas que necesita el formulario de edición.
    // Asegúrate de que tu tabla 'usuarios_ciudadanos' tenga estas columnas.
    const sql = 'SELECT DNI, Nombre_completo, email, Telefono, Direccion FROM usuarios_ciudadanos WHERE DNI = ?';
    
    db.query(sql, [dni], (err, rows) => {
        if (err) {
            console.error('Error al consultar la base de datos', err);
            return next(err); // Usamos el manejador de errores
        }
        if (arrayVacio(rows)) {
            // Para el login, es importante devolver 404 si no se encuentra.
            return res.status(404).json({ message: 'No existe el usuario solicitado.' });
        }
        res.json(rows[0]); // Devolver el primer usuario encontrado
    });
});

// Ruta para crear un nuevo usuario ciudadano
// NOTA: Deberás actualizar tu formulario de 'crearNuevoUsuario.html' para que coincida con estos campos.
usuariosCiudadanosRouter.post('/nuevo', (req, res, next) => { 
    const { DNI, Nombre_completo, email, Telefono, Direccion } = req.body;

 
    if (!DNI || !Nombre_completo || !email) {
        return res.status(400).json({ message: 'DNI, Nombre Completo y email son obligatorios.' });
    }

    const sql = 'INSERT INTO usuarios_ciudadanos (DNI, Nombre_completo, email, Telefono, Direccion) VALUES (?, ?, ?, ?, ?)';
    const values = [ DNI, Nombre_completo, email, Telefono, Direccion];

    db.query(sql, values, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'El DNI ingresado ya se encuentra registrado.' });
            }
            console.error('Error al insertar el usuario en la base de datos', err);
            return next(err);
        }
        res.status(201).json({ mensaje: 'El Usuario se agregó correctamente.', id: result.insertId });
    });
});

// --- Endpoint para ACTUALIZAR un usuario por DNI (para la página de Editar Perfil) ---
usuariosCiudadanosRouter.put('/:dni', (req, res, next) => {
    const { dni } = req.params;
    const { Nombre_completo, email, Telefono, Direccion } = req.body; // Datos que vienen del frontend

    // Validación básica de campos obligatorios
    if ( !Nombre_completo || !email ) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const query = 'UPDATE usuarios_ciudadanos SET Nombre_completo = ?, email = ?, Telefono = ?, Direccion = ? WHERE DNI = ?';
    const params = [Nombre_completo, email, Telefono, Direccion, dni];

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Error al actualizar el usuario en la base de datos', err);
            return next(err); // Pasamos el error al manejador de errores
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No existe el usuario solicitado para modificar.' });
        }
        res.json({ message: 'Usuario actualizado correctamente.' });
    });
});

//Eliminar al usuario por su DNI 
usuariosCiudadanosRouter.delete('/:dni', (req, res) =>{
    const dni = req.params.dni;
    const sql = 'DELETE FROM usuarios_ciudadanos WHERE DNI=?';
    db.query(sql, [dni], (err, result) => {
        if (err) {
            console.error('Error al eliminar en la base de datos', err);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'No existe el usuario a eliminar.' });
        }
        res.json({ mensaje: `Se eliminó el usuario cuyo DNI es ${dni} `  });
    });
});
 
// Obtener un Usuario por su DNI junto con sus reclamos 
usuariosCiudadanosRouter.get('/:dni/reclamos', (req, res) => {
    const dni = req.params.dni;
    // La columna que une las tablas es DNI en usuarios_ciudadanos y DNI_usuario en reclamos.
    const sql = `
        SELECT *
        FROM reclamos
        WHERE DNI_usuario = ?
    `;

    db.query(sql, [dni], (err, rowsReclamos) => {
        if (err) return res.status(500).json({ error: 'Error interno del servidor.' });
        // El frontend (listaReclamos.js) espera un array de reclamos.
        // Si no hay reclamos, se envía un array vacío y el frontend muestra el mensaje correspondiente.
        res.json(rowsReclamos);
    });
});

module.exports = usuariosCiudadanosRouter;