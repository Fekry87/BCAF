import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button, IconOrImage } from '@/components/ui';
import { get } from '@/services/api';

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
      icon_image?: string;
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

const defaultContent: AboutPageContent = {
  hero: {
    title: 'About Us',
    subtitle: 'We are a team of experienced consultants and educators dedicated to helping organisations and individuals achieve their potential through thoughtful, evidence-based guidance.',
    background_image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=2000&q=80',
  },
  mission: {
    title: 'Our Mission',
    content: 'To bridge the gap between academic insight and practical application, providing organisations and learners with the strategic guidance they need to navigate complexity and achieve meaningful outcomes.',
    additional_content: 'We believe that the best solutions emerge from a combination of rigorous analysis, deep expertise, and genuine collaboration. Our approach honours both the science and the art of effective strategy and learning.',
  },
  values: {
    title: 'Our Values',
    subtitle: 'The principles that guide our work and define our approach to every engagement.',
    items: [
      {
        icon: 'Target',
        title: 'Evidence-Based',
        description: 'We ground our recommendations in rigorous analysis and proven methodologies, ensuring that every strategy is built on solid foundations.',
      },
      {
        icon: 'Users',
        title: 'Collaborative',
        description: 'We work alongside our clients as partners, bringing expertise while respecting and building upon your deep knowledge of your own context.',
      },
      {
        icon: 'Lightbulb',
        title: 'Practical',
        description: 'Academic rigour meets real-world application. Our solutions are designed to work in practice, not just in theory.',
      },
      {
        icon: 'Award',
        title: 'Excellence',
        description: 'We hold ourselves to the highest standards in everything we do, from initial consultation through to final delivery and beyond.',
      },
    ],
  },
  approach: {
    title: 'Our Approach',
    paragraphs: [
      'We begin every engagement by listening carefully to understand your specific context, challenges, and aspirations. This foundational understanding allows us to tailor our approach to your unique circumstances.',
      'Our methodology draws on established frameworks and best practices, adapted thoughtfully to fit your situation. We believe in transparency throughout the process, keeping you informed and involved at every stage.',
      'We measure success not just by the quality of our recommendations, but by the real-world outcomes they help you achieve. Our commitment extends beyond the initial engagement to ensure lasting impact.',
    ],
    process_title: 'Our Process',
    process_steps: [
      { step: '01', title: 'Understand', description: 'Deep discovery to understand your context and goals' },
      { step: '02', title: 'Analyse', description: 'Rigorous assessment using proven methodologies' },
      { step: '03', title: 'Strategise', description: 'Develop tailored recommendations and roadmap' },
      { step: '04', title: 'Implement', description: 'Support execution with hands-on guidance' },
      { step: '05', title: 'Evaluate', description: 'Measure outcomes and refine approach' },
    ],
  },
  team: {
    title: 'Our Team',
    subtitle: 'Experienced professionals with diverse backgrounds in business, education, and research, united by a shared commitment to excellence.',
    members: [
      { name: 'Team Member', position: 'Position Title', bio: 'Brief bio highlighting expertise and background.', image: '' },
      { name: 'Team Member', position: 'Position Title', bio: 'Brief bio highlighting expertise and background.', image: '' },
      { name: 'Team Member', position: 'Position Title', bio: 'Brief bio highlighting expertise and background.', image: '' },
    ],
  },
  cta: {
    title: "Let's work together",
    subtitle: "Whether you're facing a strategic challenge or seeking to enhance educational outcomes, we're here to help.",
    button_text: 'Get in touch',
    button_link: '/contact',
  },
};

export function AboutPage() {
  const { data: contentData, isLoading } = useQuery({
    queryKey: ['content', 'pages', 'about'],
    queryFn: () => get<AboutPageContent>('/content/pages/about'),
  });

  const content = contentData?.data || defaultContent;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
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
            backgroundImage: `url("${content.hero.background_image}")`,
          }}
        />
        <div className="container-main relative z-10 px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="divider-accent mb-4 sm:mb-6" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-white mb-4 sm:mb-6 leading-tight">
              {content.hero.title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-primary-100 leading-relaxed">
              {content.hero.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section">
        <div className="container-main px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif font-semibold text-primary-900 mb-4 sm:mb-6">
              {content.mission.title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-neutral-600 leading-relaxed mb-3 sm:mb-4">
              {content.mission.content}
            </p>
            {content.mission.additional_content && (
              <p className="text-xs sm:text-sm md:text-base text-neutral-600 leading-relaxed">
                {content.mission.additional_content}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section bg-neutral-50">
        <div className="container-main px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="divider-accent mx-auto mb-4 sm:mb-6" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif font-semibold text-primary-900 mb-3 sm:mb-4">
              {content.values.title}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-neutral-600 max-w-2xl mx-auto">
              {content.values.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {content.values.items.map((value) => (
              <div key={value.title} className="text-center">
                <div className="mx-auto mb-3 sm:mb-4 flex justify-center">
                  <IconOrImage
                    icon={value.icon}
                    imageUrl={value.icon_image}
                    size="lg"
                    alt={value.title}
                    bgColor="bg-primary-100"
                    className="rounded-lg sm:rounded-xl w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
                  />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-serif font-semibold text-primary-900 mb-2 sm:mb-3">{value.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="section">
        <div className="container-main px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div>
              <div className="divider-accent mb-4 sm:mb-6" />
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif font-semibold text-primary-900 mb-4 sm:mb-6">
                {content.approach.title}
              </h2>
              <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm md:text-base text-neutral-600">
                {content.approach.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
            <div className="bg-primary-50 rounded-xl sm:rounded-2xl p-5 sm:p-8 lg:p-12">
              <h3 className="text-base sm:text-lg md:text-xl font-serif font-semibold text-primary-900 mb-4 sm:mb-6">
                {content.approach.process_title}
              </h3>
              <ol className="space-y-4 sm:space-y-6">
                {content.approach.process_steps.map((item) => (
                  <li key={item.step} className="flex gap-3 sm:gap-4">
                    <span className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-primary-700 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-semibold">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-primary-900">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-neutral-600">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section bg-neutral-50">
        <div className="container-main px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="divider-accent mx-auto mb-4 sm:mb-6" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif font-semibold text-primary-900 mb-3 sm:mb-4">
              {content.team.title}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-neutral-600 max-w-2xl mx-auto">
              {content.team.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            {content.team.members.map((member, i) => (
              <div key={i} className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 text-center shadow-card">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full mx-auto mb-3 sm:mb-4 object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-neutral-200 rounded-full mx-auto mb-3 sm:mb-4" />
                )}
                <h3 className="text-sm sm:text-base md:text-lg font-serif font-semibold text-primary-900 mb-1">{member.name}</h3>
                <p className="text-xs sm:text-sm text-neutral-500 mb-2 sm:mb-3">{member.position}</p>
                <p className="text-xs sm:text-sm text-neutral-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-primary-700">
        <div className="container-main text-center px-4 sm:px-6">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif font-semibold text-white mb-3 sm:mb-4">
            {content.cta.title}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-primary-100 max-w-2xl mx-auto mb-6 sm:mb-8">
            {content.cta.subtitle}
          </p>
          <Button
            as={Link}
            to={content.cta.button_link}
            size="lg"
            className="w-full sm:w-auto bg-white text-primary-700 hover:bg-primary-50"
          >
            {content.cta.button_text}
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </section>
    </>
  );
}
