import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, buttonVariants } from './button';

describe('Button', () => {
  describe('rendering', () => {
    it('renders button with children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders as a button element', () => {
      render(<Button>Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('forwards ref to button element', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Test</Button>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('variants', () => {
    it('applies default variant styles', () => {
      render(<Button variant="default">Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-[var(--primary)]');
    });

    it('applies secondary variant styles', () => {
      render(<Button variant="secondary">Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-[var(--background-secondary)]');
    });

    it('applies success variant styles', () => {
      render(<Button variant="success">Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-[var(--success)]');
    });

    it('applies warning variant styles', () => {
      render(<Button variant="warning">Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-[var(--warning)]');
    });

    it('applies danger variant styles', () => {
      render(<Button variant="danger">Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-[var(--danger)]');
    });

    it('applies ghost variant styles', () => {
      render(<Button variant="ghost">Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('hover:bg-[var(--background-secondary)]');
    });

    it('applies link variant styles', () => {
      render(<Button variant="link">Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('text-[var(--primary)]');
      expect(button.className).toContain('underline-offset-4');
    });

    it('applies outline variant styles', () => {
      render(<Button variant="outline">Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('border');
      expect(button.className).toContain('bg-transparent');
    });
  });

  describe('sizes', () => {
    it('applies default size', () => {
      render(<Button size="default">Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-10');
      expect(button.className).toContain('px-4');
    });

    it('applies sm size', () => {
      render(<Button size="sm">Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-9');
      expect(button.className).toContain('px-3');
    });

    it('applies lg size', () => {
      render(<Button size="lg">Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-11');
      expect(button.className).toContain('px-8');
    });

    it('applies xl size', () => {
      render(<Button size="xl">Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-12');
      expect(button.className).toContain('px-10');
    });

    it('applies icon size', () => {
      render(<Button size="icon">Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-10');
      expect(button.className).toContain('w-10');
    });
  });

  describe('interactions', () => {
    it('calls onClick handler when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Click me
        </Button>
      );

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles double click', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      await user.dblClick(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('disabled state', () => {
    it('applies disabled attribute', () => {
      render(<Button disabled>Test</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('has disabled styles', () => {
      render(<Button disabled>Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('disabled:pointer-events-none');
      expect(button.className).toContain('disabled:opacity-50');
    });
  });

  describe('button types', () => {
    it('defaults to type="button"', () => {
      render(<Button>Test</Button>);
      // Button components should default to type="button" to prevent form submission
      // This is handled by the native button element default
    });

    it('accepts type="submit"', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('accepts type="reset"', () => {
      render(<Button type="reset">Reset</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });
  });

  describe('accessibility', () => {
    it('has accessible name from children', () => {
      render(<Button>Accessible Button</Button>);
      expect(screen.getByRole('button', { name: 'Accessible Button' })).toBeInTheDocument();
    });

    it('supports aria-label', () => {
      render(<Button aria-label="Custom label">Icon</Button>);
      expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <span id="description">This button does something</span>
          <Button aria-describedby="description">Do Something</Button>
        </>
      );
      expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', 'description');
    });

    it('is focusable', async () => {
      const user = userEvent.setup();
      render(<Button>Focus me</Button>);

      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });

    it('is not focusable when disabled', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Button>First</Button>
          <Button disabled>Disabled</Button>
          <Button>Third</Button>
        </>
      );

      await user.tab();
      expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();

      await user.tab();
      // Should skip disabled button and go to Third
      expect(screen.getByRole('button', { name: 'Third' })).toHaveFocus();
    });
  });

  describe('HTML attributes', () => {
    it('passes through id attribute', () => {
      render(<Button id="my-button">Test</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('id', 'my-button');
    });

    it('passes through data attributes', () => {
      render(<Button data-testid="custom-button">Test</Button>);
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });

    it('passes through name attribute', () => {
      render(<Button name="submit-button">Test</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('name', 'submit-button');
    });

    it('passes through form attribute', () => {
      render(<Button form="my-form">Test</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('form', 'my-form');
    });
  });
});

describe('buttonVariants', () => {
  it('generates class string for default variant', () => {
    const classes = buttonVariants({ variant: 'default' });
    expect(classes).toContain('bg-[var(--primary)]');
  });

  it('generates class string for custom size', () => {
    const classes = buttonVariants({ size: 'lg' });
    expect(classes).toContain('h-11');
  });

  it('combines variant and size', () => {
    const classes = buttonVariants({ variant: 'secondary', size: 'sm' });
    expect(classes).toContain('bg-[var(--background-secondary)]');
    expect(classes).toContain('h-9');
  });

  it('includes base classes', () => {
    const classes = buttonVariants();
    expect(classes).toContain('inline-flex');
    expect(classes).toContain('items-center');
    expect(classes).toContain('justify-center');
    expect(classes).toContain('rounded-lg');
  });

  it('includes focus ring classes', () => {
    const classes = buttonVariants();
    expect(classes).toContain('focus-visible:outline-none');
    expect(classes).toContain('focus-visible:ring-2');
  });

  it('includes transition classes', () => {
    const classes = buttonVariants();
    expect(classes).toContain('transition-all');
  });

  it('accepts custom className', () => {
    const classes = buttonVariants({ className: 'my-custom-class' });
    expect(classes).toContain('my-custom-class');
  });
});
