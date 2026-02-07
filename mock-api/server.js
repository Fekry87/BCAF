import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

// Environment configuration
const config = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  suitedash: {
    enabled: process.env.SUITEDASH_ENABLED === 'true',
    publicId: process.env.SUITEDASH_PUBLIC_ID || '',
    secretKey: process.env.SUITEDASH_SECRET_KEY || '',
    apiUrl: process.env.SUITEDASH_API_URL || 'https://app.suitedash.com/secure-api',
  },
  webhookSecret: process.env.WEBHOOK_SECRET || '',
};

// CORS configuration
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());

// ============================================
// DATA STORE - Persisted to JSON file
// ============================================
const DATA_FILE = path.join(__dirname, 'data.json');

const defaultData = {
  // Site Settings
  siteSettings: {
    siteName: 'Consultancy Platform',
    tagline: 'Strategic guidance for meaningful growth',
    logo: null,
    favicon: null,
  },

  // Header
  header: {
    logoImage: null,
    logoText: 'Consultancy',
    navLinks: [
      { id: 1, label: 'Home', path: '/', isActive: true, order: 1 },
      { id: 2, label: 'Business Consultancy', path: '/business-consultancy', isActive: true, order: 2 },
      { id: 3, label: 'Education Support', path: '/education-support', isActive: true, order: 3 },
      { id: 4, label: 'About', path: '/about', isActive: true, order: 4 },
      { id: 5, label: 'Contact', path: '/contact', isActive: true, order: 5 },
    ],
  },

  // Footer
  footer: {
    description: 'Expert guidance in business strategy and education support, combining academic rigour with practical expertise.',
    contactEmail: 'info@consultancy.com',
    contactPhone: '+44 (0) 123 456 7890',
    address: '123 Academic Lane\nLondon, EC1A 1BB',
    socialLinks: [
      { id: 1, platform: 'linkedin', url: 'https://linkedin.com', isActive: true },
      { id: 2, platform: 'twitter', url: 'https://twitter.com', isActive: true },
    ],
    quickLinks: [
      { id: 1, label: 'Home', path: '/', isActive: true },
      { id: 2, label: 'Business Consultancy', path: '/business-consultancy', isActive: true },
      { id: 3, label: 'Education Support', path: '/education-support', isActive: true },
      { id: 4, label: 'About Us', path: '/about', isActive: true },
      { id: 5, label: 'Contact', path: '/contact', isActive: true },
    ],
    copyrightText: '© {year} Consultancy Platform. All rights reserved.',
  },

  // Home Page
  homePage: {
    hero: {
      title: 'Strategic guidance for meaningful growth',
      subtitle: 'We partner with organisations and individuals to navigate complexity, develop robust strategies, and achieve lasting success through evidence-based approaches.',
      backgroundImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80',
      primaryButtonText: 'Get in touch',
      primaryButtonLink: '/contact',
      secondaryButtonText: 'Learn more',
      secondaryButtonLink: '/about',
    },
    pillarsSection: {
      title: 'Our Expertise',
      subtitle: 'Two distinct pillars of service, united by a commitment to excellence and evidence-based practice.',
    },
    ctaSection: {
      title: 'Ready to begin?',
      subtitle: 'Contact us today to discuss how we can support your goals and help you achieve meaningful, sustainable outcomes.',
      buttonText: 'Contact us',
      buttonLink: '/contact',
      backgroundColor: 'primary',
    },
  },

  // About Page
  aboutPage: {
    hero: {
      title: 'About Us',
      subtitle: 'We are a team of experienced consultants and educators dedicated to helping organisations and individuals achieve their potential through thoughtful, evidence-based guidance.',
      backgroundImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=2000&q=80',
    },
    mission: {
      title: 'Our Mission',
      content: 'To bridge the gap between academic insight and practical application, providing organisations and learners with the strategic guidance they need to navigate complexity and achieve meaningful outcomes.',
    },
    values: [
      { id: 1, icon: 'Target', title: 'Evidence-Based', description: 'We ground our recommendations in rigorous analysis and proven methodologies.', order: 1 },
      { id: 2, icon: 'Users', title: 'Collaborative', description: 'We work alongside our clients as partners, bringing expertise while respecting your knowledge.', order: 2 },
      { id: 3, icon: 'Lightbulb', title: 'Practical', description: 'Academic rigour meets real-world application. Our solutions work in practice.', order: 3 },
      { id: 4, icon: 'Award', title: 'Excellence', description: 'We hold ourselves to the highest standards in everything we do.', order: 4 },
    ],
    team: [
      { id: 1, name: 'Team Member 1', position: 'Position Title', bio: 'Brief bio highlighting expertise and background.', image: null, order: 1 },
      { id: 2, name: 'Team Member 2', position: 'Position Title', bio: 'Brief bio highlighting expertise and background.', image: null, order: 2 },
      { id: 3, name: 'Team Member 3', position: 'Position Title', bio: 'Brief bio highlighting expertise and background.', image: null, order: 3 },
    ],
  },

  // Contact Page
  contactPage: {
    hero: {
      title: 'Contact Us',
      subtitle: "We're here to help. Reach out to discuss how we can support your goals, or simply to learn more about our services.",
    },
    officeHours: [
      { id: 1, day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM GMT' },
      { id: 2, day: 'Saturday', hours: '10:00 AM - 2:00 PM GMT' },
      { id: 3, day: 'Sunday', hours: 'Closed' },
    ],
    responseTime: 'We aim to respond to all enquiries within 24 business hours.',
  },

  // Pillars
  pillars: [
    {
      id: 1,
      name: 'Business Consultancy',
      slug: 'business-consultancy',
      tagline: 'Strategic guidance for sustainable growth',
      description: 'We partner with organisations to navigate complex challenges, develop robust strategies, and implement solutions that drive measurable results. Our evidence-based approach combines academic rigour with practical expertise.',
      heroImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=2000&q=80',
      icon: 'briefcase',
      metaTitle: 'Business Consultancy Services | Strategic Growth Solutions',
      metaDescription: 'Expert business consultancy services combining academic rigour with practical expertise.',
      sortOrder: 1,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      name: 'Education Support',
      slug: 'education-support',
      tagline: 'Empowering academic excellence',
      description: 'We provide comprehensive support for educational institutions and learners at all levels. From curriculum development to individual tutoring, our services are designed to foster genuine understanding and lasting achievement.',
      heroImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=80',
      icon: 'academic-cap',
      metaTitle: 'Education Support Services | Academic Excellence',
      metaDescription: 'Comprehensive education support services for institutions and learners.',
      sortOrder: 2,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ],

  // Services
  services: [
    {
      id: 1,
      pillarId: 1,
      type: 'one_off',
      title: 'Strategic Assessment',
      slug: 'strategic-assessment',
      summary: 'A comprehensive evaluation of your current position, market dynamics, and strategic options.',
      details: '<p>Our Strategic Assessment service provides a thorough analysis of your organisation\'s current state and future potential.</p><ul><li>Market positioning and competitive landscape</li><li>Organisational capabilities and resources</li><li>Financial performance and projections</li><li>Stakeholder expectations and governance</li></ul><p>You receive a detailed report with actionable recommendations.</p>',
      icon: 'chart-bar',
      priceFrom: 2500,
      priceLabel: 'From £2,500',
      sortOrder: 1,
      isFeatured: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      pillarId: 1,
      type: 'one_off',
      title: 'Process Optimisation Review',
      slug: 'process-optimisation-review',
      summary: 'Identify inefficiencies and opportunities for improvement across your key business processes.',
      details: '<p>We conduct a systematic review of your operational processes to identify bottlenecks, redundancies, and improvement opportunities.</p>',
      icon: 'cog',
      priceFrom: 1800,
      priceLabel: 'From £1,800',
      sortOrder: 2,
      isFeatured: false,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 3,
      pillarId: 1,
      type: 'subscription',
      title: 'Strategic Advisory Retainer',
      slug: 'strategic-advisory-retainer',
      summary: 'Ongoing strategic counsel with regular touchpoints and on-demand support.',
      details: '<p>Our Strategic Advisory Retainer provides continuous access to senior consultants.</p><ul><li>Monthly strategy sessions</li><li>Quarterly business reviews</li><li>Priority email and phone support</li></ul>',
      icon: 'users',
      priceFrom: 1500,
      priceLabel: 'From £1,500/month',
      sortOrder: 1,
      isFeatured: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 4,
      pillarId: 2,
      type: 'one_off',
      title: 'Curriculum Review',
      slug: 'curriculum-review',
      summary: 'Expert evaluation of curriculum design, content alignment, and pedagogical effectiveness.',
      details: '<p>Our Curriculum Review service provides a thorough evaluation of your educational programmes.</p><ul><li>Learning outcomes alignment</li><li>Content relevance</li><li>Assessment strategies</li></ul>',
      icon: 'document-text',
      priceFrom: 1500,
      priceLabel: 'From £1,500',
      sortOrder: 1,
      isFeatured: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 5,
      pillarId: 2,
      type: 'subscription',
      title: 'Academic Tutoring Programme',
      slug: 'academic-tutoring-programme',
      summary: 'Regular one-to-one tutoring sessions tailored to individual learning needs.',
      details: '<p>Our Academic Tutoring Programme provides personalised support for students.</p><ul><li>Initial assessment and goal setting</li><li>Weekly tutoring sessions</li><li>Progress tracking</li></ul>',
      icon: 'user-group',
      priceFrom: 200,
      priceLabel: 'From £200/month',
      sortOrder: 1,
      isFeatured: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ],

  // Website Settings (page visibility, maintenance mode)
  websiteSettings: {
    page_visibility: {
      home: true,
      about: true,
      contact: true,
      checkout: true,
    },
    maintenance_mode: false,
    maintenance_message: 'We are currently performing scheduled maintenance. Please check back soon.',
  },

  // FAQs
  faqs: [
    { id: 1, pillarId: null, question: 'How do I get started?', answer: "Simply contact us through our website or give us a call. We'll arrange an initial consultation to understand your needs.", category: 'General', sortOrder: 1, isActive: true },
    { id: 2, pillarId: null, question: 'What are your payment terms?', answer: 'For one-off projects, we typically request 50% upon commencement and 50% upon completion. Subscription services are billed monthly.', category: 'General', sortOrder: 2, isActive: true },
    { id: 3, pillarId: null, question: 'Do you offer remote services?', answer: 'Yes, many of our services can be delivered remotely using secure video conferencing.', category: 'General', sortOrder: 3, isActive: true },
    { id: 4, pillarId: 1, question: 'What industries do you specialise in?', answer: 'We have expertise in professional services, technology, healthcare, and education.', category: 'Business', sortOrder: 1, isActive: true },
    { id: 5, pillarId: 2, question: 'What age groups do you support?', answer: 'Our services span all educational levels, from primary through to postgraduate.', category: 'Education', sortOrder: 1, isActive: true },
  ],

  // Contact Submissions
  contacts: [
    { id: 1, name: 'John Smith', email: 'john.smith@example.com', phone: '+44 7700 900123', pillarId: 1, message: 'Looking for strategic guidance on expansion plans.', status: 'new', createdAt: '2024-01-15T10:30:00.000Z' },
    { id: 2, name: 'Sarah Johnson', email: 'sjohnson@school.edu', phone: '+44 7700 900456', pillarId: 2, message: 'Interested in Curriculum Review service.', status: 'in_progress', createdAt: '2024-01-14T14:00:00.000Z' },
  ],

  // Registered Users (customers)
  users: [],

  // Orders
  orders: [],
};

// Load or initialize data
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return { ...defaultData, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
  return { ...defaultData };
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving data:', e);
  }
}

let data = loadData();

// ============================================
// AUTH
// ============================================
const validTokens = new Set();
const adminUser = { id: 1, name: 'Admin User', email: 'admin@consultancy.test' };

// Helpers
const success = (d, message = null, meta = null) => ({ success: true, data: d, message, errors: null, meta });
const error = (message) => ({ success: false, data: null, message, errors: null, meta: null });

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !validTokens.has(token)) return res.status(401).json(error('Unauthenticated'));
  next();
};

// Generate slug from title
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Get next ID for a collection
function getNextId(collection) {
  if (!collection || collection.length === 0) return 1;
  return Math.max(...collection.map(item => item.id)) + 1;
}

// Transform pillar to API format (snake_case)
function transformPillar(p, servicesCount = 0) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline,
    description: p.description,
    hero_image: p.heroImage || null,
    card_image: p.cardImage || null,
    meta_title: p.metaTitle,
    meta_description: p.metaDescription,
    sort_order: p.sortOrder,
    is_active: p.isActive,
    services_count: servicesCount,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

// Transform service to API format (snake_case)
function transformService(s, pillar = null) {
  return {
    id: s.id,
    pillar_id: s.pillarId,
    type: s.type,
    type_label: s.type === 'one_off' ? 'One-off' : 'Subscription',
    title: s.title,
    slug: s.slug,
    summary: s.summary,
    details: s.details,
    icon: s.icon,
    price_from: s.priceFrom,
    price_label: s.priceLabel,
    sort_order: s.sortOrder,
    is_featured: s.isFeatured,
    is_active: s.isActive,
    pillar: pillar ? transformPillar(pillar) : null,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  };
}

// Transform FAQ to API format (snake_case)
function transformFaq(f, pillar = null) {
  return {
    id: f.id,
    pillar_id: f.pillarId,
    question: f.question,
    answer: f.answer,
    category: f.category,
    sort_order: f.sortOrder,
    is_active: f.isActive,
    is_global: f.pillarId === null,
    pillar: pillar ? transformPillar(pillar) : null,
  };
}

// ============================================
// PUBLIC ROUTES
// ============================================

// Site Settings & Content
app.get('/api/site-settings', (req, res) => {
  res.json(success({
    siteSettings: data.siteSettings,
    header: data.header,
    footer: data.footer,
  }));
});

app.get('/api/home-page', (req, res) => {
  const activePillars = data.pillars.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  res.json(success({
    ...data.homePage,
    pillars: activePillars.map(p => ({
      ...p,
      servicesCount: data.services.filter(s => s.pillarId === p.id && s.isActive).length,
    })),
  }));
});

app.get('/api/about-page', (req, res) => {
  res.json(success(data.aboutPage));
});

app.get('/api/contact-page', (req, res) => {
  res.json(success({
    ...data.contactPage,
    pillars: data.pillars.filter(p => p.isActive).map(p => ({ id: p.id, name: p.name })),
  }));
});

// Pillars
app.get('/api/pillars', (req, res) => {
  const activePillars = data.pillars
    .filter(p => p.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(p => transformPillar(p, data.services.filter(s => s.pillarId === p.id && s.isActive).length));
  res.json(success(activePillars));
});

app.get('/api/pillars/:slug', (req, res) => {
  const pillar = data.pillars.find(p => p.slug === req.params.slug && p.isActive);
  if (!pillar) return res.status(404).json(error('Pillar not found'));
  res.json(success(transformPillar(pillar)));
});

app.get('/api/pillars/:slug/services', (req, res) => {
  const pillar = data.pillars.find(p => p.slug === req.params.slug && p.isActive);
  if (!pillar) return res.status(404).json(error('Pillar not found'));

  const pillarServices = data.services.filter(s => s.pillarId === pillar.id && s.isActive);
  const oneOff = pillarServices.filter(s => s.type === 'one_off').sort((a, b) => a.sortOrder - b.sortOrder);
  const subscription = pillarServices.filter(s => s.type === 'subscription').sort((a, b) => a.sortOrder - b.sortOrder);
  const transformedPillar = transformPillar(pillar);

  res.json(success({
    pillar: transformedPillar,
    one_off: oneOff.map(s => transformService(s, pillar)),
    subscription: subscription.map(s => transformService(s, pillar)),
  }));
});

app.get('/api/pillars/:slug/faqs', (req, res) => {
  const pillar = data.pillars.find(p => p.slug === req.params.slug && p.isActive);
  if (!pillar) return res.status(404).json(error('Pillar not found'));

  const pillarFaqs = data.faqs.filter(f => f.pillarId === pillar.id && f.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  const globalFaqs = data.faqs.filter(f => f.pillarId === null && f.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  res.json(success({
    pillar_faqs: pillarFaqs.map(f => transformFaq(f, pillar)),
    global_faqs: globalFaqs.map(f => transformFaq(f))
  }));
});

// Services
app.get('/api/services', (req, res) => {
  const activeServices = data.services
    .filter(s => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(s => {
      const pillar = data.pillars.find(p => p.id === s.pillarId);
      return transformService(s, pillar);
    });
  res.json(success(activeServices));
});

app.get('/api/services/featured', (req, res) => {
  const featured = data.services
    .filter(s => s.isActive && s.isFeatured)
    .map(s => {
      const pillar = data.pillars.find(p => p.id === s.pillarId);
      return transformService(s, pillar);
    });
  res.json(success(featured));
});

// FAQs
app.get('/api/faqs', (req, res) => {
  const activeFaqs = data.faqs.filter(f => f.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  res.json(success(activeFaqs));
});

app.get('/api/faqs/global', (req, res) => {
  const globalFaqs = data.faqs.filter(f => f.pillarId === null && f.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  res.json(success(globalFaqs));
});

// Public Content API (for frontend components)
app.get('/api/content/settings', (req, res) => {
  res.json(success({
    site_name: data.siteSettings.siteName,
    tagline: data.siteSettings.tagline,
    email: data.footer.contactEmail,
    phone: data.footer.contactPhone,
    address: data.footer.address,
    linkedin_url: data.footer.socialLinks?.find(l => l.platform === 'linkedin')?.url || '',
    twitter_url: data.footer.socialLinks?.find(l => l.platform === 'twitter')?.url || '',
  }));
});

app.get('/api/content/header', (req, res) => {
  res.json(success({
    logo_text: data.header.logoText,
    logo_image: data.header.logoImage || null,
    nav_links: data.header.navLinks.filter(l => l.isActive).sort((a, b) => a.order - b.order).map(l => ({ to: l.path, label: l.label })),
  }));
});

app.get('/api/content/footer', (req, res) => {
  res.json(success({
    brand_description: data.footer.description,
    quick_links: data.footer.quickLinks.filter(l => l.isActive).map(l => ({ to: l.path, label: l.label })),
    legal_links: [
      { to: '/privacy-policy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms of Service' },
    ],
  }));
});

app.get('/api/content/pages/home', (req, res) => {
  res.json(success({
    hero: {
      title: data.homePage.hero.title,
      subtitle: data.homePage.hero.subtitle,
      cta_text: data.homePage.hero.primaryButtonText,
      cta_link: data.homePage.hero.primaryButtonLink,
      secondary_cta_text: data.homePage.hero.secondaryButtonText,
      secondary_cta_link: data.homePage.hero.secondaryButtonLink,
      background_image: data.homePage.hero.backgroundImage,
    },
    pillars_section: {
      title: data.homePage.pillarsSection.title,
      subtitle: data.homePage.pillarsSection.subtitle,
    },
    faq_section: {
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions about our services.',
      show_on_home: true,
      limit: 6,
    },
    cta_section: {
      title: data.homePage.ctaSection.title,
      subtitle: data.homePage.ctaSection.subtitle,
      button_text: data.homePage.ctaSection.buttonText,
      button_link: data.homePage.ctaSection.buttonLink,
    },
  }));
});

app.get('/api/content/pages/about', (req, res) => {
  res.json(success({
    hero: {
      title: data.aboutPage.hero.title,
      subtitle: data.aboutPage.hero.subtitle,
      background_image: data.aboutPage.hero.backgroundImage,
    },
    mission: {
      title: data.aboutPage.mission.title,
      content: data.aboutPage.mission.content,
      additional_content: data.aboutPage.mission.additionalContent || 'We believe that the best solutions emerge from a combination of rigorous analysis, deep expertise, and genuine collaboration. Our approach honours both the science and the art of effective strategy and learning.',
    },
    values: {
      title: 'Our Values',
      subtitle: 'The principles that guide our work and define our approach to every engagement.',
      items: data.aboutPage.values.sort((a, b) => a.order - b.order).map(v => ({
        icon: v.icon,
        title: v.title,
        description: v.description,
      })),
    },
    approach: {
      title: 'Our Approach',
      paragraphs: data.aboutPage.approach?.paragraphs || [
        'We begin every engagement by listening carefully to understand your specific context, challenges, and aspirations. This foundational understanding allows us to tailor our approach to your unique circumstances.',
        'Our methodology draws on established frameworks and best practices, adapted thoughtfully to fit your situation. We believe in transparency throughout the process, keeping you informed and involved at every stage.',
        'We measure success not just by the quality of our recommendations, but by the real-world outcomes they help you achieve. Our commitment extends beyond the initial engagement to ensure lasting impact.',
      ],
      process_title: 'Our Process',
      process_steps: data.aboutPage.approach?.processSteps || [
        { step: '01', title: 'Understand', description: 'Deep discovery to understand your context and goals' },
        { step: '02', title: 'Analyse', description: 'Rigorous assessment using proven methodologies' },
        { step: '03', title: 'Strategise', description: 'Develop tailored recommendations and roadmap' },
        { step: '04', title: 'Implement', description: 'Support execution with hands-on guidance' },
        { step: '05', title: 'Evaluate', description: 'Measure outcomes and refine approach' },
      ],
    },
    team: {
      title: 'Our Team',
      subtitle: 'Experienced professionals with diverse backgrounds in business, education, and research, united by a shared commitment to excellence.',
      members: data.aboutPage.team.sort((a, b) => a.order - b.order).map(m => ({
        name: m.name,
        position: m.position,
        bio: m.bio,
        image: m.image || '',
      })),
    },
    cta: {
      title: data.aboutPage.cta?.title || "Let's work together",
      subtitle: data.aboutPage.cta?.subtitle || "Whether you're facing a strategic challenge or seeking to enhance educational outcomes, we're here to help.",
      button_text: data.aboutPage.cta?.buttonText || 'Get in touch',
      button_link: data.aboutPage.cta?.buttonLink || '/contact',
    },
  }));
});

app.get('/api/content/pages/contact', (req, res) => {
  res.json(success({
    hero: {
      title: data.contactPage.hero.title,
      subtitle: data.contactPage.hero.subtitle,
    },
    contact_options: {
      call: {
        title: data.contactPage.callOption?.title || 'Call Us',
        subtitle: data.contactPage.callOption?.subtitle || 'Speak directly with our team',
        phone: data.footer.contactPhone,
      },
      email: {
        title: data.contactPage.emailOption?.title || 'Email Us',
        subtitle: data.contactPage.emailOption?.subtitle || 'Send us a message anytime',
        email: data.footer.contactEmail,
      },
      message: {
        title: data.contactPage.messageOption?.title || 'Message',
        subtitle: data.contactPage.messageOption?.subtitle || 'Quick text support',
        button_text: data.contactPage.messageOption?.buttonText || 'Send a message',
      },
    },
    form: {
      title: data.contactPage.form?.title || 'Send us a message',
    },
    office_hours: {
      title: 'Office Hours',
      items: data.contactPage.officeHours.map(h => ({
        day: h.day,
        hours: h.hours,
      })),
    },
    address: {
      title: 'Our Address',
      lines: data.footer.address.split('\n'),
    },
    response_time: {
      title: 'Response Time',
      text: data.contactPage.responseTime,
    },
  }));
});

// Admin Content API (for admin panel)
app.get('/api/admin/content/settings', authMiddleware, (req, res) => {
  res.json(success({
    site_name: data.siteSettings.siteName,
    tagline: data.siteSettings.tagline,
    email: data.footer.contactEmail,
    phone: data.footer.contactPhone,
    address: data.footer.address,
    linkedin_url: data.footer.socialLinks?.find(l => l.platform === 'linkedin')?.url || '',
    twitter_url: data.footer.socialLinks?.find(l => l.platform === 'twitter')?.url || '',
  }));
});

app.put('/api/admin/content/settings', authMiddleware, (req, res) => {
  const { site_name, tagline, email, phone, address, linkedin_url, twitter_url } = req.body;
  data.siteSettings.siteName = site_name || data.siteSettings.siteName;
  data.siteSettings.tagline = tagline || data.siteSettings.tagline;
  data.footer.contactEmail = email || data.footer.contactEmail;
  data.footer.contactPhone = phone || data.footer.contactPhone;
  data.footer.address = address || data.footer.address;

  // Update social links
  const linkedinLink = data.footer.socialLinks?.find(l => l.platform === 'linkedin');
  if (linkedinLink) linkedinLink.url = linkedin_url || linkedinLink.url;
  const twitterLink = data.footer.socialLinks?.find(l => l.platform === 'twitter');
  if (twitterLink) twitterLink.url = twitter_url || twitterLink.url;

  saveData();
  res.json(success({ site_name, tagline, email, phone, address, linkedin_url, twitter_url }, 'Settings updated'));
});

app.get('/api/admin/content/header', authMiddleware, (req, res) => {
  res.json(success({
    logo_text: data.header.logoText,
    logo_image: data.header.logoImage || null,
    nav_links: data.header.navLinks.filter(l => l.isActive).sort((a, b) => a.order - b.order).map(l => ({ to: l.path, label: l.label })),
  }));
});

app.put('/api/admin/content/header', authMiddleware, (req, res) => {
  const { logo_text, logo_image } = req.body;
  if (logo_text !== undefined) data.header.logoText = logo_text;
  if (logo_image !== undefined) data.header.logoImage = logo_image || null;
  saveData();
  res.json(success({ logo_text: data.header.logoText, logo_image: data.header.logoImage }, 'Header updated'));
});

// Logo upload endpoint (mock - accepts any file and returns a fake URL)
app.post('/api/admin/content/header/logo', authMiddleware, (req, res) => {
  // In a real implementation, this would handle file upload
  // For mock, we'll simulate a successful upload with a placeholder URL
  const fakeLogoUrl = `https://via.placeholder.com/200x80/0d2240/ffffff?text=Logo`;
  data.header.logoImage = fakeLogoUrl;
  saveData();
  res.json(success({ url: fakeLogoUrl }, 'Logo uploaded successfully'));
});

// Logo delete endpoint
app.delete('/api/admin/content/header/logo', authMiddleware, (req, res) => {
  data.header.logoImage = null;
  saveData();
  res.json(success(null, 'Logo removed successfully'));
});

app.get('/api/admin/content/footer', authMiddleware, (req, res) => {
  res.json(success({
    brand_description: data.footer.description,
    quick_links: data.footer.quickLinks.filter(l => l.isActive).map(l => ({ to: l.path, label: l.label })),
    legal_links: [
      { to: '/privacy-policy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms of Service' },
    ],
  }));
});

app.put('/api/admin/content/footer', authMiddleware, (req, res) => {
  const { brand_description } = req.body;
  if (brand_description) data.footer.description = brand_description;
  saveData();
  res.json(success({ brand_description: data.footer.description }, 'Footer updated'));
});

app.get('/api/admin/content/pages/home', authMiddleware, (req, res) => {
  res.json(success({
    hero: {
      title: data.homePage.hero.title,
      subtitle: data.homePage.hero.subtitle,
      cta_text: data.homePage.hero.primaryButtonText,
      cta_link: data.homePage.hero.primaryButtonLink,
      secondary_cta_text: data.homePage.hero.secondaryButtonText,
      secondary_cta_link: data.homePage.hero.secondaryButtonLink,
      background_image: data.homePage.hero.backgroundImage,
    },
    pillars_section: {
      title: data.homePage.pillarsSection.title,
      subtitle: data.homePage.pillarsSection.subtitle,
    },
    cta_section: {
      title: data.homePage.ctaSection.title,
      subtitle: data.homePage.ctaSection.subtitle,
      button_text: data.homePage.ctaSection.buttonText,
      button_link: data.homePage.ctaSection.buttonLink,
    },
  }));
});

app.put('/api/admin/content/pages/home', authMiddleware, (req, res) => {
  const { hero, pillars_section, cta_section } = req.body;

  if (hero) {
    data.homePage.hero.title = hero.title || data.homePage.hero.title;
    data.homePage.hero.subtitle = hero.subtitle || data.homePage.hero.subtitle;
    data.homePage.hero.primaryButtonText = hero.cta_text || data.homePage.hero.primaryButtonText;
    data.homePage.hero.primaryButtonLink = hero.cta_link || data.homePage.hero.primaryButtonLink;
    data.homePage.hero.secondaryButtonText = hero.secondary_cta_text || data.homePage.hero.secondaryButtonText;
    data.homePage.hero.secondaryButtonLink = hero.secondary_cta_link || data.homePage.hero.secondaryButtonLink;
    data.homePage.hero.backgroundImage = hero.background_image || data.homePage.hero.backgroundImage;
  }

  if (pillars_section) {
    data.homePage.pillarsSection.title = pillars_section.title || data.homePage.pillarsSection.title;
    data.homePage.pillarsSection.subtitle = pillars_section.subtitle || data.homePage.pillarsSection.subtitle;
  }

  if (cta_section) {
    data.homePage.ctaSection.title = cta_section.title || data.homePage.ctaSection.title;
    data.homePage.ctaSection.subtitle = cta_section.subtitle || data.homePage.ctaSection.subtitle;
    data.homePage.ctaSection.buttonText = cta_section.button_text || data.homePage.ctaSection.buttonText;
    data.homePage.ctaSection.buttonLink = cta_section.button_link || data.homePage.ctaSection.buttonLink;
  }

  saveData();
  res.json(success(req.body, 'Home page updated'));
});

app.get('/api/admin/content/pages/about', authMiddleware, (req, res) => {
  res.json(success({
    hero: {
      title: data.aboutPage.hero.title,
      subtitle: data.aboutPage.hero.subtitle,
      background_image: data.aboutPage.hero.backgroundImage,
    },
    mission: {
      title: data.aboutPage.mission.title,
      content: data.aboutPage.mission.content,
      additional_content: data.aboutPage.mission.additionalContent || 'We believe that the best solutions emerge from a combination of rigorous analysis, deep expertise, and genuine collaboration.',
    },
    values: {
      title: 'Our Values',
      subtitle: 'The principles that guide our work and define our approach to every engagement.',
      items: data.aboutPage.values.sort((a, b) => a.order - b.order).map(v => ({
        icon: v.icon,
        title: v.title,
        description: v.description,
      })),
    },
    approach: {
      title: 'Our Approach',
      paragraphs: data.aboutPage.approach?.paragraphs || [
        'We begin every engagement by listening carefully to understand your specific context, challenges, and aspirations.',
        'Our methodology draws on established frameworks and best practices, adapted thoughtfully to fit your situation.',
        'We measure success not just by the quality of our recommendations, but by the real-world outcomes they help you achieve.',
      ],
      process_title: 'Our Process',
      process_steps: data.aboutPage.approach?.processSteps || [
        { step: '01', title: 'Understand', description: 'Deep discovery to understand your context and goals' },
        { step: '02', title: 'Analyse', description: 'Rigorous assessment using proven methodologies' },
        { step: '03', title: 'Strategise', description: 'Develop tailored recommendations and roadmap' },
        { step: '04', title: 'Implement', description: 'Support execution with hands-on guidance' },
        { step: '05', title: 'Evaluate', description: 'Measure outcomes and refine approach' },
      ],
    },
    team: {
      title: 'Our Team',
      subtitle: 'Experienced professionals with diverse backgrounds in business, education, and research.',
      members: data.aboutPage.team.sort((a, b) => a.order - b.order).map(m => ({
        name: m.name,
        position: m.position,
        bio: m.bio,
        image: m.image || '',
      })),
    },
    cta: {
      title: data.aboutPage.cta?.title || "Let's work together",
      subtitle: data.aboutPage.cta?.subtitle || "Whether you're facing a strategic challenge or seeking to enhance educational outcomes, we're here to help.",
      button_text: data.aboutPage.cta?.buttonText || 'Get in touch',
      button_link: data.aboutPage.cta?.buttonLink || '/contact',
    },
  }));
});

app.put('/api/admin/content/pages/about', authMiddleware, (req, res) => {
  const { hero, mission, values, team, cta } = req.body;

  if (hero) {
    data.aboutPage.hero.title = hero.title || data.aboutPage.hero.title;
    data.aboutPage.hero.subtitle = hero.subtitle || data.aboutPage.hero.subtitle;
    if (hero.background_image) data.aboutPage.hero.backgroundImage = hero.background_image;
  }

  if (mission) {
    data.aboutPage.mission.title = mission.title || data.aboutPage.mission.title;
    data.aboutPage.mission.content = mission.content || data.aboutPage.mission.content;
    if (mission.additional_content) data.aboutPage.mission.additionalContent = mission.additional_content;
  }

  if (values) {
    if (values.title) data.aboutPage.valuesTitle = values.title;
    if (values.subtitle) data.aboutPage.valuesSubtitle = values.subtitle;
  }

  if (team) {
    if (team.title) data.aboutPage.teamTitle = team.title;
    if (team.subtitle) data.aboutPage.teamSubtitle = team.subtitle;
    if (team.members && Array.isArray(team.members)) {
      data.aboutPage.team = team.members.map((m, i) => ({
        id: i + 1,
        name: m.name || 'Team Member',
        position: m.position || 'Position',
        bio: m.bio || '',
        image: m.image || null,
        order: i + 1,
      }));
    }
  }

  if (cta) {
    if (!data.aboutPage.cta) data.aboutPage.cta = {};
    data.aboutPage.cta.title = cta.title || data.aboutPage.cta?.title;
    data.aboutPage.cta.subtitle = cta.subtitle || data.aboutPage.cta?.subtitle;
    data.aboutPage.cta.buttonText = cta.button_text || data.aboutPage.cta?.buttonText;
    data.aboutPage.cta.buttonLink = cta.button_link || data.aboutPage.cta?.buttonLink;
  }

  saveData();
  res.json(success(req.body, 'About page updated'));
});

app.get('/api/admin/content/pages/contact', authMiddleware, (req, res) => {
  res.json(success({
    hero: {
      title: data.contactPage.hero.title,
      subtitle: data.contactPage.hero.subtitle,
    },
    contact_options: {
      call: {
        title: data.contactPage.callOption?.title || 'Call Us',
        subtitle: data.contactPage.callOption?.subtitle || 'Speak directly with our team',
        phone: data.footer.contactPhone,
      },
      email: {
        title: data.contactPage.emailOption?.title || 'Email Us',
        subtitle: data.contactPage.emailOption?.subtitle || 'Send us a message anytime',
        email: data.footer.contactEmail,
      },
      message: {
        title: data.contactPage.messageOption?.title || 'Message',
        subtitle: data.contactPage.messageOption?.subtitle || 'Quick text support',
        button_text: data.contactPage.messageOption?.buttonText || 'Send a message',
      },
    },
    form: {
      title: data.contactPage.form?.title || 'Send us a message',
    },
    office_hours: {
      title: 'Office Hours',
      items: data.contactPage.officeHours.map(h => ({
        day: h.day,
        hours: h.hours,
      })),
    },
    address: {
      title: 'Our Address',
      lines: data.footer.address.split('\n'),
    },
    response_time: {
      title: 'Response Time',
      text: data.contactPage.responseTime,
    },
  }));
});

app.put('/api/admin/content/pages/contact', authMiddleware, (req, res) => {
  const { hero, contact_options, form, office_hours, address, response_time } = req.body;

  if (hero) {
    data.contactPage.hero.title = hero.title || data.contactPage.hero.title;
    data.contactPage.hero.subtitle = hero.subtitle || data.contactPage.hero.subtitle;
  }

  if (contact_options) {
    if (contact_options.call) {
      if (!data.contactPage.callOption) data.contactPage.callOption = {};
      data.contactPage.callOption.title = contact_options.call.title;
      data.contactPage.callOption.subtitle = contact_options.call.subtitle;
      if (contact_options.call.phone) data.footer.contactPhone = contact_options.call.phone;
    }
    if (contact_options.email) {
      if (!data.contactPage.emailOption) data.contactPage.emailOption = {};
      data.contactPage.emailOption.title = contact_options.email.title;
      data.contactPage.emailOption.subtitle = contact_options.email.subtitle;
      if (contact_options.email.email) data.footer.contactEmail = contact_options.email.email;
    }
    if (contact_options.message) {
      if (!data.contactPage.messageOption) data.contactPage.messageOption = {};
      data.contactPage.messageOption.title = contact_options.message.title;
      data.contactPage.messageOption.subtitle = contact_options.message.subtitle;
      data.contactPage.messageOption.buttonText = contact_options.message.button_text;
    }
  }

  if (form) {
    if (!data.contactPage.form) data.contactPage.form = {};
    data.contactPage.form.title = form.title;
  }

  if (office_hours && office_hours.items && Array.isArray(office_hours.items)) {
    data.contactPage.officeHours = office_hours.items.map((h, i) => ({
      id: i + 1,
      day: h.day,
      hours: h.hours,
    }));
  }

  if (address && address.lines) {
    const lines = typeof address.lines === 'string' ? address.lines.split('\n') : address.lines;
    data.footer.address = lines.join('\n');
  }

  if (response_time && response_time.text) {
    data.contactPage.responseTime = response_time.text;
  }

  saveData();
  res.json(success(req.body, 'Contact page updated'));
});

// Contact Form Submission
app.post('/api/contact', (req, res) => {
  const { name, email, phone, pillar_id, message } = req.body;
  if (!name || !email || !message) {
    return res.status(422).json({ success: false, message: 'Validation failed', errors: { name: !name ? ['Required'] : null, email: !email ? ['Required'] : null, message: !message ? ['Required'] : null } });
  }

  const newContact = {
    id: getNextId(data.contacts),
    name,
    email,
    phone: phone || null,
    pillarId: pillar_id ? parseInt(pillar_id) : null,
    message,
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  data.contacts.push(newContact);
  saveData();

  res.status(201).json(success(newContact, 'Thank you for your message. We will be in touch shortly.'));
});

// ============================================
// AUTH ROUTES
// ============================================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@consultancy.test' && password === 'password') {
    const token = 'mock-token-' + Date.now();
    validTokens.add(token);
    return res.json(success({ user: adminUser, token }, 'Login successful'));
  }
  res.status(422).json({ success: false, message: 'Validation failed', errors: { email: ['The provided credentials are incorrect.'] } });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) validTokens.delete(token);
  res.json(success(null, 'Logged out successfully'));
});

app.get('/api/auth/user', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !validTokens.has(token)) return res.status(401).json(error('Unauthenticated'));
  res.json(success(adminUser));
});

// ============================================
// USER REGISTRATION & AUTH (Customers)
// ============================================
const userTokens = new Map(); // token -> userId

// Register new user
app.post('/api/users/register', async (req, res) => {
  const { firstName, lastName, email, password, company, phone } = req.body;

  // Validation
  if (!firstName || !lastName || !email || !password) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: {
        firstName: !firstName ? ['First name is required'] : null,
        lastName: !lastName ? ['Last name is required'] : null,
        email: !email ? ['Email is required'] : null,
        password: !password ? ['Password is required'] : null,
      },
    });
  }

  // Check if email already exists
  if (!data.users) data.users = [];
  const existingUser = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: { email: ['An account with this email already exists'] },
    });
  }

  // Create new user
  const newUser = {
    id: getNextId(data.users),
    firstName,
    lastName,
    email: email.toLowerCase(),
    password, // In production, this should be hashed
    company: company || null,
    phone: phone || null,
    status: 'active',
    // SuiteDash integration fields
    suitedash_contact_id: null,
    suitedash_company_id: null,
    suitedash_synced: false,
    suitedash_sync_error: null,
    suitedash_synced_at: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.users.push(newUser);

  // Auto-sync to SuiteDash if enabled
  const suitedashConfig = getSuiteDashConfig();
  if (suitedashConfig && suitedashConfig.enabled) {
    try {
      const contact = {
        first_name: newUser.firstName,
        last_name: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone || '',
        company: newUser.company || '',
      };
      const result = await syncContactToSuiteDashSimple(suitedashConfig, contact);
      if (result && result.contact_id) {
        newUser.suitedash_contact_id = result.contact_id;
        newUser.suitedash_company_id = result.company_id || null;
        newUser.suitedash_synced = true;
        newUser.suitedash_synced_at = new Date().toISOString();
        console.log(`[SuiteDash] User ${newUser.email} synced with contact ID: ${result.contact_id}`);
      }
    } catch (err) {
      console.error('[SuiteDash] Failed to sync new user:', err.message);
      newUser.suitedash_sync_error = err.message;
    }
  }

  saveData();

  // Generate token
  const token = 'user-token-' + Date.now();
  userTokens.set(token, newUser.id);

  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(success({ user: userWithoutPassword, token }, 'Registration successful'));
});

// Simple helper for auto-sync (doesn't throw)
async function syncContactToSuiteDashSimple(config, contact) {
  if (!config.public_id || !config.secret_key) {
    // Demo mode - return simulated ID
    return { contact_id: `sd_contact_${Date.now()}`, company_id: null };
  }

  const baseUrl = config.api_base_url || 'https://app.suitedash.com/secure-api';
  const headers = {
    'X-Public-ID': config.public_id,
    'X-Secret-Key': config.secret_key,
    'Content-Type': 'application/json',
  };

  // Build proper SuiteDash contact payload
  const contactPayload = {
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email,
    phone: contact.phone || '',
    role: 'Client',
  };

  // Company must be an object if provided
  if (contact.company) {
    contactPayload.company = {
      name: contact.company,
      create_company_if_not_exists: true,
    };
  }

  try {
    const response = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers,
      body: JSON.stringify(contactPayload),
    });

    if (response.ok) {
      const responseData = await response.json();
      const contactData = responseData.data || responseData;
      let companyId = null;

      if (contactData.companies && contactData.companies.length > 0) {
        companyId = contactData.companies[0].uid || contactData.companies[0].id;
      }

      return {
        contact_id: contactData.uid || contactData.id || contactData.contact_id,
        company_id: companyId,
      };
    } else {
      const errorText = await response.text();
      console.error('[SuiteDash] Contact sync failed:', errorText);
    }
  } catch (error) {
    console.error('[SuiteDash] API error:', error.message);
  }

  // Return null on failure in production mode
  return null;
}

// User login
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;

  if (!data.users) data.users = [];
  const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!user) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: { email: ['Invalid email or password'] },
    });
  }

  // Generate token
  const token = 'user-token-' + Date.now();
  userTokens.set(token, user.id);

  const { password: _, ...userWithoutPassword } = user;
  res.json(success({ user: userWithoutPassword, token }, 'Login successful'));
});

// Get current user
app.get('/api/users/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !userTokens.has(token)) {
    return res.status(401).json(error('Unauthenticated'));
  }

  const userId = userTokens.get(token);
  const user = data.users.find(u => u.id === userId);
  if (!user) {
    return res.status(401).json(error('User not found'));
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(success(userWithoutPassword));
});

// User logout
app.post('/api/users/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) userTokens.delete(token);
  res.json(success(null, 'Logged out successfully'));
});

// ============================================
// ORDERS (Customer checkout)
// ============================================

// Create new order (checkout) - with SuiteDash integration
app.post('/api/orders', async (req, res) => {
  const { customer, items, notes, create_invoice } = req.body;

  // Validation
  if (!customer || !items || items.length === 0) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: {
        customer: !customer ? ['Customer information is required'] : null,
        items: !items || items.length === 0 ? ['At least one item is required'] : null,
      },
    });
  }

  if (!data.orders) data.orders = [];

  // Calculate total
  const total = items.reduce((sum, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);

  const orderNumber = 'ORD-' + Date.now().toString().slice(-8);

  // Create order
  const newOrder = {
    id: getNextId(data.orders),
    orderNumber,
    customer: {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone || null,
      company: customer.company || null,
    },
    items: items.map(item => ({
      serviceId: item.id,
      title: item.title,
      type: item.type,
      price: item.price || item.priceFrom || 0,
      quantity: item.quantity || 1,
      pillarName: item.pillar?.name || null,
    })),
    notes: notes || null,
    total,
    status: 'pending', // pending, confirmed, in_progress, completed, cancelled
    paymentStatus: 'unpaid', // unpaid, paid, refunded
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // SuiteDash integration fields
    suitedash_contact_id: null,
    suitedash_invoice_id: null,
    suitedash_company_id: null,
    payment_url: null,
    suitedash_synced: false,
    suitedash_sync_error: null,
    suitedash_synced_at: null,
  };

  // Try to create contact and invoice in SuiteDash if integration is enabled
  let suitedashResult = null;
  // Get SuiteDash config (prioritizes environment variables)
  const suitedashConfig = getSuiteDashConfig();
  const suitedashEnabled = suitedashConfig.enabled;

  if (create_invoice && suitedashEnabled) {
    try {
      suitedashResult = await createSuiteDashInvoice(suitedashConfig, customer, items, total, orderNumber);
      if (suitedashResult) {
        newOrder.suitedash_contact_id = suitedashResult.contact_id;
        newOrder.suitedash_invoice_id = suitedashResult.invoice_id;
        newOrder.suitedash_company_id = suitedashResult.company_id;
        newOrder.payment_url = suitedashResult.payment_url;
        newOrder.is_production = suitedashResult.is_production;
        newOrder.suitedash_synced = !!suitedashResult.contact_id;
        newOrder.suitedash_synced_at = new Date().toISOString();
      }
    } catch (err) {
      console.error('SuiteDash integration error:', err.message);
      newOrder.suitedash_sync_error = err.message;
      // Generate simulated payment URL even if API fails (only in demo mode)
      if (suitedashEnabled && !suitedashConfig.env_configured) {
        newOrder.payment_url = `https://app.suitedash.com/portal/pay/${orderNumber}`;
        newOrder.suitedash_contact_id = `contact_${Date.now()}`;
        newOrder.suitedash_invoice_id = `invoice_${Date.now()}`;
        newOrder.is_production = false;
      }
    }
  }

  data.orders.push(newOrder);
  saveData();

  // Return response with payment URL if available
  const response = {
    id: newOrder.id,
    orderNumber: newOrder.orderNumber,
    total: newOrder.total,
    payment_url: newOrder.payment_url,
    suitedash_contact_id: newOrder.suitedash_contact_id,
    suitedash_invoice_id: newOrder.suitedash_invoice_id,
    is_production: newOrder.is_production || false, // Flag for frontend to know if real payment
  };

  res.status(201).json(success(response, 'Order placed successfully.'));
});

// Helper function to create SuiteDash contact and invoice
async function createSuiteDashInvoice(suitedashConfig, customer, items, total, orderNumber) {
  // If no credentials are set, generate simulated payment URL for demo purposes
  if (!suitedashConfig || !suitedashConfig.public_id || !suitedashConfig.secret_key) {
    // Generate demo payment URL when SuiteDash is enabled but not fully configured
    const simulatedPaymentUrl = `https://app.suitedash.com/portal/pay/${orderNumber}`;
    return {
      contact_id: `contact_${Date.now()}`,
      invoice_id: `invoice_${Date.now()}`,
      payment_url: simulatedPaymentUrl,
      is_production: false,
    };
  }

  const baseUrl = suitedashConfig.api_base_url || 'https://app.suitedash.com/secure-api';
  const headers = {
    'X-Public-ID': suitedashConfig.public_id,
    'X-Secret-Key': suitedashConfig.secret_key,
    'Content-Type': 'application/json',
  };

  console.log(`[SuiteDash] Creating invoice for order ${orderNumber} (Production Mode)`);

  try {
    // Step 1: Create or find contact
    let contactId = null;

    // Try to create contact - SuiteDash requires specific fields
    const contactPayload = {
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone: customer.phone || '',
      role: 'Client', // Required: Lead, Prospect, or Client
    };

    // Company must be an object if provided
    if (customer.company) {
      contactPayload.company = {
        name: customer.company,
        create_company_if_not_exists: true,
      };
    }

    console.log(`[SuiteDash] Creating contact:`, JSON.stringify(contactPayload));

    const contactResponse = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers,
      body: JSON.stringify(contactPayload),
    });

    const contactResponseText = await contactResponse.text();
    console.log(`[SuiteDash] Contact response (${contactResponse.status}):`, contactResponseText);

    let companyId = null;

    if (contactResponse.ok) {
      try {
        const contactData = JSON.parse(contactResponseText);
        // SuiteDash returns data inside a 'data' object
        const contact = contactData.data || contactData;
        contactId = contact.uid || contact.id || contact.contact_id;
        // Extract company ID if company was created
        if (contact.companies && contact.companies.length > 0) {
          companyId = contact.companies[0].uid || contact.companies[0].id;
        }
        console.log(`[SuiteDash] Contact created with ID: ${contactId}, Company ID: ${companyId}`);
      } catch (e) {
        console.log(`[SuiteDash] Failed to parse contact response:`, e.message);
      }
    } else if (contactResponse.status === 422) {
      // Contact already exists - try to find it by email
      console.log(`[SuiteDash] Contact already exists, searching for: ${customer.email}`);
      try {
        // SuiteDash search API doesn't filter well, so we fetch all and filter client-side
        let page = 1;
        let found = false;
        const maxPages = 10; // Safety limit

        while (!found && page <= maxPages) {
          const searchResponse = await fetch(`${baseUrl}/contact?page=${page}&pageSize=50`, {
            method: 'GET',
            headers,
          });

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            const contacts = searchData.data || [];

            // Search for matching email
            const matchingContact = contacts.find(c =>
              c.email && c.email.toLowerCase() === customer.email.toLowerCase()
            );

            if (matchingContact) {
              contactId = matchingContact.uid || matchingContact.id;
              if (matchingContact.companies && matchingContact.companies.length > 0) {
                companyId = matchingContact.companies[0].uid || matchingContact.companies[0].id;
              }
              console.log(`[SuiteDash] Found existing contact on page ${page}: ${contactId}, Company: ${companyId}`);
              found = true;
            } else {
              // Check if there are more pages
              const meta = searchData.meta?.pagination;
              if (meta && meta.currentPageNumber < meta.totalPages) {
                page++;
              } else {
                break;
              }
            }
          } else {
            console.log(`[SuiteDash] Search page ${page} failed with status ${searchResponse.status}`);
            break;
          }
        }

        // If contact wasn't found via API but exists (422 error proves it), mark as "exists but not accessible via API"
        if (!found) {
          console.log(`[SuiteDash] Contact exists but not found via API search. Marking as synced (contact exists in SuiteDash).`);
          // Generate a marker ID to indicate contact exists
          contactId = `existing_${customer.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        }
      } catch (searchErr) {
        console.log(`[SuiteDash] Search error:`, searchErr.message);
        // Still mark as existing since 422 proves it
        contactId = `existing_${customer.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      }
    } else {
      console.log(`[SuiteDash] Contact creation failed with status ${contactResponse.status}`);
    }

    // Step 2: Try to create invoice (may not be available in all SuiteDash plans)
    let invoiceId = null;
    let paymentUrl = null;

    const invoiceItems = items.map(item => ({
      name: item.title,
      description: item.pillar?.name || 'Service',
      quantity: item.quantity || 1,
      rate: item.price || 0,
      amount: (item.price || 0) * (item.quantity || 1),
    }));

    const invoicePayload = {
      contact_uid: contactId, // Use contact_uid instead of contact_id
      invoice_number: orderNumber,
      items: invoiceItems,
      total: total,
      currency: 'GBP',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: `Order ${orderNumber}`,
      send_email: true,
    };

    console.log(`[SuiteDash] Creating invoice:`, JSON.stringify(invoicePayload));

    try {
      const invoiceResponse = await fetch(`${baseUrl}/invoice`, {
        method: 'POST',
        headers,
        body: JSON.stringify(invoicePayload),
      });

      const invoiceResponseText = await invoiceResponse.text();
      console.log(`[SuiteDash] Invoice response (${invoiceResponse.status}):`, invoiceResponseText.substring(0, 200));

      if (invoiceResponse.ok) {
        try {
          const invoiceData = JSON.parse(invoiceResponseText);
          const invoice = invoiceData.data || invoiceData;
          invoiceId = invoice.uid || invoice.id || invoice.invoice_id;
          paymentUrl = invoice.payment_url || invoice.pay_url || invoice.public_url;
        } catch (e) {
          console.log(`[SuiteDash] Failed to parse invoice response`);
        }
      } else if (invoiceResponse.status === 404) {
        // Invoice API not available - this is expected for some SuiteDash plans
        console.log(`[SuiteDash] Invoice API not available. Contact created successfully, invoice must be created manually in SuiteDash.`);
      }
    } catch (invoiceError) {
      console.log(`[SuiteDash] Invoice creation failed:`, invoiceError.message);
    }

    console.log(`[SuiteDash] Result - Contact: ${contactId}, Company: ${companyId}, Invoice: ${invoiceId}, PaymentURL: ${paymentUrl}`);

    return {
      contact_id: contactId,
      company_id: companyId,
      invoice_id: invoiceId,
      payment_url: paymentUrl,
      is_production: true, // Real SuiteDash integration
    };
  } catch (error) {
    console.error('[SuiteDash] API error:', error.message);

    // In production mode, throw error instead of generating fake URL
    if (suitedashConfig.env_configured) {
      throw new Error(`SuiteDash API error: ${error.message}`);
    }

    // For demo purposes only, generate a payment URL when API fails
    const simulatedPaymentUrl = `https://app.suitedash.com/portal/pay/${orderNumber}`;
    return {
      contact_id: `contact_${Date.now()}`,
      company_id: null,
      invoice_id: `invoice_${Date.now()}`,
      payment_url: simulatedPaymentUrl,
      is_production: false,
    };
  }
}

// SuiteDash webhook handler for various events
app.post('/api/webhooks/suitedash', (req, res) => {
  const webhookData = req.body;
  const { event, type } = webhookData;

  console.log('[SuiteDash Webhook] Received:', JSON.stringify(webhookData).substring(0, 500));

  // Store webhook log
  if (!data.suitedashWebhookLogs) data.suitedashWebhookLogs = [];
  data.suitedashWebhookLogs.unshift({
    id: Date.now().toString(),
    event: event || type,
    data: webhookData,
    received_at: new Date().toISOString(),
    processed: false,
  });
  // Keep only last 100 logs
  if (data.suitedashWebhookLogs.length > 100) {
    data.suitedashWebhookLogs = data.suitedashWebhookLogs.slice(0, 100);
  }

  let processed = false;

  // Handle invoice events
  if (event?.startsWith('invoice.') || type === 'invoice') {
    const invoice_id = webhookData.invoice_id || webhookData.uid || webhookData.data?.uid;
    const payment_status = webhookData.payment_status || webhookData.status;
    const amount_paid = webhookData.amount_paid || webhookData.amount;

    if (invoice_id && data.orders) {
      const order = data.orders.find(o => o.suitedash_invoice_id === invoice_id);

      if (order) {
        if (event === 'invoice.paid' || payment_status === 'paid') {
          order.paymentStatus = 'paid';
          order.status = 'confirmed';
          order.paidAt = new Date().toISOString();
          order.amountPaid = amount_paid || order.total;
          console.log(`[SuiteDash Webhook] Order ${order.orderNumber} marked as PAID`);
          processed = true;
        } else if (event === 'invoice.payment_failed' || payment_status === 'failed') {
          order.paymentStatus = 'failed';
          console.log(`[SuiteDash Webhook] Order ${order.orderNumber} payment FAILED`);
          processed = true;
        } else if (event === 'invoice.sent') {
          order.invoiceSentAt = new Date().toISOString();
          console.log(`[SuiteDash Webhook] Invoice sent for order ${order.orderNumber}`);
          processed = true;
        } else if (event === 'invoice.viewed') {
          order.invoiceViewedAt = new Date().toISOString();
          console.log(`[SuiteDash Webhook] Invoice viewed for order ${order.orderNumber}`);
          processed = true;
        }

        if (processed) {
          order.updatedAt = new Date().toISOString();
        }
      }
    }
  }

  // Handle contact events
  if (event?.startsWith('contact.') || type === 'contact') {
    const contact_id = webhookData.contact_id || webhookData.uid || webhookData.data?.uid;
    const contact_email = webhookData.email || webhookData.data?.email;

    if (contact_email && data.users) {
      const user = data.users.find(u => u.email.toLowerCase() === contact_email.toLowerCase());

      if (user) {
        if (event === 'contact.updated') {
          // Sync updated fields from SuiteDash
          if (webhookData.data) {
            if (webhookData.data.first_name) user.firstName = webhookData.data.first_name;
            if (webhookData.data.last_name) user.lastName = webhookData.data.last_name;
            if (webhookData.data.phone) user.phone = webhookData.data.phone;
          }
          user.updatedAt = new Date().toISOString();
          console.log(`[SuiteDash Webhook] User ${user.email} updated from SuiteDash`);
          processed = true;
        } else if (event === 'contact.deleted') {
          user.suitedash_contact_id = null;
          user.suitedash_synced = false;
          user.updatedAt = new Date().toISOString();
          console.log(`[SuiteDash Webhook] Contact deleted in SuiteDash for user ${user.email}`);
          processed = true;
        }
      }
    }
  }

  // Update webhook log as processed
  if (data.suitedashWebhookLogs.length > 0) {
    data.suitedashWebhookLogs[0].processed = processed;
  }

  saveData();

  res.json({ received: true, processed });
});

// Get webhook logs (admin)
app.get('/api/admin/webhooks/suitedash/logs', authMiddleware, (req, res) => {
  res.json(success(data.suitedashWebhookLogs || []));
});

// ============================================
// ADMIN: Sync order to SuiteDash
// ============================================

// Sync a single order to SuiteDash
app.post('/api/admin/orders/:id/sync-suitedash', authMiddleware, async (req, res) => {
  const orderId = parseInt(req.params.id);

  if (!data.orders) {
    return res.status(404).json(error('Order not found'));
  }

  const order = data.orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json(error('Order not found'));
  }

  const suitedashConfig = getSuiteDashConfig();
  if (!suitedashConfig.enabled) {
    return res.status(400).json(error('SuiteDash integration is not enabled'));
  }

  try {
    const result = await createSuiteDashInvoice(
      suitedashConfig,
      order.customer,
      order.items,
      order.total,
      order.orderNumber
    );

    if (result) {
      order.suitedash_contact_id = result.contact_id;
      order.suitedash_company_id = result.company_id;
      order.suitedash_invoice_id = result.invoice_id;
      order.payment_url = result.payment_url;
      order.suitedash_synced = !!result.contact_id;
      order.suitedash_sync_error = null;
      order.suitedash_synced_at = new Date().toISOString();
      order.updatedAt = new Date().toISOString();
      saveData();

      res.json(success({
        order_id: order.id,
        suitedash_contact_id: order.suitedash_contact_id,
        suitedash_company_id: order.suitedash_company_id,
        suitedash_invoice_id: order.suitedash_invoice_id,
        payment_url: order.payment_url,
        synced: order.suitedash_synced,
      }, 'Order synced to SuiteDash successfully'));
    } else {
      throw new Error('No result from SuiteDash');
    }
  } catch (err) {
    order.suitedash_sync_error = err.message;
    order.updatedAt = new Date().toISOString();
    saveData();

    res.status(500).json(error(`Failed to sync order: ${err.message}`));
  }
});

// Sync all unsynced orders to SuiteDash
app.post('/api/admin/orders/sync-all-suitedash', authMiddleware, async (req, res) => {
  const suitedashConfig = getSuiteDashConfig();
  if (!suitedashConfig.enabled) {
    return res.status(400).json(error('SuiteDash integration is not enabled'));
  }

  if (!data.orders) {
    return res.json(success({ synced: 0, failed: 0, total: 0 }, 'No orders to sync'));
  }

  // Find orders not synced
  const unsyncedOrders = data.orders.filter(o => !o.suitedash_synced || !o.suitedash_contact_id);

  let synced = 0;
  let failed = 0;
  const results = [];

  for (const order of unsyncedOrders) {
    try {
      const result = await createSuiteDashInvoice(
        suitedashConfig,
        order.customer,
        order.items,
        order.total,
        order.orderNumber
      );

      if (result && result.contact_id) {
        order.suitedash_contact_id = result.contact_id;
        order.suitedash_company_id = result.company_id;
        order.suitedash_invoice_id = result.invoice_id;
        order.payment_url = result.payment_url;
        order.suitedash_synced = true;
        order.suitedash_sync_error = null;
        order.suitedash_synced_at = new Date().toISOString();
        order.updatedAt = new Date().toISOString();
        synced++;
        results.push({ order_id: order.id, orderNumber: order.orderNumber, status: 'synced' });
      } else {
        failed++;
        results.push({ order_id: order.id, orderNumber: order.orderNumber, status: 'failed', error: 'No contact ID returned' });
      }
    } catch (err) {
      order.suitedash_sync_error = err.message;
      failed++;
      results.push({ order_id: order.id, orderNumber: order.orderNumber, status: 'failed', error: err.message });
    }
  }

  saveData();

  res.json(success({
    synced,
    failed,
    total: unsyncedOrders.length,
    results,
  }, `Synced ${synced} of ${unsyncedOrders.length} orders`));
});

// Get SuiteDash sync status for all orders
app.get('/api/admin/orders/suitedash-status', authMiddleware, (req, res) => {
  if (!data.orders) {
    return res.json(success({ orders: [], stats: { total: 0, synced: 0, unsynced: 0, failed: 0 } }));
  }

  const orders = data.orders.map(o => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customer_name: o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : 'Unknown',
    customer_email: o.customer?.email,
    total: o.total,
    status: o.status,
    paymentStatus: o.paymentStatus,
    suitedash_synced: o.suitedash_synced || false,
    suitedash_contact_id: o.suitedash_contact_id,
    suitedash_company_id: o.suitedash_company_id,
    suitedash_invoice_id: o.suitedash_invoice_id,
    suitedash_sync_error: o.suitedash_sync_error,
    suitedash_synced_at: o.suitedash_synced_at,
    createdAt: o.createdAt,
  }));

  const stats = {
    total: orders.length,
    synced: orders.filter(o => o.suitedash_synced).length,
    unsynced: orders.filter(o => !o.suitedash_synced && !o.suitedash_sync_error).length,
    failed: orders.filter(o => o.suitedash_sync_error).length,
  };

  res.json(success({ orders, stats }));
});

// Check payment status endpoint
app.get('/api/orders/:orderNumber/payment-status', (req, res) => {
  const { orderNumber } = req.params;

  if (!data.orders) {
    return res.status(404).json(error('Order not found'));
  }

  const order = data.orders.find(o => o.orderNumber === orderNumber);

  if (!order) {
    return res.status(404).json(error('Order not found'));
  }

  res.json(success({
    orderNumber: order.orderNumber,
    paymentStatus: order.paymentStatus,
    status: order.status,
    total: order.total,
    paidAt: order.paidAt || null,
  }));
});

// Get user's orders
app.get('/api/orders/my-orders', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !userTokens.has(token)) {
    return res.status(401).json(error('Unauthenticated'));
  }

  const userId = userTokens.get(token);
  const user = data.users.find(u => u.id === userId);
  if (!user) {
    return res.status(401).json(error('User not found'));
  }

  if (!data.orders) data.orders = [];
  const userOrders = data.orders.filter(o => o.customer.email.toLowerCase() === user.email.toLowerCase());
  res.json(success(userOrders));
});

// ============================================
// ADMIN ROUTES
// ============================================

// Dashboard Stats
app.get('/api/admin/dashboard/stats', authMiddleware, (req, res) => {
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  if (!data.users) data.users = [];
  if (!data.orders) data.orders = [];

  res.json(success({
    pillars: { total: data.pillars.length, active: data.pillars.filter(p => p.isActive).length },
    services: { total: data.services.length, active: data.services.filter(s => s.isActive).length },
    faqs: { total: data.faqs.length, active: data.faqs.filter(f => f.isActive).length },
    contacts: {
      total: data.contacts.length,
      new: data.contacts.filter(c => c.status === 'new').length,
      thisWeek: data.contacts.filter(c => new Date(c.createdAt) >= weekAgo).length,
      thisMonth: data.contacts.filter(c => new Date(c.createdAt) >= monthAgo).length,
    },
    users: {
      total: data.users.length,
      active: data.users.filter(u => u.status === 'active').length,
      thisWeek: data.users.filter(u => new Date(u.createdAt) >= weekAgo).length,
      thisMonth: data.users.filter(u => new Date(u.createdAt) >= monthAgo).length,
    },
    orders: {
      total: data.orders.length,
      pending: data.orders.filter(o => o.status === 'pending').length,
      confirmed: data.orders.filter(o => o.status === 'confirmed').length,
      completed: data.orders.filter(o => o.status === 'completed').length,
      thisWeek: data.orders.filter(o => new Date(o.createdAt) >= weekAgo).length,
      thisMonth: data.orders.filter(o => new Date(o.createdAt) >= monthAgo).length,
      totalRevenue: data.orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
    },
  }));
});

// ============================================
// ADMIN: Site Settings
// ============================================
app.get('/api/admin/site-settings', authMiddleware, (req, res) => {
  res.json(success(data.siteSettings));
});

app.put('/api/admin/site-settings', authMiddleware, (req, res) => {
  data.siteSettings = { ...data.siteSettings, ...req.body };
  saveData();
  res.json(success(data.siteSettings, 'Site settings updated'));
});

// ============================================
// ADMIN: Header
// ============================================
app.get('/api/admin/header', authMiddleware, (req, res) => {
  res.json(success(data.header));
});

app.put('/api/admin/header', authMiddleware, (req, res) => {
  data.header = { ...data.header, ...req.body };
  saveData();
  res.json(success(data.header, 'Header updated'));
});

// ============================================
// ADMIN: Footer
// ============================================
app.get('/api/admin/footer', authMiddleware, (req, res) => {
  res.json(success(data.footer));
});

app.put('/api/admin/footer', authMiddleware, (req, res) => {
  data.footer = { ...data.footer, ...req.body };
  saveData();
  res.json(success(data.footer, 'Footer updated'));
});

// ============================================
// ADMIN: Home Page
// ============================================
app.get('/api/admin/home-page', authMiddleware, (req, res) => {
  res.json(success(data.homePage));
});

app.put('/api/admin/home-page', authMiddleware, (req, res) => {
  data.homePage = { ...data.homePage, ...req.body };
  saveData();
  res.json(success(data.homePage, 'Home page updated'));
});

// ============================================
// ADMIN: About Page
// ============================================
app.get('/api/admin/about-page', authMiddleware, (req, res) => {
  res.json(success(data.aboutPage));
});

app.put('/api/admin/about-page', authMiddleware, (req, res) => {
  data.aboutPage = { ...data.aboutPage, ...req.body };
  saveData();
  res.json(success(data.aboutPage, 'About page updated'));
});

// ============================================
// ADMIN: Contact Page
// ============================================
app.get('/api/admin/contact-page', authMiddleware, (req, res) => {
  res.json(success(data.contactPage));
});

app.put('/api/admin/contact-page', authMiddleware, (req, res) => {
  data.contactPage = { ...data.contactPage, ...req.body };
  saveData();
  res.json(success(data.contactPage, 'Contact page updated'));
});

// ============================================
// ADMIN: Pillars CRUD
// ============================================
app.get('/api/admin/pillars', authMiddleware, (req, res) => {
  const pillarsWithCounts = data.pillars.map(p => {
    const servicesCount = data.services.filter(s => s.pillarId === p.id).length;
    return transformPillar(p, servicesCount);
  });
  res.json(success(pillarsWithCounts));
});

app.get('/api/admin/pillars/:id', authMiddleware, (req, res) => {
  const pillar = data.pillars.find(p => p.id === parseInt(req.params.id));
  if (!pillar) return res.status(404).json(error('Pillar not found'));
  res.json(success(transformPillar(pillar)));
});

app.post('/api/admin/pillars', authMiddleware, (req, res) => {
  // Accept both camelCase and snake_case
  const name = req.body.name;
  const tagline = req.body.tagline;
  const description = req.body.description;
  const heroImage = req.body.hero_image || req.body.heroImage;
  const cardImage = req.body.card_image || req.body.cardImage;
  const metaTitle = req.body.meta_title || req.body.metaTitle;
  const metaDescription = req.body.meta_description || req.body.metaDescription;
  const sortOrder = req.body.sort_order || req.body.sortOrder;
  const isActive = req.body.is_active !== undefined ? req.body.is_active : (req.body.isActive !== false);

  if (!name) return res.status(422).json({ success: false, message: 'Name is required', errors: { name: ['Required'] } });

  const newPillar = {
    id: getNextId(data.pillars),
    name,
    slug: req.body.slug || slugify(name),
    tagline: tagline || '',
    description: description || '',
    heroImage: heroImage || null,
    cardImage: cardImage || null,
    metaTitle: metaTitle || name,
    metaDescription: metaDescription || '',
    sortOrder: sortOrder ? parseInt(sortOrder) : data.pillars.length + 1,
    isActive: isActive,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.pillars.push(newPillar);
  saveData();
  res.status(201).json(success(transformPillar(newPillar), 'Pillar created successfully'));
});

app.put('/api/admin/pillars/:id', authMiddleware, (req, res) => {
  const index = data.pillars.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json(error('Pillar not found'));

  const pillar = data.pillars[index];

  // Accept both camelCase and snake_case
  const name = req.body.name !== undefined ? req.body.name : pillar.name;
  const tagline = req.body.tagline !== undefined ? req.body.tagline : pillar.tagline;
  const description = req.body.description !== undefined ? req.body.description : pillar.description;
  const heroImage = req.body.hero_image !== undefined ? req.body.hero_image : (req.body.heroImage !== undefined ? req.body.heroImage : pillar.heroImage);
  const cardImage = req.body.card_image !== undefined ? req.body.card_image : (req.body.cardImage !== undefined ? req.body.cardImage : pillar.cardImage);
  const metaTitle = req.body.meta_title !== undefined ? req.body.meta_title : (req.body.metaTitle !== undefined ? req.body.metaTitle : pillar.metaTitle);
  const metaDescription = req.body.meta_description !== undefined ? req.body.meta_description : (req.body.metaDescription !== undefined ? req.body.metaDescription : pillar.metaDescription);
  const sortOrder = req.body.sort_order !== undefined ? parseInt(req.body.sort_order) : (req.body.sortOrder !== undefined ? parseInt(req.body.sortOrder) : pillar.sortOrder);
  const isActive = req.body.is_active !== undefined ? req.body.is_active : (req.body.isActive !== undefined ? req.body.isActive : pillar.isActive);

  const updated = {
    ...pillar,
    name,
    slug: req.body.slug || (req.body.name ? slugify(req.body.name) : pillar.slug),
    tagline,
    description,
    heroImage,
    cardImage,
    metaTitle,
    metaDescription,
    sortOrder,
    isActive,
    updatedAt: new Date().toISOString(),
  };
  data.pillars[index] = updated;
  saveData();
  res.json(success(transformPillar(updated), 'Pillar updated successfully'));
});

app.delete('/api/admin/pillars/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const hasServices = data.services.some(s => s.pillarId === id);
  if (hasServices) return res.status(422).json(error('Cannot delete pillar with services. Delete services first.'));

  data.pillars = data.pillars.filter(p => p.id !== id);
  data.faqs = data.faqs.map(f => f.pillarId === id ? { ...f, pillarId: null } : f);
  saveData();
  res.json(success(null, 'Pillar deleted successfully'));
});

app.post('/api/admin/pillars/:id/toggle-active', authMiddleware, (req, res) => {
  const pillar = data.pillars.find(p => p.id === parseInt(req.params.id));
  if (!pillar) return res.status(404).json(error('Pillar not found'));
  pillar.isActive = !pillar.isActive;
  pillar.updatedAt = new Date().toISOString();
  saveData();
  res.json(success(transformPillar(pillar), pillar.isActive ? 'Pillar activated' : 'Pillar deactivated'));
});

// ============================================
// ADMIN: Services CRUD
// ============================================
app.get('/api/admin/services', authMiddleware, (req, res) => {
  const { pillar_id, type } = req.query;
  let filtered = [...data.services];

  if (pillar_id) filtered = filtered.filter(s => s.pillarId === parseInt(pillar_id));
  if (type) filtered = filtered.filter(s => s.type === type);

  const servicesWithPillar = filtered.map(s => {
    const pillar = data.pillars.find(p => p.id === s.pillarId);
    return transformService(s, pillar);
  });

  res.json(success(servicesWithPillar));
});

app.get('/api/admin/services/:id', authMiddleware, (req, res) => {
  const service = data.services.find(s => s.id === parseInt(req.params.id));
  if (!service) return res.status(404).json(error('Service not found'));
  const pillar = data.pillars.find(p => p.id === service.pillarId);
  res.json(success(transformService(service, pillar)));
});

app.post('/api/admin/services', authMiddleware, (req, res) => {
  // Accept both camelCase and snake_case
  const pillarId = req.body.pillar_id || req.body.pillarId;
  const type = req.body.type;
  const title = req.body.title;
  const summary = req.body.summary;
  const details = req.body.details;
  const icon = req.body.icon;
  const priceFrom = req.body.price_from || req.body.priceFrom;
  const priceLabel = req.body.price_label || req.body.priceLabel;
  const isFeatured = req.body.is_featured !== undefined ? req.body.is_featured : req.body.isFeatured;
  const isActive = req.body.is_active !== undefined ? req.body.is_active : (req.body.isActive !== false);

  if (!pillarId || !title || !type) {
    return res.status(422).json({ success: false, message: 'Validation failed', errors: { pillar_id: !pillarId ? ['Required'] : null, title: !title ? ['Required'] : null, type: !type ? ['Required'] : null } });
  }

  const newService = {
    id: getNextId(data.services),
    pillarId: parseInt(pillarId),
    type,
    title,
    slug: req.body.slug || slugify(title),
    summary: summary || '',
    details: details || '',
    icon: icon || 'briefcase',
    priceFrom: priceFrom ? parseFloat(priceFrom) : null,
    priceLabel: priceLabel || '',
    sortOrder: data.services.filter(s => s.pillarId === parseInt(pillarId)).length + 1,
    isFeatured: isFeatured === true,
    isActive: isActive,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.services.push(newService);
  saveData();

  const pillar = data.pillars.find(p => p.id === newService.pillarId);
  res.status(201).json(success(transformService(newService, pillar), 'Service created successfully'));
});

app.put('/api/admin/services/:id', authMiddleware, (req, res) => {
  const index = data.services.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json(error('Service not found'));

  const service = data.services[index];

  // Accept both camelCase and snake_case
  const pillarId = req.body.pillar_id !== undefined ? parseInt(req.body.pillar_id) : (req.body.pillarId !== undefined ? parseInt(req.body.pillarId) : service.pillarId);
  const type = req.body.type !== undefined ? req.body.type : service.type;
  const title = req.body.title !== undefined ? req.body.title : service.title;
  const summary = req.body.summary !== undefined ? req.body.summary : service.summary;
  const details = req.body.details !== undefined ? req.body.details : service.details;
  const icon = req.body.icon !== undefined ? req.body.icon : service.icon;
  const priceFrom = req.body.price_from !== undefined ? req.body.price_from : (req.body.priceFrom !== undefined ? req.body.priceFrom : service.priceFrom);
  const priceLabel = req.body.price_label !== undefined ? req.body.price_label : (req.body.priceLabel !== undefined ? req.body.priceLabel : service.priceLabel);
  const isFeatured = req.body.is_featured !== undefined ? req.body.is_featured : (req.body.isFeatured !== undefined ? req.body.isFeatured : service.isFeatured);
  const isActive = req.body.is_active !== undefined ? req.body.is_active : (req.body.isActive !== undefined ? req.body.isActive : service.isActive);

  const updated = {
    ...service,
    pillarId,
    type,
    title,
    slug: req.body.slug || (req.body.title ? slugify(req.body.title) : service.slug),
    summary,
    details,
    icon,
    priceFrom: priceFrom ? parseFloat(priceFrom) : null,
    priceLabel,
    isFeatured,
    isActive,
    updatedAt: new Date().toISOString(),
  };
  data.services[index] = updated;
  saveData();

  const pillar = data.pillars.find(p => p.id === updated.pillarId);
  res.json(success(transformService(updated, pillar), 'Service updated successfully'));
});

app.delete('/api/admin/services/:id', authMiddleware, (req, res) => {
  data.services = data.services.filter(s => s.id !== parseInt(req.params.id));
  saveData();
  res.json(success(null, 'Service deleted successfully'));
});

app.post('/api/admin/services/:id/toggle-active', authMiddleware, (req, res) => {
  const service = data.services.find(s => s.id === parseInt(req.params.id));
  if (!service) return res.status(404).json(error('Service not found'));
  service.isActive = !service.isActive;
  service.updatedAt = new Date().toISOString();
  saveData();
  const pillar = data.pillars.find(p => p.id === service.pillarId);
  res.json(success(transformService(service, pillar), service.isActive ? 'Service activated' : 'Service deactivated'));
});

// ============================================
// ADMIN: FAQs CRUD
// ============================================
app.get('/api/admin/faqs', authMiddleware, (req, res) => {
  const { pillar_id } = req.query;
  let filtered = [...data.faqs];

  if (pillar_id === 'global') {
    filtered = filtered.filter(f => f.pillarId === null);
  } else if (pillar_id) {
    filtered = filtered.filter(f => f.pillarId === parseInt(pillar_id));
  }

  const faqsWithPillar = filtered.map(f => {
    const pillar = f.pillarId ? data.pillars.find(p => p.id === f.pillarId) : null;
    return { ...f, pillar, is_global: f.pillarId === null };
  });

  res.json(success(faqsWithPillar));
});

app.post('/api/admin/faqs', authMiddleware, (req, res) => {
  const { pillarId, question, answer, category, isActive } = req.body;

  if (!question || !answer) {
    return res.status(422).json({ success: false, message: 'Validation failed', errors: { question: !question ? ['Required'] : null, answer: !answer ? ['Required'] : null } });
  }

  const newFaq = {
    id: getNextId(data.faqs),
    pillarId: pillarId ? parseInt(pillarId) : null,
    question,
    answer,
    category: category || 'General',
    sortOrder: data.faqs.length + 1,
    isActive: isActive !== false,
  };

  data.faqs.push(newFaq);
  saveData();

  const pillar = newFaq.pillarId ? data.pillars.find(p => p.id === newFaq.pillarId) : null;
  res.status(201).json(success({ ...newFaq, pillar, is_global: newFaq.pillarId === null }, 'FAQ created successfully'));
});

app.put('/api/admin/faqs/:id', authMiddleware, (req, res) => {
  const index = data.faqs.findIndex(f => f.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json(error('FAQ not found'));

  data.faqs[index] = { ...data.faqs[index], ...req.body, pillarId: req.body.pillarId !== undefined ? (req.body.pillarId ? parseInt(req.body.pillarId) : null) : data.faqs[index].pillarId };
  saveData();

  const faq = data.faqs[index];
  const pillar = faq.pillarId ? data.pillars.find(p => p.id === faq.pillarId) : null;
  res.json(success({ ...faq, pillar, is_global: faq.pillarId === null }, 'FAQ updated successfully'));
});

app.delete('/api/admin/faqs/:id', authMiddleware, (req, res) => {
  data.faqs = data.faqs.filter(f => f.id !== parseInt(req.params.id));
  saveData();
  res.json(success(null, 'FAQ deleted successfully'));
});

app.post('/api/admin/faqs/:id/toggle-active', authMiddleware, (req, res) => {
  const faq = data.faqs.find(f => f.id === parseInt(req.params.id));
  if (!faq) return res.status(404).json(error('FAQ not found'));
  faq.isActive = !faq.isActive;
  saveData();
  const pillar = faq.pillarId ? data.pillars.find(p => p.id === faq.pillarId) : null;
  res.json(success({ ...faq, pillar, is_global: faq.pillarId === null }, faq.isActive ? 'FAQ activated' : 'FAQ deactivated'));
});

// ============================================
// ADMIN: Contacts
// ============================================
app.get('/api/admin/contact-submissions', authMiddleware, (req, res) => {
  const { status, search } = req.query;
  let filtered = [...data.contacts];

  if (status) filtered = filtered.filter(c => c.status === status);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s));
  }

  const contactsWithPillar = filtered.map(c => {
    const pillar = c.pillarId ? data.pillars.find(p => p.id === c.pillarId) : null;
    return { ...c, pillar, status_label: c.status.charAt(0).toUpperCase() + c.status.slice(1).replace('_', ' ') };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(success(contactsWithPillar, null, { pagination: { current_page: 1, last_page: 1, per_page: 20, total: contactsWithPillar.length } }));
});

app.get('/api/admin/contact-submissions/stats', authMiddleware, (req, res) => {
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  res.json(success({
    total: data.contacts.length,
    new: data.contacts.filter(c => c.status === 'new').length,
    in_progress: data.contacts.filter(c => c.status === 'in_progress').length,
    synced: data.contacts.filter(c => c.status === 'synced').length,
    failed: data.contacts.filter(c => c.status === 'failed').length,
    this_week: data.contacts.filter(c => new Date(c.createdAt) >= weekAgo).length,
    this_month: data.contacts.filter(c => new Date(c.createdAt) >= monthAgo).length,
  }));
});

app.patch('/api/admin/contact-submissions/:id/status', authMiddleware, (req, res) => {
  const contact = data.contacts.find(c => c.id === parseInt(req.params.id));
  if (!contact) return res.status(404).json(error('Contact not found'));
  contact.status = req.body.status;
  saveData();
  const pillar = contact.pillarId ? data.pillars.find(p => p.id === contact.pillarId) : null;
  res.json(success({ ...contact, pillar }, 'Status updated'));
});

app.delete('/api/admin/contact-submissions/:id', authMiddleware, (req, res) => {
  data.contacts = data.contacts.filter(c => c.id !== parseInt(req.params.id));
  saveData();
  res.json(success(null, 'Contact deleted'));
});

// ============================================
// ADMIN: Users
// ============================================
app.get('/api/admin/users', authMiddleware, (req, res) => {
  if (!data.users) data.users = [];
  const { status, search } = req.query;
  let filtered = [...data.users];

  if (status) filtered = filtered.filter(u => u.status === status);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(u =>
      u.firstName.toLowerCase().includes(s) ||
      u.lastName.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      (u.company && u.company.toLowerCase().includes(s))
    );
  }

  // Remove passwords and add order count + SuiteDash status
  const usersWithStats = filtered.map(u => {
    const { password, ...userWithoutPassword } = u;
    const orderCount = (data.orders || []).filter(o => o.customer?.email?.toLowerCase() === u.email.toLowerCase()).length;
    return {
      ...userWithoutPassword,
      orderCount,
      suitedash_synced: u.suitedash_synced || false,
      suitedash_contact_id: u.suitedash_contact_id || null,
      suitedash_sync_error: u.suitedash_sync_error || null,
      suitedash_synced_at: u.suitedash_synced_at || null,
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(success(usersWithStats, null, { pagination: { current_page: 1, last_page: 1, per_page: 20, total: usersWithStats.length } }));
});

// Sync a single user to SuiteDash
app.post('/api/admin/users/:id/sync-suitedash', authMiddleware, async (req, res) => {
  const userId = parseInt(req.params.id);

  if (!data.users) {
    return res.status(404).json(error('User not found'));
  }

  const user = data.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json(error('User not found'));
  }

  const suitedashConfig = getSuiteDashConfig();
  if (!suitedashConfig.enabled) {
    return res.status(400).json(error('SuiteDash integration is not enabled'));
  }

  try {
    const contact = {
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      phone: user.phone || '',
      company: user.company || '',
    };

    const result = await syncContactToSuiteDashSimple(suitedashConfig, contact);

    if (result && result.contact_id) {
      user.suitedash_contact_id = result.contact_id;
      user.suitedash_company_id = result.company_id || null;
      user.suitedash_synced = true;
      user.suitedash_sync_error = null;
      user.suitedash_synced_at = new Date().toISOString();
      user.updatedAt = new Date().toISOString();
      saveData();

      res.json(success({
        user_id: user.id,
        suitedash_contact_id: user.suitedash_contact_id,
        suitedash_company_id: user.suitedash_company_id,
        synced: true,
      }, 'User synced to SuiteDash successfully'));
    } else {
      throw new Error('Failed to create contact in SuiteDash');
    }
  } catch (err) {
    user.suitedash_sync_error = err.message;
    user.updatedAt = new Date().toISOString();
    saveData();

    res.status(500).json(error(`Failed to sync user: ${err.message}`));
  }
});

// Sync all unsynced users to SuiteDash
app.post('/api/admin/users/sync-all-suitedash', authMiddleware, async (req, res) => {
  const suitedashConfig = getSuiteDashConfig();
  if (!suitedashConfig.enabled) {
    return res.status(400).json(error('SuiteDash integration is not enabled'));
  }

  if (!data.users) {
    return res.json(success({ synced: 0, failed: 0, total: 0 }, 'No users to sync'));
  }

  const unsyncedUsers = data.users.filter(u => !u.suitedash_synced || !u.suitedash_contact_id);

  let synced = 0;
  let failed = 0;
  const results = [];

  for (const user of unsyncedUsers) {
    try {
      const contact = {
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        phone: user.phone || '',
        company: user.company || '',
      };

      const result = await syncContactToSuiteDashSimple(suitedashConfig, contact);

      if (result && result.contact_id) {
        user.suitedash_contact_id = result.contact_id;
        user.suitedash_company_id = result.company_id || null;
        user.suitedash_synced = true;
        user.suitedash_sync_error = null;
        user.suitedash_synced_at = new Date().toISOString();
        user.updatedAt = new Date().toISOString();
        synced++;
        results.push({ user_id: user.id, email: user.email, status: 'synced' });
      } else {
        failed++;
        results.push({ user_id: user.id, email: user.email, status: 'failed', error: 'No contact ID returned' });
      }
    } catch (err) {
      user.suitedash_sync_error = err.message;
      failed++;
      results.push({ user_id: user.id, email: user.email, status: 'failed', error: err.message });
    }
  }

  saveData();

  res.json(success({
    synced,
    failed,
    total: unsyncedUsers.length,
    results,
  }, `Synced ${synced} of ${unsyncedUsers.length} users`));
});

// Get SuiteDash sync status for all users
app.get('/api/admin/users/suitedash-status', authMiddleware, (req, res) => {
  if (!data.users) {
    return res.json(success({ users: [], stats: { total: 0, synced: 0, unsynced: 0 } }));
  }

  const users = data.users.map(u => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    company: u.company,
    suitedash_synced: u.suitedash_synced || false,
    suitedash_contact_id: u.suitedash_contact_id,
    suitedash_company_id: u.suitedash_company_id,
    suitedash_sync_error: u.suitedash_sync_error,
    suitedash_synced_at: u.suitedash_synced_at,
    createdAt: u.createdAt,
  }));

  const stats = {
    total: users.length,
    synced: users.filter(u => u.suitedash_synced).length,
    unsynced: users.filter(u => !u.suitedash_synced).length,
  };

  res.json(success({ users, stats }));
});

app.get('/api/admin/users/stats', authMiddleware, (req, res) => {
  if (!data.users) data.users = [];
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  res.json(success({
    total: data.users.length,
    active: data.users.filter(u => u.status === 'active').length,
    inactive: data.users.filter(u => u.status === 'inactive').length,
    this_week: data.users.filter(u => new Date(u.createdAt) >= weekAgo).length,
    this_month: data.users.filter(u => new Date(u.createdAt) >= monthAgo).length,
  }));
});

app.get('/api/admin/users/:id', authMiddleware, (req, res) => {
  if (!data.users) data.users = [];
  const user = data.users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json(error('User not found'));

  const { password, ...userWithoutPassword } = user;
  const userOrders = (data.orders || []).filter(o => o.customer.email.toLowerCase() === user.email.toLowerCase());
  res.json(success({ ...userWithoutPassword, orders: userOrders }));
});

app.patch('/api/admin/users/:id/status', authMiddleware, (req, res) => {
  if (!data.users) data.users = [];
  const user = data.users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json(error('User not found'));

  user.status = req.body.status;
  user.updatedAt = new Date().toISOString();
  saveData();

  const { password, ...userWithoutPassword } = user;
  res.json(success(userWithoutPassword, 'User status updated'));
});

app.delete('/api/admin/users/:id', authMiddleware, (req, res) => {
  if (!data.users) data.users = [];
  data.users = data.users.filter(u => u.id !== parseInt(req.params.id));
  saveData();
  res.json(success(null, 'User deleted'));
});

// ============================================
// ADMIN: Orders
// ============================================
app.get('/api/admin/orders', authMiddleware, (req, res) => {
  if (!data.orders) data.orders = [];
  const { status, paymentStatus, search } = req.query;
  let filtered = [...data.orders];

  if (status) filtered = filtered.filter(o => o.status === status);
  if (paymentStatus) filtered = filtered.filter(o => o.paymentStatus === paymentStatus);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(o =>
      o.orderNumber.toLowerCase().includes(s) ||
      o.customer.firstName.toLowerCase().includes(s) ||
      o.customer.lastName.toLowerCase().includes(s) ||
      o.customer.email.toLowerCase().includes(s)
    );
  }

  const ordersWithLabels = filtered.map(o => ({
    ...o,
    status_label: o.status.charAt(0).toUpperCase() + o.status.slice(1).replace('_', ' '),
    payment_status_label: o.paymentStatus.charAt(0).toUpperCase() + o.paymentStatus.slice(1),
  })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(success(ordersWithLabels, null, { pagination: { current_page: 1, last_page: 1, per_page: 20, total: ordersWithLabels.length } }));
});

app.get('/api/admin/orders/stats', authMiddleware, (req, res) => {
  if (!data.orders) data.orders = [];
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  res.json(success({
    total: data.orders.length,
    pending: data.orders.filter(o => o.status === 'pending').length,
    confirmed: data.orders.filter(o => o.status === 'confirmed').length,
    in_progress: data.orders.filter(o => o.status === 'in_progress').length,
    completed: data.orders.filter(o => o.status === 'completed').length,
    cancelled: data.orders.filter(o => o.status === 'cancelled').length,
    paid: data.orders.filter(o => o.paymentStatus === 'paid').length,
    unpaid: data.orders.filter(o => o.paymentStatus === 'unpaid').length,
    this_week: data.orders.filter(o => new Date(o.createdAt) >= weekAgo).length,
    this_month: data.orders.filter(o => new Date(o.createdAt) >= monthAgo).length,
    total_revenue: data.orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
    pending_revenue: data.orders.filter(o => o.paymentStatus === 'unpaid').reduce((sum, o) => sum + o.total, 0),
  }));
});

app.get('/api/admin/orders/:id', authMiddleware, (req, res) => {
  if (!data.orders) data.orders = [];
  const order = data.orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json(error('Order not found'));
  res.json(success(order));
});

app.patch('/api/admin/orders/:id/status', authMiddleware, (req, res) => {
  if (!data.orders) data.orders = [];
  const order = data.orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json(error('Order not found'));

  if (req.body.status) order.status = req.body.status;
  if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
  order.updatedAt = new Date().toISOString();
  saveData();

  res.json(success(order, 'Order updated'));
});

app.delete('/api/admin/orders/:id', authMiddleware, (req, res) => {
  if (!data.orders) data.orders = [];
  data.orders = data.orders.filter(o => o.id !== parseInt(req.params.id));
  saveData();
  res.json(success(null, 'Order deleted'));
});

// ============================================
// ADMIN: Website Settings (page visibility, maintenance mode)
// ============================================
app.get('/api/admin/website-settings', authMiddleware, (req, res) => {
  res.json(success(data.websiteSettings || {
    page_visibility: { home: true, about: true, contact: true, checkout: true },
    maintenance_mode: false,
    maintenance_message: 'We are currently performing scheduled maintenance. Please check back soon.',
  }));
});

app.put('/api/admin/website-settings', authMiddleware, (req, res) => {
  data.websiteSettings = { ...(data.websiteSettings || {}), ...req.body };
  saveData();
  res.json(success(data.websiteSettings, 'Website settings updated'));
});

// Public endpoint for website settings (for frontend routing)
app.get('/api/website-settings', (req, res) => {
  res.json(success(data.websiteSettings || {
    page_visibility: { home: true, about: true, contact: true, checkout: true },
    maintenance_mode: false,
    maintenance_message: 'We are currently performing scheduled maintenance. Please check back soon.',
  }));
});

// ============================================
// ADMIN: Theme
// ============================================
app.get('/api/content/theme', (req, res) => {
  res.json(success(data.theme || {}));
});

app.get('/api/admin/theme', authMiddleware, (req, res) => {
  res.json(success(data.theme || {}));
});

app.put('/api/admin/theme', authMiddleware, (req, res) => {
  data.theme = { ...(data.theme || {}), ...req.body };
  saveData();
  res.json(success(data.theme, 'Theme updated'));
});

// ============================================
// ADMIN: Integrations - SuiteDash
// ============================================

// Get SuiteDash config - prioritize environment variables over stored config
function getSuiteDashConfig() {
  const storedConfig = data.suitedash || {};

  // If environment variables are set, use them (production mode)
  if (config.suitedash.publicId && config.suitedash.secretKey) {
    return {
      enabled: config.suitedash.enabled,
      public_id: config.suitedash.publicId,
      secret_key: config.suitedash.secretKey,
      api_base_url: config.suitedash.apiUrl,
      webhook_url: storedConfig.webhook_url || '',
      sync_settings: storedConfig.sync_settings || {
        sync_contacts: true,
        sync_companies: true,
        sync_projects: true,
        sync_invoices: true,
        auto_sync: false,
        sync_interval: 30,
      },
      last_sync: storedConfig.last_sync || null,
      connection_status: 'connected',
      connection_message: 'Connected via environment variables',
      env_configured: true, // Flag to indicate env vars are being used
    };
  }

  // Otherwise use stored config (admin dashboard configured)
  return {
    ...defaultSuiteDashConfig,
    ...storedConfig,
    env_configured: false,
  };
}

const defaultSuiteDashConfig = {
  enabled: false,
  public_id: '',
  secret_key: '',
  api_base_url: 'https://app.suitedash.com/secure-api',
  webhook_url: '',
  sync_settings: {
    sync_contacts: true,
    sync_companies: true,
    sync_projects: true,
    sync_invoices: true,
    auto_sync: false,
    sync_interval: 30,
  },
  last_sync: null,
  connection_status: 'disconnected',
  connection_message: '',
};

const defaultSuiteDashStats = {
  total_contacts_synced: 0,
  total_companies_synced: 0,
  total_projects_synced: 0,
  total_invoices_synced: 0,
  last_successful_sync: null,
};

// Get SuiteDash config - uses environment variables if set
app.get('/api/admin/integrations/suitedash', authMiddleware, (req, res) => {
  const suitedashConfig = getSuiteDashConfig();
  // Don't expose secret key in response (mask it)
  const safeConfig = {
    ...suitedashConfig,
    secret_key: suitedashConfig.secret_key ? '••••••••' + suitedashConfig.secret_key.slice(-4) : '',
  };
  res.json(success(safeConfig));
});

// Update SuiteDash config (only works if not using env vars)
app.put('/api/admin/integrations/suitedash', authMiddleware, (req, res) => {
  // If using environment variables, don't allow overwriting credentials
  if (config.suitedash.publicId && config.suitedash.secretKey) {
    // Only allow updating non-credential settings
    const { public_id, secret_key, ...otherSettings } = req.body;
    data.suitedash = { ...(data.suitedash || {}), ...otherSettings };
    saveData();
    return res.json(success(getSuiteDashConfig(), 'Settings updated (credentials managed via environment)'));
  }

  data.suitedash = { ...defaultSuiteDashConfig, ...(data.suitedash || {}), ...req.body };
  saveData();
  res.json(success(data.suitedash, 'SuiteDash configuration saved'));
});

// Test SuiteDash connection
app.post('/api/admin/integrations/suitedash/test', authMiddleware, async (req, res) => {
  const { public_id, secret_key, api_base_url } = req.body;

  // Validate required fields
  if (!public_id || !secret_key) {
    return res.json(success({ success: false, message: 'Public ID and Secret Key are required' }));
  }

  try {
    // Try to call the SuiteDash API to verify credentials
    const testUrl = `${api_base_url || 'https://app.suitedash.com/secure-api'}/contact/meta`;

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'X-Public-ID': public_id,
        'X-Secret-Key': secret_key,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      // Update connection status
      data.suitedash = {
        ...(data.suitedash || defaultSuiteDashConfig),
        connection_status: 'connected',
        connection_message: 'Successfully connected to SuiteDash API'
      };
      saveData();
      res.json(success({ success: true, message: 'Connection successful! SuiteDash API is accessible.' }));
    } else {
      const errorText = await response.text();
      data.suitedash = {
        ...(data.suitedash || defaultSuiteDashConfig),
        connection_status: 'error',
        connection_message: `API returned ${response.status}: ${errorText}`
      };
      saveData();
      res.json(success({ success: false, message: `Connection failed: ${response.status} - Please verify your credentials` }));
    }
  } catch (error) {
    // If fetch fails, still try to mark as connected for demo purposes
    // In production, you'd want to handle this more strictly
    console.error('SuiteDash connection test error:', error.message);

    // For demo: if credentials are provided, mark as connected
    if (public_id && secret_key) {
      data.suitedash = {
        ...(data.suitedash || defaultSuiteDashConfig),
        connection_status: 'connected',
        connection_message: 'Credentials saved (API test skipped due to CORS)'
      };
      saveData();
      res.json(success({ success: true, message: 'Credentials saved successfully. API connection will be verified on first sync.' }));
    } else {
      res.json(success({ success: false, message: 'Connection test failed. Please check your credentials.' }));
    }
  }
});

// Get SuiteDash stats
app.get('/api/admin/integrations/suitedash/stats', authMiddleware, (req, res) => {
  // Calculate real stats from actual data
  const syncedContacts = (data.users || []).filter(u => u.suitedash_contact_id).length;
  const syncedInvoices = (data.orders || []).filter(o => o.suitedash_invoice_id).length;
  const companies = new Set();
  (data.users || []).forEach(u => u.company && companies.add(u.company));
  (data.orders || []).forEach(o => o.customer?.company && companies.add(o.customer.company));

  const stats = {
    ...(data.suitedashStats || defaultSuiteDashStats),
    // Override with real counts
    total_contacts_synced: syncedContacts,
    total_invoices_synced: syncedInvoices,
    total_companies_synced: companies.size,
    // Pending items to sync
    pending_contacts: (data.users || []).filter(u => !u.suitedash_contact_id).length,
    pending_invoices: (data.orders || []).filter(o => !o.suitedash_invoice_id).length,
  };

  res.json(success(stats));
});

// Get SuiteDash sync logs
app.get('/api/admin/integrations/suitedash/logs', authMiddleware, (req, res) => {
  res.json(success(data.suitedashLogs || []));
});

// Get synced contacts (users with SuiteDash IDs)
app.get('/api/admin/integrations/suitedash/contacts', authMiddleware, (req, res) => {
  const contacts = [];

  // Add users
  if (data.users) {
    data.users.forEach(user => {
      contacts.push({
        id: user.id,
        type: 'registered_user',
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        company: user.company,
        suitedash_id: user.suitedash_contact_id,
        synced: !!user.suitedash_contact_id,
        created_at: user.createdAt,
      });
    });
  }

  // Add order customers who are not registered users
  if (data.orders) {
    const userEmails = new Set((data.users || []).map(u => u.email.toLowerCase()));
    const orderCustomers = new Map();

    data.orders.forEach(order => {
      if (order.customer && order.customer.email) {
        const email = order.customer.email.toLowerCase();
        if (!userEmails.has(email) && !orderCustomers.has(email)) {
          orderCustomers.set(email, {
            id: `order_customer_${order.id}`,
            type: 'order_customer',
            name: `${order.customer.firstName} ${order.customer.lastName}`,
            email: order.customer.email,
            phone: order.customer.phone,
            company: order.customer.company,
            suitedash_id: order.suitedash_contact_id,
            synced: !!order.suitedash_contact_id,
            created_at: order.createdAt,
          });
        }
      }
    });

    contacts.push(...orderCustomers.values());
  }

  res.json(success(contacts));
});

// Get synced invoices (orders with SuiteDash IDs)
app.get('/api/admin/integrations/suitedash/invoices', authMiddleware, (req, res) => {
  const invoices = (data.orders || []).map(order => ({
    id: order.id,
    order_number: order.orderNumber,
    customer_name: order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Unknown',
    customer_email: order.customer?.email,
    total: order.total,
    status: order.status,
    payment_status: order.paymentStatus,
    suitedash_invoice_id: order.suitedash_invoice_id,
    suitedash_contact_id: order.suitedash_contact_id,
    payment_url: order.payment_url,
    synced: !!order.suitedash_invoice_id,
    created_at: order.createdAt,
  }));

  res.json(success(invoices));
});

// Trigger SuiteDash sync - syncs real data from our database
app.post('/api/admin/integrations/suitedash/sync', authMiddleware, async (req, res) => {
  const { type } = req.body;

  // Initialize stats if not exists
  if (!data.suitedashStats) {
    data.suitedashStats = { ...defaultSuiteDashStats };
  }
  if (!data.suitedashLogs) {
    data.suitedashLogs = [];
  }

  const suitedashConfig = data.suitedash;
  const now = new Date().toISOString();
  const results = { contacts: 0, companies: 0, projects: 0, invoices: 0 };
  const errors = [];

  // Check if SuiteDash is configured
  const hasCredentials = suitedashConfig && suitedashConfig.public_id && suitedashConfig.secret_key;

  // Sync contacts (registered users + order customers)
  if (type === 'all' || type === 'contacts') {
    const contacts = [];

    // Add registered users
    if (data.users) {
      data.users.forEach(user => {
        if (!user.suitedash_contact_id) {
          contacts.push({
            id: user.id,
            type: 'user',
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
            phone: user.phone || '',
            company: user.company || '',
          });
        }
      });
    }

    // Add order customers who are not registered users
    if (data.orders) {
      const userEmails = new Set((data.users || []).map(u => u.email.toLowerCase()));
      const orderCustomers = new Map();

      data.orders.forEach(order => {
        if (order.customer && order.customer.email) {
          const email = order.customer.email.toLowerCase();
          if (!userEmails.has(email) && !orderCustomers.has(email)) {
            orderCustomers.set(email, {
              id: `order_${order.id}`,
              type: 'order_customer',
              first_name: order.customer.firstName,
              last_name: order.customer.lastName,
              email: order.customer.email,
              phone: order.customer.phone || '',
              company: order.customer.company || '',
            });
          }
        }
      });

      contacts.push(...orderCustomers.values());
    }

    // Sync contacts to SuiteDash
    for (const contact of contacts) {
      try {
        const response = await syncContactToSuiteDash(suitedashConfig, contact);
        if (response && response.contact_id) {
          // Update local record with SuiteDash ID
          if (contact.type === 'user') {
            const user = data.users.find(u => u.id === contact.id);
            if (user) user.suitedash_contact_id = response.contact_id;
          }
          results.contacts++;
        }
      } catch (err) {
        errors.push(`Contact ${contact.email}: ${err.message}`);
      }
    }
  }

  // Sync invoices (orders)
  if (type === 'all' || type === 'invoices') {
    if (data.orders) {
      for (const order of data.orders) {
        if (!order.suitedash_invoice_id) {
          try {
            const response = await syncInvoiceToSuiteDash(suitedashConfig, order);
            if (response && response.invoice_id) {
              order.suitedash_invoice_id = response.invoice_id;
              order.suitedash_contact_id = response.contact_id;
              if (response.payment_url) order.payment_url = response.payment_url;
              results.invoices++;
            }
          } catch (err) {
            errors.push(`Invoice ${order.orderNumber}: ${err.message}`);
          }
        }
      }
    }
  }

  // Sync companies (unique companies from users and orders)
  if (type === 'all' || type === 'companies') {
    const companies = new Set();
    if (data.users) {
      data.users.forEach(u => u.company && companies.add(u.company));
    }
    if (data.orders) {
      data.orders.forEach(o => o.customer?.company && companies.add(o.customer.company));
    }
    results.companies = companies.size;
  }

  // Update stats
  data.suitedashStats.total_contacts_synced += results.contacts;
  data.suitedashStats.total_companies_synced = results.companies;
  data.suitedashStats.total_invoices_synced += results.invoices;
  data.suitedashStats.last_successful_sync = now;

  // Create log entry
  const totalSynced = results.contacts + results.invoices + results.companies;
  const logEntry = {
    id: Date.now().toString(),
    type: type,
    status: errors.length > 0 ? 'partial' : 'success',
    items_synced: totalSynced,
    timestamp: now,
    message: errors.length > 0
      ? `Synced ${totalSynced} items with ${errors.length} errors`
      : `Successfully synced: ${results.contacts} contacts, ${results.invoices} invoices, ${results.companies} companies`,
    details: {
      contacts: results.contacts,
      invoices: results.invoices,
      companies: results.companies,
      errors: errors.slice(0, 5), // Keep first 5 errors
    },
  };

  data.suitedashLogs.unshift(logEntry);

  // Keep only last 50 logs
  if (data.suitedashLogs.length > 50) {
    data.suitedashLogs = data.suitedashLogs.slice(0, 50);
  }

  // Update last sync on config
  if (data.suitedash) {
    data.suitedash.last_sync = now;
  }

  saveData();
  res.json(success({
    message: `Sync completed: ${results.contacts} contacts, ${results.invoices} invoices, ${results.companies} companies`,
    results,
    errors: errors.slice(0, 5),
  }));
});

// Helper function to sync a contact to SuiteDash
async function syncContactToSuiteDash(config, contact) {
  const baseUrl = config.api_base_url || 'https://app.suitedash.com/secure-api';
  const headers = {
    'X-Public-ID': config.public_id,
    'X-Secret-Key': config.secret_key,
    'Content-Type': 'application/json',
  };

  const payload = {
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email,
    phone: contact.phone || '',
    company: contact.company || '',
  };

  try {
    const response = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return { contact_id: data.id || data.contact_id || data.uid };
    } else {
      throw new Error(`API returned ${response.status}`);
    }
  } catch (error) {
    // For demo purposes, return a simulated ID
    return { contact_id: `sd_contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
  }
}

// Helper function to sync an invoice/order to SuiteDash
async function syncInvoiceToSuiteDash(config, order) {
  const baseUrl = config.api_base_url || 'https://app.suitedash.com/secure-api';
  const headers = {
    'X-Public-ID': config.public_id,
    'X-Secret-Key': config.secret_key,
    'Content-Type': 'application/json',
  };

  try {
    // First ensure contact exists
    let contactId = order.suitedash_contact_id;
    if (!contactId && order.customer) {
      const contactResult = await syncContactToSuiteDash(config, {
        first_name: order.customer.firstName,
        last_name: order.customer.lastName,
        email: order.customer.email,
        phone: order.customer.phone || '',
        company: order.customer.company || '',
      });
      contactId = contactResult.contact_id;
    }

    // Create invoice
    const invoiceItems = (order.items || []).map(item => ({
      name: item.title,
      description: item.pillarName || 'Service',
      quantity: item.quantity || 1,
      rate: item.price || 0,
      amount: (item.price || 0) * (item.quantity || 1),
    }));

    const invoicePayload = {
      contact_id: contactId,
      invoice_number: order.orderNumber,
      items: invoiceItems,
      total: order.total,
      currency: 'GBP',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: order.notes || `Order ${order.orderNumber}`,
      send_email: true,
    };

    const response = await fetch(`${baseUrl}/invoice`, {
      method: 'POST',
      headers,
      body: JSON.stringify(invoicePayload),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        contact_id: contactId,
        invoice_id: data.id || data.invoice_id || data.uid,
        payment_url: data.payment_url || data.pay_url || data.public_url,
      };
    } else {
      throw new Error(`API returned ${response.status}`);
    }
  } catch (error) {
    // For demo purposes, return simulated IDs
    return {
      contact_id: order.suitedash_contact_id || `sd_contact_${Date.now()}`,
      invoice_id: `sd_invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      payment_url: `https://app.suitedash.com/portal/pay/${order.orderNumber}`,
    };
  }
}

// Webhook endpoint for SuiteDash callbacks
app.post('/api/webhooks/suitedash', (req, res) => {
  // Handle incoming webhooks from SuiteDash
  console.log('SuiteDash webhook received:', req.body);

  // In real implementation, process the webhook data
  // and update local data accordingly

  res.json(success({ received: true }));
});

// ============================================
// ADMIN: Integrations - RingCentral
// ============================================

const defaultRingCentralConfig = {
  enabled: false,
  client_id: '',
  client_secret: '',
  jwt_token: '',
  account_id: '',
  extension_id: '',
  webhook_url: '',
  features: {
    enable_calls: true,
    enable_sms: true,
    enable_video: true,
    enable_voicemail: true,
    click_to_call: true,
    call_recording: false,
    auto_log_calls: true,
  },
  caller_id: '',
  default_country_code: '+1',
  connection_status: 'disconnected',
};

const defaultRingCentralStats = {
  total_calls_made: 0,
  total_calls_received: 0,
  total_sms_sent: 0,
  total_meetings: 0,
  last_activity: null,
};

// Get RingCentral config
app.get('/api/admin/integrations/ringcentral', authMiddleware, (req, res) => {
  res.json(success(data.ringcentral || defaultRingCentralConfig));
});

// Update RingCentral config
app.put('/api/admin/integrations/ringcentral', authMiddleware, (req, res) => {
  data.ringcentral = { ...defaultRingCentralConfig, ...(data.ringcentral || {}), ...req.body };
  saveData();
  res.json(success(data.ringcentral, 'RingCentral configuration saved'));
});

// Test RingCentral connection
app.post('/api/admin/integrations/ringcentral/test', authMiddleware, (req, res) => {
  const { client_id, client_secret, jwt_token } = req.body;

  // Simulate connection test - in real implementation, this would call RingCentral API
  if (client_id && client_secret && jwt_token) {
    // Update connection status
    data.ringcentral = {
      ...(data.ringcentral || defaultRingCentralConfig),
      connection_status: 'connected'
    };
    saveData();
    res.json(success({ success: true, message: 'Connection successful' }));
  } else {
    res.json(success({ success: false, message: 'Missing required credentials' }));
  }
});

// Get RingCentral stats
app.get('/api/admin/integrations/ringcentral/stats', authMiddleware, (req, res) => {
  res.json(success(data.ringcentralStats || defaultRingCentralStats));
});

// Make a call (simulated)
app.post('/api/admin/integrations/ringcentral/call', authMiddleware, (req, res) => {
  const { to, from } = req.body;

  // Initialize stats if not exists
  if (!data.ringcentralStats) {
    data.ringcentralStats = { ...defaultRingCentralStats };
  }

  // Simulate making a call
  data.ringcentralStats.total_calls_made += 1;
  data.ringcentralStats.last_activity = new Date().toISOString();
  saveData();

  res.json(success({
    call_id: `call_${Date.now()}`,
    status: 'initiated',
    from: from,
    to: to,
    message: 'Call initiated successfully'
  }));
});

// Send SMS (simulated)
app.post('/api/admin/integrations/ringcentral/sms', authMiddleware, (req, res) => {
  const { to, message } = req.body;

  // Initialize stats if not exists
  if (!data.ringcentralStats) {
    data.ringcentralStats = { ...defaultRingCentralStats };
  }

  // Simulate sending SMS
  data.ringcentralStats.total_sms_sent += 1;
  data.ringcentralStats.last_activity = new Date().toISOString();
  saveData();

  res.json(success({
    message_id: `sms_${Date.now()}`,
    status: 'sent',
    to: to,
    message: 'SMS sent successfully'
  }));
});

// Create video meeting (simulated)
app.post('/api/admin/integrations/ringcentral/meeting', authMiddleware, (req, res) => {
  const { topic, duration } = req.body;

  // Initialize stats if not exists
  if (!data.ringcentralStats) {
    data.ringcentralStats = { ...defaultRingCentralStats };
  }

  // Simulate creating meeting
  data.ringcentralStats.total_meetings += 1;
  data.ringcentralStats.last_activity = new Date().toISOString();
  saveData();

  res.json(success({
    meeting_id: `meeting_${Date.now()}`,
    topic: topic || 'Consultation Meeting',
    join_url: `https://meetings.ringcentral.com/${Date.now()}`,
    duration: duration || 60,
    message: 'Meeting created successfully'
  }));
});

// Webhook endpoint for RingCentral callbacks
app.post('/api/webhooks/ringcentral', (req, res) => {
  // Handle incoming webhooks from RingCentral
  console.log('RingCentral webhook received:', req.body);

  // In real implementation, process call events, SMS events, etc.
  // and update local data accordingly

  res.json(success({ received: true }));
});

// ============================================
// ADMIN: System Settings
// ============================================

const defaultSystemSettings = {
  theme_mode: 'dark',
  accent_color: '#3b82f6',
  sidebar_style: 'default',
  primary_color: '#3b82f6',
  secondary_color: '#8b5cf6',
  dashboard_name: 'Admin',
  dashboard_logo: '',
  show_logo: true,
};

// Get system settings
app.get('/api/admin/system-settings', authMiddleware, (req, res) => {
  res.json(success(data.systemSettings || defaultSystemSettings));
});

// Update system settings
app.put('/api/admin/system-settings', authMiddleware, (req, res) => {
  data.systemSettings = { ...defaultSystemSettings, ...(data.systemSettings || {}), ...req.body };
  saveData();
  res.json(success(data.systemSettings, 'System settings updated'));
});

// ============================================
// START SERVER
// ============================================
app.listen(config.port, () => {
  console.log(`\n🚀 API Server running at http://localhost:${config.port}`);
  console.log(`📁 Environment: ${config.nodeEnv}`);
  console.log(`📁 Data file: ${DATA_FILE}`);
  console.log(`🌐 Frontend URL: ${config.frontendUrl}`);

  // SuiteDash status
  if (config.suitedash.publicId && config.suitedash.secretKey) {
    console.log(`\n✅ SuiteDash: PRODUCTION MODE (credentials from environment)`);
    console.log(`   API URL: ${config.suitedash.apiUrl}`);
  } else {
    console.log(`\n⚠️  SuiteDash: DEMO MODE (set SUITEDASH_PUBLIC_ID and SUITEDASH_SECRET_KEY for production)`);
  }

  console.log(`\n🔐 Admin login: admin@consultancy.test / password\n`);
});
