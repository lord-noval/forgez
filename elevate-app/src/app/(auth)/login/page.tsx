"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, Loader2, Zap, ChevronRight,
  FileCheck, MessageCircle, Compass, Cpu, Rocket, Cog, Zap as Energy,
  Shield, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// ============================================================================
// Component
// ============================================================================

// Map Supabase error messages to translation keys
function getErrorKey(error: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'invalidCredentials',
    'Email not confirmed': 'emailNotConfirmed',
    'User not found': 'userNotFound',
    'Invalid email': 'invalidEmail',
    'Too many requests': 'tooManyRequests',
    'Network request failed': 'networkError',
    'Failed to fetch': 'networkError',
  };

  for (const [key, value] of Object.entries(errorMap)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return 'unknown';
}

export default function LoginPage() {
  const [activeBenefit, setActiveBenefit] = useState(0);
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations('auth');
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus email field on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const benefits = [
    {
      icon: FileCheck,
      title: t('benefits.portfolio.title'),
      description: t('benefits.portfolio.description'),
      color: "var(--primary)",
    },
    {
      icon: MessageCircle,
      title: t('benefits.validation.title'),
      description: t('benefits.validation.description'),
      color: "var(--secondary)",
    },
    {
      icon: Compass,
      title: t('benefits.career.title'),
      description: t('benefits.career.description'),
      color: "var(--success)",
    },
  ];

  const industryIcons = [
    { Icon: Rocket, label: t('industries.aerospace'), color: "var(--primary)" },
    { Icon: Cog, label: t('industries.robotics'), color: "var(--secondary)" },
    { Icon: Cpu, label: t('industries.software'), color: "var(--success)" },
    { Icon: Energy, label: t('industries.energy'), color: "var(--warning)" },
  ];

  const trustIndicators = [
    { icon: Shield, label: t('trust.secure'), color: "var(--success)" },
    { icon: TrendingUp, label: t('trust.standards'), color: "var(--primary)" },
  ];

  // Form state with validation
  const {
    data,
    globalError,
    isSubmitting,
    setValue,
    setGlobalError,
    handleSubmit,
  } = useFormState<LoginFormData>({
    initialData: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validate: (formData) => {
      const errors: Partial<Record<keyof LoginFormData, string>> = {};

      const emailError = validators.required(formData.email, "Email") || validators.email(formData.email);
      if (emailError) errors.email = emailError;

      const passwordError = validators.required(formData.password, "Password");
      if (passwordError) errors.password = passwordError;

      return Object.keys(errors).length > 0 ? errors : null;
    },
    onSubmit: async (formData) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      router.push("/dashboard");
    },
    onError: (error) => {
      const errorKey = getErrorKey(error.message);
      setGlobalError(t(`errors.${errorKey}`));
    },
  });

  // Rotate benefits
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBenefit((prev) => (prev + 1) % benefits.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [benefits.length]);

  // Google OAuth
  const handleGoogleLogin = async () => {
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
      const errorKey = err instanceof Error ? getErrorKey(err.message) : 'unknown';
      setGlobalError(t(`errors.${errorKey}`));
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--background)] overflow-hidden relative">
      {/* Language Switcher */}
      <LocaleSwitcher className="absolute top-4 right-4 z-50" />

      {/* Left Side - Benefits & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative p-12 flex-col justify-between overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-muted)] via-transparent to-[var(--secondary-muted)] opacity-30" />

        {/* Animated blur orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[var(--primary)] rounded-full blur-[120px] opacity-15 animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-[var(--secondary)] rounded-full blur-[100px] opacity-15 animate-pulse" style={{ animationDelay: "1s" }} />

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
              <h1 className="text-4xl font-bold font-display gradient-text">FORGE-Z</h1>
            </div>
          </StaggerItem>
          <StaggerItem>
            <p className="text-xl text-[var(--foreground-muted)] max-w-md">
              {t('brand.tagline')}
            </p>
          </StaggerItem>
        </StaggerContainer>

        {/* Rotating Benefits */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="w-full max-w-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeBenefit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card variant="glass-card" className="p-6">
                  <div
                    className="inline-flex p-3 rounded-xl mb-4"
                    style={{ backgroundColor: `${benefits[activeBenefit].color}20` }}
                  >
                    {(() => {
                      const IconComponent = benefits[activeBenefit].icon;
                      return <IconComponent className="w-8 h-8" style={{ color: benefits[activeBenefit].color }} />;
                    })()}
                  </div>
                  <h3 className="text-2xl font-bold font-display mb-2">
                    {benefits[activeBenefit].title}
                  </h3>
                  <p className="text-[var(--foreground-muted)] text-lg">
                    {benefits[activeBenefit].description}
                  </p>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Benefit indicators */}
            <div className="flex gap-2 mt-6">
              {benefits.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveBenefit(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === activeBenefit
                      ? "w-8 bg-[var(--primary)]"
                      : "w-1.5 bg-[var(--border-hover)] hover:bg-[var(--foreground-subtle)]"
                  }`}
                  aria-label={`View benefit ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Industry & Trust */}
        <StaggerContainer className="relative z-10 space-y-4" staggerDelay={0.1} initialDelay={0.4}>
          <StaggerItem>
            <p className="text-xs text-[var(--foreground-subtle)] uppercase tracking-wider mb-3">
              {t('industries.builtFor')}
            </p>
            <div className="flex gap-6">
              {industryIcons.map(({ Icon, label, color }, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <span className="text-sm text-[var(--foreground-muted)]">{label}</span>
                </div>
              ))}
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="flex gap-4 pt-2">
              {trustIndicators.map(({ icon: Icon, label, color }, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs text-[var(--foreground-subtle)]">
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  {label}
                </div>
              ))}
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>

      {/* Right Side - Login Form */}
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
              {t('brand.tagline')}
            </p>
          </div>

          <Card variant="glass-card" className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold font-display mb-2">{t('login.title')}</h2>
              <p className="text-[var(--foreground-muted)]">
                {t('login.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-subtle)]" />
                <Input
                  ref={emailInputRef}
                  type="email"
                  inputMode="email"
                  enterKeyHint="next"
                  placeholder={t('login.emailPlaceholder')}
                  value={data.email}
                  onChange={(e) => setValue("email", e.target.value)}
                  className="pl-11 h-12 text-base"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-subtle)]" />
                <Input
                  type="password"
                  enterKeyHint="done"
                  placeholder={t('login.passwordPlaceholder')}
                  value={data.password}
                  onChange={(e) => setValue("password", e.target.value)}
                  className="pl-11 h-12 text-base"
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <Checkbox
                  checked={data.rememberMe}
                  onChange={(e) => setValue("rememberMe", e.target.checked)}
                  label={t('login.rememberMe')}
                />
                <Link
                  href="/forgot-password"
                  className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
                >
                  {t('login.forgotPassword')}
                </Link>
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
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {t('login.signIn')}
                    <ChevronRight className="ml-2 h-5 w-5" />
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
              onClick={handleGoogleLogin}
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
              {t('login.continueWithGoogle')}
            </Button>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-[var(--background-tertiary)] flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: [
                          "var(--primary-muted)",
                          "var(--secondary-muted)",
                          "var(--success-muted)",
                          "var(--achievement-muted)"
                        ][i],
                        color: [
                          "var(--primary)",
                          "var(--secondary)",
                          "var(--success)",
                          "var(--achievement)"
                        ][i]
                      }}
                    >
                      {["A", "S", "R", "E"][i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {t('login.socialProof', { count: 500 })}
                </p>
              </div>
            </motion.div>

            {/* Sign up link */}
            <p className="text-center text-sm text-[var(--foreground-muted)] mt-6">
              {t('login.noAccount')}{" "}
              <Link
                href="/signup"
                className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-semibold transition-colors"
              >
                {t('login.signUpLink')}
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
