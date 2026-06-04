# Sistema Web Informativo para Evento de Fútbol

Proyecto web para la inauguración de un campeonato de fútbol con:

- Página principal atractiva y responsiva.
- Inscripción de equipos mediante formulario.
- Panel administrativo seguro con inicio de sesión.
- Almacenamiento local de registros en archivo JSON.
- Generación de PDF para cada ficha de inscripción.

## Estructura

- `index.html` - Página principal del evento.
- `admin.html` - Panel administrativo.
- `server.js` - Servidor Express para gestionar inscripciones, autenticación y PDF.
- `data/teams.json` - Archivo de datos con inscripciones.
- `assets/css/style.css` - Estilos visuales.
- `assets/js/main.js` - Lógica de registro.
- `assets/js/admin.js` - Lógica del panel administrativo.

## Uso

1. Instalar dependencias:

```bash
npm install
```

2. Iniciar el servidor:

```bash
npm start
```

3. Abrir en el navegador:

- `http://localhost:3000`
- `http://localhost:3000/admin.html`

## Credenciales del administrador

- Usuario: `admin`
- Contraseña: `Futbol2026!`

## Notas

La información se guarda en `data/teams.json`, por lo que no se utiliza una base de datos externa.
