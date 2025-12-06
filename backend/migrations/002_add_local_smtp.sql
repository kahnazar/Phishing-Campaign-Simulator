-- Add local SMTP support
-- Add useLocalSmtp field to email_configs (if not exists in 001 migration)
ALTER TABLE email_configs ADD COLUMN IF NOT EXISTS use_local_smtp BOOLEAN NOT NULL DEFAULT false;

-- Create table for storing local emails
CREATE TABLE IF NOT EXISTS local_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "from" TEXT NOT NULL,
    "to" TEXT[] NOT NULL,
    subject TEXT,
    text TEXT,
    html TEXT,
    headers JSONB,
    date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_local_emails_created_at ON local_emails(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_local_emails_to ON local_emails USING GIN("to");
CREATE INDEX IF NOT EXISTS idx_local_emails_from ON local_emails("from");

