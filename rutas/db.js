
const mysql = require('mysql2');

const db = mysql.createConnection(
    { 
        host: 'localhost',
        user: 'root',
        password: 'pardomauro2',
        database: 'reclamosciudadanos',
        connectTimeout: 60000,

}

);

db.connect((error) => {
    if (error) {
        console.error('Error al conectar a la base de datos:', error);
    } else {
        console.log('Conexión exitosa a la base de datos MySQL');
    }
});

module.exports = db;