<?php

namespace Database\Seeders;

use App\Models\ContactSubmission;
use App\Models\Faq;
use App\Models\IntegrationSetting;
use App\Models\Pillar;
use App\Models\Service;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedUsers();
        $this->seedSiteSettings();
        $this->seedPillars();
        $this->seedServices();
        $this->seedFaqs();
        $this->seedContactSubmissions();
        $this->seedIntegrationSettings();
    }

    private function seedUsers(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@consultancy.test',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'is_active' => true,
        ]);
    }

    private function seedSiteSettings(): void
    {
        // Header settings
        SiteSetting::setGroup('header', [
            'logo_text' => 'Consultancy',
            'logo_image' => null,
        ]);

        // Theme settings (defaults)
        SiteSetting::setGroup('theme', [
            'primary_900' => '#0d2240',
            'primary_800' => '#133a6b',
            'primary_700' => '#1a4f8c',
            'primary_600' => '#2563a8',
            'primary_500' => '#3b82c4',
            'primary_400' => '#60a5e0',
            'primary_100' => '#e8f2fc',
            'primary_50' => '#f4f9fe',
            'accent_yellow' => '#f4c430',
            'accent_yellow_light' => '#fef9e7',
            'cta_primary_bg' => '#f4c430',
            'cta_primary_text' => '#0d2240',
            'cta_primary_hover' => '#e6b62d',
            'font_heading' => '"Source Serif 4", Georgia, serif',
            'font_body' => 'Inter, -apple-system, sans-serif',
            'border_radius' => '8px',
        ]);

        // Footer settings
        SiteSetting::setGroup('footer', [
            'company_name' => 'Consultancy',
            'description' => 'Strategic guidance for meaningful growth.',
            'copyright_text' => '© ' . date('Y') . ' Consultancy. All rights reserved.',
        ]);

        // Home page settings
        SiteSetting::setValue('home', 'hero', [
            'title' => 'Strategic guidance for meaningful growth',
            'subtitle' => 'We partner with organisations and individuals to navigate complexity, develop robust strategies, and achieve lasting success through evidence-based approaches.',
            'cta_text' => 'Get in touch',
            'cta_link' => '/contact',
            'secondary_cta_text' => 'Learn more',
            'secondary_cta_link' => '/about',
            'background_image' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80',
        ], 'json');

        SiteSetting::setValue('home', 'pillars_section', [
            'title' => 'Our Expertise',
            'subtitle' => 'Two distinct pillars of service, united by a commitment to excellence and evidence-based practice.',
        ], 'json');

        SiteSetting::setValue('home', 'faq_section', [
            'title' => 'Frequently Asked Questions',
            'subtitle' => 'Find answers to common questions about our services.',
            'show_on_home' => true,
            'limit' => 6,
        ], 'json');

        SiteSetting::setValue('home', 'cta_section', [
            'title' => 'Ready to begin?',
            'subtitle' => 'Contact us today to discuss how we can support your goals and help you achieve meaningful, sustainable outcomes.',
            'button_text' => 'Contact us',
            'button_link' => '/contact',
        ], 'json');
    }

    private function seedPillars(): void
    {
        Pillar::create([
            'name' => 'Business Consultancy',
            'slug' => 'business-consultancy',
            'tagline' => 'Strategic guidance for sustainable growth',
            'description' => 'We partner with organisations to navigate complex challenges, develop robust strategies, and implement solutions that drive measurable results. Our evidence-based approach combines academic rigour with practical expertise.',
            'icon' => 'briefcase',
            'sort_order' => 1,
            'is_active' => true,
            'meta_title' => 'Business Consultancy Services | Strategic Growth Solutions',
            'meta_description' => 'Expert business consultancy services combining academic rigour with practical expertise. Strategy development, operational improvement, and change management.',
        ]);

        Pillar::create([
            'name' => 'Education Support',
            'slug' => 'education-support',
            'tagline' => 'Empowering academic excellence',
            'description' => 'We provide comprehensive support for educational institutions and learners at all levels. From curriculum development to individual tutoring, our services are designed to foster genuine understanding and lasting achievement.',
            'icon' => 'academic-cap',
            'sort_order' => 2,
            'is_active' => true,
            'meta_title' => 'Education Support Services | Academic Excellence',
            'meta_description' => 'Comprehensive education support services for institutions and learners. Curriculum development, tutoring, and academic consulting.',
        ]);
    }

    private function seedServices(): void
    {
        $businessPillar = Pillar::where('slug', 'business-consultancy')->first();
        $educationPillar = Pillar::where('slug', 'education-support')->first();

        // Business Consultancy - One-off Services
        $businessOneOff = [
            [
                'title' => 'Strategic Assessment',
                'slug' => 'strategic-assessment',
                'summary' => 'A comprehensive evaluation of your current position, market dynamics, and strategic options.',
                'details' => '<p>Our Strategic Assessment service provides a thorough analysis of your organisation\'s current state and future potential. We examine:</p><ul><li>Market positioning and competitive landscape</li><li>Organisational capabilities and resources</li><li>Financial performance and projections</li><li>Stakeholder expectations and governance</li></ul><p>You receive a detailed report with actionable recommendations and a prioritised roadmap for implementation.</p>',
                'icon' => 'chart-bar',
                'price_label' => 'From £2,500',
                'sort_order' => 1,
            ],
            [
                'title' => 'Process Optimisation Review',
                'slug' => 'process-optimisation-review',
                'summary' => 'Identify inefficiencies and opportunities for improvement across your key business processes.',
                'details' => '<p>We conduct a systematic review of your operational processes to identify bottlenecks, redundancies, and improvement opportunities.</p><p>Our methodology combines quantitative analysis with stakeholder interviews to ensure recommendations are both data-driven and practically implementable.</p><p>Deliverables include process maps, improvement recommendations, and an implementation guide.</p>',
                'icon' => 'cog',
                'price_label' => 'From £1,800',
                'sort_order' => 2,
            ],
            [
                'title' => 'Market Entry Analysis',
                'slug' => 'market-entry-analysis',
                'summary' => 'Research-backed insights to inform your expansion into new markets or segments.',
                'details' => '<p>Entering new markets requires careful analysis and planning. Our Market Entry Analysis provides:</p><ul><li>Market size and growth potential assessment</li><li>Competitive landscape mapping</li><li>Regulatory and compliance considerations</li><li>Entry strategy options and recommendations</li><li>Risk assessment and mitigation strategies</li></ul>',
                'icon' => 'globe',
                'price_label' => 'From £3,000',
                'sort_order' => 3,
            ],
        ];

        foreach ($businessOneOff as $service) {
            Service::create([
                'pillar_id' => $businessPillar->id,
                'type' => 'one_off',
                ...$service,
                'is_active' => true,
            ]);
        }

        // Business Consultancy - Subscription Services
        $businessSubscription = [
            [
                'title' => 'Strategic Advisory Retainer',
                'slug' => 'strategic-advisory-retainer',
                'summary' => 'Ongoing strategic counsel with regular touchpoints and on-demand support.',
                'details' => '<p>Our Strategic Advisory Retainer provides continuous access to senior consultants who understand your business context.</p><p>Includes:</p><ul><li>Monthly strategy sessions</li><li>Quarterly business reviews</li><li>Priority email and phone support</li><li>Access to research and market intelligence</li></ul>',
                'icon' => 'users',
                'price_label' => 'From £1,500/month',
                'sort_order' => 1,
                'is_featured' => true,
            ],
            [
                'title' => 'Performance Monitoring Programme',
                'slug' => 'performance-monitoring-programme',
                'summary' => 'Continuous tracking and analysis of key performance indicators with regular reporting.',
                'details' => '<p>Stay informed about your organisation\'s performance with our comprehensive monitoring programme.</p><p>We establish meaningful KPIs, implement tracking systems, and provide regular reports with trend analysis and recommendations.</p><p>Monthly reports and quarterly deep-dive sessions included.</p>',
                'icon' => 'presentation-chart-line',
                'price_label' => 'From £800/month',
                'sort_order' => 2,
            ],
        ];

        foreach ($businessSubscription as $service) {
            Service::create([
                'pillar_id' => $businessPillar->id,
                'type' => 'subscription',
                ...$service,
                'is_active' => true,
            ]);
        }

        // Education Support - One-off Services
        $educationOneOff = [
            [
                'title' => 'Curriculum Review',
                'slug' => 'curriculum-review',
                'summary' => 'Expert evaluation of curriculum design, content alignment, and pedagogical effectiveness.',
                'details' => '<p>Our Curriculum Review service provides a thorough evaluation of your educational programmes.</p><p>We assess:</p><ul><li>Learning outcomes alignment</li><li>Content relevance and currency</li><li>Assessment strategies</li><li>Pedagogical approaches</li><li>Student engagement mechanisms</li></ul><p>You receive a detailed report with specific recommendations for enhancement.</p>',
                'icon' => 'document-text',
                'price_label' => 'From £1,500',
                'sort_order' => 1,
            ],
            [
                'title' => 'Assessment Design Workshop',
                'slug' => 'assessment-design-workshop',
                'summary' => 'Collaborative workshop to develop effective assessment strategies aligned with learning objectives.',
                'details' => '<p>This intensive workshop guides your team through the process of designing assessments that genuinely measure learning outcomes.</p><p>Topics covered include formative and summative assessment design, rubric development, feedback strategies, and inclusive assessment practices.</p><p>One-day workshop with follow-up materials and support.</p>',
                'icon' => 'clipboard-check',
                'price_label' => 'From £950',
                'sort_order' => 2,
            ],
            [
                'title' => 'Academic Writing Intensive',
                'slug' => 'academic-writing-intensive',
                'summary' => 'Structured programme to develop advanced academic writing skills for researchers and students.',
                'details' => '<p>Our Academic Writing Intensive is designed for researchers and postgraduate students seeking to enhance their scholarly writing.</p><p>The programme covers:</p><ul><li>Structure and argumentation</li><li>Literature integration</li><li>Academic voice and style</li><li>Revision strategies</li><li>Publication preparation</li></ul>',
                'icon' => 'pencil',
                'price_label' => 'From £600',
                'sort_order' => 3,
            ],
        ];

        foreach ($educationOneOff as $service) {
            Service::create([
                'pillar_id' => $educationPillar->id,
                'type' => 'one_off',
                ...$service,
                'is_active' => true,
            ]);
        }

        // Education Support - Subscription Services
        $educationSubscription = [
            [
                'title' => 'Academic Tutoring Programme',
                'slug' => 'academic-tutoring-programme',
                'summary' => 'Regular one-to-one tutoring sessions tailored to individual learning needs.',
                'details' => '<p>Our Academic Tutoring Programme provides personalised support for students at all levels.</p><p>Each programme includes:</p><ul><li>Initial assessment and goal setting</li><li>Weekly tutoring sessions</li><li>Progress tracking and reporting</li><li>Study skills development</li><li>Exam preparation support</li></ul>',
                'icon' => 'user-group',
                'price_label' => 'From £200/month',
                'sort_order' => 1,
                'is_featured' => true,
            ],
            [
                'title' => 'Institutional Partnership',
                'slug' => 'institutional-partnership',
                'summary' => 'Comprehensive support package for educational institutions seeking ongoing enhancement.',
                'details' => '<p>Partner with us for sustained educational improvement across your institution.</p><p>Partnership benefits include:</p><ul><li>Dedicated account management</li><li>Regular consultation sessions</li><li>Staff development workshops</li><li>Access to resources and research</li><li>Priority service for ad-hoc needs</li></ul>',
                'icon' => 'building-library',
                'price_label' => 'Custom pricing',
                'sort_order' => 2,
            ],
        ];

        foreach ($educationSubscription as $service) {
            Service::create([
                'pillar_id' => $educationPillar->id,
                'type' => 'subscription',
                ...$service,
                'is_active' => true,
            ]);
        }
    }

    private function seedFaqs(): void
    {
        $businessPillar = Pillar::where('slug', 'business-consultancy')->first();
        $educationPillar = Pillar::where('slug', 'education-support')->first();

        // Global FAQs
        $globalFaqs = [
            [
                'question' => 'How do I get started?',
                'answer' => 'Simply contact us through our website or give us a call. We\'ll arrange an initial consultation to understand your needs and discuss how we can help.',
                'sort_order' => 1,
            ],
            [
                'question' => 'What are your payment terms?',
                'answer' => 'For one-off projects, we typically request 50% upon commencement and 50% upon completion. Subscription services are billed monthly in advance. We accept bank transfer and major credit cards.',
                'sort_order' => 2,
            ],
            [
                'question' => 'Do you offer remote services?',
                'answer' => 'Yes, many of our services can be delivered remotely. We use secure video conferencing and collaboration tools to work effectively with clients regardless of location.',
                'sort_order' => 3,
            ],
        ];

        foreach ($globalFaqs as $faq) {
            Faq::create([
                'pillar_id' => null,
                ...$faq,
                'is_active' => true,
            ]);
        }

        // Business Consultancy FAQs
        $businessFaqs = [
            [
                'question' => 'What industries do you specialise in?',
                'answer' => 'While our methodologies are applicable across sectors, we have particular expertise in professional services, technology, healthcare, and education. We always ensure we understand your specific industry context before beginning any engagement.',
                'sort_order' => 1,
            ],
            [
                'question' => 'How long does a typical strategic assessment take?',
                'answer' => 'A standard Strategic Assessment typically takes 4-6 weeks from initiation to final report delivery. This includes stakeholder interviews, data analysis, and report preparation. Timelines can be adjusted based on urgency and scope.',
                'sort_order' => 2,
            ],
            [
                'question' => 'Can you help with implementation, not just strategy?',
                'answer' => 'Absolutely. We offer implementation support through our subscription services and can provide hands-on assistance to ensure recommendations translate into real results.',
                'sort_order' => 3,
            ],
        ];

        foreach ($businessFaqs as $faq) {
            Faq::create([
                'pillar_id' => $businessPillar->id,
                ...$faq,
                'is_active' => true,
            ]);
        }

        // Education Support FAQs
        $educationFaqs = [
            [
                'question' => 'What age groups do you support?',
                'answer' => 'Our services span all educational levels, from primary through to postgraduate and professional education. Our tutoring programmes are particularly suited to secondary and higher education students.',
                'sort_order' => 1,
            ],
            [
                'question' => 'Are your tutors qualified teachers?',
                'answer' => 'All our tutors hold relevant academic qualifications and have substantial experience in education. Many are qualified teachers or have advanced degrees in their subject areas.',
                'sort_order' => 2,
            ],
            [
                'question' => 'How do you measure student progress?',
                'answer' => 'We conduct regular assessments and provide detailed progress reports. Our approach focuses on both academic achievement and the development of independent learning skills.',
                'sort_order' => 3,
            ],
        ];

        foreach ($educationFaqs as $faq) {
            Faq::create([
                'pillar_id' => $educationPillar->id,
                ...$faq,
                'is_active' => true,
            ]);
        }
    }

    private function seedContactSubmissions(): void
    {
        $businessPillar = Pillar::where('slug', 'business-consultancy')->first();
        $educationPillar = Pillar::where('slug', 'education-support')->first();

        ContactSubmission::create([
            'name' => 'John Smith',
            'email' => 'john.smith@example.com',
            'phone' => '+44 7700 900123',
            'pillar_id' => $businessPillar->id,
            'message' => 'We are a mid-sized technology company looking for strategic guidance on our expansion plans. Would like to discuss your Strategic Assessment service.',
            'status' => 'new',
            'source' => 'website',
        ]);

        ContactSubmission::create([
            'name' => 'Sarah Johnson',
            'email' => 'sjohnson@school.edu',
            'phone' => '+44 7700 900456',
            'pillar_id' => $educationPillar->id,
            'message' => 'I am the Head of Department at a secondary school. We are interested in your Curriculum Review service for our A-Level programmes.',
            'status' => 'in_progress',
            'source' => 'website',
        ]);

        ContactSubmission::create([
            'name' => 'Michael Chen',
            'email' => 'mchen@startup.io',
            'pillar_id' => $businessPillar->id,
            'message' => 'Interested in the Strategic Advisory Retainer. Our startup is scaling rapidly and we need ongoing strategic support.',
            'status' => 'synced',
            'suitedash_external_id' => 'SD-12345',
            'synced_at' => now()->subDays(2),
            'source' => 'website',
        ]);
    }

    private function seedIntegrationSettings(): void
    {
        IntegrationSetting::create([
            'provider' => 'suitedash',
            'is_enabled' => false,
            'mode' => 'import',
            'settings' => [
                'auto_sync' => false,
                'sync_interval' => 'daily',
            ],
        ]);

        IntegrationSetting::create([
            'provider' => 'ringcentral',
            'is_enabled' => false,
            'settings' => [
                'enable_calls' => true,
                'enable_sms' => true,
                'sync_call_logs' => true,
            ],
        ]);
    }
}
