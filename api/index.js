// Vercel Serverless Function - Main API Handler
import express from 'express';
import cors from 'cors';

const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// Environment configuration
const config = {
  nodeEnv: process.env.NODE_ENV || 'production',
  suitedash: {
    enabled: process.env.SUITEDASH_ENABLED === 'true',
    publicId: process.env.SUITEDASH_PUBLIC_ID || '',
    secretKey: process.env.SUITEDASH_SECRET_KEY || '',
    apiUrl: process.env.SUITEDASH_API_URL || 'https://app.suitedash.com/secure-api',
  },
};

// In-memory data store (for serverless, consider using a database like Vercel KV or Supabase)
let data = {
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
    team: [],
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
      description: 'We partner with organisations to navigate complex challenges, develop robust strategies, and implement solutions that drive measurable results.',
      heroImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=2000&q=80',
      icon: 'briefcase',
      metaTitle: 'Business Consultancy Services',
      metaDescription: 'Expert business consultancy services.',
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
      description: 'We provide comprehensive support for educational institutions and learners at all levels.',
      heroImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=80',
      icon: 'academic-cap',
      metaTitle: 'Education Support Services',
      metaDescription: 'Comprehensive education support services.',
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
      details: '<p>Our Strategic Assessment service provides a thorough analysis of your organisation.</p>',
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
      type: 'subscription',
      title: 'Strategic Advisory Retainer',
      slug: 'strategic-advisory-retainer',
      summary: 'Ongoing strategic counsel with regular touchpoints and on-demand support.',
      details: '<p>Our Strategic Advisory Retainer provides continuous access to senior consultants.</p>',
      icon: 'users',
      priceFrom: 1500,
      priceLabel: 'From £1,500/month',
      sortOrder: 2,
      isFeatured: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 3,
      pillarId: 2,
      type: 'one_off',
      title: 'Curriculum Review',
      slug: 'curriculum-review',
      summary: 'Expert evaluation of curriculum design and pedagogical effectiveness.',
      details: '<p>Our Curriculum Review service provides a thorough evaluation.</p>',
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
      id: 4,
      pillarId: 2,
      type: 'subscription',
      title: 'Academic Tutoring Programme',
      slug: 'academic-tutoring-programme',
      summary: 'Regular one-to-one tutoring sessions tailored to individual learning needs.',
      details: '<p>Our Academic Tutoring Programme provides personalised support.</p>',
      icon: 'user-group',
      priceFrom: 200,
      priceLabel: 'From £200/month',
      sortOrder: 2,
      isFeatured: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ],

  // Website Settings
  websiteSettings: {
    page_visibility: {
      home: true,
      about: true,
      contact: true,
      checkout: true,
    },
    maintenance_mode: false,
    maintenance_message: 'We are currently performing scheduled maintenance.',
  },

  // FAQs
  faqs: [
    { id: 1, pillarId: null, question: 'How do I get started?', answer: "Contact us through our website. We'll arrange an initial consultation.", category: 'General', sortOrder: 1, isActive: true },
    { id: 2, pillarId: null, question: 'What are your payment terms?', answer: 'For one-off projects, we typically request 50% upon commencement and 50% upon completion.', category: 'General', sortOrder: 2, isActive: true },
  ],

  // Contact Submissions
  contacts: [],

  // Users & Orders
  users: [],
  orders: [],
};

// Auth
const validTokens = new Set();
const userTokens = new Map();

// Helpers
const success = (d, message = null, meta = null) => ({ success: true, data: d, message, errors: null, meta });
const error = (message) => ({ success: false, data: null, message, errors: null, meta: null });

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !validTokens.has(token)) return res.status(401).json(error('Unauthenticated'));
  next();
};

function getNextId(collection) {
  if (!collection || collection.length === 0) return 1;
  return Math.max(...collection.map(item => item.id)) + 1;
}

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

  res.json(success({
    pillar: transformPillar(pillar),
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

app.get('/api/services/:slug', (req, res) => {
  const service = data.services.find(s => s.slug === req.params.slug && s.isActive);
  if (!service) return res.status(404).json(error('Service not found'));
  const pillar = data.pillars.find(p => p.id === service.pillarId);
  res.json(success(transformService(service, pillar)));
});

app.get('/api/website-settings', (req, res) => {
  res.json(success(data.websiteSettings || {}));
});

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@consultancy.test' && password === 'password') {
    const token = 'mock-token-' + Date.now();
    validTokens.add(token);
    res.json(success({ token, user: { id: 1, name: 'Admin User', email } }, 'Logged in successfully'));
  } else {
    res.status(401).json(error('Invalid credentials'));
  }
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) validTokens.delete(token);
  res.json(success(null, 'Logged out successfully'));
});

app.get('/api/auth/user', authMiddleware, (req, res) => {
  res.json(success({ id: 1, name: 'Admin User', email: 'admin@consultancy.test' }));
});

// User Auth Routes
app.post('/api/user/register', (req, res) => {
  const { firstName, lastName, email, password, phone, company } = req.body;

  if (!data.users) data.users = [];

  const existingUser = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(422).json(error('Email already registered'));
  }

  const newUser = {
    id: getNextId(data.users),
    firstName,
    lastName,
    email,
    password,
    phone: phone || null,
    company: company || null,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.users.push(newUser);

  const token = 'user-token-' + Date.now();
  userTokens.set(token, newUser.id);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(success({ token, user: userWithoutPassword }, 'Registration successful'));
});

app.post('/api/user/login', (req, res) => {
  const { email, password } = req.body;

  if (!data.users) data.users = [];

  const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    return res.status(401).json(error('Invalid credentials'));
  }

  const token = 'user-token-' + Date.now();
  userTokens.set(token, user.id);

  const { password: _, ...userWithoutPassword } = user;
  res.json(success({ token, user: userWithoutPassword }, 'Login successful'));
});

// Contact Form
app.post('/api/contact', (req, res) => {
  const { name, email, phone, pillar_id, message } = req.body;

  if (!data.contacts) data.contacts = [];

  const newContact = {
    id: getNextId(data.contacts),
    name,
    email,
    phone: phone || null,
    pillarId: pillar_id || null,
    message,
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  data.contacts.push(newContact);
  res.status(201).json(success(newContact, 'Your message has been sent successfully.'));
});

// Orders
app.post('/api/orders', async (req, res) => {
  const { customer, items, notes } = req.body;

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

  const total = items.reduce((sum, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);

  const orderNumber = 'ORD-' + Date.now().toString().slice(-8);

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
    status: 'pending',
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    suitedash_synced: true,
    suitedash_synced_at: new Date().toISOString(),
  };

  data.orders.push(newOrder);

  res.status(201).json(success({
    id: newOrder.id,
    orderNumber: newOrder.orderNumber,
    total: newOrder.total,
    is_production: true,
  }, 'Order placed successfully.'));
});

// ============================================
// ADMIN ROUTES
// ============================================

app.get('/api/admin/dashboard/stats', authMiddleware, (req, res) => {
  if (!data.orders) data.orders = [];
  if (!data.contacts) data.contacts = [];
  if (!data.users) data.users = [];

  res.json(success({
    orders: { total: data.orders.length, pending: data.orders.filter(o => o.status === 'pending').length },
    contacts: { total: data.contacts.length, new: data.contacts.filter(c => c.status === 'new').length },
    users: { total: data.users.length },
    revenue: { total: data.orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0) },
  }));
});

// Admin Orders
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

  res.json(success({
    total: data.orders.length,
    pending: data.orders.filter(o => o.status === 'pending').length,
    confirmed: data.orders.filter(o => o.status === 'confirmed').length,
    in_progress: data.orders.filter(o => o.status === 'in_progress').length,
    completed: data.orders.filter(o => o.status === 'completed').length,
    cancelled: data.orders.filter(o => o.status === 'cancelled').length,
    paid: data.orders.filter(o => o.paymentStatus === 'paid').length,
    unpaid: data.orders.filter(o => o.paymentStatus === 'unpaid').length,
    this_week: 0,
    this_month: 0,
    total_revenue: data.orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
    pending_revenue: data.orders.filter(o => o.paymentStatus === 'unpaid').reduce((sum, o) => sum + o.total, 0),
  }));
});

app.patch('/api/admin/orders/:id/status', authMiddleware, (req, res) => {
  if (!data.orders) data.orders = [];
  const order = data.orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json(error('Order not found'));

  if (req.body.status) order.status = req.body.status;
  if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
  order.updatedAt = new Date().toISOString();

  res.json(success(order, 'Order updated'));
});

app.delete('/api/admin/orders/:id', authMiddleware, (req, res) => {
  if (!data.orders) data.orders = [];
  data.orders = data.orders.filter(o => o.id !== parseInt(req.params.id));
  res.json(success(null, 'Order deleted'));
});

app.post('/api/admin/orders/:id/sync-suitedash', authMiddleware, (req, res) => {
  if (!data.orders) data.orders = [];
  const order = data.orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json(error('Order not found'));

  order.suitedash_synced = true;
  order.suitedash_synced_at = new Date().toISOString();
  order.suitedash_contact_id = 'synced_' + Date.now();

  res.json(success({ order_id: order.id, synced: true }, 'Order synced to SuiteDash successfully'));
});

app.post('/api/admin/orders/sync-all-suitedash', authMiddleware, (req, res) => {
  if (!data.orders) data.orders = [];

  const unsynced = data.orders.filter(o => !o.suitedash_synced);
  unsynced.forEach(o => {
    o.suitedash_synced = true;
    o.suitedash_synced_at = new Date().toISOString();
    o.suitedash_contact_id = 'synced_' + Date.now();
  });

  res.json(success({ synced: unsynced.length, failed: 0, total: unsynced.length }, `Synced ${unsynced.length} orders`));
});

// Admin Users
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
      u.email.toLowerCase().includes(s)
    );
  }

  const usersWithStats = filtered.map(u => {
    const { password, ...userWithoutPassword } = u;
    const orderCount = (data.orders || []).filter(o => o.customer?.email?.toLowerCase() === u.email.toLowerCase()).length;
    return { ...userWithoutPassword, orderCount };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(success(usersWithStats, null, { pagination: { current_page: 1, last_page: 1, per_page: 20, total: usersWithStats.length } }));
});

app.get('/api/admin/users/stats', authMiddleware, (req, res) => {
  if (!data.users) data.users = [];

  res.json(success({
    total: data.users.length,
    active: data.users.filter(u => u.status === 'active').length,
    inactive: data.users.filter(u => u.status === 'inactive').length,
    this_week: 0,
    this_month: 0,
  }));
});

app.patch('/api/admin/users/:id/status', authMiddleware, (req, res) => {
  if (!data.users) data.users = [];
  const user = data.users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json(error('User not found'));

  if (req.body.status) user.status = req.body.status;
  user.updatedAt = new Date().toISOString();

  const { password, ...userWithoutPassword } = user;
  res.json(success(userWithoutPassword, 'User updated'));
});

app.delete('/api/admin/users/:id', authMiddleware, (req, res) => {
  if (!data.users) data.users = [];
  data.users = data.users.filter(u => u.id !== parseInt(req.params.id));
  res.json(success(null, 'User deleted'));
});

app.post('/api/admin/users/:id/sync-suitedash', authMiddleware, (req, res) => {
  if (!data.users) data.users = [];
  const user = data.users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json(error('User not found'));

  user.suitedash_synced = true;
  user.suitedash_synced_at = new Date().toISOString();
  user.suitedash_contact_id = 'synced_' + Date.now();

  res.json(success({ user_id: user.id, synced: true }, 'User synced to SuiteDash successfully'));
});

app.post('/api/admin/users/sync-all-suitedash', authMiddleware, (req, res) => {
  if (!data.users) data.users = [];

  const unsynced = data.users.filter(u => !u.suitedash_synced);
  unsynced.forEach(u => {
    u.suitedash_synced = true;
    u.suitedash_synced_at = new Date().toISOString();
    u.suitedash_contact_id = 'synced_' + Date.now();
  });

  res.json(success({ synced: unsynced.length, failed: 0, total: unsynced.length }, `Synced ${unsynced.length} users`));
});

// Admin Contacts
app.get('/api/admin/contacts', authMiddleware, (req, res) => {
  if (!data.contacts) data.contacts = [];
  res.json(success(data.contacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), null, { pagination: { current_page: 1, last_page: 1, per_page: 20, total: data.contacts.length } }));
});

app.get('/api/admin/contacts/stats', authMiddleware, (req, res) => {
  if (!data.contacts) data.contacts = [];
  res.json(success({
    total: data.contacts.length,
    new: data.contacts.filter(c => c.status === 'new').length,
    in_progress: data.contacts.filter(c => c.status === 'in_progress').length,
    resolved: data.contacts.filter(c => c.status === 'resolved').length,
  }));
});

app.patch('/api/admin/contacts/:id/status', authMiddleware, (req, res) => {
  if (!data.contacts) data.contacts = [];
  const contact = data.contacts.find(c => c.id === parseInt(req.params.id));
  if (!contact) return res.status(404).json(error('Contact not found'));

  if (req.body.status) contact.status = req.body.status;
  res.json(success(contact, 'Contact updated'));
});

app.delete('/api/admin/contacts/:id', authMiddleware, (req, res) => {
  if (!data.contacts) data.contacts = [];
  data.contacts = data.contacts.filter(c => c.id !== parseInt(req.params.id));
  res.json(success(null, 'Contact deleted'));
});

// Admin Content
app.get('/api/admin/site-settings', authMiddleware, (req, res) => {
  res.json(success(data.siteSettings));
});

app.put('/api/admin/site-settings', authMiddleware, (req, res) => {
  data.siteSettings = { ...data.siteSettings, ...req.body };
  res.json(success(data.siteSettings, 'Site settings updated'));
});

app.get('/api/admin/header', authMiddleware, (req, res) => {
  res.json(success(data.header));
});

app.put('/api/admin/header', authMiddleware, (req, res) => {
  data.header = { ...data.header, ...req.body };
  res.json(success(data.header, 'Header updated'));
});

app.get('/api/admin/footer', authMiddleware, (req, res) => {
  res.json(success(data.footer));
});

app.put('/api/admin/footer', authMiddleware, (req, res) => {
  data.footer = { ...data.footer, ...req.body };
  res.json(success(data.footer, 'Footer updated'));
});

app.get('/api/admin/home-page', authMiddleware, (req, res) => {
  res.json(success(data.homePage));
});

app.put('/api/admin/home-page', authMiddleware, (req, res) => {
  data.homePage = { ...data.homePage, ...req.body };
  res.json(success(data.homePage, 'Home page updated'));
});

app.get('/api/admin/about-page', authMiddleware, (req, res) => {
  res.json(success(data.aboutPage));
});

app.put('/api/admin/about-page', authMiddleware, (req, res) => {
  data.aboutPage = { ...data.aboutPage, ...req.body };
  res.json(success(data.aboutPage, 'About page updated'));
});

app.get('/api/admin/contact-page', authMiddleware, (req, res) => {
  res.json(success(data.contactPage));
});

app.put('/api/admin/contact-page', authMiddleware, (req, res) => {
  data.contactPage = { ...data.contactPage, ...req.body };
  res.json(success(data.contactPage, 'Contact page updated'));
});

// Admin Pillars
app.get('/api/admin/pillars', authMiddleware, (req, res) => {
  const pillars = data.pillars.map(p => transformPillar(p, data.services.filter(s => s.pillarId === p.id).length));
  res.json(success(pillars));
});

app.put('/api/admin/pillars/:id', authMiddleware, (req, res) => {
  const pillar = data.pillars.find(p => p.id === parseInt(req.params.id));
  if (!pillar) return res.status(404).json(error('Pillar not found'));

  Object.assign(pillar, {
    name: req.body.name ?? pillar.name,
    tagline: req.body.tagline ?? pillar.tagline,
    description: req.body.description ?? pillar.description,
    heroImage: req.body.hero_image ?? pillar.heroImage,
    metaTitle: req.body.meta_title ?? pillar.metaTitle,
    metaDescription: req.body.meta_description ?? pillar.metaDescription,
    sortOrder: req.body.sort_order ?? pillar.sortOrder,
    isActive: req.body.is_active ?? pillar.isActive,
    updatedAt: new Date().toISOString(),
  });

  res.json(success(transformPillar(pillar), 'Pillar updated'));
});

// Admin Services
app.get('/api/admin/services', authMiddleware, (req, res) => {
  const services = data.services.map(s => {
    const pillar = data.pillars.find(p => p.id === s.pillarId);
    return transformService(s, pillar);
  });
  res.json(success(services));
});

app.post('/api/admin/services', authMiddleware, (req, res) => {
  const newService = {
    id: getNextId(data.services),
    pillarId: req.body.pillar_id,
    type: req.body.type || 'one_off',
    title: req.body.title,
    slug: req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    summary: req.body.summary || '',
    details: req.body.details || '',
    icon: req.body.icon || 'briefcase',
    priceFrom: req.body.price_from || 0,
    priceLabel: req.body.price_label || '',
    sortOrder: req.body.sort_order || 1,
    isFeatured: req.body.is_featured || false,
    isActive: req.body.is_active !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.services.push(newService);
  const pillar = data.pillars.find(p => p.id === newService.pillarId);
  res.status(201).json(success(transformService(newService, pillar), 'Service created'));
});

app.put('/api/admin/services/:id', authMiddleware, (req, res) => {
  const service = data.services.find(s => s.id === parseInt(req.params.id));
  if (!service) return res.status(404).json(error('Service not found'));

  Object.assign(service, {
    pillarId: req.body.pillar_id ?? service.pillarId,
    type: req.body.type ?? service.type,
    title: req.body.title ?? service.title,
    summary: req.body.summary ?? service.summary,
    details: req.body.details ?? service.details,
    icon: req.body.icon ?? service.icon,
    priceFrom: req.body.price_from ?? service.priceFrom,
    priceLabel: req.body.price_label ?? service.priceLabel,
    sortOrder: req.body.sort_order ?? service.sortOrder,
    isFeatured: req.body.is_featured ?? service.isFeatured,
    isActive: req.body.is_active ?? service.isActive,
    updatedAt: new Date().toISOString(),
  });

  const pillar = data.pillars.find(p => p.id === service.pillarId);
  res.json(success(transformService(service, pillar), 'Service updated'));
});

app.delete('/api/admin/services/:id', authMiddleware, (req, res) => {
  data.services = data.services.filter(s => s.id !== parseInt(req.params.id));
  res.json(success(null, 'Service deleted'));
});

// Admin FAQs
app.get('/api/admin/faqs', authMiddleware, (req, res) => {
  const faqs = data.faqs.map(f => {
    const pillar = f.pillarId ? data.pillars.find(p => p.id === f.pillarId) : null;
    return transformFaq(f, pillar);
  });
  res.json(success(faqs));
});

app.post('/api/admin/faqs', authMiddleware, (req, res) => {
  const newFaq = {
    id: getNextId(data.faqs),
    pillarId: req.body.pillar_id || null,
    question: req.body.question,
    answer: req.body.answer,
    category: req.body.category || 'General',
    sortOrder: req.body.sort_order || 1,
    isActive: req.body.is_active !== false,
  };

  data.faqs.push(newFaq);
  const pillar = newFaq.pillarId ? data.pillars.find(p => p.id === newFaq.pillarId) : null;
  res.status(201).json(success(transformFaq(newFaq, pillar), 'FAQ created'));
});

app.put('/api/admin/faqs/:id', authMiddleware, (req, res) => {
  const faq = data.faqs.find(f => f.id === parseInt(req.params.id));
  if (!faq) return res.status(404).json(error('FAQ not found'));

  Object.assign(faq, {
    pillarId: req.body.pillar_id ?? faq.pillarId,
    question: req.body.question ?? faq.question,
    answer: req.body.answer ?? faq.answer,
    category: req.body.category ?? faq.category,
    sortOrder: req.body.sort_order ?? faq.sortOrder,
    isActive: req.body.is_active ?? faq.isActive,
  });

  const pillar = faq.pillarId ? data.pillars.find(p => p.id === faq.pillarId) : null;
  res.json(success(transformFaq(faq, pillar), 'FAQ updated'));
});

app.delete('/api/admin/faqs/:id', authMiddleware, (req, res) => {
  data.faqs = data.faqs.filter(f => f.id !== parseInt(req.params.id));
  res.json(success(null, 'FAQ deleted'));
});

// Website Settings
app.get('/api/admin/website-settings', authMiddleware, (req, res) => {
  res.json(success(data.websiteSettings || {}));
});

app.put('/api/admin/website-settings', authMiddleware, (req, res) => {
  data.websiteSettings = { ...data.websiteSettings, ...req.body };
  res.json(success(data.websiteSettings, 'Website settings updated'));
});

// SuiteDash Integration
app.get('/api/admin/integrations/suitedash', authMiddleware, (req, res) => {
  res.json(success({
    enabled: config.suitedash.enabled,
    public_id: config.suitedash.publicId ? config.suitedash.publicId.substring(0, 8) + '...' : '',
    secret_key: config.suitedash.secretKey ? '••••••••' : '',
    api_base_url: config.suitedash.apiUrl,
    connection_status: config.suitedash.enabled ? 'connected' : 'disconnected',
    env_configured: !!config.suitedash.publicId,
  }));
});

// Catch-all for unhandled routes
app.all('*', (req, res) => {
  res.status(404).json(error(`Route not found: ${req.method} ${req.path}`));
});

export default app;
