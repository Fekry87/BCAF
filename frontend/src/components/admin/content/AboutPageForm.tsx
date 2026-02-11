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
} from './shared';
import type { AboutPageContent, TeamMember } from './types';

export function AboutPageForm() {
  const queryClient = useQueryClient();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'content', 'pages', 'about'],
    queryFn: () => get<AboutPageContent>('/admin/content/pages/about'),
  });

  const { register, handleSubmit } = useForm<AboutPageContent>();

  const mutation = useMutation({
    mutationFn: (formData: AboutPageContent) => {
      const fullData = {
        ...formData,
        team: {
          ...formData.team,
          members: teamMembers,
        },
      };
      return put<AboutPageContent>('/admin/content/pages/about', fullData);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'content', 'pages', 'about'] });
      void queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('About page updated successfully');
    },
    onError: () => {
      toast.error('Failed to update about page');
    },
  });

  if (isLoading) {
    return <FormLoading />;
  }

  const content = data?.data;

  // Initialize team members
  if (content && teamMembers.length === 0 && content.team?.members) {
    setTeamMembers(content.team.members);
  }

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: '', position: '', bio: '', image: '' }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
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
          <div>
            <label className={darkLabelClass}>Background Image URL</label>
            <input
              className={darkInputClass}
              defaultValue={content?.hero?.background_image}
              {...register('hero.background_image')}
            />
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <FormSection title="Mission">
        <div className="space-y-4">
          <div>
            <label className={darkLabelClass}>Section Title</label>
            <input
              className={darkInputClass}
              defaultValue={content?.mission?.title}
              {...register('mission.title')}
            />
          </div>
          <div>
            <label className={darkLabelClass}>Main Content</label>
            <textarea
              className={darkTextareaClass}
              rows={3}
              defaultValue={content?.mission?.content}
              {...register('mission.content')}
            />
          </div>
          <div>
            <label className={darkLabelClass}>Additional Content</label>
            <textarea
              className={darkTextareaClass}
              rows={3}
              defaultValue={content?.mission?.additional_content}
              {...register('mission.additional_content')}
            />
          </div>
        </div>
      </FormSection>

      {/* Values Section */}
      <FormSection title="Values">
        <div className="space-y-4">
          <div>
            <label className={darkLabelClass}>Section Title</label>
            <input
              className={darkInputClass}
              defaultValue={content?.values?.title}
              {...register('values.title')}
            />
          </div>
          <div>
            <label className={darkLabelClass}>Section Subtitle</label>
            <input
              className={darkInputClass}
              defaultValue={content?.values?.subtitle}
              {...register('values.subtitle')}
            />
          </div>
          <p className="text-sm text-slate-400">
            Values are displayed as cards with icons. Available icons: Target, Users, Lightbulb,
            Award
          </p>
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <ul className="space-y-2">
              {content?.values?.items?.map((value, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-slate-300">{value.title}</span>
                  <span className="text-slate-500">-</span>
                  <span className="text-slate-400 truncate">{value.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </FormSection>

      {/* Team Section */}
      <FormSection title="Team Members">
        <div className="flex items-center justify-between mb-4">
          <div />
          <Button type="button" variant="secondary" size="sm" onClick={addTeamMember}>
            <Plus className="h-4 w-4 mr-1" />
            Add Member
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className={darkLabelClass}>Section Title</label>
            <input
              className={darkInputClass}
              defaultValue={content?.team?.title}
              {...register('team.title')}
            />
          </div>
          <div>
            <label className={darkLabelClass}>Section Subtitle</label>
            <input
              className={darkInputClass}
              defaultValue={content?.team?.subtitle}
              {...register('team.subtitle')}
            />
          </div>
        </div>
        <div className="space-y-4 mt-4">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-slate-700/50 rounded-lg p-4 relative border border-slate-600"
            >
              <button
                type="button"
                onClick={() => removeTeamMember(index)}
                className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={darkLabelClass}>Name</label>
                  <input
                    className={darkInputClass}
                    value={member.name}
                    onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className={darkLabelClass}>Position</label>
                  <input
                    className={darkInputClass}
                    value={member.position}
                    onChange={(e) => updateTeamMember(index, 'position', e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className={darkLabelClass}>Bio</label>
                <textarea
                  className={darkTextareaClass}
                  rows={2}
                  value={member.bio}
                  onChange={(e) => updateTeamMember(index, 'bio', e.target.value)}
                />
              </div>
              <div className="mt-4">
                <label className={darkLabelClass}>Image URL</label>
                <input
                  className={darkInputClass}
                  value={member.image}
                  onChange={(e) => updateTeamMember(index, 'image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          ))}
        </div>
      </FormSection>

      {/* CTA Section */}
      <FormSection title="Call to Action">
        <div className="space-y-4">
          <div>
            <label className={darkLabelClass}>Title</label>
            <input
              className={darkInputClass}
              defaultValue={content?.cta?.title}
              {...register('cta.title')}
            />
          </div>
          <div>
            <label className={darkLabelClass}>Subtitle</label>
            <textarea
              className={darkTextareaClass}
              rows={2}
              defaultValue={content?.cta?.subtitle}
              {...register('cta.subtitle')}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={darkLabelClass}>Button Text</label>
              <input
                className={darkInputClass}
                defaultValue={content?.cta?.button_text}
                {...register('cta.button_text')}
              />
            </div>
            <div>
              <label className={darkLabelClass}>Button Link</label>
              <input
                className={darkInputClass}
                defaultValue={content?.cta?.button_link}
                {...register('cta.button_link')}
              />
            </div>
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end pt-4 border-t border-slate-700">
        <Button type="submit" isLoading={mutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save About Page
        </Button>
      </div>
    </form>
  );
}
