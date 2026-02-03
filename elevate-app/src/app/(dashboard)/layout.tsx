"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { LevelUpCelebration } from "@/components/gamification/LevelUpCelebration";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Desktop sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile header with player stats */}
      <div className="md:hidden">
        <MobileHeader />
      </div>

      {/* Main content with page transition */}
      <main className="md:pl-64 pb-20 md:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="max-w-7xl mx-auto p-4 md:p-8"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile bottom navigation */}
      <MobileNav className="md:hidden" />

      {/* Level up celebration modal */}
      <LevelUpCelebration />
    </div>
  );
}
