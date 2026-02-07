import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Home,
  FileText,
  Mail,
  Settings,
  Loader2,
  Save,
  Layout,
  Menu,
  Plus,
  Trash2,
} from 'lucide-react';
import { get, put, del } from '@/services/api';
import { Button } from '@/components/ui';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

// Dark mode classes are defined below for admin forms

type ContentTab = 'settings' | 'header' | 'footer' | 'home' | 'about' | 'contact';

interface SiteSettings {
  site_name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  linkedin_url: string;
  twitter_url: string;
}

interface HeaderContent {
  logo_text: string;
  logo_image: string | null;
  nav_links: Array<{ to: string; label: string }>;
}

interface FooterContent {
  brand_description: string;
  quick_links: Array<{ to: string; label: string }>;
  legal_links: Array<{ to: string; label: string }>;
}

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
  cta_section: {
    title: string;
    subtitle: string;
    button_text: string;
    button_link: string;
  };
}

interface AboutPageContent {
  hero: {
    title: string;
    subtitle: string;
    background_image: string;
  };
  mission: {
    title: string;
    content: string;
    additional_content: string;
  };
  values: {
    title: string;
    subtitle: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  approach: {
    title: string;
    paragraphs: string[];
    process_title: string;
    process_steps: Array<{
      step: string;
      title: string;
      description: string;
    }>;
  };
  team: {
    title: string;
    subtitle: string;
    members: Array<{
      name: string;
      position: string;
      bio: string;
      image: string;
    }>;
  };
  cta: {
    title: string;
    subtitle: string;
    button_text: string;
    button_link: string;
  };
}

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

const tabs: { id: ContentTab; label: string; icon: typeof Home }[] = [
  { id: 'settings', label: 'Site Settings', icon: Settings },
  { id: 'header', label: 'Header', icon: Menu },
  { id: 'footer', label: 'Footer', icon: Layout },
  { id: 'home', label: 'Home Page', icon: Home },
  { id: 'about', label: 'About Page', icon: FileText },
  { id: 'contact', label: 'Contact Page', icon: Mail },
];

// Dark mode input styles for admin forms
const darkInputClass = "w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const darkLabelClass = "block text-sm font-semibold text-slate-300 mb-2";
const darkTextareaClass = "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[120px] resize-y";

function SiteSettingsForm() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'content', 'settings'],
    queryFn: () => get<SiteSettings>('/admin/content/settings'),
  });

  const { register, handleSubmit } = useForm<SiteSettings>();

  const mutation = useMutation({
    mutationFn: (data: SiteSettings) => put<SiteSettings>('/admin/content/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'content', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Site settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
      </div>
    );
  }

  const settings = data?.data;

  return (
    <form
      onSubmit={handleSubmit((formData) => mutation.mutate(formData))}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={darkLabelClass}>Site Name</label>
          <input className={darkInputClass} defaultValue={settings?.site_name} {...register('site_name')} />
        </div>
        <div>
          <label className={darkLabelClass}>Tagline</label>
          <input className={darkInputClass} defaultValue={settings?.tagline} {...register('tagline')} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={darkLabelClass}>Email</label>
          <input className={darkInputClass} type="email" defaultValue={settings?.email} {...register('email')} />
        </div>
        <div>
          <label className={darkLabelClass}>Phone</label>
          <input className={darkInputClass} defaultValue={settings?.phone} {...register('phone')} />
        </div>
      </div>

      <div>
        <label className={darkLabelClass}>Address</label>
        <textarea className={darkTextareaClass} rows={2} defaultValue={settings?.address} {...register('address')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={darkLabelClass}>LinkedIn URL</label>
          <input className={darkInputClass} defaultValue={settings?.linkedin_url} {...register('linkedin_url')} />
        </div>
        <div>
          <label className={darkLabelClass}>Twitter URL</label>
          <input className={darkInputClass} defaultValue={settings?.twitter_url} {...register('twitter_url')} />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-700">
        <Button type="submit" isLoading={mutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </form>
  );
}

function HeaderContentForm() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'content', 'header'],
    queryFn: () => get<HeaderContent>('/admin/content/header'),
  });

  const { register, handleSubmit, setValue, watch } = useForm<HeaderContent>();
  const logoImage = watch('logo_image');

  const mutation = useMutation({
    mutationFn: (data: HeaderContent) => put<HeaderContent>('/admin/content/header', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'content', 'header'] });
      queryClient.invalidateQueries({ queryKey: ['content', 'header'] });
      toast.success('Header updated successfully');
    },
    onError: () => {
      toast.error('Failed to update header');
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, GIF, SVG, or WebP image.');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 2MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/content/header/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.data?.url) {
        setValue('logo_image', result.data.url);
        queryClient.invalidateQueries({ queryKey: ['admin', 'content', 'header'] });
        queryClient.invalidateQueries({ queryKey: ['content', 'header'] });
        toast.success('Logo uploaded successfully');
      } else {
        toast.error(result.message || 'Failed to upload logo');
      }
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await del('/admin/content/header/logo');
      setValue('logo_image', '');
      queryClient.invalidateQueries({ queryKey: ['admin', 'content', 'header'] });
      queryClient.invalidateQueries({ queryKey: ['content', 'header'] });
      toast.success('Logo removed');
    } catch (error) {
      toast.error('Failed to remove logo');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
      </div>
    );
  }

  const header = data?.data;
  const currentLogo = logoImage ?? header?.logo_image;

  return (
    <form
      onSubmit={handleSubmit((formData) => mutation.mutate(formData))}
      className="space-y-6"
    >
      <div>
        <label className={darkLabelClass}>Logo Text</label>
        <input
          className={darkInputClass}
          defaultValue={header?.logo_text}
          {...register('logo_text')}
          placeholder="Your company name"
        />
      </div>

      {/* Logo Upload Section */}
      <div>
        <label className={darkLabelClass}>Logo Image</label>

        {currentLogo ? (
          <div className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between border border-slate-600">
            <div className="flex items-center gap-4">
              <img
                src={currentLogo}
                alt="Logo preview"
                className="h-16 w-auto object-contain bg-slate-800 rounded border border-slate-600 p-2"
              />
              <div>
                <p className="text-sm font-medium text-white">Current Logo</p>
                <p className="text-xs text-slate-400 truncate max-w-xs">{currentLogo}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRemoveLogo}
              className="text-red-400 hover:text-red-300"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="bg-slate-700/30 border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
            <ImageIcon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-sm text-slate-400 mb-4">
              No logo uploaded. Upload an image or enter a URL below.
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center gap-4">
          <label className="flex-1">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={uploading}
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {uploading ? 'Uploading...' : 'Upload Logo'}
            </Button>
          </label>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          Supported formats: JPEG, PNG, GIF, SVG, WebP. Max size: 2MB.
        </p>

        {/* Optional: Manual URL input */}
        <div className="mt-4">
          <label className={darkLabelClass}>Or enter logo URL manually</label>
          <input
            className={darkInputClass}
            placeholder="https://example.com/logo.png"
            defaultValue={header?.logo_image || ''}
            {...register('logo_image')}
          />
        </div>
      </div>

      <div className="border-t border-slate-700 pt-6">
        <h3 className="text-sm font-semibold text-white mb-4">Navigation Links</h3>
        <p className="text-sm text-slate-400 mb-4">
          Navigation links are automatically generated from your pillars. To modify them,
          update your pillars in the Pillars section.
        </p>
        {header?.nav_links && header.nav_links.length > 0 && (
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <ul className="space-y-2">
              {header.nav_links.map((link, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-slate-300">{link.label}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-slate-400">{link.to}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-700">
        <Button type="submit" isLoading={mutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save Header
        </Button>
      </div>
    </form>
  );
}

function FooterContentForm() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'content', 'footer'],
    queryFn: () => get<FooterContent>('/admin/content/footer'),
  });

  const { register, handleSubmit } = useForm<FooterContent>();

  const mutation = useMutation({
    mutationFn: (data: FooterContent) => put<FooterContent>('/admin/content/footer', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'content', 'footer'] });
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Footer updated successfully');
    },
    onError: () => {
      toast.error('Failed to update footer');
    },
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
      </div>
    );
  }

  const footer = data?.data;

  return (
    <form
      onSubmit={handleSubmit((formData) => mutation.mutate(formData))}
      className="space-y-6"
    >
      <div>
        <label className={darkLabelClass}>Brand Description</label>
        <textarea
          className={darkTextareaClass}
          rows={3}
          defaultValue={footer?.brand_description}
          {...register('brand_description')}
          placeholder="Brief description shown in the footer"
        />
      </div>

      <div className="border-t border-slate-700 pt-6">
        <h3 className="text-sm font-semibold text-white mb-4">Quick Links</h3>
        <p className="text-sm text-slate-400 mb-4">
          Quick links are automatically generated from your site structure.
        </p>
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <ul className="space-y-2">
            {footer?.quick_links?.map((link, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <span className="font-medium text-slate-300">{link.label}</span>
                <span className="text-slate-500">→</span>
                <span className="text-slate-400">{link.to}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-700">
        <Button type="submit" isLoading={mutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save Footer
        </Button>
      </div>
    </form>
  );
}

function HomePageForm() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'content', 'pages', 'home'],
    queryFn: () => get<HomePageContent>('/admin/content/pages/home'),
  });

  const { register, handleSubmit } = useForm<HomePageContent>();

  const mutation = useMutation({
    mutationFn: (data: HomePageContent) =>
      put<HomePageContent>('/admin/content/pages/home', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'content', 'pages', 'home'] });
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Home page updated successfully');
    },
    onError: () => {
      toast.error('Failed to update home page');
    },
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
      </div>
    );
  }

  const content = data?.data;

  return (
    <form
      onSubmit={handleSubmit((formData) => mutation.mutate(formData))}
      className="space-y-8"
    >
      {/* Hero Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Hero Section</h3>
        <div className="space-y-4">
          <div>
            <label className={darkLabelClass}>Title</label>
            <input className={darkInputClass} defaultValue={content?.hero?.title} {...register('hero.title')} />
          </div>
          <div>
            <label className={darkLabelClass}>Subtitle</label>
            <textarea className={darkTextareaClass} rows={2} defaultValue={content?.hero?.subtitle} {...register('hero.subtitle')} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={darkLabelClass}>Primary CTA Text</label>
              <input className={darkInputClass} defaultValue={content?.hero?.cta_text} {...register('hero.cta_text')} />
            </div>
            <div>
              <label className={darkLabelClass}>Primary CTA Link</label>
              <input className={darkInputClass} defaultValue={content?.hero?.cta_link} {...register('hero.cta_link')} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={darkLabelClass}>Secondary CTA Text</label>
              <input className={darkInputClass} defaultValue={content?.hero?.secondary_cta_text} {...register('hero.secondary_cta_text')} />
            </div>
            <div>
              <label className={darkLabelClass}>Secondary CTA Link</label>
              <input className={darkInputClass} defaultValue={content?.hero?.secondary_cta_link} {...register('hero.secondary_cta_link')} />
            </div>
          </div>
          <div>
            <label className={darkLabelClass}>Background Image URL</label>
            <input className={darkInputClass} defaultValue={content?.hero?.background_image} {...register('hero.background_image')} />
          </div>
        </div>
      </div>

      {/* Pillars Section */}
      <div className="border-t border-slate-700 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Pillars Section</h3>
        <div className="space-y-4">
          <div>
            <label className={darkLabelClass}>Section Title</label>
            <input className={darkInputClass} defaultValue={content?.pillars_section?.title} {...register('pillars_section.title')} />
          </div>
          <div>
            <label className={darkLabelClass}>Section Subtitle</label>
            <textarea className={darkTextareaClass} rows={2} defaultValue={content?.pillars_section?.subtitle} {...register('pillars_section.subtitle')} />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-slate-700 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Call to Action Section</h3>
        <div className="space-y-4">
          <div>
            <label className={darkLabelClass}>Section Title</label>
            <input className={darkInputClass} defaultValue={content?.cta_section?.title} {...register('cta_section.title')} />
          </div>
          <div>
            <label className={darkLabelClass}>Section Subtitle</label>
            <textarea className={darkTextareaClass} rows={2} defaultValue={content?.cta_section?.subtitle} {...register('cta_section.subtitle')} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={darkLabelClass}>Button Text</label>
              <input className={darkInputClass} defaultValue={content?.cta_section?.button_text} {...register('cta_section.button_text')} />
            </div>
            <div>
              <label className={darkLabelClass}>Button Link</label>
              <input className={darkInputClass} defaultValue={content?.cta_section?.button_link} {...register('cta_section.button_link')} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-700">
        <Button type="submit" isLoading={mutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save Home Page
        </Button>
      </div>
    </form>
  );
}

function AboutPageForm() {
  const queryClient = useQueryClient();
  const [teamMembers, setTeamMembers] = useState<Array<{ name: string; position: string; bio: string; image: string }>>([]);
  const [values, setValues] = useState<Array<{ icon: string; title: string; description: string }>>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'content', 'pages', 'about'],
    queryFn: () => get<AboutPageContent>('/admin/content/pages/about'),
  });

  const { register, handleSubmit } = useForm<AboutPageContent>();

  // Initialize state when data loads
  useState(() => {
    if (data?.data) {
      setTeamMembers(data.data.team?.members || []);
      setValues(data.data.values?.items || []);
    }
  });

  const mutation = useMutation({
    mutationFn: (formData: AboutPageContent) => {
      // Merge form data with dynamic arrays
      const fullData = {
        ...formData,
        team: {
          ...formData.team,
          members: teamMembers,
        },
        values: {
          ...formData.values,
          items: values,
        },
      };
      return put<AboutPageContent>('/admin/content/pages/about', fullData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'content', 'pages', 'about'] });
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('About page updated successfully');
    },
    onError: () => {
      toast.error('Failed to update about page');
    },
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
      </div>
    );
  }

  const content = data?.data;

  // Set initial values
  if (content && teamMembers.length === 0 && content.team?.members) {
    setTeamMembers(content.team.members);
  }
  if (content && values.length === 0 && content.values?.items) {
    setValues(content.values.items);
  }

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: '', position: '', bio: '', image: '' }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  return (
    <form
      onSubmit={handleSubmit((formData) => mutation.mutate(formData))}
      className="space-y-8"
    >
      {/* Hero Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Hero Section</h3>
        <div className="space-y-4">
          <div>
            <label className={darkLabelClass}>Title</label>
            <input className={darkInputClass} defaultValue={content?.hero?.title} {...register('hero.title')} />
          </div>
          <div>
            <label className={darkLabelClass}>Subtitle</label>
            <textarea className={darkTextareaClass} rows={2} defaultValue={content?.hero?.subtitle} {...register('hero.subtitle')} />
          </div>
          <div>
            <label className={darkLabelClass}>Background Image URL</label>
            <input className={darkInputClass} defaultValue={content?.hero?.background_image} {...register('hero.background_image')} />
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="border-t border-slate-700 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Mission</h3>
        <div className="space-y-4">
          <div>
            <label className={darkLabelClass}>Section Title</label>
            <input className={darkInputClass} defaultValue={content?.mission?.title} {...register('mission.title')} />
          </div>
          <div>
            <label className={darkLabelClass}>Main Content</label>
            <textarea className={darkTextareaClass} rows={3} defaultValue={content?.mission?.content} {...register('mission.content')} />
          </div>
          <div>
            <label className={darkLabelClass}>Additional Content</label>
            <textarea className={darkTextareaClass} rows={3} defaultValue={content?.mission?.additional_content} {...register('mission.additional_content')} />
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="border-t border-slate-700 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Values</h3>
        <div className="space-y-4">
          <div>
            <label className={darkLabelClass}>Section Title</label>
            <input className={darkInputClass} defaultValue={content?.values?.title} {...register('values.title')} />
          </div>
          <div>
            <label className={darkLabelClass}>Section Subtitle</label>
            <input className={darkInputClass} defaultValue={content?.values?.subtitle} {...register('values.subtitle')} />
          </div>
          <p className="text-sm text-slate-400">
            Values are displayed as cards with icons. Available icons: Target, Users, Lightbulb, Award
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
      </div>

      {/* Team Section */}
      <div className="border-t border-slate-700 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Team Members</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addTeamMember}>
            <Plus className="h-4 w-4 mr-1" />
            Add Member
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className={darkLabelClass}>Section Title</label>
            <input className={darkInputClass} defaultValue={content?.team?.title} {...register('team.title')} />
          </div>
          <div>
            <label className={darkLabelClass}>Section Subtitle</label>
            <input className={darkInputClass} defaultValue={content?.team?.subtitle} {...register('team.subtitle')} />
          </div>
        </div>
        <div className="space-y-4 mt-4">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-slate-700/50 rounded-lg p-4 relative border border-slate-600">
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
      </div>

      {/* CTA Section */}
      <div className="border-t border-slate-700 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Call to Action</h3>
        <div className="space-y-4">
          <div>
            <label className={darkLabelClass}>Title</label>
            <input className={darkInputClass} defaultValue={content?.cta?.title} {...register('cta.title')} />
          </div>
          <div>
            <label className={darkLabelClass}>Subtitle</label>
            <textarea className={darkTextareaClass} rows={2} defaultValue={content?.cta?.subtitle} {...register('cta.subtitle')} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={darkLabelClass}>Button Text</label>
              <input className={darkInputClass} defaultValue={content?.cta?.button_text} {...register('cta.button_text')} />
            </div>
            <div>
              <label className={darkLabelClass}>Button Link</label>
              <input className={darkInputClass} defaultValue={content?.cta?.button_link} {...register('cta.button_link')} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-700">
        <Button type="submit" isLoading={mutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save About Page
        </Button>
      </div>
    </form>
  );
}

function ContactPageForm() {
  const queryClient = useQueryClient();
  const [officeHours, setOfficeHours] = useState<Array<{ day: string; hours: string }>>([]);

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
      queryClient.invalidateQueries({ queryKey: ['admin', 'content', 'pages', 'contact'] });
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Contact page updated successfully');
    },
    onError: () => {
      toast.error('Failed to update contact page');
    },
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
      </div>
    );
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

  const updateOfficeHour = (index: number, field: string, value: string) => {
    const updated = [...officeHours];
    updated[index] = { ...updated[index], [field]: value };
    setOfficeHours(updated);
  };

  return (
    <form
      onSubmit={handleSubmit((formData) => mutation.mutate(formData))}
      className="space-y-8"
    >
      {/* Hero Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Hero Section</h3>
        <div className="space-y-4">
          <div>
            <label className={darkLabelClass}>Title</label>
            <input className={darkInputClass} defaultValue={content?.hero?.title} {...register('hero.title')} />
          </div>
          <div>
            <label className={darkLabelClass}>Subtitle</label>
            <textarea className={darkTextareaClass} rows={2} defaultValue={content?.hero?.subtitle} {...register('hero.subtitle')} />
          </div>
        </div>
      </div>

      {/* Contact Options */}
      <div className="border-t border-slate-700 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Contact Options</h3>

        <div className="space-y-6">
          {/* Call Option */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h4 className="font-medium text-white mb-3">Call Option</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={darkLabelClass}>Title</label>
                <input className={darkInputClass} defaultValue={content?.contact_options?.call?.title} {...register('contact_options.call.title')} />
              </div>
              <div>
                <label className={darkLabelClass}>Subtitle</label>
                <input className={darkInputClass} defaultValue={content?.contact_options?.call?.subtitle} {...register('contact_options.call.subtitle')} />
              </div>
            </div>
            <div className="mt-4">
              <label className={darkLabelClass}>Phone Number</label>
              <input className={darkInputClass} defaultValue={content?.contact_options?.call?.phone} {...register('contact_options.call.phone')} />
            </div>
          </div>

          {/* Email Option */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h4 className="font-medium text-white mb-3">Email Option</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={darkLabelClass}>Title</label>
                <input className={darkInputClass} defaultValue={content?.contact_options?.email?.title} {...register('contact_options.email.title')} />
              </div>
              <div>
                <label className={darkLabelClass}>Subtitle</label>
                <input className={darkInputClass} defaultValue={content?.contact_options?.email?.subtitle} {...register('contact_options.email.subtitle')} />
              </div>
            </div>
            <div className="mt-4">
              <label className={darkLabelClass}>Email Address</label>
              <input className={darkInputClass} defaultValue={content?.contact_options?.email?.email} {...register('contact_options.email.email')} />
            </div>
          </div>

          {/* Message Option */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h4 className="font-medium text-white mb-3">Message Option</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={darkLabelClass}>Title</label>
                <input className={darkInputClass} defaultValue={content?.contact_options?.message?.title} {...register('contact_options.message.title')} />
              </div>
              <div>
                <label className={darkLabelClass}>Subtitle</label>
                <input className={darkInputClass} defaultValue={content?.contact_options?.message?.subtitle} {...register('contact_options.message.subtitle')} />
              </div>
              <div>
                <label className={darkLabelClass}>Button Text</label>
                <input className={darkInputClass} defaultValue={content?.contact_options?.message?.button_text} {...register('contact_options.message.button_text')} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="border-t border-slate-700 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Contact Form</h3>
        <div>
          <label className={darkLabelClass}>Form Title</label>
          <input className={darkInputClass} defaultValue={content?.form?.title} {...register('form.title')} />
        </div>
      </div>

      {/* Office Hours */}
      <div className="border-t border-slate-700 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Office Hours</h3>
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
      </div>

      {/* Address */}
      <div className="border-t border-slate-700 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
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
      </div>

      {/* Response Time */}
      <div className="border-t border-slate-700 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Response Time</h3>
        <div>
          <label className={darkLabelClass}>Response Time Message</label>
          <textarea className={darkTextareaClass} rows={2} defaultValue={content?.response_time?.text} {...register('response_time.text')} />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-700">
        <Button type="submit" isLoading={mutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save Contact Page
        </Button>
      </div>
    </form>
  );
}

export function AdminContent() {
  const [activeTab, setActiveTab] = useState<ContentTab>('settings');

  const renderContent = () => {
    switch (activeTab) {
      case 'settings':
        return <SiteSettingsForm />;
      case 'header':
        return <HeaderContentForm />;
      case 'footer':
        return <FooterContentForm />;
      case 'home':
        return <HomePageForm />;
      case 'about':
        return <AboutPageForm />;
      case 'contact':
        return <ContactPageForm />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h2 text-white">Content Management</h1>
        <p className="text-slate-400 mt-1">
          Customize your website content, header, footer, and page settings
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 mb-6">
        <div className="border-b border-slate-700">
          <nav className="flex flex-wrap -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
}
