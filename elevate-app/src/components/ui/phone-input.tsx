"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { CountryFlag } from "./flags";

// Country data with dial codes
const countries = [
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "PL", name: "Poland", dialCode: "+48" },
  { code: "DE", name: "Germany", dialCode: "+49" },
  { code: "FR", name: "France", dialCode: "+33" },
  { code: "ES", name: "Spain", dialCode: "+34" },
  { code: "IT", name: "Italy", dialCode: "+39" },
  { code: "NL", name: "Netherlands", dialCode: "+31" },
  { code: "BE", name: "Belgium", dialCode: "+32" },
  { code: "AT", name: "Austria", dialCode: "+43" },
  { code: "CH", name: "Switzerland", dialCode: "+41" },
  { code: "SE", name: "Sweden", dialCode: "+46" },
  { code: "NO", name: "Norway", dialCode: "+47" },
  { code: "DK", name: "Denmark", dialCode: "+45" },
  { code: "FI", name: "Finland", dialCode: "+358" },
  { code: "IE", name: "Ireland", dialCode: "+353" },
  { code: "PT", name: "Portugal", dialCode: "+351" },
  { code: "CZ", name: "Czech Republic", dialCode: "+420" },
  { code: "CA", name: "Canada", dialCode: "+1" },
  { code: "AU", name: "Australia", dialCode: "+61" },
  { code: "JP", name: "Japan", dialCode: "+81" },
  { code: "KR", name: "South Korea", dialCode: "+82" },
  { code: "IN", name: "India", dialCode: "+91" },
  { code: "BR", name: "Brazil", dialCode: "+55" },
] as const;

export type CountryCode = typeof countries[number]["code"];

export interface PhoneInputProps {
  value: string;
  countryCode: CountryCode;
  onChange: (value: string) => void;
  onCountryChange: (code: CountryCode) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PhoneInput({
  value,
  countryCode,
  onChange,
  onCountryChange,
  placeholder = "Phone number",
  error,
  disabled,
  className,
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const selectedCountry = countries.find((c) => c.code === countryCode) || countries[0];

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle phone number input - only allow digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^\d]/g, "");
    onChange(newValue);
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {/* Country Selector */}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "flex items-center gap-1.5 px-3 h-12 rounded-lg border bg-[var(--background-secondary)]",
            "hover:border-[var(--border-hover)] focus:border-[var(--primary)] focus:outline-none",
            "transition-colors duration-200",
            error ? "border-[var(--danger)]" : "border-[var(--border)]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <CountryFlag code={selectedCountry.code} className="w-6 h-4" />
          <span className="text-sm text-[var(--foreground-muted)]">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown className={cn(
            "w-4 h-4 text-[var(--foreground-subtle)] transition-transform",
            isOpen && "rotate-180"
          )} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className={cn(
              "absolute z-50 top-full left-0 mt-1 w-64 max-h-60 overflow-auto",
              "rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]",
              "shadow-lg"
            )}
          >
            {countries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onCountryChange(country.code);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 text-left",
                  "hover:bg-[var(--background-tertiary)] transition-colors",
                  country.code === countryCode && "bg-[var(--primary-muted)]"
                )}
              >
                <CountryFlag code={country.code} className="w-6 h-4" />
                <span className="flex-1 text-sm">{country.name}</span>
                <span className="text-sm text-[var(--foreground-muted)]">
                  {country.dialCode}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Phone Number Input */}
      <Input
        type="tel"
        inputMode="tel"
        value={value}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "flex-1 h-12",
          error && "border-[var(--danger)] focus:border-[var(--danger)]"
        )}
      />
    </div>
  );
}

export { countries };
