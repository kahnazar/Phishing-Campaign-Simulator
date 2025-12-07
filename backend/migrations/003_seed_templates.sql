-- Seed data: Phishing email templates
-- This migration adds pre-built phishing simulation templates

-- HR Templates
INSERT INTO templates (name, description, category, variant, tags, subject, preview_text, html_content, text_content, created_by_id, active) VALUES
(
    'Urgent: Update Your Benefits Information',
    'HR benefits update phishing template',
    'HR',
    'urgent',
    ARRAY['benefits', 'hr', 'urgent'],
    'Action Required: Update Your Benefits Information by EOD',
    'Your benefits enrollment period is ending soon. Please update your information immediately.',
    '<html><body><div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: #f44336; color: white; padding: 15px; text-align: center;"><h2>URGENT: Benefits Update Required</h2></div><div style="padding: 20px; background: #fff;"><p>Dear {{firstName}},</p><p>Our records indicate that your benefits information is incomplete. You must update your information by end of business today to avoid losing coverage.</p><p><strong>Action Required:</strong></p><ul><li>Review your current benefits</li><li>Update dependent information</li><li>Confirm your selections</li></ul><p style="text-align: center; margin: 30px 0;"><a href="{{trackingUrl}}" style="background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Update Benefits Now</a></p><p>If you do not complete this by 5:00 PM today, your benefits will be automatically cancelled.</p><p>Best regards,<br>HR Department<br>{{company}}</p></div><div style="background: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666;">This is an automated message. Please do not reply.</div></div></body></html>',
    'Dear {{firstName}}, Our records indicate that your benefits information is incomplete. You must update your information by end of business today to avoid losing coverage. Click here to update: {{trackingUrl}}',
    '00000000-0000-0000-0000-000000000001',
    true
),
(
    'New Company Policy - Acknowledgment Required',
    'Policy acknowledgment phishing template',
    'HR',
    'standard',
    ARRAY['policy', 'compliance', 'hr'],
    'Important: New Company Policy Requires Your Acknowledgment',
    'A new company policy has been published and requires your immediate acknowledgment.',
    '<html><body><div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: #1976D2; color: white; padding: 15px;"><h2>New Company Policy</h2></div><div style="padding: 20px; background: #fff;"><p>Dear {{firstName}} {{lastName}},</p><p>{{company}} has updated its Employee Code of Conduct policy. All employees are required to review and acknowledge the new policy within 48 hours.</p><p><strong>Policy Updates Include:</strong></p><ul><li>Remote work guidelines</li><li>Data security requirements</li><li>Social media usage</li><li>Confidentiality agreements</li></ul><p style="text-align: center; margin: 30px 0;"><a href="{{trackingUrl}}" style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Review and Acknowledge Policy</a></p><p>Failure to acknowledge this policy may result in account suspension.</p><p>Thank you for your cooperation,<br>Human Resources</p></div></div></body></html>',
    'Dear {{firstName}} {{lastName}}, {{company}} has updated its Employee Code of Conduct policy. All employees must review and acknowledge within 48 hours. Click to review: {{trackingUrl}}',
    '00000000-0000-0000-0000-000000000001',
    true
),

-- IT Templates
(
    'Critical: Password Expiration Notice',
    'Password reset phishing template',
    'IT',
    'urgent',
    ARRAY['password', 'security', 'it', 'urgent'],
    'Your Password Will Expire in 24 Hours',
    'Your network password is about to expire. Reset it now to avoid account lockout.',
    '<html><body><div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: #FF9800; color: white; padding: 15px; text-align: center;"><h2>⚠️ Password Expiration Warning</h2></div><div style="padding: 20px; background: #fff;"><p>Hello {{firstName}},</p><p>Your network password will expire in <strong>24 hours</strong>. To prevent account lockout and maintain access to company resources, you must reset your password immediately.</p><div style="background: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0;"><strong>Important:</strong> Failure to reset your password will result in:<ul><li>Loss of email access</li><li>VPN disconnection</li><li>File server lockout</li><li>Application access denial</li></ul></div><p style="text-align: center; margin: 30px 0;"><a href="{{trackingUrl}}" style="background: #f44336; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password Now</a></p><p>This process takes less than 2 minutes.</p><p>IT Support Team<br>{{company}}</p></div></div></body></html>',
    'Your network password expires in 24 hours. Reset now to avoid lockout: {{trackingUrl}}',
    '00000000-0000-0000-0000-000000000001',
    true
),
(
    'Security Alert: Unusual Login Detected',
    'Security alert phishing template',
    'Security',
    'urgent',
    ARRAY['security', 'alert', 'login'],
    'Security Alert: Unrecognized Login Attempt',
    'We detected an unusual login attempt on your account. Verify your identity immediately.',
    '<html><body><div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: #d32f2f; color: white; padding: 15px;"><h2>🔒 Security Alert</h2></div><div style="padding: 20px; background: #fff;"><p>Dear {{firstName}},</p><p>We detected a login attempt to your account from an unrecognized device:</p><div style="background: #ffebee; padding: 15px; margin: 20px 0; border-radius: 4px;"><p><strong>Login Details:</strong></p><ul style="margin: 10px 0;"><li>Location: Moscow, Russia</li><li>Device: Unknown Windows PC</li><li>Time: Today at 3:47 AM</li><li>IP Address: 185.220.101.45</li></ul></div><p>If this was you, you can ignore this message. If you do not recognize this activity, your account may be compromised.</p><p style="text-align: center; margin: 30px 0;"><a href="{{trackingUrl}}" style="background: #d32f2f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Secure My Account</a></p><p>For your security, we recommend changing your password immediately.</p><p>Security Team<br>{{company}}</p></div></div></body></html>',
    'Security Alert: Unusual login detected from Moscow, Russia. Verify your identity: {{trackingUrl}}',
    '00000000-0000-0000-0000-000000000001',
    true
),

-- Finance Templates
(
    'Invoice Payment Overdue',
    'Fake invoice phishing template',
    'Finance',
    'standard',
    ARRAY['invoice', 'payment', 'finance'],
    'Payment Reminder: Invoice #12345 is Overdue',
    'Your invoice payment is past due. Please remit payment to avoid late fees.',
    '<html><body><div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: #424242; color: white; padding: 15px;"><h2>Payment Reminder</h2></div><div style="padding: 20px; background: #fff;"><p>Dear {{firstName}} {{lastName}},</p><p>This is a reminder that Invoice #INV-2024-12345 is now <strong>15 days overdue</strong>.</p><table style="width: 100%; border-collapse: collapse; margin: 20px 0;"><tr style="background: #f5f5f5;"><td style="padding: 10px; border: 1px solid #ddd;"><strong>Invoice Number:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">INV-2024-12345</td></tr><tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Amount Due:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">$4,850.00</td></tr><tr style="background: #f5f5f5;"><td style="padding: 10px; border: 1px solid #ddd;"><strong>Due Date:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">15 days ago</td></tr><tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Late Fee:</strong></td><td style="padding: 10px; border: 1px solid #ddd; color: #d32f2f;">$145.50</td></tr></table><p style="text-align: center; margin: 30px 0;"><a href="{{trackingUrl}}" style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">View Invoice & Pay Now</a></p><p>Please remit payment within 5 business days to avoid additional penalties.</p><p>Accounts Receivable<br>{{company}}</p></div></div></body></html>',
    'Payment Reminder: Invoice #INV-2024-12345 is 15 days overdue. Amount due: $4,850.00. View and pay: {{trackingUrl}}',
    '00000000-0000-0000-0000-000000000001',
    true
),

-- General Templates
(
    'Microsoft 365: Storage Almost Full',
    'Cloud storage phishing template',
    'IT',
    'standard',
    ARRAY['microsoft', 'storage', 'cloud'],
    'Your Microsoft 365 Storage is 95% Full',
    'Your cloud storage is almost full. Upgrade now to avoid losing access to your files.',
    '<html><body><div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: #0078d4; color: white; padding: 15px;"><h2>Microsoft 365</h2></div><div style="padding: 20px; background: #fff;"><p>Hi {{firstName}},</p><p>Your Microsoft 365 storage is <strong>95% full</strong>. You are using <strong>47.5 GB</strong> of your 50 GB storage limit.</p><div style="background: #fff4e5; padding: 15px; margin: 20px 0; border-left: 4px solid #ff9800;"><p><strong>Warning:</strong> When your storage is full:</p><ul><li>You won''t be able to receive new emails</li><li>Files won''t sync to OneDrive</li><li>You may lose access to recent documents</li></ul></div><p style="text-align: center; margin: 30px 0;"><a href="{{trackingUrl}}" style="background: #0078d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Upgrade Storage</a></p><p>Alternatively, you can free up space by deleting old files and emails.</p><p>Microsoft Support Team</p></div></div></body></html>',
    'Your Microsoft 365 storage is 95% full (47.5 GB of 50 GB). Upgrade now: {{trackingUrl}}',
    '00000000-0000-0000-0000-000000000001',
    true
),
(
    'LinkedIn: You Appeared in 12 Searches',
    'Social media phishing template',
    'General',
    'standard',
    ARRAY['linkedin', 'social', 'networking'],
    'You appeared in 12 searches this week',
    'See who''s been viewing your LinkedIn profile. Premium members get full access.',
    '<html><body><div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: #0077b5; color: white; padding: 15px;"><h2>LinkedIn</h2></div><div style="padding: 20px; background: #fff;"><p>Hi {{firstName}},</p><p>You''re getting noticed! Your profile appeared in <strong>12 searches</strong> this week.</p><div style="background: #f3f6f8; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center;"><p style="font-size: 24px; margin: 10px 0; color: #0077b5;"><strong>12</strong></p><p>people viewed your profile</p></div><p><strong>Who''s viewing your profile?</strong></p><ul><li>Senior Hiring Manager at Tech Corp</li><li>Recruiter at Fortune 500 Company</li><li>CEO at Startup Inc.</li><li>+ 9 more viewers</li></ul><p style="text-align: center; margin: 30px 0;"><a href="{{trackingUrl}}" style="background: #0077b5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">See Who Viewed Your Profile</a></p><p>Upgrade to Premium to see all profile viewers and get InMail credits.</p><p>The LinkedIn Team</p></div></div></body></html>',
    'You appeared in 12 searches this week on LinkedIn. See who viewed your profile: {{trackingUrl}}',
    '00000000-0000-0000-0000-000000000001',
    true
),
(
    'Dropbox: Shared File Requires Action',
    'File sharing phishing template',
    'General',
    'standard',
    ARRAY['dropbox', 'file', 'sharing'],
    'Sarah Johnson shared "Q4_Financial_Report.xlsx" with you',
    'A colleague has shared an important file with you on Dropbox. View it now.',
    '<html><body><div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: #0061ff; color: white; padding: 15px;"><h2>Dropbox</h2></div><div style="padding: 20px; background: #fff;"><p>Hi {{firstName}},</p><p><strong>Sarah Johnson</strong> shared a file with you:</p><div style="background: #f7f9fa; padding: 20px; margin: 20px 0; border-radius: 4px; border: 1px solid #e0e0e0;"><p style="margin: 0;"><strong>📄 Q4_Financial_Report.xlsx</strong></p><p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Modified 2 hours ago • 2.4 MB</p></div><p>This file contains sensitive financial data for Q4 review. Please review and provide feedback by end of day.</p><p style="text-align: center; margin: 30px 0;"><a href="{{trackingUrl}}" style="background: #0061ff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">View File</a></p><p style="font-size: 12px; color: #666;">This link will expire in 7 days.</p><p>Dropbox Team</p></div></div></body></html>',
    'Sarah Johnson shared "Q4_Financial_Report.xlsx" with you on Dropbox. View file: {{trackingUrl}}',
    '00000000-0000-0000-0000-000000000001',
    true
),
(
    'Amazon: Unusual Account Activity',
    'E-commerce phishing template',
    'General',
    'urgent',
    ARRAY['amazon', 'account', 'security'],
    'Amazon: Verify your recent purchase',
    'We noticed unusual activity on your Amazon account. Please verify your recent order.',
    '<html><body><div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: #232f3e; color: white; padding: 15px;"><h2>Amazon.com</h2></div><div style="padding: 20px; background: #fff;"><p>Hello {{firstName}},</p><p>We noticed an unusual order placed on your Amazon account:</p><div style="background: #fff8e1; padding: 15px; margin: 20px 0; border-left: 4px solid #ff9800;"><p><strong>Order Details:</strong></p><ul><li>Product: MacBook Pro 16" M3 Max</li><li>Price: $3,499.00</li><li>Shipping: Express (1-day)</li><li>Delivery Address: 123 Unknown St, Different City</li></ul></div><p>If you did not make this purchase, your account may have been compromised.</p><p style="text-align: center; margin: 30px 0;"><a href="{{trackingUrl}}" style="background: #ff9900; color: #111; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Cancel Order & Secure Account</a></p><p>If you recognize this order, no action is needed.</p><p>Amazon Customer Service</p></div></div></body></html>',
    'Unusual order detected: MacBook Pro 16" ($3,499.00) shipping to unknown address. Cancel order: {{trackingUrl}}',
    '00000000-0000-0000-0000-000000000001',
    true
),
(
    'DocuSign: Document Awaiting Signature',
    'Document signing phishing template',
    'General',
    'standard',
    ARRAY['docusign', 'document', 'signature'],
    'Please Review and Sign: Employment_Agreement.pdf',
    'You have a document waiting for your signature. Please review and sign by the deadline.',
    '<html><body><div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background: #f9b233; color: #333; padding: 15px;"><h2>DocuSign</h2></div><div style="padding: 20px; background: #fff;"><p>Dear {{firstName}} {{lastName}},</p><p>You have been sent a document that requires your signature:</p><div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 4px;"><p><strong>Document:</strong> Employment_Agreement.pdf</p><p><strong>From:</strong> HR Department ({{company}})</p><p><strong>Due Date:</strong> December 10, 2024</p><p><strong>Status:</strong> <span style="color: #ff9800;">Awaiting Your Signature</span></p></div><p>Please review and sign this document at your earliest convenience. This is a legally binding agreement.</p><p style="text-align: center; margin: 30px 0;"><a href="{{trackingUrl}}" style="background: #f9b233; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Review & Sign Document</a></p><p style="font-size: 12px; color: #666;">This document will expire if not signed by the due date.</p><p>DocuSign, Inc.</p></div></div></body></html>',
    'Document awaiting signature: Employment_Agreement.pdf. Review and sign: {{trackingUrl}}',
    '00000000-0000-0000-0000-000000000001',
    true
);
