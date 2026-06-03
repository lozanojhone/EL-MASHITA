# Sistema Web Informativo para Evento de Fútbol

Sistema web simple que permite promocionar el evento, registrar equipos, administrar inscripciones y generar PDFs sin usar base de datos externa.

## Características

- Página principal con información del evento, categorías y sección de comida.
- Formulario de inscripción para equipos con 6 jugadores titulares y 2 suplentes.
- Panel de administración privado con inicio de sesión.
- Visualización de equipos registrados, búsqueda por nombre y total de inscripciones.
- Generación y descarga de PDF con ficha de inscripción de cada equipo.
- Almacenamiento de datos en archivos JSON locales.

## Instalación

1. Abre una terminal en la carpeta del proyecto.
2. Ejecuta:

```bash
npm install
```

3. Inicia el servidor:

```bash
npm start
```

4. Abre en el navegador:

```
http://localhost:3000
```

## Credenciales de administrador

- Usuario: `admin`
- Contraseña: `Futbol2026`

Puedes modificar los datos en `data/config.json`.

## Estructura principal

- `app.js`: Servidor Express, rutas, almacenamiento en JSON y generación de PDF.
- `data/teams.json`: Registros de equipos.
- `data/config.json`: Configuración del evento y credenciales de administrador.
- `views/`: Plantillas EJS.
- `public/`: Estilos y scripts.

## Observaciones

- Este sistema no usa base de datos tradicional.
- Los datos se mantienen mientras el servidor esté en ejecución y se guardan en archivos locales.
- Para producción, protege el archivo de configuración y cambia el secreto de sesión.
