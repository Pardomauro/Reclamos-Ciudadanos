document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const dni = document.getElementById('dni').value.trim();

        if (!dni) {
            alert('Por favor, ingresá tu DNI.');
            return;
        }

        // Verificar si el usuario existe en la base de datos
        fetch(`/api/3.0/usuarios_ciudadanos/${dni}`)
            .then(response => {
                if (response.ok) {
                    // Si el usuario existe (status 200-299), lo redirigimos a la página principal
                    // Guardamos el DNI en sessionStorage para usarlo en otras páginas
                    sessionStorage.setItem('dniUsuario', dni);
                    window.location.href = '/html/paginaPrincipal.html';
                } else if (response.status === 404) {
                    // Si el usuario no existe (status 404), mostramos el mensaje
                    alert('Debes crear tu cuenta para acceder a la página');
                } else {
                    // Otro tipo de error del servidor
                    alert('Ocurrió un error. Por favor, intentá de nuevo más tarde.');
                }
            })
            .catch(error => {
                console.error('Error en la solicitud de login:', error);
                alert('No se pudo conectar con el servidor. Verificá tu conexión.');
            });
    });
});