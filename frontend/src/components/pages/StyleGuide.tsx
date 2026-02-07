import { useState } from 'react';
import { Button, Input, Textarea, Select, Accordion, AccordionItem, ServiceCard } from '@/components/ui';
import type { Service } from '@/types';

const mockService: Service = {
  id: 1,
  pillar_id: 1,
  type: 'one_off',
  type_label: 'One-off',
  title: 'Strategic Assessment',
  slug: 'strategic-assessment',
  summary: 'A comprehensive evaluation of your current position, market dynamics, and strategic options.',
  details: '<p>Our Strategic Assessment service provides a thorough analysis of your organisation\'s current state and future potential.</p><ul><li>Market positioning and competitive landscape</li><li>Organisational capabilities</li><li>Financial performance</li></ul>',
  icon: 'chart-bar',
  icon_image: null,
  price_from: 2500,
  price_label: 'From £2,500',
  sort_order: 1,
  is_featured: true,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function StyleGuidePage() {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="py-20">
      <div className="container-main">
        <h1 className="text-display text-primary-900 mb-12">Style Guide</h1>

        {/* Colors */}
        <section className="mb-16">
          <h2 className="text-h2 text-primary-900 mb-6">Colors</h2>

          <div className="mb-8">
            <h3 className="text-h3 text-primary-900 mb-4">Primary</h3>
            <div className="grid grid-cols-5 md:grid-cols-9 gap-2">
              {[50, 100, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="text-center">
                  <div
                    className={`h-16 rounded-lg mb-2 bg-primary-${shade}`}
                    style={{ backgroundColor: `var(--color-primary-${shade})` }}
                  />
                  <span className="text-xs text-neutral-600">{shade}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-h3 text-primary-900 mb-4">Neutral</h3>
            <div className="grid grid-cols-5 md:grid-cols-9 gap-2">
              {[50, 100, 200, 300, 400, 500, 700, 900].map((shade) => (
                <div key={shade} className="text-center">
                  <div
                    className={`h-16 rounded-lg mb-2 border`}
                    style={{ backgroundColor: `var(--color-neutral-${shade})` }}
                  />
                  <span className="text-xs text-neutral-600">{shade}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-h3 text-primary-900 mb-4">Accent</h3>
            <div className="grid grid-cols-2 gap-2 max-w-xs">
              <div className="text-center">
                <div className="h-16 rounded-lg mb-2 bg-accent-yellow" />
                <span className="text-xs text-neutral-600">Yellow</span>
              </div>
              <div className="text-center">
                <div className="h-16 rounded-lg mb-2 bg-accent-yellow-light border" />
                <span className="text-xs text-neutral-600">Yellow Light</span>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <h2 className="text-h2 text-primary-900 mb-6">Typography</h2>

          <div className="space-y-6">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Display (3.5rem / 56px)</p>
              <p className="text-display text-primary-900">Strategic guidance for meaningful growth</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">H1 (2.5rem / 40px)</p>
              <h1 className="text-h1">Heading Level One</h1>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">H2 (2rem / 32px)</p>
              <h2 className="text-h2">Heading Level Two</h2>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">H3 (1.5rem / 24px)</p>
              <h3 className="text-h3">Heading Level Three</h3>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">H4 (1.25rem / 20px)</p>
              <h4 className="text-h4">Heading Level Four</h4>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Body Large (1.125rem / 18px)</p>
              <p className="text-body-lg">Body text large for lead paragraphs and important content.</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Body (1rem / 16px)</p>
              <p>Regular body text for general content and descriptions.</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Small (0.875rem / 14px)</p>
              <p className="text-sm text-neutral-600">Small text for captions and meta information.</p>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section className="mb-16">
          <h2 className="text-h2 text-primary-900 mb-6">Spacing Scale</h2>

          <div className="flex flex-wrap gap-4 items-end">
            {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24].map((space) => (
              <div key={space} className="text-center">
                <div
                  className="bg-primary-200 rounded"
                  style={{ width: `${space * 4}px`, height: `${space * 4}px` }}
                />
                <span className="text-xs text-neutral-600 block mt-1">{space}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-16">
          <h2 className="text-h2 text-primary-900 mb-6">Buttons</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-h4 text-primary-900 mb-4">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="text">Text</Button>
                <Button disabled>Disabled</Button>
                <Button isLoading>Loading</Button>
              </div>
            </div>

            <div>
              <h3 className="text-h4 text-primary-900 mb-4">Sizes</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section className="mb-16">
          <h2 className="text-h2 text-primary-900 mb-6">Form Elements</h2>

          <div className="max-w-md space-y-6">
            <Input
              label="Text Input"
              placeholder="Enter text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input
              label="Input with Error"
              placeholder="Enter text..."
              error="This field is required"
            />
            <Textarea
              label="Textarea"
              placeholder="Enter longer text..."
            />
            <Select
              label="Select"
              options={[
                { value: '1', label: 'Option One' },
                { value: '2', label: 'Option Two' },
                { value: '3', label: 'Option Three' },
              ]}
              placeholder="Select an option"
            />
          </div>
        </section>

        {/* Accordion */}
        <section className="mb-16">
          <h2 className="text-h2 text-primary-900 mb-6">Accordion</h2>

          <div className="max-w-2xl">
            <Accordion>
              <AccordionItem title="How do I get started?">
                Simply contact us through our website or give us a call. We'll arrange an initial consultation to understand your needs.
              </AccordionItem>
              <AccordionItem title="What are your payment terms?">
                For one-off projects, we typically request 50% upon commencement and 50% upon completion. Subscription services are billed monthly in advance.
              </AccordionItem>
              <AccordionItem title="Do you offer remote services?">
                Yes, many of our services can be delivered remotely. We use secure video conferencing and collaboration tools.
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Service Card */}
        <section className="mb-16">
          <h2 className="text-h2 text-primary-900 mb-6">Service Card</h2>

          <div className="max-w-lg">
            <ServiceCard service={mockService} />
          </div>
        </section>

        {/* Dividers */}
        <section className="mb-16">
          <h2 className="text-h2 text-primary-900 mb-6">Accent Divider</h2>

          <div className="divider-accent mb-4" />
          <p className="text-neutral-600 text-sm">Yellow accent divider (w-16, h-1)</p>
        </section>

        {/* Shadows */}
        <section className="mb-16">
          <h2 className="text-h2 text-primary-900 mb-6">Shadows</h2>

          <div className="flex flex-wrap gap-8">
            <div className="w-32 h-32 bg-white rounded-lg shadow-sm flex items-center justify-center">
              <span className="text-xs text-neutral-600">Small</span>
            </div>
            <div className="w-32 h-32 bg-white rounded-lg shadow-md flex items-center justify-center">
              <span className="text-xs text-neutral-600">Medium</span>
            </div>
            <div className="w-32 h-32 bg-white rounded-lg shadow-lg flex items-center justify-center">
              <span className="text-xs text-neutral-600">Large</span>
            </div>
            <div className="w-32 h-32 bg-white rounded-lg shadow-card flex items-center justify-center">
              <span className="text-xs text-neutral-600">Card</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
