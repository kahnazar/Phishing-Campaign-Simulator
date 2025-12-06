# Docker Setup Guide

Этот проект настроен для запуска через Docker с автоматической инициализацией базы данных и созданием администратора.

## Быстрый старт

### 1. Сборка и запуск

```bash
# Сборка и запуск всех сервисов
docker-compose up --build

# Или в фоновом режиме
docker-compose up -d --build
```

### 2. Доступ к приложению

После запуска приложение будет доступно по адресу:
- **Frontend/API**: http://localhost:4000
- **PostgreSQL**: localhost:5432

### 3. Учетные данные администратора

При первом запуске автоматически создается администратор:
- **Email**: `admin@offbox.uz`
- **Password**: `PasswordStrong@!@`

## Что происходит при запуске

1. **PostgreSQL** запускается и ждет готовности
2. **Приложение** ждет готовности PostgreSQL
3. **Миграции** выполняются автоматически:
   - `001_initial_schema.sql` - создание всех таблиц и типов
   - `002_add_local_smtp.sql` - настройка локального SMTP
4. **Администратор** создается/обновляется с указанными учетными данными
5. **Приложение** запускается

## Переменные окружения

Вы можете настроить переменные через `.env` файл или в `docker-compose.yml`:

```env
# База данных
DB_HOST=postgres
DB_USER=phishlab
DB_PASSWORD=phishlab_password
DB_NAME=phishlab
DATABASE_URL=postgresql://phishlab:phishlab_password@postgres:5432/phishlab

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRY_MS=43200000

# SMTP
USE_LOCAL_SMTP=true
```

## Полезные команды

```bash
# Просмотр логов
docker-compose logs -f app

# Остановка
docker-compose down

# Остановка с удалением volumes (удалит все данные!)
docker-compose down -v

# Пересборка без кэша
docker-compose build --no-cache

# Выполнение команд в контейнере
docker-compose exec app sh

# Подключение к PostgreSQL
docker-compose exec postgres psql -U phishlab -d phishlab
```

## Структура

- `Dockerfile` - многостадийная сборка приложения
- `docker-compose.yml` - оркестрация сервисов
- `docker-entrypoint.sh` - скрипт инициализации при запуске
- `backend/scripts/init-db.ts` - скрипт миграций и создания админа

## Troubleshooting

### База данных не подключается
Проверьте, что PostgreSQL контейнер запущен:
```bash
docker-compose ps
```

### Миграции не выполняются
Проверьте логи:
```bash
docker-compose logs app | grep -i migration
```

### Администратор не создается
Проверьте логи инициализации:
```bash
docker-compose logs app | grep -i admin
```

### Изменить пароль администратора
Измените `ADMIN_PASSWORD` в `backend/scripts/init-db.ts` и пересоберите:
```bash
docker-compose up --build
```

