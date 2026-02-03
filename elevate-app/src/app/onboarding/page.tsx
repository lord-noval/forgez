"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Rocket,
  Zap,
  Cpu,
  Code2,
  Sparkles,
  User,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { PhoneInput, type CountryCode } from "@/components/ui/phone-input";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Industry icons and colors (static configuration)
const industryConfig = {
  space: { icon: Rocket, color: "#6366f1" },
  energy: { icon: Zap, color: "#22c55e" },
  robotics: { icon: Cpu, color: "#f59e0b" },
  software: { icon: Code2, color: "#8b5cf6" },
};

// Helper to check if user is at least 13 years old
function isAtLeast13YearsOld(birthday: string): boolean {
  const birthDate = new Date(birthday);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 13;
  }
  return age >= 13;
}

export default function OnboardingPage() {
  const t = useTranslations('onboarding');
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Personal info state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    birthday: '',
    phoneNumber: '',
    phoneCountryCode: 'US' as CountryCode,
  });
  const [personalInfoErrors, setPersonalInfoErrors] = useState<Record<string, string>>({});

  // Auto-focus first input when step changes
  useEffect(() => {
    if (currentStep === 0) {
      // Small delay to ensure the DOM is ready
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [currentStep]);

  // Build industries with translations
  const industries = Object.entries(industryConfig).map(([id, config]) => ({
    id,
    name: t(`industries.${id}.name`),
    description: t(`industries.${id}.description`),
    ...config,
  }));

  // Build questions with translations
  const questions = [
    {
      id: "personalInfo",
      question: t('personalInfo.title'),
      subtitle: t('personalInfo.subtitle'),
      type: "form",
    },
    {
      id: "interests",
      question: t('industries.title'),
      subtitle: t('industries.subtitle'),
      type: "multi-select",
    },
    {
      id: "experience",
      question: t('experience.title'),
      subtitle: t('experience.subtitle'),
      type: "single-select",
      options: [
        { id: "student", label: t('experience.student.label'), description: t('experience.student.description') },
        { id: "early", label: t('experience.early.label'), description: t('experience.early.description') },
        { id: "mid", label: t('experience.mid.label'), description: t('experience.mid.description') },
        { id: "senior", label: t('experience.senior.label'), description: t('experience.senior.description') },
      ],
    },
    {
      id: "goal",
      question: t('mainGoal.title'),
      subtitle: t('mainGoal.subtitle'),
      type: "single-select",
      options: [
        { id: "skills", label: t('mainGoal.skills.label'), description: t('mainGoal.skills.description') },
        { id: "career", label: t('mainGoal.career.label'), description: t('mainGoal.career.description') },
        { id: "learn", label: t('mainGoal.learn.label'), description: t('mainGoal.learn.description') },
        { id: "team", label: t('mainGoal.team.label'), description: t('mainGoal.team.description') },
      ],
    },
  ];

  const currentQuestion = questions[currentStep];

  const toggleIndustry = (id: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  // Validate personal info
  const validatePersonalInfo = (): boolean => {
    const errors: Record<string, string> = {};

    if (!personalInfo.firstName.trim()) {
      errors.firstName = t('personalInfo.firstName.required');
    }
    if (!personalInfo.lastName.trim()) {
      errors.lastName = t('personalInfo.lastName.required');
    }
    if (!personalInfo.birthday) {
      errors.birthday = t('personalInfo.birthday.required');
    } else if (!isAtLeast13YearsOld(personalInfo.birthday)) {
      errors.birthday = t('personalInfo.birthday.tooYoung');
    }
    // Phone is optional, but validate if provided
    if (personalInfo.phoneNumber && personalInfo.phoneNumber.length > 0 && personalInfo.phoneNumber.length < 6) {
      errors.phoneNumber = t('personalInfo.phone.invalid');
    }

    setPersonalInfoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const canProceed = () => {
    if (currentStep === 0) {
      // Personal info step - check if required fields are filled (but don't show errors yet)
      return (
        personalInfo.firstName.trim() !== '' &&
        personalInfo.lastName.trim() !== '' &&
        personalInfo.birthday !== '' &&
        isAtLeast13YearsOld(personalInfo.birthday)
      );
    }
    if (currentStep === 1) {
      return selectedIndustries.length > 0;
    }
    return answers[currentQuestion?.id] !== undefined;
  };

  const handleNext = () => {
    // Validate personal info on step 0
    if (currentStep === 0) {
      if (!validatePersonalInfo()) {
        return;
      }
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Save user preferences via API
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Personal info
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          birthday: personalInfo.birthday,
          phoneNumber: personalInfo.phoneNumber || null,
          phoneCountryCode: personalInfo.phoneCountryCode,
          // Preferences
          industries: selectedIndustries,
          experienceLevel: answers.experience,
          primaryGoal: answers.goal,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Onboarding error:", error);
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save onboarding:", error);
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-[var(--foreground-muted)]">
              {t('progress.step', { current: currentStep + 1, total: questions.length })}
            </span>
            <span className="text-sm font-mono text-[var(--primary)]">
              {Math.round(((currentStep + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
            <motion.div
              className="h-full progress-gradient"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentStep + 1) / questions.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-2 text-center">
              {currentQuestion.question}
            </h2>
            <p className="text-[var(--foreground-muted)] text-center mb-8">
              {currentQuestion.subtitle}
            </p>

            {/* Personal Info Form (Step 0) */}
            {currentStep === 0 && (
              <div className="max-w-md mx-auto space-y-4">
                {/* First Name */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    {t('personalInfo.firstName.label')} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-subtle)]" />
                    <Input
                      ref={firstInputRef}
                      type="text"
                      value={personalInfo.firstName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                      placeholder={t('personalInfo.firstName.placeholder')}
                      className={cn(
                        "pl-11 h-12",
                        personalInfoErrors.firstName && "border-[var(--danger)] focus:border-[var(--danger)]"
                      )}
                      enterKeyHint="next"
                    />
                  </div>
                  {personalInfoErrors.firstName && (
                    <p className="text-xs text-[var(--danger)] flex items-center gap-1 pl-1">
                      <AlertCircle className="w-3 h-3" />
                      {personalInfoErrors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    {t('personalInfo.lastName.label')} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-subtle)]" />
                    <Input
                      type="text"
                      value={personalInfo.lastName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                      placeholder={t('personalInfo.lastName.placeholder')}
                      className={cn(
                        "pl-11 h-12",
                        personalInfoErrors.lastName && "border-[var(--danger)] focus:border-[var(--danger)]"
                      )}
                      enterKeyHint="next"
                    />
                  </div>
                  {personalInfoErrors.lastName && (
                    <p className="text-xs text-[var(--danger)] flex items-center gap-1 pl-1">
                      <AlertCircle className="w-3 h-3" />
                      {personalInfoErrors.lastName}
                    </p>
                  )}
                </div>

                {/* Birthday */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    {t('personalInfo.birthday.label')} *
                  </label>
                  <DateInput
                    value={personalInfo.birthday}
                    onChange={(value) => setPersonalInfo({ ...personalInfo, birthday: value })}
                    error={!!personalInfoErrors.birthday}
                  />
                  {personalInfoErrors.birthday && (
                    <p className="text-xs text-[var(--danger)] flex items-center gap-1 pl-1">
                      <AlertCircle className="w-3 h-3" />
                      {personalInfoErrors.birthday}
                    </p>
                  )}
                </div>

                {/* Phone Number (Optional) */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    {t('personalInfo.phone.label')}
                  </label>
                  <PhoneInput
                    value={personalInfo.phoneNumber}
                    countryCode={personalInfo.phoneCountryCode}
                    onChange={(value) => setPersonalInfo({ ...personalInfo, phoneNumber: value })}
                    onCountryChange={(code) => setPersonalInfo({ ...personalInfo, phoneCountryCode: code })}
                    placeholder={t('personalInfo.phone.placeholder')}
                    error={!!personalInfoErrors.phoneNumber}
                  />
                  {personalInfoErrors.phoneNumber && (
                    <p className="text-xs text-[var(--danger)] flex items-center gap-1 pl-1">
                      <AlertCircle className="w-3 h-3" />
                      {personalInfoErrors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Industry Selection (Step 1) */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {industries.map((industry) => {
                  const Icon = industry.icon;
                  const isSelected = selectedIndustries.includes(industry.id);
                  return (
                    <motion.button
                      key={industry.id}
                      onClick={() => toggleIndustry(industry.id)}
                      className={cn(
                        "p-5 rounded-xl border text-left transition-all",
                        isSelected
                          ? "border-[var(--primary)] bg-[var(--primary-muted)]"
                          : "border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--border-hover)]"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                            isSelected
                              ? "border-[var(--primary)] bg-[var(--primary)]"
                              : "border-[var(--border)]"
                          )}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon
                              className="w-5 h-5"
                              style={{ color: industry.color }}
                            />
                            <span className="font-medium">{industry.name}</span>
                          </div>
                          <p className="text-sm text-[var(--foreground-muted)]">
                            {industry.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Single Select Questions (Steps 2+) */}
            {currentQuestion.type === "single-select" && currentQuestion.options && (
              <div className="grid gap-4">
                {currentQuestion.options.map((option) => {
                  const isSelected = answers[currentQuestion.id] === option.id;
                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => handleAnswer(currentQuestion.id, option.id)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        isSelected
                          ? "border-[var(--primary)] bg-[var(--primary-muted)]"
                          : "border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--border-hover)]"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                            isSelected
                              ? "border-[var(--primary)] bg-[var(--primary)]"
                              : "border-[var(--border)]"
                          )}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                          <span className="font-medium">{option.label}</span>
                          {option.description && (
                            <p className="text-sm text-[var(--foreground-muted)]">
                              {option.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('navigation.back')}
          </Button>

          <Button onClick={handleNext} disabled={!canProceed() || isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {currentStep === questions.length - 1 ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {t('buttons.getStarted')}
              </>
            ) : (
              <>
                {t('navigation.next')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
