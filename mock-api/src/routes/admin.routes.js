import { Router } from 'express';
import prisma from '../config/database.js';
import { success, error, paginate } from '../utils/response.js';
import { validate, rules } from '../middleware/validate.middleware.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { sendOrderStatusUpdate } from '../services/email.service.js';
import logger from '../utils/logger.js';

const router = Router();

// All admin routes require authentication
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

// ============================================
// DASHBOARD
// ============================================

router.get('/dashboard/stats', async (req, res, next) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [contacts, users, orders, revenue] = await Promise.all([
      prisma.contact.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.user.groupBy({
        by: ['isActive'],
        _count: true,
      }),
      prisma.order.groupBy({
        by: ['status', 'paymentStatus'],
        _count: true,
      }),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true },
      }),
    ]);

    res.json(success({
      contacts: {
        total: contacts.reduce((sum, c) => sum + c._count, 0),
        new: contacts.find(c => c.status === 'NEW')?._count || 0,
      },
      users: {
        total: users.reduce((sum, u) => sum + u._count, 0),
        active: users.find(u => u.isActive)?._count || 0,
      },
      orders: {
        total: orders.reduce((sum, o) => sum + o._count, 0),
        pending: orders.filter(o => o.status === 'PENDING').reduce((sum, o) => sum + o._count, 0),
        completed: orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o._count, 0),
      },
      revenue: {
        total: parseFloat(revenue._sum.total) || 0,
      },
    }));
  } catch (err) {
    next(err);
  }
});

// ============================================
// CONTACTS
// ============================================

router.get('/contact-submissions', async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status.toUpperCase();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ]);

    const transformed = contacts.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      subject: c.subject,
      message: c.message,
      status: c.status.toLowerCase(),
      status_label: c.status.charAt(0) + c.status.slice(1).toLowerCase().replace('_', ' '),
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    }));

    res.json({
      success: true,
      data: transformed,
      meta: {
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total,
          last_page: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/contact-submissions/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const contact = await prisma.contact.update({
      where: { id: parseInt(req.params.id) },
      data: { status: status.toUpperCase() },
    });
    res.json(success(contact, 'Status updated'));
  } catch (err) {
    next(err);
  }
});

router.delete('/contact-submissions/:id', async (req, res, next) => {
  try {
    await prisma.contact.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json(success(null, 'Contact deleted'));
  } catch (err) {
    next(err);
  }
});

router.post('/contact-submissions/bulk-delete', async (req, res, next) => {
  try {
    const { ids } = req.body;
    const result = await prisma.contact.deleteMany({
      where: { id: { in: ids } },
    });
    res.json(success({ deleted: result.count }, `${result.count} contact(s) deleted`));
  } catch (err) {
    next(err);
  }
});

// ============================================
// USERS
// ============================================

router.get('/users', async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const transformed = users.map(u => ({
      id: u.id,
      firstName: u.name.split(' ')[0],
      lastName: u.name.split(' ').slice(1).join(' ') || '',
      email: u.email,
      role: u.role,
      status: u.isActive ? 'active' : 'inactive',
      orderCount: u._count.orders,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    }));

    res.json({
      success: true,
      data: transformed,
      meta: {
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total,
          last_page: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: status === 'active' },
    });
    res.json(success(user, 'User status updated'));
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    await prisma.user.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json(success(null, 'User deleted'));
  } catch (err) {
    next(err);
  }
});

router.post('/users/bulk-delete', async (req, res, next) => {
  try {
    const { ids } = req.body;
    const result = await prisma.user.deleteMany({
      where: { id: { in: ids } },
    });
    res.json(success({ deleted: result.count }, `${result.count} user(s) deleted`));
  } catch (err) {
    next(err);
  }
});

// ============================================
// ORDERS
// ============================================

router.get('/orders', async (req, res, next) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status.toUpperCase();
    if (paymentStatus) where.paymentStatus = paymentStatus.toUpperCase();
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: { include: { service: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const transformed = orders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: {
        firstName: o.customerName.split(' ')[0],
        lastName: o.customerName.split(' ').slice(1).join(' ') || '',
        email: o.customerEmail,
        phone: o.customerPhone,
      },
      items: o.items.map(i => ({
        id: i.id,
        service: i.service ? { id: i.service.id, title: i.service.title } : null,
        quantity: i.quantity,
        price: parseFloat(i.price),
        total: parseFloat(i.total),
      })),
      subtotal: parseFloat(o.subtotal),
      tax: parseFloat(o.tax),
      total: parseFloat(o.total),
      status: o.status.toLowerCase(),
      paymentStatus: o.paymentStatus.toLowerCase(),
      status_label: o.status.charAt(0) + o.status.slice(1).toLowerCase().replace('_', ' '),
      payment_status_label: o.paymentStatus.charAt(0) + o.paymentStatus.slice(1).toLowerCase(),
      createdAt: o.createdAt,
    }));

    res.json({
      success: true,
      data: transformed,
      meta: {
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total,
          last_page: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const oldOrder = await prisma.order.findUnique({ where: { id: parseInt(req.params.id) } });

    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status: status.toUpperCase() },
    });

    // Send status update email
    sendOrderStatusUpdate(order, oldOrder.status)
      .catch(err => logger.error('Order status email failed:', err));

    res.json(success(order, 'Order status updated'));
  } catch (err) {
    next(err);
  }
});

router.patch('/orders/:id/payment-status', async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { paymentStatus: paymentStatus.toUpperCase() },
    });
    res.json(success(order, 'Payment status updated'));
  } catch (err) {
    next(err);
  }
});

router.delete('/orders/:id', async (req, res, next) => {
  try {
    await prisma.order.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json(success(null, 'Order deleted'));
  } catch (err) {
    next(err);
  }
});

router.post('/orders/bulk-delete', async (req, res, next) => {
  try {
    const { ids } = req.body;
    const result = await prisma.order.deleteMany({
      where: { id: { in: ids } },
    });
    res.json(success({ deleted: result.count }, `${result.count} order(s) deleted`));
  } catch (err) {
    next(err);
  }
});

// ============================================
// PILLARS (Admin CRUD)
// ============================================

router.get('/pillars', async (req, res, next) => {
  try {
    const pillars = await prisma.pillar.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { services: true } } },
    });

    const transformed = pillars.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      tagline: p.tagline,
      description: p.description,
      sortOrder: p.sortOrder,
      isActive: p.isActive,
      servicesCount: p._count.services,
      createdAt: p.createdAt,
    }));

    res.json(success(transformed));
  } catch (err) {
    next(err);
  }
});

router.post('/pillars', rules.pillar, validate, async (req, res, next) => {
  try {
    const pillar = await prisma.pillar.create({ data: req.body });
    res.status(201).json(success(pillar, 'Pillar created'));
  } catch (err) {
    next(err);
  }
});

router.put('/pillars/:id', rules.pillar, validate, async (req, res, next) => {
  try {
    const pillar = await prisma.pillar.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(success(pillar, 'Pillar updated'));
  } catch (err) {
    next(err);
  }
});

router.delete('/pillars/:id', async (req, res, next) => {
  try {
    await prisma.pillar.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json(success(null, 'Pillar deleted'));
  } catch (err) {
    next(err);
  }
});

// ============================================
// SERVICES (Admin CRUD)
// ============================================

router.get('/services', async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: [{ pillarId: 'asc' }, { sortOrder: 'asc' }],
      include: { pillar: true },
    });

    const transformed = services.map(s => ({
      id: s.id,
      pillarId: s.pillarId,
      pillar: s.pillar ? { id: s.pillar.id, name: s.pillar.name } : null,
      title: s.title,
      slug: s.slug,
      summary: s.summary,
      details: s.details,
      type: s.type.toLowerCase(),
      priceFrom: s.priceFrom ? parseFloat(s.priceFrom) : null,
      priceLabel: s.priceLabel,
      sortOrder: s.sortOrder,
      isFeatured: s.isFeatured,
      isActive: s.isActive,
      createdAt: s.createdAt,
    }));

    res.json(success(transformed));
  } catch (err) {
    next(err);
  }
});

router.post('/services', rules.service, validate, async (req, res, next) => {
  try {
    const service = await prisma.service.create({ data: req.body });
    res.status(201).json(success(service, 'Service created'));
  } catch (err) {
    next(err);
  }
});

router.put('/services/:id', rules.service, validate, async (req, res, next) => {
  try {
    const service = await prisma.service.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(success(service, 'Service updated'));
  } catch (err) {
    next(err);
  }
});

router.delete('/services/:id', async (req, res, next) => {
  try {
    await prisma.service.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json(success(null, 'Service deleted'));
  } catch (err) {
    next(err);
  }
});

// ============================================
// FAQs (Admin CRUD)
// ============================================

router.get('/faqs', async (req, res, next) => {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { pillar: true },
    });

    const transformed = faqs.map(f => ({
      id: f.id,
      pillarId: f.pillarId,
      pillar: f.pillar ? { id: f.pillar.id, name: f.pillar.name } : null,
      question: f.question,
      answer: f.answer,
      sortOrder: f.sortOrder,
      isActive: f.isActive,
      createdAt: f.createdAt,
    }));

    res.json(success(transformed));
  } catch (err) {
    next(err);
  }
});

router.post('/faqs', rules.faq, validate, async (req, res, next) => {
  try {
    const faq = await prisma.faq.create({ data: req.body });
    res.status(201).json(success(faq, 'FAQ created'));
  } catch (err) {
    next(err);
  }
});

router.put('/faqs/:id', rules.faq, validate, async (req, res, next) => {
  try {
    const faq = await prisma.faq.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(success(faq, 'FAQ updated'));
  } catch (err) {
    next(err);
  }
});

router.delete('/faqs/:id', async (req, res, next) => {
  try {
    await prisma.faq.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json(success(null, 'FAQ deleted'));
  } catch (err) {
    next(err);
  }
});

export default router;
