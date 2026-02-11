import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { get, put, post, del } from '@/services/api';
import { Button, ImageUpload } from '@/components/ui';
import { darkInputClass, darkLabelClass, darkTextareaClass, FormLoading, FormSection } from './shared';
import type { HomePageContent } from './types';

export function HomePageForm() {
  const queryClient = useQueryClient();
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'content', 'pages', 'home'],
    queryFn: () => get<HomePageContent>('/admin/content/pages/home'),
  });

  // Update heroImageUrl when data is loaded
  useEffect(() => {
    if (data?.data?.hero?.background_image) {
      setHeroImageUrl(data.data.hero.background_image);
    }
  }, [data]);

  const { register, handleSubmit, setValue } = useForm<HomePageContent>();

  // Update form value when heroImageUrl changes
  useEffect(() => {
    setValue('hero.background_image', heroImageUrl);
  }, [heroImageUrl, setValue]);

  const handleHeroImageUpload = async (file: File): Promise<string> => {
    // In a real implementation, this would upload the file
    // For mock, we'll just call the endpoint which returns a fake URL
    const response = await post<{ url: string }>('/admin/content/pages/home/hero-image', {
      filename: file.name,
      size: file.size,
      type: file.type,
    });
    const url = response.data?.url || '';

    // Invalidate caches so the website reflects the change immediately
    void queryClient.invalidateQueries({ queryKey: ['admin', 'content', 'pages', 'home'] });
    void queryClient.invalidateQueries({ queryKey: ['content', 'pages', 'home'] });
    toast.success('Hero image uploaded successfully');

    return url;
  };

  const handleHeroImageRemove = async () => {
    try {
      await del('/admin/content/pages/home/hero-image');
      setHeroImageUrl('');
      // Invalidate caches so the website reflects the change immediately
      void queryClient.invalidateQueries({ queryKey: ['admin', 'content', 'pages', 'home'] });
      void queryClient.invalidateQueries({ queryKey: ['content', 'pages', 'home'] });
      toast.success('Hero image removed');
    } catch {
      toast.error('Failed to remove image');
    }
  };

  const mutation = useMutation({
    mutationFn: (data: HomePageContent) =>
      put<HomePageContent>('/admin/content/pages/home', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'content', 'pages', 'home'] });
      void queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Home page updated successfully');
    },
    onError: () => {
      toast.error('Failed to update home page');
    },
  });

  if (isLoading) {
    return <FormLoading />;
  }

  const content = data?.data;

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={darkLabelClass}>Primary CTA Text</label>
              <input
                className={darkInputClass}
                defaultValue={content?.hero?.cta_text}
                {...register('hero.cta_text')}
              />
            </div>
            <div>
              <label className={darkLabelClass}>Primary CTA Link</label>
              <input
                className={darkInputClass}
                defaultValue={content?.hero?.cta_link}
                {...register('hero.cta_link')}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={darkLabelClass}>Secondary CTA Text</label>
              <input
                className={darkInputClass}
                defaultValue={content?.hero?.secondary_cta_text}
                {...register('hero.secondary_cta_text')}
              />
            </div>
            <div>
              <label className={darkLabelClass}>Secondary CTA Link</label>
              <input
                className={darkInputClass}
                defaultValue={content?.hero?.secondary_cta_link}
                {...register('hero.secondary_cta_link')}
              />
            </div>
          </div>
          <ImageUpload
            label="Background Image"
            value={heroImageUrl}
            onChange={(url) => setHeroImageUrl(url)}
            onUpload={handleHeroImageUpload}
            onRemove={handleHeroImageRemove}
            placeholder="Click or drag to upload hero background image"
            maxSize={10}
          />
        </div>
      </div>

      {/* Pillars Section */}
      <FormSection title="Pillars Section">
        <div className="space-y-4">
          <div>
            <label className={darkLabelClass}>Section Title</label>
            <input
              className={darkInputClass}
              defaultValue={content?.pillars_section?.title}
              {...register('pillars_section.title')}
            />
          </div>
          <div>
            <label className={darkLabelClass}>Section Subtitle</label>
            <textarea
              className={darkTextareaClass}
              rows={2}
              defaultValue={content?.pillars_section?.subtitle}
              {...register('pillars_section.subtitle')}
            />
          </div>
        </div>
      </FormSection>

      {/* CTA Section */}
      <FormSection title="Call to Action Section">
        <div className="space-y-4">
          <div>
            <label className={darkLabelClass}>Section Title</label>
            <input
              className={darkInputClass}
              defaultValue={content?.cta_section?.title}
              {...register('cta_section.title')}
            />
          </div>
          <div>
            <label className={darkLabelClass}>Section Subtitle</label>
            <textarea
              className={darkTextareaClass}
              rows={2}
              defaultValue={content?.cta_section?.subtitle}
              {...register('cta_section.subtitle')}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={darkLabelClass}>Button Text</label>
              <input
                className={darkInputClass}
                defaultValue={content?.cta_section?.button_text}
                {...register('cta_section.button_text')}
              />
            </div>
            <div>
              <label className={darkLabelClass}>Button Link</label>
              <input
                className={darkInputClass}
                defaultValue={content?.cta_section?.button_link}
                {...register('cta_section.button_link')}
              />
            </div>
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end pt-4 border-t border-slate-700">
        <Button type="submit" isLoading={mutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save Home Page
        </Button>
      </div>
    </form>
  );
}
