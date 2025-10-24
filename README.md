
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

## Contributing & Maintenance Tips
- Keep backend routes in `server/index.js`. When adding new resources, mirror them in the API client and expose mutations via `AppDataContext`.
- `server/data/db.json` is the single source of truth; back it up before experimenting.
- Run `npm run dev:full` during development so UI changes immediately reflect API mutations.
- The project currently has no automated tests—consider adding Vitest/Jest and supertest for future reliability.

## License
MIT — see [`LICENSE`](LICENSE) if present; otherwise apply the license that best suits your deployment.
  
