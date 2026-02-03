'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ProjectEditor } from '@/components/portfolio';

export default function NewProjectPage() {
  const t = useTranslations('portfolio');

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Back link */}
      <Link href="/portfolio" className="inline-flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-6">
        <ChevronLeft className="w-4 h-4" />
        {t('create.backToPortfolio')}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">{t('create.title')}</h1>
        <p className="text-[var(--foreground-muted)]">
          {t('create.subtitle')}
        </p>
      </div>

      {/* Editor */}
      <ProjectEditor />
    </div>
  );
}
