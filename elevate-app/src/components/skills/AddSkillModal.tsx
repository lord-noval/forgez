'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useSkillsStore } from '@/stores/skills-store';
import type { SkillsTaxonomy, SkillCategory, UserSkillWithTaxonomy } from '@/lib/supabase/types';

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

const proficiencyLabels: Record<number, string> = {
  1: 'Novice',
  2: 'Advanced Beginner',
  3: 'Competent',
  4: 'Proficient',
  5: 'Expert',
  6: 'Master',
  7: 'Thought Leader',
};

interface AddSkillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSkillAdded?: (skill: UserSkillWithTaxonomy) => void;
}

export function AddSkillModal({ open, onOpenChange, onSkillAdded }: AddSkillModalProps) {
  const { userSkills, addUserSkill } = useSkillsStore();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | ''>('');
  const [searchResults, setSearchResults] = useState<SkillsTaxonomy[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Selected skill state
  const [selectedSkill, setSelectedSkill] = useState<SkillsTaxonomy | null>(null);
  const [proficiencyLevel, setProficiencyLevel] = useState(3);
  const [yearsExperience, setYearsExperience] = useState<string>('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [notes, setNotes] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if skill is already added
  const isSkillAlreadyAdded = useCallback(
    (skillId: string) => userSkills.some((s) => s.skill_id === skillId),
    [userSkills]
  );

  // Load initial skills when modal opens
  useEffect(() => {
    if (!open) return;

    const loadInitialSkills = async () => {
      setIsSearching(true);
      try {
        const res = await fetch('/api/skills/taxonomy?limit=50');
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.skills || []);
        }
      } catch (err) {
        console.error('Initial load error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    loadInitialSkills();
  }, [open]);

  // Search for skills with debounce when query or filter changes
  useEffect(() => {
    if (!open) return;

    // Skip if no search criteria
    const hasSearchQuery = searchQuery.length >= 2;
    const hasCategoryFilter = !!categoryFilter;

    if (!hasSearchQuery && !hasCategoryFilter) {
      // Reset to all skills
      const loadAllSkills = async () => {
        setIsSearching(true);
        try {
          const res = await fetch('/api/skills/taxonomy?limit=50');
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data.skills || []);
          }
        } catch (err) {
          console.error('Load error:', err);
        } finally {
          setIsSearching(false);
        }
      };
      loadAllSkills();
      return;
    }

    const searchSkills = async () => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery && searchQuery.length >= 2) params.set('search', searchQuery);
        if (categoryFilter) params.set('category', categoryFilter);
        params.set('limit', '50');

        const res = await fetch(`/api/skills/taxonomy?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.skills || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchSkills, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, categoryFilter, open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setCategoryFilter('');
      setSearchResults([]);
      setSelectedSkill(null);
      setProficiencyLevel(3);
      setYearsExperience('');
      setIsPrimary(false);
      setNotes('');
      setError(null);
    }
  }, [open]);

  const handleSelectSkill = (skill: SkillsTaxonomy) => {
    if (isSkillAlreadyAdded(skill.id)) return;
    setSelectedSkill(skill);
    setError(null);
  };

  const handleBack = () => {
    setSelectedSkill(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedSkill) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/skills/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_id: selectedSkill.id,
          proficiency_level: proficiencyLevel,
          years_experience: yearsExperience ? parseInt(yearsExperience) : null,
          is_primary: isPrimary,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add skill');
      }

      const data = await res.json();
      addUserSkill(data.skill);
      onSkillAdded?.(data.skill);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {selectedSkill ? 'Add Skill Details' : 'Add Skill'}
          </DialogTitle>
          <DialogDescription>
            {selectedSkill
              ? `Set your proficiency level for ${selectedSkill.name}`
              : 'Search for a skill to add to your profile'}
          </DialogDescription>
        </DialogHeader>

        {!selectedSkill ? (
          // Search View
          <div className="flex-1 overflow-hidden flex flex-col gap-4 pt-1">
            {/* Search input */}
            <div className="flex gap-2 px-0.5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
                <Input
                  placeholder="Search skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as SkillCategory | '')}
                className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] text-sm"
              >
                <option value="">All Categories</option>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto min-h-[300px] border border-[var(--border)] rounded-lg">
              {isSearching ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--foreground-muted)]" />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[var(--foreground-muted)]">
                  {searchQuery.length > 0 && searchQuery.length < 2
                    ? 'Type at least 2 characters to search'
                    : 'No skills found'}
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {searchResults.map((skill) => {
                    const alreadyAdded = isSkillAlreadyAdded(skill.id);
                    return (
                      <button
                        key={skill.id}
                        onClick={() => handleSelectSkill(skill)}
                        disabled={alreadyAdded}
                        className={cn(
                          'w-full p-3 text-left flex items-center gap-3 transition-colors',
                          alreadyAdded
                            ? 'opacity-50 cursor-not-allowed bg-[var(--background-tertiary)]'
                            : 'hover:bg-[var(--background-secondary)]'
                        )}
                      >
                        <div
                          className="w-2 h-8 rounded-full shrink-0"
                          style={{ backgroundColor: categoryColors[skill.category] }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{skill.name}</p>
                            {alreadyAdded && (
                              <span className="text-xs text-[var(--success)] flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Added
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[var(--foreground-muted)] truncate">
                            {categoryLabels[skill.category]}
                            {skill.description && ` • ${skill.description}`}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Detail Form View
          <div className="flex-1 overflow-y-auto space-y-6">
            {/* Selected skill info */}
            <div className="p-4 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-10 rounded-full shrink-0"
                  style={{ backgroundColor: categoryColors[selectedSkill.category] }}
                />
                <div>
                  <p className="font-semibold">{selectedSkill.name}</p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {categoryLabels[selectedSkill.category]}
                  </p>
                </div>
              </div>
              {selectedSkill.description && (
                <p className="mt-3 text-sm text-[var(--foreground-muted)]">
                  {selectedSkill.description}
                </p>
              )}
            </div>

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
                <p className="font-medium">Mark as Primary Skill</p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Primary skills are highlighted on your profile
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
              <label className="font-medium">Notes (Optional)</label>
              <textarea
                placeholder="Add any additional context about this skill..."
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
        )}

        <DialogFooter>
          {selectedSkill ? (
            <>
              <Button variant="secondary" onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Skill'
                )}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
