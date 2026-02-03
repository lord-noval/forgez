'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Code2,
  FileText,
  Video,
  Headphones,
  Palette,
  Box,
  Presentation,
  Award,
  File,
  X,
  Plus,
  Loader2,
  ExternalLink,
  Github,
  Calendar,
  Globe,
  Lock,
  Link as LinkIcon,
  Star,
  Users,
  Trophy,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useProjectsStore } from '@/stores/projects-store';
import type { Project, ProjectType } from '@/lib/supabase/types';

// Metadata types
interface ProjectMetadata {
  highlights?: string[];
  achievements?: { icon: string; label: string; value: string }[];
  collaborators?: { name: string; role: string }[];
  teamSize?: number;
}

const projectTypes: { type: ProjectType; typeKey: string; icon: typeof Code2 }[] = [
  { type: 'CODE', typeKey: 'code', icon: Code2 },
  { type: 'DOCUMENT', typeKey: 'document', icon: FileText },
  { type: 'VIDEO', typeKey: 'video', icon: Video },
  { type: 'AUDIO', typeKey: 'audio', icon: Headphones },
  { type: 'DESIGN', typeKey: 'design', icon: Palette },
  { type: 'MODEL_3D', typeKey: 'model_3d', icon: Box },
  { type: 'PRESENTATION', typeKey: 'presentation', icon: Presentation },
  { type: 'CERTIFICATION', typeKey: 'certification', icon: Award },
  { type: 'OTHER', typeKey: 'other', icon: File },
];

const visibilityOptions: { value: 'public' | 'private' | 'unlisted'; icon: typeof Globe }[] = [
  { value: 'public', icon: Globe },
  { value: 'unlisted', icon: LinkIcon },
  { value: 'private', icon: Lock },
];

interface ProjectEditorProps {
  project?: Project;
  onSuccess?: (project: Project) => void;
  className?: string;
}

export function ProjectEditor({ project, onSuccess, className }: ProjectEditorProps) {
  const router = useRouter();
  const t = useTranslations('portfolio');
  const { addProject, updateProject, setSaving, isSaving } = useProjectsStore();

  const isEditing = !!project;

  // Extract metadata from project
  const projectMetadata = (project?.metadata as ProjectMetadata) || {};

  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    project_type: project?.project_type || ('' as ProjectType),
    external_url: project?.external_url || '',
    repository_url: project?.repository_url || '',
    start_date: project?.start_date || '',
    end_date: project?.end_date || '',
    is_ongoing: project?.is_ongoing || false,
    visibility: project?.visibility || 'public',
    tags: project?.tags || [],
    // Metadata fields
    highlights: projectMetadata.highlights || [],
    achievements: projectMetadata.achievements || [],
    collaborators: projectMetadata.collaborators || [],
    teamSize: projectMetadata.teamSize || 1,
  });

  const [tagInput, setTagInput] = useState('');
  const [highlightInput, setHighlightInput] = useState('');
  const [collaboratorName, setCollaboratorName] = useState('');
  const [collaboratorRole, setCollaboratorRole] = useState('');
  const [achievementLabel, setAchievementLabel] = useState('');
  const [achievementValue, setAchievementValue] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleTypeSelect = (type: ProjectType) => {
    setFormData((prev) => ({ ...prev, project_type: type }));
    if (errors.project_type) {
      setErrors((prev) => ({ ...prev, project_type: '' }));
    }
  };

  const handleVisibilitySelect = (visibility: 'public' | 'private' | 'unlisted') => {
    setFormData((prev) => ({ ...prev, visibility }));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Highlight management
  const addHighlight = () => {
    const highlight = highlightInput.trim();
    if (highlight && formData.highlights.length < 5) {
      setFormData((prev) => ({ ...prev, highlights: [...prev.highlights, highlight] }));
      setHighlightInput('');
    }
  };

  const removeHighlight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  // Collaborator management
  const addCollaborator = () => {
    const name = collaboratorName.trim();
    const role = collaboratorRole.trim();
    if (name && role && formData.collaborators.length < 10) {
      setFormData((prev) => ({
        ...prev,
        collaborators: [...prev.collaborators, { name, role }],
      }));
      setCollaboratorName('');
      setCollaboratorRole('');
    }
  };

  const removeCollaborator = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      collaborators: prev.collaborators.filter((_, i) => i !== index),
    }));
  };

  // Achievement management
  const addAchievement = () => {
    const label = achievementLabel.trim();
    const value = achievementValue.trim();
    if (label && value && formData.achievements.length < 5) {
      setFormData((prev) => ({
        ...prev,
        achievements: [...prev.achievements, { icon: 'star', label, value }],
      }));
      setAchievementLabel('');
      setAchievementValue('');
    }
  };

  const removeAchievement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  };

  const handleTeamSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setFormData((prev) => ({ ...prev, teamSize: Math.max(1, Math.min(100, value)) }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.project_type) {
      newErrors.project_type = 'Please select a project type';
    }

    if (formData.external_url && !isValidUrl(formData.external_url)) {
      newErrors.external_url = 'Please enter a valid URL';
    }

    if (formData.repository_url && !isValidUrl(formData.repository_url)) {
      newErrors.repository_url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);

    try {
      const endpoint = isEditing
        ? `/api/projects/${project.id}`
        : '/api/projects';
      const method = isEditing ? 'PUT' : 'POST';

      // Build request body with metadata
      const { highlights, achievements, collaborators, teamSize, ...baseFormData } = formData;
      const requestBody = {
        ...baseFormData,
        metadata: {
          highlights: highlights.length > 0 ? highlights : undefined,
          achievements: achievements.length > 0 ? achievements : undefined,
          collaborators: collaborators.length > 0 ? collaborators : undefined,
          teamSize: teamSize > 1 ? teamSize : undefined,
        },
      };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save project');
      }

      const { project: savedProject } = await response.json();

      if (isEditing) {
        updateProject(project.id, savedProject);
      } else {
        addProject(savedProject);
      }

      onSuccess?.(savedProject);

      // Navigate to project page
      router.push(`/portfolio/${savedProject.id}`);
    } catch (error) {
      console.error('Save error:', error);
      setErrors((prev) => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to save project',
      }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-8', className)}>
      {/* Project Type Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('create.sections.projectType')} *
          </label>
          {errors.project_type && (
            <p className="text-sm text-[var(--danger)] mb-2">
              {errors.project_type}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {projectTypes.map(({ type, typeKey, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeSelect(type)}
              className={cn(
                'p-4 rounded-lg border text-left transition-all',
                formData.project_type === type
                  ? 'border-[var(--primary)] bg-[var(--primary-muted)]'
                  : 'border-[var(--border)] hover:border-[var(--primary)] bg-[var(--background-secondary)]'
              )}
            >
              <Icon
                className={cn(
                  'w-6 h-6 mb-2',
                  formData.project_type === type
                    ? 'text-[var(--primary)]'
                    : 'text-[var(--foreground-muted)]'
                )}
              />
              <p className="font-medium">{t(`types.${typeKey}`)}</p>
              <p className="text-xs text-[var(--foreground-muted)] line-clamp-1">
                {t(`create.typeDescriptions.${typeKey}`)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Basic Info */}
      <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
        <h2 className="text-lg font-semibold mb-4">{t('create.sections.basicInfo')}</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              {t('create.fields.title')} *
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('create.fields.titlePlaceholder')}
              className={errors.title ? 'border-[var(--danger)]' : ''}
            />
            {errors.title && (
              <p className="text-sm text-[var(--danger)] mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              {t('create.fields.description')}
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('create.fields.descriptionPlaceholder')}
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('create.sections.tags')}</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={t('create.tags.addTag')}
              />
              <Button type="button" variant="secondary" onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-[var(--danger-muted)]"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-[var(--foreground-muted)] mt-1">
              {t('create.tags.count', { count: formData.tags.length })}
            </p>
          </div>
        </div>
      </Card>

      {/* URLs */}
      <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
        <h2 className="text-lg font-semibold mb-4">{t('create.sections.links')}</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="external_url" className="block text-sm font-medium mb-2">
              <ExternalLink className="w-4 h-4 inline mr-1" />
              {t('create.fields.externalUrl')}
            </label>
            <Input
              id="external_url"
              name="external_url"
              value={formData.external_url}
              onChange={handleChange}
              placeholder={t('create.fields.externalUrlPlaceholder')}
              className={errors.external_url ? 'border-[var(--danger)]' : ''}
            />
            {errors.external_url && (
              <p className="text-sm text-[var(--danger)] mt-1">
                {errors.external_url}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="repository_url" className="block text-sm font-medium mb-2">
              <Github className="w-4 h-4 inline mr-1" />
              {t('create.fields.repositoryUrl')}
            </label>
            <Input
              id="repository_url"
              name="repository_url"
              value={formData.repository_url}
              onChange={handleChange}
              placeholder={t('create.fields.repositoryUrlPlaceholder')}
              className={errors.repository_url ? 'border-[var(--danger)]' : ''}
            />
            {errors.repository_url && (
              <p className="text-sm text-[var(--danger)] mt-1">
                {errors.repository_url}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
        <h2 className="text-lg font-semibold mb-4">
          <Calendar className="w-5 h-5 inline mr-2" />
          {t('create.sections.timeline')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium mb-2">
              {t('create.fields.startDate')}
            </label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium mb-2">
              {t('create.fields.endDate')}
            </label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              disabled={formData.is_ongoing}
            />
          </div>
        </div>

        <Checkbox
          name="is_ongoing"
          checked={formData.is_ongoing}
          onChange={handleChange}
          label={t('create.ongoingProject')}
          className="mt-4"
        />
      </Card>

      {/* Visibility */}
      <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
        <h2 className="text-lg font-semibold mb-4">{t('create.sections.visibility')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {visibilityOptions.map(({ value, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleVisibilitySelect(value)}
              className={cn(
                'p-4 rounded-lg border text-left transition-all',
                formData.visibility === value
                  ? 'border-[var(--primary)] bg-[var(--primary-muted)]'
                  : 'border-[var(--border)] hover:border-[var(--primary)] bg-[var(--background-tertiary)]'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 mb-2',
                  formData.visibility === value
                    ? 'text-[var(--primary)]'
                    : 'text-[var(--foreground-muted)]'
                )}
              />
              <p className="font-medium">{t(`visibility.${value}`)}</p>
              <p className="text-xs text-[var(--foreground-muted)]">
                {t(`create.visibilityDescriptions.${value}`)}
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* Additional Details */}
      <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[var(--primary)]" />
          {t('editor.additionalDetails')}
        </h2>
        <p className="text-sm text-[var(--foreground-muted)] mb-6">
          {t('editor.additionalDetailsDescription')}
        </p>

        {/* Team Size */}
        <div className="mb-6">
          <label htmlFor="teamSize" className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('editor.teamSize')}
          </label>
          <Input
            id="teamSize"
            name="teamSize"
            type="number"
            min="1"
            max="100"
            value={formData.teamSize}
            onChange={handleTeamSizeChange}
            className="w-32"
          />
          <p className="text-xs text-[var(--foreground-muted)] mt-1">
            {t('editor.teamSizeHint')}
          </p>
        </div>

        {/* Highlights */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            {t('editor.highlights')}
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={highlightInput}
              onChange={(e) => setHighlightInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
              placeholder={t('editor.highlightPlaceholder')}
            />
            <Button type="button" variant="secondary" onClick={addHighlight}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {formData.highlights.length > 0 && (
            <div className="space-y-2">
              {formData.highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[var(--background-tertiary)]"
                >
                  <Star className="w-4 h-4 text-yellow-500 shrink-0" />
                  <span className="flex-1 text-sm">{highlight}</span>
                  <button
                    type="button"
                    onClick={() => removeHighlight(index)}
                    className="text-[var(--foreground-muted)] hover:text-[var(--danger)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-[var(--foreground-muted)] mt-1">
            {formData.highlights.length}/5 {t('editor.highlightsCount')}
          </p>
        </div>

        {/* Key Metrics / Achievements */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[var(--primary)]" />
            {t('editor.keyMetrics')}
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={achievementLabel}
              onChange={(e) => setAchievementLabel(e.target.value)}
              placeholder={t('editor.metricLabel')}
              className="flex-1"
            />
            <Input
              value={achievementValue}
              onChange={(e) => setAchievementValue(e.target.value)}
              placeholder={t('editor.metricValue')}
              className="w-32"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
            />
            <Button type="button" variant="secondary" onClick={addAchievement}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {formData.achievements.length > 0 && (
            <div className="space-y-2">
              {formData.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[var(--background-tertiary)]"
                >
                  <Award className="w-4 h-4 text-[var(--primary)] shrink-0" />
                  <span className="flex-1 text-sm">{achievement.label}</span>
                  <Badge variant="secondary">{achievement.value}</Badge>
                  <button
                    type="button"
                    onClick={() => removeAchievement(index)}
                    className="text-[var(--foreground-muted)] hover:text-[var(--danger)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-[var(--foreground-muted)] mt-1">
            {formData.achievements.length}/5 {t('editor.metricsCount')}
          </p>
        </div>

        {/* Team Members / Collaborators */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--secondary)]" />
            {t('editor.collaborators')}
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={collaboratorName}
              onChange={(e) => setCollaboratorName(e.target.value)}
              placeholder={t('editor.collaboratorName')}
              className="flex-1"
            />
            <Input
              value={collaboratorRole}
              onChange={(e) => setCollaboratorRole(e.target.value)}
              placeholder={t('editor.collaboratorRole')}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCollaborator())}
            />
            <Button type="button" variant="secondary" onClick={addCollaborator}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {formData.collaborators.length > 0 && (
            <div className="space-y-2">
              {formData.collaborators.map((collaborator, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[var(--background-tertiary)]"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--secondary-muted)] flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-[var(--secondary)]">
                      {collaborator.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{collaborator.name}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">{collaborator.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCollaborator(index)}
                    className="text-[var(--foreground-muted)] hover:text-[var(--danger)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-[var(--foreground-muted)] mt-1">
            {formData.collaborators.length}/10 {t('editor.collaboratorsCount')}
          </p>
        </div>
      </Card>

      {/* Submit */}
      {errors.submit && (
        <p className="text-sm text-[var(--danger)] text-center">
          {errors.submit}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          {t('detail.cancel')}
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('create.creating')}
            </>
          ) : (
            <>{isEditing ? t('create.saveChanges') : t('create.submit')}</>
          )}
        </Button>
      </div>
    </form>
  );
}
