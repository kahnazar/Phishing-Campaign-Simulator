# SMTP / Email Delivery Guide

PhishLab ships with a basic SMTP implementation powered by [Nodemailer](https://www.npmjs.com/package/nodemailer). You can configure credentials either via environment variables or through the Settings → SMTP screen.

## 0. Prepare a `.env` file

- Copy `.env.example` to `.env` in the project root (`cp .env.example .env`).
- Fill in the SMTP fields; leave placeholders blank if you want to supply them later via the web UI.
- `.env` is loaded automatically by the Express server through the `dotenv` package. Keep this file out of source control (it is ignored by `.gitignore`).

## 1. How configuration is resolved

1. **Environment variables** (highest priority)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`
   - `SMTP_USER`, `SMTP_PASS`
   - `SMTP_FROM`
2. **Saved settings** (`server/data/config.json`) – written from the UI when you click **Save Changes**.
3. Defaults: port falls back to `587`, TLS is enabled automatically for port `465`.

If an environment variable is defined it overrides the saved value. This allows production deployments to keep secrets outside of the repo while local instances can rely on the built-in config store.

## 2. Managing credentials from the UI

- Navigate to **Settings → SMTP**.
- Enter host, port, sender address, username and password, then click **Save Changes**.
- The configuration is persisted to `server/data/config.json`.
- You can clear a stored password with the **Clear** button; leaving the field blank keeps the existing value.
- Use **Send Test Email** to verify delivery. The request hits `POST /api/email/test` and reports the Nodemailer response.

> ⚠️ Passwords are stored in plain text inside `server/data/config.json`. Treat the file as sensitive information and fold it into your secret-management strategy (restrict permissions, mount as a volume, or replace with a dedicated vault).

## 3. Required runtime variables

Even with UI-managed settings, the Node process must still expose at least:

- `SMTP_HOST` or a stored host value
- `SMTP_FROM` or a stored from address

Optional variables:

- `SMTP_PORT` (defaults to 587)
- `SMTP_SECURE` (`true`/`false`)
- `SMTP_USER`, `SMTP_PASS`

Example Docker run command (values here override anything stored in `.env` or the UI):

```bash
docker run --rm -p 4000:4000 \
  -e SMTP_HOST=smtp.example.com \
  -e SMTP_FROM="noreply@example.com" \
  -e SMTP_USER="user@example.com" \
  -e SMTP_PASS="super-secret" \
  phishing-campaign-simulator
```

## 4. Production checklist

- **Secret storage:** Avoid committing `config.json`. Mount it as a volume or supply credentials through env vars.
- **TLS:** Prefer secure connections (`SMTP_SECURE=true` or port 465).
- **Rate limits:** Respect provider quotas; consider retry logic or background queues for high volume.
- **Monitoring:** Capture Nodemailer errors in logs; the `GET /api/email/status` endpoint echoes readiness.
- **Testing:** Use sandbox providers (Mailtrap, SendGrid test mode) before sending to real addresses.

With these steps complete the application can fully send emails through your SMTP provider while giving admins a simple management UI.
