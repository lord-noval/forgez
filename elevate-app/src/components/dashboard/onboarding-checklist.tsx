"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  FolderPlus,
  Database,
  MessageSquare,
  Compass,
  User,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWorldLabels } from "@/stores/world-store";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  checkComplete: () => boolean;
}

interface OnboardingChecklistProps {
  projectCount: number;
  skillCount: number;
  feedbackCount: number;
  hasExploredCareers: boolean;
  profileComplete: boolean;
  className?: string;
}

export function OnboardingChecklist({
  projectCount,
  skillCount,
  feedbackCount,
  hasExploredCareers,
  profileComplete,
  className,
}: OnboardingChecklistProps) {
  const labels = useWorldLabels();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Check localStorage for dismissed state
  useEffect(() => {
    const dismissed = localStorage.getItem("onboarding-checklist-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  const checklistItems: ChecklistItem[] = [
    {
      id: "project",
      title: "Add your first project",
      description: "Showcase your work and let AI extract your skills",
      icon: FolderPlus,
      href: "/portfolio/new",
      checkComplete: () => projectCount > 0,
    },
    {
      id: "skills",
      title: "Add 3 skills to your bank",
      description: "Build your verified skill profile",
      icon: Database,
      href: "/skills/bank",
      checkComplete: () => skillCount >= 3,
    },
    {
      id: "feedback",
      title: "Request peer feedback",
      description: "Get 360-degree validation from peers",
      icon: MessageSquare,
      href: "/feedback/new",
      checkComplete: () => feedbackCount > 0,
    },
    {
      id: "careers",
      title: "Explore career matches",
      description: "Discover paths that match your skills",
      icon: Compass,
      href: "/compass",
      checkComplete: () => hasExploredCareers,
    },
    {
      id: "profile",
      title: "Complete your profile",
      description: "Add headline, bio, and links",
      icon: User,
      href: "/profile",
      checkComplete: () => profileComplete,
    },
  ];

  const completedCount = checklistItems.filter(item => item.checkComplete()).length;
  const progressPercent = (completedCount / checklistItems.length) * 100;
  const isAllComplete = completedCount === checklistItems.length;

  const handleDismiss = () => {
    localStorage.setItem("onboarding-checklist-dismissed", "true");
    setIsDismissed(true);
  };

  // Don't render if dismissed or all complete
  if (isDismissed) return null;

  return (
    <Card
      variant="glass-card"
      className={cn("overflow-hidden", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="font-semibold font-display">Getting Started</h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              {completedCount} of {checklistItems.length} completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)]" />
            </motion.div>
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors"
          >
            <X className="w-4 h-4 text-[var(--foreground-muted)]" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-[var(--background-tertiary)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
        />
      </div>

      {/* Checklist Items */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {checklistItems.map((item, index) => {
                const isComplete = item.checkComplete();
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-all group",
                        isComplete
                          ? "bg-[var(--success-muted)] opacity-70"
                          : "hover:bg-[var(--background-tertiary)]"
                      )}
                    >
                      {/* Status Icon */}
                      <div className={cn(
                        "flex-shrink-0",
                        isComplete ? "text-[var(--success)]" : "text-[var(--foreground-muted)]"
                      )}>
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </div>

                      {/* Item Icon */}
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        isComplete
                          ? "bg-[var(--success-muted)] text-[var(--success)]"
                          : "bg-[var(--primary-muted)] text-[var(--primary)]"
                      )}>
                        <item.icon className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium text-sm",
                          isComplete && "line-through text-[var(--foreground-muted)]"
                        )}>
                          {item.title}
                        </p>
                        <p className="text-xs text-[var(--foreground-muted)] truncate">
                          {item.description}
                        </p>
                      </div>

                      {/* Arrow */}
                      {!isComplete && (
                        <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Completion Message */}
            {isAllComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 pb-4"
              >
                <div className="p-4 rounded-lg bg-[var(--success-muted)] text-center">
                  <p className="text-[var(--success)] font-medium">
                    You&apos;re all set! Your profile is ready to shine.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDismiss}
                    className="mt-2"
                  >
                    Dismiss checklist
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
