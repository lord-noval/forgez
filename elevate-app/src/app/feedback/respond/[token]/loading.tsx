import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function RespondLoading() {
  return (
    <Card className="p-12 text-center bg-[var(--background-secondary)] border-[var(--border)]">
      <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto mb-4" />
      <p className="text-[var(--foreground-muted)]">Loading feedback request...</p>
    </Card>
  );
}
