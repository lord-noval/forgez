'use client';

import { useEffect } from 'react';
import { ProjectGallery } from '@/components/portfolio';
import { useProjectsStore } from '@/stores/projects-store';

export default function PortfolioPage() {
  const { setProjects, setLoading, setError } = useProjectsStore();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const { projects } = await response.json();
        setProjects(projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError(error instanceof Error ? error.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [setProjects, setLoading, setError]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <ProjectGallery showCreateButton showFilters showSearch />
    </div>
  );
}
