
# Phishing Campaign Simulator

Full-stack training platform for planning, launching, and analysing phishing simulation campaigns.  
The UI is inspired by the [original Figma design](https://www.figma.com/design/QUQijTai5JB0M5ePh9VBtN/Phishing-Campaign-Simulator) and backed by a lightweight Node.js API so the app runs end to end out of the box.

## Quick Links
- [Product Overview](src/documentation/PRODUCT_OVERVIEW.md)
- [Backend API Specification](src/documentation/BACKEND_API.md)
- [SMTP / Email Setup](src/documentation/EMAIL_SETUP.md)

## Features

- **Dashboard analytics** – Consolidated KPIs with shortcuts to build or duplicate campaigns.
- **Template library & editor**
  - Drag-and-drop content blocks with inline editing.
  - Scrollable HTML import/export dialog sized consistently for all screens.
  - Tag management and merge tags injected into generated HTML.
- **Campaign builder** – Guided 4-step flow to select templates, recipients, scheduling, and review before launch.
- **Recipient management**
  - CSV upload with server-side parsing and validation.
  - Google Sheets ingestion (public CSV export) and directory text parsing.
  - Filter dialog (department/risk), search, inline add/remove, CSV export of current view.
- **Reports** – Campaign performance table, detail modal with metrics breakdown, one-click CSV export.
- **Team management** – Role-based access (Admin/Manager/Viewer), invite, edit, remove.
- **SMTP & notifications** – Provider presets (SendGrid, SES, Mailgun), test send, status refresh, SSL renew simulation.
- **Internationalisation** – English, Russian, and Uzbek translations with persistent language choice.

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Radix UI primitives, Tailwind‑style utility classes.
- **Backend**: Node.js (Express), PostgreSQL (native SQL), CORS.
- **Supporting libs**: `sonner` for toasts, `react-dnd` for the email editor, `lucide-react` icons.

## Key Workflows
1. **Configure SMTP**
   - Fill in Settings → SMTP (UI stores values in PostgreSQL database).
   - Environment variables override stored credentials; UI indicates overrides.
   - Send a test email and renew SSL (mock) directly from the panel.
2. **Design Templates**
   - Use block editor for visual authoring or import HTML in the dialog (scrollable textarea, tips panel, persistent footer).
   - Manage tags inline (add/remove) and they are embedded into exported HTML.
3. **Build Campaigns**
   - Choose template, recipients (import CSV/Sheets/directory), schedule, and confirm.
   - Campaign metrics update automatically on Dashboard and Reports.
4. **Monitor & Export**
   - Review campaign table, open detail modal for specific metrics, export CSV for analysis.

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Installation
```bash
npm install
```

### Database Setup
1. Create PostgreSQL database:
```bash
createdb phishlab
```

2. Run migrations:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/phishlab"
npm run migrate
```

### Development
Run UI and API together (recommended):
```bash
npm start
```
- Vite dev server: http://localhost:3000 (proxies `/api` to the backend)
- API server: http://localhost:4000

Run only the backend:
```bash
npm run backend
```

### Production Build
```bash
npm run build        # bundles the React app into frontend/build
npm run backend:build # compiles TypeScript backend
npm run backend:start # serves the API and the compiled frontend
```

### Environment Variables
- Copy `.env.example` to `.env` and populate values for local development (`cp .env.example .env`).
- Key variables:
  - `DATABASE_URL` – PostgreSQL connection string (required): `postgresql://user:password@localhost:5432/phishlab`
  - `DATABASE_SSL` – Set to `true` for SSL connections (default: `false`)
  - `PORT` – API + static bundle port (defaults to `4000` if unset).
  - `JWT_SECRET` – signing key for access tokens (always change from the sample value).
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` – runtime email settings (see [Email Setup](src/documentation/EMAIL_SETUP.md) for full guidance).
- Settings defined in `.env` are loaded automatically via [`dotenv`](https://www.npmjs.com/package/dotenv). In containerised or production environments prefer platform secret managers or injected env vars over committed files.

## Authentication
- Default admin credentials: `admin@company.com` / `admin123`.
- Tokens are HMAC-signed using `JWT_SECRET` (defaults to `phishlab-dev-secret`). Override it when running the app: `JWT_SECRET=change-me npm start` or `docker run -e JWT_SECRET=change-me …`.
- When using a `.env` file, set `JWT_SECRET` there before the first launch so the bundled `dotenv` loader can pick it up.
- Rotate the admin password by updating the `password_hash` field in the `users` table. Generate a fresh hash with Node:
  ```bash
  node -e "const { randomBytes, scryptSync } = require('crypto'); const salt = randomBytes(16).toString('hex'); const hash = scryptSync('newStrongPassword', salt, 64).toString('hex'); console.log(`${salt}:${hash}`);"
  ```
- Only administrators can invite, edit, or remove members in **Team & Roles**; other roles have read-only access.

- **Рабочая SMTP-интеграция:** задействуется через Nodemailer; тестовое письмо можно отправить с вкладки Settings → SMTP.
- **Хранение конфигурации:** значения из UI сохраняются в PostgreSQL базе данных; переменные окружения имеют приоритет и переопределяют сохраненные значения.
- **Переменные окружения** (обязательные): `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`. Если требуется авторизация — добавьте `SMTP_USER` и `SMTP_PASS`. Опция `SMTP_SECURE=true` включает TLS. Заполните их в `.env` (или задайте на хостинге) и перезапустите сервер.
- **API**: `GET /api/email/status` возвращает конфигурацию, `POST /api/email/test` (админ) отправляет тестовый email.
- **Гайд по настройке:** см. [`src/documentation/EMAIL_SETUP.md`](src/documentation/EMAIL_SETUP.md) — включает чек-лист по безопасному хранению секретов и добавлению SMTP в докер.
- При сборке контейнера пробрасывайте секреты: `docker run -e SMTP_HOST=smtp.example.com -e SMTP_USER=... -e SMTP_PASS=... -e SMTP_FROM=noreply@example.com …`.

## Docker
- Multi-stage image with dependency, build, and production targets (`Dockerfile`).
- **Build image**: `docker build -t phishing-campaign-simulator .`
- **Run container**: `docker run --rm -p 4000:4000 --env-file .env phishing-campaign-simulator`
- **Database connection**: Ensure `DATABASE_URL` is set in `.env` file or passed as environment variable.
- **Русский (кратко)**: Соберите образ (`docker build ...`), затем запустите контейнер (`docker run ...`), убедитесь что `DATABASE_URL` настроен для подключения к PostgreSQL.
- Image serves API and static frontend on `http://localhost:4000`.
> **Tip:** regenerate the Docker image after any code change; all dependen

### Scripts Summary
| Script | Description |
| ------ | ----------- |
| `npm run dev` | Launch the Vite dev server without the backend. |
| `npm start` | Start backend and frontend concurrently. |
| `npm run backend` | Start the Express API with hot-reload (`tsx watch`). |
| `npm run backend:build` | Compile TypeScript backend to JavaScript. |
| `npm run backend:start` | Start compiled backend server. |
| `npm run build` | Build the production-ready frontend. |
| `npm run migrate` | Run database migrations. |

## API Overview
Base URL: `http://localhost:4000/api`

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET`  | `/health` | Service health check. |
| `GET`  | `/templates` | List phishing templates. |
| `GET`  | `/templates/:id` | Fetch a single template. |
| `GET`  | `/campaigns` | List campaigns. |
| `POST` | `/campaigns` | Create a campaign (requires `name`, `templateId`, `recipientCount`). |
| `PUT`  | `/campaigns/:id` | Update existing campaign fields. |
| `DELETE` | `/campaigns/:id` | Remove a campaign. |
| `GET`  | `/recipients` | List mock recipient directory. |
| `GET`  | `/team` | List team members. |
| `POST` | `/team` | Invite a member (`email`, `role`, optional `name`). |
| `PUT`  | `/team/:id` | Update member profile/role. |
| `DELETE` | `/team/:id` | Remove a member. |
| `GET`  | `/email/status` | SMTP configuration status (admin). |
| `POST` | `/email/test` | Send a test email using configured SMTP (admin). |
| `GET`  | `/email/config` | Fetch persisted SMTP configuration (admin). |
| `PUT`  | `/email/config` | Update persisted SMTP configuration (admin). |

The backend uses PostgreSQL for data persistence. Run migrations to set up the database schema.

## Frontend Structure
```
src/
├── components/        # Feature-oriented React components
├── lib/               # Contexts, API client, i18n, shared helpers
├── styles/            # Global style tokens
├── documentation/     # Supplemental design docs
└── main.tsx           # App bootstrap (wraps providers)
```

Key providers:
- `AppDataProvider` – centralises API fetching, global state, and mutations.
- `I18nProvider` – handles translations and language persistence.

## Internationalisation
Translations are defined in `src/lib/translations.ts` and accessed via `useTranslation()`.  
Language preference is stored under `localStorage['phishlab-language']`.

## Documentation
- [`src/documentation/PRODUCT_OVERVIEW.md`](src/documentation/PRODUCT_OVERVIEW.md) – архитектура, роли, модули, деплой.
- [`src/documentation/BACKEND_API.md`](src/documentation/BACKEND_API.md) – детальная спецификация REST API.
- [`src/documentation/EMAIL_SETUP.md`](src/documentation/EMAIL_SETUP.md) – SMTP настройка и безопасность.

## Contributing & Maintenance Tips
- Keep backend routes in `backend/index.ts`. When adding new resources, mirror them in the API client and expose mutations via `AppDataContext`.
- Database schema is managed through SQL migrations in `backend/migrations/`.
- Run `npm start` during development so UI changes immediately reflect API mutations.
- The project currently has no automated tests—consider adding Vitest/Jest and supertest for future reliability.
- When updating features, keep documentation (README + `/src/documentation/*.md`) aligned with UI and API changes.

## License
MIT — see [`LICENSE`](LICENSE) if present; otherwise apply the license that best suits your deployment.
  
