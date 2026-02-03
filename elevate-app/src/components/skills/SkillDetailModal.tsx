'use client';

import { useState, useEffect } from 'react';
import { Loader2, Pencil, Trash2, Users, Calendar, Star, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useSkillsStore } from '@/stores/skills-store';
import type { UserSkillWithTaxonomy, SkillCategory, SkillVerificationLevel } from '@/lib/supabase/types';

const categoryColors: Record<SkillCategory, string> = {
  KNOWLEDGE: '#3B82F6',
  SKILL: '#22C55E',
  COMPETENCE: '#8B5CF6',
  TRANSVERSAL: '#F97316',
  LANGUAGE: '#06B6D4',
};

const categoryLabels: Record<SkillCategory, string> = {
  KNOWLEDGE: 'Knowledge',
  SKILL: 'Technical Skills',
  COMPETENCE: 'Competencies',
  TRANSVERSAL: 'Soft Skills',
  LANGUAGE: 'Languages',
};

const verificationLabels: Record<SkillVerificationLevel, string> = {
  SELF_ASSESSED: 'Self-Assessed',
  PEER_ENDORSED: 'Peer Endorsed',
  PROJECT_VERIFIED: 'Project Verified',
  AI_ANALYZED: 'AI Analyzed',
  ASSESSMENT_PASSED: 'Assessment Passed',
  CERTIFICATION_VERIFIED: 'Certified',
};

const verificationColors: Record<SkillVerificationLevel, string> = {
  SELF_ASSESSED: 'secondary',
  PEER_ENDORSED: 'default',
  PROJECT_VERIFIED: 'default',
  AI_ANALYZED: 'default',
  ASSESSMENT_PASSED: 'default',
  CERTIFICATION_VERIFIED: 'default',
};

const proficiencyLabels: Record<number, string> = {
  1: 'Novice',
  2: 'Advanced Beginner',
  3: 'Competent',
  4: 'Proficient',
  5: 'Expert',
  6: 'Master',
  7: 'Thought Leader',
};

interface SkillDetailModalProps {
  skill: UserSkillWithTaxonomy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSkillUpdated?: (skill: UserSkillWithTaxonomy) => void;
  onSkillDeleted?: (skillId: string) => void;
}

export function SkillDetailModal({
  skill,
  open,
  onOpenChange,
  onSkillUpdated,
  onSkillDeleted,
}: SkillDetailModalProps) {
  const { updateUserSkill, removeUserSkill, setSelectedSkill } = useSkillsStore();

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [proficiencyLevel, setProficiencyLevel] = useState(1);
  const [yearsExperience, setYearsExperience] = useState<string>('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [notes, setNotes] = useState('');

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form when skill changes
  useEffect(() => {
    if (skill) {
      setProficiencyLevel(skill.proficiency_level);
      setYearsExperience(skill.years_experience?.toString() || '');
      setIsPrimary(skill.is_primary);
      setNotes(skill.notes || '');
    }
  }, [skill]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
      setShowDeleteConfirm(false);
      setError(null);
    }
  }, [open]);

  const handleClose = () => {
    setSelectedSkill(null);
    onOpenChange(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancelEdit = () => {
    if (skill) {
      setProficiencyLevel(skill.proficiency_level);
      setYearsExperience(skill.years_experience?.toString() || '');
      setIsPrimary(skill.is_primary);
      setNotes(skill.notes || '');
    }
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!skill) return;

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/skills/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: skill.id,
          proficiency_level: proficiencyLevel,
          years_experience: yearsExperience ? parseInt(yearsExperience) : null,
          is_primary: isPrimary,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update skill');
      }

      const data = await res.json();
      updateUserSkill(skill.id, data.skill);
      onSkillUpdated?.(data.skill);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update skill');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!skill) return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/skills/user?id=${skill.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete skill');
      }

      removeUserSkill(skill.id);
      onSkillDeleted?.(skill.id);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete skill');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!skill) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-10 rounded-full shrink-0"
              style={{ backgroundColor: categoryColors[skill.skill.category] }}
            />
            <div>
              <DialogTitle>{skill.skill.name}</DialogTitle>
              <DialogDescription>
                {categoryLabels[skill.skill.category]}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {showDeleteConfirm ? (
          // Delete Confirmation View
          <div className="py-6 space-y-4">
            <p className="text-center">
              Are you sure you want to remove <strong>{skill.skill.name}</strong> from your skills?
            </p>
            <p className="text-sm text-[var(--foreground-muted)] text-center">
              This will also remove any endorsements for this skill.
            </p>
            {error && (
              <p className="text-sm text-[var(--danger)] text-center">{error}</p>
            )}
            <div className="flex justify-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Skill'
                )}
              </Button>
            </div>
          </div>
        ) : isEditing ? (
          // Edit View
          <div className="space-y-6 py-4">
            {/* Proficiency Level */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-medium">Proficiency Level</label>
                <span className="text-sm text-[var(--primary)] font-medium">
                  Level {proficiencyLevel}: {proficiencyLabels[proficiencyLevel]}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                value={proficiencyLevel}
                onChange={(e) => setProficiencyLevel(parseInt(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
              <div className="flex justify-between text-xs text-[var(--foreground-muted)]">
                <span>1 - Novice</span>
                <span>7 - Thought Leader</span>
              </div>
            </div>

            {/* Years of Experience */}
            <div className="space-y-2">
              <label className="font-medium">Years of Experience</label>
              <Input
                type="number"
                min="0"
                max="50"
                placeholder="e.g., 3"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
              />
            </div>

            {/* Primary Skill Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]">
              <div>
                <p className="font-medium">Primary Skill</p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Highlighted on your profile
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isPrimary}
                onClick={() => setIsPrimary(!isPrimary)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors',
                  isPrimary ? 'bg-[var(--primary)]' : 'bg-[var(--background-tertiary)]'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                    isPrimary && 'translate-x-5'
                  )}
                />
              </button>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="font-medium">Notes</label>
              <textarea
                placeholder="Add any additional context..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-[var(--danger)]">{error}</p>
            )}
          </div>
        ) : (
          // View Mode
          <div className="space-y-6 py-4">
            {/* Proficiency Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground-muted)]">Proficiency</span>
                <span className="font-medium">
                  Level {skill.proficiency_level}: {proficiencyLabels[skill.proficiency_level]}
                </span>
              </div>
              <div className="h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-all"
                  style={{ width: `${(skill.proficiency_level / 7) * 100}%` }}
                />
              </div>
            </div>

            {/* Verification Badge */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--foreground-muted)]">Verification</span>
              <Badge variant={verificationColors[skill.verification_level] as 'default' | 'secondary'}>
                {verificationLabels[skill.verification_level]}
              </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {skill.years_experience !== null && (
                <div className="p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]">
                  <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Experience</span>
                  </div>
                  <p className="font-semibold">{skill.years_experience} years</p>
                </div>
              )}

              {skill.is_primary && (
                <div className="p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]">
                  <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
                    <Star className="w-4 h-4" />
                    <span className="text-xs">Status</span>
                  </div>
                  <p className="font-semibold">Primary Skill</p>
                </div>
              )}

              {skill.endorsements && skill.endorsements.length > 0 && (
                <div className="p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]">
                  <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Endorsements</span>
                  </div>
                  <p className="font-semibold">{skill.endorsements.length}</p>
                </div>
              )}
            </div>

            {/* Notes */}
            {skill.notes && (
              <div className="p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]">
                <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs">Notes</span>
                </div>
                <p className="text-sm">{skill.notes}</p>
              </div>
            )}

            {/* Endorsements List */}
            {skill.endorsements && skill.endorsements.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-[var(--foreground-muted)]">
                  Endorsements
                </h4>
                <div className="space-y-2">
                  {skill.endorsements.slice(0, 3).map((endorsement) => (
                    <div
                      key={endorsement.id}
                      className="p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-[var(--primary-muted)] flex items-center justify-center text-xs font-medium">
                          {endorsement.endorser_id.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">
                          {endorsement.relationship || 'Colleague'}
                        </span>
                      </div>
                      {endorsement.endorsement_text && (
                        <p className="text-sm text-[var(--foreground-muted)] mt-1">
                          "{endorsement.endorsement_text}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Description */}
            {skill.skill.description && (
              <div className="pt-4 border-t border-[var(--border)]">
                <p className="text-sm text-[var(--foreground-muted)]">
                  {skill.skill.description}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {showDeleteConfirm ? null : isEditing ? (
            <>
              <Button variant="secondary" onClick={handleCancelEdit} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-[var(--danger)] hover:text-[var(--danger)]"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button variant="secondary" onClick={handleEdit}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
