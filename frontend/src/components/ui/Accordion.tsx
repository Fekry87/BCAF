import { useState, ReactNode, createContext, useContext } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, Plus, Minus } from 'lucide-react';

// Context for accordion group (allows only one open at a time)
interface AccordionContextType {
  openId: string | null;
  setOpenId: (id: string | null) => void;
  variant: 'default' | 'card' | 'minimal';
}

const AccordionContext = createContext<AccordionContextType | null>(null);

interface AccordionItemProps {
  id?: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
}

export function AccordionItem({ id, title, children, defaultOpen = false, icon }: AccordionItemProps) {
  const context = useContext(AccordionContext);
  const [localOpen, setLocalOpen] = useState(defaultOpen);

  const isControlled = context !== null && id !== undefined;
  const isOpen = isControlled ? context.openId === id : localOpen;
  const variant = context?.variant || 'default';

  const handleToggle = () => {
    if (isControlled) {
      context.setOpenId(isOpen ? null : id!);
    } else {
      setLocalOpen(!localOpen);
    }
  };

  const itemClasses = clsx(
    'transition-all duration-200',
    {
      // Default variant - modern list style
      'border-b border-neutral-200 last:border-b-0': variant === 'default',
      'bg-neutral-50/50': variant === 'default' && isOpen,
      // Card variant
      'bg-white rounded-xl shadow-sm border border-neutral-200 mb-3 overflow-hidden': variant === 'card',
      'shadow-md border-primary-200': variant === 'card' && isOpen,
      // Minimal variant
      'border-l-4 pl-4 mb-4': variant === 'minimal',
      'border-primary-500 bg-primary-50/50': variant === 'minimal' && isOpen,
      'border-neutral-200 hover:border-neutral-300': variant === 'minimal' && !isOpen,
    }
  );

  const triggerClasses = clsx(
    'w-full flex items-center justify-between text-left text-sm sm:text-base font-medium transition-all duration-200',
    {
      // Default variant - modern list style
      'py-4 sm:py-5 px-3 sm:px-4 text-primary-900 hover:text-primary-700 hover:bg-neutral-50 rounded-lg -mx-3 sm:-mx-4': variant === 'default',
      'text-primary-700': variant === 'default' && isOpen,
      // Card variant
      'p-4 sm:p-5 text-primary-900': variant === 'card',
      'bg-primary-50': variant === 'card' && isOpen,
      'hover:bg-neutral-50': variant === 'card' && !isOpen,
      // Minimal variant
      'py-2 sm:py-3 text-neutral-800 hover:text-primary-700': variant === 'minimal',
    }
  );

  const contentClasses = clsx(
    'overflow-hidden transition-all duration-300',
    isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
  );

  const contentInnerClasses = clsx(
    'text-xs sm:text-sm md:text-base text-neutral-600 leading-relaxed',
    {
      'pb-4 sm:pb-5 px-3 sm:px-4': variant === 'default',
      'px-4 sm:px-5 pb-4 sm:pb-5': variant === 'card',
      'pb-2 sm:pb-3': variant === 'minimal',
    }
  );

  return (
    <div className={itemClasses}>
      <button
        type="button"
        className={triggerClasses}
        onClick={handleToggle}
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3 pr-4">
          {variant === 'default' && isOpen && (
            <span className="w-1 h-5 bg-accent-yellow rounded flex-shrink-0" />
          )}
          {icon && <span className="text-primary-600 flex-shrink-0">{icon}</span>}
          <span className="text-left">{title}</span>
        </span>

        {variant === 'card' ? (
          <div className={clsx(
            'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
            isOpen ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-500'
          )}>
            <ChevronDown className={clsx(
              'h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300',
              isOpen && 'rotate-180'
            )} />
          </div>
        ) : (
          isOpen ? (
            <Minus className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 flex-shrink-0" />
          ) : (
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400 flex-shrink-0" />
          )
        )}
      </button>

      <div className={contentClasses}>
        <div className={contentInnerClasses}>
          {children}
        </div>
      </div>
    </div>
  );
}

interface AccordionProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'card' | 'minimal';
  allowMultiple?: boolean;
}

export function Accordion({
  children,
  className,
  variant = 'default',
  allowMultiple = false
}: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const containerClasses = clsx(
    className,
    {
      'bg-white rounded-lg sm:rounded-xl border border-neutral-200 shadow-sm px-3 sm:px-4 divide-y divide-neutral-100': variant === 'default',
    }
  );

  if (allowMultiple) {
    return (
      <div className={containerClasses}>
        {children}
      </div>
    );
  }

  return (
    <AccordionContext.Provider value={{ openId, setOpenId, variant }}>
      <div className={containerClasses}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// Enhanced FAQ-specific component
interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
  variant?: 'default' | 'card' | 'minimal';
  className?: string;
}

export function FaqAccordion({ faqs, variant = 'card', className }: FaqAccordionProps) {
  return (
    <Accordion variant={variant} className={className}>
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} id={String(faq.id)} title={faq.question}>
          <p>{faq.answer}</p>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
