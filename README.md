# Sistema de Gestión de Reclamos Ciudadanos (SGRC)

Este proyecto es una aplicación web diseñada para la gestión de reclamos o incidencias ciudadanas. Permite a los usuarios registrar, consultar, modificar y cancelar reclamos. El sistema cuenta con un backend desarrollado en Node.js y Express, y un frontend para la interacción del usuario.

## Características Principales

*   **Servidor Backend:** Construido con Express.js para manejar las peticiones API.
*   **API REST:** Provee endpoints para gestionar reclamos, personal y usuarios.
*   **Interfaz de Usuario:** Páginas estáticas (HTML, CSS, JS) para que los usuarios puedan interactuar con el sistema.
*   **Gestión de Reclamos:**
    *   Buscar un reclamo existente por su código.
    *   Visualizar los detalles de un reclamo.
    *   Editar la información de un reclamo (tipo, descripción, ubicación, estado).
    *   Cancelar un reclamo.
*   **Manejo de Errores:** Middleware centralizado para una gestión de errores consistente.

## Tecnologías Utilizadas

*   **Backend:**
    *   Node.js
    *   Express.js
    *   CORS
*   **Frontend:**
    *   HTML5
    *   CSS3
    *   JavaScript (Vanilla, con `fetch` para peticiones asíncronas)

## Instalación y Puesta en Marcha

1.  Clona el repositorio en tu máquina local.
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd SGRC
    ```

2.  Instala las dependencias del proyecto. Es necesario estar en el directorio raíz del proyecto.
    ```bash
    npm install
    ```

3.  Inicia el servidor.
    ```bash
    node app.js
    ```

4.  El servidor estará corriendo en `http://localhost:3020`. Puedes acceder a la aplicación abriendo esa URL en tu navegador.

## API Endpoints

A continuación se detallan los endpoints de la API disponibles en el proyecto.

---

### Módulo de Reclamos

**Ruta base:** `/api/2.0/reclamos`

Estos endpoints son responsables de toda la lógica de negocio relacionada con los reclamos de los ciudadanos. La información se ha inferido del archivo `public/js/consultar-reclamo.js`.

| Método   | Ruta               | Descripción                                                              | Body (Ejemplo)                                                                       | Respuesta Exitosa (200 OK)                                       |
| :------- | :----------------- | :----------------------------------------------------------------------- | :----------------------------------------------------------------------------------- | :--------------------------------------------------------------- |
| `GET`    | `/:codigo_reclamo` | Obtiene los detalles de un reclamo específico a través de su código.     | N/A                                                                                  | `{"codigo_reclamo": "...", "descripcion": "...", ...}`            |
| `PUT`    | `/:codigo_reclamo` | Actualiza la información de un reclamo existente.                        | `{"tipo_reclamo": "...", "descripcion": "...", "ubicacion": "...", "estado": "..."}` | `{"codigo_reclamo": "...", ...}` (el reclamo actualizado)         |
| `DELETE` | `/:codigo_reclamo` | Cancela un reclamo.                                                      | N/A                                                                                  | `{"message": "Reclamo cancelado exitosamente"}`                  |
| `POST`   | `/`                | *(Asumido)* Crea un nuevo reclamo en el sistema.                         | `{"tipo_reclamo": "...", "descripcion": "...", "ubicacion": "..."}`                  | `{"message": "Reclamo creado", "codigo_reclamo": "..."}`         |
| `GET`    | `/`                | *(Asumido)* Obtiene una lista de todos los reclamos.                     | N/A                                                                                  | `[{"codigo_reclamo": "..."}, {"codigo_reclamo": "..."}]`          |

> **Nota:** Los endpoints `POST /` y `GET /` son asumidos, ya que son operaciones comunes en un sistema CRUD (Crear, Leer, Actualizar, Borrar) y complementan la funcionalidad existente.

---

### Módulo de Personal Asignado

**Ruta base:** `/api/1.0/personal_asignado`

Gestiona al personal municipal o de la empresa que se encarga de resolver los reclamos.

*(Los endpoints específicos como `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id` están definidos en el archivo `rutas/personalAsignadoRouter.js` y probablemente sigan un patrón CRUD estándar).*

---

### Módulo de Usuarios Ciudadanos

**Ruta base:** `/api/3.0/usuarios_ciudadanos`

Gestiona la información de los ciudadanos que utilizan el sistema para registrar reclamos.

*(Los endpoints específicos como `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id` están definidos en el archivo `rutas/usuariosCiudadanosRouter.js` y probablemente sigan un patrón CRUD estándar).*

---

## Estructura del Proyecto

```
SGRC/
├── public/             # Archivos estáticos (HTML, CSS, JS del cliente)
├── rutas/              # Definiciones de los routers de Express
├── middlewares/        # Middlewares personalizados (ej. errorHandler)
├── node_modules/       # Dependencias del proyecto
├── app.js              # Archivo principal de la aplicación, punto de entrada
└── package.json        # Metadatos y dependencias del proyecto
```

