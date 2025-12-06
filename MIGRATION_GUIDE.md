# Руководство по миграции проекта

## Новая структура проекта

```
Phishing-Campaign-Simulator/
├── api/                    # API endpoints (можно объединить с backend)
├── backend/                 # Backend сервер
│   ├── config/            # Конфигурация (database.ts)
│   ├── controllers/       # Контроллеры
│   ├── middleware/        # Middleware (auth.ts)
│   ├── services/          # Бизнес-логика
│   ├── migrations/        # SQL миграции
│   ├── index.ts          # Главный файл сервера
│   └── tsconfig.json     # TypeScript конфигурация
├── frontend/              # Frontend приложение
│   ├── src/              # Исходный код
│   ├── vite.config.ts    # Vite конфигурация
│   └── package.json      # Frontend зависимости
└── package.json          # Корневой package.json
```

## Шаги миграции

### 1. Переместить фронтенд

```bash
mv src frontend/src
mv vite.config.ts frontend/
mv index.html frontend/
```

### 2. Обновить package.json

Удалить зависимости Prisma:
- `@prisma/client`
- `prisma`

Добавить зависимости для PostgreSQL:
- `pg` - нативный PostgreSQL клиент
- `@types/pg` - типы для TypeScript

### 3. Выполнить миграции базы данных

```bash
# Подключиться к PostgreSQL
psql -U your_user -d your_database

# Выполнить миграцию
\i backend/migrations/001_initial_schema.sql
```

Или через переменную окружения:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/phishlab"
psql $DATABASE_URL -f backend/migrations/001_initial_schema.sql
```

### 4. Обновить переменные окружения

Создать `.env` файл:
```
DATABASE_URL=postgresql://user:password@localhost:5432/phishlab
DATABASE_SSL=false
JWT_SECRET=your-secret-key
JWT_EXPIRY_MS=43200000
PORT=4000
```

### 5. Обновить скрипты в package.json

```json
{
  "scripts": {
    "dev": "cd frontend && vite",
    "build": "cd frontend && vite build",
    "backend": "tsx watch backend/index.ts",
    "backend:build": "tsc --project backend/tsconfig.json",
    "backend:start": "node backend/dist/index.js",
    "start": "concurrently \"npm run backend\" \"npm run dev\"",
    "migrate": "psql $DATABASE_URL -f backend/migrations/001_initial_schema.sql"
  }
}
```

### 6. Обновить vite.config.ts

Обновить пути в `frontend/vite.config.ts`:
```typescript
export default defineConfig({
  // ...
  build: {
    outDir: '../build', // или 'dist'
  },
  // ...
});
```

## Изменения в коде

### Замена Prisma на нативный SQL

Все сервисы теперь используют `query()` функцию из `backend/config/database.ts` вместо Prisma клиента.

Пример:
```typescript
// Было (Prisma)
const user = await prisma.user.findUnique({ where: { id } });

// Стало (нативный SQL)
const result = await query<User>('SELECT * FROM users WHERE id = $1', [id]);
const user = result.rows[0];
```

## Проверка

1. Убедитесь, что база данных создана и миграции выполнены
2. Проверьте подключение: `npm run backend`
3. Проверьте фронтенд: `npm run dev`
4. Запустите все вместе: `npm start`

## Примечания

- Все контроллеры обновлены для работы с нативным SQL
- Сервисы используют PostgreSQL напрямую через `pg` библиотеку
- Миграции находятся в `backend/migrations/`
- Структура базы данных идентична Prisma схеме, но использует нативный SQL

