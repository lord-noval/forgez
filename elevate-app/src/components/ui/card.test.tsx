import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';

describe('Card', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders as a div', () => {
      render(<Card data-testid="card">Test</Card>);
      const card = screen.getByTestId('card');
      expect(card.tagName).toBe('DIV');
    });

    it('applies custom className', () => {
      render(<Card className="custom-class">Test</Card>);
      expect(screen.getByText('Test').closest('div')).toHaveClass('custom-class');
    });

    it('forwards ref', () => {
      const ref = vi.fn();
      render(<Card ref={ref}>Test</Card>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('base styles', () => {
    it('has rounded corners', () => {
      render(<Card data-testid="card">Test</Card>);
      expect(screen.getByTestId('card').className).toContain('rounded-xl');
    });

    it('has background color', () => {
      render(<Card data-testid="card">Test</Card>);
      expect(screen.getByTestId('card').className).toContain('bg-[var(--background-secondary)]');
    });

    it('has border', () => {
      render(<Card data-testid="card">Test</Card>);
      expect(screen.getByTestId('card').className).toContain('border');
    });

    it('has padding', () => {
      render(<Card data-testid="card">Test</Card>);
      expect(screen.getByTestId('card').className).toContain('p-6');
    });

    it('has transition', () => {
      render(<Card data-testid="card">Test</Card>);
      expect(screen.getByTestId('card').className).toContain('transition-all');
    });
  });

  describe('glow variants', () => {
    it('applies primary glow', () => {
      render(<Card glow="primary" data-testid="card">Test</Card>);
      expect(screen.getByTestId('card').className).toContain('glow-primary');
    });

    it('applies success glow', () => {
      render(<Card glow="success" data-testid="card">Test</Card>);
      expect(screen.getByTestId('card').className).toContain('glow-success');
    });

    it('applies warning glow', () => {
      render(<Card glow="warning" data-testid="card">Test</Card>);
      expect(screen.getByTestId('card').className).toContain('glow-warning');
    });

    it('applies achievement glow', () => {
      render(<Card glow="achievement" data-testid="card">Test</Card>);
      expect(screen.getByTestId('card').className).toContain('glow-achievement');
    });

    it('does not apply glow when not specified', () => {
      render(<Card data-testid="card">Test</Card>);
      const className = screen.getByTestId('card').className;
      expect(className).not.toContain('glow-primary');
      expect(className).not.toContain('glow-success');
      expect(className).not.toContain('glow-warning');
      expect(className).not.toContain('glow-achievement');
    });
  });

  describe('gradient variant', () => {
    it('applies gradient border when true', () => {
      render(<Card gradient data-testid="card">Test</Card>);
      expect(screen.getByTestId('card').className).toContain('gradient-border');
    });

    it('does not apply gradient border when false', () => {
      render(<Card gradient={false} data-testid="card">Test</Card>);
      expect(screen.getByTestId('card').className).not.toContain('gradient-border');
    });

    it('does not apply gradient border when not specified', () => {
      render(<Card data-testid="card">Test</Card>);
      expect(screen.getByTestId('card').className).not.toContain('gradient-border');
    });
  });

  describe('HTML attributes', () => {
    it('passes through id', () => {
      render(<Card id="my-card">Test</Card>);
      expect(document.getElementById('my-card')).toBeInTheDocument();
    });

    it('passes through data attributes', () => {
      render(<Card data-custom="value">Test</Card>);
      expect(screen.getByText('Test').closest('div')).toHaveAttribute('data-custom', 'value');
    });
  });
});

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CardHeader className="custom-class">Header</CardHeader>);
    expect(screen.getByText('Header').closest('div')).toHaveClass('custom-class');
  });

  it('has flex layout', () => {
    render(<CardHeader data-testid="header">Header</CardHeader>);
    expect(screen.getByTestId('header').className).toContain('flex');
    expect(screen.getByTestId('header').className).toContain('flex-col');
  });

  it('has spacing', () => {
    render(<CardHeader data-testid="header">Header</CardHeader>);
    expect(screen.getByTestId('header').className).toContain('space-y-1.5');
    expect(screen.getByTestId('header').className).toContain('pb-4');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<CardHeader ref={ref}>Header</CardHeader>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('CardTitle', () => {
  it('renders children', () => {
    render(<CardTitle>Title text</CardTitle>);
    expect(screen.getByText('Title text')).toBeInTheDocument();
  });

  it('renders as h3', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CardTitle className="custom-class">Title</CardTitle>);
    expect(screen.getByText('Title')).toHaveClass('custom-class');
  });

  it('has typography styles', () => {
    render(<CardTitle data-testid="title">Title</CardTitle>);
    const title = screen.getByTestId('title');
    expect(title.className).toContain('text-lg');
    expect(title.className).toContain('font-semibold');
    expect(title.className).toContain('leading-none');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<CardTitle ref={ref}>Title</CardTitle>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('CardDescription', () => {
  it('renders children', () => {
    render(<CardDescription>Description text</CardDescription>);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('renders as p element', () => {
    render(<CardDescription data-testid="desc">Description</CardDescription>);
    expect(screen.getByTestId('desc').tagName).toBe('P');
  });

  it('applies custom className', () => {
    render(<CardDescription className="custom-class">Desc</CardDescription>);
    expect(screen.getByText('Desc')).toHaveClass('custom-class');
  });

  it('has muted text style', () => {
    render(<CardDescription data-testid="desc">Desc</CardDescription>);
    expect(screen.getByTestId('desc').className).toContain('text-[var(--foreground-muted)]');
  });

  it('has small text size', () => {
    render(<CardDescription data-testid="desc">Desc</CardDescription>);
    expect(screen.getByTestId('desc').className).toContain('text-sm');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<CardDescription ref={ref}>Desc</CardDescription>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Content here</CardContent>);
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CardContent className="custom-class">Content</CardContent>);
    expect(screen.getByText('Content').closest('div')).toHaveClass('custom-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<CardContent ref={ref}>Content</CardContent>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CardFooter className="custom-class">Footer</CardFooter>);
    expect(screen.getByText('Footer').closest('div')).toHaveClass('custom-class');
  });

  it('has flex layout', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);
    expect(screen.getByTestId('footer').className).toContain('flex');
    expect(screen.getByTestId('footer').className).toContain('items-center');
  });

  it('has top padding', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);
    expect(screen.getByTestId('footer').className).toContain('pt-4');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<CardFooter ref={ref}>Footer</CardFooter>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('Card composition', () => {
  it('composes all parts correctly', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Main content</CardContent>
        <CardFooter>Footer actions</CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Main content')).toBeInTheDocument();
    expect(screen.getByText('Footer actions')).toBeInTheDocument();
  });

  it('maintains semantic structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    );

    const heading = screen.getByRole('heading');
    expect(heading.textContent).toBe('Title');
  });
});
