// Cargar todos los reclamos 

function cargarReclamos() {
    fetch('/api/2.0/reclamos')
        .then(res => res.json())
        .then(reclamos => {
            const tbody = document.querySelector('#tablaReclamos tbody');
            tbody.innerHTML = '';
            reclamos.forEach(r => {
                const tr = document.createElement('tr');
                tr.dataset.codigoReclamo = r.codigo_reclamo; // Identificador para la fila
                tr.innerHTML = `
                    <td>${r.codigo_reclamo}</td>
                    <td>${r.tipo_reclamo}</td>
                    <td>${r.descripcion || ''}</td>
                    <td>${r.ubicacion}</td>
                    <td>${r.fecha_reclamo}</td>
                    <td>${r.estado}</td>
                    <td>${r.imagenes}</td>
                    <td>${r.DNI_usuario}</td>
                    <td class="acciones">
                       <button class="btn-editar" data-id="${r.codigo_reclamo}">Editar</button>
                       ${['pendiente', 'en proceso'].includes(r.estado) ? `<button class="btn-cancelar" data-id="${r.codigo_reclamo}">Cancelar</button>` : ''}
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Evento para editar reclamo 
            document.querySelectorAll('.btn-editar').forEach(btn => {
                btn.addEventListener('click', function () {
                    editarReclamo(this.dataset.id);
                });
            });

            // Eventos para cancelar
            document.querySelectorAll('.btn-cancelar').forEach(btn => {
                btn.addEventListener('click', function () {
                    if (confirm('¿Seguro que deseas cancelar este turno?')) {
                        cancelarReclamo(this.dataset.id);
                    }
                });
            });

        });
}

//Cancelar Reclamo 
function cancelarReclamo(codigo_reclamo) {
    fetch(`/api/2.0/reclamos/cancelar/${codigo_reclamo}`, {
        method: 'PUT'
    })
        .then(res => res.json())
        .then(data => {
            alert(data.mensaje || 'Reclamo cancelado');
            cargarReclamos();
        })
        .catch(() => alert('Error al cancelar reclamo'));
}

// Editar turno (carga los datos en el formulario para editar)
function editarReclamo(codigo_reclamo) {
    fetch(`/api/2.0/reclamos/${codigo_reclamo}`)
        .then(res => res.json())
        .then(reclamo => {
            const form = document.getElementById('formReclamo');
            // Fecha
            const [fecha_reclamo] = reclamo.fecha_reclamo;
            form.fecha_reclamo.value = fecha_reclamo;

            fetch(`/api/1.0/personal_asignado?sector_a_cargo=${encodeURIComponent(personalAsignado.sector_a_cargo)}`)
                .then(res => res.json())
                .then(personalAsignado => {
                    form.sector_a_cargoSelect.value = personalAsignado.sector_a_cargo;
                    // Cargar el personal Asignado de ese sector
                    fetch(`/api/1.0/personal_asignado?sector_a_cargo=${encodeURIComponent(personalAsignado.sector_a_cargo)}`)
                        .then(res => res.json())
                        .then(personalAsignado => {
                            const personalAsignadoSelect = form.personalAsignadoSelect;
                            personalAsignadoSelect.innerHTML = '<option value="">Seleccione personal asignado</option>';
                            personalAsignado.forEach(p => {
                                const option = document.createElement('option');
                                option.value = p.id_personal;
                                option.textContent = `${p.nombre} (Email: ${p.email})`;
                                personalAsignadoSelect.appendChild(option);
                            });
                            personalAsignadoSelect.value = reclamo.personalAsignado;
                        });
                });
            // Cargamos los demás campos del reclamo
            form.codigo_reclamo.value = reclamo.codigo_reclamo;
            form.tipo_reclamo.value = reclamo.tipo_reclamo;
            form.descripcion.value = reclamo.descripcion;
            form.ubicacion.value = reclamo.ubicacion;
            form.fecha_reclamo.value = reclamo.fecha_reclamo;
            // Normalizamos a minúsculas para que coincida con los valores de las opciones del HTML
            form.estado.value = reclamo.estado.toLowerCase();
            form.imagenes.value = reclamo.imagenes;
            form.DNI_usuario.value = reclamo.DNI_usuario;
            form.dataset.editando = codigo_reclamo;
            form.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';
        });

}

// Buscar reclamos por DNI de usuario
document.getElementById('formBuscarReclamos').addEventListener('submit', function (e) {
    e.preventDefault();
    const dni = document.getElementById('dniUsuarioBuscar').value.trim();
    if (!dni) return;

    fetch(`/api/2.0/reclamos/usuario/${dni}`)
        .then(res => res.json())
        .then(resp => {
            // Si el backend responde con un array de reclamos
            const reclamos = Array.isArray(resp) ? resp : resp.reclamos;
            const div = document.getElementById('reclamosUsuario');
            if (!Array.isArray(reclamos) || reclamos.length === 0) {
                div.innerHTML = '<p>No se encontraron reclamos para este usuario.</p>';
                return;
            }
            let html = '<h3>Reclamos del usuario</h3><ul>';
            reclamos.forEach(r => {
                html += `<li>
                    <strong>Código:</strong> ${r.codigo_reclamo} |
                    <strong>Tipo:</strong> ${r.tipo_reclamo} |
                    <strong>Descripción:</strong> ${r.descripcion} |
                    <strong>Ubicación:</strong> ${r.ubicacion} |
                    <strong>Fecha:</strong> ${r.fecha_reclamo} |
                    <strong>Estado:</strong> ${r.estado}
                </li>`;
            });
            html += '</ul>';
            div.innerHTML = html;
        })
        .catch(() => {
            document.getElementById('reclamosUsuario').innerHTML = '<p>Error al buscar reclamos.</p>';
        });
});

// Mostrar los reclamos del usuario en el HTML
function mostrarReclamosUsuario(reclamos) {
    let html = '';
    reclamos.forEach(r => {
        html += `<li>
            <strong>Código:</strong> ${r.codigo_reclamo} |
            <strong>Tipo:</strong> ${r.tipo_reclamo} |
            <strong>Descripción:</strong> ${r.descripcion} |
            <strong>Ubicación:</strong> ${r.ubicacion} |
            <strong>Fecha:</strong> ${r.fecha_reclamo} |
            <strong>Estado:</strong> ${r.estado}
        </li>`;
    });
    document.getElementById('reclamosUsuario').innerHTML = html;
}


// Modificar el submit del formulario para editar o crear un reclamo

document.getElementById('formReclamo').addEventListener('submit', function (e) {
    e.preventDefault();
    const form = e.target;

    const data = {
        codigo_reclamo: form.dataset.editando,
        tipo_reclamo: form.tipo_reclamo.value,
        descripcion: form.descripcion.value,
        ubicacion: form.ubicacion.value,
        fecha_reclamo: form.fecha_reclamo.value,
        estado: form.estado.value,
        imagenes: form.imagenes.value,
        DNI_usuario: form.DNI_usuario.value,
        personal_asignado: form.personal_asignado ? form.personal_asignado.value : null
    };

    // Log para depuración
    console.log('Datos enviados al backend:', data);

    if (form.dataset.editando) {
        // Modo edición
        fetch('/api/2.0/reclamos/modificar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(res => res.json().then(json => ({ ok: res.ok, json })))
            .then(resp => {
                if (!resp.ok) {
                    // Usamos resp.json.error que es el formato que devuelve el backend
                    alert(resp.json.error || 'No se pudo modificar el reclamo.');
                    return;
                }
                // Mostramos un mensaje más específico con el nuevo estado.
                const reclamoActualizado = resp.json.reclamo;
                alert(`Reclamo modificado con éxito. El nuevo estado es: '${reclamoActualizado.estado}'.`);

                // En lugar de recargar toda la tabla, actualizamos solo la fila modificada
                const fila = document.querySelector(`#tablaReclamos tbody tr[data-codigo-reclamo="${reclamoActualizado.codigo_reclamo}"]`);
                if (fila) {
                    // Actualizamos el contenido de cada celda en la fila
                    fila.cells[1].textContent = reclamoActualizado.tipo_reclamo;
                    fila.cells[2].textContent = reclamoActualizado.descripcion || '';
                    fila.cells[3].textContent = reclamoActualizado.ubicacion;
                    fila.cells[4].textContent = reclamoActualizado.fecha_reclamo;
                    fila.cells[5].textContent = reclamoActualizado.estado;
                    fila.cells[6].textContent = reclamoActualizado.imagenes;
                    fila.cells[7].textContent = reclamoActualizado.DNI_usuario;

                    // Actualizamos la visibilidad del botón "Cancelar"
                    const celdaAcciones = fila.querySelector('.acciones');
                    const botonCancelarExistente = celdaAcciones.querySelector('.btn-cancelar');

                    if (['pendiente', 'en proceso'].includes(reclamoActualizado.estado)) {
                        if (!botonCancelarExistente) {
                            // Si no existe, lo creamos y añadimos
                            const botonCancelar = document.createElement('button');
                            botonCancelar.className = 'btn-cancelar';
                            botonCancelar.dataset.id = reclamoActualizado.codigo_reclamo;
                            botonCancelar.textContent = 'Cancelar';
                            botonCancelar.addEventListener('click', () => {
                                if (confirm('¿Seguro que deseas cancelar este turno?')) {
                                    cancelarReclamo(reclamoActualizado.codigo_reclamo);
                                }
                            });
                            celdaAcciones.appendChild(botonCancelar);
                        }
                    } else if (botonCancelarExistente) {
                        // Si existe pero no debería, lo eliminamos
                        botonCancelarExistente.remove();
                    }
                } else {
                    // Si por alguna razón no se encuentra la fila, recargamos toda la tabla como fallback
                    cargarReclamos();
                }

                form.reset();
                delete form.dataset.editando;
                form.querySelector('button[type="submit"]').textContent = 'Crear Reclamo';
            });
    } else {
        // Modo alta
        fetch('/api/2.0/reclamos/nuevo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(res => res.json().then(json => ({ ok: res.ok, json })))
            .then(resp => {
                if (!resp.ok) {
                    alert(resp.json.error || 'No se pudo registrar el reclamo');
                    return;
                }
                alert(resp.json.mensaje || 'Reclamo registrado');
                form.reset();
                cargarReclamos();
            });
    }
});

function mostrarDatosReclamo(reclamo) {
    document.getElementById('datoNumero').textContent = reclamo.codigo_reclamo;
    document.getElementById('datoTipo').textContent = reclamo.tipo_reclamo;
    document.getElementById('datoDescripcion').textContent = reclamo.descripcion;
    document.getElementById('datoUbicacion').textContent = reclamo.ubicacion;
    document.getElementById('datoEstado').textContent = reclamo.estado;

    // Mostrar/ocultar botones según el estado
    const btnEditar = document.getElementById('btnEditarReclamo');
    const btnCancelar = document.getElementById('btnCancelarReclamo');
    if (['pendiente', 'en proceso'].includes(reclamo.estado)) {
        btnEditar.style.display = '';
        btnCancelar.style.display = '';
        btnEditar.onclick = () => editarReclamo(reclamo.codigo_reclamo);
        btnCancelar.onclick = () => cancelarReclamo(reclamo.codigo_reclamo);
    } else {
        btnEditar.style.display = 'none';
        btnCancelar.style.display = 'none';
    }
}




// Buscar reclamo por número
document.getElementById('btnBuscarReclamo').addEventListener('click', function () {
    const numero = document.getElementById('numeroReclamo').value.trim();
    if (!numero) return alert('Ingresá un número de reclamo');

    fetch(`/api/2.0/reclamos/${numero}`)
        .then(res => res.json())
        .then(reclamo => {
            if (!reclamo || reclamo.error) {
                alert('No se encontró el reclamo');
                return;
            }
            mostrarDatosReclamo(reclamo);
        })
        .catch(() => alert('Error al buscar el reclamo'));
});

// Cargar todos los reclamos al iniciar la página
document.addEventListener('DOMContentLoaded', cargarReclamos);