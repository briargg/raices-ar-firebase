# Raíces AR

Plataforma web para ayudar a migrantes a integrarse en Argentina: plan de arribo personalizado, mapa de servicios, red de padrinos y alertas.

## Stack

- React 18 + React Router
- Firebase (Auth, Firestore, Storage, Analytics)
- Tailwind CSS
- react-hot-toast, react-icons

## Instalación

```bash
npm install
npm start
```

La app queda disponible en `http://localhost:3000`.

## Variables de entorno

El archivo `.env` ya incluye la configuración de Firebase provista. Si vas a usar tu propio proyecto de Firebase, reemplazá los valores por los de tu consola de Firebase (Project settings → General → Your apps → SDK setup and configuration).

⚠️ **Importante**: estas claves son públicas por diseño en apps web de Firebase, pero la seguridad real depende de las **reglas de Firestore/Storage**. Configurá reglas antes de llevar esto a producción.

## Estructura

```
src/
├── components/     Componentes reutilizables (Navbar, ServiceCard, PrivateRoute, LoadingSpinner)
├── pages/          Páginas de la app (Home, Login, Register, Dashboard, Plan, Profile, Services, Padrinos, Alerts)
├── services/       Lógica de acceso a Firebase (auth, users, plans, services, padrinos, alerts)
├── utils/          Helpers y constantes compartidas
└── styles/         CSS global con Tailwind
```

## Notas de esta build

- Se agregaron `PadrinosPage.jsx` y `AlertsPage.jsx`, que faltaban en el export original pero ya estaban referenciadas en `App.jsx` y `Navbar.jsx`.
- Se corrigió un bug en `src/services/authService.js`: `loginWithGoogle` usaba `getDoc` y `doc` sin importarlos desde `./firebase`.
- Se agregó `postcss.config.js` y las dependencias `autoprefixer`/`postcss`, necesarias para que Tailwind compile correctamente con `react-scripts`.

## Pendiente / recomendado antes de producción

- Definir reglas de seguridad de Firestore y Storage (no incluidas en este export).
- Reemplazar el chequeo de admin hardcodeado (`email === 'admin@raicesar.com'`) por un campo `role: 'admin'` en Firestore.
- Revisar el escalado de `getNearbyServices` y `getAlertsForUser`, que actualmente traen toda la colección y filtran en el cliente.
