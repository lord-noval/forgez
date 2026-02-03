'use client';

import { useEffect } from 'react';
import { BankOfSkills } from '@/components/skills';
import { useSkillsStore } from '@/stores/skills-store';

export default function SkillsBankPage() {
  const { setUserSkills, setUserSkillsLoading, setError } = useSkillsStore();

  useEffect(() => {
    const fetchSkills = async () => {
      setUserSkillsLoading(true);
      try {
        const response = await fetch('/api/skills/user');
        if (!response.ok) {
          throw new Error('Failed to fetch skills');
        }
        const { skills } = await response.json();
        setUserSkills(skills);
      } catch (error) {
        console.error('Error fetching skills:', error);
        setError(error instanceof Error ? error.message : 'Failed to load skills');
      } finally {
        setUserSkillsLoading(false);
      }
    };

    fetchSkills();
  }, [setUserSkills, setUserSkillsLoading, setError]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <BankOfSkills />
    </div>
  );
}
