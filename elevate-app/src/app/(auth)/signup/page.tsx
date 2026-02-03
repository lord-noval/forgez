"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, Loader2, Zap, ArrowRight,
  Upload, Cpu, Users, Check, FileCode, Presentation,
  Image as ImageIcon, Rocket, Cog, Zap as Energy,
  Eye, EyeOff, CheckCircle2, XCircle, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorMessage } from "@/components/ui/error-message";
import { StaggerContainer, StaggerItem, Presence } from "@/components/ui/animations";
import { useFormState, validators } from "@/hooks/use-form-state";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";

// ============================================================================
// Types
// ============================================================================

interface SignupFormData {
  email: string;
  password: string;
  privacyPolicyAccepted: boolean;
  termsOfServiceAccepted: boolean;
  marketingAccepted: boolean;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  requirements: {
    label: string;
    met: boolean;
  }[];
}

// ============================================================================
// Password Strength Indicator Component
// ============================================================================

function PasswordStrengthIndicator({
  password,
  show,
  t
}: {
  password: string;
  show: boolean;
  t: ReturnType<typeof useTranslations<'auth'>>;
}) {
  const strength = useMemo(() => {
    const requirements = [
      { label: t('password.requirements.length'), met: password.length >= 8 },
      { label: t('password.requirements.uppercase'), met: /[A-Z]/.test(password) },
      { label: t('password.requirements.lowercase'), met: /[a-z]/.test(password) },
      { label: t('password.requirements.number'), met: /[0-9]/.test(password) },
      { label: t('password.requirements.special'), met: /[^A-Za-z0-9]/.test(password) },
    ];

    const metCount = requirements.filter((r) => r.met).length;

    if (metCount <= 1) {
      return { score: 0, label: t('password.weak'), color: "var(--danger)", requirements };
    } else if (metCount <= 2) {
      return { score: 1, label: t('password.fair'), color: "var(--warning)", requirements };
    } else if (metCount <= 3) {
      return { score: 2, label: t('password.good'), color: "var(--success)", requirements };
    } else {
      return { score: 3, label: t('password.strong'), color: "var(--primary)", requirements };
    }
  }, [password, t]);

  if (!show || !password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-3 pt-2"
    >
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--foreground-subtle)]">{t('password.strength')}</span>
          <span className="text-xs font-medium" style={{ color: strength.color }}>
            {strength.label}
          </span>
        </div>
        <div className="h-1.5 bg-[var(--background-tertiary)] rounded-full overflow-hidden flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="h-full flex-1 rounded-full"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                backgroundColor: i <= strength.score ? strength.color : "var(--border)",
              }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-2 gap-1">
        {strength.requirements.map((req, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-1.5 text-xs"
          >
            {req.met ? (
              <CheckCircle2 className="w-3 h-3 text-[var(--success)]" />
            ) : (
              <XCircle className="w-3 h-3 text-[var(--foreground-subtle)]" />
            )}
            <span className={req.met ? "text-[var(--foreground-muted)]" : "text-[var(--foreground-subtle)]"}>
              {req.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Success Screen Component
// ============================================================================

function SuccessScreen({ email, t }: { email: string; t: ReturnType<typeof useTranslations<'auth'>> }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <Card variant="glass-card" className="p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--success-muted)] mb-6"
          >
            <Mail className="w-10 h-10 text-[var(--success)]" />
          </motion.div>

          <h2 className="text-3xl font-bold font-display mb-3">{t('success.checkInbox')}</h2>

          <p className="text-[var(--foreground-muted)] text-lg mb-2">
            {t('success.sentLink')}
          </p>
          <p className="text-[var(--primary)] font-semibold mb-6">{email}</p>

          <StaggerContainer staggerDelay={0.1}>
            <StaggerItem>
              <div className="p-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--primary-muted)]">
                    <Zap className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <p className="text-sm text-left text-[var(--foreground-muted)]">
                    <span className="text-[var(--foreground)] font-semibold">{t('success.nextStep')}</span>{" "}
                    {t('success.confirmEmail')}
                  </p>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>

          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--foreground-subtle)]">
              {t('success.didntReceive')}{" "}
              <button className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium transition-colors">
                {t('success.resend')}
              </button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function SignupPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showStrength, setShowStrength] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations('auth');
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus email field on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const journeySteps = [
    {
      step: "1",
      title: t('journey.upload.title'),
      description: t('journey.upload.description'),
      icon: Upload,
      color: "var(--primary)",
    },
    {
      step: "2",
      title: t('journey.analyze.title'),
      description: t('journey.analyze.description'),
      icon: Cpu,
      color: "var(--secondary)",
    },
    {
      step: "3",
      title: t('journey.connect.title'),
      description: t('journey.connect.description'),
      icon: Users,
      color: "var(--success)",
    },
  ];

  const projectTypes = [
    { icon: FileCode, label: t('projectTypes.code'), color: "var(--primary)" },
    { icon: Presentation, label: t('projectTypes.slides'), color: "var(--secondary)" },
    { icon: ImageIcon, label: t('projectTypes.designs'), color: "var(--success)" },
  ];

  const industryIcons = [
    { Icon: Rocket, label: t('industries.aerospace') },
    { Icon: Cog, label: t('industries.robotics') },
    { Icon: Cpu, label: t('industries.software') },
    { Icon: Energy, label: t('industries.energy') },
  ];

  const signupBenefits = [
    t('benefits.signupList.ai'),
    t('benefits.signupList.profile'),
    t('benefits.signupList.career'),
  ];

  // Form state with validation
  const {
    data,
    globalError,
    isSubmitting,
    setValue,
    setGlobalError,
    hasError,
    getError,
    handleSubmit,
  } = useFormState<SignupFormData>({
    initialData: {
      email: "",
      password: "",
      privacyPolicyAccepted: false,
      termsOfServiceAccepted: false,
      marketingAccepted: false,
    },
    validate: (formData) => {
      const errs: Partial<Record<keyof SignupFormData, string>> = {};

      const emailError =
        validators.required(formData.email, "Email") ||
        validators.email(formData.email);
      if (emailError) errs.email = emailError;

      const passwordError =
        validators.required(formData.password, "Password") ||
        validators.minLength(formData.password, 6, "Password");
      if (passwordError) errs.password = passwordError;

      if (!formData.privacyPolicyAccepted) {
        errs.privacyPolicyAccepted = t('validation.privacyRequired');
      }

      if (!formData.termsOfServiceAccepted) {
        errs.termsOfServiceAccepted = t('validation.tosRequired');
      }

      return Object.keys(errs).length > 0 ? errs : null;
    },
    onSubmit: async (formData) => {
      const { data: authData, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            privacy_policy_agreed_at: new Date().toISOString(),
            tos_agreed_at: new Date().toISOString(),
            marketing_agreed_at: formData.marketingAccepted ? new Date().toISOString() : null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Skip email verification - go directly to onboarding
      if (authData.user) {
        router.push("/onboarding");
      }
    },
    onError: (error) => {
      setGlobalError(error.message);
    },
  });

  // Handle "Accept all" checkbox
  const allConsentsAccepted = data.privacyPolicyAccepted && data.termsOfServiceAccepted && data.marketingAccepted;
  const handleAcceptAll = (checked: boolean) => {
    setValue("privacyPolicyAccepted", checked);
    setValue("termsOfServiceAccepted", checked);
    setValue("marketingAccepted", checked);
  };

  // Rotate journey steps
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % journeySteps.length);
    }, 3000);
    return () => clearInterval(stepInterval);
  }, [journeySteps.length]);

  // Google OAuth
  const handleGoogleSignup = async () => {
    setGlobalError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : "Failed to sign up with Google");
    }
  };

  // Show success screen
  if (success) {
    return <SuccessScreen email={data.email} t={t} />;
  }

  return (
    <div className="min-h-screen flex bg-[var(--background)] overflow-hidden relative">
      {/* Language Switcher */}
      <LocaleSwitcher className="absolute top-4 right-4 z-50" />

      {/* Left Side - Journey Visualization */}
      <div className="hidden lg:flex lg:w-1/2 relative p-12 flex-col justify-between overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-muted)] via-transparent to-[var(--secondary-muted)] opacity-30" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)] rounded-full blur-[128px] opacity-20 animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--secondary)] rounded-full blur-[128px] opacity-20 animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        {/* Logo & Tagline */}
        <StaggerContainer className="relative z-10">
          <StaggerItem>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-[var(--primary-muted)] backdrop-blur-sm border border-[var(--primary)]/20">
                <Zap className="w-8 h-8 text-[var(--primary)]" />
              </div>
              <h1 className="text-4xl font-bold font-display gradient-text">FORGE-Z</h1>
            </div>
          </StaggerItem>
          <StaggerItem>
            <p className="text-xl text-[var(--foreground-muted)] max-w-md">
              {t('brand.buildTagline')}
            </p>
          </StaggerItem>
        </StaggerContainer>

        {/* Journey Steps Timeline */}
        <div className="relative z-10 flex-1 flex items-center py-8">
          <div className="w-full max-w-lg">
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-semibold text-[var(--foreground-muted)] mb-8"
            >
              {t('journey.howItWorks')}
            </motion.h3>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[var(--border)]" />

              {journeySteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === activeStep;
                const isPast = index < activeStep;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className={cn(
                      "relative flex items-start gap-4 mb-8 last:mb-0 transition-all duration-500",
                      isActive && "scale-105"
                    )}
                  >
                    <motion.div
                      animate={{
                        scale: isActive ? [1, 1.2, 1] : 1,
                        boxShadow: isActive
                          ? `0 0 20px ${step.color}40, 0 0 40px ${step.color}20`
                          : "none",
                      }}
                      transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatDelay: 1 }}
                      className="relative z-10 p-3 rounded-xl transition-all duration-300 bg-[var(--background)]"
                      style={{
                        border: `2px solid ${isActive || isPast ? step.color : "var(--border)"}`,
                      }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: isActive || isPast ? step.color : "var(--foreground-subtle)" }}
                      />
                    </motion.div>
                    <div className="flex-1 pt-1">
                      <span
                        className="text-xs font-mono font-bold tracking-wider"
                        style={{ color: isActive ? step.color : "var(--foreground-subtle)" }}
                      >
                        {t('journey.step')} {step.step}
                      </span>
                      <h4
                        className={cn(
                          "font-bold font-display text-lg mb-1 transition-colors",
                          isActive ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)]"
                        )}
                      >
                        {step.title}
                      </h4>
                      <p className="text-sm text-[var(--foreground-subtle)]">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats & Industries */}
        <StaggerContainer className="relative z-10 space-y-4" staggerDelay={0.1} initialDelay={0.4}>
          <StaggerItem>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--foreground-subtle)]">{t('projectTypes.upload')}</span>
              <div className="flex gap-3">
                {projectTypes.map(({ icon: Icon, label, color }, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                    <span className="text-xs font-medium" style={{ color }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--foreground-subtle)]">{t('projectTypes.for')}</span>
              <div className="flex gap-4">
                {industryIcons.map(({ Icon, label }, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-[var(--foreground-muted)]" />
                    <span className="text-sm text-[var(--foreground-muted)]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <p className="text-sm text-[var(--foreground-subtle)]">
              {t('trust.skillsMapped', { count: 500 })}
            </p>
          </StaggerItem>
        </StaggerContainer>
      </div>

      {/* Right Side - Signup Form */}
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
            <h1 className="text-3xl font-bold font-display gradient-text">FORGE-Z</h1>
            <p className="text-[var(--foreground-muted)] mt-2">
              {t('brand.buildProfile')}
            </p>
          </div>

          <Card variant="glass-card" className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold font-display mb-2">{t('signup.title')}</h2>
              <p className="text-[var(--foreground-muted)]">
                {t('signup.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-subtle)]" />
                  <Input
                    ref={emailInputRef}
                    type="email"
                    inputMode="email"
                    enterKeyHint="next"
                    placeholder={t('signup.emailPlaceholder')}
                    value={data.email}
                    onChange={(e) => setValue("email", e.target.value)}
                    className={cn(
                      "pl-11 h-12 text-base",
                      hasError("email") && "border-[var(--danger)] focus:border-[var(--danger)]"
                    )}
                    required
                    autoComplete="email"
                  />
                </div>
                <Presence show={hasError("email")} variant="fadeIn">
                  <p className="text-xs text-[var(--danger)] flex items-center gap-1 pl-1">
                    <AlertCircle className="w-3 h-3" />
                    {getError("email")}
                  </p>
                </Presence>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-subtle)]" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t('signup.passwordPlaceholder')}
                    value={data.password}
                    onChange={(e) => setValue("password", e.target.value)}
                    onFocus={() => setShowStrength(true)}
                    className={cn(
                      "pl-11 pr-11 h-12 text-base",
                      hasError("password") && "border-[var(--danger)] focus:border-[var(--danger)]"
                    )}
                    minLength={6}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--foreground-subtle)] hover:text-[var(--foreground)] transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? t('password.hide') : t('password.show')}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Presence show={hasError("password")} variant="fadeIn">
                  <p className="text-xs text-[var(--danger)] flex items-center gap-1 pl-1">
                    <AlertCircle className="w-3 h-3" />
                    {getError("password")}
                  </p>
                </Presence>

                {/* Password strength indicator */}
                <AnimatePresence>
                  <PasswordStrengthIndicator password={data.password} show={showStrength} t={t} />
                </AnimatePresence>
              </div>

              {/* Consent Checkboxes */}
              <div className="space-y-3 pt-2">
                {/* Accept All */}
                <Checkbox
                  checked={allConsentsAccepted}
                  onChange={(e) => handleAcceptAll(e.target.checked)}
                  label={
                    <span className="font-semibold text-[var(--primary)]">
                      {t('consent.acceptAll')}
                    </span>
                  }
                />

                <div className="h-px bg-[var(--border)] my-2" />

                {/* Sub-checkboxes - scaled down */}
                <div className="space-y-2 pl-2 text-sm scale-[0.9] origin-top-left">
                  {/* Privacy Policy */}
                  <div className="space-y-0.5">
                    <Checkbox
                      checked={data.privacyPolicyAccepted}
                      onChange={(e) => setValue("privacyPolicyAccepted", e.target.checked)}
                      label={
                        <span className="text-[13px]">
                          {t('consent.privacyPolicy.label')}{" "}
                          <Link
                            href="/legal/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--primary)] hover:text-[var(--primary-hover)] underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t('consent.privacyPolicy.link')}
                          </Link>
                          {" *"}
                        </span>
                      }
                      description={<span className="text-[11px]">{t('consent.privacyPolicy.description')}</span>}
                    />
                    <Presence show={hasError("privacyPolicyAccepted")} variant="fadeIn">
                      <p className="text-[10px] text-[var(--danger)] flex items-center gap-1 pl-7">
                        <AlertCircle className="w-2.5 h-2.5" />
                        {getError("privacyPolicyAccepted")}
                      </p>
                    </Presence>
                  </div>

                  {/* Terms of Service */}
                  <div className="space-y-0.5">
                    <Checkbox
                      checked={data.termsOfServiceAccepted}
                      onChange={(e) => setValue("termsOfServiceAccepted", e.target.checked)}
                      label={
                        <span className="text-[13px]">
                          {t('consent.termsOfService.label')}{" "}
                          <Link
                            href="/legal/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--primary)] hover:text-[var(--primary-hover)] underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t('consent.termsOfService.link')}
                          </Link>
                          {" *"}
                        </span>
                      }
                      description={<span className="text-[11px]">{t('consent.termsOfService.description')}</span>}
                    />
                    <Presence show={hasError("termsOfServiceAccepted")} variant="fadeIn">
                      <p className="text-[10px] text-[var(--danger)] flex items-center gap-1 pl-7">
                        <AlertCircle className="w-2.5 h-2.5" />
                        {getError("termsOfServiceAccepted")}
                      </p>
                    </Presence>
                  </div>

                  {/* Marketing (Optional) */}
                  <Checkbox
                    checked={data.marketingAccepted}
                    onChange={(e) => setValue("marketingAccepted", e.target.checked)}
                    label={<span className="text-[13px]">{t('consent.marketing.label')}</span>}
                    description={<span className="text-[11px]">{t('consent.marketing.description')}</span>}
                  />
                </div>

                {/* Required fields note */}
                <p className="text-xs text-[var(--foreground-subtle)] pl-1">
                  * {t('consent.requiredNote')}
                </p>
              </div>

              {/* Global Error Message */}
              <Presence show={!!globalError} variant="fadeInUp">
                <ErrorMessage
                  message={globalError || ""}
                  dismissible
                  onDismiss={() => setGlobalError(null)}
                />
              </Presence>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold group"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {t('signup.getStarted')}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[var(--background-secondary)] px-4 text-sm text-[var(--foreground-subtle)]">
                  {t('login.orContinueWith')}
                </span>
              </div>
            </div>

            {/* Google OAuth */}
            <Button
              type="button"
              variant="secondary"
              className="w-full h-12 text-base"
              onClick={handleGoogleSignup}
              disabled={isSubmitting}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t('signup.continueWithGoogle')}
            </Button>

            {/* Why join section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 space-y-3"
            >
              <p className="text-xs text-center text-[var(--foreground-subtle)] uppercase tracking-wider">
                {t('signup.whatYouGet')}
              </p>
              <div className="grid gap-2">
                {signupBenefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]"
                  >
                    <div className="p-0.5 rounded-full bg-[var(--success-muted)]">
                      <Check className="w-3 h-3 text-[var(--success)]" />
                    </div>
                    {benefit}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Sign in link */}
            <p className="text-center text-sm text-[var(--foreground-muted)] mt-6">
              {t('signup.haveAccount')}{" "}
              <Link
                href="/login"
                className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-semibold transition-colors"
              >
                {t('signup.signInLink')}
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
