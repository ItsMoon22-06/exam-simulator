# Simulador de exámenes con estadísticas

Aplicación web Full Stack: **React (JSX)** + **Express (Node.js)** + **PostgreSQL en Neon**.
Permite presentar exámenes cronometrados, calificarlos en el servidor y consultar estadísticas
personales (promedio, evolución, preguntas más falladas) y un ranking.

```
exam-simulator/
├── database/          schema.sql + seed.sql (PostgreSQL / Neon)
├── backend/           API Express (src/routes, src/db.js, scripts/init-db.js)
├── frontend/          React + Vite (src/components/*.jsx)
├── docs/              DOCUMENTACION.md (casos de uso, arquitectura, despliegue)
├── render.yaml        Blueprint de despliegue
└── package.json       Scripts raíz (build / start)
```

## 1. Crear la base de datos en Neon

1. Entra a https://neon.tech, crea una cuenta y un proyecto nuevo (por ejemplo `exam-simulator`).
2. En el panel del proyecto pulsa **Connect** y copia la *connection string*
   (`postgresql://usuario:password@ep-xxxx.neon.tech/neondb?sslmode=require`).
3. Crea las tablas y los datos de ejemplo de **una** de estas dos formas:
   - **SQL Editor de Neon:** pega y ejecuta primero `database/schema.sql` y luego `database/seed.sql`.
   - **Por consola:** `cd backend && cp .env.example .env`, pega tu cadena en `DATABASE_URL`, y ejecuta `npm install && npm run db:init`.

## 2. Ejecutar en local

```bash
# Terminal 1 - API (http://localhost:4000)
cd backend
cp .env.example .env      # y edita DATABASE_URL
npm install
npm run dev

# Terminal 2 - Frontend (http://localhost:5173, con proxy a /api)
cd frontend
npm install
npm run dev
```

Comprueba la conexión con la base de datos en http://localhost:4000/api/health.

## 3. Despliegue (Express sirve el build de React)

Se despliega **un solo servicio**: `npm run build` compila React a `frontend/dist` y Express lo sirve junto a la API,
así que no hay problemas de CORS ni de URLs.

**En Render (gratis):**
1. Sube el proyecto a un repositorio de GitHub.
2. En Render: **New → Web Service** → conecta el repositorio.
3. Configura:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Variable de entorno `DATABASE_URL` = tu cadena de Neon
   - Variable de entorno `NODE_VERSION` = `22`
   - (Opcional) Health Check Path: `/api/health`
   También puedes usar `render.yaml` con **New → Blueprint**.
4. Al terminar el despliegue abre la URL pública `https://tu-app.onrender.com`.

> En el plan gratuito de Render el servicio se duerme tras unos minutos de inactividad; la primera carga puede tardar ~30 s.

### Evidencia del despliegue (para el entregable)
- Captura del proyecto y las tablas en el panel de Neon (Tables / SQL Editor).
- Captura del servicio en Render con estado **Live** y los logs del build.
- Captura de `https://tu-app.onrender.com/api/health` mostrando `{"status":"ok","database":"connected"}`.
- Capturas de la app funcionando en la URL pública: lista de exámenes, examen en curso, resultado y estadísticas.
- Enlace al repositorio de GitHub y URL pública.

## API REST

| Método | Ruta | Descripción |
|-------:|------|-------------|
| GET | `/api/health` | Estado del servidor y de la conexión a Neon |
| GET | `/api/exams` | Lista de exámenes con métricas globales |
| GET | `/api/exams/:id` | Examen con preguntas y opciones (sin respuesta correcta) |
| POST | `/api/attempts` | Califica y guarda un intento: `{ username, examId, durationSeconds, answers:[{questionId, optionId}] }` |
| GET | `/api/stats/user/:username` | Resumen, historial, promedio por examen y preguntas más falladas |
| GET | `/api/stats/ranking` | Top 10 por promedio |
| GET | `/api/stats/overview` | Totales de la plataforma |

## Agregar más exámenes
Inserta filas en `exams`, `questions` y `options` (una opción por pregunta con `is_correct = TRUE`),
o amplía `database/seed.sql`.
