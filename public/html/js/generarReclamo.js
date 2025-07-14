document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formGenerarReclamo');

    // Primero, verificar si el usuario ha iniciado sesión
    const dniUsuario = sessionStorage.getItem('dniUsuario');
    if (!dniUsuario) {
        alert('Debes iniciar sesión para poder generar un reclamo.');
        // Redirigir al login si no hay DNI guardado
        window.location.href = '/html/login.html';
        return; // Detener la ejecución del script
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Crear un objeto Date para obtener la fecha y hora actual en formato ISO
        const fechaActual = new Date();
        // Formatear la fecha a 'YYYY-MM-DD HH:MM:SS' para MySQL
        const fechaReclamo = fechaActual.toISOString().slice(0, 19).replace('T', ' ');

        const nuevoReclamo = {
            tipo_reclamo: document.getElementById('tipo_reclamo').value,
            descripcion: document.getElementById('descripcion').value,
            ubicacion: document.getElementById('ubicacion').value,
            fecha_reclamo: fechaReclamo,
            DNI_usuario: dniUsuario,
            // Por ahora no manejamos la subida de imágenes ni la asignación de personal
            imagenes: null, 
            personal_asignado: null,
            estado: 'pendiente' // El estado inicial siempre es pendiente
        };

        // Validar que los campos no estén vacíos
        if (!nuevoReclamo.tipo_reclamo || !nuevoReclamo.descripcion || !nuevoReclamo.ubicacion) {
            alert('Por favor, completá todos los campos requeridos.');
            return;
        }

        fetch('/api/2.0/reclamos/nuevo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoReclamo)
        })
        .then(response => response.ok ? response.json() : response.json().then(err => Promise.reject(err)))
        .then(data => {
            alert(`${data.mensaje} Tu código de reclamo es: ${data.reclamo.codigo_reclamo}`);
            window.location.href = '/html/paginaPrincipal.html';
        })
        .catch(error => {
            console.error('Error al registrar el reclamo:', error);
            alert(error.error || 'No se pudo registrar el reclamo. Intentá de nuevo.');
        });
    });
});