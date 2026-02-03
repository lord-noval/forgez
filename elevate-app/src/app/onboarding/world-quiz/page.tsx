'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Since FORGE-Z now has a single unified world ('forgez'),
// the world quiz is no longer needed. Redirect to onboarding.
export default function WorldQuizPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to onboarding since world selection is not needed
    router.replace('/onboarding');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
    </div>
  );
}
