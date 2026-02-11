import { Router } from 'express';
import prisma from '../config/database.js';
import { success, error, paginate } from '../utils/response.js';
import { validate, rules } from '../middleware/validate.middleware.js';
import { sendContactNotification, sendContactConfirmation, sendOrderConfirmation } from '../services/email.service.js';
import { createCheckoutSession } from '../services/stripe.service.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import config from '../config/env.js';

const router = Router();

// ============================================
// PILLARS
// ============================================

router.get('/pillars', async (req, res, next) => {
  try {
    const pillars = await prisma.pillar.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { services: { where: { isActive: true } } } },
      },
    });

    const transformed = pillars.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      tagline: p.tagline,
      description: p.description,
      hero_image: p.heroImage,
      card_image: p.cardImage,
      icon: p.icon,
      meta_title: p.metaTitle,
      meta_description: p.metaDescription,
      sort_order: p.sortOrder,
      is_active: p.isActive,
      services_count: p._count.services,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
    }));

    res.json(success(transformed));
  } catch (err) {
    next(err);
  }
});

router.get('/pillars/:slug', async (req, res, next) => {
  try {
    const pillar = await prisma.pillar.findUnique({
      where: { slug: req.params.slug },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        faqs: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!pillar || !pillar.isActive) {
      return res.status(404).json(error('Pillar not found'));
    }

    const transformed = {
      id: pillar.id,
      name: pillar.name,
      slug: pillar.slug,
      tagline: pillar.tagline,
      description: pillar.description,
      hero_image: pillar.heroImage,
      card_image: pillar.cardImage,
      icon: pillar.icon,
      meta_title: pillar.metaTitle,
      meta_description: pillar.metaDescription,
      services: pillar.services.map(s => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        summary: s.summary,
        details: s.details,
        icon: s.icon,
        type: s.type.toLowerCase(),
        price_from: s.priceFrom ? parseFloat(s.priceFrom) : null,
        price_label: s.priceLabel,
        is_featured: s.isFeatured,
      })),
      faqs: pillar.faqs.map(f => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
      })),
    };

    res.json(success(transformed));
  } catch (err) {
    next(err);
  }
});

// ============================================
// SERVICES
// ============================================

router.get('/services', async (req, res, next) => {
  try {
    const { featured, pillar } = req.query;

    const where = { isActive: true };
    if (featured === 'true') where.isFeatured = true;
    if (pillar) {
      const pillarRecord = await prisma.pillar.findUnique({ where: { slug: pillar } });
      if (pillarRecord) where.pillarId = pillarRecord.id;
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: { pillar: true },
    });

    const transformed = services.map(s => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      summary: s.summary,
      details: s.details,
      icon: s.icon,
      type: s.type.toLowerCase(),
      price_from: s.priceFrom ? parseFloat(s.priceFrom) : null,
      price_label: s.priceLabel,
      is_featured: s.isFeatured,
      pillar: s.pillar ? {
        id: s.pillar.id,
        name: s.pillar.name,
        slug: s.pillar.slug,
      } : null,
    }));

    res.json(success(transformed));
  } catch (err) {
    next(err);
  }
});

router.get('/services/:slug', async (req, res, next) => {
  try {
    const service = await prisma.service.findUnique({
      where: { slug: req.params.slug },
      include: { pillar: true },
    });

    if (!service || !service.isActive) {
      return res.status(404).json(error('Service not found'));
    }

    const transformed = {
      id: service.id,
      title: service.title,
      slug: service.slug,
      summary: service.summary,
      details: service.details,
      icon: service.icon,
      type: service.type.toLowerCase(),
      price_from: service.priceFrom ? parseFloat(service.priceFrom) : null,
      price_label: service.priceLabel,
      is_featured: service.isFeatured,
      pillar: service.pillar ? {
        id: service.pillar.id,
        name: service.pillar.name,
        slug: service.pillar.slug,
      } : null,
    };

    res.json(success(transformed));
  } catch (err) {
    next(err);
  }
});

// ============================================
// FAQS
// ============================================

router.get('/faqs', async (req, res, next) => {
  try {
    const { pillar } = req.query;

    const where = { isActive: true };
    if (pillar) {
      const pillarRecord = await prisma.pillar.findUnique({ where: { slug: pillar } });
      if (pillarRecord) where.pillarId = pillarRecord.id;
    }

    const faqs = await prisma.faq.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: { pillar: true },
    });

    const transformed = faqs.map(f => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      pillar: f.pillar ? { id: f.pillar.id, name: f.pillar.name, slug: f.pillar.slug } : null,
    }));

    res.json(success(transformed));
  } catch (err) {
    next(err);
  }
});

// ============================================
// CONTACT FORM
// ============================================

router.post('/contact', rules.contact, validate, async (req, res, next) => {
  try {
    const { name, email, phone, message, pillarId, subject } = req.body;

    const contact = await prisma.contact.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        phone: phone?.trim() || null,
        subject: subject?.trim() || null,
        message: message.trim(),
        pillarId: pillarId || null,
      },
    });

    // Send emails (non-blocking)
    sendContactNotification(contact).catch(err => logger.error('Admin notification failed:', err));
    sendContactConfirmation(contact).catch(err => logger.error('Confirmation email failed:', err));

    res.status(201).json(success({ id: contact.id }, 'Message sent successfully'));
  } catch (err) {
    next(err);
  }
});

// ============================================
// ORDERS
// ============================================

router.post('/orders', rules.createOrder, validate, async (req, res, next) => {
  try {
    const { customerName, customerEmail, customerPhone, items, notes } = req.body;

    // Fetch services and calculate totals
    const serviceIds = items.map(i => i.serviceId);
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds }, isActive: true },
    });

    if (services.length !== serviceIds.length) {
      return res.status(400).json(error('One or more services not found'));
    }

    const serviceMap = new Map(services.map(s => [s.id, s]));
    let subtotal = 0;

    const orderItems = items.map(item => {
      const service = serviceMap.get(item.serviceId);
      const quantity = item.quantity || 1;
      const price = parseFloat(service.priceFrom) || 0;
      const total = price * quantity;
      subtotal += total;

      return {
        serviceId: item.serviceId,
        quantity,
        price,
        total,
      };
    });

    const tax = subtotal * 0.2; // 20% VAT
    const total = subtotal + tax;

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customerName.trim(),
        customerEmail: customerEmail.toLowerCase(),
        customerPhone: customerPhone?.trim() || null,
        subtotal,
        tax,
        total,
        notes: notes?.trim() || null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: { service: true },
        },
      },
    });

    // Create Stripe checkout session
    const checkoutSession = await createCheckoutSession(
      order,
      `${config.corsOrigin}/checkout/success`,
      `${config.corsOrigin}/checkout/cancel`
    );

    // Update order with payment URL
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentUrl: checkoutSession.url },
    });

    // Send confirmation email (non-blocking)
    sendOrderConfirmation({ ...order, paymentUrl: checkoutSession.url })
      .catch(err => logger.error('Order confirmation email failed:', err));

    res.status(201).json(success({
      orderNumber: order.orderNumber,
      total: order.total,
      paymentUrl: checkoutSession.url,
    }, 'Order created successfully'));
  } catch (err) {
    next(err);
  }
});

// ============================================
// CONTENT (Header, Footer, etc.)
// ============================================

router.get('/content/:key', async (req, res, next) => {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: req.params.key },
    });

    if (!setting) {
      // Return default content
      const defaults = {
        header: { logo: '/logo.svg', navigation: [] },
        footer: { copyright: `© ${new Date().getFullYear()} Consultancy Platform` },
      };
      return res.json(success(defaults[req.params.key] || {}));
    }

    res.json(success(setting.value));
  } catch (err) {
    next(err);
  }
});

export default router;
