import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit Feedback | FORGE-Z',
  description: 'Submit your feedback to help your colleague grow.',
};

export default function RespondLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Simple header */}
      <header className="border-b border-[var(--border)] bg-[var(--background-secondary)]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="font-display font-semibold">FORGE-Z</span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Simple footer */}
      <footer className="border-t border-[var(--border)] py-6">
        <div className="max-w-3xl mx-auto px-4 text-center text-sm text-[var(--foreground-muted)]">
          <p>
            Powered by{' '}
            <span className="text-[var(--primary)]">FORGE-Z</span>
            {' '}— Quest for Your Future
          </p>
        </div>
      </footer>
    </div>
  );
}
