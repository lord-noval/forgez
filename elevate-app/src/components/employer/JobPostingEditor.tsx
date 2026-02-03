'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Eye,
  Send,
  X,
  Plus,
  MapPin,
  DollarSign,
  Briefcase,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { JobPosting, EmploymentType, JobStatus } from '@/lib/supabase/types';

interface JobPostingEditorProps {
  initialData?: Partial<JobPosting>;
  companyId: string;
  onSave?: (data: Partial<JobPosting>) => Promise<void>;
  onPublish?: (data: Partial<JobPosting>) => Promise<void>;
  className?: string;
}

const employmentTypes: { value: EmploymentType; label: string }[] = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'APPRENTICESHIP', label: 'Apprenticeship' },
];

const currencies = ['EUR', 'USD', 'GBP', 'CHF'];

export function JobPostingEditor({
  initialData,
  companyId,
  onSave,
  onPublish,
  className,
}: JobPostingEditorProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    is_remote: initialData?.is_remote || false,
    employment_type: initialData?.employment_type || 'FULL_TIME' as EmploymentType,
    salary_min: initialData?.salary_min || '',
    salary_max: initialData?.salary_max || '',
    salary_currency: initialData?.salary_currency || 'EUR',
    required_skills: initialData?.required_skills || [],
    preferred_skills: initialData?.preferred_skills || [],
  });

  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newPreferredSkill, setNewPreferredSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const addSkill = (type: 'required' | 'preferred') => {
    const skill = type === 'required' ? newRequiredSkill : newPreferredSkill;
    if (!skill.trim()) return;

    const field = type === 'required' ? 'required_skills' : 'preferred_skills';
    const currentSkills = formData[field] as string[];

    if (!currentSkills.includes(skill.toLowerCase())) {
      updateField(field, [...currentSkills, skill.toLowerCase()]);
    }

    if (type === 'required') {
      setNewRequiredSkill('');
    } else {
      setNewPreferredSkill('');
    }
  };

  const removeSkill = (type: 'required' | 'preferred', skill: string) => {
    const field = type === 'required' ? 'required_skills' : 'preferred_skills';
    const currentSkills = formData[field] as string[];
    updateField(
      field,
      currentSkills.filter((s) => s !== skill)
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    } else if (formData.description.length < 100) {
      newErrors.description = 'Description should be at least 100 characters';
    }

    if (!formData.location.trim() && !formData.is_remote) {
      newErrors.location = 'Location is required for non-remote positions';
    }

    if (formData.salary_min && formData.salary_max) {
      const min = Number(formData.salary_min);
      const max = Number(formData.salary_max);
      if (min > max) {
        newErrors.salary = 'Minimum salary cannot be greater than maximum';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Convert arrays to Record format for API
  const skillsToRecord = (skills: string[]): Record<string, unknown> | null => {
    if (skills.length === 0) return null;
    return { skills };
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const skillsArray = formData.required_skills as string[];
      const preferredArray = formData.preferred_skills as string[];
      await onSave?.({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        is_remote: formData.is_remote,
        employment_type: formData.employment_type,
        salary_currency: formData.salary_currency,
        company_id: companyId,
        salary_min: formData.salary_min ? Number(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number(formData.salary_max) : null,
        required_skills: skillsToRecord(skillsArray),
        preferred_skills: skillsToRecord(preferredArray),
        status: 'DRAFT' as JobStatus,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validate()) return;

    setIsPublishing(true);
    try {
      const skillsArray = formData.required_skills as string[];
      const preferredArray = formData.preferred_skills as string[];
      await onPublish?.({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        is_remote: formData.is_remote,
        employment_type: formData.employment_type,
        salary_currency: formData.salary_currency,
        company_id: companyId,
        salary_min: formData.salary_min ? Number(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number(formData.salary_max) : null,
        required_skills: skillsToRecord(skillsArray),
        preferred_skills: skillsToRecord(preferredArray),
        status: 'ACTIVE' as JobStatus,
        posted_at: new Date().toISOString(),
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display">
          {initialData?.id ? 'Edit Job Posting' : 'Create Job Posting'}
        </h2>
        <div className="flex gap-2">
          <Button variant="secondary" className="gap-2" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button className="gap-2" onClick={handlePublish} disabled={isPublishing}>
            <Send className="w-4 h-4" />
            {isPublishing ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
        <h3 className="font-semibold mb-4">Basic Information</h3>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Job Title <span className="text-[var(--error)]">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g., Senior Frontend Developer"
              className={cn(errors.title && 'border-[var(--error)]')}
            />
            {errors.title && (
              <p className="text-sm text-[var(--error)] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Employment Type</label>
            <div className="flex flex-wrap gap-2">
              {employmentTypes.map((type) => (
                <Badge
                  key={type.value}
                  variant={formData.employment_type === type.value ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => updateField('employment_type', type.value)}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Location {!formData.is_remote && <span className="text-[var(--error)]">*</span>}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
                <Input
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="e.g., Berlin, Germany"
                  className={cn('pl-9', errors.location && 'border-[var(--error)]')}
                />
              </div>
              {errors.location && (
                <p className="text-sm text-[var(--error)] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.location}
                </p>
              )}
            </div>

            <div className="flex items-end">
              <Badge
                variant={formData.is_remote ? 'default' : 'secondary'}
                className="cursor-pointer gap-1 h-10 px-4"
                onClick={() => updateField('is_remote', !formData.is_remote)}
              >
                <Globe className="w-4 h-4" />
                Remote Friendly
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
        <h3 className="font-semibold mb-4">Job Description</h3>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description <span className="text-[var(--error)]">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe the role, responsibilities, and what you're looking for..."
            rows={12}
            className={cn(
              'w-full px-3 py-2 rounded-lg',
              'bg-[var(--background)] border border-[var(--border)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
              'placeholder:text-[var(--foreground-muted)]',
              'resize-none',
              errors.description && 'border-[var(--error)]'
            )}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? (
              <p className="text-sm text-[var(--error)] flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </p>
            ) : (
              <p className="text-sm text-[var(--foreground-muted)]">
                Supports Markdown formatting
              </p>
            )}
            <p className="text-sm text-[var(--foreground-muted)]">
              {formData.description.length} characters
            </p>
          </div>
        </div>
      </Card>

      {/* Salary */}
      <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
        <h3 className="font-semibold mb-4">Compensation</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select
              value={formData.salary_currency}
              onChange={(e) => updateField('salary_currency', e.target.value)}
              className={cn(
                'w-full h-10 px-3 rounded-lg',
                'bg-[var(--background)] border border-[var(--border)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
              )}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Minimum Salary</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
              <Input
                type="number"
                value={formData.salary_min}
                onChange={(e) => updateField('salary_min', e.target.value)}
                placeholder="e.g., 50000"
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Maximum Salary</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
              <Input
                type="number"
                value={formData.salary_max}
                onChange={(e) => updateField('salary_max', e.target.value)}
                placeholder="e.g., 70000"
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {errors.salary && (
          <p className="text-sm text-[var(--error)] mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.salary}
          </p>
        )}
      </Card>

      {/* Skills */}
      <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
        <h3 className="font-semibold mb-4">Required Skills</h3>

        <div className="space-y-4">
          {/* Required Skills */}
          <div>
            <label className="block text-sm font-medium mb-2">Required Skills</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newRequiredSkill}
                onChange={(e) => setNewRequiredSkill(e.target.value)}
                placeholder="Add a required skill..."
                onKeyDown={(e) => e.key === 'Enter' && addSkill('required')}
              />
              <Button variant="secondary" onClick={() => addSkill('required')}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.required_skills as string[]).map((skill) => (
                <Badge key={skill} variant="default" className="gap-1 capitalize">
                  {skill}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-[var(--error)]"
                    onClick={() => removeSkill('required', skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Preferred Skills */}
          <div>
            <label className="block text-sm font-medium mb-2">Nice to Have Skills</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newPreferredSkill}
                onChange={(e) => setNewPreferredSkill(e.target.value)}
                placeholder="Add a preferred skill..."
                onKeyDown={(e) => e.key === 'Enter' && addSkill('preferred')}
              />
              <Button variant="secondary" onClick={() => addSkill('preferred')}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.preferred_skills as string[]).map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1 capitalize">
                  {skill}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-[var(--error)]"
                    onClick={() => removeSkill('preferred', skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
