document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const formBuscar = document.getElementById('formBuscarReclamo');
    const codigoReclamoInput = document.getElementById('codigoReclamo');
    const resultadoSection = document.getElementById('resultadoReclamo');
    const mensajeError = document.getElementById('mensaje-error');

    // Elementos de la vista de datos
    const viewMode = document.getElementById('view-mode');
    const datoCodigo = document.getElementById('datoCodigo');
    const datoTipo = document.getElementById('datoTipo');
    const datoDescripcion = document.getElementById('datoDescripcion');
    const datoUbicacion = document.getElementById('datoUbicacion');
    const datoFecha = document.getElementById('datoFecha');
    const datoEstado = document.getElementById('datoEstado');

    // Elementos del formulario de edición
    const editModeForm = document.getElementById('edit-mode');
    const editTipoReclamo = document.getElementById('editTipoReclamo');
    const editDescripcion = document.getElementById('editDescripcion');
    const editUbicacion = document.getElementById('editUbicacion');
    const editEstado = document.getElementById('editEstado');

    // Botones de acción
    const botonesPrincipales = document.getElementById('botones-principales');
    const btnEditar = document.getElementById('btn-editar');
    const btnCancelarReclamo = document.getElementById('btn-cancelar-reclamo');
    const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');

    let reclamoActual = null; // Para guardar los datos del reclamo encontrado

    // --- FUNCIÓN PARA MOSTRAR DATOS DEL RECLAMO ---
    function mostrarDatosReclamo(reclamo) {
        reclamoActual = reclamo; // Guardamos el reclamo para futuras acciones

        // Poblamos los campos de la vista
        datoCodigo.textContent = reclamo.codigo_reclamo || 'N/A';
        datoTipo.textContent = reclamo.tipo_reclamo || 'N/A';
        datoDescripcion.textContent = reclamo.descripcion || 'N/A';
        datoUbicacion.textContent = reclamo.ubicacion || 'N/A';
        datoFecha.textContent = new Date(reclamo.fecha_reclamo).toLocaleDateString('es-AR');
        
        const estado = reclamo.estado || 'N/A';
        datoEstado.textContent = estado;
        // Limpiamos clases de estado anteriores y aplicamos la nueva
        datoEstado.className = 'estado-label';
        // Convertimos el estado a un nombre de clase CSS válido y estándar,
        // reemplazando espacios y caracteres especiales (como /) por guiones.
        // ej: "En Proceso" -> "estado-en-proceso", "N/A" -> "estado-n-a"
        const claseEstado = `estado-${estado.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        datoEstado.classList.add(claseEstado);

        // Mostramos la sección de resultados en modo vista
        resultadoSection.style.display = 'block';
        viewMode.style.display = 'block';
        editModeForm.style.display = 'none';
        botonesPrincipales.style.display = 'flex';
        mensajeError.style.display = 'none';
    }

    // --- 1. LÓGICA DE BÚSQUEDA ---
    formBuscar.addEventListener('submit', async (event) => {
        // 1. Prevenimos que el formulario recargue la página
        event.preventDefault();
        const codigoReclamo = codigoReclamoInput.value;
        if (!codigoReclamo.trim()) {
            alert('Por favor, ingresá un código de reclamo.');
            return;
        }
        resultadoSection.style.display = 'none';
        mensajeError.style.display = 'none';

        try {
            const response = await fetch(`/api/2.0/reclamos/${codigoReclamo}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `No se encontró el reclamo con el código ${codigoReclamo}.` }));
                throw new Error(errorData.message);
            }
            const reclamo = await response.json();
            mostrarDatosReclamo(reclamo);
        } catch (error) {
            console.error('Error al buscar el reclamo:', error);
            mensajeError.textContent = error.message || 'Ocurrió un error al buscar el reclamo. Por favor, intentá de nuevo.';
            mensajeError.style.display = 'block';
        }
    });

    // --- 2. LÓGICA PARA ENTRAR EN MODO EDICIÓN ---
    btnEditar.addEventListener('click', () => {
        if (!reclamoActual) return;

        // Llenamos el formulario de edición con los datos actuales
        editTipoReclamo.value = reclamoActual.tipo_reclamo;
        editDescripcion.value = reclamoActual.descripcion;
        editUbicacion.value = reclamoActual.ubicacion;
        // Normalizamos a minúsculas para que coincida con los valores de las opciones del HTML
        editEstado.value = reclamoActual.estado.toLowerCase();

        // Ocultamos la vista y mostramos el formulario de edición
        viewMode.style.display = 'none';
        botonesPrincipales.style.display = 'none';
        editModeForm.style.display = 'block';
    });

    // --- 3. LÓGICA PARA CANCELAR LA EDICIÓN ---
    btnCancelarEdicion.addEventListener('click', () => {
        // Ocultamos el formulario y volvemos a la vista normal
        editModeForm.style.display = 'none';
        viewMode.style.display = 'block';
        botonesPrincipales.style.display = 'flex';
    });

    // --- 4. LÓGICA PARA GUARDAR LOS CAMBIOS (EDITAR) ---
    editModeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!reclamoActual) return;

        const datosActualizados = {
            tipo_reclamo: editTipoReclamo.value,
            descripcion: editDescripcion.value,
            ubicacion: editUbicacion.value,
            estado: editEstado.value,
        };

        try {
            const response = await fetch(`/api/2.0/reclamos/${reclamoActual.codigo_reclamo}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosActualizados),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudo actualizar el reclamo.');
            }

            const reclamoActualizado = await response.json();
            alert('Reclamo actualizado con éxito.');
            mostrarDatosReclamo(reclamoActualizado); // Refrescamos la vista con los nuevos datos

        } catch (error) {
            console.error('Error al actualizar el reclamo:', error);
            alert(`Error: ${error.message}`);
        }
    });

    // --- 5. LÓGICA PARA CANCELAR EL RECLAMO (ELIMINAR) ---
    btnCancelarReclamo.addEventListener('click', async () => {
        if (!reclamoActual) return;

        const confirmacion = confirm('¿Estás seguro de que querés cancelar este reclamo? Esta acción no se puede deshacer.');

        if (confirmacion) {
            try {
                const response = await fetch(`/api/2.0/reclamos/${reclamoActual.codigo_reclamo}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'No se pudo cancelar el reclamo.');
                }

                alert('Reclamo cancelado con éxito.');
                // Limpiamos la pantalla
                resultadoSection.style.display = 'none';
                codigoReclamoInput.value = '';
                reclamoActual = null;

            } catch (error) {
                console.error('Error al cancelar el reclamo:', error);
                alert(`Error: ${error.message}`);
            }
        }
    });
});