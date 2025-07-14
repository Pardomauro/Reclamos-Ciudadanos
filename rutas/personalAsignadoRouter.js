
const express = require('express');
const personalAsignadoRouter = express.Router();
const db = require('./db');
const path = require('path');
const multer = require('multer');
const fs = require('fs'); // Importar el módulo File System
 
class personalAsignado {
    constructor(idPersonal, nombre, sectorACargo, email, telefono, foto) {
        this.idPersonal = idPersonal;
        this.nombre = nombre;
        this.sectorACargo = sectorACargo;
        this.email = email;
        this.telefono = telefono;
        this.foto = foto;

    }
}

// --- MIDDLEWARE ---
personalAsignadoRouter.use(express.json());
personalAsignadoRouter.use(express.text());

// --- CONFIGURACIÓN DE MULTER Y DIRECTORIO DE SUBIDA ---

// 1. Definir la ruta del directorio de subida
const uploadDir = path.join(__dirname, '../public/imagenesPersonalEncargado');

// 2. Asegurarse de que el directorio exista. Si no, lo crea.
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Usar la variable definida
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
    }
});
const upload = multer({ storage: storage });

// --- RUTAS ---

// Ruta para crear un nuevo personal (incluye subida de foto)
personalAsignadoRouter.post('/nuevo', upload.single('foto'), (req, res) =>{
    // No incluimos id_personal, ya que la base de datos lo genera automáticamente (AUTO_INCREMENT)
    const { nombre, sector_a_cargo, email, telefono } = req.body;
    const foto = req.file ? req.file.filename : null;

    const sql = 'INSERT INTO personal_asignado (nombre, sector_a_cargo, email, telefono, foto) VALUES (?, ?, ?, ?, ?)';
    const values = [nombre, sector_a_cargo, email, telefono, foto];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error al agregar el personal en la base de datos:', err);
            return res.status(500).json({ mensaje: 'No se pudo agregar el profesional.' });
        }
        res.json({ mensaje: 'Personal asignado creado correctamente.', id: result.insertId });
    })
})

// Función para saber si el array está vacío
const arrayVacio = (arr) => !Array.isArray(arr) || arr.length === 0;

// Obtener todo el personal o filtrar por sector a cargo
personalAsignadoRouter.get('/', (req, res) => {
   
    const sectorACargo = req.query.sector_a_cargo;
    let sql = 'SELECT * FROM personal_asignado';
    let params = [];
    if (sectorACargo) {
        sql += ' WHERE sector_a_cargo = ?';
        params.push(sectorACargo);

    }
    db.query(sql, params, (err, rows) => {
        if (err) {
            console.error('Error al consultar la base de datos', err);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        res.json(rows);
    });
});

// Obtener a un personal asignado por su ID_personal 

personalAsignadoRouter.get('/:id_personal', (req, res) =>{
    const id_personal = req.params.id_personal;
    const sql = 'SELECT * FROM personal_asignado WHERE id_personal = ?';

    db.query(sql, [id_personal], (err, rows) => {
        if (err) {
            console.error('Error al consultar la base de datos', err);
            return res.status(500).json({ error: 'Error interno del servidor.' });
            
        }   
        if (arrayVacio(rows)) {
            return res.status(404).json({ error: 'No existe el personal asignado solicitado.' });
        }
        res.json(rows[0]); // Devolver el primer personal asignado encontrado

    });
});

// Modificar un personal asignado (incluye posible cambio de foto)
// Corregido a POST para coincidir con el frontend y manejar FormData
personalAsignadoRouter.post('/modificar', upload.single('foto'), (req, res) =>{
    const { id_personal, nombre, sector_a_cargo, email, telefono } = req.body;
    const nuevaFoto = req.file ? req.file.filename : null;
    
    // 1. Obtener el nombre de la foto antigua antes de actualizar
    db.query('SELECT foto FROM personal_asignado WHERE id_personal = ?', [id_personal], (err, rows) => {
        if (err) {
            console.error('Error al buscar la foto antigua:', err);
            return res.status(500).json({ mensaje: 'Error del servidor.' });
        }
        // No es un error si no se encuentra, podría ser un registro sin foto.
        const fotoAntigua = rows.length > 0 ? rows[0].foto : null;

        let sql;
        let values;

        if (nuevaFoto) {
            // Si se subió una nueva foto, la actualizamos en la DB
            sql = 'UPDATE personal_asignado SET nombre = ?, sector_a_cargo = ?, email = ?, telefono = ?, foto = ? WHERE id_personal = ?';
            values = [nombre, sector_a_cargo, email, telefono, nuevaFoto, id_personal];
        } else {
            // Si no se subió foto nueva, no actualizamos ese campo
            sql = 'UPDATE personal_asignado SET nombre = ?, sector_a_cargo = ?, email = ?, telefono = ? WHERE id_personal = ?';
            values = [nombre, sector_a_cargo, email, telefono, id_personal];
        }

        // 2. Actualizar la base de datos
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error al modificar el personal en la base de datos', err);
                // Si la DB falla, borramos la foto que se acaba de subir para no dejar basura
                if (nuevaFoto) fs.unlink(path.join(uploadDir, nuevaFoto), (e) => e && console.error("Error al limpiar foto subida:", e));
                return res.status(500).json({ mensaje: 'No se pudo modificar el personal asignado.' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ mensaje: 'No se encontró el personal asignado para modificar.' });
            }

            // 3. Si la actualización fue exitosa y se subió una foto nueva, borramos la antigua
            if (nuevaFoto && fotoAntigua) {
                fs.unlink(path.join(uploadDir, fotoAntigua), (unlinkErr) => {
                    if (unlinkErr) console.error(`Error al eliminar la foto antigua ${fotoAntigua}:`, unlinkErr);
                });
            }

            res.json({ mensaje: 'Personal asignado modificado correctamente.' });
        });
    });
});

// Eliminar personal por su id 
personalAsignadoRouter.delete('/:id_personal', (req, res) => {
    const id_personal = req.params.id_personal;

    // 1. Primero, obtenemos el nombre de la foto para poder borrarla del servidor
    db.query('SELECT foto FROM personal_asignado WHERE id_personal = ?', [id_personal], (err, rows) => {
        if (err) return res.status(500).json({ mensaje: 'Error del servidor.' });
        if (arrayVacio(rows)) return res.status(404).json({ mensaje: 'No existe el personal asignado solicitado.' });

        const fotoAEliminar = rows[0].foto;

        // 2. Luego, eliminamos el registro de la base de datos
        db.query('DELETE FROM personal_asignado WHERE id_personal = ?', [id_personal], (err, result) => {
            if (err) return res.status(500).json({ mensaje: 'Error al eliminar de la base de datos.' });
            if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'No se encontró el personal para eliminar.' });

            // 3. Si se eliminó de la DB y tenía una foto, la borramos del sistema de archivos
            if (fotoAEliminar) {
                fs.unlink(path.join(uploadDir, fotoAEliminar), (unlinkErr) => {
                    if (unlinkErr) console.error(`Error al eliminar el archivo de foto ${fotoAEliminar}:`, unlinkErr);
                });
            }
            res.json({ mensaje: `Se eliminó correctamente el personal asignado cuyo id es ${id_personal}`});
        });
    });
});

module.exports = personalAsignadoRouter; 