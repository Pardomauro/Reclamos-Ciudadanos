

// Función para cargar todos los usuarioscIudadanos 
function cargarUsuariosCiudadanos() {
    fetch('/api/3.0/usuarios_ciudadanos')
        .then(res => res.json())
        .then(usuariosCiudadanos => {
            const tbody = document.querySelector('#usuariosCiudadanos tbody');
            tbody.innerHTML = '';

            usuariosCiudadanos.forEach(u => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                <td>${u.DNI}</td>
                <td>${u.Nombre_completo}</td>
                <td>${u.email}</td>
                <td>${u.Telefono}</td>
                <td>${u.Direccion}</td>
                <td>
                    <button class="btn btn-primary" onclick="editarUsuario('${u.DNI}')">Editar</button>
                    <button class="btn btn-danger" onclick="eliminarUsuario('${u.DNI}')">Eliminar</button>
                </td>
            `;
                tbody.appendChild(tr);

            });

            // Evento eliminar usuario
            document.querySelectorAll('.btn-eliminar').forEach(btn => {
                btn.addEventListener('click', function () {
                    if (confirm('¿Seguro de que quieres eliminar este usuario?')) {
                        fetch(`/api/3.0/usuarios_ciudadanos/${this.dataset.dni}`, { method: 'DELETE' })
                            .then(res => res.json())
                            .then(() => cargarUsuariosCiudadanos());
                    }
                })
            });

            //Evento Editar usuario
            document.querySelectorAll('.btn-editar').forEach(btn => {
                btn.addEventListener('click', function () {
                    const dni = this.dataset.dni;
                    fetch(`/api/3.0/usuarios_ciudadanos/${dni}`)
                        .then(res => res.json())
                        .then(usuario => {
                            const form = document.querySelector('formUsuario');
                            form.DNI.value = usuario.DNI;
                            form.Nombre_completo.value = usuario.Nombre_completo;
                            form.email.value = usuario.email;
                            form.Telefono.value = usuario.Telefono;
                            form.Direccion.value = usuario.Direccion;
                            form.dataset.dni = usuario.DNI; // Guardar el DNI para actualizar
                            form.querySelector('button[type="submit"]').textContent = 'Actualizar Usuario';
                        });
                });
            });

        });




}

//Buscar usuario por DNI
document.querySelector('formBuscarUsuario').addEventListener('submit', function (e) {
    e.preventDefault();
    const dni = document.querySelector('dniBuscar').value.trim();
    if (!dni) return alert('Por favor, ingrese un DNI válido.');

    fetch(`/api/3.0/usuarios_ciudadanos/${dni}`)
        .then(res => res.json())
        .then(usuario => {


            //buscar por reclamos
            fetch(`/api/3.0/usuarios_ciudadanos/${dni}`)
                .then(res => res.json())
                .then(resp => {
                    const reclamos = Array.isArray(resp) ? resp : resp.reclamos;
                    const div = document.getElementById('reclamosUsuario');
                    if (!Array.isArray(reclamos) || reclamos.length === 0) {
                        div.innerHTML = '<p>No se encontraron reclamos para este usuario.</p>';
                        return;
                    }
                    let html = '<h3>Reclamos del Usuario</h3><ul>';
                    reclamos.forEach(r => {
                        html += `<li>${r.descripcion} - Estado: ${r.estado}</li> `;
                    });
                    html += '</ul>';
                    div.innerHTML = html;
                });

        });
});


// Evento para modificar un usuario 

document.getElementById('formUsuario').addEventListener('submit', function(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        DNI: form.DNI.value,
        Nombre_completo: form.Nombre_completo.value,
        Direccion: form.Direccion.value,
        email: form.email.value,
        Telefono: form.Telefono.value
    };

    if (form.dataset.dni) {
        // Modo edición
        fetch('/api/3.0/usuarios_ciudadanos/modificar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(resp => {
            alert(resp.mensaje || 'Usuario modificado');
            form.reset();
            delete form.dataset.dni;
            form.querySelector('button[type="submit"]').textContent = 'Registrar';
            cargarUsuariosCiudadanos();
        });
    } else {
        // Modo alta
        fetch('/api/3.0/usuarios_ciudadanos/nuevo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(resp => {
            alert(resp.mensaje || 'Usuario registrado');
            form.reset();
            cargarUsuariosCiudadanos();
        });
    }
});


// Cargar pacientes al iniciar la página
document.addEventListener('DOMContentLoaded', cargarUsuariosCiudadanos);