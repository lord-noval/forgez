import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, badgeVariants } from './badge';

describe('Badge', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Badge>Badge text</Badge>);
      expect(screen.getByText('Badge text')).toBeInTheDocument();
    });

    it('renders as a div', () => {
      render(<Badge data-testid="badge">Test</Badge>);
      expect(screen.getByTestId('badge').tagName).toBe('DIV');
    });

    it('applies custom className', () => {
      render(<Badge className="custom-class">Test</Badge>);
      expect(screen.getByText('Test')).toHaveClass('custom-class');
    });
  });

  describe('base styles', () => {
    it('has inline-flex display', () => {
      render(<Badge data-testid="badge">Test</Badge>);
      expect(screen.getByTestId('badge').className).toContain('inline-flex');
    });

    it('has rounded-full', () => {
      render(<Badge data-testid="badge">Test</Badge>);
      expect(screen.getByTestId('badge').className).toContain('rounded-full');
    });

    it('has padding', () => {
      render(<Badge data-testid="badge">Test</Badge>);
      expect(screen.getByTestId('badge').className).toContain('px-2.5');
      expect(screen.getByTestId('badge').className).toContain('py-0.5');
    });

    it('has small text', () => {
      render(<Badge data-testid="badge">Test</Badge>);
      expect(screen.getByTestId('badge').className).toContain('text-xs');
      expect(screen.getByTestId('badge').className).toContain('font-medium');
    });

    it('has transition', () => {
      render(<Badge data-testid="badge">Test</Badge>);
      expect(screen.getByTestId('badge').className).toContain('transition-colors');
    });
  });

  describe('variants', () => {
    it('applies default variant', () => {
      render(<Badge variant="default" data-testid="badge">Test</Badge>);
      expect(screen.getByTestId('badge').className).toContain('bg-[var(--primary-muted)]');
      expect(screen.getByTestId('badge').className).toContain('text-[var(--primary)]');
    });

    it('applies secondary variant', () => {
      render(<Badge variant="secondary" data-testid="badge">Test</Badge>);
      expect(screen.getByTestId('badge').className).toContain('bg-[var(--background-tertiary)]');
      expect(screen.getByTestId('badge').className).toContain('text-[var(--foreground-muted)]');
    });

    it('applies success variant', () => {
      render(<Badge variant="success" data-testid="badge">Test</Badge>);
      expect(screen.getByTestId('badge').className).toContain('bg-[var(--success-muted)]');
      expect(screen.getByTestId('badge').className).toContain('text-[var(--success)]');
    });

    it('applies warning variant', () => {
      render(<Badge variant="warning" data-testid="badge">Test</Badge>);
      expect(screen.getByTestId('badge').className).toContain('bg-[var(--warning-muted)]');
      expect(screen.getByTestId('badge').className).toContain('text-[var(--warning)]');
    });

    it('applies danger variant', () => {
      render(<Badge variant="danger" data-testid="badge">Test</Badge>);
      expect(screen.getByTestId('badge').className).toContain('bg-[var(--danger-muted)]');
      expect(screen.getByTestId('badge').className).toContain('text-[var(--danger)]');
    });

    it('applies achievement variant', () => {
      render(<Badge variant="achievement" data-testid="badge">Test</Badge>);
      expect(screen.getByTestId('badge').className).toContain('bg-[var(--achievement-muted)]');
      expect(screen.getByTestId('badge').className).toContain('text-[var(--achievement)]');
    });
  });

  describe('rarity variants', () => {
    it('applies common rarity', () => {
      render(<Badge variant="common" data-testid="badge">Common</Badge>);
      expect(screen.getByTestId('badge').className).toContain('bg-zinc-800');
      expect(screen.getByTestId('badge').className).toContain('text-zinc-400');
    });

    it('applies uncommon rarity', () => {
      render(<Badge variant="uncommon" data-testid="badge">Uncommon</Badge>);
      expect(screen.getByTestId('badge').className).toContain('bg-green-900/40');
      expect(screen.getByTestId('badge').className).toContain('text-green-400');
    });

    it('applies rare rarity', () => {
      render(<Badge variant="rare" data-testid="badge">Rare</Badge>);
      expect(screen.getByTestId('badge').className).toContain('bg-blue-900/40');
      expect(screen.getByTestId('badge').className).toContain('text-blue-400');
    });

    it('applies epic rarity', () => {
      render(<Badge variant="epic" data-testid="badge">Epic</Badge>);
      expect(screen.getByTestId('badge').className).toContain('bg-purple-900/40');
      expect(screen.getByTestId('badge').className).toContain('text-purple-400');
    });

    it('applies legendary rarity', () => {
      render(<Badge variant="legendary" data-testid="badge">Legendary</Badge>);
      expect(screen.getByTestId('badge').className).toContain('bg-orange-900/40');
      expect(screen.getByTestId('badge').className).toContain('text-orange-400');
    });
  });

  describe('HTML attributes', () => {
    it('passes through id', () => {
      render(<Badge id="my-badge">Test</Badge>);
      expect(document.getElementById('my-badge')).toBeInTheDocument();
    });

    it('passes through data attributes', () => {
      render(<Badge data-custom="value">Test</Badge>);
      expect(screen.getByText('Test')).toHaveAttribute('data-custom', 'value');
    });

    it('passes through role', () => {
      render(<Badge role="status">Status</Badge>);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});

describe('badgeVariants', () => {
  it('generates class string for default variant', () => {
    const classes = badgeVariants({ variant: 'default' });
    expect(classes).toContain('bg-[var(--primary-muted)]');
  });

  it('generates class string for secondary variant', () => {
    const classes = badgeVariants({ variant: 'secondary' });
    expect(classes).toContain('bg-[var(--background-tertiary)]');
  });

  it('generates class string for success variant', () => {
    const classes = badgeVariants({ variant: 'success' });
    expect(classes).toContain('bg-[var(--success-muted)]');
  });

  it('generates class string for warning variant', () => {
    const classes = badgeVariants({ variant: 'warning' });
    expect(classes).toContain('bg-[var(--warning-muted)]');
  });

  it('generates class string for danger variant', () => {
    const classes = badgeVariants({ variant: 'danger' });
    expect(classes).toContain('bg-[var(--danger-muted)]');
  });

  it('generates class string for rarity variants', () => {
    expect(badgeVariants({ variant: 'common' })).toContain('bg-zinc-800');
    expect(badgeVariants({ variant: 'uncommon' })).toContain('text-green-400');
    expect(badgeVariants({ variant: 'rare' })).toContain('text-blue-400');
    expect(badgeVariants({ variant: 'epic' })).toContain('text-purple-400');
    expect(badgeVariants({ variant: 'legendary' })).toContain('text-orange-400');
  });

  it('includes base classes', () => {
    const classes = badgeVariants();
    expect(classes).toContain('inline-flex');
    expect(classes).toContain('items-center');
    expect(classes).toContain('rounded-full');
  });

  it('uses default variant when none specified', () => {
    const classes = badgeVariants({});
    expect(classes).toContain('bg-[var(--primary-muted)]');
  });
});

describe('Badge accessibility', () => {
  it('can have status role', () => {
    render(<Badge role="status">Active</Badge>);
    expect(screen.getByRole('status')).toHaveTextContent('Active');
  });

  it('supports aria-label', () => {
    render(<Badge aria-label="Status indicator">●</Badge>);
    expect(screen.getByText('●')).toHaveAttribute('aria-label', 'Status indicator');
  });

  it('can be used for status indication', () => {
    render(
      <Badge variant="success" role="status" aria-label="Online status">
        Online
      </Badge>
    );
    expect(screen.getByRole('status')).toHaveTextContent('Online');
  });
});

describe('Badge use cases', () => {
  it('works as a counter badge', () => {
    render(<Badge variant="danger">5</Badge>);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('works as a status indicator', () => {
    render(<Badge variant="success">Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('works as a tag', () => {
    render(<Badge variant="secondary">TypeScript</Badge>);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('works for achievement rarity', () => {
    render(<Badge variant="legendary">Legendary Achievement</Badge>);
    expect(screen.getByText('Legendary Achievement')).toBeInTheDocument();
  });

  it('can render multiple badges', () => {
    render(
      <div>
        <Badge variant="default">React</Badge>
        <Badge variant="secondary">TypeScript</Badge>
        <Badge variant="success">Active</Badge>
      </div>
    );
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});
