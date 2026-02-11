import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2 } from 'lucide-react';
import { get, put } from '@/services/api';
import { Button } from '@/components/ui';
import {
  darkInputClass,
  darkLabelClass,
  darkTextareaClass,
  FormLoading,
  FormSection,
  FormCard,
} from './shared';
import type { ContactPageContent, OfficeHourItem } from './types';

export function ContactPageForm() {
  const queryClient = useQueryClient();
  const [officeHours, setOfficeHours] = useState<OfficeHourItem[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'content', 'pages', 'contact'],
    queryFn: () => get<ContactPageContent>('/admin/content/pages/contact'),
  });

  const { register, handleSubmit } = useForm<ContactPageContent>();

  const mutation = useMutation({
    mutationFn: (formData: ContactPageContent) => {
      const fullData = {
        ...formData,
        office_hours: {
          ...formData.office_hours,
          items: officeHours,
        },
      };
      return put<ContactPageContent>('/admin/content/pages/contact', fullData);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'content', 'pages', 'contact'] });
      void queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Contact page updated successfully');
    },
    onError: () => {
      toast.error('Failed to update contact page');
    },
  });

  if (isLoading) {
    return <FormLoading />;
  }

  const content = data?.data;

  // Initialize office hours from data
  if (content && officeHours.length === 0 && content.office_hours?.items) {
    setOfficeHours(content.office_hours.items);
  }

  const addOfficeHour = () => {
    setOfficeHours([...officeHours, { day: '', hours: '' }]);
  };

  const removeOfficeHour = (index: number) => {
    setOfficeHours(officeHours.filter((_, i) => i !== index));
  };

  const updateOfficeHour = (index: number, field: keyof OfficeHourItem, value: string) => {
    const updated = [...officeHours];
    updated[index] = { ...updated[index], [field]: value };
    setOfficeHours(updated);
  };

  return (
    <form onSubmit={handleSubmit((formData) => mutation.mutate(formData))} className="space-y-8">
      {/* Hero Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Hero Section</h3>
        <div className="space-y-4">
          <div>
            <label className={darkLabelClass}>Title</label>
            <input
              className={darkInputClass}
              defaultValue={content?.hero?.title}
              {...register('hero.title')}
            />
          </div>
          <div>
            <label className={darkLabelClass}>Subtitle</label>
            <textarea
              className={darkTextareaClass}
              rows={2}
              defaultValue={content?.hero?.subtitle}
              {...register('hero.subtitle')}
            />
          </div>
        </div>
      </div>

      {/* Contact Options */}
      <FormSection title="Contact Options">
        <div className="space-y-6">
          {/* Call Option */}
          <FormCard title="Call Option">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={darkLabelClass}>Title</label>
                <input
                  className={darkInputClass}
                  defaultValue={content?.contact_options?.call?.title}
                  {...register('contact_options.call.title')}
                />
              </div>
              <div>
                <label className={darkLabelClass}>Subtitle</label>
                <input
                  className={darkInputClass}
                  defaultValue={content?.contact_options?.call?.subtitle}
                  {...register('contact_options.call.subtitle')}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className={darkLabelClass}>Phone Number</label>
              <input
                className={darkInputClass}
                defaultValue={content?.contact_options?.call?.phone}
                {...register('contact_options.call.phone')}
              />
            </div>
          </FormCard>

          {/* Email Option */}
          <FormCard title="Email Option">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={darkLabelClass}>Title</label>
                <input
                  className={darkInputClass}
                  defaultValue={content?.contact_options?.email?.title}
                  {...register('contact_options.email.title')}
                />
              </div>
              <div>
                <label className={darkLabelClass}>Subtitle</label>
                <input
                  className={darkInputClass}
                  defaultValue={content?.contact_options?.email?.subtitle}
                  {...register('contact_options.email.subtitle')}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className={darkLabelClass}>Email Address</label>
              <input
                className={darkInputClass}
                defaultValue={content?.contact_options?.email?.email}
                {...register('contact_options.email.email')}
              />
            </div>
          </FormCard>

          {/* Message Option */}
          <FormCard title="Message Option">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={darkLabelClass}>Title</label>
                <input
                  className={darkInputClass}
                  defaultValue={content?.contact_options?.message?.title}
                  {...register('contact_options.message.title')}
                />
              </div>
              <div>
                <label className={darkLabelClass}>Subtitle</label>
                <input
                  className={darkInputClass}
                  defaultValue={content?.contact_options?.message?.subtitle}
                  {...register('contact_options.message.subtitle')}
                />
              </div>
              <div>
                <label className={darkLabelClass}>Button Text</label>
                <input
                  className={darkInputClass}
                  defaultValue={content?.contact_options?.message?.button_text}
                  {...register('contact_options.message.button_text')}
                />
              </div>
            </div>
          </FormCard>
        </div>
      </FormSection>

      {/* Form Section */}
      <FormSection title="Contact Form">
        <div>
          <label className={darkLabelClass}>Form Title</label>
          <input
            className={darkInputClass}
            defaultValue={content?.form?.title}
            {...register('form.title')}
          />
        </div>
      </FormSection>

      {/* Office Hours */}
      <FormSection title="Office Hours">
        <div className="flex items-center justify-between mb-4">
          <div />
          <Button type="button" variant="secondary" size="sm" onClick={addOfficeHour}>
            <Plus className="h-4 w-4 mr-1" />
            Add Hours
          </Button>
        </div>
        <div className="space-y-3">
          {officeHours.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-1">
                {index === 0 && <label className={darkLabelClass}>Day</label>}
                <input
                  className={darkInputClass}
                  value={item.day}
                  onChange={(e) => updateOfficeHour(index, 'day', e.target.value)}
                  placeholder="Monday - Friday"
                />
              </div>
              <div className="flex-1">
                {index === 0 && <label className={darkLabelClass}>Hours</label>}
                <input
                  className={darkInputClass}
                  value={item.hours}
                  onChange={(e) => updateOfficeHour(index, 'hours', e.target.value)}
                  placeholder="9:00 AM - 6:00 PM"
                />
              </div>
              <button
                type="button"
                onClick={() => removeOfficeHour(index)}
                className={`p-2 text-red-400 hover:text-red-300 ${index === 0 ? 'mt-7' : ''}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </FormSection>

      {/* Address */}
      <FormSection title="Address">
        <div>
          <label className={darkLabelClass}>Address Lines (one per line)</label>
          <textarea
            className={darkTextareaClass}
            rows={3}
            defaultValue={content?.address?.lines?.join('\n')}
            {...register('address.lines' as const)}
            placeholder="123 Academic Lane&#10;London, EC1A 1BB&#10;United Kingdom"
          />
        </div>
      </FormSection>

      {/* Response Time */}
      <FormSection title="Response Time">
        <div>
          <label className={darkLabelClass}>Response Time Message</label>
          <textarea
            className={darkTextareaClass}
            rows={2}
            defaultValue={content?.response_time?.text}
            {...register('response_time.text')}
          />
        </div>
      </FormSection>

      <div className="flex justify-end pt-4 border-t border-slate-700">
        <Button type="submit" isLoading={mutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save Contact Page
        </Button>
      </div>
    </form>
  );
}
