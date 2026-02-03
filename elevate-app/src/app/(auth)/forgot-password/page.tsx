"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Loader2, Zap, ChevronLeft, CheckCircle,
  FileCheck, MessageCircle, Compass, Cpu, Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { StaggerContainer, StaggerItem, Presence } from "@/components/ui/animations";
import { useFormState, validators } from "@/hooks/use-form-state";
import { createClient } from "@/lib/supabase/client";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";

// ============================================================================
// Constants
// ============================================================================

const floatingIcons = [
  { Icon: FileCheck, color: "var(--primary)", delay: 0 },
  { Icon: MessageCircle, color: "var(--secondary)", delay: 0.5 },
  { Icon: Compass, color: "var(--success)", delay: 1 },
  { Icon: Cpu, color: "var(--achievement)", delay: 1.5 },
  { Icon: Rocket, color: "var(--warning)", delay: 2 },
];

// ============================================================================
// Types
// ============================================================================

interface ForgotPasswordFormData {
  email: string;
}

// ============================================================================
// Component
// ============================================================================

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const supabase = createClient();
  const t = useTranslations("auth");
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus email field on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // Form state with validation
  const {
    data,
    globalError,
    isSubmitting,
    setValue,
    setGlobalError,
    handleSubmit,
  } = useFormState<ForgotPasswordFormData>({
    initialData: {
      email: "",
    },
    validate: (formData) => {
      const errors: Partial<Record<keyof ForgotPasswordFormData, string>> = {};

      const emailError =
        validators.required(formData.email, "Email") ||
        validators.email(formData.email);
      if (emailError) errors.email = emailError;

      return Object.keys(errors).length > 0 ? errors : null;
    },
    onSubmit: async (formData) => {
      const { error } = await supabase.auth.resetPasswordForEmail(
        formData.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) throw error;

      setSubmittedEmail(formData.email);
      setEmailSent(true);
    },
    onError: (error) => {
      setGlobalError(error.message);
    },
  });

  return (
    <div className="min-h-screen flex bg-[var(--background)] overflow-hidden relative">
      {/* Language Switcher */}
      <LocaleSwitcher className="absolute top-4 right-4 z-50" />

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative p-12 flex-col justify-between overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-muted)] via-transparent to-[var(--secondary-muted)] opacity-30" />

        {/* Animated blur orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[var(--primary)] rounded-full blur-[120px] opacity-15 animate-pulse" />
        <div
          className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-[var(--secondary)] rounded-full blur-[100px] opacity-15 animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        {/* Floating icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingIcons.map(({ Icon, color, delay }, index) => (
            <motion.div
              key={index}
              className="absolute"
              style={{
                left: `${15 + index * 18}%`,
                top: `${20 + (index % 3) * 25}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div
                className="p-3 rounded-xl backdrop-blur-sm"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Logo & Tagline */}
        <StaggerContainer className="relative z-10">
          <StaggerItem>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-[var(--primary-muted)] backdrop-blur-sm border border-[var(--primary)]/20">
                <Zap className="w-8 h-8 text-[var(--primary)]" />
              </div>
              <h1 className="text-4xl font-bold font-display gradient-text">
                FORGE-Z
              </h1>
            </div>
          </StaggerItem>
          <StaggerItem>
            <p className="text-xl text-[var(--foreground-muted)] max-w-md">
              {t("brand.tagline")}
            </p>
          </StaggerItem>
        </StaggerContainer>

        {/* Centered content */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="w-full max-w-lg">
            <Card variant="glass-card" className="p-6">
              <div className="inline-flex p-3 rounded-xl mb-4 bg-[var(--primary)]20">
                <Mail className="w-8 h-8" style={{ color: "var(--primary)" }} />
              </div>
              <h3 className="text-2xl font-bold font-display mb-2">
                {t("forgotPassword.title")}
              </h3>
              <p className="text-[var(--foreground-muted)] text-lg">
                {t("forgotPassword.subtitle")}
              </p>
            </Card>
          </div>
        </div>

        {/* Spacer */}
        <div className="relative z-10" />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--primary-muted)] mb-4"
            >
              <Zap className="w-8 h-8 text-[var(--primary)]" />
            </motion.div>
            <h1 className="text-3xl font-bold font-display gradient-text">
              FORGE-Z
            </h1>
            <p className="text-[var(--foreground-muted)] mt-2">
              {t("brand.tagline")}
            </p>
          </div>

          <Card variant="glass-card" className="p-8">
            <AnimatePresence mode="wait">
              {!emailSent ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold font-display mb-2">
                      {t("forgotPassword.title")}
                    </h2>
                    <p className="text-[var(--foreground-muted)]">
                      {t("forgotPassword.subtitle")}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-subtle)]" />
                      <Input
                        ref={emailInputRef}
                        type="email"
                        inputMode="email"
                        enterKeyHint="send"
                        placeholder={t("forgotPassword.emailPlaceholder")}
                        value={data.email}
                        onChange={(e) => setValue("email", e.target.value)}
                        className="pl-11 h-12 text-base"
                        required
                        autoComplete="email"
                      />
                    </div>

                    {/* Error Message */}
                    <Presence show={!!globalError} variant="fadeInUp">
                      <ErrorMessage
                        message={globalError || ""}
                        dismissible
                        onDismiss={() => setGlobalError(null)}
                      />
                    </Presence>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          {t("forgotPassword.sending")}
                        </>
                      ) : (
                        t("forgotPassword.sendLink")
                      )}
                    </Button>
                  </form>

                  {/* Back to login */}
                  <div className="mt-6 text-center">
                    <Link
                      href="/login"
                      className="inline-flex items-center text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {t("forgotPassword.backToLogin")}
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--success-muted)] mb-6"
                  >
                    <CheckCircle className="w-8 h-8 text-[var(--success)]" />
                  </motion.div>

                  <h2 className="text-2xl font-bold font-display mb-2">
                    {t("success.checkInbox")}
                  </h2>
                  <p className="text-[var(--foreground-muted)] mb-2">
                    {t("success.sentLink")}
                  </p>
                  <p className="text-[var(--foreground)] font-medium mb-6">
                    {submittedEmail}
                  </p>

                  <div className="p-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] mb-6">
                    <p className="text-sm text-[var(--foreground-muted)]">
                      {t("forgotPassword.success")}
                    </p>
                  </div>

                  <Link
                    href="/login"
                    className="inline-flex items-center text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t("forgotPassword.backToLogin")}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
