"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Loader2, Zap, ChevronLeft, CheckCircle, Eye, EyeOff,
  FileCheck, MessageCircle, Compass, Cpu, Rocket, Check, X,
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

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// ============================================================================
// Password Strength Component
// ============================================================================

function PasswordStrengthIndicator({
  password,
  t,
}: {
  password: string;
  t: (key: string) => string;
}) {
  const requirements = useMemo(
    () => [
      { key: "length", test: (p: string) => p.length >= 8 },
      { key: "uppercase", test: (p: string) => /[A-Z]/.test(p) },
      { key: "lowercase", test: (p: string) => /[a-z]/.test(p) },
      { key: "number", test: (p: string) => /[0-9]/.test(p) },
      { key: "special", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
    ],
    []
  );

  const passedRequirements = requirements.filter((r) => r.test(password)).length;
  const strength = passedRequirements === 0 ? 0 : passedRequirements;

  const strengthLabels = ["weak", "weak", "fair", "good", "strong", "strong"];
  const strengthColors = [
    "var(--danger)",
    "var(--danger)",
    "var(--warning)",
    "var(--success)",
    "var(--success)",
    "var(--success)",
  ];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-3 mt-3"
    >
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-[var(--foreground-subtle)]">
            {t("password.strength")}
          </span>
          <span style={{ color: strengthColors[strength] }}>
            {t(`password.${strengthLabels[strength]}`)}
          </span>
        </div>
        <div className="h-1.5 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: strengthColors[strength] }}
            initial={{ width: 0 }}
            animate={{ width: `${(strength / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Requirements list */}
      <div className="grid grid-cols-1 gap-1.5">
        {requirements.map((req) => {
          const passed = req.test(password);
          return (
            <div
              key={req.key}
              className={`flex items-center gap-2 text-xs transition-colors ${
                passed
                  ? "text-[var(--success)]"
                  : "text-[var(--foreground-subtle)]"
              }`}
            >
              {passed ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
              {t(`password.requirements.${req.key}`)}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Component
// ============================================================================

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("auth");
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Check if user arrived via recovery link
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // User should have a session from the recovery link
      if (session) {
        setIsValidSession(true);
        passwordInputRef.current?.focus();
      } else {
        setIsValidSession(false);
      }
    };

    // Listen for auth state changes (recovery token exchange)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setIsValidSession(true);
          passwordInputRef.current?.focus();
        }
      }
    );

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // Form state with validation
  const {
    data,
    globalError,
    isSubmitting,
    setValue,
    setGlobalError,
    handleSubmit,
  } = useFormState<ResetPasswordFormData>({
    initialData: {
      password: "",
      confirmPassword: "",
    },
    validate: (formData) => {
      const errors: Partial<Record<keyof ResetPasswordFormData, string>> = {};

      const passwordError =
        validators.required(formData.password, "Password") ||
        validators.minLength(formData.password, 8, "Password");
      if (passwordError) errors.password = passwordError;

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = t("validation.passwordMismatch");
      }

      return Object.keys(errors).length > 0 ? errors : null;
    },
    onSubmit: async (formData) => {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) throw error;

      setResetComplete(true);

      // Sign out after password reset to force fresh login
      await supabase.auth.signOut();

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    },
    onError: (error) => {
      setGlobalError(error.message);
    },
  });

  // Show loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // Show error if no valid session
  if (isValidSession === false) {
    return (
      <div className="min-h-screen flex bg-[var(--background)] overflow-hidden relative">
        <LocaleSwitcher className="absolute top-4 right-4 z-50" />

        <div className="w-full flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg"
          >
            <Card variant="glass-card" className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--danger-muted)] mb-6">
                <X className="w-8 h-8 text-[var(--danger)]" />
              </div>

              <h2 className="text-2xl font-bold font-display mb-2">
                {t("resetPassword.error")}
              </h2>
              <p className="text-[var(--foreground-muted)] mb-6">
                {t("resetPassword.invalidLink")}
              </p>

              <Link href="/forgot-password">
                <Button className="w-full h-12 text-base font-semibold">
                  {t("forgotPassword.sendLink")}
                </Button>
              </Link>

              <div className="mt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t("forgotPassword.backToLogin")}
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

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
                <Lock className="w-8 h-8" style={{ color: "var(--primary)" }} />
              </div>
              <h3 className="text-2xl font-bold font-display mb-2">
                {t("resetPassword.title")}
              </h3>
              <p className="text-[var(--foreground-muted)] text-lg">
                {t("resetPassword.subtitle")}
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
              {!resetComplete ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold font-display mb-2">
                      {t("resetPassword.title")}
                    </h2>
                    <p className="text-[var(--foreground-muted)]">
                      {t("resetPassword.subtitle")}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* New Password */}
                    <div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-subtle)]" />
                        <Input
                          ref={passwordInputRef}
                          type={showPassword ? "text" : "password"}
                          enterKeyHint="next"
                          placeholder={t("resetPassword.newPasswordPlaceholder")}
                          value={data.password}
                          onChange={(e) => setValue("password", e.target.value)}
                          className="pl-11 pr-11 h-12 text-base"
                          required
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)] hover:text-[var(--foreground)] transition-colors"
                          aria-label={
                            showPassword
                              ? t("password.hide")
                              : t("password.show")
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      {/* Password strength indicator */}
                      <AnimatePresence>
                        {data.password && (
                          <PasswordStrengthIndicator
                            password={data.password}
                            t={t}
                          />
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-subtle)]" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        enterKeyHint="done"
                        placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                        value={data.confirmPassword}
                        onChange={(e) =>
                          setValue("confirmPassword", e.target.value)
                        }
                        className="pl-11 pr-11 h-12 text-base"
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)] hover:text-[var(--foreground)] transition-colors"
                        aria-label={
                          showConfirmPassword
                            ? t("password.hide")
                            : t("password.show")
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
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
                          {t("resetPassword.resetting")}
                        </>
                      ) : (
                        t("resetPassword.title")
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
                    {t("resetPassword.success")}
                  </h2>
                  <p className="text-[var(--foreground-muted)] mb-6">
                    {t("resetPassword.redirecting")}
                  </p>

                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-[var(--primary)]" />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
