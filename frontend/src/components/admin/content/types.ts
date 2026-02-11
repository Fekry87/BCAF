export type ContentTab = 'settings' | 'header' | 'footer' | 'home' | 'about' | 'contact';

export interface SiteSettings {
  site_name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  linkedin_url: string;
  twitter_url: string;
}

export interface HeaderContent {
  logo_text: string;
  logo_image: string | null;
  nav_links: Array<{ to: string; label: string }>;
}

export interface FooterContent {
  brand_description: string;
  quick_links: Array<{ to: string; label: string }>;
  legal_links: Array<{ to: string; label: string }>;
}

export interface HomePageContent {
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

export interface AboutPageContent {
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

export interface ContactPageContent {
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

export interface TeamMember {
  name: string;
  position: string;
  bio: string;
  image: string;
}

export interface OfficeHourItem {
  day: string;
  hours: string;
}

export interface ValueItem {
  icon: string;
  title: string;
  description: string;
}
