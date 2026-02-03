'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  X,
  Trash2,
  Send,
  Loader2,
  HelpCircle,
  Users,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations } from 'next-intl';

const defaultPrompts = [
  "Describe a time when this person helped solve a difficult problem. What was their approach?",
  "How does this person handle disagreements or conflicts in a professional setting?",
  "What would you say is this person's biggest strength when working in a team?",
  "If this person were leading a project, what would go well based on your experience with them?",
  "What's one area where you've seen this person grow or improve over time?",
];

interface Respondent {
  id: string;
  email: string;
  name: string;
  relationship: string;
}

interface FeedbackRequestFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function FeedbackRequestForm({ onSuccess, className }: FeedbackRequestFormProps) {
  const t = useTranslations('feedback');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [questions, setQuestions] = useState<string[]>(defaultPrompts.slice(0, 3));
  const [newQuestion, setNewQuestion] = useState('');
  const [respondents, setRespondents] = useState<Respondent[]>([]);
  const [newRespondent, setNewRespondent] = useState({
    email: '',
    name: '',
    relationship: '',
  });
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [expiresInDays, setExpiresInDays] = useState(14);

  const addQuestion = () => {
    if (newQuestion.trim() && questions.length < 6) {
      setQuestions([...questions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addRespondent = () => {
    if (newRespondent.email && respondents.length < 10) {
      setRespondents([
        ...respondents,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          ...newRespondent,
        },
      ]);
      setNewRespondent({ email: '', name: '', relationship: '' });
    }
  };

  const removeRespondent = (id: string) => {
    setRespondents(respondents.filter((r) => r.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError(t('form.titleRequired'));
      return;
    }

    if (questions.length < 1) {
      setError(t('form.questionRequired'));
      return;
    }

    if (respondents.length < 3) {
      setError(t('form.minRespondentsError'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          context: context.trim() || null,
          prompt_questions: questions,
          expires_in_days: expiresInDays,
          min_respondents: 3,
          max_respondents: 10,
          is_anonymous: isAnonymous,
          respondents: respondents.map((r) => ({
            email: r.email,
            name: r.name || undefined,
            relationship: r.relationship || undefined,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create feedback request');
      }

      onSuccess?.();
      router.push('/feedback');
    } catch (error) {
      console.error('Submit error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Title & Context */}
      <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          {t('form.requestDetails')}
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              {t('form.titleLabel')} *
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('form.titlePlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="context" className="block text-sm font-medium mb-2">
              {t('form.contextLabel')}
            </label>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={t('form.contextPlaceholder')}
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Prompt Questions */}
      <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          {t('form.promptQuestions')}
        </h2>
        <p className="text-sm text-[var(--foreground-muted)] mb-4">
          {t('form.promptQuestionsDesc')}
        </p>

        <div className="space-y-3 mb-4">
          {questions.map((question, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-[var(--background-tertiary)]"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary-muted)] text-[var(--primary)] flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <p className="flex-1 text-sm">{question}</p>
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="text-[var(--foreground-muted)] hover:text-[var(--danger)]"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {questions.length < 6 && (
          <div className="flex gap-2">
            <Input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder={t('form.addCustomQuestion')}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQuestion())}
            />
            <Button type="button" variant="secondary" onClick={addQuestion}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}

        <p className="text-xs text-[var(--foreground-muted)] mt-2">
          {t('form.questionsCount', { count: questions.length })}
        </p>
      </Card>

      {/* Respondents */}
      <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          {t('form.inviteRespondents')}
        </h2>
        <p className="text-sm text-[var(--foreground-muted)] mb-4">
          {t('form.inviteRespondentsDesc')}
        </p>

        {respondents.length > 0 && (
          <div className="space-y-2 mb-4">
            {respondents.map((respondent) => (
              <motion.div
                key={respondent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--background-tertiary)]"
              >
                <div>
                  <p className="font-medium">{respondent.name || respondent.email}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {respondent.email}
                    {respondent.relationship && ` · ${respondent.relationship}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeRespondent(respondent.id)}
                  className="text-[var(--foreground-muted)] hover:text-[var(--danger)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {respondents.length < 10 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              value={newRespondent.email}
              onChange={(e) =>
                setNewRespondent({ ...newRespondent, email: e.target.value })
              }
              placeholder={t('form.emailRequired')}
              type="email"
            />
            <Input
              value={newRespondent.name}
              onChange={(e) =>
                setNewRespondent({ ...newRespondent, name: e.target.value })
              }
              placeholder={t('form.nameOptional')}
            />
            <div className="flex gap-2">
              <Input
                value={newRespondent.relationship}
                onChange={(e) =>
                  setNewRespondent({ ...newRespondent, relationship: e.target.value })
                }
                placeholder={t('form.relationship')}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addRespondent}
                disabled={!newRespondent.email}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-[var(--foreground-muted)] mt-2">
          {t('form.respondentsCount', { count: respondents.length })}
        </p>
      </Card>

      {/* Settings */}
      <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
        <h2 className="text-lg font-semibold mb-4">{t('form.settings')}</h2>
        <div className="space-y-4">
          <Checkbox
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            label={t('form.anonymousResponses')}
            description={t('form.anonymousResponsesDesc')}
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('form.expiresIn')}
            </label>
            <select
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background-tertiary)]"
            >
              <option value={7}>{t('form.days', { count: 7 })}</option>
              <option value={14}>{t('form.days', { count: 14 })}</option>
              <option value={21}>{t('form.days', { count: 21 })}</option>
              <option value={30}>{t('form.days', { count: 30 })}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <p className="text-sm text-[var(--danger)] text-center">{error}</p>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          {t('form.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('form.sending')}
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {t('form.sendInvitations')}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
