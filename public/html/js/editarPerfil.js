document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-editar-perfil');
    const dniUsuario = sessionStorage.getItem('dniUsuario'); 

    if (!dniUsuario) {
        alert('No se ha iniciado sesión. Redirigiendo al login.');
        window.location.href = '/html/login.html';
        return;
    }

    // --- Cargar datos del usuario en el formulario ---
    fetch(`/api/3.0/usuarios_ciudadanos/${dniUsuario}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo obtener la información del usuario.');
            }
            return response.json();
        })
        .then(usuario => {
            document.getElementById('DNI').value = usuario.DNI;
            document.getElementById('Nombre_completo').value = usuario.Nombre_completo;
            document.getElementById('email').value = usuario.email;
            document.getElementById('Telefono').value = usuario.Telefono;
            document.getElementById('Direccion').value = usuario.Direccion;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar los datos del perfil. ' + error.message);
        });

    // --- Manejar el envío del formulario ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Corregido: Usamos los nombres de campo que espera el backend en el body
        const datosActualizados = {
            Nombre_completo: document.getElementById('Nombre_completo').value,
            email: document.getElementById('email').value,
            Telefono: document.getElementById('Telefono').value,
            Direccion: document.getElementById('Direccion').value,
        };


        fetch(`/api/3.0/usuarios_ciudadanos/${dniUsuario}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify(datosActualizados),
            })
            .then(response => {
                if (!response.ok) {
                    // Mejoramos el manejo de errores para mostrar el mensaje del backend
                    return response.json().then(err => { throw new Error(err.message || 'Error al guardar los cambios.') });
                }
                return response.json();
            })
            .then(data => {
                alert(data.message || 'Perfil actualizado con éxito.');
                window.location.href = '/html/paginaPrincipal.html';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al guardar los cambios.');
            });
    });
});