# PhishLab Backend API Specification

> **Полная спецификация REST API для реализации на Node.js**

---

## 📋 Содержание

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Технологический стек](#технологический-стек)
3. [Структура базы данных](#структура-базы-данных)
4. [API эндпоинты](#api-эндпоинты)
5. [Аутентификация](#аутентификация)
6. [Email сервис](#email-сервис)
7. [LDAP интеграция](#ldap-интеграция)
8. [Real-time аналитика](#real-time-аналитика)
9. [Установка и развертывание](#установка-и-развертывание)
10. [Примеры кода](#примеры-кода)

---

## Обзор архитектуры

### Архитектурная схема

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│                     http://localhost:5173                       │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST API / WebSocket
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   API Gateway (Express)                         │
│                   http://localhost:3000                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Middleware Stack                                        │  │
│  │  • CORS                                                  │  │
│  │  • Body Parser (JSON, URL-encoded)                       │  │
│  │  • JWT Authentication                                    │  │
│  │  • Role-Based Access Control (RBAC)                      │  │
│  │  • Rate Limiting (express-rate-limit)                    │  │
│  │  • Request Logging (morgan)                              │  │
│  │  • Error Handler                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┬───────────────────┐
        │                │                │                   │
┌───────▼───────┐ ┌──────▼──────┐ ┌──────▼──────┐ ┌─────────▼──────┐
│  Auth Service │ │  Campaign   │ │  Analytics  │ │  Email Service │
│               │ │   Service   │ │   Service   │ │                │
│ • Login/Logout│ │ • CRUD      │ │ • Tracking  │ │ • SMTP Send    │
│ • JWT Tokens  │ │ • Schedule  │ │ • Metrics   │ │ • Templates    │
│ • 2FA         │ │ • Launch    │ │ • Reports   │ │ • Tracking     │
│ • Sessions    │ │ • Clone     │ │ • Export    │ │ • Merge Tags   │
└───────┬───────┘ └──────┬──────┘ └──────┬──────┘ └────────┬───────┘
        │                │                │                 │
┌───────▼────────────────▼────────────────▼─────────────────▼───────┐
│                    Data Access Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ PostgreSQL   │  │    Redis     │  │  File System │            │
│  │              │  │              │  │              │            │
│  │ • Users      │  │ • Sessions   │  │ • HTML       │            │
│  │ • Campaigns  │  │ • Cache      │  │ • Images     │            │
│  │ • Templates  │  │ • Job Queue  │  │ • Exports    │            │
│  │ • Recipients │  │ • Rate Limit │  │              │            │
│  │ • Events     │  │              │  │              │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└───────────────────────────────────────────────────────────────────┘

External Services:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ SMTP Server  │  │ LDAP/AD      │  │ Unsplash API │
│              │  │              │  │              │
│ Port: 587    │  │ Port: 389    │  │ Images       │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Основные компоненты

#### 1. API Gateway
- Express.js сервер на порту 3000
- Маршрутизация запросов к соответствующим сервисам
- Централизованная обработка ошибок
- CORS для frontend на порту 5173
- Rate limiting для защиты от DDoS

#### 2. Services Layer

**Auth Service**
- Регистрация и аутентификация пользователей
- JWT токены (access + refresh)
- Двухфакторная аутентификация (TOTP)
- Управление сессиями через Redis
- Password reset flow

**Campaign Service**
- CRUD операции для кампаний
- Планирование отправки (cron jobs)
- Запуск кампаний
- Клонирование существующих кампаний
- Управление статусами (draft → scheduled → running → completed)

**Analytics Service**
- Сбор событий трекинга (opens, clicks, submissions)
- Агрегация метрик
- Генерация отчетов
- Real-time статистика через WebSocket
- Экспорт данных (CSV, PDF)

**Email Service**
- Отправка писем через SMTP
- Рендеринг HTML шаблонов
- Замена merge tags
- Вставка tracking pixel
- Обработка bounce/unsubscribe
- Очередь отправки через BullMQ

**Template Service**
- Хранение и управление шаблонами
- Валидация HTML
- Предпросмотр
- Импорт/экспорт

**Recipient Service**
- Управление получателями
- Импорт из CSV
- Синхронизация с LDAP/AD
- Группы и теги
- Risk scoring

**LDAP Service**
- Подключение к Active Directory
- Синхронизация пользователей
- Mapping атрибутов
- Scheduled sync jobs

#### 3. Data Layer

**PostgreSQL**
- Основное хранилище данных
- Транзакционная целостность
- Full-text search для поиска
- Indexes для оптимизации запросов

**Redis**
- Session store для JWT refresh tokens
- Кеширование часто запрашиваемых данных
- Rate limiting counters
- Job queues для email отправки
- Pub/Sub для real-time updates

**File System**
- Загруженные HTML шаблоны
- Изображения для email
- Сгенерированные PDF отчеты
- Логи и аудит трейлы

---

## Технологический стек

### Core Backend

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "typescript": "^5.3.3",
    "@types/express": "^4.17.21",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4"
  }
}
```

### Database & ORM

```json
{
  "dependencies": {
    "pg": "^8.11.3",
    "typeorm": "^0.3.19",
    "redis": "^4.6.12",
    "ioredis": "^5.3.2"
  }
}
```

**TypeORM** — современный ORM для TypeScript с поддержкой миграций, релейшенов и query builder.

### Authentication & Security

```json
{
  "dependencies": {
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "speakeasy": "^2.0.0",
    "qrcode": "^1.5.3",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "crypto": "built-in"
  }
}
```

- **JWT** — Access tokens (15 min) + Refresh tokens (7 days)
- **bcrypt** — Хеширование паролей (cost factor 12)
- **speakeasy** — TOTP для 2FA
- **qrcode** — QR коды для 2FA setup

### Email & SMTP

```json
{
  "dependencies": {
    "nodemailer": "^6.9.7",
    "nodemailer-smtp-transport": "^2.7.4",
    "mjml": "^4.15.3",
    "handlebars": "^4.7.8",
    "juice": "^10.0.0"
  }
}
```

- **nodemailer** — Отправка email через SMTP
- **mjml** — Responsive email шаблоны
- **handlebars** — Шаблонизация для merge tags
- **juice** — Inline CSS для email

### LDAP Integration

```json
{
  "dependencies": {
    "ldapjs": "^3.0.7",
    "activedirectory2": "^2.1.0"
  }
}
```

### Job Queue

```json
{
  "dependencies": {
    "bullmq": "^5.1.5",
    "node-cron": "^3.0.3"
  }
}
```

- **BullMQ** — Очереди для отправки email
- **node-cron** — Планировщик для scheduled campaigns

### WebSocket & Real-time

```json
{
  "dependencies": {
    "socket.io": "^4.6.1",
    "ws": "^8.16.0"
  }
}
```

### Logging & Monitoring

```json
{
  "dependencies": {
    "winston": "^3.11.0",
    "morgan": "^1.10.0",
    "pino": "^8.17.2"
  }
}
```

### Testing

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1"
  }
}
```

### Utilities

```json
{
  "dependencies": {
    "uuid": "^9.0.1",
    "dayjs": "^1.11.10",
    "csv-parse": "^5.5.3",
    "csvtojson": "^2.0.10",
    "pdfkit": "^0.14.0",
    "axios": "^1.6.5"
  }
}
```

---

## Структура базы данных

### PostgreSQL Schema

```sql
-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'viewer', 'auditor')),
    is_active BOOLEAN DEFAULT true,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- REFRESH TOKENS (для JWT)
-- ============================================================================

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- ============================================================================
-- TEMPLATES
-- ============================================================================

CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    tags TEXT[], -- Array of tags
    variant VARCHAR(20) CHECK (variant IN ('corporate', 'casual')),
    subject VARCHAR(500),
    preview_text VARCHAR(255),
    html_content TEXT NOT NULL,
    thumbnail_url VARCHAR(500),
    is_default BOOLEAN DEFAULT false, -- Предустановленные шаблоны
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_created_by ON templates(created_by);

-- ============================================================================
-- RECIPIENTS
-- ============================================================================

CREATE TABLE recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    department VARCHAR(100),
    position VARCHAR(100),
    company VARCHAR(100),
    manager_name VARCHAR(200),
    source VARCHAR(50) CHECK (source IN ('manual', 'csv', 'ldap', 'api')),
    risk_score INTEGER DEFAULT 0, -- 0-100, calculated based on campaign results
    is_active BOOLEAN DEFAULT true,
    metadata JSONB, -- Дополнительные поля
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recipients_email ON recipients(email);
CREATE INDEX idx_recipients_department ON recipients(department);
CREATE INDEX idx_recipients_risk_score ON recipients(risk_score DESC);

-- ============================================================================
-- RECIPIENT GROUPS
-- ============================================================================

CREATE TABLE recipient_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recipient_group_members (
    group_id UUID REFERENCES recipient_groups(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, recipient_id)
);

CREATE INDEX idx_group_members_group ON recipient_group_members(group_id);
CREATE INDEX idx_group_members_recipient ON recipient_group_members(recipient_id);

-- ============================================================================
-- CAMPAIGNS
-- ============================================================================

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    template_id UUID REFERENCES templates(id),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' 
        CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled')),
    
    -- Email settings
    subject VARCHAR(500),
    from_name VARCHAR(100),
    from_email VARCHAR(255),
    
    -- Landing page
    landing_page_url VARCHAR(500),
    landing_page_html TEXT,
    
    -- Scheduling
    scheduled_at TIMESTAMP,
    launched_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Tracking settings
    track_email_opens BOOLEAN DEFAULT true,
    track_link_clicks BOOLEAN DEFAULT true,
    capture_submitted_data BOOLEAN DEFAULT true,
    
    -- Stats (denormalized for performance)
    total_recipients INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    links_clicked INTEGER DEFAULT 0,
    data_submitted INTEGER DEFAULT 0,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_scheduled_at ON campaigns(scheduled_at);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);

-- ============================================================================
-- CAMPAIGN RECIPIENTS (Many-to-Many)
-- ============================================================================

CREATE TABLE campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
    
    -- Individual tracking ID для каждого получателя
    tracking_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Status
    email_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    
    -- Delivery status
    delivery_status VARCHAR(20) CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'bounced', 'failed')),
    
    -- Individual stats
    opened BOOLEAN DEFAULT false,
    opened_at TIMESTAMP,
    open_count INTEGER DEFAULT 0,
    
    clicked BOOLEAN DEFAULT false,
    clicked_at TIMESTAMP,
    click_count INTEGER DEFAULT 0,
    
    submitted BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP,
    
    -- Device & Location (from first open)
    user_agent TEXT,
    ip_address INET,
    browser VARCHAR(50),
    os VARCHAR(50),
    device_type VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_camp_recip_campaign ON campaign_recipients(campaign_id);
CREATE INDEX idx_camp_recip_recipient ON campaign_recipients(recipient_id);
CREATE INDEX idx_camp_recip_tracking ON campaign_recipients(tracking_id);

-- ============================================================================
-- TRACKING EVENTS (детальные события)
-- ============================================================================

CREATE TABLE tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_recipient_id UUID NOT NULL REFERENCES campaign_recipients(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('sent', 'open', 'click', 'submit')),
    
    -- Event data
    event_data JSONB, -- URL для click, submitted data (hashed) для submit
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    referer TEXT,
    
    -- Geolocation (опционально, можно заполнить через IP)
    country VARCHAR(2),
    city VARCHAR(100),
    
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tracking_events_camp_recipient ON tracking_events(campaign_recipient_id);
CREATE INDEX idx_tracking_events_type ON tracking_events(event_type);
CREATE INDEX idx_tracking_events_occurred ON tracking_events(occurred_at DESC);

-- ============================================================================
-- SUBMITTED DATA (захваченные credentials - HASHED)
-- ============================================================================

CREATE TABLE submitted_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_recipient_id UUID NOT NULL REFERENCES campaign_recipients(id) ON DELETE CASCADE,
    
    -- Все данные хешируются для безопасности
    username_hash VARCHAR(255),
    password_hash VARCHAR(255),
    
    -- Дополнительные поля формы
    form_data JSONB, -- Остальные поля формы (тоже хешированные)
    
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_submitted_data_camp_recipient ON submitted_data(campaign_recipient_id);

-- ============================================================================
-- SETTINGS
-- ============================================================================

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    category VARCHAR(50), -- 'general', 'email', 'security', 'integrations'
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_category ON settings(category);

-- Предзаполненные настройки
INSERT INTO settings (key, value, category) VALUES
('company_name', '"PhishLab"'::jsonb, 'general'),
('company_domain', '"phishlab.local"'::jsonb, 'general'),
('timezone', '"UTC"'::jsonb, 'general'),
('default_language', '"en"'::jsonb, 'general'),

('smtp_host', '"smtp.gmail.com"'::jsonb, 'email'),
('smtp_port', '587'::jsonb, 'email'),
('smtp_secure', 'false'::jsonb, 'email'),
('smtp_username', '""'::jsonb, 'email'),
('smtp_password', '""'::jsonb, 'email'),
('sender_name', '"PhishLab"'::jsonb, 'email'),
('sender_email', '"noreply@phishlab.local"'::jsonb, 'email'),

('two_factor_required', 'true'::jsonb, 'security'),
('session_timeout_minutes', '30'::jsonb, 'security'),
('ip_whitelist_enabled', 'false'::jsonb, 'security'),
('ip_whitelist', '[]'::jsonb, 'security'),

('ldap_enabled', 'false'::jsonb, 'integrations'),
('ldap_url', '""'::jsonb, 'integrations'),
('ldap_bind_dn', '""'::jsonb, 'integrations'),
('ldap_search_base', '""'::jsonb, 'integrations'),
('api_enabled', 'true'::jsonb, 'integrations');

-- ============================================================================
-- API KEYS
-- ============================================================================

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_by UUID REFERENCES users(id),
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'campaign.create', 'user.login', 'settings.update', etc.
    entity_type VARCHAR(50), -- 'campaign', 'user', 'template', etc.
    entity_id UUID,
    changes JSONB, -- Before/after values
    ip_address INET,
    user_agent TEXT,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_occurred ON audit_logs(occurred_at DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipients_updated_at BEFORE UPDATE ON recipients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Redis Data Structures

```javascript
// Session Store (JWT Refresh Tokens)
// Key: refresh_token:{token_id}
// Value: JSON { userId, expiresAt }
// TTL: 7 days
{
  "userId": "uuid",
  "expiresAt": "2025-10-31T12:00:00Z"
}

// Rate Limiting
// Key: rate_limit:{ip}:{endpoint}
// Value: number (request count)
// TTL: 60 seconds (для 100 req/min limit)
rate_limit:192.168.1.100:/api/campaigns -> 45

// Campaign Stats Cache
// Key: campaign_stats:{campaign_id}
// Value: JSON
// TTL: 60 seconds
{
  "totalRecipients": 250,
  "sent": 250,
  "opened": 189,
  "clicked": 47,
  "submitted": 12,
  "openRate": 75.6,
  "clickRate": 18.8,
  "riskScore": 4.8
}

// Email Send Queue (BullMQ)
// Queue: email_queue
{
  "campaignId": "uuid",
  "recipientId": "uuid",
  "trackingId": "abc123",
  "emailData": {
    "to": "user@example.com",
    "subject": "Password Reset Required",
    "html": "<html>...</html>"
  }
}

// Active Sessions (для session timeout)
// Key: session:{user_id}
// Value: JSON { lastActivity, ipAddress }
// TTL: 30 minutes
{
  "lastActivity": "2025-10-24T14:30:00Z",
  "ipAddress": "192.168.1.100"
}
```

---

## API эндпоинты

### Base URL

```
Development: http://localhost:3000/api
Production:  https://api.phishlab.yourdomain.com/api
```

### Общие заголовки

```http
Content-Type: application/json
Authorization: Bearer {access_token}
```

### Коды ответов

| Код | Описание |
|-----|----------|
| 200 | OK - Успешный запрос |
| 201 | Created - Ресурс создан |
| 204 | No Content - Успешно, нет тела ответа |
| 400 | Bad Request - Неверные параметры |
| 401 | Unauthorized - Не авторизован |
| 403 | Forbidden - Нет прав доступа |
| 404 | Not Found - Ресурс не найден |
| 409 | Conflict - Конфликт данных |
| 422 | Unprocessable Entity - Ошибка валидации |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Ошибка сервера |

---

### 🔐 Authentication

#### POST /api/auth/register

Регистрация нового пользователя (только для Admin).

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Иван",
  "lastName": "Петров",
  "role": "manager"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Иван",
      "lastName": "Петров",
      "role": "manager",
      "createdAt": "2025-10-24T12:00:00Z"
    }
  }
}
```

---

#### POST /api/auth/login

Вход в систему.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Иван",
      "lastName": "Петров",
      "role": "manager",
      "twoFactorEnabled": true
    },
    "requiresTwoFactor": true,
    "tempToken": "temp_token_for_2fa_verification"
  }
}
```

Если 2FA отключена:
```json
{
  "success": true,
  "data": {
    "user": { /* ... */ },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "refresh_token_string",
    "expiresIn": 900
  }
}
```

---

#### POST /api/auth/2fa/verify

Проверка 2FA кода.

**Request:**
```json
{
  "tempToken": "temp_token_from_login",
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "refresh_token_string",
    "expiresIn": 900
  }
}
```

---

#### POST /api/auth/2fa/enable

Включение 2FA для пользователя.

**Headers:** `Authorization: Bearer {access_token}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "backupCodes": [
      "12345678",
      "87654321",
      "11223344"
    ]
  }
}
```

---

#### POST /api/auth/2fa/confirm

Подтверждение включения 2FA с кодом.

**Request:**
```json
{
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Two-factor authentication enabled successfully"
}
```

---

#### POST /api/auth/refresh

Обновление access token через refresh token.

**Request:**
```json
{
  "refreshToken": "refresh_token_string"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "expiresIn": 900
  }
}
```

---

#### POST /api/auth/logout

Выход из системы (инвалидация refresh token).

**Headers:** `Authorization: Bearer {access_token}`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### POST /api/auth/forgot-password

Запрос сброса пароля.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

#### POST /api/auth/reset-password

Сброс пароля по токену.

**Request:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 📧 Campaigns

#### GET /api/campaigns

Получить список всех кампаний.

**Query Parameters:**
- `status` - Фильтр по статусу (draft, scheduled, running, completed)
- `page` - Номер страницы (default: 1)
- `limit` - Количество на странице (default: 20)
- `search` - Поиск по названию

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": "uuid",
        "name": "Q4 Security Awareness Training",
        "status": "running",
        "template": {
          "id": "uuid",
          "name": "Password Reset"
        },
        "stats": {
          "totalRecipients": 250,
          "sent": 250,
          "opened": 189,
          "clicked": 47,
          "submitted": 12
        },
        "scheduledAt": "2025-10-12T09:00:00Z",
        "createdAt": "2025-10-10T14:30:00Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

---

#### POST /api/campaigns

Создать новую кампанию.

**Request:**
```json
{
  "name": "Q4 Security Awareness Training",
  "templateId": "uuid",
  "subject": "Password Reset Required",
  "fromName": "IT Security",
  "fromEmail": "security@company.com",
  "landingPageUrl": "https://phishing-test.company.com/reset",
  "groupIds": ["uuid1", "uuid2"],
  "scheduledAt": "2025-10-20T09:00:00Z",
  "trackEmailOpens": true,
  "trackLinkClicks": true,
  "captureSubmittedData": true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "uuid",
      "name": "Q4 Security Awareness Training",
      "status": "draft",
      "templateId": "uuid",
      "subject": "Password Reset Required",
      "totalRecipients": 120,
      "createdAt": "2025-10-24T14:30:00Z"
    }
  }
}
```

---

#### GET /api/campaigns/:id

Получить детали кампании.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "uuid",
      "name": "Q4 Security Awareness Training",
      "status": "running",
      "template": {
        "id": "uuid",
        "name": "Password Reset",
        "category": "HR"
      },
      "subject": "Password Reset Required",
      "fromName": "IT Security",
      "fromEmail": "security@company.com",
      "landingPageUrl": "https://phishing-test.company.com/reset",
      "stats": {
        "totalRecipients": 250,
        "sent": 250,
        "opened": 189,
        "clicked": 47,
        "submitted": 12,
        "openRate": 75.6,
        "clickRate": 18.8,
        "riskScore": 4.8
      },
      "trackingSettings": {
        "trackEmailOpens": true,
        "trackLinkClicks": true,
        "captureSubmittedData": true
      },
      "scheduledAt": "2025-10-12T09:00:00Z",
      "launchedAt": "2025-10-12T09:00:15Z",
      "createdAt": "2025-10-10T14:30:00Z",
      "createdBy": {
        "id": "uuid",
        "email": "admin@company.com",
        "firstName": "Иван",
        "lastName": "Петров"
      }
    }
  }
}
```

---

#### PUT /api/campaigns/:id

Обновить кампанию (только если status = 'draft').

**Request:**
```json
{
  "name": "Updated Campaign Name",
  "subject": "New Subject Line",
  "scheduledAt": "2025-10-25T10:00:00Z"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "campaign": { /* updated campaign */ }
  }
}
```

---

#### DELETE /api/campaigns/:id

Удалить кампанию (только если status = 'draft').

**Response:** `204 No Content`

---

#### POST /api/campaigns/:id/launch

Запустить кампанию.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Campaign launched successfully",
  "data": {
    "campaign": {
      "id": "uuid",
      "status": "running",
      "launchedAt": "2025-10-24T15:00:00Z"
    }
  }
}
```

---

#### POST /api/campaigns/:id/pause

Приостановить кампанию.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Campaign paused",
  "data": {
    "campaign": {
      "id": "uuid",
      "status": "paused"
    }
  }
}
```

---

#### POST /api/campaigns/:id/resume

Возобновить кампанию.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Campaign resumed",
  "data": {
    "campaign": {
      "id": "uuid",
      "status": "running"
    }
  }
}
```

---

#### POST /api/campaigns/:id/clone

Клонировать существующую кампанию.

**Request:**
```json
{
  "name": "Cloned Campaign - Q1 2025"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "new_uuid",
      "name": "Cloned Campaign - Q1 2025",
      "status": "draft",
      "clonedFrom": "original_uuid"
    }
  }
}
```

---

#### GET /api/campaigns/:id/recipients

Получить список получателей кампании с детальной статистикой.

**Query Parameters:**
- `status` - opened, clicked, submitted, pending
- `page` - Номер страницы
- `limit` - Количество на странице

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "recipients": [
      {
        "id": "uuid",
        "recipient": {
          "id": "uuid",
          "email": "user@example.com",
          "firstName": "Иван",
          "lastName": "Петров",
          "department": "IT"
        },
        "trackingId": "abc123",
        "emailSent": true,
        "sentAt": "2025-10-12T09:00:15Z",
        "deliveryStatus": "delivered",
        "opened": true,
        "openedAt": "2025-10-12T09:15:30Z",
        "openCount": 3,
        "clicked": true,
        "clickedAt": "2025-10-12T09:16:45Z",
        "clickCount": 1,
        "submitted": false,
        "userAgent": "Mozilla/5.0...",
        "ipAddress": "192.168.1.100",
        "browser": "Chrome",
        "os": "Windows",
        "deviceType": "desktop"
      }
    ],
    "pagination": {
      "total": 250,
      "page": 1,
      "limit": 50,
      "pages": 5
    }
  }
}
```

---

### 📊 Analytics

#### GET /api/analytics/dashboard

Получить общую статистику для дашборда.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalCampaigns": 45,
      "activeCampaigns": 3,
      "totalRecipients": 1254,
      "emailsSent": 2340,
      "openRate": 75.6,
      "clickRate": 18.8,
      "riskScore": 12.4
    },
    "recentCampaigns": [
      {
        "id": "uuid",
        "name": "Q4 Security Awareness",
        "status": "running",
        "stats": {
          "sent": 250,
          "opened": 189,
          "clicked": 47
        }
      }
    ],
    "performanceMetrics": {
      "emailOpens": [
        { "date": "2025-10-20", "count": 45 },
        { "date": "2025-10-21", "count": 67 },
        { "date": "2025-10-22", "count": 89 }
      ],
      "linkClicks": [ /* similar */ ],
      "dataSubmissions": [ /* similar */ ]
    },
    "riskByDepartment": [
      {
        "department": "HR",
        "total": 45,
        "clicked": 12,
        "percentage": 26.7
      },
      {
        "department": "IT",
        "total": 50,
        "clicked": 5,
        "percentage": 10.0
      }
    ]
  }
}
```

---

#### GET /api/analytics/campaign/:id

Детальная аналитика по кампании.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "uuid",
      "name": "Q4 Security Awareness Training"
    },
    "stats": {
      "totalRecipients": 250,
      "sent": 250,
      "delivered": 248,
      "bounced": 2,
      "opened": 189,
      "clicked": 47,
      "submitted": 12,
      "openRate": 75.6,
      "clickRate": 18.8,
      "submitRate": 4.8
    },
    "timeline": [
      {
        "period": "Day 1",
        "opens": 147,
        "clicks": 35,
        "submits": 8
      },
      {
        "period": "Day 2-3",
        "opens": 32,
        "clicks": 9,
        "submits": 3
      },
      {
        "period": "After Day 3",
        "opens": 10,
        "clicks": 3,
        "submits": 1
      }
    ],
    "byDepartment": [
      {
        "department": "HR",
        "recipients": 45,
        "opened": 38,
        "clicked": 12,
        "submitted": 3,
        "riskScore": 6.7
      }
    ],
    "topRiskyUsers": [
      {
        "recipient": {
          "email": "user@example.com",
          "firstName": "Иван",
          "lastName": "Петров",
          "department": "Finance"
        },
        "opened": true,
        "clicked": true,
        "submitted": true,
        "openedAt": "2025-10-12T09:15:30Z",
        "submittedAt": "2025-10-12T09:16:45Z"
      }
    ],
    "deviceStats": {
      "desktop": 180,
      "mobile": 55,
      "tablet": 13
    },
    "browserStats": {
      "Chrome": 120,
      "Firefox": 45,
      "Safari": 32,
      "Edge": 28
    },
    "clickMap": [
      {
        "url": "https://phishing-test.company.com/reset",
        "clicks": 47
      }
    ]
  }
}
```

---

#### GET /api/analytics/export

Экспорт отчета в CSV или PDF.

**Query Parameters:**
- `campaignId` - ID кампании
- `format` - csv | pdf
- `dateFrom` - Начальная дата (ISO 8601)
- `dateTo` - Конечная дата

**Response:** `200 OK` (file download)
```
Content-Type: text/csv
Content-Disposition: attachment; filename="campaign-report-2025-10-24.csv"

Email,FirstName,LastName,Department,Sent,Opened,Clicked,Submitted
user1@example.com,Иван,Петров,IT,true,true,true,false
user2@example.com,Мария,Иванова,HR,true,true,false,false
```

---

### 📝 Templates

#### GET /api/templates

Получить список шаблонов.

**Query Parameters:**
- `category` - Фильтр по категории
- `search` - Поиск по названию
- `page`, `limit` - Пагинация

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "uuid",
        "name": "Password Reset",
        "description": "Corporate password change notification",
        "category": "HR",
        "tags": ["password", "security", "urgent"],
        "variant": "corporate",
        "subject": "Password Reset Required",
        "previewText": "Your password expires in 24 hours...",
        "thumbnailUrl": "https://...",
        "isDefault": true,
        "createdAt": "2025-10-01T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 20,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

---

#### POST /api/templates

Создать новый шаблон.

**Request:**
```json
{
  "name": "Custom Password Reset",
  "description": "Custom template for password reset",
  "category": "HR",
  "tags": ["password", "custom"],
  "variant": "corporate",
  "subject": "Action Required: Reset Your Password",
  "previewText": "Your password is expiring soon...",
  "htmlContent": "<html><body>...</body></html>",
  "thumbnailUrl": "https://..."
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "template": {
      "id": "uuid",
      "name": "Custom Password Reset",
      /* ... */
    }
  }
}
```

---

#### GET /api/templates/:id

Получить детали шаблона.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "template": {
      "id": "uuid",
      "name": "Password Reset",
      "description": "Corporate password change notification",
      "category": "HR",
      "tags": ["password", "security", "urgent"],
      "variant": "corporate",
      "subject": "Password Reset Required",
      "previewText": "Your password expires in 24 hours...",
      "htmlContent": "<html><body>...</body></html>",
      "thumbnailUrl": "https://...",
      "isDefault": true,
      "createdBy": {
        "id": "uuid",
        "email": "admin@company.com"
      },
      "createdAt": "2025-10-01T12:00:00Z"
    }
  }
}
```

---

#### PUT /api/templates/:id

Обновить шаблон (нельзя изменять isDefault = true).

**Request:**
```json
{
  "name": "Updated Template Name",
  "htmlContent": "<html><body>Updated content</body></html>"
}
```

**Response:** `200 OK`

---

#### DELETE /api/templates/:id

Удалить шаблон (нельзя удалять isDefault = true).

**Response:** `204 No Content`

---

#### POST /api/templates/import

Импорт HTML шаблона.

**Request:** `multipart/form-data`
```
file: template.html (HTML file)
name: "Imported Template"
category: "General"
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "template": {
      "id": "uuid",
      "name": "Imported Template",
      "htmlContent": "<html>...</html>"
    }
  }
}
```

---

#### POST /api/templates/:id/export

Экспорт шаблона в HTML файл.

**Response:** `200 OK` (file download)
```
Content-Type: text/html
Content-Disposition: attachment; filename="password-reset.html"

<html>
  <body>...</body>
</html>
```

---

### 👥 Recipients

#### GET /api/recipients

Получить список получателей.

**Query Parameters:**
- `department` - Фильтр по отделу
- `search` - Поиск по имени/email
- `riskScore` - min-max (например: 50-100)
- `page`, `limit` - Пагинация

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "recipients": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "Иван",
        "lastName": "Петров",
        "department": "IT",
        "position": "Developer",
        "company": "Acme Corp",
        "managerName": "Анна Сидорова",
        "source": "ldap",
        "riskScore": 15,
        "isActive": true,
        "campaignsCount": 5,
        "createdAt": "2025-09-01T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 1254,
      "page": 1,
      "limit": 50,
      "pages": 26
    }
  }
}
```

---

#### POST /api/recipients

Добавить нового получателя.

**Request:**
```json
{
  "email": "newuser@example.com",
  "firstName": "Петр",
  "lastName": "Смирнов",
  "department": "Finance",
  "position": "Accountant",
  "company": "Acme Corp",
  "managerName": "Ольга Иванова"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "recipient": {
      "id": "uuid",
      "email": "newuser@example.com",
      /* ... */
    }
  }
}
```

---

#### GET /api/recipients/:id

Получить профиль получателя.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "recipient": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Иван",
      "lastName": "Петров",
      "department": "IT",
      "position": "Developer",
      "riskScore": 15,
      "campaignHistory": [
        {
          "campaign": {
            "id": "uuid",
            "name": "Q4 Security Training"
          },
          "sentAt": "2025-10-12T09:00:15Z",
          "opened": true,
          "clicked": false,
          "submitted": false
        }
      ],
      "stats": {
        "totalCampaigns": 5,
        "opened": 4,
        "clicked": 2,
        "submitted": 1,
        "openRate": 80.0,
        "clickRate": 40.0,
        "riskScore": 20.0
      }
    }
  }
}
```

---

#### PUT /api/recipients/:id

Обновить получателя.

**Request:**
```json
{
  "department": "Security",
  "position": "Security Analyst"
}
```

**Response:** `200 OK`

---

#### DELETE /api/recipients/:id

Удалить получателя.

**Response:** `204 No Content`

---

#### POST /api/recipients/import

Импорт получателей из CSV.

**Request:** `multipart/form-data`
```
file: recipients.csv
```

CSV формат:
```csv
FirstName,LastName,Email,Department,Position,ManagerName
Иван,Петров,ivan@example.com,IT,Developer,Анна Сидорова
Мария,Иванова,maria@example.com,HR,HR Manager,Петр Смирнов
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "imported": 120,
    "skipped": 5,
    "errors": [
      {
        "row": 15,
        "email": "invalid-email",
        "reason": "Invalid email format"
      }
    ]
  }
}
```

---

#### GET /api/recipients/groups

Получить список групп получателей.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "uuid",
        "name": "IT Department",
        "description": "All IT staff",
        "memberCount": 50,
        "riskScore": 12.5,
        "createdAt": "2025-09-01T10:00:00Z"
      }
    ]
  }
}
```

---

#### POST /api/recipients/groups

Создать новую группу.

**Request:**
```json
{
  "name": "Finance Team",
  "description": "Finance department staff",
  "recipientIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:** `201 Created`

---

#### POST /api/recipients/sync-ldap

Синхронизация с LDAP/Active Directory.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "synced": 245,
    "added": 12,
    "updated": 8,
    "removed": 3,
    "errors": []
  }
}
```

---

### ⚙️ Settings

#### GET /api/settings

Получить все настройки.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "general": {
      "companyName": "PhishLab",
      "companyDomain": "phishlab.local",
      "timezone": "UTC",
      "defaultLanguage": "en"
    },
    "email": {
      "smtpHost": "smtp.gmail.com",
      "smtpPort": 587,
      "smtpSecure": false,
      "smtpUsername": "noreply@phishlab.local",
      "senderName": "PhishLab",
      "senderEmail": "noreply@phishlab.local"
    },
    "security": {
      "twoFactorRequired": true,
      "sessionTimeoutMinutes": 30,
      "ipWhitelistEnabled": false,
      "ipWhitelist": []
    },
    "integrations": {
      "ldapEnabled": false,
      "ldapUrl": "",
      "ldapBindDn": "",
      "ldapSearchBase": "",
      "apiEnabled": true
    }
  }
}
```

---

#### PUT /api/settings

Обновить настройки (только Admin).

**Request:**
```json
{
  "email": {
    "smtpHost": "smtp.office365.com",
    "smtpPort": 587,
    "smtpUsername": "phishlab@company.com",
    "smtpPassword": "encrypted_password"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

---

#### POST /api/settings/smtp/test

Тест SMTP подключения.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "SMTP connection successful",
  "data": {
    "testEmailSent": true
  }
}
```

---

#### POST /api/settings/ldap/test

Тест LDAP подключения.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "LDAP connection successful",
  "data": {
    "usersFound": 245
  }
}
```

---

### 👤 Users & Roles

#### GET /api/users

Получить список пользователей (только Admin).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "Иван",
        "lastName": "Петров",
        "role": "manager",
        "isActive": true,
        "twoFactorEnabled": true,
        "lastLoginAt": "2025-10-24T14:30:00Z",
        "createdAt": "2025-09-01T10:00:00Z"
      }
    ]
  }
}
```

---

#### POST /api/users

Создать пользователя (только Admin).

См. [POST /api/auth/register](#post-apiauthregister)

---

#### PUT /api/users/:id/role

Обновить роль пользователя (только Admin).

**Request:**
```json
{
  "role": "admin"
}
```

**Response:** `200 OK`

---

#### DELETE /api/users/:id

Удалить пользователя (только Admin).

**Response:** `204 No Content`

---

### 🔑 API Keys

#### GET /api/api-keys

Получить список API ключей.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "apiKeys": [
      {
        "id": "uuid",
        "name": "External Integration",
        "keyPreview": "pl_live_abc***xyz",
        "lastUsedAt": "2025-10-24T12:00:00Z",
        "expiresAt": null,
        "isActive": true,
        "createdAt": "2025-09-01T10:00:00Z"
      }
    ]
  }
}
```

---

#### POST /api/api-keys

Сгенерировать новый API ключ.

**Request:**
```json
{
  "name": "External Integration",
  "expiresAt": "2026-10-24T12:00:00Z"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "apiKey": {
      "id": "uuid",
      "name": "External Integration",
      "key": "pl_live_abc123xyz456def789ghi012",
      "expiresAt": "2026-10-24T12:00:00Z"
    },
    "warning": "This is the only time the full key will be shown. Please save it securely."
  }
}
```

---

#### DELETE /api/api-keys/:id

Удалить API ключ.

**Response:** `204 No Content`

---

### 📜 Audit Logs

#### GET /api/audit-logs

Получить audit logs (Admin, Auditor).

**Query Parameters:**
- `userId` - Фильтр по пользователю
- `action` - Фильтр по типу действия
- `dateFrom`, `dateTo` - Временной период
- `page`, `limit` - Пагинация

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "email": "admin@company.com",
          "firstName": "Иван",
          "lastName": "Петров"
        },
        "action": "campaign.create",
        "entityType": "campaign",
        "entityId": "uuid",
        "changes": {
          "before": null,
          "after": {
            "name": "Q4 Security Training",
            "status": "draft"
          }
        },
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "occurredAt": "2025-10-24T14:30:00Z"
      }
    ],
    "pagination": {
      "total": 1523,
      "page": 1,
      "limit": 50,
      "pages": 31
    }
  }
}
```

---

### 📍 Tracking Endpoints (Public, No Auth)

Эти эндпоинты используются для трекинга и не требуют авторизации.

#### GET /t/:trackingId/open

Трекинг открытия письма (tracking pixel).

**Response:** `200 OK` (1x1 transparent PNG)
```
Content-Type: image/png
Content-Length: 68

[PNG binary data]
```

Внутренняя логика:
1. Найти campaign_recipient по trackingId
2. Если первое открытие → установить opened = true, opened_at
3. Увеличить open_count
4. Записать tracking_event
5. Обновить stats в campaigns
6. Отправить WebSocket event для real-time update
7. Вернуть 1x1 PNG

---

#### GET /t/:trackingId/click

Трекинг клика по ссылке с редиректом на landing page.

**Query Parameters:**
- `url` - Оригинальный URL для редиректа

**Response:** `302 Redirect`
```
Location: https://phishing-test.company.com/reset?token=abc123
```

Внутренняя логика:
1. Найти campaign_recipient по trackingId
2. Если первый клик → установить clicked = true, clicked_at
3. Увеличить click_count
4. Записать tracking_event с URL
5. Обновить stats в campaigns
6. Отправить WebSocket event
7. Редирект на landing page

---

#### POST /t/:trackingId/submit

Захват данных формы с landing page.

**Request:**
```json
{
  "username": "user@example.com",
  "password": "P@ssw0rd123",
  "otherField": "value"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Data captured"
}
```

Внутренняя логика:
1. Найти campaign_recipient по trackingId
2. Установить submitted = true, submitted_at
3. Хешировать все полученные данные (bcrypt)
4. Сохранить в submitted_data
5. Записать tracking_event
6. Обновить stats в campaigns
7. Увеличить risk_score получателя
8. Отправить WebSocket event
9. (Опционально) Показать educational page о фишинге

---

## Аутентификация

### JWT Strategy

PhishLab использует двойную токен-стратегию:

1. **Access Token** — короткоживущий токен (15 минут)
2. **Refresh Token** — долгоживущий токен (7 дней)

### Access Token Structure

```javascript
{
  "type": "access",
  "userId": "uuid",
  "email": "user@example.com",
  "role": "manager",
  "iat": 1729777200, // Issued at
  "exp": 1729778100  // Expires at (15 min later)
}
```

Подпись: `HS256` с секретным ключом `JWT_SECRET`

### Refresh Token Structure

```javascript
{
  "type": "refresh",
  "userId": "uuid",
  "tokenId": "uuid", // Уникальный ID для инвалидации
  "iat": 1729777200,
  "exp": 1730382000  // 7 days
}
```

### Authentication Flow

```
1. User Login
   POST /api/auth/login
   { email, password }
   ↓
2. Server validates credentials
   ↓
3. If 2FA enabled:
   ← Return { tempToken, requiresTwoFactor: true }
   ↓
   User provides 2FA code
   POST /api/auth/2fa/verify
   { tempToken, code }
   ↓
4. Server generates tokens:
   - Access Token (JWT)
   - Refresh Token (JWT + stored in Redis + DB)
   ↓
5. Return { accessToken, refreshToken }
   ↓
6. Client stores:
   - accessToken → memory (React state)
   - refreshToken → HttpOnly cookie
   ↓
7. Client makes API requests:
   Authorization: Bearer {accessToken}
   ↓
8. Access token expires (15 min):
   ← 401 Unauthorized
   ↓
9. Client refreshes token:
   POST /api/auth/refresh
   { refreshToken }
   ↓
10. Server validates refresh token:
    - Check signature
    - Check expiration
    - Check if exists in Redis/DB
    ↓
11. Generate new access token
    ← Return { accessToken }
    ↓
12. Continue with new access token
```

### Middleware Implementation

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }

    const token = authHeader.substring(7);

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Check token type
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token type'
      });
    }

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Role-based access control
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};
```

### Usage in Routes

```typescript
// routes/campaigns.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public route (no auth)
router.get('/templates', getTemplates);

// Authenticated route (any logged-in user)
router.get('/campaigns', authenticate, getCampaigns);

// Role-specific route (only admin and manager)
router.post('/campaigns', 
  authenticate, 
  authorize('admin', 'manager'),
  createCampaign
);

// Admin only
router.delete('/users/:id',
  authenticate,
  authorize('admin'),
  deleteUser
);

export default router;
```

---

## Email сервис

### Architecture

```
Campaign Launch
     ↓
Generate Recipients List
     ↓
For Each Recipient:
  1. Generate unique tracking_id
  2. Create campaign_recipient record
  3. Add to Email Queue (BullMQ)
     ↓
Email Queue Worker
     ↓
For Each Email Job:
  1. Load template HTML
  2. Replace merge tags
  3. Insert tracking pixel
  4. Replace links with tracking links
  5. Send via SMTP (nodemailer)
  6. Update delivery status
  7. Handle bounces/errors
```

### SMTP Configuration

```typescript
// services/EmailService.ts
import nodemailer from 'nodemailer';
import { getSettings } from './SettingsService';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    const settings = await getSettings('email');

    this.transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure, // true for 465, false for 587
      auth: {
        user: settings.smtpUsername,
        pass: settings.smtpPassword
      },
      tls: {
        rejectUnauthorized: false // For self-signed certs
      }
    });
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }) {
    const settings = await getSettings('email');
    
    const mailOptions = {
      from: options.from || `"${settings.senderName}" <${settings.senderEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'SMTP connection successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
```

### Template Processing

```typescript
// services/TemplateService.ts
import Handlebars from 'handlebars';

export class TemplateService {
  /**
   * Process template and replace merge tags
   */
  processMergeTags(
    htmlContent: string,
    recipientData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      company?: string;
      department?: string;
      position?: string;
      managerName?: string;
      trackingLink?: string;
    }
  ): string {
    const template = Handlebars.compile(htmlContent);
    return template(recipientData);
  }

  /**
   * Insert tracking pixel
   */
  insertTrackingPixel(html: string, trackingId: string): string {
    const trackingPixel = `<img src="${process.env.API_URL}/t/${trackingId}/open" width="1" height="1" style="display:none" alt="" />`;
    
    // Insert before closing </body> tag
    return html.replace('</body>', `${trackingPixel}</body>`);
  }

  /**
   * Replace links with tracking links
   */
  replaceLinks(html: string, trackingId: string, landingPageUrl: string): string {
    // Replace all <a href="..."> with tracking link
    return html.replace(
      /href="([^"]*)"/g,
      (match, url) => {
        // Skip if already a tracking link
        if (url.includes('/t/')) return match;
        
        const trackingUrl = `${process.env.API_URL}/t/${trackingId}/click?url=${encodeURIComponent(landingPageUrl || url)}`;
        return `href="${trackingUrl}"`;
      }
    );
  }

  /**
   * Full email preparation
   */
  async prepareEmail(
    templateHtml: string,
    recipient: any,
    campaign: any,
    trackingId: string
  ): string {
    // 1. Replace merge tags
    let html = this.processMergeTags(templateHtml, {
      firstName: recipient.firstName,
      lastName: recipient.lastName,
      email: recipient.email,
      company: recipient.company,
      department: recipient.department,
      position: recipient.position,
      managerName: recipient.managerName,
      trackingLink: `${process.env.API_URL}/t/${trackingId}/click?url=${encodeURIComponent(campaign.landingPageUrl)}`
    });

    // 2. Insert tracking pixel
    if (campaign.trackEmailOpens) {
      html = this.insertTrackingPixel(html, trackingId);
    }

    // 3. Replace links with tracking
    if (campaign.trackLinkClicks) {
      html = this.replaceLinks(html, trackingId, campaign.landingPageUrl);
    }

    return html;
  }
}
```

### Email Queue (BullMQ)

```typescript
// queues/emailQueue.ts
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { EmailService } from '../services/EmailService';
import { TemplateService } from '../services/TemplateService';
import { AppDataSource } from '../data-source';
import { CampaignRecipient } from '../entities/CampaignRecipient';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null
});

export const emailQueue = new Queue('email-send', { connection });

// Worker to process email jobs
export const emailWorker = new Worker(
  'email-send',
  async (job) => {
    const { campaignRecipientId, emailData } = job.data;
    
    const emailService = new EmailService();
    const campaignRecipientRepo = AppDataSource.getRepository(CampaignRecipient);

    try {
      // Send email
      const result = await emailService.sendEmail({
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        from: emailData.from
      });

      // Update delivery status
      await campaignRecipientRepo.update(campaignRecipientId, {
        emailSent: true,
        sentAt: new Date(),
        deliveryStatus: 'sent'
      });

      console.log(`Email sent to ${emailData.to}`);
      return { success: true };
    } catch (error) {
      console.error(`Failed to send email to ${emailData.to}:`, error);

      // Update delivery status
      await campaignRecipientRepo.update(campaignRecipientId, {
        deliveryStatus: 'failed'
      });

      throw error; // BullMQ will retry
    }
  },
  {
    connection,
    concurrency: 5, // Process 5 emails concurrently
    limiter: {
      max: 100, // Max 100 emails
      duration: 60000 // per minute
    }
  }
);

emailWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
```

### Campaign Launch Service

```typescript
// services/CampaignService.ts
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../data-source';
import { Campaign } from '../entities/Campaign';
import { CampaignRecipient } from '../entities/CampaignRecipient';
import { Recipient } from '../entities/Recipient';
import { Template } from '../entities/Template';
import { TemplateService } from './TemplateService';
import { emailQueue } from '../queues/emailQueue';

export class CampaignService {
  async launchCampaign(campaignId: string) {
    const campaignRepo = AppDataSource.getRepository(Campaign);
    const campaignRecipientRepo = AppDataSource.getRepository(CampaignRecipient);
    const recipientRepo = AppDataSource.getRepository(Recipient);
    const templateRepo = AppDataSource.getRepository(Template);

    // Get campaign with relations
    const campaign = await campaignRepo.findOne({
      where: { id: campaignId },
      relations: ['template']
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new Error('Campaign cannot be launched');
    }

    // Get all recipients for this campaign
    const campaignRecipients = await campaignRecipientRepo.find({
      where: { campaignId },
      relations: ['recipient']
    });

    // Update campaign status
    await campaignRepo.update(campaignId, {
      status: 'running',
      launchedAt: new Date()
    });

    const templateService = new TemplateService();

    // Queue emails for each recipient
    for (const campaignRecipient of campaignRecipients) {
      const recipient = campaignRecipient.recipient;

      // Prepare email HTML
      const emailHtml = await templateService.prepareEmail(
        campaign.template.htmlContent,
        recipient,
        campaign,
        campaignRecipient.trackingId
      );

      // Add to queue
      await emailQueue.add(`send-email-${campaignRecipient.id}`, {
        campaignRecipientId: campaignRecipient.id,
        emailData: {
          to: recipient.email,
          subject: campaign.subject,
          html: emailHtml,
          from: `"${campaign.fromName}" <${campaign.fromEmail}>`
        }
      });
    }

    console.log(`Campaign ${campaignId} launched with ${campaignRecipients.length} emails queued`);

    return {
      success: true,
      emailsQueued: campaignRecipients.length
    };
  }
}
```

---

## LDAP интеграция

### LDAP Service

```typescript
// services/LDAPService.ts
import ldap from 'ldapjs';
import { AppDataSource } from '../data-source';
import { Recipient } from '../entities/Recipient';
import { getSettings } from './SettingsService';

export class LDAPService {
  private client: ldap.Client;
  private settings: any;

  async initialize() {
    this.settings = await getSettings('integrations');

    if (!this.settings.ldapEnabled) {
      throw new Error('LDAP is not enabled');
    }

    this.client = ldap.createClient({
      url: this.settings.ldapUrl,
      reconnect: true
    });
  }

  async bind(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.bind(
        this.settings.ldapBindDn,
        this.settings.ldapBindPassword,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async searchUsers(): Promise<any[]> {
    await this.bind();

    const searchOptions = {
      filter: this.settings.ldapSearchFilter || '(&(objectClass=user)(mail=*))',
      scope: 'sub' as 'sub',
      attributes: [
        'cn',
        'givenName',
        'sn',
        'mail',
        'department',
        'title',
        'manager',
        'company'
      ]
    };

    return new Promise((resolve, reject) => {
      const users: any[] = [];

      this.client.search(
        this.settings.ldapSearchBase,
        searchOptions,
        (err, res) => {
          if (err) {
            reject(err);
            return;
          }

          res.on('searchEntry', (entry) => {
            const user = {
              dn: entry.objectName,
              cn: entry.object.cn as string,
              givenName: entry.object.givenName as string,
              sn: entry.object.sn as string,
              mail: entry.object.mail as string,
              department: entry.object.department as string,
              title: entry.object.title as string,
              manager: entry.object.manager as string,
              company: entry.object.company as string
            };
            users.push(user);
          });

          res.on('error', (err) => {
            reject(err);
          });

          res.on('end', () => {
            resolve(users);
          });
        }
      );
    });
  }

  async syncUsers() {
    const recipientRepo = AppDataSource.getRepository(Recipient);

    try {
      await this.initialize();
      const ldapUsers = await this.searchUsers();

      let added = 0;
      let updated = 0;
      let errors = 0;

      for (const ldapUser of ldapUsers) {
        if (!ldapUser.mail) {
          errors++;
          continue;
        }

        try {
          // Check if recipient exists
          let recipient = await recipientRepo.findOne({
            where: { email: ldapUser.mail }
          });

          if (recipient) {
            // Update existing
            await recipientRepo.update(recipient.id, {
              firstName: ldapUser.givenName,
              lastName: ldapUser.sn,
              department: ldapUser.department,
              position: ldapUser.title,
              company: ldapUser.company,
              managerName: ldapUser.manager,
              source: 'ldap',
              updatedAt: new Date()
            });
            updated++;
          } else {
            // Create new
            recipient = recipientRepo.create({
              email: ldapUser.mail,
              firstName: ldapUser.givenName,
              lastName: ldapUser.sn,
              department: ldapUser.department,
              position: ldapUser.title,
              company: ldapUser.company,
              managerName: ldapUser.manager,
              source: 'ldap'
            });
            await recipientRepo.save(recipient);
            added++;
          }
        } catch (err) {
          console.error(`Error syncing user ${ldapUser.mail}:`, err);
          errors++;
        }
      }

      // Unbind
      this.client.unbind();

      return {
        synced: ldapUsers.length,
        added,
        updated,
        errors
      };
    } catch (error) {
      console.error('LDAP sync error:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      await this.initialize();
      await this.bind();
      const users = await this.searchUsers();
      this.client.unbind();

      return {
        success: true,
        message: 'LDAP connection successful',
        usersFound: users.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

### Scheduled LDAP Sync (Cron)

```typescript
// jobs/ldapSync.ts
import cron from 'node-cron';
import { LDAPService } from '../services/LDAPService';
import { getSettings } from '../services/SettingsService';

export function scheduleLDAPSync() {
  // Run every day at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Starting scheduled LDAP sync...');

    const settings = await getSettings('integrations');

    if (!settings.ldapEnabled) {
      console.log('LDAP sync is disabled');
      return;
    }

    try {
      const ldapService = new LDAPService();
      const result = await ldapService.syncUsers();

      console.log('LDAP sync completed:', result);
    } catch (error) {
      console.error('LDAP sync failed:', error);
    }
  });

  console.log('LDAP sync job scheduled (daily at 2:00 AM)');
}
```

---

## Real-time аналитика

### WebSocket Setup

```typescript
// server.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { authenticate as wsAuth } from './middleware/wsAuth';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

// WebSocket authentication middleware
io.use(wsAuth);

// Connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join campaign room for real-time updates
  socket.on('join-campaign', (campaignId: string) => {
    socket.join(`campaign-${campaignId}`);
    console.log(`Socket ${socket.id} joined campaign ${campaignId}`);
  });

  // Leave campaign room
  socket.on('leave-campaign', (campaignId: string) => {
    socket.leave(`campaign-${campaignId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io for use in services
export { io };

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
```

### WebSocket Authentication

```typescript
// middleware/wsAuth.ts
import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export const authenticate = (socket: Socket, next: any) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.type !== 'access') {
      return next(new Error('Authentication error: Invalid token type'));
    }

    (socket as any).user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    return next(new Error('Authentication error: Invalid token'));
  }
};
```

### Real-time Event Emitters

```typescript
// services/AnalyticsService.ts
import { io } from '../server';
import { AppDataSource } from '../data-source';
import { Campaign } from '../entities/Campaign';

export class AnalyticsService {
  /**
   * Emit real-time event when email is opened
   */
  async handleEmailOpen(trackingId: string) {
    const campaignRecipientRepo = AppDataSource.getRepository(CampaignRecipient);
    const campaignRepo = AppDataSource.getRepository(Campaign);

    const campaignRecipient = await campaignRecipientRepo.findOne({
      where: { trackingId },
      relations: ['campaign', 'recipient']
    });

    if (!campaignRecipient) return;

    const isFirstOpen = !campaignRecipient.opened;

    // Update stats
    await campaignRecipientRepo.update(campaignRecipient.id, {
      opened: true,
      openedAt: isFirstOpen ? new Date() : campaignRecipient.openedAt,
      openCount: campaignRecipient.openCount + 1
    });

    if (isFirstOpen) {
      // Update campaign stats
      await campaignRepo.increment(
        { id: campaignRecipient.campaignId },
        'emailsOpened',
        1
      );
    }

    // Emit WebSocket event
    io.to(`campaign-${campaignRecipient.campaignId}`).emit('email-opened', {
      campaignId: campaignRecipient.campaignId,
      recipient: {
        email: campaignRecipient.recipient.email,
        firstName: campaignRecipient.recipient.firstName,
        lastName: campaignRecipient.recipient.lastName,
        department: campaignRecipient.recipient.department
      },
      openedAt: new Date(),
      isFirstOpen
    });

    // Update dashboard stats
    const updatedStats = await this.getCampaignStats(campaignRecipient.campaignId);
    io.to(`campaign-${campaignRecipient.campaignId}`).emit('stats-update', updatedStats);
  }

  /**
   * Emit real-time event when link is clicked
   */
  async handleLinkClick(trackingId: string, url: string) {
    const campaignRecipientRepo = AppDataSource.getRepository(CampaignRecipient);
    const campaignRepo = AppDataSource.getRepository(Campaign);

    const campaignRecipient = await campaignRecipientRepo.findOne({
      where: { trackingId },
      relations: ['campaign', 'recipient']
    });

    if (!campaignRecipient) return;

    const isFirstClick = !campaignRecipient.clicked;

    // Update stats
    await campaignRecipientRepo.update(campaignRecipient.id, {
      clicked: true,
      clickedAt: isFirstClick ? new Date() : campaignRecipient.clickedAt,
      clickCount: campaignRecipient.clickCount + 1
    });

    if (isFirstClick) {
      // Update campaign stats
      await campaignRepo.increment(
        { id: campaignRecipient.campaignId },
        'linksClicked',
        1
      );
    }

    // Emit WebSocket event
    io.to(`campaign-${campaignRecipient.campaignId}`).emit('link-clicked', {
      campaignId: campaignRecipient.campaignId,
      recipient: {
        email: campaignRecipient.recipient.email,
        firstName: campaignRecipient.recipient.firstName,
        lastName: campaignRecipient.recipient.lastName,
        department: campaignRecipient.recipient.department
      },
      clickedAt: new Date(),
      url,
      isFirstClick
    });

    // Update dashboard stats
    const updatedStats = await this.getCampaignStats(campaignRecipient.campaignId);
    io.to(`campaign-${campaignRecipient.campaignId}`).emit('stats-update', updatedStats);
  }

  /**
   * Emit real-time event when data is submitted
   */
  async handleDataSubmit(trackingId: string, formData: any) {
    const campaignRecipientRepo = AppDataSource.getRepository(CampaignRecipient);
    const campaignRepo = AppDataSource.getRepository(Campaign);
    const recipientRepo = AppDataSource.getRepository(Recipient);

    const campaignRecipient = await campaignRecipientRepo.findOne({
      where: { trackingId },
      relations: ['campaign', 'recipient']
    });

    if (!campaignRecipient) return;

    // Update stats
    await campaignRecipientRepo.update(campaignRecipient.id, {
      submitted: true,
      submittedAt: new Date()
    });

    // Update campaign stats
    await campaignRepo.increment(
      { id: campaignRecipient.campaignId },
      'dataSubmitted',
      1
    );

    // Increase recipient risk score
    await recipientRepo.increment(
      { id: campaignRecipient.recipient.id },
      'riskScore',
      10
    );

    // Emit WebSocket event (CRITICAL - high priority alert)
    io.to(`campaign-${campaignRecipient.campaignId}`).emit('data-submitted', {
      campaignId: campaignRecipient.campaignId,
      recipient: {
        email: campaignRecipient.recipient.email,
        firstName: campaignRecipient.recipient.firstName,
        lastName: campaignRecipient.recipient.lastName,
        department: campaignRecipient.recipient.department
      },
      submittedAt: new Date(),
      severity: 'critical'
    });

    // Update dashboard stats
    const updatedStats = await this.getCampaignStats(campaignRecipient.campaignId);
    io.to(`campaign-${campaignRecipient.campaignId}`).emit('stats-update', updatedStats);
  }

  async getCampaignStats(campaignId: string) {
    const campaign = await AppDataSource.getRepository(Campaign).findOne({
      where: { id: campaignId }
    });

    if (!campaign) return null;

    return {
      totalRecipients: campaign.totalRecipients,
      sent: campaign.emailsSent,
      opened: campaign.emailsOpened,
      clicked: campaign.linksClicked,
      submitted: campaign.dataSubmitted,
      openRate: ((campaign.emailsOpened / campaign.emailsSent) * 100).toFixed(1),
      clickRate: ((campaign.linksClicked / campaign.emailsSent) * 100).toFixed(1),
      submitRate: ((campaign.dataSubmitted / campaign.emailsSent) * 100).toFixed(1)
    };
  }
}
```

### Frontend WebSocket Client

```typescript
// Frontend: lib/websocket.ts
import { io, Socket } from 'socket.io-client';

class WebSocketClient {
  private socket: Socket | null = null;

  connect(accessToken: string) {
    this.socket = io(process.env.VITE_API_URL || 'http://localhost:3000', {
      auth: {
        token: accessToken
      }
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return this.socket;
  }

  joinCampaign(campaignId: string) {
    this.socket?.emit('join-campaign', campaignId);
  }

  leaveCampaign(campaignId: string) {
    this.socket?.emit('leave-campaign', campaignId);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export const wsClient = new WebSocketClient();
```

```tsx
// Frontend: components/CampaignAnalytics.tsx
import { useEffect } from 'react';
import { wsClient } from '../lib/websocket';
import { toast } from 'sonner';

function CampaignAnalytics({ campaignId }: { campaignId: string }) {
  useEffect(() => {
    // Join campaign room
    wsClient.joinCampaign(campaignId);

    // Listen for real-time events
    wsClient.on('email-opened', (data) => {
      toast.success(`${data.recipient.email} opened the email!`);
      // Update UI stats
    });

    wsClient.on('link-clicked', (data) => {
      toast.warning(`${data.recipient.email} clicked a link!`);
      // Update UI stats
    });

    wsClient.on('data-submitted', (data) => {
      toast.error(`🚨 ${data.recipient.email} submitted credentials!`);
      // Update UI stats + show alert
    });

    wsClient.on('stats-update', (stats) => {
      // Update campaign stats in real-time
      setCampaignStats(stats);
    });

    // Cleanup
    return () => {
      wsClient.leaveCampaign(campaignId);
      wsClient.off('email-opened');
      wsClient.off('link-clicked');
      wsClient.off('data-submitted');
      wsClient.off('stats-update');
    };
  }, [campaignId]);

  return (
    <div>
      {/* Analytics UI */}
    </div>
  );
}
```

---

## Установка и развертывание

### Development Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/phishlab-backend.git
cd phishlab-backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
nano .env
```

### Environment Variables (.env)

```bash
# Server
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Frontend
FRONTEND_URL=http://localhost:5173

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=phishlab
DB_PASSWORD=your_secure_password
DB_DATABASE=phishlab

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_jwt_secret_key_here_min_32_chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# SMTP (для отправки email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# LDAP (опционально)
LDAP_ENABLED=false
LDAP_URL=ldap://dc.company.local:389
LDAP_BIND_DN=CN=phishlab,OU=Service Accounts,DC=company,DC=local
LDAP_BIND_PASSWORD=ldap_password
LDAP_SEARCH_BASE=OU=Users,DC=company,DC=local
LDAP_SEARCH_FILTER=(&(objectClass=user)(mail=*))

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/phishlab.log
```

### Database Setup

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql

postgres=# CREATE DATABASE phishlab;
postgres=# CREATE USER phishlab WITH ENCRYPTED PASSWORD 'your_secure_password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE phishlab TO phishlab;
postgres=# \q

# Run migrations
npm run typeorm migration:run
```

### Redis Setup

```bash
# Install Redis
sudo apt install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test connection
redis-cli ping
# Should return: PONG
```

### Run Development Server

```bash
# Run in development mode with hot reload
npm run dev

# Run migrations
npm run migration:run

# Generate migration
npm run migration:generate -- src/migrations/InitialMigration

# Run tests
npm test

# Build for production
npm run build

# Run production server
npm start
```

### Production Deployment (Ubuntu + Nginx)

```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Clone and setup
git clone https://github.com/your-org/phishlab-backend.git
cd phishlab-backend
npm ci --production
npm run build

# 3. Install PM2
sudo npm install -g pm2

# 4. Start with PM2
pm2 start dist/server.js --name phishlab-api
pm2 save
pm2 startup

# 5. Install and configure Nginx
sudo apt install nginx

sudo nano /etc/nginx/sites-available/phishlab
```

Nginx configuration:

```nginx
server {
    listen 80;
    server_name api.phishlab.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.phishlab.yourdomain.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.phishlab.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.phishlab.yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    # File upload size
    client_max_body_size 10M;
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/phishlab /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install SSL certificate
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.phishlab.yourdomain.com
```

---

## Примеры кода

### Complete Server Setup (server.ts)

```typescript
import 'reflect-metadata';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { AppDataSource } from './data-source';
import { authenticate as wsAuth } from './middleware/wsAuth';
import { errorHandler } from './middleware/errorHandler';
import { scheduleLDAPSync } from './jobs/ldapSync';
import { emailWorker } from './queues/emailQueue';

// Routes
import authRoutes from './routes/auth';
import campaignRoutes from './routes/campaigns';
import templateRoutes from './routes/templates';
import recipientRoutes from './routes/recipients';
import analyticsRoutes from './routes/analytics';
import userRoutes from './routes/users';
import settingsRoutes from './routes/settings';
import trackingRoutes from './routes/tracking';

dotenv.config();

const app = express();
const server = http.createServer(app);

// WebSocket setup
export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

io.use(wsAuth);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-campaign', (campaignId: string) => {
    socket.join(`campaign-${campaignId}`);
  });

  socket.on('leave-campaign', (campaignId: string) => {
    socket.leave(`campaign-${campaignId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/recipients', recipientRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/t', trackingRoutes); // Public tracking endpoints

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Initialize database and start server
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Database connected');

    // Schedule LDAP sync
    scheduleLDAPSync();
    console.log('✅ LDAP sync scheduled');

    // Start email worker
    console.log('✅ Email worker started');

    // Start server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📧 API URL: http://localhost:${PORT}`);
      console.log(`🔌 WebSocket ready`);
    });
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });
```

### TypeORM Data Source (data-source.ts)

```typescript
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'phishlab',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'phishlab',
  synchronize: process.env.NODE_ENV === 'development', // Only in dev!
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
});
```

### Example Entity (Campaign.ts)

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn
} from 'typeorm';
import { User } from './User';
import { Template } from './Template';
import { CampaignRecipient } from './CampaignRecipient';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'draft'
  })
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';

  @Column({ name: 'template_id' })
  templateId: string;

  @ManyToOne(() => Template)
  @JoinColumn({ name: 'template_id' })
  template: Template;

  @Column({ nullable: true })
  subject: string;

  @Column({ name: 'from_name', nullable: true })
  fromName: string;

  @Column({ name: 'from_email', nullable: true })
  fromEmail: string;

  @Column({ name: 'landing_page_url', nullable: true })
  landingPageUrl: string;

  @Column({ name: 'landing_page_html', type: 'text', nullable: true })
  landingPageHtml: string;

  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ name: 'launched_at', type: 'timestamp', nullable: true })
  launchedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'track_email_opens', default: true })
  trackEmailOpens: boolean;

  @Column({ name: 'track_link_clicks', default: true })
  trackLinkClicks: boolean;

  @Column({ name: 'capture_submitted_data', default: true })
  captureSubmittedData: boolean;

  @Column({ name: 'total_recipients', default: 0 })
  totalRecipients: number;

  @Column({ name: 'emails_sent', default: 0 })
  emailsSent: number;

  @Column({ name: 'emails_opened', default: 0 })
  emailsOpened: number;

  @Column({ name: 'links_clicked', default: 0 })
  linksClicked: number;

  @Column({ name: 'data_submitted', default: 0 })
  dataSubmitted: number;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => CampaignRecipient, cr => cr.campaign)
  campaignRecipients: CampaignRecipient[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

---

## 📞 Поддержка

Для вопросов и поддержки:
- **Email**: backend-support@phishlab.local
- **GitHub Issues**: [github.com/your-org/phishlab-backend/issues](https://github.com/your-org/phishlab-backend/issues)
- **Документация**: [docs.phishlab.local](https://docs.phishlab.local)

---

**© 2025 PhishLab. Все права защищены.**
