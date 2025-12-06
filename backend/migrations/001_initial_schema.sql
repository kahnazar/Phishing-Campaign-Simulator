-- Initial database schema for Phishing Campaign Simulator

-- Enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'VIEWER', 'AUDITOR');
CREATE TYPE campaign_status AS ENUM ('DRAFT', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'CANCELLED');
CREATE TYPE campaign_recipient_status AS ENUM ('PENDING', 'SCHEDULED', 'SENDING', 'SENT', 'OPENED', 'CLICKED', 'SUBMITTED', 'BOUNCED', 'COMPLAINED', 'FAILED');
CREATE TYPE audit_action_type AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGOUT', 'CAMPAIGN_CREATED', 'CAMPAIGN_UPDATED', 'CAMPAIGN_LAUNCHED', 'CAMPAIGN_CANCELLED', 'TEMPLATE_CREATED', 'TEMPLATE_UPDATED', 'TEMPLATE_DELETED', 'SMTP_CONFIG_UPDATED', 'RECIPIENTS_IMPORTED', 'USER_INVITED', 'USER_ROLE_UPDATED', 'SECURITY_EVENT', 'OTHER');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'VIEWER',
    password_hash TEXT NOT NULL,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Templates table
CREATE TABLE templates (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    variant VARCHAR(255),
    tags TEXT[] DEFAULT '{}',
    thumbnail_url TEXT,
    subject VARCHAR(255) NOT NULL,
    preview_text TEXT,
    html_content TEXT,
    text_content TEXT,
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status campaign_status NOT NULL DEFAULT 'DRAFT',
    template_id VARCHAR(255) REFERENCES templates(id) ON DELETE SET NULL,
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP,
    launched_at TIMESTAMP,
    completed_at TIMESTAMP,
    recipients_count INTEGER NOT NULL DEFAULT 0,
    sent_count INTEGER NOT NULL DEFAULT 0,
    opened_count INTEGER NOT NULL DEFAULT 0,
    clicked_count INTEGER NOT NULL DEFAULT 0,
    submitted_count INTEGER NOT NULL DEFAULT 0,
    failure_count INTEGER NOT NULL DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Recipients table
CREATE TABLE recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    department VARCHAR(255),
    position VARCHAR(255),
    campaign_count INTEGER NOT NULL DEFAULT 0,
    click_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
    last_engaged_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Campaign Recipients junction table
CREATE TABLE campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
    status campaign_recipient_status NOT NULL DEFAULT 'PENDING',
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    submitted_at TIMESTAMP,
    bounced_at TIMESTAMP,
    complaint_at TIMESTAMP,
    failure_reason TEXT,
    token VARCHAR(255) UNIQUE,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, recipient_id)
);

-- Team Members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    team_name VARCHAR(255),
    role user_role NOT NULL DEFAULT 'VIEWER',
    campaign_count INTEGER NOT NULL DEFAULT 0,
    last_active_at TIMESTAMP,
    last_active_label VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Email Config table
CREATE TABLE email_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL DEFAULT 587,
    secure BOOLEAN NOT NULL DEFAULT false,
    username VARCHAR(255),
    password TEXT,
    from_email VARCHAR(255),
    from_name VARCHAR(255),
    rate_limit_per_minute INTEGER NOT NULL DEFAULT 100,
    use_local_smtp BOOLEAN NOT NULL DEFAULT false,
    last_verified_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action audit_action_type NOT NULL,
    resource_type VARCHAR(255),
    resource_id VARCHAR(255),
    resource_campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    ip_address VARCHAR(255),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_campaigns_template_id ON campaigns(template_id);
CREATE INDEX idx_campaigns_created_by_id ON campaigns(created_by_id);
CREATE INDEX idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_recipient_id ON campaign_recipients(recipient_id);
CREATE INDEX idx_campaign_recipients_status ON campaign_recipients(status);
CREATE INDEX idx_templates_created_by_id ON templates(created_by_id);
CREATE INDEX idx_email_configs_user_id ON email_configs(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_campaign_id ON audit_logs(resource_campaign_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipients_updated_at BEFORE UPDATE ON recipients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_recipients_updated_at BEFORE UPDATE ON campaign_recipients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_configs_updated_at BEFORE UPDATE ON email_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: PasswordStrong@!@)
-- Password hash for 'PasswordStrong@!@' using scrypt
-- This will be created/updated by init-db.ts script
-- Hash: ff3f3f569538dc669774f9bafea76153:1797b8d18e263e18d1be675475db64b658ca1cb4d5d72aed40a69689eba739fa30af4710fab7888c35d711c09960949a1563f33293291bfc68ce6f2775c39252
INSERT INTO users (id, email, name, role, password_hash) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@offbox.uz', 'Admin User', 'ADMIN', 'ff3f3f569538dc669774f9bafea76153:1797b8d18e263e18d1be675475db64b658ca1cb4d5d72aed40a69689eba739fa30af4710fab7888c35d711c09960949a1563f33293291bfc68ce6f2775c39252')
ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

