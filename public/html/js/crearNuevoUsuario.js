document.addEventListener('DOMContentLoaded', function () {
    const formNuevoUsuario = document.getElementById('formNuevoUsuario');

    formNuevoUsuario.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(formNuevoUsuario);
        const nuevoUsuario = {
            DNI: formData.get('DNI').trim(), // <-- Añadimos .trim() para limpiar espacios
            Nombre_completo: formData.get('Nombre_completo'),
            email: formData.get('email'),
            Telefono: formData.get('Telefono'),
            Direccion: formData.get('Direccion')
        };

        fetch('/api/3.0/usuarios_ciudadanos/nuevo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoUsuario)
        })
        .then(response => {
            if (!response.ok) {
                // Si el servidor responde con un error, intentamos leer el mensaje de error
                return response.json().then(err => { throw new Error(err.error || 'Error al crear el usuario.') });
            }
            return response.json();
        })
        .then(data => {
            alert(data.mensaje || '¡Usuario creado con éxito! Ya podés iniciar sesión.');
            // Redirigir al login después de crear el usuario
            window.location.href = '/html/login.html';
        })
        .catch(error => {
            console.error('Error al crear el usuario:', error);
            // Mostramos el mensaje de error que viene del backend o uno genérico
            alert(error.message || 'No se pudo crear el usuario. Verificá los datos e intentá de nuevo.');
        });
    });
});