'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { FeedbackRequestForm } from '@/components/feedback';
import { useWorldLabelsI18n } from '@/i18n/use-world-labels';
import { useTranslations } from 'next-intl';

export default function NewFeedbackPage() {
  const labels = useWorldLabelsI18n();
  const t = useTranslations('feedback');
  const tCommon = useTranslations('common');

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href="/feedback"
        className="inline-flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        {tCommon('navigation.backTo', { page: labels.feedback })}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">{t('request.title')}</h1>
        <p className="text-[var(--foreground-muted)]">
          {t('request.subtitle')}
        </p>
      </div>

      {/* Form */}
      <FeedbackRequestForm />
    </div>
  );
}
