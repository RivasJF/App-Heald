<div align="center">
  <img src="https://private-user-images.githubusercontent.com/130021805/531635763-304987d7-4c68-4e63-b39c-7ff366d3a835.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Njc0NTY0NTgsIm5iZiI6MTc2NzQ1NjE1OCwicGF0aCI6Ii8xMzAwMjE4MDUvNTMxNjM1NzYzLTMwNDk4N2Q3LTRjNjgtNGU2My1iMzljLTdmZjM2NmQzYTgzNS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwMTAzJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDEwM1QxNjAyMzhaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1kMzE0NjM0YzAzYjEwZmU3MmM1ZTkzOGQwNzBmMDI1Zjc1ZmNmMGRmYTc3YTJjMDNjZWM0NGVlNTNmNGE5OWY1JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.xGb4izBZjenUwrM2HJJIKEM3C9YoWcYjF6aKCmLM2HA" width="120" alt="Heald Logo" style="border-radius: 50%;"/>
</div>

<h1 align="center">Heald - Frontend</h1>

## Description

Heald es la aplicación móvil para un sistema de gestión de citas médicas, diseñada para agilizar la interacción entre pacientes y doctores. Construida con [React Native](https://reactnative.dev/) y [Expo](https://expo.dev/), ofrece una experiencia de usuario fluida y moderna para plataformas iOS y Android.

Este proyecto utiliza [Expo Router](https://docs.expo.dev/router/introduction/) para la navegación y una estructura de archivos intuitiva. La aplicación se comunica con un backend dedicado para manejar la lógica de negocio y la persistencia de datos, asegurando una arquitectura desacoplada y escalable.

### Características Principales

#### Para Pacientes
-   **Autenticación de Usuarios:** Sistema de registro e inicio de sesión seguro.
-   **Búsqueda de Doctores:** Encuentra doctores y consulta sus perfiles y horarios.
-   **Agendamiento de Citas:** Agenda, consulta y gestiona tus citas médicas de forma sencilla.
-   **Gestión de Perfil:** Actualiza tu información personal y de contacto.

#### Para Doctores
-   **Gestión de Clínicas:** Registra y administra la información de uno o más consultorios.
-   **Configuración de Horarios:** Define tus horarios de trabajo, descansos y días libres.
-   **Gestión de Citas:** Visualiza y administra las citas agendadas por los pacientes.
-   **Perfil Profesional:** Maneja tu perfil público, incluyendo especialidades y ubicación.

## Getting Started

Sigue estos pasos para ejecutar la aplicación en un entorno de desarrollo local.

#### 1. Pre-requisitos
Asegúrate de tener Node.js y npm (o yarn) instalados. También necesitarás la aplicación [Expo Go](https://expo.dev/go) en tu dispositivo móvil (iOS o Android) o un emulador configurado en tu computadora.

#### 2. Instalar Dependencias
Clona el repositorio y luego instala las dependencias del proyecto.
```bash
$ npm install
```

#### 3. Configuración del Entorno
La configuración de la conexión con el backend se encuentra en el archivo `src/services/api.js`. Para un entorno de desarrollo local, es crucial que el host de la API sea la dirección IP de tu máquina en la red local.

Abre el archivo `src/services/api.js` y modifica la constante `LOCAL`:
```javascript
// Reemplaza '192.168.0.27' con la dirección IP de tu máquina
const LOCAL = 'TU_DIRECCION_IP_LOCAL:3000';
```
Asegúrate de que el backend de Heald se esté ejecutando y sea accesible en esa dirección.

#### 4. Ejecutar la Aplicación
Finalmente, inicia el servidor de desarrollo de Expo.
```bash
# Iniciar el servidor de Metro Bundler
$ npx expo start
```
Esto abrirá una página en tu navegador con un código QR. Escanea este código con la aplicación Expo Go en tu dispositivo para abrir la aplicación.

## Estructura del Proyecto

El proyecto sigue una estructura de carpetas organizada para facilitar el mantenimiento y la escalabilidad:

-   `app/`: Contiene todas las pantallas y la lógica de navegación, utilizando Expo Router.
    -   `(auth)/`: Flujos de autenticación (login, registro).
    -   `(app)/`: Pantallas principales de la aplicación post-autenticación.
        -   `(clientes)/`: Flujo específico para usuarios pacientes.
        -   `(doctor)/`: Flujo específico para usuarios doctores.
-   `src/`: Código fuente reutilizable y lógica de negocio.
    -   `context/`: Proveedores de contexto de React (ej. AuthContext).
    -   `services/`: Módulos para interactuar con la API del backend.
-   `assets/`: Imágenes, fuentes y otros recursos estáticos.

## License
Este proyecto está licenciado bajo los términos de la [Licencia MIT](LICENSE).