"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Upload,
  Link2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  X,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { JobPosting, SkillsTaxonomy } from "@/lib/supabase/types";

// ============================================================================
// Types
// ============================================================================

interface JobApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobPosting & { company?: { name: string; logo_url?: string } };
  userSkills?: Array<{ skill: SkillsTaxonomy; proficiency_level: number }>;
  onSubmit: (application: ApplicationData) => Promise<void>;
}

interface ApplicationData {
  coverLetter: string;
  resumeFile?: File;
  includePortfolio: boolean;
  portfolioUrl?: string;
}

// ============================================================================
// Component
// ============================================================================

export function JobApplicationModal({
  open,
  onOpenChange,
  job,
  userSkills = [],
  onSubmit,
}: JobApplicationModalProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [includePortfolio, setIncludePortfolio] = useState(true);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate skill match
  const requiredSkills = (job.required_skills as { skills?: string[] })?.skills || [];
  const matchedSkills = userSkills.filter(us =>
    requiredSkills.some(rs =>
      us.skill.name.toLowerCase().includes(rs.toLowerCase()) ||
      rs.toLowerCase().includes(us.skill.name.toLowerCase())
    )
  );
  const matchPercent = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF or Word document");
        return;
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setResumeFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!coverLetter.trim()) {
      setError("Please write a cover letter");
      return;
    }
    if (coverLetter.length < 50) {
      setError("Cover letter should be at least 50 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        coverLetter,
        resumeFile: resumeFile || undefined,
        includePortfolio,
        portfolioUrl: includePortfolio ? portfolioUrl : undefined,
      });
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      // Reset form after animation
      setTimeout(() => {
        setCoverLetter("");
        setResumeFile(null);
        setIncludePortfolio(true);
        setPortfolioUrl("");
        setIsSuccess(false);
        setError(null);
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Apply for {job.title}</DialogTitle>
              <DialogDescription>
                {job.company?.name && `at ${job.company.name}`}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Skill Match Display */}
              {requiredSkills.length > 0 && (
                <Card variant="glass" className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Skill Match</span>
                    <Badge
                      variant={
                        matchPercent >= 70 ? "success" :
                        matchPercent >= 40 ? "warning" : "secondary"
                      }
                    >
                      {matchPercent}% Match
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {requiredSkills.map((skill) => {
                      const hasSkill = matchedSkills.some(ms =>
                        ms.skill.name.toLowerCase().includes(skill.toLowerCase()) ||
                        skill.toLowerCase().includes(ms.skill.name.toLowerCase())
                      );
                      return (
                        <Badge
                          key={skill}
                          variant={hasSkill ? "success" : "outline"}
                          className="gap-1"
                        >
                          {hasSkill && <Check className="w-3 h-3" />}
                          {skill}
                        </Badge>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Error Display */}
              {error && (
                <ErrorMessage
                  variant="error"
                  message={error}
                  dismissible
                  onDismiss={() => setError(null)}
                />
              )}

              {/* Cover Letter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Cover Letter <span className="text-[var(--danger)]">*</span>
                </label>
                <Textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell them why you're a great fit for this role..."
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-[var(--foreground-muted)]">
                  {coverLetter.length} characters (minimum 50)
                </p>
              </div>

              {/* Resume Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Resume (optional)</label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                    "hover:border-[var(--primary)] hover:bg-[var(--primary-muted)]",
                    resumeFile ? "border-[var(--success)] bg-[var(--success-muted)]" : "border-[var(--border)]"
                  )}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    {resumeFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="w-5 h-5 text-[var(--success)]" />
                        <span className="text-sm">{resumeFile.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setResumeFile(null);
                          }}
                          className="p-1 hover:bg-[var(--background-tertiary)] rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-[var(--foreground-muted)]" />
                        <p className="text-sm text-[var(--foreground-muted)]">
                          Click to upload PDF or Word document
                        </p>
                        <p className="text-xs text-[var(--foreground-subtle)]">
                          Max 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Portfolio Link */}
              <div className="space-y-3">
                <Checkbox
                  checked={includePortfolio}
                  onChange={(e) => setIncludePortfolio(e.target.checked)}
                  label="Include my FORGE-Z portfolio"
                />

                {includePortfolio && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
                      <Input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://elevate.app/portfolio/username (optional)"
                        className="pl-9"
                      />
                    </div>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      Your public portfolio will be shared with the employer
                    </p>
                  </motion.div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          /* Success State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--success-muted)] flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[var(--success)]" />
            </div>
            <h2 className="text-xl font-bold font-display mb-2">
              Application Submitted!
            </h2>
            <p className="text-[var(--foreground-muted)] mb-6 max-w-sm mx-auto">
              Your application for {job.title} has been sent to {job.company?.name || "the employer"}.
              They&apos;ll be in touch if you&apos;re a good fit.
            </p>
            <Button onClick={handleClose}>
              Close
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
