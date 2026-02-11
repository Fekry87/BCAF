import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@consultancy.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@consultancy.com',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      permissions: ['*'],
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create pillars
  const pillars = [
    {
      name: 'Strategic Advisory',
      slug: 'strategic-advisory',
      tagline: 'Navigate complex business challenges',
      description: 'Expert guidance for organizational growth, market expansion, and strategic planning.',
      sortOrder: 1,
      icon: 'compass',
    },
    {
      name: 'Education Support',
      slug: 'education-support',
      tagline: 'Transform learning outcomes',
      description: 'Comprehensive educational consulting for institutions and organizations.',
      sortOrder: 2,
      icon: 'book-open',
    },
    {
      name: 'Digital Transformation',
      slug: 'digital-transformation',
      tagline: 'Embrace the digital future',
      description: 'Technology strategy and implementation for modern businesses.',
      sortOrder: 3,
      icon: 'cpu',
    },
  ];

  for (const pillarData of pillars) {
    const pillar = await prisma.pillar.upsert({
      where: { slug: pillarData.slug },
      update: pillarData,
      create: pillarData,
    });
    console.log(`✅ Pillar created: ${pillar.name}`);

    // Create services for each pillar
    const services = getServicesForPillar(pillar.slug, pillar.id);
    for (const serviceData of services) {
      const service = await prisma.service.upsert({
        where: { slug: serviceData.slug },
        update: serviceData,
        create: serviceData,
      });
      console.log(`  ✅ Service created: ${service.title}`);
    }

    // Create FAQs for each pillar
    const faqs = getFAQsForPillar(pillar.slug, pillar.id);
    for (let i = 0; i < faqs.length; i++) {
      await prisma.faq.create({
        data: faqs[i],
      });
    }
    console.log(`  ✅ ${faqs.length} FAQs created for ${pillar.name}`);
  }

  // Create settings
  const settings = [
    {
      key: 'header',
      value: {
        logo: '/logo.svg',
        navigation: [
          { label: 'Home', href: '/' },
          { label: 'Services', href: '/services' },
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    },
    {
      key: 'footer',
      value: {
        copyright: `© ${new Date().getFullYear()} Consultancy Platform. All rights reserved.`,
        socialLinks: {
          linkedin: 'https://linkedin.com',
          twitter: 'https://twitter.com',
        },
      },
    },
    {
      key: 'site',
      value: {
        name: 'Consultancy Platform',
        tagline: 'Expert Guidance for Business Success',
        description: 'Professional consultancy services for strategic advisory, education support, and digital transformation.',
      },
    },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
    console.log(`✅ Setting created: ${setting.key}`);
  }

  console.log('✅ Database seed completed!');
}

function getServicesForPillar(slug, pillarId) {
  const services = {
    'strategic-advisory': [
      {
        pillarId,
        title: 'Business Strategy Development',
        slug: 'business-strategy-development',
        summary: 'Comprehensive strategic planning for sustainable growth.',
        type: 'ONE_OFF',
        priceFrom: 5000,
        priceLabel: 'From £5,000',
        sortOrder: 1,
        isFeatured: true,
      },
      {
        pillarId,
        title: 'Market Entry Analysis',
        slug: 'market-entry-analysis',
        summary: 'Research and strategy for entering new markets.',
        type: 'ONE_OFF',
        priceFrom: 3500,
        priceLabel: 'From £3,500',
        sortOrder: 2,
        isFeatured: false,
      },
      {
        pillarId,
        title: 'Executive Coaching',
        slug: 'executive-coaching',
        summary: 'One-on-one leadership development.',
        type: 'SUBSCRIPTION',
        priceFrom: 1500,
        priceLabel: '£1,500/month',
        sortOrder: 3,
        isFeatured: true,
      },
    ],
    'education-support': [
      {
        pillarId,
        title: 'Curriculum Review',
        slug: 'curriculum-review',
        summary: 'Comprehensive assessment and improvement recommendations.',
        type: 'ONE_OFF',
        priceFrom: 4000,
        priceLabel: 'From £4,000',
        sortOrder: 1,
        isFeatured: true,
      },
      {
        pillarId,
        title: 'Teacher Training Programs',
        slug: 'teacher-training',
        summary: 'Professional development for educators.',
        type: 'SUBSCRIPTION',
        priceFrom: 2000,
        priceLabel: '£2,000/term',
        sortOrder: 2,
        isFeatured: false,
      },
      {
        pillarId,
        title: 'Assessment Design',
        slug: 'assessment-design',
        summary: 'Create effective evaluation frameworks.',
        type: 'ONE_OFF',
        priceFrom: 2500,
        priceLabel: 'From £2,500',
        sortOrder: 3,
        isFeatured: true,
      },
    ],
    'digital-transformation': [
      {
        pillarId,
        title: 'Digital Strategy Roadmap',
        slug: 'digital-strategy-roadmap',
        summary: 'Plan your digital transformation journey.',
        type: 'ONE_OFF',
        priceFrom: 6000,
        priceLabel: 'From £6,000',
        sortOrder: 1,
        isFeatured: true,
      },
      {
        pillarId,
        title: 'Technology Assessment',
        slug: 'technology-assessment',
        summary: 'Evaluate your current tech stack and identify improvements.',
        type: 'ONE_OFF',
        priceFrom: 3000,
        priceLabel: 'From £3,000',
        sortOrder: 2,
        isFeatured: false,
      },
      {
        pillarId,
        title: 'Ongoing Tech Advisory',
        slug: 'tech-advisory',
        summary: 'Continuous guidance for technology decisions.',
        type: 'SUBSCRIPTION',
        priceFrom: 2500,
        priceLabel: '£2,500/month',
        sortOrder: 3,
        isFeatured: true,
      },
    ],
  };

  return services[slug] || [];
}

function getFAQsForPillar(slug, pillarId) {
  const faqs = {
    'strategic-advisory': [
      {
        pillarId,
        question: 'How long does a typical strategy engagement take?',
        answer: 'Most strategic advisory projects run between 4-12 weeks, depending on scope and complexity. We work with you to establish realistic timelines.',
        sortOrder: 1,
      },
      {
        pillarId,
        question: 'Do you work with small businesses?',
        answer: 'Yes! We work with organizations of all sizes. Our services are tailored to your specific needs and budget.',
        sortOrder: 2,
      },
    ],
    'education-support': [
      {
        pillarId,
        question: 'Can you work with both public and private institutions?',
        answer: 'Absolutely. We have experience working with state schools, academies, independent schools, and higher education institutions.',
        sortOrder: 1,
      },
      {
        pillarId,
        question: 'Do you provide ongoing support after initial engagement?',
        answer: 'Yes, we offer follow-up packages and subscription services to ensure sustainable implementation of recommendations.',
        sortOrder: 2,
      },
    ],
    'digital-transformation': [
      {
        pillarId,
        question: 'We have legacy systems. Can you still help?',
        answer: 'Definitely. We specialize in helping organizations modernize while respecting existing investments and minimizing disruption.',
        sortOrder: 1,
      },
      {
        pillarId,
        question: 'Do you implement solutions or just advise?',
        answer: 'We primarily provide strategic advice and project oversight, but we can recommend and work alongside implementation partners.',
        sortOrder: 2,
      },
    ],
  };

  return faqs[slug] || [];
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
