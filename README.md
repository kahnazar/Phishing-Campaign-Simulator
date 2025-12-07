# Phishing Campaign Simulator

A comprehensive full-stack training platform for planning, launching, and analyzing phishing simulation campaigns. Built with modern web technologies to help organizations improve their security awareness through realistic phishing simulations.

## 🚀 Features

### Dashboard & Analytics
- **Consolidated KPIs** with real-time metrics
- **Quick actions** to build or duplicate campaigns
- **Performance tracking** across all campaigns

### Template Management
- **Drag-and-drop email editor** with content blocks
- **HTML import/export** functionality
- **Tag management** with merge tags for personalization
- **Template library** with pre-built scenarios

### Campaign Builder
- **Guided 4-step workflow** for campaign creation
- **Template selection** from library
- **Recipient targeting** with group management
- **Scheduling options** for immediate or delayed launch
- **Review and launch** with tracking settings

### Recipient Management
- **CSV upload** with server-side parsing and validation
- **Google Sheets integration** (public CSV export)
- **Directory text parsing** for bulk import
- **Advanced filtering** by department and risk level
- **Search and inline editing** capabilities
- **CSV export** of current view

### Reporting & Analytics
- **Campaign performance table** with detailed metrics
- **Detail modal** with comprehensive breakdown
- **One-click CSV export** for analysis
- **Engagement timeline** visualization
- **Risk scoring** by department

### Team Management
- **Role-based access control** (Admin/Manager/Viewer/Auditor)
- **User invitation** and management
- **Permission editing** and removal
- **Activity tracking**

### SMTP & Email Configuration
- **Provider presets** (SendGrid, SES, Mailgun)
- **Test email** functionality
- **Status monitoring** and refresh
- **Local SMTP server** for testing
- **SSL configuration** support

### Internationalization
- **Multi-language support**: English, Russian, and Uzbek
- **Persistent language selection**
- **Complete UI translation**

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications
- **React DnD** - Drag and drop functionality

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **PostgreSQL** - Relational database
- **TypeScript** - Type-safe backend code
- **JWT** - Secure authentication
- **Nodemailer** - Email sending
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- PostgreSQL ≥ 14

## 🚀 Getting Started

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
- Vite dev server: http://localhost:3000 (proxies `/api` to backend)
- API server: http://localhost:4000

Run only the backend:
```bash
npm run backend
```

### Production Build

```bash
npm run build        # Build React app
npm run backend:build # Compile TypeScript backend
npm run backend:start # Start production server
```

## 🔐 Authentication

### Default Credentials
- **Email**: `admin@phishlab.uz`
- **Password**: `GUBKAbob87@!@`

> ⚠️ **Important**: Change the default password immediately after first login in production!

### Security Configuration

- Tokens are HMAC-signed using `JWT_SECRET`
- Default secret: `phishlab-dev-secret` (change in production!)
- Set via environment variable: `JWT_SECRET=your-secret-key npm start`

### Password Reset

Generate a new password hash:
```bash
node -e "const { randomBytes, scryptSync } = require('crypto'); const salt = randomBytes(16).toString('hex'); const hash = scryptSync('newPassword', salt, 64).toString('hex'); console.log(\`\${salt}:\${hash}\`);"
```

Update the `password_hash` field in the `users` table with the generated hash.

## 🌍 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Required Variables

```env
# Server
PORT=4000
JWT_SECRET=change-me-in-production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/phishlab
DATABASE_SSL=false

# SMTP (Optional - for email sending)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_FROM=noreply@example.com
```

### SMTP Configuration

- **UI Storage**: SMTP settings are saved in PostgreSQL
- **Environment Override**: Environment variables take precedence
- **Test Functionality**: Send test emails from Settings → SMTP
- **Local SMTP**: Built-in SMTP server for testing (port 1025)

See [EMAIL_SETUP.md](src/documentation/EMAIL_SETUP.md) for detailed configuration.

## 🐳 Docker Deployment

### Quick Start

```bash
docker-compose up -d
```

The application will be available at http://localhost:4000

### Build Custom Image

```bash
docker build -t phishing-campaign-simulator .
docker run --rm -p 4000:4000 --env-file .env phishing-campaign-simulator
```

### Docker Configuration

- **Multi-stage build** for optimized image size
- **PostgreSQL** included in docker-compose
- **Automatic migrations** on container start
- **Health checks** for database readiness

> 💡 **Tip**: Rebuild the image after code changes

## 📚 API Documentation

Base URL: `http://localhost:4000/api`

### Authentication
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Templates
- `GET /templates` - List all templates
- `GET /templates/:id` - Get single template
- `POST /templates` - Create template
- `PUT /templates/:id` - Update template
- `DELETE /templates/:id` - Delete template

### Campaigns
- `GET /campaigns` - List all campaigns
- `POST /campaigns` - Create campaign
- `PUT /campaigns/:id` - Update campaign
- `DELETE /campaigns/:id` - Delete campaign

### Recipients
- `GET /recipients` - List all recipients
- `POST /recipients` - Create recipient
- `POST /recipients/import/csv` - Import from CSV
- `POST /recipients/import/google` - Import from Google Sheets
- `POST /recipients/import/directory` - Import from directory

### Team
- `GET /team` - List team members
- `POST /team` - Invite member
- `PUT /team/:id` - Update member
- `DELETE /team/:id` - Remove member

### Email
- `GET /email/status` - Get SMTP status
- `POST /email/test` - Send test email
- `GET /email/config` - Get email configuration
- `PUT /email/config` - Update email configuration

For detailed API specifications, see [BACKEND_API.md](src/documentation/BACKEND_API.md)

## 📁 Project Structure

```
.
├── backend/              # Node.js/Express backend
│   ├── config/          # Database configuration
│   ├── controllers/     # API route handlers
│   ├── middleware/      # Authentication middleware
│   ├── migrations/      # SQL database migrations
│   ├── scripts/         # Utility scripts
│   └── services/        # Business logic
├── src/                 # React frontend
│   ├── components/      # React components
│   ├── lib/            # Utilities, API client, contexts
│   ├── styles/         # Global styles
│   └── documentation/  # Additional docs
├── docker-compose.yml   # Docker orchestration
├── Dockerfile          # Multi-stage Docker build
└── vite.config.ts      # Vite configuration
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server only |
| `npm start` | Start backend and frontend concurrently |
| `npm run backend` | Start Express API with hot-reload |
| `npm run backend:build` | Compile TypeScript backend |
| `npm run backend:start` | Start compiled backend |
| `npm run build` | Build production frontend |
| `npm run migrate` | Run database migrations |

## 🌐 Internationalization

The application supports multiple languages:
- English (en)
- Russian (ru)
- Uzbek (uz)

Language preference is stored in `localStorage['phishlab-language']` and persists across sessions.

Translations are defined in `src/lib/translations.ts` and accessed via the `useTranslation()` hook.

## 📖 Documentation

- [Product Overview](src/documentation/PRODUCT_OVERVIEW.md) - Architecture, roles, modules, deployment
- [Backend API](src/documentation/BACKEND_API.md) - Detailed REST API specification
- [Email Setup](src/documentation/EMAIL_SETUP.md) - SMTP configuration and security
- [Docker Setup](DOCKER_SETUP.md) - Container deployment guide
- [Local SMTP Guide](LOCAL_SMTP_GUIDE.md) - Testing email functionality
- [Migration Guide](MIGRATION_GUIDE.md) - Database migration instructions

## 🤝 Contributing

### Development Workflow

1. **Backend routes**: Add new routes in `backend/controllers/`
2. **API client**: Mirror routes in `src/lib/api-client.ts`
3. **State management**: Expose mutations via `AppDataContext`
4. **Database changes**: Create migrations in `backend/migrations/`
5. **Testing**: Run `npm start` to test changes immediately

### Code Quality

- Keep backend routes organized in controllers
- Use TypeScript for type safety
- Follow existing code patterns
- Update documentation when adding features
- Test thoroughly before committing

## 🔒 Security Best Practices

- ✅ Change default admin password
- ✅ Use strong JWT_SECRET in production
- ✅ Enable SSL for database connections
- ✅ Use environment variables for secrets
- ✅ Implement rate limiting (recommended)
- ✅ Enable HTTPS in production
- ✅ Regular security audits
- ✅ Keep dependencies updated

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Version 2.0** • Developed by Webforge LLC
