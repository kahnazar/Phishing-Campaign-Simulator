
# Phishing Campaign Simulator

Full-stack training platform for planning, launching, and analysing phishing simulation campaigns.  
The UI is inspired by the [original Figma design](https://www.figma.com/design/QUQijTai5JB0M5ePh9VBtN/Phishing-Campaign-Simulator) and backed by a lightweight Node.js API so the app runs end to end out of the box.

## Features
- **Dashboard analytics** – consolidated campaign KPIs with quick actions.
- **Template library & editor** – browse ready-made lures, upload HTML, or customise via block-based editor.
- **Campaign builder** – guided 4-step flow to configure templates, recipients, schedules, and launch.
- **Recipient management** – mock directory with group/risk insights and import/export stubs.
- **Reports** – campaign performance tables and trend widgets.
- **Team management** – invite members, manage roles, edit/remove users.
- **Internationalisation** – English, Russian, and Uzbek translations with persistent language choice.

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Radix UI primitives, Tailwind‑style utility classes.
- **Backend**: Node.js (Express), CORS, JSON datastore (`server/data/db.json`).
- **Supporting libs**: `sonner` for toasts, `react-dnd` for the email editor, `lucide-react` icons.

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Installation
```bash
npm install
```

### Development
Run UI and API together (recommended):
```bash
npm run dev:full
```
- Vite dev server: http://localhost:3000 (proxies `/api` to the backend)
- API server: http://localhost:4000

Run only the backend (useful for production build verification):
```bash
npm run server
```

### Production Build
```bash
npm run build        # bundles the React app into /build
npm start            # serves the API and the compiled frontend
```

### Environment Variables
- Copy `.env.example` to `.env` and populate values for local development (`cp .env.example .env`).
- Key variables:
  - `PORT` – API + static bundle port (defaults to `4000` if unset).
  - `JWT_SECRET` – signing key for access tokens (always change from the sample value).
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` – runtime email settings (see [Email Setup](src/documentation/EMAIL_SETUP.md) for full guidance).
- Settings defined in `.env` are loaded automatically via [`dotenv`](https://www.npmjs.com/package/dotenv). In containerised or production environments prefer platform secret managers or injected env vars over committed files.

## Authentication
- Default admin credentials: `admin@company.com` / `admin123`.
- Tokens are HMAC-signed using `JWT_SECRET` (defaults to `phishlab-dev-secret`). Override it when running the app: `JWT_SECRET=change-me npm start` or `docker run -e JWT_SECRET=change-me …`.
- When using a `.env` file, set `JWT_SECRET` there before the first launch so the bundled `dotenv` loader can pick it up.
- Rotate the admin password by replacing the `passwordHash` field for user `admin-1` in `server/data/db.json`. Generate a fresh hash with Node:
  ```bash
  node -e "const { randomBytes, scryptSync } = require('crypto'); const salt = randomBytes(16).toString('hex'); const hash = scryptSync('newStrongPassword', salt, 64).toString('hex'); console.log(`${salt}:${hash}`);"
  ```
- Only administrators can invite, edit, or remove members in **Team & Roles**; other roles have read-only access.

- **Рабочая SMTP-интеграция:** задействуется через Nodemailer; тестовое письмо можно отправить с вкладки Settings → SMTP.
- **Хранение конфигурации:** значения из UI сохраняются в `server/data/config.json`; переменные окружения имеют приоритет и переопределяют файл.
- **Переменные окружения** (обязательные): `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`. Если требуется авторизация — добавьте `SMTP_USER` и `SMTP_PASS`. Опция `SMTP_SECURE=true` включает TLS. Заполните их в `.env` (или задайте на хостинге) и перезапустите сервер.
- **API**: `GET /api/email/status` возвращает конфигурацию, `POST /api/email/test` (админ) отправляет тестовый email.
- **Гайд по настройке:** см. [`src/documentation/EMAIL_SETUP.md`](src/documentation/EMAIL_SETUP.md) — включает чек-лист по безопасному хранению секретов и добавлению SMTP в докер.
- При сборке контейнера пробрасывайте секреты: `docker run -e SMTP_HOST=smtp.example.com -e SMTP_USER=... -e SMTP_PASS=... -e SMTP_FROM=noreply@example.com …`.

## Docker
- Multi-stage image with dependency, build, and production targets (`Dockerfile`).
- **Build image**: `docker build -t phishing-campaign-simulator .`
- **Run container**: `docker run --rm -p 4000:4000 --env-file .env phishing-campaign-simulator`
- **Persistent data (volume)**: `docker run --rm -p 4000:4000 -v phishlab-data:/app/server/data --env-file .env phishing-campaign-simulator`
- **Русский (кратко)**: Соберите образ (`docker build ...`), затем запустите контейнер (`docker run ...`), при необходимости подключив volume для папки `/app/server/data`, чтобы базы и настройки сохранялись между перезапусками.
- Контейнер обслуживает API и статический фронтенд на `http://localhost:4000`.

### Scripts Summary
| Script | Description |
| ------ | ----------- |
| `npm run dev` | Launch the Vite dev server without the backend. |
| `npm run dev:full` | Start backend (`nodemon`) and frontend (`vite`) concurrently. |
| `npm run server` | Start the Express API with hot-reload (`nodemon`). |
| `npm run build` | Build the production-ready frontend. |
| `npm start` | Serve API + static build via Express. |

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

The backend persists data to `server/data/db.json`. Feel free to seed with real integrations or swap to a database when moving beyond prototyping.

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
- Keep backend routes in `server/index.js`. When adding new resources, mirror them in the API client and expose mutations via `AppDataContext`.
- `server/data/db.json` is the single source of truth; back it up before experimenting.
- Run `npm run dev:full` during development so UI changes immediately reflect API mutations.
- The project currently has no automated tests—consider adding Vitest/Jest and supertest for future reliability.

## License
MIT — see [`LICENSE`](LICENSE) if present; otherwise apply the license that best suits your deployment.
  
