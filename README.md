# nawal-planner-backend

API simple para gestionar Tareas y Metas, construida con Express.js.

## Características

*   Gestión de Tareas (CRUD básico - sin Update por el momento)
*   Gestión de Metas (CRUD básico - sin Update por el momento)
*   Almacenamiento de datos en memoria (los datos se pierden al reiniciar el servidor).
*   **Autenticación por API Key para endpoints de tareas y metas.**
*   Gestión de API Key mediante variables de entorno (`.env`).
*   Documentación de API con Swagger.
*   Pruebas unitarias/integración con Vitest y Supertest.

## Requisitos Previos

*   Node.js (v18.x o superior recomendado)
*   npm (generalmente viene con Node.js)
*   Docker (opcional, para ejecución en contenedor)

## Configuración de Variables de Entorno

Este proyecto utiliza un archivo `.env` para gestionar variables de entorno, como la API Key necesaria para la autenticación.

1.  Copia el archivo de ejemplo `.env.example` a un nuevo archivo llamado `.env` en la raíz del proyecto:
    ```bash
    cp .env.example .env
    ```
2.  Abre el archivo `.env` y reemplaza el valor de `API_KEY` con tu propia clave secreta.
    ```
    API_KEY=TU_PROPIA_API_KEY_SECRETA
    ```
    **Importante:** El archivo `.env` está incluido en `.gitignore` y no debe ser subido a repositorios públicos.

## Instalación

1.  Clona este repositorio (si aplica) o descarga los archivos.
2.  Navega al directorio del proyecto:
    ```bash
    cd nawal-planner-backend
    ```
3.  Asegúrate de haber configurado tu archivo `.env` como se describe en la sección anterior.
4.  Instala las dependencias:

    *   **Sin Docker:**
        ```bash
        npm install
        ```
    *   **Con Docker (para construir la imagen si es necesario o para asegurar el entorno):**
        El siguiente comando instalará las dependencias dentro de un contenedor efímero si `node_modules` no existe o está desactualizado. Los archivos `package-lock.json` y `node_modules` se crearán/actualizarán en tu directorio local.
        ```bash
        docker run --rm -it -v "${PWD}":/app -w /app node:22.15-alpine npm install
        ```

## Ejecución de la Aplicación

La API se ejecutará en `http://localhost:3000` por defecto. **Recuerda que para acceder a los endpoints `/tasks` y `/goals` necesitarás incluir tu API Key en el header `Authorization`.**

*   **Sin Docker:**
    Asegúrate de que tu archivo `.env` esté configurado.
    ```bash
    npm start
    ```

*   **Con Docker:**
    Para que Docker pueda acceder a las variables de entorno definidas en tu archivo `.env` local, puedes pasarlas al contenedor. Una forma común es usar la opción `--env-file`.
    ```bash
    docker run --rm -it -p 3000:3000 --env-file .env -v "${PWD}":/app -w /app node:22.15-alpine npm start
    ```
    Si `--env-file` no funciona como esperas o prefieres pasar variables individualmente:
    ```bash
    # Reemplaza TU_PROPIA_API_KEY_SECRETA con el valor de tu .env
    docker run --rm -it -p 3000:3000 -e "API_KEY=TU_PROPIA_API_KEY_SECRETA" -v "${PWD}":/app -w /app node:22.15-alpine npm start
    ```

## Ejecución de Pruebas

Las pruebas también necesitarán acceso a la `API_KEY` para los endpoints protegidos. Asegúrate de que tu archivo `.env` esté configurado.

*   **Sin Docker:**
    ```bash
    npm test
    ```

*   **Con Docker:**
    ```bash
    docker run --rm -it --env-file .env -v "${PWD}":/app -w /app node:22.15-alpine npm test
    ```
    O pasando la variable individualmente:
    ```bash
    # Reemplaza TU_PROPIA_API_KEY_SECRETA con el valor de tu .env
    docker run --rm -it -e "API_KEY=TU_PROPIA_API_KEY_SECRETA" -v "${PWD}":/app -w /app node:22.15-alpine npm test
    ```

## Documentación de la API (Swagger)

Una vez que la aplicación esté en ejecución, puedes acceder a la documentación interactiva de la API generada por Swagger en tu navegador:

[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

Desde esta interfaz, puedes ver todos los endpoints. Para los endpoints protegidos (`/tasks` y `/goals`), deberás autorizar tus peticiones usando el botón "Authorize" e introduciendo tu API Key.

## Endpoints de la API

**Autenticación:** Los endpoints `/tasks` y `/goals` requieren una API Key válida en el header `Authorization`.

### Tareas (`/tasks`)

*   `GET /tasks`: Obtiene todas las tareas.
*   `POST /tasks`: Crea una nueva tarea.
    *   Cuerpo esperado (JSON): `{ "name": "string", "description": "string", "dueDate": "YYYY-MM-DD" }`
*   `GET /tasks/:id`: Obtiene una tarea por su ID.
*   `DELETE /tasks/:id`: Elimina una tarea por su ID.

### Metas (`/goals`)

*   `GET /goals`: Obtiene todas las metas.
*   `POST /goals`: Crea una nueva meta.
    *   Cuerpo esperado (JSON): `{ "name": "string", "description": "string", "dueDate": "YYYY-MM-DD" }`
*   `GET /goals/:id`: Obtiene una meta por su ID.
*   `DELETE /goals/:id`: Elimina una meta por su ID.