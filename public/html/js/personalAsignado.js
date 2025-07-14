document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formPersonal_asignado');
    const tbody = document.querySelector('#tablaPersonal_asignado tbody');

    // 1. Cargar personal al iniciar
    cargarPersonalAsignado();

    // 2. Usar delegación de eventos para los botones de la tabla
    tbody.addEventListener('click', (event) => {
        const target = event.target;
        const id_personal = target.dataset.id_personal;

        if (target.classList.contains('btn-editar')) {
            cargarDatosParaEditar(id_personal);
        }

        if (target.classList.contains('btn-eliminar')) {
            if (confirm('¿Seguro de que deseas eliminar este personal asignado?')) {
                eliminarPersonal(id_personal);
            }
        }
    });

    // 3. Manejar el envío del formulario para crear o editar
    form.addEventListener('submit', guardarPersonal);
});

// --- FUNCIONES ---

async function cargarPersonalAsignado() {
    try {
        const response = await fetch('/api/1.0/personal_asignado');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const personalAsignado = await response.json();

        const tbody = document.querySelector('#tablaPersonal_asignado tbody');
        tbody.innerHTML = ''; // Limpiar tabla

        personalAsignado.forEach(p => {
            const tr = document.createElement('tr');

            // Celda de la foto
            const tdFoto = document.createElement('td');
            if (p.foto) {
                const img = document.createElement('img');
                // Usamos una ruta absoluta desde la raíz del sitio para que siempre funcione
                img.src = `/imagenesPersonalEncargado/${p.foto}`;
                img.alt = "foto";
                tdFoto.appendChild(img);
            }

            // Celdas de texto
            const tdId = document.createElement('td');
            tdId.textContent = p.id_personal;

            const tdNombre = document.createElement('td');
            tdNombre.textContent = p.nombre;

            const tdSector = document.createElement('td');
            tdSector.textContent = p.sector_a_cargo;

            const tdEmail = document.createElement('td');
            tdEmail.textContent = p.email;

            const tdTelefono = document.createElement('td');
            tdTelefono.textContent = p.telefono;

            // Celda de acciones
            const tdAcciones = document.createElement('td');
            // Creamos un div contenedor para los botones para que flexbox no interfiera con el alineado vertical de la celda.
            const divAcciones = document.createElement('div');
            divAcciones.className = 'acciones';


            const btnEditar = document.createElement('button');
            btnEditar.className = 'btn-editar';
            btnEditar.dataset.id_personal = p.id_personal;
            btnEditar.textContent = 'Editar';

            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn-eliminar';
            btnEliminar.dataset.id_personal = p.id_personal;
            btnEliminar.textContent = 'Eliminar';

            divAcciones.appendChild(btnEditar);
            divAcciones.appendChild(btnEliminar);
            tdAcciones.appendChild(divAcciones);

            tr.append(tdFoto, tdId, tdNombre, tdSector, tdEmail, tdTelefono, tdAcciones);
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error al cargar el personal:', error);
        alert('No se pudo cargar la lista de personal. Revisá la consola para más detalles.');
    }
}

async function cargarDatosParaEditar(id_personal) {
    try {
        const response = await fetch(`/api/1.0/personal_asignado/${id_personal}`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const personal = await response.json();

        const form = document.getElementById('formPersonal_asignado');
        form.id_personal.value = personal.id_personal;
        form.nombre.value = personal.nombre;
        form.sector_a_cargo.value = personal.sector_a_cargo;
        form.email.value = personal.email;
        form.telefono.value = personal.telefono;
        // No se puede precargar el input file por seguridad
        form.dataset.editando = id_personal;
        form.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';

        // Opcional: hacer scroll hasta el formulario
        form.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Error al cargar datos para editar:', error);
        alert('No se pudieron cargar los datos del personal.');
    }
}

async function eliminarPersonal(id_personal) {
    try {
        const response = await fetch(`/api/1.0/personal_asignado/${id_personal}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.mensaje || 'Error del servidor');
        }
        alert(data.mensaje || 'Personal Asignado eliminado');
        cargarPersonalAsignado(); // Recargar la lista
    } catch (error) {
        console.error('Error al eliminar el personal:', error);
        alert(`Error al eliminar el Personal Asignado: ${error.message}`);
    }
}

async function guardarPersonal(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const esEdicion = !!form.dataset.editando;

    let url = esEdicion ? '/api/1.0/personal_asignado/modificar' : '/api/1.0/personal_asignado/nuevo';
    // El backend espera POST para ambas operaciones, así que no cambiamos el método.
    let method = 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            body: formData
        });
        const resp = await response.json();
        if (!response.ok) {
            throw new Error(resp.mensaje || 'Error del servidor');
        }

        alert(resp.mensaje || (esEdicion ? 'Personal Asignado modificado' : 'Personal agregado'));
        form.reset();
        delete form.dataset.editando;
        form.querySelector('button[type="submit"]').textContent = 'Agregar';
        cargarPersonalAsignado();

    } catch (error) {
        console.error('Error al guardar el personal:', error);
        alert(`Error al guardar el Personal Asignado: ${error.message}`);
    }
}