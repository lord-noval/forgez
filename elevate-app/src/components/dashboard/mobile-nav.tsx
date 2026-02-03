"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Database,
  Compass,
  MoreHorizontal,
  MessageSquare,
  Users,
  Briefcase,
  GraduationCap,
  Settings,
  X,
  // World-specific icons
  Stars,
  Wrench,
  Sprout,
  Microscope,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorldStore } from "@/stores/world-store";
import { useWorldLabelsI18n } from "@/i18n/use-world-labels";
import type { WorldId } from "@/themes/types";
import type { LucideIcon } from "lucide-react";

// Icon mappings per world for mobile nav
const worldMobileIcons: Record<WorldId, {
  dashboard: LucideIcon;
  portfolio: LucideIcon;
  skillsBank: LucideIcon;
  compass: LucideIcon;
  profile: LucideIcon;
}> = {
  forgez: {
    dashboard: LayoutDashboard,
    portfolio: FolderKanban,
    skillsBank: Database,
    compass: Wrench,
    profile: User,
  },
};

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();
  const { currentWorld } = useWorldStore();
  const labels = useWorldLabelsI18n();
  const t = useTranslations('common');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const icons = worldMobileIcons[currentWorld];

  // Primary nav items - shown in bottom bar
  const primaryNavItems = [
    { href: "/dashboard", icon: icons.dashboard, label: labels.dashboard },
    { href: "/portfolio", icon: icons.portfolio, label: labels.portfolio },
    { href: "/skills/bank", icon: icons.skillsBank, label: labels.skillsBank },
    { href: "/compass", icon: icons.compass, label: labels.compass },
  ];

  // Secondary nav items - shown in "More" menu
  const secondaryNavItems = [
    { href: "/feedback", icon: MessageSquare, label: labels.feedback },
    { href: "/teams", icon: Users, label: labels.teams },
    { href: "/careers", icon: Briefcase, label: labels.careers },
    { href: "/learn", icon: GraduationCap, label: labels.learn },
    { href: "/profile", icon: User, label: labels.profile },
    { href: "/settings", icon: Settings, label: labels.settings },
  ];

  // Check if any secondary item is active
  const isSecondaryActive = secondaryNavItems.some(
    item => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-[var(--background-secondary)] border-t border-[var(--border)]",
          "safe-area-bottom",
          className
        )}
      >
        <div className="flex items-center justify-around py-2">
          {primaryNavItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all relative min-w-[60px]",
                  isActive
                    ? "text-[var(--primary)]"
                    : "text-[var(--foreground-muted)]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute inset-0 bg-[var(--primary-muted)] rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon className="w-5 h-5 relative z-10" />
                <span className="text-xs font-medium relative z-10 text-center leading-tight max-w-[64px]">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setMoreMenuOpen(true)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all relative min-w-[60px]",
              isSecondaryActive || moreMenuOpen
                ? "text-[var(--primary)]"
                : "text-[var(--foreground-muted)]"
            )}
          >
            {(isSecondaryActive || moreMenuOpen) && (
              <motion.div
                layoutId="mobile-nav-active"
                className="absolute inset-0 bg-[var(--primary-muted)] rounded-lg"
                initial={false}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <MoreHorizontal className="w-5 h-5 relative z-10" />
            <span className="text-xs font-medium relative z-10">{t('navigation.more')}</span>
          </button>
        </div>
      </nav>

      {/* More Menu Drawer */}
      <AnimatePresence>
        {moreMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMoreMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "fixed bottom-0 left-0 right-0 z-50",
                "bg-[var(--background-secondary)] border-t border-[var(--border)]",
                "rounded-t-2xl",
                "safe-area-bottom"
              )}
            >
              {/* Drawer Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3">
                <h3 className="font-semibold font-display">{t('navigation.more')}</h3>
                <button
                  onClick={() => setMoreMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--foreground-muted)]" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="grid grid-cols-3 gap-2 px-4 pb-6">
                {secondaryNavItems.map((item) => {
                  const isActive = pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreMenuOpen(false)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl transition-all",
                        isActive
                          ? "bg-[var(--primary-muted)] text-[var(--primary)]"
                          : "hover:bg-[var(--background-tertiary)] text-[var(--foreground-muted)]"
                      )}
                    >
                      <item.icon className="w-6 h-6" />
                      <span className="text-xs font-medium text-center">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
