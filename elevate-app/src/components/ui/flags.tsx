"use client";

import { cn } from "@/lib/utils";

interface FlagProps {
  className?: string;
}

// United Kingdom
export function FlagGB({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 60 30" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30" stroke="#C8102E" strokeWidth="2" />
      <path d="M60,0 L0,30" stroke="#C8102E" strokeWidth="2" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

// Poland
export function FlagPL({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 16 10" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="16" height="5" fill="#fff" />
      <rect y="5" width="16" height="5" fill="#DC143C" />
    </svg>
  );
}

// United States
export function FlagUS({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 19 10" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="19" height="10" fill="#B22234" />
      <path d="M0,.77h19m0,1.54H0m0,1.54h19m0,1.54H0m0,1.54h19m0,1.54H0" stroke="#fff" strokeWidth=".77" />
      <rect width="7.6" height="5.38" fill="#3C3B6E" />
      <g fill="#fff">
        <circle cx="1" cy="1" r=".4" /><circle cx="2.5" cy="1" r=".4" /><circle cx="4" cy="1" r=".4" /><circle cx="5.5" cy="1" r=".4" /><circle cx="7" cy="1" r=".4" />
        <circle cx="1.75" cy="1.9" r=".4" /><circle cx="3.25" cy="1.9" r=".4" /><circle cx="4.75" cy="1.9" r=".4" /><circle cx="6.25" cy="1.9" r=".4" />
        <circle cx="1" cy="2.8" r=".4" /><circle cx="2.5" cy="2.8" r=".4" /><circle cx="4" cy="2.8" r=".4" /><circle cx="5.5" cy="2.8" r=".4" /><circle cx="7" cy="2.8" r=".4" />
        <circle cx="1.75" cy="3.7" r=".4" /><circle cx="3.25" cy="3.7" r=".4" /><circle cx="4.75" cy="3.7" r=".4" /><circle cx="6.25" cy="3.7" r=".4" />
        <circle cx="1" cy="4.6" r=".4" /><circle cx="2.5" cy="4.6" r=".4" /><circle cx="4" cy="4.6" r=".4" /><circle cx="5.5" cy="4.6" r=".4" /><circle cx="7" cy="4.6" r=".4" />
      </g>
    </svg>
  );
}

// Germany
export function FlagDE({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 5 3" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="5" height="1" fill="#000" />
      <rect y="1" width="5" height="1" fill="#DD0000" />
      <rect y="2" width="5" height="1" fill="#FFCE00" />
    </svg>
  );
}

// France
export function FlagFR({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 3 2" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="1" height="2" fill="#002395" />
      <rect x="1" width="1" height="2" fill="#fff" />
      <rect x="2" width="1" height="2" fill="#ED2939" />
    </svg>
  );
}

// Spain
export function FlagES({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 3 2" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="3" height="2" fill="#AA151B" />
      <rect y=".5" width="3" height="1" fill="#F1BF00" />
    </svg>
  );
}

// Italy
export function FlagIT({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 3 2" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="1" height="2" fill="#009246" />
      <rect x="1" width="1" height="2" fill="#fff" />
      <rect x="2" width="1" height="2" fill="#CE2B37" />
    </svg>
  );
}

// Netherlands
export function FlagNL({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 9 6" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="9" height="2" fill="#AE1C28" />
      <rect y="2" width="9" height="2" fill="#fff" />
      <rect y="4" width="9" height="2" fill="#21468B" />
    </svg>
  );
}

// Belgium
export function FlagBE({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 3 2" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="1" height="2" fill="#000" />
      <rect x="1" width="1" height="2" fill="#FAE042" />
      <rect x="2" width="1" height="2" fill="#ED2939" />
    </svg>
  );
}

// Austria
export function FlagAT({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 3 2" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="3" height="2" fill="#fff" />
      <rect width="3" height=".67" fill="#ED2939" />
      <rect y="1.33" width="3" height=".67" fill="#ED2939" />
    </svg>
  );
}

// Switzerland
export function FlagCH({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 32 32" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="32" height="32" fill="#FF0000" />
      <rect x="13" y="6" width="6" height="20" fill="#fff" />
      <rect x="6" y="13" width="20" height="6" fill="#fff" />
    </svg>
  );
}

// Sweden
export function FlagSE({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 16 10" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="16" height="10" fill="#006AA7" />
      <rect x="5" width="2" height="10" fill="#FECC00" />
      <rect y="4" width="16" height="2" fill="#FECC00" />
    </svg>
  );
}

// Norway
export function FlagNO({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 22 16" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="22" height="16" fill="#EF2B2D" />
      <rect x="6" width="4" height="16" fill="#fff" />
      <rect y="6" width="22" height="4" fill="#fff" />
      <rect x="7" width="2" height="16" fill="#002868" />
      <rect y="7" width="22" height="2" fill="#002868" />
    </svg>
  );
}

// Denmark
export function FlagDK({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 37 28" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="37" height="28" fill="#C8102E" />
      <rect x="12" width="4" height="28" fill="#fff" />
      <rect y="12" width="37" height="4" fill="#fff" />
    </svg>
  );
}

// Finland
export function FlagFI({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 18 11" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="18" height="11" fill="#fff" />
      <rect x="5" width="3" height="11" fill="#003580" />
      <rect y="4" width="18" height="3" fill="#003580" />
    </svg>
  );
}

// Ireland
export function FlagIE({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 3 2" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="1" height="2" fill="#169B62" />
      <rect x="1" width="1" height="2" fill="#fff" />
      <rect x="2" width="1" height="2" fill="#FF883E" />
    </svg>
  );
}

// Portugal
export function FlagPT({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 3 2" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="1.2" height="2" fill="#006600" />
      <rect x="1.2" width="1.8" height="2" fill="#FF0000" />
      <circle cx="1.2" cy="1" r=".35" fill="#FFCC00" />
    </svg>
  );
}

// Czech Republic
export function FlagCZ({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 6 4" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="6" height="2" fill="#fff" />
      <rect y="2" width="6" height="2" fill="#D7141A" />
      <path d="M0,0 L3,2 L0,4 Z" fill="#11457E" />
    </svg>
  );
}

// Canada
export function FlagCA({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 4 2" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="1" height="2" fill="#FF0000" />
      <rect x="1" width="2" height="2" fill="#fff" />
      <rect x="3" width="1" height="2" fill="#FF0000" />
      <path d="M2,0.3 L2.15,0.7 L2,0.6 L1.85,0.7 Z M2,0.5 L2.3,0.9 L2.1,0.9 L2.1,1.3 L2,1.1 L1.9,1.3 L1.9,0.9 L1.7,0.9 Z" fill="#FF0000" />
    </svg>
  );
}

// Australia
export function FlagAU({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 20 10" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="20" height="10" fill="#00008B" />
      <rect width="10" height="5" fill="#012169" />
      <path d="M0,0 L10,5 M10,0 L0,5" stroke="#fff" strokeWidth="1" />
      <path d="M5,0 v5 M0,2.5 h10" stroke="#fff" strokeWidth="1.5" />
      <path d="M5,0 v5 M0,2.5 h10" stroke="#C8102E" strokeWidth=".8" />
      <circle cx="5" cy="8" r=".5" fill="#fff" />
      <circle cx="15" cy="2" r=".4" fill="#fff" />
      <circle cx="17" cy="4" r=".4" fill="#fff" />
      <circle cx="16" cy="7" r=".4" fill="#fff" />
      <circle cx="13" cy="6" r=".4" fill="#fff" />
    </svg>
  );
}

// Japan
export function FlagJP({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 3 2" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="3" height="2" fill="#fff" />
      <circle cx="1.5" cy="1" r=".6" fill="#BC002D" />
    </svg>
  );
}

// South Korea
export function FlagKR({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 3 2" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="3" height="2" fill="#fff" />
      <circle cx="1.5" cy="1" r=".5" fill="#C60C30" />
      <path d="M1.5,.5 A.5,.5 0 0,1 1.5,1 A.25,.25 0 0,0 1.5,1.5 A.5,.5 0 0,1 1.5,.5" fill="#003478" />
    </svg>
  );
}

// India
export function FlagIN({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 3 2" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="3" height=".67" fill="#FF9933" />
      <rect y=".67" width="3" height=".67" fill="#fff" />
      <rect y="1.34" width="3" height=".66" fill="#138808" />
      <circle cx="1.5" cy="1" r=".2" fill="#000080" stroke="#000080" strokeWidth=".05" />
    </svg>
  );
}

// Brazil
export function FlagBR({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 20 14" className={cn("w-8 h-5 rounded-sm", className)}>
      <rect width="20" height="14" fill="#009c3b" />
      <path d="M10,1 L18,7 L10,13 L2,7 Z" fill="#ffdf00" />
      <circle cx="10" cy="7" r="3" fill="#002776" />
    </svg>
  );
}

// Flag component that renders the appropriate flag based on locale
export function Flag({ locale, className }: { locale: string; className?: string }) {
  switch (locale) {
    case 'en':
      return <FlagGB className={className} />;
    case 'pl':
      return <FlagPL className={className} />;
    default:
      return <FlagGB className={className} />;
  }
}

// Country flag component that renders flag based on country code
export function CountryFlag({ code, className }: { code: string; className?: string }) {
  switch (code) {
    case 'US': return <FlagUS className={className} />;
    case 'GB': return <FlagGB className={className} />;
    case 'PL': return <FlagPL className={className} />;
    case 'DE': return <FlagDE className={className} />;
    case 'FR': return <FlagFR className={className} />;
    case 'ES': return <FlagES className={className} />;
    case 'IT': return <FlagIT className={className} />;
    case 'NL': return <FlagNL className={className} />;
    case 'BE': return <FlagBE className={className} />;
    case 'AT': return <FlagAT className={className} />;
    case 'CH': return <FlagCH className={className} />;
    case 'SE': return <FlagSE className={className} />;
    case 'NO': return <FlagNO className={className} />;
    case 'DK': return <FlagDK className={className} />;
    case 'FI': return <FlagFI className={className} />;
    case 'IE': return <FlagIE className={className} />;
    case 'PT': return <FlagPT className={className} />;
    case 'CZ': return <FlagCZ className={className} />;
    case 'CA': return <FlagCA className={className} />;
    case 'AU': return <FlagAU className={className} />;
    case 'JP': return <FlagJP className={className} />;
    case 'KR': return <FlagKR className={className} />;
    case 'IN': return <FlagIN className={className} />;
    case 'BR': return <FlagBR className={className} />;
    default: return <FlagUS className={className} />;
  }
}
