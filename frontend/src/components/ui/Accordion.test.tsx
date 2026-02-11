import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Accordion, AccordionItem, FaqAccordion } from './Accordion';

describe('Accordion', () => {
  describe('AccordionItem', () => {
    it('should render with title', () => {
      render(
        <AccordionItem title="Test Title">
          <p>Test content</p>
        </AccordionItem>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should be collapsed by default', () => {
      render(
        <AccordionItem title="Test Title">
          <p>Test content</p>
        </AccordionItem>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should expand when defaultOpen is true', () => {
      render(
        <AccordionItem title="Test Title" defaultOpen>
          <p>Test content</p>
        </AccordionItem>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should toggle when clicked', () => {
      render(
        <AccordionItem title="Test Title">
          <p>Test content</p>
        </AccordionItem>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should render children content', () => {
      render(
        <AccordionItem title="Test Title" defaultOpen>
          <p>Test content paragraph</p>
        </AccordionItem>
      );

      expect(screen.getByText('Test content paragraph')).toBeInTheDocument();
    });

    it('should render with icon', () => {
      render(
        <AccordionItem title="Test Title" icon={<span data-testid="test-icon">Icon</span>}>
          <p>Test content</p>
        </AccordionItem>
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });
  });

  describe('Accordion container', () => {
    it('should render children', () => {
      render(
        <Accordion>
          <AccordionItem title="Item 1">Content 1</AccordionItem>
          <AccordionItem title="Item 2">Content 2</AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <Accordion className="custom-class">
          <AccordionItem title="Item 1">Content 1</AccordionItem>
        </Accordion>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should allow only one item open at a time by default', () => {
      render(
        <Accordion>
          <AccordionItem id="1" title="Item 1">Content 1</AccordionItem>
          <AccordionItem id="2" title="Item 2">Content 2</AccordionItem>
        </Accordion>
      );

      const buttons = screen.getAllByRole('button');

      // Click first item
      fireEvent.click(buttons[0]);
      expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
      expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');

      // Click second item - first should close
      fireEvent.click(buttons[1]);
      expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
      expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
    });

    it('should allow multiple items open when allowMultiple is true', () => {
      render(
        <Accordion allowMultiple>
          <AccordionItem title="Item 1">Content 1</AccordionItem>
          <AccordionItem title="Item 2">Content 2</AccordionItem>
        </Accordion>
      );

      const buttons = screen.getAllByRole('button');

      // Click both items
      fireEvent.click(buttons[0]);
      fireEvent.click(buttons[1]);

      expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
      expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
    });

    it('should render with card variant', () => {
      const { container } = render(
        <Accordion variant="card">
          <AccordionItem id="1" title="Item 1">Content 1</AccordionItem>
        </Accordion>
      );

      // Card variant doesn't have the default container classes
      expect(container.firstChild).not.toHaveClass('bg-white');
    });

    it('should render with minimal variant', () => {
      const { container } = render(
        <Accordion variant="minimal">
          <AccordionItem id="1" title="Item 1">Content 1</AccordionItem>
        </Accordion>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('FaqAccordion', () => {
    const mockFaqs = [
      { id: 1, question: 'What is this?', answer: 'This is a test.' },
      { id: 2, question: 'How does it work?', answer: 'It works well.' },
    ];

    it('should render all FAQ items', () => {
      render(<FaqAccordion faqs={mockFaqs} />);

      expect(screen.getByText('What is this?')).toBeInTheDocument();
      expect(screen.getByText('How does it work?')).toBeInTheDocument();
    });

    it('should render FAQ answers', () => {
      render(<FaqAccordion faqs={mockFaqs} />);

      expect(screen.getByText('This is a test.')).toBeInTheDocument();
      expect(screen.getByText('It works well.')).toBeInTheDocument();
    });

    it('should accept custom variant', () => {
      render(<FaqAccordion faqs={mockFaqs} variant="minimal" />);

      expect(screen.getByText('What is this?')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(
        <FaqAccordion faqs={mockFaqs} className="custom-faq-class" />
      );

      expect(container.firstChild).toHaveClass('custom-faq-class');
    });

    it('should handle empty faqs array', () => {
      const { container } = render(<FaqAccordion faqs={[]} />);

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
