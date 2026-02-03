'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectEditor } from '@/components/portfolio';
import { useWorldLabels } from '@/stores/world-store';
import type { Project } from '@/lib/supabase/types';

export default function EditProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const labels = useWorldLabels();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Project not found');
          }
          if (response.status === 403) {
            throw new Error('Access denied');
          }
          throw new Error('Failed to fetch project');
        }
        const { project, isOwner } = await response.json();
        if (!isOwner) {
          throw new Error('You do not have permission to edit this project');
        }
        setProject(project);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError(error instanceof Error ? error.message : 'Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <Card className="p-12 text-center bg-[var(--background-secondary)] border-[var(--border)]">
          <h2 className="text-xl font-semibold mb-2">
            {error || 'Project not found'}
          </h2>
          <p className="text-[var(--foreground-muted)] mb-4">
            The project you're looking for doesn't exist or you don't have permission to edit it.
          </p>
          <Link href="/portfolio">
            <Button variant="secondary">Back to Portfolio</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href={`/portfolio/${projectId}`}
        className="inline-flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Project
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">Edit Project</h1>
        <p className="text-[var(--foreground-muted)]">
          Update your project details below.
        </p>
      </div>

      {/* Editor */}
      <ProjectEditor project={project} />
    </div>
  );
}
