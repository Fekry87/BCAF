import { useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Loader2 } from 'lucide-react';
import { pillarsApi } from '@/services/pillars';
import { Button, ServiceCard, Accordion, AccordionItem } from '@/components/ui';

export function PillarPage() {
  const location = useLocation();
  // Extract slug from pathname (e.g., "/business-consultancy" -> "business-consultancy")
  const slug = location.pathname.replace('/', '');

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['pillar-services', slug],
    queryFn: () => pillarsApi.getServices(slug),
    enabled: !!slug,
  });

  const { data: faqsData, isLoading: faqsLoading } = useQuery({
    queryKey: ['pillar-faqs', slug],
    queryFn: () => pillarsApi.getFaqs(slug),
    enabled: !!slug,
  });

  const isLoading = servicesLoading || faqsLoading;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const pillar = servicesData?.data?.pillar;
  const oneOffServices = servicesData?.data?.one_off?.filter(s => s.is_active) || [];
  const subscriptionServices = servicesData?.data?.subscription?.filter(s => s.is_active) || [];
  const pillarFaqs = faqsData?.data?.pillar_faqs?.filter(f => f.is_active) || [];
  const globalFaqs = faqsData?.data?.global_faqs?.filter(f => f.is_active) || [];
  const allFaqs = [...pillarFaqs, ...globalFaqs];

  if (!pillar) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-serif font-semibold text-primary-900 mb-4">Page not found</h1>
          <p className="text-neutral-600 mb-4 text-sm sm:text-base">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="text-primary-700 hover:underline text-sm sm:text-base">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-28 bg-primary-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: pillar.hero_image
              ? `url("${pillar.hero_image}")`
              : 'url("https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=2000&q=80")',
          }}
        />
        <div className="container-main relative z-10">
          <div className="max-w-3xl">
            <div className="divider-accent mb-4 sm:mb-6" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-white mb-4 sm:mb-6 leading-tight">
              {pillar.name}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-primary-100 leading-relaxed">
              {pillar.description || pillar.tagline}
            </p>
          </div>
        </div>
      </section>

      {/* One-off Services */}
      {oneOffServices.length > 0 && (
        <section className="section">
          <div className="container-main">
            <div className="mb-6 sm:mb-8 md:mb-10">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-h2 font-serif font-semibold text-primary-900 mb-2 sm:mb-3">
                One-off Services
              </h2>
              <p className="text-sm sm:text-base text-neutral-600">
                Focused engagements designed to address specific needs with clear deliverables.
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {oneOffServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  pillarName={pillar.name}
                  pillarSlug={pillar.slug}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Subscription Services */}
      {subscriptionServices.length > 0 && (
        <section className="section bg-neutral-50">
          <div className="container-main">
            <div className="mb-6 sm:mb-8 md:mb-10">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-h2 font-serif font-semibold text-primary-900 mb-2 sm:mb-3">
                Ongoing Support
              </h2>
              <p className="text-sm sm:text-base text-neutral-600">
                Continuous partnerships that provide sustained value and adapt to your evolving needs.
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {subscriptionServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  pillarName={pillar.name}
                  pillarSlug={pillar.slug}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No Services Message */}
      {oneOffServices.length === 0 && subscriptionServices.length === 0 && (
        <section className="section">
          <div className="container-main">
            <div className="text-center py-8 sm:py-12">
              <p className="text-neutral-600 text-sm sm:text-base">
                No services are currently available for this category. Please check back later.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {allFaqs.length > 0 && (
        <section className="section">
          <div className="container-main">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-6 sm:mb-8 md:mb-10">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-h2 font-serif font-semibold text-primary-900 mb-2 sm:mb-3">
                  Frequently Asked Questions
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 px-4 sm:px-0">
                  Find answers to common questions about our {pillar.name.toLowerCase()} services.
                </p>
              </div>

              <Accordion>
                {allFaqs.map((faq) => (
                  <AccordionItem key={faq.id} title={faq.question}>
                    <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section bg-primary-50">
        <div className="container-main">
          <div className="max-w-3xl mx-auto text-center px-4 sm:px-0">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-h2 font-serif font-semibold text-primary-900 mb-3 sm:mb-4">
              Ready to discuss your needs?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-neutral-600 mb-6 sm:mb-8">
              Get in touch to explore how our {pillar.name.toLowerCase()} services
              can support your objectives.
            </p>
            <Button
              as={Link}
              to="/contact"
              size="lg"
              className="w-full sm:w-auto bg-accent-yellow text-primary-900 hover:bg-yellow-400 border-accent-yellow"
            >
              Get in touch
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
