# SMTP / Email Delivery Guide

This application does **not** include a working email pipeline out of the box. Follow the checklist below to enable outbound email (e.g., campaign notifications or test messages).

## 1. Install a Mail Transport Library

- Recommended choice: [`nodemailer`](https://www.npmjs.com/package/nodemailer).
- If you are running in an offline environment, download the package in advance or use an internal registry.

```bash
npm install nodemailer
```

## 2. Extend the Backend

1. Create a helper (e.g., `server/email.js`) that exports a `sendMail(options)` function using the transporter.
2. Use environment variables to configure credentials:
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`
   - `SMTP_USER`, `SMTP_PASS`
   - `SMTP_FROM` (default From header)
3. Add an Express route such as `POST /api/email/test` that validates payload and calls `sendMail`.
4. Handle failures gracefully (timeouts, authentication errors) and log them server-side.

## 3. Secure Secrets

- Never store SMTP passwords or API keys in git.
- Use `.env` files, secret managers, or container orchestrator secret stores.
- Update the Dockerfile to pass env vars via `docker run -e ...` or compose files.

## 4. Update the Frontend

- Wire the SMTP settings form (currently only UI) to the new backend endpoint.
- Provide feedback to the user (success/error toast).
- Consider disabling fields if the backend reports that SMTP is not configured.

## 5. Operational Checklist

- Rate limiting: ensure you respect provider limits.
- TLS: always prefer secure connections (port 465/587 with STARTTLS).
- Monitoring: log delivery failures and expose health metrics (e.g., `/api/health` includes SMTP readiness).
- Testing: use sandboxes (Mailtrap, SendGrid test mode) before production.

Once these steps are complete, the application will be capable of sending emails through your chosen SMTP provider.  
Until then, any action that suggests “Send email” is purely visual.***
