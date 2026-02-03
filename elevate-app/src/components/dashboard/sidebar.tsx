"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  User,
  LogOut,
  Zap,
  Settings,
  FolderKanban,
  Database,
  MessageCircle,
  Users,
  Compass,
  BookOpen,
  Briefcase,
  Trophy,
  // World-specific icons
  Rocket,
  Hammer,
  Leaf,
  Atom,
  Stars,
  Wrench,
  Sprout,
  Microscope,
  Brain,
  GraduationCap,
  Library,
  Lightbulb,
  Map,
  Route,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { useWorldStore, useWorldTheme } from "@/stores/world-store";
import { useWorldLabelsI18n } from "@/i18n/use-world-labels";
import { createClient } from "@/lib/supabase/client";
import { PlayerStats } from "./PlayerStats";
import type { WorldId } from "@/themes/types";
import type { LucideIcon } from "lucide-react";

// Icon mappings per world (FORGE-Z only)
const worldIcons: Record<WorldId, {
  hero: LucideIcon;
  dashboard: LucideIcon;
  skills: LucideIcon;
  profile: LucideIcon;
  portfolio: LucideIcon;
  skillsBank: LucideIcon;
  feedback: LucideIcon;
  teams: LucideIcon;
  careers: LucideIcon;
  learn: LucideIcon;
  compass: LucideIcon;
}> = {
  forgez: {
    hero: Hammer,
    dashboard: LayoutDashboard,
    skills: Wrench,
    profile: User,
    portfolio: FolderKanban,
    skillsBank: Database,
    feedback: MessageCircle,
    teams: Users,
    careers: Briefcase,
    learn: BookOpen,
    compass: Map,
  },
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUserStore();
  const { currentWorld } = useWorldStore();
  const labels = useWorldLabelsI18n();
  const theme = useWorldTheme();
  const t = useTranslations('common');
  const supabase = createClient();

  const icons = worldIcons[currentWorld];
  const HeroIcon = icons.hero;

  const tAchievements = useTranslations('achievements');

  // Build navigation items with world-specific labels and icons
  const navItems = [
    { href: "/dashboard", icon: icons.dashboard, label: labels.dashboard },
    { href: "/portfolio", icon: icons.portfolio, label: labels.portfolio },
    { href: "/skills/bank", icon: icons.skillsBank, label: labels.skillsBank },
    { href: "/achievements", icon: Trophy, label: tAchievements('nav.achievements') },
    { href: "/feedback", icon: icons.feedback, label: labels.feedback },
    { href: "/teams", icon: icons.teams, label: labels.teams },
    { href: "/careers", icon: icons.careers, label: labels.careers },
    { href: "/learn", icon: icons.learn, label: labels.learn },
    { href: "/compass", icon: icons.compass, label: labels.compass },
    { href: "/profile", icon: icons.profile, label: labels.profile },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 flex flex-col",
        "bg-[var(--background-secondary)] border-r border-[var(--border)]",
        className
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border)]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center">
            <HeroIcon className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <span className="text-xl font-bold font-display gradient-text">
            FORGE-Z
          </span>
        </Link>
      </div>

      {/* Player Stats - RPG Gamification */}
      <div className="border-b border-[var(--border)]">
        <PlayerStats />
      </div>

      {/* User greeting */}
      {user && (
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <p className="text-sm text-[var(--foreground-muted)]">
            {labels.welcomeMessage}
          </p>
          <p className="font-medium text-[var(--foreground)] truncate">
            {user.username || user.email}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                "relative overflow-hidden group",
                isActive
                  ? "bg-[var(--primary-muted)] text-[var(--primary)]"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-[var(--primary-muted)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className="w-5 h-5 relative z-10" />
              <span className="font-medium relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-[var(--border)] space-y-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
            pathname === "/settings"
              ? "bg-[var(--primary-muted)] text-[var(--primary)]"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)]"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">{labels.settings}</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t('buttons.signOut')}</span>
        </button>
      </div>
    </aside>
  );
}
