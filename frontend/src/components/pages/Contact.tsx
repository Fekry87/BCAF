import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Phone, Mail, MessageSquare, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Button, Input, Textarea, Select } from '@/components/ui';
import { contactApi } from '@/services/contact';
import { pillarsApi } from '@/services/pillars';
import { get } from '@/services/api';
import type { ContactFormData } from '@/types';

const contactSchema = z.object({
  name: z.string().min(1, 'Please provide your name'),
  email: z.string().email('Please provide a valid email address'),
  phone: z.string().optional(),
  pillar_id: z.string().optional(),
  message: z.string().min(10, 'Your message should be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactPageContent {
  hero: {
    title: string;
    subtitle: string;
  };
  contact_options: {
    call: {
      title: string;
      subtitle: string;
      phone: string;
    };
    email: {
      title: string;
      subtitle: string;
      email: string;
    };
    message: {
      title: string;
      subtitle: string;
      button_text: string;
    };
  };
  form: {
    title: string;
  };
  office_hours: {
    title: string;
    items: Array<{
      day: string;
      hours: string;
    }>;
  };
  address: {
    title: string;
    lines: string[];
  };
  response_time: {
    title: string;
    text: string;
  };
}

const defaultContent: ContactPageContent = {
  hero: {
    title: 'Contact Us',
    subtitle: "We're here to help. Reach out to discuss how we can support your goals, or simply to learn more about our services.",
  },
  contact_options: {
    call: {
      title: 'Call Us',
      subtitle: 'Speak directly with our team',
      phone: '+44 (0) 123 456 7890',
    },
    email: {
      title: 'Email Us',
      subtitle: 'Send us a message anytime',
      email: 'info@consultancy.com',
    },
    message: {
      title: 'Message',
      subtitle: 'Quick text support',
      button_text: 'Send a message',
    },
  },
  form: {
    title: 'Send us a message',
  },
  office_hours: {
    title: 'Office Hours',
    items: [
      { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM GMT' },
      { day: 'Saturday', hours: '10:00 AM - 2:00 PM GMT' },
      { day: 'Sunday', hours: 'Closed' },
    ],
  },
  address: {
    title: 'Our Address',
    lines: ['123 Academic Lane', 'London, EC1A 1BB', 'United Kingdom'],
  },
  response_time: {
    title: 'Response Time',
    text: 'We aim to respond to all enquiries within 24 business hours. For urgent matters, please call us directly.',
  },
};

export function ContactPage() {
  const { data: pillarsData } = useQuery({
    queryKey: ['pillars'],
    queryFn: pillarsApi.getAll,
  });

  const { data: contentData, isLoading: contentLoading } = useQuery({
    queryKey: ['content', 'pages', 'contact'],
    queryFn: () => get<ContactPageContent>('/content/pages/contact'),
  });

  const pillars = pillarsData?.data || [];
  const content = contentData?.data || defaultContent;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ContactFormData) => contactApi.submit(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Message sent successfully');
      reset();
    },
    onError: () => {
      toast.error('Failed to send message. Please try again.');
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    const formData: ContactFormData = {
      ...data,
      pillar_id: data.pillar_id ? parseInt(data.pillar_id) : undefined,
    };
    mutation.mutate(formData);
  };

  const pillarOptions = [
    { value: '', label: 'General enquiry' },
    ...pillars.map((p) => ({ value: String(p.id), label: p.name })),
  ];

  if (contentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-primary-900">
        <div className="container-main relative z-10">
          <div className="max-w-3xl">
            <div className="divider-accent mb-6" />
            <h1 className="text-display text-white mb-6">{content.hero.title}</h1>
            <p className="text-body-lg text-primary-100 leading-relaxed">
              {content.hero.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="section bg-neutral-50">
        <div className="container-main">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Call */}
            <div className="card text-center">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="h-7 w-7 text-primary-700" />
              </div>
              <h3 className="text-h4 text-primary-900 mb-2">{content.contact_options.call.title}</h3>
              <p className="text-neutral-600 text-sm mb-4">
                {content.contact_options.call.subtitle}
              </p>
              <a
                href={`tel:${content.contact_options.call.phone.replace(/\s/g, '')}`}
                className="text-primary-700 font-medium hover:text-primary-800"
              >
                {content.contact_options.call.phone}
              </a>
            </div>

            {/* Email */}
            <div className="card text-center">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="h-7 w-7 text-primary-700" />
              </div>
              <h3 className="text-h4 text-primary-900 mb-2">{content.contact_options.email.title}</h3>
              <p className="text-neutral-600 text-sm mb-4">
                {content.contact_options.email.subtitle}
              </p>
              <a
                href={`mailto:${content.contact_options.email.email}`}
                className="text-primary-700 font-medium hover:text-primary-800"
              >
                {content.contact_options.email.email}
              </a>
            </div>

            {/* Message */}
            <div className="card text-center">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-7 w-7 text-primary-700" />
              </div>
              <h3 className="text-h4 text-primary-900 mb-2">{content.contact_options.message.title}</h3>
              <p className="text-neutral-600 text-sm mb-4">
                {content.contact_options.message.subtitle}
              </p>
              <button
                type="button"
                className="text-primary-700 font-medium hover:text-primary-800"
                onClick={() => toast('SMS messaging requires RingCentral configuration')}
              >
                {content.contact_options.message.button_text}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Form */}
            <div>
              <h2 className="text-h2 text-primary-900 mb-6">{content.form.title}</h2>

              {isSubmitSuccessful && mutation.isSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-h3 text-green-800 mb-2">Message sent</h3>
                  <p className="text-green-700">
                    Thank you for getting in touch. We'll respond to your enquiry shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <Input
                    label="Name"
                    placeholder="Your full name"
                    error={errors.name?.message}
                    {...register('name')}
                  />

                  <Input
                    label="Email"
                    type="email"
                    placeholder="your.email@example.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />

                  <Input
                    label="Phone (optional)"
                    type="tel"
                    placeholder="+44 7xxx xxx xxx"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />

                  <Select
                    label="Area of interest"
                    options={pillarOptions}
                    error={errors.pillar_id?.message}
                    {...register('pillar_id')}
                  />

                  <Textarea
                    label="Message"
                    placeholder="Tell us about your needs or questions..."
                    rows={5}
                    error={errors.message?.message}
                    {...register('message')}
                  />

                  <Button type="submit" size="lg" isLoading={mutation.isPending}>
                    Send message
                  </Button>
                </form>
              )}
            </div>

            {/* Office Info */}
            <div>
              <div className="bg-primary-50 rounded-2xl p-8 lg:p-10">
                <h3 className="text-h3 text-primary-900 mb-6">{content.office_hours.title}</h3>

                <div className="space-y-4 mb-8">
                  {content.office_hours.items.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-primary-900">{item.day}</p>
                        <p className="text-neutral-600">{item.hours}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-primary-200 pt-6">
                  <h4 className="font-semibold text-primary-900 mb-3">{content.address.title}</h4>
                  <p className="text-neutral-600">
                    {content.address.lines.map((line, index) => (
                      <span key={index}>
                        {line}
                        {index < content.address.lines.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>

                <div className="border-t border-primary-200 pt-6 mt-6">
                  <h4 className="font-semibold text-primary-900 mb-3">{content.response_time.title}</h4>
                  <p className="text-neutral-600 text-sm">
                    {content.response_time.text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
