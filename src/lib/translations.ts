export type Language = 'en' | 'ru' | 'uz';

export interface Translations {
  // Navigation
  dashboard: string;
  campaigns: string;
  templates: string;
  recipients: string;
  reports: string;
  settings: string;
  team: string;
  training: string;
  
  // Common
  search: string;
  filter: string;
  export: string;
  import: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  view: string;
  create: string;
  upload: string;
  download: string;
  signOut: string;
  all: string;
  
  // Authentication
  loginTitle: string;
  loginSubtitle: string;
  loginEmailLabel: string;
  loginPasswordLabel: string;
  loginButton: string;
  loginButtonLoading: string;
  loginHelperText: string;
  loginSuccess: string;
  loginErrorFallback: string;
  loginProductTagline: string;

  // Dashboard
  dashboardTitle: string;
  dashboardSubtitle: string;
  newCampaign: string;
  totalRecipients: string;
  emailsSent: string;
  openRate: string;
  clickRate: string;
  recentCampaigns: string;
  performanceMetrics: string;
  emailOpens: string;
  linkClicks: string;
  dataSubmissions: string;
  riskScore: string;
  ofUsersFellForPhishing: string;
  quickActions: string;
  createCampaign: string;
  browseTemplates: string;
  manageRecipients: string;
  
  // Campaigns
  campaignsTitle: string;
  campaignsSubtitle: string;
  totalCampaigns: string;
  active: string;
  scheduled: string;
  completed: string;
  allCampaigns: string;
  searchCampaigns: string;
  running: string;
  paused: string;
  recipients: string;
  viewReport: string;
  editCampaign: string;
  duplicate: string;
  noCampaignsFound: string;
  tryAdjustingFilters: string;
  
  // Templates
  templatesTitle: string;
  templatesSubtitle: string;
  uploadHTML: string;
  createNew: string;
  searchTemplates: string;
  noTemplatesFound: string;
  previewUploadedTemplate: string;
  reviewHTMLTemplate: string;
  htmlPreview: string;
  useInEditor: string;
  
  // Recipients
  recipientsTitle: string;
  recipientsSubtitle: string;
  importCSV: string;
  addRecipient: string;
  group: string;
  users: string;
  risk: string;
  allRecipients: string;
  searchRecipients: string;
  selected: string;
  name: string;
  email: string;
  department: string;
  position: string;
  campaignsCount: string;
  viewProfile: string;
  importOptions: string;
  csvFile: string;
  googleSheets: string;
  activeDirectory: string;
  
  // Reports
  reportsTitle: string;
  reportsSubtitle: string;
  exportReport: string;
  totalSent: string;
  submissions: string;
  change: string;
  campaignComparison: string;
  clickThroughRate: string;
  engagementTimeline: string;
  day1: string;
  day23: string;
  afterDay3: string;
  timelineDescription: string;
  riskByDepartment: string;
  clicked: string;
  
  // Team
  teamTitle: string;
  teamSubtitle: string;
  inviteMember: string;
  searchTeam: string;
  role: string;
  status: string;
  actions: string;
  admin: string;
  manager: string;
  viewer: string;
  auditor: string;
  roleDescriptions: {
    admin: string;
    manager: string;
    viewer: string;
    auditor: string;
  };
  editUser: string;
  deleteUser: string;
  updateRole: string;
  selectRole: string;
  teamAdminOnly: string;
  
  // Settings
  settingsTitle: string;
  settingsSubtitle: string;
  generalSettings: string;
  companyName: string;
  companyDomain: string;
  timeZone: string;
  language: string;
  emailSettings: string;
  smtpServer: string;
  smtpPort: string;
  senderName: string;
  senderEmail: string;
  securitySettings: string;
  twoFactorAuth: string;
  twoFactorAuthDesc: string;
  sessionTimeout: string;
  sessionTimeoutDesc: string;
  ipWhitelist: string;
  ipWhitelistDesc: string;
  integrations: string;
  ldapSync: string;
  ldapSyncDesc: string;
  configureLDAP: string;
  apiAccess: string;
  apiAccessDesc: string;
  generateAPIKey: string;
  
  // Campaign Builder
  builderTitle: string;
  builderSubtitle: string;
  campaignDetails: string;
  campaignName: string;
  campaignNamePlaceholder: string;
  selectTemplate: string;
  selectGroup: string;
  scheduleSettings: string;
  sendImmediately: string;
  scheduleForLater: string;
  selectDateTime: string;
  trackingSettings: string;
  trackEmailOpens: string;
  trackLinkClicks: string;
  captureSubmittedData: string;
  launchCampaign: string;
  
  // Editor
  editorTitle: string;
  editorSubtitle: string;
  previewMode: string;
  desktop: string;
  tablet: string;
  mobile: string;
  emailSettings: string;
  subjectLine: string;
  fromName: string;
  fromEmail: string;
  landingPageURL: string;
  contentEditor: string;
  mergeTags: string;
  insertMergeTag: string;
  firstName: string;
  lastName: string;
  company: string;
  emailAddress: string;
  saveTemplate: string;
  
  // Status badges
  draft: string;
  
  // Categories
  hr: string;
  it: string;
  finance: string;
  security: string;
  general: string;
  sales: string;
  marketing: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    campaigns: 'Campaigns',
    templates: 'Templates',
    recipients: 'Recipients',
    reports: 'Reports',
    settings: 'Settings',
    team: 'Team & Roles',
    training: 'Training',
    
    // Common
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    create: 'Create',
    upload: 'Upload',
    download: 'Download',
    signOut: 'Sign out',
    all: 'All',
    
    // Authentication
    loginTitle: 'Sign in to continue',
    loginSubtitle: 'Access the PhishLab admin console with your secure credentials.',
    loginEmailLabel: 'Work email',
    loginPasswordLabel: 'Password',
    loginButton: 'Sign in',
    loginButtonLoading: 'Signing in…',
    loginHelperText: 'Default admin: admin@company.com / admin123. Replace with secure credentials in production.',
    loginSuccess: 'Welcome back!',
    loginErrorFallback: 'Unable to sign in. Check your credentials and try again.',
    loginProductTagline: 'Phishing Campaign Simulator',
    
    // Dashboard
    dashboardTitle: 'Dashboard',
    dashboardSubtitle: 'Overview of your phishing simulation campaigns',
    newCampaign: 'New Campaign',
    totalRecipients: 'Total Recipients',
    emailsSent: 'Emails Sent',
    openRate: 'Open Rate',
    clickRate: 'Click Rate',
    recentCampaigns: 'Recent Campaigns',
    performanceMetrics: 'Performance Metrics',
    emailOpens: 'Email Opens',
    linkClicks: 'Link Clicks',
    dataSubmissions: 'Data Submissions',
    riskScore: 'Risk Score',
    ofUsersFellForPhishing: 'of users fell for phishing',
    quickActions: 'Quick Actions',
    createCampaign: 'Create Campaign',
    browseTemplates: 'Browse Templates',
    manageRecipients: 'Manage Recipients',
    
    // Campaigns
    campaignsTitle: 'Campaigns',
    campaignsSubtitle: 'Manage and monitor your phishing simulations',
    totalCampaigns: 'Total Campaigns',
    active: 'Active',
    scheduled: 'Scheduled',
    completed: 'Completed',
    allCampaigns: 'All Campaigns',
    searchCampaigns: 'Search campaigns...',
    running: 'Running',
    paused: 'Paused',
    recipients: 'recipients',
    viewReport: 'View Report',
    editCampaign: 'Edit Campaign',
    duplicate: 'Duplicate',
    noCampaignsFound: 'No campaigns found',
    tryAdjustingFilters: 'Try adjusting your search or filters',
    
    // Templates
    templatesTitle: 'Template Library',
    templatesSubtitle: 'Choose from 20 pre-built phishing simulation templates',
    uploadHTML: 'Upload HTML',
    createNew: 'Create New',
    searchTemplates: 'Search templates...',
    noTemplatesFound: 'No templates found',
    previewUploadedTemplate: 'Preview Uploaded Template',
    reviewHTMLTemplate: 'Review your HTML template before using it in the editor',
    htmlPreview: 'HTML Preview',
    useInEditor: 'Use in Editor',
    
    // Recipients
    recipientsTitle: 'Recipients',
    recipientsSubtitle: 'Manage users and distribution groups',
    importCSV: 'Import CSV',
    addRecipient: 'Add Recipient',
    group: 'Group',
    users: 'users',
    risk: 'risk',
    allRecipients: 'All Recipients',
    searchRecipients: 'Search recipients...',
    selected: 'selected',
    name: 'Name',
    email: 'Email',
    department: 'Department',
    position: 'Position',
    campaignsCount: 'Campaigns',
    viewProfile: 'View Profile',
    importOptions: 'Import Options',
    csvFile: 'CSV File',
    googleSheets: 'Google Sheets',
    activeDirectory: 'Active Directory',
    
    // Reports
    reportsTitle: 'Campaign Reports',
    reportsSubtitle: 'Detailed analytics and performance metrics',
    exportReport: 'Export Report',
    totalSent: 'Total Sent',
    submissions: 'Submissions',
    change: 'change',
    campaignComparison: 'Campaign Comparison',
    clickThroughRate: 'Click-Through Rate',
    engagementTimeline: 'Engagement Timeline',
    day1: 'Day 1',
    day23: 'Day 2-3',
    afterDay3: 'After Day 3',
    timelineDescription: 'Most users interact with phishing emails within the first 24 hours. This data helps optimize sending schedules.',
    riskByDepartment: 'Risk by Department',
    clicked: 'clicked',
    
    // Team
    teamTitle: 'Team & Roles',
    teamSubtitle: 'Manage team members and permissions',
    inviteMember: 'Invite Member',
    searchTeam: 'Search team...',
    role: 'Role',
    status: 'Status',
    actions: 'Actions',
    admin: 'Admin',
    manager: 'Manager',
    viewer: 'Viewer',
    auditor: 'Auditor',
    roleDescriptions: {
      admin: 'Full system access',
      manager: 'Manage campaigns',
      viewer: 'View-only access',
      auditor: 'Audit and compliance',
    },
    editUser: 'Edit User',
    deleteUser: 'Delete User',
    updateRole: 'Update Role',
    selectRole: 'Select Role',
    teamAdminOnly: 'Only administrators can manage team members and roles.',
    
    // Settings
    settingsTitle: 'Settings',
    settingsSubtitle: 'Configure your PhishLab environment',
    generalSettings: 'General Settings',
    companyName: 'Company Name',
    companyDomain: 'Company Domain',
    timeZone: 'Time Zone',
    language: 'Language',
    emailSettings: 'Email Settings',
    smtpServer: 'SMTP Server',
    smtpPort: 'SMTP Port',
    senderName: 'Sender Name',
    senderEmail: 'Sender Email',
    securitySettings: 'Security Settings',
    twoFactorAuth: 'Two-Factor Authentication',
    twoFactorAuthDesc: 'Require 2FA for all users',
    sessionTimeout: 'Session Timeout',
    sessionTimeoutDesc: 'Auto logout after 30 minutes of inactivity',
    ipWhitelist: 'IP Whitelist',
    ipWhitelistDesc: 'Restrict access to specific IP addresses',
    integrations: 'Integrations',
    ldapSync: 'LDAP/Active Directory Sync',
    ldapSyncDesc: 'Automatically sync users from your directory',
    configureLDAP: 'Configure LDAP',
    apiAccess: 'API Access',
    apiAccessDesc: 'Enable REST API for external integrations',
    generateAPIKey: 'Generate API Key',
    
    // Campaign Builder
    builderTitle: 'Campaign Builder',
    builderSubtitle: 'Create a new phishing simulation campaign',
    campaignDetails: 'Campaign Details',
    campaignName: 'Campaign Name',
    campaignNamePlaceholder: 'e.g., Q1 2024 Security Training',
    selectTemplate: 'Select Template',
    selectGroup: 'Select Group',
    scheduleSettings: 'Schedule Settings',
    sendImmediately: 'Send Immediately',
    scheduleForLater: 'Schedule for Later',
    selectDateTime: 'Select Date & Time',
    trackingSettings: 'Tracking Settings',
    trackEmailOpens: 'Track Email Opens',
    trackLinkClicks: 'Track Link Clicks',
    captureSubmittedData: 'Capture Submitted Data',
    launchCampaign: 'Launch Campaign',
    
    // Editor
    editorTitle: 'Email & Landing Page Editor',
    editorSubtitle: 'Design your phishing simulation content',
    previewMode: 'Preview Mode',
    desktop: 'Desktop',
    tablet: 'Tablet',
    mobile: 'Mobile',
    emailSettings: 'Email Settings',
    subjectLine: 'Subject Line',
    fromName: 'From Name',
    fromEmail: 'From Email',
    landingPageURL: 'Landing Page URL',
    contentEditor: 'Content Editor',
    mergeTags: 'Merge Tags',
    insertMergeTag: 'Insert Merge Tag',
    firstName: 'First Name',
    lastName: 'Last Name',
    company: 'Company',
    emailAddress: 'Email Address',
    saveTemplate: 'Save Template',
    
    // Status badges
    draft: 'Draft',
    
    // Categories
    hr: 'HR',
    it: 'IT',
    finance: 'Finance',
    security: 'Security',
    general: 'General',
    sales: 'Sales',
    marketing: 'Marketing',
  },
  
  ru: {
    // Navigation
    dashboard: 'Панель управления',
    campaigns: 'Кампании',
    templates: 'Шаблоны',
    recipients: 'Получатели',
    reports: 'Отчёты',
    settings: 'Настройки',
    team: 'Команда и роли',
    training: 'Обучение',
    
    // Common
    search: 'Поиск',
    filter: 'Фильтр',
    export: 'Экспорт',
    import: 'Импорт',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    view: 'Просмотр',
    create: 'Создать',
    upload: 'Загрузить',
    download: 'Скачать',
    signOut: 'Выйти',
    all: 'Все',
    
    // Authentication
    loginTitle: 'Войдите в систему',
    loginSubtitle: 'Используйте корпоративные учётные данные, чтобы открыть панель PhishLab.',
    loginEmailLabel: 'Рабочий email',
    loginPasswordLabel: 'Пароль',
    loginButton: 'Войти',
    loginButtonLoading: 'Входим…',
    loginHelperText: 'Администратор по умолчанию: admin@company.com / admin123. В продакшене обязательно смените пароль.',
    loginSuccess: 'Добро пожаловать!',
    loginErrorFallback: 'Не удалось войти. Проверьте данные и попробуйте снова.',
    loginProductTagline: 'Симулятор фишинговых кампаний',
    
    // Dashboard
    dashboardTitle: 'Панель управления',
    dashboardSubtitle: 'Обзор ваших кампаний фишинг-симуляции',
    newCampaign: 'Новая кампания',
    totalRecipients: 'Всего получателей',
    emailsSent: 'Отправлено писем',
    openRate: 'Процент открытий',
    clickRate: 'Процент кликов',
    recentCampaigns: 'Последние кампании',
    performanceMetrics: 'Метрики производительности',
    emailOpens: 'Открытия писем',
    linkClicks: 'Клики по ссылкам',
    dataSubmissions: 'Отправка данных',
    riskScore: 'Оценка риска',
    ofUsersFellForPhishing: 'пользователей попались на фишинг',
    quickActions: 'Быстрые действия',
    createCampaign: 'Создать кампанию',
    browseTemplates: 'Обзор шаблонов',
    manageRecipients: 'Управление получателями',
    
    // Campaigns
    campaignsTitle: 'Кампании',
    campaignsSubtitle: 'Управление и мониторинг фишинг-симуляций',
    totalCampaigns: 'Всего кампаний',
    active: 'Активные',
    scheduled: 'Запланированные',
    completed: 'Завершённые',
    allCampaigns: 'Все кампании',
    searchCampaigns: 'Поиск кампаний...',
    running: 'Запущена',
    paused: 'Приостановлена',
    recipients: 'получателей',
    viewReport: 'Просмотр отчёта',
    editCampaign: 'Редактировать кампанию',
    duplicate: 'Дублировать',
    noCampaignsFound: 'Кампании не найдены',
    tryAdjustingFilters: 'Попробуйте изменить поиск или фильтры',
    
    // Templates
    templatesTitle: 'Библиотека шаблонов',
    templatesSubtitle: 'Выберите из 20 готовых шаблонов фишинг-симуляции',
    uploadHTML: 'Загрузить HTML',
    createNew: 'Создать новый',
    searchTemplates: 'Поиск шаблонов...',
    noTemplatesFound: 'Шаблоны не найдены',
    previewUploadedTemplate: 'Предпросмотр загруженного шаблона',
    reviewHTMLTemplate: 'Проверьте ваш HTML шаблон перед использованием в редакторе',
    htmlPreview: 'Предпросмотр HTML',
    useInEditor: 'Использовать в редакторе',
    
    // Recipients
    recipientsTitle: 'Получатели',
    recipientsSubtitle: 'Управление пользователями и группами рассылки',
    importCSV: 'Импорт CSV',
    addRecipient: 'Добавить получателя',
    group: 'Группа',
    users: 'пользователей',
    risk: 'риск',
    allRecipients: 'Все получатели',
    searchRecipients: 'Поиск получателей...',
    selected: 'выбрано',
    name: 'Имя',
    email: 'Email',
    department: 'Отдел',
    position: 'Должность',
    campaignsCount: 'Кампании',
    viewProfile: 'Просмотр профиля',
    importOptions: 'Варианты импорта',
    csvFile: 'CSV файл',
    googleSheets: 'Google Таблицы',
    activeDirectory: 'Active Directory',
    
    // Reports
    reportsTitle: 'Отчёты по кампаниям',
    reportsSubtitle: 'Детальная аналитика и метрики производительности',
    exportReport: 'Экспорт отчёта',
    totalSent: 'Всего отправлено',
    submissions: 'Отправки',
    change: 'изменение',
    campaignComparison: 'Сравнение кампаний',
    clickThroughRate: 'Коэффициент кликабельности',
    engagementTimeline: 'График вовлечённости',
    day1: 'День 1',
    day23: 'День 2-3',
    afterDay3: 'После дня 3',
    timelineDescription: 'Большинство пользователей взаимодействуют с фишинговыми письмами в первые 24 часа. Эти данные помогают оптимизировать время отправки.',
    riskByDepartment: 'Риск по отделам',
    clicked: 'кликнуло',
    
    // Team
    teamTitle: 'Команда и роли',
    teamSubtitle: 'Управление членами команды и правами доступа',
    inviteMember: 'Пригласить участника',
    searchTeam: 'Поиск в команде...',
    role: 'Роль',
    status: 'Статус',
    actions: 'Действия',
    admin: 'Администратор',
    manager: 'Менеджер',
    viewer: 'Наблюдатель',
    auditor: 'Аудитор',
    roleDescriptions: {
      admin: 'Полный доступ к системе',
      manager: 'Управление кампаниями',
      viewer: 'Только просмотр',
      auditor: 'Аудит и соответствие',
    },
    editUser: 'Редактировать пользователя',
    deleteUser: 'Удалить пользователя',
    updateRole: 'Обновить роль',
    selectRole: 'Выбрать роль',
    teamAdminOnly: 'Управлять участниками и ролями могут только администраторы.',
    
    // Settings
    settingsTitle: 'Настройки',
    settingsSubtitle: 'Настройка вашей среды PhishLab',
    generalSettings: 'Общие настройки',
    companyName: 'Название компании',
    companyDomain: 'Домен компании',
    timeZone: 'Часовой пояс',
    language: 'Язык',
    emailSettings: 'Настройки Email',
    smtpServer: 'SMTP сервер',
    smtpPort: 'SMTP порт',
    senderName: 'Имя отправителя',
    senderEmail: 'Email отправителя',
    securitySettings: 'Настройки безопасности',
    twoFactorAuth: 'Двухфакторная аутентификация',
    twoFactorAuthDesc: 'Требовать 2FA для всех пользователей',
    sessionTimeout: 'Тайм-аут сеанса',
    sessionTimeoutDesc: 'Автовыход через 30 минут неактивности',
    ipWhitelist: 'Белый список IP',
    ipWhitelistDesc: 'Ограничить доступ для определённых IP-адресов',
    integrations: 'Интеграции',
    ldapSync: 'Синхронизация LDAP/Active Directory',
    ldapSyncDesc: 'Автоматическая синхронизация пользователей из вашего каталога',
    configureLDAP: 'Настроить LDAP',
    apiAccess: 'Доступ к API',
    apiAccessDesc: 'Включить REST API для внешних интеграций',
    generateAPIKey: 'Сгенерировать API ключ',
    
    // Campaign Builder
    builderTitle: 'Конструктор кампаний',
    builderSubtitle: 'Создание новой кампании фишинг-симуляции',
    campaignDetails: 'Детали кампании',
    campaignName: 'Название кампании',
    campaignNamePlaceholder: 'например, Обучение безопасности Q1 2024',
    selectTemplate: 'Выбрать шаблон',
    selectGroup: 'Выбрать группу',
    scheduleSettings: 'Настройки расписания',
    sendImmediately: 'Отправить немедленно',
    scheduleForLater: 'Запланировать на потом',
    selectDateTime: 'Выбрать дату и время',
    trackingSettings: 'Настройки отслеживания',
    trackEmailOpens: 'Отслеживать открытия писем',
    trackLinkClicks: 'Отслеживать клики по ссылкам',
    captureSubmittedData: 'Захватывать отправленные данные',
    launchCampaign: 'Запустить кампанию',
    
    // Editor
    editorTitle: 'Редактор писем и посадочных страниц',
    editorSubtitle: 'Создание контента для фишинг-симуляции',
    previewMode: 'Режим предпросмотра',
    desktop: 'Десктоп',
    tablet: 'Планшет',
    mobile: 'Мобильный',
    emailSettings: 'Настройки Email',
    subjectLine: 'Тема письма',
    fromName: 'От кого (имя)',
    fromEmail: 'От кого (email)',
    landingPageURL: 'URL посадочной страницы',
    contentEditor: 'Редактор контента',
    mergeTags: 'Теги слияния',
    insertMergeTag: 'Вставить тег слияния',
    firstName: 'Имя',
    lastName: 'Фамилия',
    company: 'Компания',
    emailAddress: 'Email адрес',
    saveTemplate: 'Сохранить шаблон',
    
    // Status badges
    draft: 'Черновик',
    
    // Categories
    hr: 'HR',
    it: 'IT',
    finance: 'Финансы',
    security: 'Безопасность',
    general: 'Общее',
    sales: 'Продажи',
    marketing: 'Маркетинг',
  },
  
  uz: {
    // Navigation
    dashboard: 'Boshqaruv paneli',
    campaigns: 'Kampaniyalar',
    templates: 'Shablonlar',
    recipients: 'Qabul qiluvchilar',
    reports: 'Hisobotlar',
    settings: 'Sozlamalar',
    team: 'Jamoa va rollar',
    training: "O'qitish",
    
    // Common
    search: 'Qidirish',
    filter: 'Filtr',
    export: 'Eksport',
    import: 'Import',
    save: 'Saqlash',
    cancel: 'Bekor qilish',
    delete: "O'chirish",
    edit: 'Tahrirlash',
    view: "Ko'rish",
    create: 'Yaratish',
    upload: 'Yuklash',
    download: 'Yuklab olish',
    signOut: 'Chiqish',
    all: 'Hammasi',
    
    // Authentication
    loginTitle: 'Tizimga kirish',
    loginSubtitle: 'PhishLab boshqaruv paneliga kirish uchun ishchi maʼlumotlaringizni kiriting.',
    loginEmailLabel: 'Ishchi email',
    loginPasswordLabel: 'Parol',
    loginButton: 'Kirish',
    loginButtonLoading: 'Kirilmoqda…',
    loginHelperText: 'Standart admin: admin@company.com / admin123. Ishga tushirganda parolni albatta almashtiring.',
    loginSuccess: 'Xush kelibsiz!',
    loginErrorFallback: 'Kirish muvaffaqiyatsiz. Maʼlumotlarni tekshirib qayta urinib ko‘ring.',
    loginProductTagline: 'Fishing kampaniyalar simulyatori',
    
    // Dashboard
    dashboardTitle: 'Boshqaruv paneli',
    dashboardSubtitle: 'Fishing simulyatsiya kampaniyalaringiz haqida umumiy ma\'lumot',
    newCampaign: 'Yangi kampaniya',
    totalRecipients: 'Jami qabul qiluvchilar',
    emailsSent: 'Yuborilgan xatlar',
    openRate: 'Ochish foizi',
    clickRate: 'Bosish foizi',
    recentCampaigns: "So'nggi kampaniyalar",
    performanceMetrics: 'Samaradorlik ko\'rsatkichlari',
    emailOpens: 'Xatlarni ochish',
    linkClicks: 'Havolalarga bosish',
    dataSubmissions: "Ma'lumotlarni yuborish",
    riskScore: 'Xavf darajasi',
    ofUsersFellForPhishing: 'foydalanuvchilar fishingga tushib qoldi',
    quickActions: 'Tez harakatlar',
    createCampaign: 'Kampaniya yaratish',
    browseTemplates: "Shablonlarni ko'rish",
    manageRecipients: 'Qabul qiluvchilarni boshqarish',
    
    // Campaigns
    campaignsTitle: 'Kampaniyalar',
    campaignsSubtitle: 'Fishing simulyatsiyalarini boshqarish va kuzatish',
    totalCampaigns: 'Jami kampaniyalar',
    active: 'Faol',
    scheduled: 'Rejalashtirilgan',
    completed: 'Yakunlangan',
    allCampaigns: 'Barcha kampaniyalar',
    searchCampaigns: 'Kampaniyalarni qidirish...',
    running: 'Ishlamoqda',
    paused: "To'xtatilgan",
    recipients: 'qabul qiluvchilar',
    viewReport: "Hisobotni ko'rish",
    editCampaign: 'Kampaniyani tahrirlash',
    duplicate: 'Nusxa olish',
    noCampaignsFound: 'Kampaniyalar topilmadi',
    tryAdjustingFilters: 'Qidiruvni yoki filtrlarni o\'zgartiring',
    
    // Templates
    templatesTitle: 'Shablonlar kutubxonasi',
    templatesSubtitle: '20 ta tayyor fishing simulyatsiya shablonidan tanlang',
    uploadHTML: 'HTML yuklash',
    createNew: 'Yangi yaratish',
    searchTemplates: 'Shablonlarni qidirish...',
    noTemplatesFound: 'Shablonlar topilmadi',
    previewUploadedTemplate: "Yuklangan shablonni ko'rish",
    reviewHTMLTemplate: "Muharrirda ishlatishdan oldin HTML shablonni tekshiring",
    htmlPreview: "HTML ko'rinish",
    useInEditor: 'Muharrirda ishlatish',
    
    // Recipients
    recipientsTitle: 'Qabul qiluvchilar',
    recipientsSubtitle: "Foydalanuvchilar va tarqatish guruhlarini boshqarish",
    importCSV: 'CSV import qilish',
    addRecipient: "Qabul qiluvchi qo'shish",
    group: 'Guruh',
    users: 'foydalanuvchilar',
    risk: 'xavf',
    allRecipients: 'Barcha qabul qiluvchilar',
    searchRecipients: 'Qabul qiluvchilarni qidirish...',
    selected: 'tanlangan',
    name: 'Ism',
    email: 'Email',
    department: "Bo'lim",
    position: 'Lavozim',
    campaignsCount: 'Kampaniyalar',
    viewProfile: "Profilni ko'rish",
    importOptions: 'Import variantlari',
    csvFile: 'CSV fayl',
    googleSheets: 'Google Jadvallar',
    activeDirectory: 'Active Directory',
    
    // Reports
    reportsTitle: 'Kampaniya hisobotlari',
    reportsSubtitle: "Batafsil analitika va samaradorlik ko'rsatkichlari",
    exportReport: 'Hisobotni eksport qilish',
    totalSent: 'Jami yuborilgan',
    submissions: 'Yuborilganlar',
    change: "o'zgarish",
    campaignComparison: 'Kampaniyalarni solishtirish',
    clickThroughRate: 'Bosish koeffitsienti',
    engagementTimeline: "Faollik grafigi",
    day1: '1-kun',
    day23: '2-3 kun',
    afterDay3: '3-kundan keyin',
    timelineDescription: "Ko'pchilik foydalanuvchilar fishing xatlari bilan birinchi 24 soat ichida o'zaro aloqada bo'lishadi. Bu ma'lumotlar yuborish vaqtini optimallashtirish uchun yordam beradi.",
    riskByDepartment: "Bo'limlar bo'yicha xavf",
    clicked: 'bosdi',
    
    // Team
    teamTitle: 'Jamoa va rollar',
    teamSubtitle: "Jamoa a'zolari va ruxsatlarni boshqarish",
    inviteMember: "A'zo taklif qilish",
    searchTeam: 'Jamoadan qidirish...',
    role: 'Rol',
    status: 'Holat',
    actions: 'Harakatlar',
    admin: 'Administrator',
    manager: 'Menejer',
    viewer: 'Kuzatuvchi',
    auditor: 'Auditor',
    roleDescriptions: {
      admin: "Tizimga to'liq kirish",
      manager: 'Kampaniyalarni boshqarish',
      viewer: "Faqat ko'rish",
      auditor: 'Audit va muvofiqlik',
    },
    editUser: 'Foydalanuvchini tahrirlash',
    deleteUser: "Foydalanuvchini o'chirish",
    updateRole: 'Rolni yangilash',
    selectRole: 'Rolni tanlash',
    teamAdminOnly: "Jamoa a'zolari va rollarni faqat administratorlar boshqarishi mumkin.",
    
    // Settings
    settingsTitle: 'Sozlamalar',
    settingsSubtitle: 'PhishLab muhitini sozlash',
    generalSettings: 'Umumiy sozlamalar',
    companyName: 'Kompaniya nomi',
    companyDomain: 'Kompaniya domeni',
    timeZone: 'Vaqt mintaqasi',
    language: 'Til',
    emailSettings: 'Email sozlamalari',
    smtpServer: 'SMTP server',
    smtpPort: 'SMTP port',
    senderName: 'Yuboruvchi nomi',
    senderEmail: 'Yuboruvchi email',
    securitySettings: 'Xavfsizlik sozlamalari',
    twoFactorAuth: 'Ikki faktorli autentifikatsiya',
    twoFactorAuthDesc: "Barcha foydalanuvchilar uchun 2FA talab qilish",
    sessionTimeout: 'Sessiya vaqti tugashi',
    sessionTimeoutDesc: '30 daqiqa harakatsizlikdan keyin avtomatik chiqish',
    ipWhitelist: 'IP oq ro\'yxat',
    ipWhitelistDesc: "Muayyan IP manzillarga kirishni cheklash",
    integrations: 'Integratsiyalar',
    ldapSync: 'LDAP/Active Directory sinxronizatsiyasi',
    ldapSyncDesc: "Katalogingizdan foydalanuvchilarni avtomatik sinxronlash",
    configureLDAP: 'LDAP sozlash',
    apiAccess: 'API kirish',
    apiAccessDesc: "Tashqi integratsiyalar uchun REST API ni yoqish",
    generateAPIKey: 'API kalitini yaratish',
    
    // Campaign Builder
    builderTitle: 'Kampaniya yaratuvchi',
    builderSubtitle: 'Yangi fishing simulyatsiya kampaniyasini yaratish',
    campaignDetails: 'Kampaniya tafsilotlari',
    campaignName: 'Kampaniya nomi',
    campaignNamePlaceholder: "masalan, 2024 Q1 Xavfsizlik o'qitish",
    selectTemplate: 'Shablonni tanlash',
    selectGroup: 'Guruhni tanlash',
    scheduleSettings: 'Jadval sozlamalari',
    sendImmediately: 'Darhol yuborish',
    scheduleForLater: 'Keyinroq rejalashtirish',
    selectDateTime: 'Sana va vaqtni tanlang',
    trackingSettings: 'Kuzatuv sozlamalari',
    trackEmailOpens: 'Email ochilishlarini kuzatish',
    taxLinkClicks: 'Havola bosishlarini kuzatish',
    captureSubmittedData: "Yuborilgan ma'lumotlarni ushlash",
    launchCampaign: 'Kampaniyani ishga tushirish',
    
    // Editor
    editorTitle: "Email va Landing sahifa muharriri",
    editorSubtitle: 'Fishing simulyatsiya kontentini yaratish',
    previewMode: "Oldindan ko'rish rejimi",
    desktop: 'Kompyuter',
    tablet: 'Planshet',
    mobile: 'Mobil',
    emailSettings: 'Email sozlamalari',
    subjectLine: 'Mavzu qatori',
    fromName: 'Kimdan (ism)',
    fromEmail: 'Kimdan (email)',
    landingPageURL: 'Landing sahifa URL',
    contentEditor: 'Kontent muharriri',
    mergeTags: 'Birlashtirish teglari',
    insertMergeTag: "Birlashtirish tegini qo'shish",
    firstName: 'Ism',
    lastName: 'Familiya',
    company: 'Kompaniya',
    emailAddress: 'Email manzil',
    saveTemplate: 'Shablonni saqlash',
    
    // Status badges
    draft: 'Qoralama',
    
    // Categories
    hr: 'HR',
    it: 'IT',
    finance: 'Moliya',
    security: 'Xavfsizlik',
    general: 'Umumiy',
    sales: 'Sotuvlar',
    marketing: 'Marketing',
  },
};
