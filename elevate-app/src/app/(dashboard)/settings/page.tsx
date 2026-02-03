"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  User,
  Bell,
  Moon,
  Clock,
  LogOut,
  Loader2,
  Check,
  Globe,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flag } from "@/components/ui/flags";
import { useUserStore } from "@/stores/user-store";
import { useLocaleStore } from "@/stores/locale-store";
import { useQuestStore } from "@/stores/quest-store";
import { useArchetypeStore } from "@/stores/archetype-store";
import { useXPStore } from "@/stores/xp-store";
import { useToast } from "@/stores/toast-store";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { locales, localeNames, type Locale } from "@/i18n/config";

export default function SettingsPage() {
  const { user, updateUser } = useUserStore();
  const { locale, setLocale } = useLocaleStore();
  const resetQuests = useQuestStore((state) => state.reset);
  const resetArchetype = useArchetypeStore((state) => state.reset);
  const resetXP = useXPStore((state) => state.reset);
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');

  const [username, setUsername] = useState(user?.username || "");
  const [reminderTime, setReminderTime] = useState(user?.reminderTime || "09:00");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, reminderTime }),
      });

      if (response.ok) {
        updateUser({ username, reminderTime });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        toast.success(tCommon('toast.success.saved'));
      } else {
        toast.error(tCommon('toast.error.save'));
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error(tCommon('toast.error.generic'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleRestartJourney = () => {
    resetQuests();
    resetArchetype();
    resetXP();
    setShowRestartConfirm(false);
    router.push("/quest/1");
  };

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    // Refresh the page to apply the new locale
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display">{t('title')}</h1>
        <p className="text-[var(--foreground-muted)]">
          {t('subtitle')}
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t('profile.title')}
          </CardTitle>
          <CardDescription>
            {t('profile.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('profile.email')}</label>
            <Input
              type="email"
              value={user?.email || ""}
              disabled
              className="opacity-50"
            />
            <p className="text-xs text-[var(--foreground-subtle)]">
              {t('profile.emailCannotChange')}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('profile.username')}</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('profile.usernamePlaceholder')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t('language.title')}
          </CardTitle>
          <CardDescription>
            {t('language.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                  locale === loc
                    ? "border-[var(--primary)] bg-[var(--primary-muted)]"
                    : "border-[var(--border)] hover:border-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)]"
                )}
              >
                <Flag locale={loc} className="w-8 h-5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium">{localeNames[loc]}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {loc.toUpperCase()}
                  </p>
                </div>
                {locale === loc && (
                  <Check className="w-5 h-5 text-[var(--primary)] ml-auto" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t('notifications.title')}
          </CardTitle>
          <CardDescription>
            {t('notifications.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t('notifications.dailyReminder')}
            </label>
            <Input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
            <p className="text-xs text-[var(--foreground-subtle)]">
              {t('notifications.reminderDescription')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5" />
            {t('appearance.title')}
          </CardTitle>
          <CardDescription>
            {t('appearance.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('appearance.darkMode')}</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                {t('appearance.darkModeDescription')}
              </p>
            </div>
            <button
              onClick={() => toast.warning(t('appearance.lightModeError'))}
              className="w-12 h-6 bg-[var(--primary)] rounded-full flex items-center justify-end p-1 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="w-4 h-4 bg-white rounded-full" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            saveSuccess && "bg-[var(--success)] hover:bg-[var(--success)]"
          )}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : saveSuccess ? (
            <Check className="w-4 h-4 mr-2" />
          ) : null}
          {saveSuccess ? t('actions.saved') : t('actions.saveChanges')}
        </Button>
      </div>

      {/* Danger Zone */}
      <Card className="border-[var(--danger)]">
        <CardHeader>
          <CardTitle className="text-[var(--danger)]">{t('dangerZone.title')}</CardTitle>
          <CardDescription>
            {t('dangerZone.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Restart Journey */}
          <div className="space-y-3">
            <div>
              <p className="font-medium">{t('dangerZone.restartJourney.title')}</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                {t('dangerZone.restartJourney.description')}
              </p>
            </div>
            {!showRestartConfirm ? (
              <Button variant="danger" onClick={() => setShowRestartConfirm(true)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                {t('dangerZone.restartJourney.button')}
              </Button>
            ) : (
              <div className="p-4 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/30 space-y-3">
                <p className="font-medium text-[var(--danger)]">
                  {t('dangerZone.restartJourney.confirmTitle')}
                </p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {t('dangerZone.restartJourney.confirmMessage')}
                </p>
                <div className="flex gap-3">
                  <Button variant="danger" onClick={handleRestartJourney}>
                    {t('dangerZone.restartJourney.confirm')}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowRestartConfirm(false)}>
                    {t('dangerZone.restartJourney.cancel')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--border)]" />

          {/* Sign Out */}
          <Button variant="danger" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            {tCommon('buttons.signOut')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
