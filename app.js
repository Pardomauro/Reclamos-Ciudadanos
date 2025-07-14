const express = require('express'); 
const app = express();
const path = require('path');
const cors = require('cors');
const PORT = 3020;

app.use(cors());

// Servir archivos estáticos (HTML, CSS, JS, imágenes) desde el directorio 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

//Routers
const personalAsignadoRouter = require('./rutas/personalAsignadoRouter');
const usuariosCiudadanosRouter = require('./rutas/usuariosCiudadanosRouter');
const reclamosRouter = require('./rutas/reclamosRouter');

app.use(express.json());
app.use(express.text());

app.use('/api/1.0/personal_asignado', personalAsignadoRouter);
app.use('/api/2.0/reclamos', reclamosRouter);
app.use('/api/3.0/usuarios_ciudadanos', usuariosCiudadanosRouter);

//manejo de errores
const errorHandler = require('./middlewares/errorHandler'); 
app.use(errorHandler);

app.listen(PORT, () => {
    console.log('Express está escuchando en el puerto ' + PORT);

}
);