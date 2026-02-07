import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Loader2, HelpCircle } from 'lucide-react';
import { pillarsApi } from '@/services/pillars';
import { get } from '@/services/api';
import { Button, FaqAccordion } from '@/components/ui';
import type { Faq } from '@/types';

interface HomePageContent {
  hero: {
    title: string;
    subtitle: string;
    cta_text: string;
    cta_link: string;
    secondary_cta_text: string;
    secondary_cta_link: string;
    background_image: string;
  };
  pillars_section: {
    title: string;
    subtitle: string;
  };
  faq_section: {
    title: string;
    subtitle: string;
    show_on_home: boolean;
    limit: number;
  };
  cta_section: {
    title: string;
    subtitle: string;
    button_text: string;
    button_link: string;
  };
}

export function HomePage() {
  const { data: pillarsData, isLoading: pillarsLoading } = useQuery({
    queryKey: ['pillars'],
    queryFn: pillarsApi.getAll,
  });

  const { data: contentData } = useQuery({
    queryKey: ['content', 'pages', 'home'],
    queryFn: () => get<HomePageContent>('/content/pages/home'),
  });

  // Fetch global FAQs for home page
  const { data: faqsData, isLoading: faqsLoading } = useQuery({
    queryKey: ['faqs', 'global'],
    queryFn: () => get<Faq[]>('/faqs/global'),
  });

  const pillars = pillarsData?.data || [];
  const content = contentData?.data;
  const faqs = faqsData?.data || [];

  // Default content if API hasn't loaded yet
  const hero = content?.hero || {
    title: 'Strategic guidance for meaningful growth',
    subtitle: 'We partner with organisations and individuals to navigate complexity, develop robust strategies, and achieve lasting success through evidence-based approaches.',
    cta_text: 'Get in touch',
    cta_link: '/contact',
    secondary_cta_text: 'Learn more',
    secondary_cta_link: '/about',
    background_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80',
  };

  const pillarsSection = content?.pillars_section || {
    title: 'Our Expertise',
    subtitle: 'Two distinct pillars of service, united by a commitment to excellence and evidence-based practice.',
  };

  const faqSection = content?.faq_section || {
    title: 'Frequently Asked Questions',
    subtitle: 'Find answers to common questions about our services.',
    show_on_home: true,
    limit: 6,
  };

  const ctaSection = content?.cta_section || {
    title: 'Ready to begin?',
    subtitle: 'Contact us today to discuss how we can support your goals and help you achieve meaningful, sustainable outcomes.',
    button_text: 'Contact us',
    button_link: '/contact',
  };

  // Limit FAQs displayed on home page
  const displayedFaqs = faqs.slice(0, faqSection.limit);
  const showFaqSection = faqSection.show_on_home && displayedFaqs.length > 0;

  return (
    <>
      {/* Hero Section */}
      <section className="hero relative bg-primary-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${hero.background_image}")`,
          }}
        />
        <div className="hero-overlay" />

        <div className="container-main relative z-10">
          <div className="max-w-2xl">
            <div className="divider-accent mb-6" />
            <h1 className="text-display text-white mb-6">
              {hero.title}
            </h1>
            <p className="text-body-lg text-primary-100 mb-8 leading-relaxed">
              {hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                as={Link}
                to={hero.cta_link}
                size="lg"
                variant="primary"
              >
                {hero.cta_text}
              </Button>
              <Button
                as={Link}
                to={hero.secondary_cta_link}
                variant="secondary"
                size="lg"
                className="bg-white/10 border-white text-white hover:bg-white/20"
              >
                {hero.secondary_cta_text}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="section bg-neutral-50">
        <div className="container-main">
          <div className="text-center mb-12">
            <div className="divider-accent mx-auto mb-6" />
            <h2 className="text-h1 text-primary-900 mb-4">{pillarsSection.title}</h2>
            <p className="text-body-lg text-neutral-600 max-w-2xl mx-auto">
              {pillarsSection.subtitle}
            </p>
          </div>

          {pillarsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : pillars.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-600">No services available yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {pillars.filter(p => p.is_active).map((pillar) => (
                <Link
                  key={pillar.id}
                  to={`/${pillar.slug}`}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 min-h-[400px] flex"
                >
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: `url("${pillar.hero_image || pillar.card_image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80'}")`,
                    }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-primary-900/70 to-transparent" />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col justify-end p-8 w-full">
                    <h3 className="text-h1 text-white mb-3">
                      {pillar.name}
                    </h3>

                    <p className="text-lg text-primary-100 mb-6">
                      {pillar.tagline}
                    </p>

                    <div className="flex items-center text-accent-yellow font-semibold group-hover:text-yellow-300 transition-colors">
                      Explore services
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      {showFaqSection && (
        <section className="section bg-white">
          <div className="container-main">
            <div className="max-w-4xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-6">
                  <HelpCircle className="h-8 w-8 text-primary-600" />
                </div>
                <h2 className="text-h1 text-primary-900 mb-4">{faqSection.title}</h2>
                <p className="text-body-lg text-neutral-600 max-w-2xl mx-auto">
                  {faqSection.subtitle}
                </p>
              </div>

              {/* FAQ Accordion */}
              {faqsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              ) : (
                <FaqAccordion faqs={displayedFaqs} variant="default" className="max-w-3xl mx-auto" />
              )}

              {/* View All Link */}
              {faqs.length > faqSection.limit && (
                <div className="text-center mt-8">
                  <Link
                    to="/contact#faq"
                    className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                  >
                    View all FAQs
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section bg-primary-700">
        <div className="container-main text-center">
          <h2 className="text-h1 text-white mb-4">{ctaSection.title}</h2>
          <p className="text-body-lg text-primary-100 max-w-2xl mx-auto mb-8">
            {ctaSection.subtitle}
          </p>
          <Button
            as={Link}
            to={ctaSection.button_link}
            size="lg"
            variant="primary"
          >
            {ctaSection.button_text}
          </Button>
        </div>
      </section>
    </>
  );
}
