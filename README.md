<p align="center">
  <img src="https://img.icons8.com/color/128/cyber-security.png" alt="PhishLab Logo" width="100" />
</p>

<h1 align="center">Phishing Campaign Simulator</h1>

<p align="center">
  <strong>Enterprise-grade platform for security awareness training through realistic phishing simulations</strong>
</p>

<p align="center">
  <a href="#-quick-start"><img src="https://img.shields.io/badge/Quick_Start-→-blue?style=for-the-badge" alt="Quick Start" /></a>
  <a href="#-features"><img src="https://img.shields.io/badge/Features-→-green?style=for-the-badge" alt="Features" /></a>
  <a href="#-api-reference"><img src="https://img.shields.io/badge/API_Docs-→-orange?style=for-the-badge" alt="API Docs" /></a>
  <a href="#-docker-deployment"><img src="https://img.shields.io/badge/Docker-→-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0-blue?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/react-18-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/typescript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/postgresql-14+-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
</p>

---

## 🎯 Overview

**Phishing Campaign Simulator** is a comprehensive full-stack training platform for **planning**, **launching**, and **analyzing** phishing simulation campaigns. Designed to help organizations improve their cybersecurity posture through realistic, controlled phishing simulations.

> 🛡️ Train your team. Reduce risk. Build a security-first culture.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📊 Dashboard & Analytics

Real-time KPIs, performance tracking, and quick actions to build or duplicate campaigns at a glance.

</td>
<td width="50%">

### ✉️ Template Builder

Drag-and-drop email editor with HTML import/export, merge tags, and a pre-built template library.

</td>
</tr>
<tr>
<td width="50%">

### 🚀 Campaign Builder

Guided 4-step workflow: select template → target recipients → schedule delivery → review & launch.

</td>
<td width="50%">

### 👥 Recipient Management

CSV upload, Google Sheets integration, directory parsing, advanced filtering, inline editing & export.

</td>
</tr>
<tr>
<td width="50%">

### 📈 Reporting

Campaign performance tables, engagement timelines, department risk scoring, and one-click CSV export.

</td>
<td width="50%">

### 👤 Team & RBAC

Role-based access (Admin / Manager / Viewer / Auditor), user invitations, and activity tracking.

</td>
</tr>
<tr>
<td width="50%">

### 📧 SMTP Configuration

Provider presets (SendGrid, SES, Mailgun), test emails, status monitoring, and built-in local SMTP for testing.

</td>
<td width="50%">

### 🌐 Internationalization

Full multi-language support for **English**, **Russian**, and **Uzbek** with persistent language selection.

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React 18 + TypeScript                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │  │
│  │  │Dashboard │  │Templates │  │Campaigns │  │ Reports  │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │  │
│  │  Radix UI · Tailwind CSS · Recharts · React DnD          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │ Vite Proxy                       │
└──────────────────────────────┼──────────────────────────────────┘
                               │ /api/*
┌──────────────────────────────┼──────────────────────────────────┐
│                        API Server                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │               Express + TypeScript + JWT                  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐ │  │
│  │  │ Controllers│  │  Services  │  │     Middleware       │ │  │
│  │  │ ─────────  │  │ ─────────  │  │ ─────────────────── │ │  │
│  │  │ auth       │  │ campaign   │  │ JWT Authentication  │ │  │
│  │  │ campaigns  │  │ email      │  │ CORS                │ │  │
│  │  │ recipients │  │ recipient  │  │ Error Handling      │ │  │
│  │  │ templates  │  │ template   │  └─────────────────────┘ │  │
│  │  │ team       │  │ smtp       │                           │  │
│  │  │ email      │  │ tracking   │                           │  │
│  │  └────────────┘  └────────────┘                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                    ┌─────────┴─────────┐                        │
│                    │   PostgreSQL 14+  │                         │
│                    │   ─────────────── │                         │
│                    │  users · campaigns│                         │
│                    │  templates · smtp │                         │
│                    │  recipients · team│                         │
│                    └───────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Tech Stack

| Layer        | Technologies                                                                                          |
| :----------- | :---------------------------------------------------------------------------------------------------- |
| **Frontend** | React 18 · TypeScript · Vite · Radix UI · Tailwind CSS · Recharts · Lucide Icons · React DnD · Sonner |
| **Backend**  | Node.js · Express · TypeScript · JWT · Nodemailer · SMTP Server                                       |
| **Database** | PostgreSQL 14+                                                                                        |
| **DevOps**   | Docker · Docker Compose · Multi-stage builds · Concurrently                                           |

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version |
| :---------- | :------ |
| Node.js     | ≥ 18    |
| npm         | ≥ 9     |
| PostgreSQL  | ≥ 14    |

### 1. Clone & Install

```bash
git clone https://github.com/your-org/phishing-campaign-simulator.git
cd phishing-campaign-simulator
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

```env
# Server
PORT=4000
JWT_SECRET=change-me-in-production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/phishlab
DATABASE_SSL=false

# SMTP (Optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_FROM=noreply@example.com
```

### 3. Setup Database

```bash
createdb phishlab
export DATABASE_URL="postgresql://user:password@localhost:5432/phishlab"
npm run migrate
```

### 4. Launch

```bash
npm start
```

| Service     | URL                   |
| :---------- | :-------------------- |
| 🖥 Frontend | http://localhost:3000 |
| 🔌 API      | http://localhost:4000 |

> **Default credentials:** `admin@phishlab.uz` / `GUBKAbob87@!@`
>
> ⚠️ Change the default password immediately after first login in production!

---

## 🐳 Docker Deployment

### One-Command Launch

```bash
docker-compose up -d
```

The full application will be available at **http://localhost:4000**

### Custom Image Build

```bash
docker build -t phishing-campaign-simulator .
docker run --rm -p 4000:4000 --env-file .env phishing-campaign-simulator
```

### Docker Features

| Feature              | Description                               |
| :------------------- | :---------------------------------------- |
| 📦 Multi-stage build | Optimized image size                      |
| 🐘 PostgreSQL        | Included in `docker-compose.yml`          |
| 🔄 Auto-migrations   | Database schema applied on start          |
| 💓 Health checks     | Automatic database readiness verification |

> 📖 See [DOCKER_SETUP.md](DOCKER_SETUP.md) for advanced configuration.

---

## 📡 API Reference

**Base URL:** `http://localhost:4000/api`

<details>
<summary><strong>🔐 Authentication</strong></summary>

| Method | Endpoint      | Description              |
| :----- | :------------ | :----------------------- |
| `POST` | `/auth/login` | User login               |
| `GET`  | `/auth/me`    | Get current user profile |

</details>

<details>
<summary><strong>✉️ Templates</strong></summary>

| Method   | Endpoint         | Description         |
| :------- | :--------------- | :------------------ |
| `GET`    | `/templates`     | List all templates  |
| `GET`    | `/templates/:id` | Get single template |
| `POST`   | `/templates`     | Create template     |
| `PUT`    | `/templates/:id` | Update template     |
| `DELETE` | `/templates/:id` | Delete template     |

</details>

<details>
<summary><strong>🚀 Campaigns</strong></summary>

| Method   | Endpoint         | Description        |
| :------- | :--------------- | :----------------- |
| `GET`    | `/campaigns`     | List all campaigns |
| `POST`   | `/campaigns`     | Create campaign    |
| `PUT`    | `/campaigns/:id` | Update campaign    |
| `DELETE` | `/campaigns/:id` | Delete campaign    |

</details>

<details>
<summary><strong>👥 Recipients</strong></summary>

| Method | Endpoint                       | Description                |
| :----- | :----------------------------- | :------------------------- |
| `GET`  | `/recipients`                  | List all recipients        |
| `POST` | `/recipients`                  | Create recipient           |
| `POST` | `/recipients/import/csv`       | Import from CSV            |
| `POST` | `/recipients/import/google`    | Import from Google Sheets  |
| `POST` | `/recipients/import/directory` | Import from directory text |

</details>

<details>
<summary><strong>👤 Team</strong></summary>

| Method   | Endpoint    | Description        |
| :------- | :---------- | :----------------- |
| `GET`    | `/team`     | List team members  |
| `POST`   | `/team`     | Invite member      |
| `PUT`    | `/team/:id` | Update member role |
| `DELETE` | `/team/:id` | Remove member      |

</details>

<details>
<summary><strong>📧 Email / SMTP</strong></summary>

| Method | Endpoint        | Description                |
| :----- | :-------------- | :------------------------- |
| `GET`  | `/email/status` | Get SMTP status            |
| `POST` | `/email/test`   | Send test email            |
| `GET`  | `/email/config` | Get email configuration    |
| `PUT`  | `/email/config` | Update email configuration |

</details>

> 📖 Full specification: [BACKEND_API.md](src/documentation/BACKEND_API.md)

---

## 📁 Project Structure

```
phishing-campaign-simulator/
│
├── 📂 backend/                  # Node.js / Express API
│   ├── config/                  # Database connection & pool
│   ├── controllers/             # Route handlers (auth, campaigns, email...)
│   ├── middleware/               # JWT authentication guard
│   ├── migrations/               # SQL schema migrations
│   ├── scripts/                  # Utility & seed scripts
│   └── services/                 # Business logic layer
│
├── 📂 src/                      # React 18 Frontend
│   ├── components/               # 60+ UI components
│   ├── lib/                      # API client, contexts, translations, utils
│   ├── styles/                   # Global stylesheets
│   └── documentation/            # In-app documentation
│
├── 🐳 docker-compose.yml        # Full-stack orchestration
├── 🐳 Dockerfile                # Multi-stage production build
├── ⚡ vite.config.ts             # Vite dev server & proxy config
└── 📦 package.json              # Scripts & dependencies
```

---

## 📜 Available Scripts

| Script                  | Description                              |
| :---------------------- | :--------------------------------------- |
| `npm start`             | 🚀 Start frontend + backend concurrently |
| `npm run dev`           | ⚡ Vite dev server only                  |
| `npm run backend`       | 🔌 Express API with hot-reload           |
| `npm run build`         | 📦 Production frontend build             |
| `npm run backend:build` | 🔨 Compile TypeScript backend            |
| `npm run backend:start` | 🏃 Start compiled production server      |
| `npm run migrate`       | 🗄️ Run database migrations               |

---

## 🌐 Internationalization

| Language   | Code | Status      |
| :--------- | :--- | :---------- |
| 🇬🇧 English | `en` | ✅ Complete |
| 🇷🇺 Russian | `ru` | ✅ Complete |
| 🇺🇿 Uzbek   | `uz` | ✅ Complete |

Language preference is stored in `localStorage['phishlab-language']` and persists across sessions. Translations are defined in `src/lib/translations.ts` and accessed via the `useTranslation()` hook.

---

## 🔒 Security Checklist

> Best practices for production deployment:

- [x] Change default admin password
- [x] Use a strong, unique `JWT_SECRET`
- [x] Enable SSL for database connections
- [x] Store all secrets in environment variables
- [x] Implement rate limiting
- [x] Enable HTTPS in production
- [x] Conduct regular security audits
- [x] Keep dependencies up to date

---

## 🤝 Contributing

### Development Workflow

```mermaid
graph LR
    A[Add Route] --> B[Update API Client]
    B --> C[Expose via Context]
    C --> D[Build UI Component]
    D --> E[Test & Document]
```

| Step | Action               | Location                |
| :--- | :------------------- | :---------------------- |
| 1    | Add new route        | `backend/controllers/`  |
| 2    | Mirror in API client | `src/lib/api-client.ts` |
| 3    | Expose mutations     | `AppDataContext`        |
| 4    | Database changes     | `backend/migrations/`   |
| 5    | Test changes         | `npm start`             |

---

## 📖 Documentation

| Document                                                  | Description                              |
| :-------------------------------------------------------- | :--------------------------------------- |
| [Product Overview](src/documentation/PRODUCT_OVERVIEW.md) | Architecture, roles, modules, deployment |
| [Backend API](src/documentation/BACKEND_API.md)           | Detailed REST API specification          |
| [Email Setup](src/documentation/EMAIL_SETUP.md)           | SMTP configuration and security          |
| [Docker Setup](DOCKER_SETUP.md)                           | Container deployment guide               |
| [Local SMTP Guide](LOCAL_SMTP_GUIDE.md)                   | Testing email functionality              |
| [Migration Guide](MIGRATION_GUIDE.md)                     | Database migration instructions          |

---

<p align="center">
  <strong>Version 2.0</strong> · Developed by <strong>Webforge LLC</strong>
</p>

<p align="center">
  <sub>MIT License · Made with ❤️ for a more secure world</sub>
</p>
