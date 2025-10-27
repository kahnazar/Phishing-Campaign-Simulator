# PhishLab - Security Awareness Phishing Simulator

<div align="center">

![PhishLab](https://img.shields.io/badge/PhishLab-v1.0.0-5561F1?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=for-the-badge&logo=tailwind-css)

**Безопасный симулятор фишинга для корпоративного обучения кибербезопасности**

[Документация](#-документация) • [Установка](#-установка) • [Backend API](./documentation/BACKEND_API.md) • [Вклад в проект](#-вклад-в-проект)

</div>

---

## 📋 Содержание

- [О проекте](#-о-проекте)
- [Основные возможности](#-основные-возможности)
- [Технологический стек](#-технологический-стек)
- [Архитектура](#-архитектура)
- [Установка](#-установка)
- [Структура проекта](#-структура-проекта)
- [Использование](#-использование)
- [Backend API](#-backend-api)
- [Безопасность](#-безопасность)
- [Мультиязычность](#-мультиязычность)
- [Роли и права доступа](#-роли-и-права-доступа)
- [Вклад в проект](#-вклад-в-проект)
- [Лицензия](#-лицензия)

---

## 🎯 О проекте

**PhishLab** — это современный веб-симулятор фишинга для корпоративного обучения сотрудников основам кибербезопасности. Приложение позволяет создавать, запускать и анализировать фишинговые кампании в безопасной учебной среде.

### Для кого предназначен PhishLab?

- **Отделы кибербезопасности** — для проведения внутренних аудитов безопасности
- **HR отделы** — для обучения новых сотрудников
- **Compliance команды** — для соответствия стандартам безопасности
- **IT департаменты** — для оценки уровня осведомленности персонала

---

## ✨ Основные возможности

### 🎨 Визуальный WYSIWYG редактор
- Drag & Drop интерфейс для создания email шаблонов и landing pages
- 7 типов блоков: Header, Hero Image, Text, Button, Image, Divider, Footer
- Импорт/экспорт HTML шаблонов
- Live preview в трех режимах: Desktop (1366px), Tablet (768px), Mobile (375px)
- Встроенная библиотека изображений через Unsplash

### 📚 Библиотека шаблонов
**20 готовых профессиональных шаблонов** по категориям:
- **HR** — Password Reset, Open Enrollment, Welcome Pack
- **IT** — Ticket Update, Suspicious Login, MFA Enrollment, Password Expiry
- **Finance** — Invoice Attached, Billing Alert, Refund Processed
- **Security** — Security Alerts, Two-Factor Authentication
- **Executive** — Urgent CEO Request
- **Delivery** — Package Awaiting
- **Social** — LinkedIn Message
- **Training** — Mandatory Course
- **Event** — Webinar Registration
- **Policy** — Company Policy Update
- И другие...

### 🔖 Система Merge Tags
Персонализация контента с помощью динамических тегов:
```
{{FirstName}}      - Имя получателя
{{LastName}}       - Фамилия
{{Email}}          - Email адрес
{{Company}}        - Название компании
{{Department}}     - Отдел
{{ManagerName}}    - Имя руководителя
{{Position}}       - Должность
{{TrackingLink}}   - Уникальная ссылка для трекинга
```

### 👥 Управление получателями
- **Импорт из CSV** — массовая загрузка пользователей
- **Google Sheets интеграция** — синхронизация с таблицами
- **Active Directory / LDAP** — автоматическая синхронизация с корпоративным каталогом
- **Группы рассылки** — организация получателей по отделам
- **Профили риска** — отслеживание уязвимых пользователей

### 📊 Аналитика в реальном времени
Детальная статистика по каждой кампании:
- **Email Opens** — кто открыл письмо и когда
- **Link Clicks** — переходы по ссылкам с геолокацией и устройствами
- **Data Submissions** — захват введенных данных (логины/пароли)
- **Risk Score** — общий процент попавшихся на фишинг
- **Timeline Analytics** — график активности по дням
- **Department Comparison** — сравнение отделов по уязвимости

### 🔐 Ролевая модель (RBAC)
4 уровня доступа с детальными правами:

| Роль | Описание | Права доступа |
|------|----------|---------------|
| **Admin** | Полный доступ | Все операции, управление пользователями, настройки системы |
| **Manager** | Управление кампаниями | Создание/редактирование кампаний, просмотр отчетов |
| **Viewer** | Только просмотр | Чтение отчетов и статистики без возможности изменений |
| **Auditor** | Аудит и соответствие | Доступ к полным логам, экспорт данных для аудита |

### ⚙️ Конфигурация и интеграции
- **SMTP настройки** — собственный почтовый сервер
- **LDAP/Active Directory** — синхронизация пользователей
- **API Access** — REST API для внешних интеграций
- **Two-Factor Authentication** — обязательная 2FA для всех пользователей
- **IP Whitelist** — ограничение доступа по IP
- **Session Timeout** — автоматический выход через 30 минут

---

## 🛠 Технологический стек

### Frontend
- **React 18** — современный UI framework
- **TypeScript** — типизированный JavaScript
- **Tailwind CSS 4.0** — utility-first CSS framework
- **shadcn/ui** — высококачественные компоненты
- **Lucide React** — иконки
- **Recharts** — графики и диаграммы
- **React DnD** — drag and drop функциональность
- **Motion (Framer Motion)** — анимации
- **Sonner** — toast уведомления

### Backend (требуется реализация)
- **Node.js + Express** — REST API сервер
- **PostgreSQL** — основная база данных
- **Redis** — кеширование и очереди
- **WebSocket** — real-time аналитика
- **Nodemailer** — отправка email
- **JWT** — аутентификация
- **LDAP.js** — Active Directory интеграция

Полная документация Backend API: [BACKEND_API.md](./documentation/BACKEND_API.md)

---

## 🏗 Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                     PhishLab Frontend                       │
│                   (React + TypeScript)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Dashboard  │  │ Campaigns  │  │  Reports   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Templates  │  │   Editor   │  │ Recipients │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└───────────────────────┬─────────────────────────────────────┘
                        │ REST API / WebSocket
┌───────────────────────▼─────────────────────────────────────┐
│                   Backend API Server                        │
│                  (Node.js + Express)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │Campaign  │  │Analytics │  │  Email   │   │
│  │  Service │  │ Service  │  │ Service  │  │ Service  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┬──────────────┐
        │               │               │              │
┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼─────┐
│  PostgreSQL  │ │    Redis    │ │   SMTP    │ │ LDAP/AD   │
│   Database   │ │    Cache    │ │  Server   │ │  Server   │
└──────────────┘ └─────────────┘ └───────────┘ └───────────┘
```

### Основные компоненты

#### Frontend (UI Layer)
- **App.tsx** — главный компонент с роутингом между views
- **Dashboard** — обзорная панель с метриками
- **Campaign Builder** — создание новых кампаний
- **Visual Editor** — WYSIWYG редактор для email и landing pages
- **Templates Library** — каталог из 20 готовых шаблонов
- **Recipients Manager** — управление получателями и группами
- **Reports** — детальная аналитика и визуализация данных
- **Team & Roles** — управление пользователями и правами доступа
- **Settings** — конфигурация системы и интеграций

#### Backend (API Layer) - Требует реализации
- **Authentication Service** — JWT auth, 2FA, session management
- **Campaign Service** — CRUD операции для кампаний
- **Email Service** — отправка писем через SMTP с трекингом
- **Analytics Service** — сбор и обработка метрик
- **LDAP Service** — синхронизация с Active Directory
- **Template Service** — управление шаблонами
- **Recipient Service** — управление получателями

#### Data Layer
- **PostgreSQL** — хранение пользователей, кампаний, шаблонов, метрик
- **Redis** — кеширование, очереди отправки email, session store
- **File Storage** — хранение загруженных HTML шаблонов и изображений

---

## 📦 Установка

### Предварительные требования

- Node.js >= 18.0.0
- npm >= 9.0.0 или yarn >= 1.22.0
- PostgreSQL >= 14.0 (для backend)
- Redis >= 7.0 (для backend)

### Установка Frontend

```bash
# Клонировать репозиторий
git clone https://github.com/your-org/phishlab.git
cd phishlab

# Установить зависимости
npm install

# Запустить в режиме разработки
npm run dev

# Сборка для production
npm run build
```

Приложение будет доступно по адресу: `http://localhost:5173`

### Установка Backend

См. детальную инструкцию в [BACKEND_API.md](./documentation/BACKEND_API.md#installation)

```bash
# Перейти в директорию backend
cd backend

# Установить зависимости
npm install

# Настроить переменные окружения
cp .env.example .env
nano .env

# Запустить миграции базы данных
npm run migrate

# Запустить сервер
npm run dev
```

Backend API будет доступен по адресу: `http://localhost:3000`

---

## 📁 Структура проекта

```
phishlab/
├── App.tsx                          # Главный компонент приложения
├── components/                      # React компоненты
│   ├── ui/                          # shadcn/ui компоненты
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── ... (39 компонентов)
│   ├── app-sidebar.tsx              # Боковая навигационная панель
│   ├── dashboard-view.tsx           # Главная панель с метриками
│   ├── campaigns-view.tsx           # Список всех кампаний
│   ├── campaign-builder-view.tsx    # Конструктор новых кампаний
│   ├── templates-view.tsx           # Библиотека из 20 шаблонов
│   ├── editor-view.tsx              # Визуальный WYSIWYG редактор
│   ├── recipients-view.tsx          # Управление получателями
│   ├── reports-view.tsx             # Аналитика и отчеты
│   ├── team-view.tsx                # Управление командой и ролями
│   ├── settings-view.tsx            # Настройки системы
│   ├── language-selector.tsx        # Переключатель языков (RU/EN/UZ)
│   ├── ldap-settings.tsx            # Настройки LDAP/AD интеграции
│   ├── html-import-export-dialog.tsx # Импорт/экспорт HTML шаблонов
│   └── image-picker-dialog.tsx      # Выбор изображ��ний
├── lib/                             # Утилиты и конфигурация
│   ├── data.ts                      # Моковые данные и типы
│   ├── i18n.tsx                     # I18n контекст и провайдер
│   └── translations.ts              # Переводы на 3 языка
├── styles/
│   └── globals.css                  # Глобальные стили и Tailwind config
├── guidelines/
│   └── Guidelines.md                # Руководство по разработке
├── documentation/
│   ├── BACKEND_API.md               # Спецификация Backend API
│   └── DEPLOYMENT.md                # Инструкции по развертыванию
└── README.md                        # Этот файл
```

---

## 🚀 Использование

### 1. Создание кампании

```typescript
// Шаг 1: Выберите шаблон из библиотеки
const template = templates.find(t => t.id === 'hr-password-reset');

// Шаг 2: Настройте детали кампании
const campaign = {
  name: 'Q4 Security Awareness Training',
  template: template.id,
  recipients: selectedGroup.users,
  scheduledAt: '2025-10-20T09:00:00Z'
};

// Шаг 3: Настройте трекинг
const trackingSettings = {
  trackEmailOpens: true,
  trackLinkClicks: true,
  captureSubmittedData: true
};

// Шаг 4: Запустите кампанию
POST /api/campaigns
```

### 2. Использование Merge Tags

В редакторе вставьте merge tags для персонализации:

```html
<p>Здравствуйте, {{FirstName}} {{LastName}}!</p>
<p>Ваш аккаунт в компании {{Company}} требует обновления пароля.</p>
<p>Отдел: {{Department}}</p>
<a href="{{TrackingLink}}">Обновить пароль</a>
```

При отправке автоматически заменяется на:

```html
<p>Здравствуйте, Иван Петров!</p>
<p>Ваш аккаунт в компании Acme Corp требует обновления пароля.</p>
<p>Отдел: IT</p>
<a href="https://track.phishlab.local/c/a1b2c3">Обновить пароль</a>
```

### 3. Импорт получателей из CSV

Формат CSV файла:

```csv
FirstName,LastName,Email,Department,Position,ManagerName
Иван,Петров,ivan.petrov@company.com,IT,Developer,Анна Сидорова
Мария,Иванова,maria.ivanova@company.com,HR,HR Manager,Петр Смирнов
```

Импорт через UI:
```
Recipients → Import CSV → Выбрать файл → Подтвердить
```

### 4. Интеграция с LDAP/Active Directory

```javascript
// Настройки в Settings → Integrations → LDAP
const ldapConfig = {
  url: 'ldap://dc.company.local:389',
  bindDN: 'CN=phishlab,OU=Service Accounts,DC=company,DC=local',
  bindPassword: 'your-password',
  searchBase: 'OU=Users,DC=company,DC=local',
  searchFilter: '(&(objectClass=user)(mail=*))',
  attributes: ['cn', 'mail', 'department', 'title', 'manager']
};

// Синхронизация запускается автоматически каждые 24 часа
// или вручную через UI
```

### 5. Просмотр аналитики

```javascript
// Dashboard показывает общую статистику
const metrics = {
  totalRecipients: 1254,
  emailsSent: 2340,
  openRate: '75.6%',
  clickRate: '18.8%',
  riskScore: '12.4%' // процент попавшихся
};

// Детальная аналитика в Reports
const campaignReport = {
  sent: 250,
  opened: 189, // 75.6%
  clicked: 47, // 18.8%
  submitted: 12, // 4.8% - критическая метрика
  timeline: {
    day1: 78,    // 62% открытий в первый день
    day2_3: 89,  // 30% во 2-3 день
    afterDay3: 22 // 8% после 3 дня
  },
  byDepartment: {
    IT: { clicked: 5, total: 50 },  // 10% - низкий риск
    HR: { clicked: 12, total: 45 }, // 27% - средний риск
    Finance: { clicked: 8, total: 30 } // 27% - средний риск
  }
};
```

---

## 🔌 Backend API

Полная документация Backend API с примерами: [BACKEND_API.md](./documentation/BACKEND_API.md)

### Основные эндпоинты

```
Authentication
POST   /api/auth/login               # Вход в систему
POST   /api/auth/logout              # Выход из системы
POST   /api/auth/refresh             # Обновление токена
POST   /api/auth/2fa/enable          # Включить 2FA
POST   /api/auth/2fa/verify          # Проверить 2FA код

Campaigns
GET    /api/campaigns                # Список кампаний
POST   /api/campaigns                # Создать кампанию
GET    /api/campaigns/:id            # Получить кампанию
PUT    /api/campaigns/:id            # Обновить кампанию
DELETE /api/campaigns/:id            # Удалить кампанию
POST   /api/campaigns/:id/launch     # Запустить кампанию
GET    /api/campaigns/:id/analytics  # Аналитика кампании

Templates
GET    /api/templates                # Список шаблонов
POST   /api/templates                # Создать шаблон
GET    /api/templates/:id            # Получить шаблон
PUT    /api/templates/:id            # Обновить шаблон
DELETE /api/templates/:id            # Удалить шаблон
POST   /api/templates/import         # Импорт HTML

Recipients
GET    /api/recipients               # Список получателей
POST   /api/recipients               # Добавить получателя
POST   /api/recipients/import        # Импорт CSV
GET    /api/recipients/groups        # Группы получателей
POST   /api/recipients/sync-ldap     # Синхронизация с LDAP

Analytics
GET    /api/analytics/dashboard      # Метрики дашборда
GET    /api/analytics/campaign/:id   # Метрики кампании
GET    /api/analytics/export         # Экспорт отчета

Users & Roles
GET    /api/users                    # Список пользователей
POST   /api/users                    # Создать пользователя
PUT    /api/users/:id/role           # Обновить роль
DELETE /api/users/:id                # Удалить пользователя

Settings
GET    /api/settings                 # Получить настройки
PUT    /api/settings                 # Обновить настройки
POST   /api/settings/smtp/test       # Тест SMTP
POST   /api/settings/ldap/test       # Тест LDAP

Tracking (публичные эндпоинты без авторизации)
GET    /t/:trackingId/open           # Трекинг открытия письма (pixel)
GET    /t/:trackingId/click          # Трекинг клика по ссылке
POST   /t/:trackingId/submit         # Захват введенных данных
```

---

## 🔒 Безопасность

### Принципы безопасности PhishLab

⚠️ **ВАЖНО**: PhishLab предназначен **только для обучения** сотрудников в безопасной среде. Запрещено использовать для:
- Реальных фишинговых атак
- Несанкционированного тестирования
- Сбора личных данных без согласия
- Нарушения законодательства

### Реализованные меры безопасности

1. **Аутентификация и авторизация**
   - JWT токены с коротким временем жизни (15 мин)
   - Refresh tokens для продления сессии
   - Обязательная двухфакторная аутентификация (2FA)
   - Ролевая модель доступа (RBAC)
   - Session timeout после 30 минут неактивности

2. **Защита данных**
   - Все пароли хешируются с bcrypt (cost factor 12)
   - Sensitive данные шифруются в БД (AES-256)
   - HTTPS обязателен для production
   - CSP (Content Security Policy) заголовки
   - XSS защита на всех input полях

3. **Ограничения и мониторинг**
   - Rate limiting на API (100 req/min)
   - IP Whitelist для ограничения доступа
   - Логирование всех критических операций
   - Аудит трейл для compliance

4. **SMTP Security**
   - TLS/SSL для SMTP соединений
   - SPF, DKIM, DMARC настройки
   - Изолированный домен для симуляций (не основной корп. домен)

5. **Data Privacy**
   - Захваченные credentials хешируются сразу после получения
   - Опция автоматического удаления данных через N дней
   - Согласие пользователей на участие в симуляциях
   - GDPR compliance режим

### Рекомендации по развертыванию

```bash
# 1. Используйте отдельный поддомен
phishing-test.company.com (не company.com)

# 2. Настройте firewall правила
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw deny 3000/tcp  # backend только через nginx

# 3. Включите SSL сертификат
certbot --nginx -d phishing-test.company.com

# 4. Настройте security headers в nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000";
```

---

## 🌍 Мультиязычность

PhishLab поддерживает **3 языка** с полной локализацией интерфейса:

| Язык | Код | Статус | Переведено |
|------|-----|--------|------------|
| 🇬🇧 English | `en` | ✅ Полностью | 100% |
| 🇷🇺 Русский | `ru` | ✅ Полностью | 100% |
| 🇺🇿 Ўзбекча (Узбекский) | `uz` | ✅ Полностью | 100% |

### Переключение языка

```tsx
import { useTranslation } from './lib/i18n';

function Component() {
  const { t, language, setLanguage } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboardTitle')}</h1>
      <button onClick={() => setLanguage('ru')}>Русский</button>
      <button onClick={() => setLanguage('en')}>English</button>
      <button onClick={() => setLanguage('uz')}>Ўзбекча</button>
    </div>
  );
}
```

### Добавление нового языка

1. Откройте `lib/translations.ts`
2. Добавьте новый язык в тип `Language`:
   ```typescript
   export type Language = 'en' | 'ru' | 'uz' | 'de'; // добавили немецкий
   ```
3. Добавьте переводы в объект `translations`:
   ```typescript
   export const translations: Record<Language, Translations> = {
     // ...существующие языки
     de: {
       dashboard: 'Instrumententafel',
       campaigns: 'Kampagnen',
       // ...все остальные ключи
     }
   };
   ```

### Структура переводов

Все переводы хранятся в `lib/translations.ts` с категоризацией:

```typescript
interface Translations {
  // Navigation - 8 ключей
  dashboard: string;
  campaigns: string;
  templates: string;
  // ...
  
  // Common - 14 ключей
  search: string;
  filter: string;
  export: string;
  // ...
  
  // Dashboard - 18 ключей
  // Campaigns - 16 ключей
  // Templates - 9 ключей
  // Recipients - 18 ключей
  // Reports - 15 ключей
  // Team - 17 ключей
  // Settings - 25 ключей
  // Campaign Builder - 16 ключей
  // Editor - 18 ключей
}
```

**Всего: 219 ключей перевода**

---

## 👥 Роли и права доступа

### Матрица прав доступа (RBAC)

| Функционал | Admin | Manager | Viewer | Auditor |
|------------|:-----:|:-------:|:------:|:-------:|
| **Dashboard** |
| Просмотр метрик | ✅ | ✅ | ✅ | ✅ |
| **Campaigns** |
| Просмотр списка | ✅ | ✅ | ✅ | ✅ |
| Создание | ✅ | ✅ | ❌ | ❌ |
| Редактирование | ✅ | ✅ | ❌ | ❌ |
| Удаление | ✅ | ✅ | ❌ | ❌ |
| Запуск | ✅ | ✅ | ❌ | ❌ |
| **Templates** |
| Просмотр | ✅ | ✅ | ✅ | ✅ |
| Создание | ✅ | ✅ | ❌ | ❌ |
| Редактирование | ✅ | ✅ | ❌ | ❌ |
| Импорт HTML | ✅ | ✅ | ❌ | ❌ |
| **Recipients** |
| Просмотр | ✅ | ✅ | ✅ | ✅ |
| Добавление | ✅ | ✅ | ❌ | ❌ |
| Импорт CSV | ✅ | ✅ | ❌ | ❌ |
| Синхронизация LDAP | ✅ | ❌ | ❌ | ❌ |
| **Reports** |
| Просмотр отчетов | ✅ | ✅ | ✅ | ✅ |
| Экспорт данных | ✅ | ✅ | ✅ | ✅ |
| **Team & Roles** |
| Просмотр команды | ✅ | ❌ | ❌ | ✅ |
| Приглашение пользователей | ✅ | ❌ | ❌ | ❌ |
| Изменение ролей | ✅ | ❌ | ❌ | ❌ |
| Удаление пользователей | ✅ | ❌ | ❌ | ❌ |
| **Settings** |
| Просмотр настроек | ✅ | ❌ | ❌ | ✅ |
| Изменение настроек | ✅ | ❌ | ❌ | ❌ |
| SMTP конфигурация | ✅ | ❌ | ❌ | ❌ |
| LDAP конфигурация | ✅ | ❌ | ❌ | ❌ |
| API ключи | ✅ | ❌ | ❌ | ❌ |
| **Audit Logs** |
| Просмотр логов | ✅ | ❌ | ❌ | ✅ |
| Экспорт логов | ✅ | ❌ | ❌ | ✅ |

### Описание ролей

#### 🔴 Admin (Администратор)
**Полный доступ к системе**
- Управление пользователями и ролями
- Конфигурация системных настроек
- Настройка интеграций (SMTP, LDAP, API)
- Доступ к audit logs
- Все операции с кампаниями, шаблонами, получателями

**Типичные use cases:**
- IT Security Lead
- CISO (Chief Information Security Officer)
- System Administrator

#### 🟡 Manager (Менеджер)
**Управление кампаниями**
- Создание и запуск фишинговых кампаний
- Редактирование шаблонов
- Управление получателями
- Просмотр детальной аналитики
- Экспорт отчетов

**Типичные use cases:**
- Security Analyst
- Security Awareness Manager
- IT Security Specialist

#### 🟢 Viewer (Наблюдатель)
**Только просмотр**
- Доступ к дашборду и метрикам
- Просмотр списка кампаний (без редактирования)
- Просмотр отчетов
- Экспорт данных для анализа

**Типичные use cases:**
- Management (CEO, CTO)
- HR Director
- Compliance Observer

#### 🔵 Auditor (Аудитор)
**Аудит и соответствие**
- Полный доступ к audit logs
- Просмотр всех кампаний и отчетов
- Экспорт данных для аудита
- Просмотр настроек системы (без изменения)
- Просмотр списка пользователей

**Типичные use cases:**
- Compliance Officer
- Internal Auditor
- External Auditor (временный доступ)

---

## 🤝 Вклад в проект

Мы приветствуем вклад сообщества! Вот как вы можете помочь:

### Reporting Issues

Нашли баг? Создайте issue с описанием:
1. Шаги для воспроизведения
2. Ожидаемое поведение
3. Актуальное поведение
4. Версия браузера / Node.js
5. Скриншоты (если применимо)

### Pull Requests

1. Fork репозитория
2. Создайте feature branch: `git checkout -b feature/amazing-feature`
3. Commit изменения: `git commit -m 'Add amazing feature'`
4. Push в branch: `git push origin feature/amazing-feature`
5. Откройте Pull Request

### Coding Standards

- **TypeScript**: Строгая типизация, без `any`
- **React**: Функциональные компоненты + hooks
- **Naming**: camelCase для переменных, PascalCase для компонентов
- **Comments**: JSDoc для публичных функций
- **Testing**: Unit тесты для критичного функционала

### Development Workflow

```bash
# 1. Установите зависимости
npm install

# 2. Запустите dev сервер
npm run dev

# 3. Запустите тесты
npm run test

# 4. Проверьте линтинг
npm run lint

# 5. Проверьте типы
npm run type-check

# 6. Соберите production build
npm run build
```

---

## 📄 Лицензия

Этот проект распространяется под лицензией **MIT License**.

```
MIT License

Copyright (c) 2025 PhishLab

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Поддержка и контакты

- **Документация**: [docs.phishlab.local](https://docs.phishlab.local)
- **Issue Tracker**: [GitHub Issues](https://github.com/your-org/phishlab/issues)
- **Email**: support@phishlab.local
- **Telegram**: [@phishlab_support](https://t.me/phishlab_support)

---

## 🙏 Благодарности

PhishLab был создан с использованием следующих open-source проектов:

- [React](https://react.dev) — UI библиотека
- [Tailwind CSS](https://tailwindcss.com) — CSS framework
- [shadcn/ui](https://ui.shadcn.com) — Компоненты UI
- [Lucide](https://lucide.dev) — Иконки
- [Recharts](https://recharts.org) — Графики
- [Motion](https://motion.dev) — Анимации

Особая благодарность сообществу за фидбек и вклад в развитие проекта!

---

<div align="center">

**Сделано с ❤️ для повышения кибербезопасности**

[⬆ Вернуться к началу](#phishlab---security-awareness-phishing-simulator)

</div>
