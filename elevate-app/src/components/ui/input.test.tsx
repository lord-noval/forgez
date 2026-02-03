import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input', () => {
  describe('rendering', () => {
    it('renders an input element', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Input className="custom-class" />);
      expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });

    it('forwards ref', () => {
      const ref = vi.fn();
      render(<Input ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('types', () => {
    it('renders text input by default', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    it('renders email input', () => {
      render(<Input type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('renders password input', () => {
      render(<Input type="password" />);
      // Password inputs don't have role="textbox"
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('renders number input', () => {
      render(<Input type="number" />);
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('renders search input', () => {
      render(<Input type="search" />);
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('renders tel input', () => {
      render(<Input type="tel" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel');
    });

    it('renders url input', () => {
      render(<Input type="url" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'url');
    });

    it('renders date input', () => {
      render(<Input type="date" />);
      const input = document.querySelector('input[type="date"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('base styles', () => {
    it('has flex display', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input').className).toContain('flex');
    });

    it('has height', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input').className).toContain('h-10');
    });

    it('has full width', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input').className).toContain('w-full');
    });

    it('has rounded corners', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input').className).toContain('rounded-lg');
    });

    it('has border', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input').className).toContain('border');
    });

    it('has background', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input').className).toContain('bg-[var(--background-secondary)]');
    });

    it('has padding', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input').className).toContain('px-4');
      expect(screen.getByTestId('input').className).toContain('py-2');
    });

    it('has text size', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input').className).toContain('text-sm');
    });

    it('has transition', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input').className).toContain('transition-colors');
    });
  });

  describe('focus styles', () => {
    it('has focus outline none', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input').className).toContain('focus:outline-none');
    });

    it('has focus ring', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input').className).toContain('focus:ring-2');
    });
  });

  describe('disabled state', () => {
    it('applies disabled attribute', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('has disabled styles', () => {
      render(<Input disabled data-testid="input" />);
      expect(screen.getByTestId('input').className).toContain('disabled:cursor-not-allowed');
      expect(screen.getByTestId('input').className).toContain('disabled:opacity-50');
    });

    it('does not accept input when disabled', async () => {
      const user = userEvent.setup();
      render(<Input disabled defaultValue="" />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(input).toHaveValue('');
    });
  });

  describe('interactions', () => {
    it('accepts text input', async () => {
      const user = userEvent.setup();
      render(<Input />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello World');

      expect(input).toHaveValue('Hello World');
    });

    it('calls onChange handler', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'a');

      expect(handleChange).toHaveBeenCalled();
    });

    it('calls onFocus handler', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      expect(handleFocus).toHaveBeenCalled();
    });

    it('calls onBlur handler', async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab();

      expect(handleBlur).toHaveBeenCalled();
    });

    it('can be cleared', async () => {
      const user = userEvent.setup();
      render(<Input />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      await user.clear(input);

      expect(input).toHaveValue('');
    });
  });

  describe('placeholder', () => {
    it('displays placeholder text', () => {
      render(<Input placeholder="Enter text..." />);
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
    });

    it('has placeholder styling', () => {
      render(<Input data-testid="input" placeholder="Test" />);
      expect(screen.getByTestId('input').className).toContain('placeholder:');
    });
  });

  describe('value control', () => {
    it('works as controlled input', async () => {
      const user = userEvent.setup();
      const ControlledInput = () => {
        const [value, setValue] = vi.importActual<typeof import('react')>('react').useState('');
        return <Input value={value} onChange={(e) => setValue(e.target.value)} />;
      };

      render(<ControlledInput />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'controlled');

      expect(input).toHaveValue('controlled');
    });

    it('works as uncontrolled input', () => {
      render(<Input defaultValue="default" />);
      expect(screen.getByRole('textbox')).toHaveValue('default');
    });
  });

  describe('HTML attributes', () => {
    it('passes through id', () => {
      render(<Input id="my-input" />);
      expect(document.getElementById('my-input')).toBeInTheDocument();
    });

    it('passes through name', () => {
      render(<Input name="username" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'username');
    });

    it('passes through required', () => {
      render(<Input required />);
      expect(screen.getByRole('textbox')).toBeRequired();
    });

    it('passes through readonly', () => {
      render(<Input readOnly />);
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });

    it('passes through autoComplete', () => {
      render(<Input autoComplete="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'email');
    });

    it('passes through minLength and maxLength', () => {
      render(<Input minLength={2} maxLength={10} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('minLength', '2');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('passes through pattern', () => {
      render(<Input pattern="[0-9]+" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('pattern', '[0-9]+');
    });

    it('passes through data attributes', () => {
      render(<Input data-custom="value" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('data-custom', 'value');
    });

    it('passes through aria attributes', () => {
      render(<Input aria-label="Custom input" aria-describedby="help-text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Custom input');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });
  });

  describe('accessibility', () => {
    it('can be associated with label', () => {
      render(
        <>
          <label htmlFor="test-input">Test Label</label>
          <Input id="test-input" />
        </>
      );
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });

    it('is focusable', async () => {
      const user = userEvent.setup();
      render(<Input />);

      await user.tab();
      expect(screen.getByRole('textbox')).toHaveFocus();
    });

    it('is not focusable when disabled', async () => {
      const user = userEvent.setup();
      render(
        <>
          <button>Before</button>
          <Input disabled />
          <button>After</button>
        </>
      );

      await user.tab();
      expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();

      await user.tab();
      // Should skip disabled input
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('supports aria-invalid for error state', () => {
      render(<Input aria-invalid="true" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('file input styles', () => {
    it('has file input styling', () => {
      render(<Input data-testid="input" />);
      const className = screen.getByTestId('input').className;
      expect(className).toContain('file:border-0');
      expect(className).toContain('file:bg-transparent');
    });
  });
});
