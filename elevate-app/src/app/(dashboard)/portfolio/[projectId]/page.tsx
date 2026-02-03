'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  ChevronLeft,
  Edit,
  ExternalLink,
  Github,
  Calendar,
  Eye,
  Globe,
  Lock,
  Link as LinkIcon,
  Trash2,
  Share2,
  Sparkles,
  File,
  Loader2,
  Code2,
  FileText,
  Video,
  Headphones,
  Palette,
  Box,
  Presentation,
  Award,
  Zap,
  Target,
  TrendingUp,
  CheckCircle2,
  Star,
  Users,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArtifactUploader } from '@/components/portfolio';
import { useProjectsStore } from '@/stores/projects-store';
import { useWorldLabels } from '@/stores/world-store';
import type { ProjectWithArtifacts, ProjectType, ProjectArtifact, ProjectSkillWithTaxonomy } from '@/lib/supabase/types';
import { format } from 'date-fns';

// Type for project metadata with extended fields
interface ProjectMetadata {
  highlights?: string[];
  achievements?: { icon: string; label: string; value: string }[];
  collaborators?: { name: string; role: string }[];
  teamSize?: number;
  [key: string]: unknown;
}

// Helper to get metadata from project
function getProjectMetadata(project: ProjectWithArtifacts): ProjectMetadata {
  return (project.metadata as ProjectMetadata) || {};
}

// Icon mapping for achievements (used in demo data)
const achievementIcons: Record<string, LucideIcon> = {
  star: Star,
  users: Users,
  trending: TrendingUp,
  target: Target,
  zap: Zap,
};

// Demo project data for visualization
const demoProjects: Record<string, ProjectWithArtifacts & {
  highlights?: string[];
  teamSize?: number;
  collaborators?: { name: string; role: string }[];
  achievements?: { icon: string; label: string; value: string }[];
}> = {
  'demo-weather': {
    id: 'demo-weather',
    user_id: 'demo-user',
    title: 'AI-Powered Weather Dashboard',
    description: `A comprehensive weather prediction and visualization platform built with React and TypeScript. This project demonstrates full-stack development skills by integrating machine learning models with a modern, responsive frontend.

## Key Features

- **Real-time Weather Data**: Fetches and displays current weather conditions from multiple API sources
- **ML-Powered Predictions**: Uses TensorFlow.js to predict local weather patterns up to 7 days ahead
- **Interactive Visualizations**: D3.js charts showing temperature trends, precipitation probability, and wind patterns
- **Location-based Alerts**: Push notifications for severe weather warnings
- **Responsive Design**: Fully functional on mobile, tablet, and desktop devices

## Technical Highlights

The application uses a microservices architecture with a React frontend communicating with a Node.js backend. Weather data is processed through a Python ML pipeline and stored in PostgreSQL. The entire system is containerized with Docker and deployed on AWS.

## Impact

This project has been featured in a local hackathon and helped me secure an internship at a weather tech startup.`,
    project_type: 'CODE' as ProjectType,
    thumbnail_url: null,
    external_url: 'https://weather-dashboard-demo.vercel.app',
    repository_url: 'https://github.com/demo-user/weather-dashboard',
    start_date: '2024-09-01',
    end_date: '2024-12-15',
    is_ongoing: false,
    visibility: 'public',
    is_featured: true,
    view_count: 1247,
    tags: ['React', 'TypeScript', 'Machine Learning', 'D3.js', 'Weather API', 'Full Stack'],
    metadata: null,
    created_at: '2024-09-01T10:00:00Z',
    updated_at: '2024-12-15T18:30:00Z',
    artifacts: [
      {
        id: 'artifact-1',
        project_id: 'demo-weather',
        file_name: 'weather-dashboard-src.zip',
        file_path: 'demo/weather-dashboard-src.zip',
        file_type: 'application/zip',
        file_size: 2457600,
        mime_type: 'application/zip',
        upload_status: 'COMPLETED' as const,
        storage_bucket: 'project-files',
        analysis_status: 'COMPLETED' as const,
        analysis_result: { skills_found: 8, confidence: 0.94 },
        metadata: null,
        created_at: '2024-09-05T14:00:00Z',
      },
      {
        id: 'artifact-2',
        project_id: 'demo-weather',
        file_name: 'ml-model-training.ipynb',
        file_path: 'demo/ml-model-training.ipynb',
        file_type: 'application/x-ipynb+json',
        file_size: 892416,
        mime_type: 'application/x-ipynb+json',
        upload_status: 'COMPLETED' as const,
        storage_bucket: 'project-files',
        analysis_status: 'COMPLETED' as const,
        analysis_result: { skills_found: 5, confidence: 0.91 },
        metadata: null,
        created_at: '2024-10-12T09:30:00Z',
      },
      {
        id: 'artifact-3',
        project_id: 'demo-weather',
        file_name: 'system-architecture.pdf',
        file_path: 'demo/system-architecture.pdf',
        file_type: 'application/pdf',
        file_size: 1048576,
        mime_type: 'application/pdf',
        upload_status: 'COMPLETED' as const,
        storage_bucket: 'project-files',
        analysis_status: 'COMPLETED' as const,
        analysis_result: { skills_found: 3, confidence: 0.88 },
        metadata: null,
        created_at: '2024-11-20T16:45:00Z',
      },
    ],
    extracted_skills: [
      { id: 'skill-1', project_id: 'demo-weather', skill_id: 's1', confidence_score: 0.95, evidence_snippets: null, ai_reasoning: 'Extensive use of React hooks and components', is_verified: true, created_at: '2024-12-15T18:30:00Z', skill: { id: 's1', name: 'React', category: 'Frontend', framework: 'FORGEZ' } as any },
      { id: 'skill-2', project_id: 'demo-weather', skill_id: 's2', confidence_score: 0.92, evidence_snippets: null, ai_reasoning: 'Strong TypeScript typing throughout codebase', is_verified: true, created_at: '2024-12-15T18:30:00Z', skill: { id: 's2', name: 'TypeScript', category: 'Languages', framework: 'FORGEZ' } as any },
      { id: 'skill-3', project_id: 'demo-weather', skill_id: 's3', confidence_score: 0.88, evidence_snippets: null, ai_reasoning: 'TensorFlow.js model implementation', is_verified: true, created_at: '2024-12-15T18:30:00Z', skill: { id: 's3', name: 'Machine Learning', category: 'AI/ML', framework: 'FORGEZ' } as any },
      { id: 'skill-4', project_id: 'demo-weather', skill_id: 's4', confidence_score: 0.85, evidence_snippets: null, ai_reasoning: 'REST API integration with error handling', is_verified: false, created_at: '2024-12-15T18:30:00Z', skill: { id: 's4', name: 'API Integration', category: 'Backend', framework: 'FORGEZ' } as any },
      { id: 'skill-5', project_id: 'demo-weather', skill_id: 's5', confidence_score: 0.90, evidence_snippets: null, ai_reasoning: 'Complex D3.js visualizations', is_verified: true, created_at: '2024-12-15T18:30:00Z', skill: { id: 's5', name: 'Data Visualization', category: 'Frontend', framework: 'FORGEZ' } as any },
      { id: 'skill-6', project_id: 'demo-weather', skill_id: 's6', confidence_score: 0.78, evidence_snippets: null, ai_reasoning: 'Docker containerization setup', is_verified: false, created_at: '2024-12-15T18:30:00Z', skill: { id: 's6', name: 'Docker', category: 'DevOps', framework: 'FORGEZ' } as any },
    ],
    highlights: [
      'Won 2nd place at Local Tech Hackathon 2024',
      'Featured in university tech blog',
      'Used by 500+ beta testers',
    ],
    teamSize: 1,
    achievements: [
      { icon: 'star', label: 'Hackathon', value: '2nd Place' },
      { icon: 'users', label: 'Beta Users', value: '500+' },
      { icon: 'trending', label: 'Accuracy', value: '87%' },
    ],
  },
  'demo-robotics': {
    id: 'demo-robotics',
    user_id: 'demo-user',
    title: 'Robotics Arm Controller',
    description: `An Arduino-based control system for a 6-DOF (Degrees of Freedom) robotic arm featuring inverse kinematics calculations and real-time trajectory planning.

## Project Overview

This project combines hardware engineering with software development to create a precise, responsive robotic arm controller. The system allows for both manual joystick control and programmatic movement sequences.

## Technical Implementation

### Hardware Components
- Arduino Mega 2560 as the main controller
- 6x MG996R servo motors for joint actuation
- Custom 3D-printed arm segments (designed in Fusion 360)
- PS4 controller for manual input
- 12V 10A power supply with voltage regulation

### Software Features
- **Inverse Kinematics Engine**: Custom C++ implementation for calculating joint angles from end-effector positions
- **Trajectory Smoothing**: Bezier curve interpolation for smooth movements
- **Safety Limits**: Software and hardware limits to prevent collisions
- **Serial Protocol**: Custom communication protocol for PC integration
- **Python GUI**: Desktop application for programming movement sequences

## Learning Outcomes

Through this project, I gained hands-on experience with:
- Embedded systems programming
- 3D CAD design and printing
- Control theory and PID tuning
- Real-time systems constraints

## Future Plans

Planning to add computer vision for object detection and autonomous pick-and-place operations.`,
    project_type: 'CODE' as ProjectType,
    thumbnail_url: null,
    external_url: null,
    repository_url: 'https://github.com/demo-user/robotic-arm-controller',
    start_date: '2024-06-01',
    end_date: null,
    is_ongoing: true,
    visibility: 'public',
    is_featured: true,
    view_count: 892,
    tags: ['Arduino', 'C++', 'Robotics', 'Inverse Kinematics', '3D Printing', 'Control Systems'],
    metadata: null,
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2025-01-20T14:00:00Z',
    artifacts: [
      {
        id: 'artifact-r1',
        project_id: 'demo-robotics',
        file_name: 'arduino-firmware.zip',
        file_path: 'demo/arduino-firmware.zip',
        file_type: 'application/zip',
        file_size: 524288,
        mime_type: 'application/zip',
        upload_status: 'COMPLETED' as const,
        storage_bucket: 'project-files',
        analysis_status: 'COMPLETED' as const,
        analysis_result: { skills_found: 6, confidence: 0.92 },
        metadata: null,
        created_at: '2024-06-15T11:00:00Z',
      },
      {
        id: 'artifact-r2',
        project_id: 'demo-robotics',
        file_name: 'arm-cad-files.step',
        file_path: 'demo/arm-cad-files.step',
        file_type: 'application/step',
        file_size: 15728640,
        mime_type: 'application/step',
        upload_status: 'COMPLETED' as const,
        storage_bucket: 'project-files',
        analysis_status: 'COMPLETED' as const,
        analysis_result: { skills_found: 2, confidence: 0.85 },
        metadata: null,
        created_at: '2024-07-01T09:00:00Z',
      },
      {
        id: 'artifact-r3',
        project_id: 'demo-robotics',
        file_name: 'demo-video.mp4',
        file_path: 'demo/demo-video.mp4',
        file_type: 'video/mp4',
        file_size: 52428800,
        mime_type: 'video/mp4',
        upload_status: 'COMPLETED' as const,
        storage_bucket: 'project-files',
        analysis_status: 'COMPLETED' as const,
        analysis_result: { skills_found: 4, confidence: 0.78 },
        metadata: null,
        created_at: '2024-09-10T16:00:00Z',
      },
      {
        id: 'artifact-r4',
        project_id: 'demo-robotics',
        file_name: 'python-gui-src.zip',
        file_path: 'demo/python-gui-src.zip',
        file_type: 'application/zip',
        file_size: 1048576,
        mime_type: 'application/zip',
        upload_status: 'COMPLETED' as const,
        storage_bucket: 'project-files',
        analysis_status: 'COMPLETED' as const,
        analysis_result: { skills_found: 4, confidence: 0.89 },
        metadata: null,
        created_at: '2024-11-05T14:30:00Z',
      },
    ],
    extracted_skills: [
      { id: 'skill-r1', project_id: 'demo-robotics', skill_id: 'sr1', confidence_score: 0.94, evidence_snippets: null, ai_reasoning: 'Advanced Arduino programming with interrupts', is_verified: true, created_at: '2025-01-20T14:00:00Z', skill: { id: 'sr1', name: 'Arduino', category: 'Embedded', framework: 'FORGEZ' } as any },
      { id: 'skill-r2', project_id: 'demo-robotics', skill_id: 'sr2', confidence_score: 0.91, evidence_snippets: null, ai_reasoning: 'Object-oriented C++ with templates', is_verified: true, created_at: '2025-01-20T14:00:00Z', skill: { id: 'sr2', name: 'C++', category: 'Languages', framework: 'FORGEZ' } as any },
      { id: 'skill-r3', project_id: 'demo-robotics', skill_id: 'sr3', confidence_score: 0.89, evidence_snippets: null, ai_reasoning: 'Inverse kinematics implementation', is_verified: true, created_at: '2025-01-20T14:00:00Z', skill: { id: 'sr3', name: 'Robotics', category: 'Engineering', framework: 'FORGEZ' } as any },
      { id: 'skill-r4', project_id: 'demo-robotics', skill_id: 'sr4', confidence_score: 0.87, evidence_snippets: null, ai_reasoning: 'PID control loop tuning', is_verified: true, created_at: '2025-01-20T14:00:00Z', skill: { id: 'sr4', name: 'Control Systems', category: 'Engineering', framework: 'FORGEZ' } as any },
      { id: 'skill-r5', project_id: 'demo-robotics', skill_id: 'sr5', confidence_score: 0.82, evidence_snippets: null, ai_reasoning: 'Fusion 360 mechanical design', is_verified: false, created_at: '2025-01-20T14:00:00Z', skill: { id: 'sr5', name: 'CAD Design', category: 'Engineering', framework: 'FORGEZ' } as any },
      { id: 'skill-r6', project_id: 'demo-robotics', skill_id: 'sr6', confidence_score: 0.85, evidence_snippets: null, ai_reasoning: 'Python GUI with tkinter', is_verified: false, created_at: '2025-01-20T14:00:00Z', skill: { id: 'sr6', name: 'Python', category: 'Languages', framework: 'FORGEZ' } as any },
      { id: 'skill-r7', project_id: 'demo-robotics', skill_id: 'sr7', confidence_score: 0.79, evidence_snippets: null, ai_reasoning: 'Serial communication protocols', is_verified: false, created_at: '2025-01-20T14:00:00Z', skill: { id: 'sr7', name: 'Serial Communication', category: 'Embedded', framework: 'FORGEZ' } as any },
    ],
    highlights: [
      'Presented at University Robotics Club',
      'Open-sourced with 150+ GitHub stars',
      'Featured in Hackster.io project showcase',
    ],
    teamSize: 2,
    collaborators: [
      { name: 'Alex Kim', role: 'Hardware Design' },
    ],
    achievements: [
      { icon: 'star', label: 'GitHub Stars', value: '150+' },
      { icon: 'target', label: 'Precision', value: '±2mm' },
      { icon: 'zap', label: 'Response', value: '<50ms' },
    ],
  },
  'demo-energy': {
    id: 'demo-energy',
    user_id: 'demo-user',
    title: 'Sustainable Energy Monitor',
    description: `An IoT-based monitoring system for tracking solar panel efficiency and battery storage in residential installations. This project aims to help homeowners optimize their renewable energy usage.

## Problem Statement

Many homeowners with solar installations lack visibility into their system's real-time performance and long-term efficiency trends. This project provides an affordable, DIY-friendly solution for comprehensive energy monitoring.

## System Architecture

### Hardware Setup
- ESP32 microcontroller as the central hub
- INA219 current/voltage sensors for power monitoring
- DHT22 temperature/humidity sensors
- 128x64 OLED display for local readings
- WiFi connectivity for cloud data sync

### Software Stack
- **Firmware**: MicroPython on ESP32
- **Backend**: Python Flask API on Raspberry Pi
- **Database**: InfluxDB for time-series data
- **Visualization**: Grafana dashboards
- **Mobile App**: React Native companion app

## Key Metrics Tracked

- Real-time power generation (W)
- Daily/monthly energy production (kWh)
- Battery state of charge (%)
- Panel temperature and efficiency correlation
- Grid import/export balance
- Carbon offset calculations

## Results

After deploying on my family's 5kW solar installation:
- Identified 15% efficiency loss due to panel shading
- Optimized battery charging schedule, reducing grid dependency by 23%
- Saved approximately $45/month on electricity bills

## Open Source

All hardware schematics, firmware, and software are open-sourced to help others build their own monitoring systems.`,
    project_type: 'CODE' as ProjectType,
    thumbnail_url: null,
    external_url: 'https://energy-monitor-demo.vercel.app',
    repository_url: 'https://github.com/demo-user/sustainable-energy-monitor',
    start_date: '2024-03-01',
    end_date: '2024-08-30',
    is_ongoing: false,
    visibility: 'public',
    is_featured: false,
    view_count: 634,
    tags: ['IoT', 'Python', 'ESP32', 'Solar Energy', 'Data Visualization', 'Sustainability'],
    metadata: null,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-08-30T16:00:00Z',
    artifacts: [
      {
        id: 'artifact-e1',
        project_id: 'demo-energy',
        file_name: 'esp32-firmware.zip',
        file_path: 'demo/esp32-firmware.zip',
        file_type: 'application/zip',
        file_size: 256000,
        mime_type: 'application/zip',
        upload_status: 'COMPLETED' as const,
        storage_bucket: 'project-files',
        analysis_status: 'COMPLETED' as const,
        analysis_result: { skills_found: 5, confidence: 0.90 },
        metadata: null,
        created_at: '2024-04-10T12:00:00Z',
      },
      {
        id: 'artifact-e2',
        project_id: 'demo-energy',
        file_name: 'flask-backend.zip',
        file_path: 'demo/flask-backend.zip',
        file_type: 'application/zip',
        file_size: 384000,
        mime_type: 'application/zip',
        upload_status: 'COMPLETED' as const,
        storage_bucket: 'project-files',
        analysis_status: 'COMPLETED' as const,
        analysis_result: { skills_found: 4, confidence: 0.88 },
        metadata: null,
        created_at: '2024-05-20T10:00:00Z',
      },
      {
        id: 'artifact-e3',
        project_id: 'demo-energy',
        file_name: 'hardware-schematic.pdf',
        file_path: 'demo/hardware-schematic.pdf',
        file_type: 'application/pdf',
        file_size: 2097152,
        mime_type: 'application/pdf',
        upload_status: 'COMPLETED' as const,
        storage_bucket: 'project-files',
        analysis_status: 'COMPLETED' as const,
        analysis_result: { skills_found: 3, confidence: 0.85 },
        metadata: null,
        created_at: '2024-06-01T14:00:00Z',
      },
      {
        id: 'artifact-e4',
        project_id: 'demo-energy',
        file_name: 'grafana-dashboards.json',
        file_path: 'demo/grafana-dashboards.json',
        file_type: 'application/json',
        file_size: 45056,
        mime_type: 'application/json',
        upload_status: 'COMPLETED' as const,
        storage_bucket: 'project-files',
        analysis_status: 'COMPLETED' as const,
        analysis_result: { skills_found: 2, confidence: 0.82 },
        metadata: null,
        created_at: '2024-07-15T09:00:00Z',
      },
      {
        id: 'artifact-e5',
        project_id: 'demo-energy',
        file_name: 'mobile-app-src.zip',
        file_path: 'demo/mobile-app-src.zip',
        file_type: 'application/zip',
        file_size: 1572864,
        mime_type: 'application/zip',
        upload_status: 'COMPLETED' as const,
        storage_bucket: 'project-files',
        analysis_status: 'COMPLETED' as const,
        analysis_result: { skills_found: 4, confidence: 0.87 },
        metadata: null,
        created_at: '2024-08-20T11:00:00Z',
      },
    ],
    extracted_skills: [
      { id: 'skill-e1', project_id: 'demo-energy', skill_id: 'se1', confidence_score: 0.92, evidence_snippets: null, ai_reasoning: 'ESP32 sensor integration', is_verified: true, created_at: '2024-08-30T16:00:00Z', skill: { id: 'se1', name: 'IoT Development', category: 'Embedded', framework: 'FORGEZ' } as any },
      { id: 'skill-e2', project_id: 'demo-energy', skill_id: 'se2', confidence_score: 0.90, evidence_snippets: null, ai_reasoning: 'MicroPython and Flask development', is_verified: true, created_at: '2024-08-30T16:00:00Z', skill: { id: 'se2', name: 'Python', category: 'Languages', framework: 'FORGEZ' } as any },
      { id: 'skill-e3', project_id: 'demo-energy', skill_id: 'se3', confidence_score: 0.88, evidence_snippets: null, ai_reasoning: 'Grafana dashboard creation', is_verified: true, created_at: '2024-08-30T16:00:00Z', skill: { id: 'se3', name: 'Data Visualization', category: 'Analytics', framework: 'FORGEZ' } as any },
      { id: 'skill-e4', project_id: 'demo-energy', skill_id: 'se4', confidence_score: 0.84, evidence_snippets: null, ai_reasoning: 'InfluxDB time-series queries', is_verified: false, created_at: '2024-08-30T16:00:00Z', skill: { id: 'se4', name: 'Database Management', category: 'Backend', framework: 'FORGEZ' } as any },
      { id: 'skill-e5', project_id: 'demo-energy', skill_id: 'se5', confidence_score: 0.86, evidence_snippets: null, ai_reasoning: 'React Native mobile development', is_verified: true, created_at: '2024-08-30T16:00:00Z', skill: { id: 'se5', name: 'React Native', category: 'Mobile', framework: 'FORGEZ' } as any },
      { id: 'skill-e6', project_id: 'demo-energy', skill_id: 'se6', confidence_score: 0.80, evidence_snippets: null, ai_reasoning: 'Hardware schematic design', is_verified: false, created_at: '2024-08-30T16:00:00Z', skill: { id: 'se6', name: 'Electronics', category: 'Hardware', framework: 'FORGEZ' } as any },
    ],
    highlights: [
      'Reduced family electricity bills by $45/month',
      'Open-sourced with community contributions',
      'Deployed on 3 residential installations',
    ],
    teamSize: 1,
    achievements: [
      { icon: 'trending', label: 'Savings', value: '$45/mo' },
      { icon: 'zap', label: 'Optimized', value: '+23%' },
      { icon: 'target', label: 'Accuracy', value: '99.2%' },
    ],
  },
};

const projectTypeIcons: Record<ProjectType, typeof Code2> = {
  CODE: Code2,
  DOCUMENT: FileText,
  VIDEO: Video,
  AUDIO: Headphones,
  DESIGN: Palette,
  MODEL_3D: Box,
  PRESENTATION: Presentation,
  CERTIFICATION: Award,
  OTHER: File,
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const labels = useWorldLabels();
  const t = useTranslations('portfolio');

  const { currentProject, setCurrentProject, deleteProject } = useProjectsStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if this is a demo project
  const isDemo = projectId.startsWith('demo-');
  const demoProject = isDemo ? demoProjects[projectId] : null;

  useEffect(() => {
    // For demo projects, use mock data
    if (isDemo && demoProject) {
      setCurrentProject(demoProject);
      setIsOwner(false); // Demo projects are read-only
      setIsLoading(false);
      return;
    }

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
        const { project, isOwner: owner } = await response.json();
        setCurrentProject(project);
        setIsOwner(owner);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError(error instanceof Error ? error.message : 'Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();

    return () => {
      setCurrentProject(null);
    };
  }, [projectId, setCurrentProject, isDemo, demoProject]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      deleteProject(projectId);
      router.push('/portfolio');
    } catch (error) {
      console.error('Delete error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete project');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentProject?.title,
          url,
        });
      } catch {
        // Cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      // Could show toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      </div>
    );
  }

  if (error || !currentProject) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <Card className="p-12 text-center bg-[var(--background-secondary)] border-[var(--border)]">
          <h2 className="text-xl font-semibold mb-2">
            {error || 'Project not found'}
          </h2>
          <p className="text-[var(--foreground-muted)] mb-4">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link href="/portfolio">
            <Button variant="secondary">Back to Portfolio</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const TypeIcon = projectTypeIcons[currentProject.project_type];

  // Get project metadata (for highlights, achievements, etc.)
  const projectMeta = isDemo && demoProjects[projectId]
    ? {
        highlights: demoProjects[projectId].highlights,
        achievements: demoProjects[projectId].achievements,
        collaborators: demoProjects[projectId].collaborators,
        teamSize: demoProjects[projectId].teamSize,
      }
    : getProjectMetadata(currentProject);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Demo Banner */}
      {isDemo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-4 bg-gradient-to-r from-[var(--primary-muted)] to-[var(--secondary-muted)] border-[var(--primary)]/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--foreground)]">{t('detail.demoBanner.title')}</p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {t('detail.demoBanner.description')}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Back link */}
      <Link
        href={isDemo ? "/dashboard" : "/portfolio"}
        className="inline-flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        {t('detail.backTo', { page: isDemo ? labels.dashboard : labels.portfolio })}
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center">
            <TypeIcon className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold font-display">
                {currentProject.title}
              </h1>
              {currentProject.is_featured && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  {t('detail.featured')}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-[var(--foreground-muted)]">
              <span>{t(`types.${currentProject.project_type.toLowerCase()}`)}</span>
              <span>·</span>
              {currentProject.visibility === 'public' && (
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {t('visibility.public')}
                </span>
              )}
              {currentProject.visibility === 'unlisted' && (
                <span className="flex items-center gap-1">
                  <LinkIcon className="w-4 h-4" />
                  {t('visibility.unlisted')}
                </span>
              )}
              {currentProject.visibility === 'private' && (
                <span className="flex items-center gap-1">
                  <Lock className="w-4 h-4" />
                  {t('visibility.private')}
                </span>
              )}
              <span>·</span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {t('detail.views', { count: currentProject.view_count })}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            {t('detail.share')}
          </Button>
          {isOwner && (
            <>
              <Link href={`/portfolio/${projectId}/edit`}>
                <Button variant="secondary">
                  <Edit className="w-4 h-4 mr-2" />
                  {t('detail.edit')}
                </Button>
              </Link>
              <Button
                variant="secondary"
                className="text-[var(--danger)] hover:bg-[var(--danger-muted)]"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-4 bg-[var(--danger-muted)] border-[var(--danger)]">
            <div className="flex items-center justify-between">
              <p className="text-[var(--danger)]">
                {t('detail.deleteConfirm')}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  {t('detail.cancel')}
                </Button>
                <Button
                  size="sm"
                  className="bg-[var(--danger)] hover:bg-[var(--danger-hover)]"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t('detail.delete')
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {currentProject.description && (
            <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
              <h2 className="text-lg font-semibold mb-3">{t('detail.about')}</h2>
              <div className="prose prose-invert max-w-none">
                {currentProject.description.split('\n').map((line, index) => {
                  // Handle ## headers
                  if (line.startsWith('## ')) {
                    return (
                      <h3 key={index} className="text-base font-semibold text-[var(--foreground)] mt-6 mb-3 first:mt-0">
                        {line.replace('## ', '')}
                      </h3>
                    );
                  }
                  // Handle ### headers
                  if (line.startsWith('### ')) {
                    return (
                      <h4 key={index} className="text-sm font-semibold text-[var(--foreground)] mt-4 mb-2">
                        {line.replace('### ', '')}
                      </h4>
                    );
                  }
                  // Handle list items
                  if (line.startsWith('- ')) {
                    const content = line.replace('- ', '');
                    // Handle **bold** in list items
                    const parts = content.split(/\*\*(.*?)\*\*/g);
                    return (
                      <div key={index} className="flex gap-2 text-[var(--foreground-muted)] ml-2 my-1">
                        <span className="text-[var(--primary)]">•</span>
                        <span>
                          {parts.map((part, i) =>
                            i % 2 === 1 ? <strong key={i} className="text-[var(--foreground)]">{part}</strong> : part
                          )}
                        </span>
                      </div>
                    );
                  }
                  // Handle empty lines
                  if (line.trim() === '') {
                    return <div key={index} className="h-2" />;
                  }
                  // Regular paragraph with bold support
                  const parts = line.split(/\*\*(.*?)\*\*/g);
                  return (
                    <p key={index} className="text-[var(--foreground-muted)] my-1">
                      {parts.map((part, i) =>
                        i % 2 === 1 ? <strong key={i} className="text-[var(--foreground)]">{part}</strong> : part
                      )}
                    </p>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Artifacts */}
          <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <File className="w-5 h-5 text-[var(--secondary)]" />
                {t('detail.projectFiles')}
              </h2>
              <Badge variant="secondary">
                {t('detail.filesCount', { count: currentProject.artifacts?.length || 0 })}
              </Badge>
            </div>

            {currentProject.artifacts && currentProject.artifacts.length > 0 ? (
              <div className="space-y-3">
                {currentProject.artifacts.map((artifact, index) => {
                  // Determine file icon based on extension
                  const ext = artifact.file_name.split('.').pop()?.toLowerCase();
                  let FileIcon = File;
                  let iconColor = 'text-[var(--foreground-muted)]';

                  if (['zip', 'tar', 'gz', 'rar'].includes(ext || '')) {
                    FileIcon = Box;
                    iconColor = 'text-purple-400';
                  } else if (['js', 'ts', 'tsx', 'py', 'cpp', 'c', 'java'].includes(ext || '')) {
                    FileIcon = Code2;
                    iconColor = 'text-blue-400';
                  } else if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext || '')) {
                    FileIcon = FileText;
                    iconColor = 'text-orange-400';
                  } else if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) {
                    FileIcon = Video;
                    iconColor = 'text-red-400';
                  } else if (['ipynb'].includes(ext || '')) {
                    FileIcon = Sparkles;
                    iconColor = 'text-yellow-400';
                  } else if (['json', 'yaml', 'yml', 'xml'].includes(ext || '')) {
                    FileIcon = FileText;
                    iconColor = 'text-green-400';
                  } else if (['step', 'stl', 'obj', 'fbx'].includes(ext || '')) {
                    FileIcon = Box;
                    iconColor = 'text-cyan-400';
                  }

                  return (
                    <motion.div
                      key={artifact.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-4 rounded-lg bg-[var(--background-tertiary)] hover:bg-[var(--background-tertiary)]/80 transition-colors group"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        "bg-[var(--background-secondary)] group-hover:scale-110 transition-transform"
                      )}>
                        <FileIcon className={cn("w-5 h-5", iconColor)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{artifact.file_name}</p>
                        <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                          <span>{(artifact.file_size / 1024 / 1024).toFixed(2)} MB</span>
                          {artifact.created_at && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(artifact.created_at), 'MMM d, yyyy')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {artifact.analysis_status === 'COMPLETED' && (
                        <Badge variant="secondary" className="gap-1 bg-[var(--success-muted)] text-[var(--success)]">
                          <Sparkles className="w-3 h-3" />
                          {t('detail.analyzed')}
                        </Badge>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[var(--foreground-muted)] text-center py-8">
                {t('detail.noFilesYet')}
              </p>
            )}

            {isOwner && (
              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <ArtifactUploader projectId={projectId} />
              </div>
            )}
          </Card>

          {/* Extracted skills */}
          {currentProject.extracted_skills && currentProject.extracted_skills.length > 0 && (
            <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                {t('detail.extractedSkills')}
              </h2>
              <div className="space-y-3">
                {currentProject.extracted_skills.map((ps) => (
                  <motion.div
                    key={ps.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background-tertiary)]"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{ps.skill?.name || 'Unknown Skill'}</span>
                        {ps.is_verified && (
                          <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                        )}
                      </div>
                      {ps.ai_reasoning && (
                        <p className="text-xs text-[var(--foreground-muted)]">{ps.ai_reasoning}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-medium text-[var(--primary)]">
                        {Math.round(ps.confidence_score * 100)}%
                      </div>
                      <Progress
                        value={ps.confidence_score * 100}
                        max={100}
                        size="sm"
                        className="w-16 mt-1"
                        variant={ps.confidence_score > 0.85 ? "success" : "default"}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}

          {/* Highlights */}
          {projectMeta.highlights && projectMeta.highlights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  {t('detail.highlights')}
                </h2>
                <div className="space-y-3">
                  {projectMeta.highlights.map((highlight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20"
                    >
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-yellow-500" />
                      </div>
                      <span className="text-[var(--foreground)]">{highlight}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Collaborators */}
          {projectMeta.collaborators && projectMeta.collaborators.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--secondary)]" />
                  {t('detail.teamMembers')}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {projectMeta.collaborators.map((collaborator, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background-tertiary)]"
                    >
                      <div className="w-10 h-10 rounded-full bg-[var(--secondary-muted)] flex items-center justify-center">
                        <span className="text-sm font-medium text-[var(--secondary)]">
                          {collaborator.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{collaborator.name}</p>
                        <p className="text-xs text-[var(--foreground-muted)]">{collaborator.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Links */}
          {(currentProject.external_url || currentProject.repository_url) && (
            <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
              <h2 className="text-lg font-semibold mb-4">{t('detail.links')}</h2>
              <div className="space-y-3">
                {currentProject.external_url && (
                  <a
                    href={currentProject.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[var(--primary)] hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t('detail.viewProject')}
                  </a>
                )}
                {currentProject.repository_url && (
                  <a
                    href={currentProject.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[var(--primary)] hover:underline"
                  >
                    <Github className="w-4 h-4" />
                    {t('detail.viewRepository')}
                  </a>
                )}
              </div>
            </Card>
          )}

          {/* Timeline */}
          <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-4">{t('detail.timeline')}</h2>
            <div className="space-y-3 text-sm">
              {currentProject.start_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--foreground-muted)]" />
                  <span>
                    {t('detail.started', { date: format(new Date(currentProject.start_date), 'MMM yyyy') })}
                  </span>
                </div>
              )}
              {currentProject.end_date && !currentProject.is_ongoing && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--foreground-muted)]" />
                  <span>
                    {t('detail.completed', { date: format(new Date(currentProject.end_date), 'MMM yyyy') })}
                  </span>
                </div>
              )}
              {currentProject.is_ongoing && (
                <Badge variant="secondary">{t('detail.ongoing')}</Badge>
              )}
              <div className="pt-2 border-t border-[var(--border)] text-[var(--foreground-muted)]">
                {t('detail.created', { date: format(new Date(currentProject.created_at), 'MMM d, yyyy') })}
              </div>
            </div>
          </Card>

          {/* Tags */}
          {currentProject.tags && currentProject.tags.length > 0 && (
            <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
              <h2 className="text-lg font-semibold mb-4">{t('detail.tags')}</h2>
              <div className="flex flex-wrap gap-2">
                {currentProject.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Achievements / Key Metrics */}
          {projectMeta.achievements && projectMeta.achievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 bg-gradient-to-br from-[var(--background-secondary)] to-[var(--primary-muted)]/30 border-[var(--border)]">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[var(--primary)]" />
                  {t('detail.keyMetrics')}
                </h2>
                <div className="space-y-4">
                  {projectMeta.achievements.map((achievement, index) => {
                    const Icon = achievementIcons[achievement.icon] || Star;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between p-3 rounded-lg bg-[var(--background-tertiary)]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
                            <Icon className="w-4 h-4 text-[var(--primary)]" />
                          </div>
                          <span className="text-sm text-[var(--foreground-muted)]">{achievement.label}</span>
                        </div>
                        <span className="font-mono font-bold text-[var(--foreground)]">{achievement.value}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Project Stats */}
          {projectMeta.teamSize && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 bg-[var(--background-secondary)] border-[var(--border)]">
                <h2 className="text-lg font-semibold mb-4">{t('detail.projectInfo')}</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--foreground-muted)] flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {t('detail.teamSize')}
                    </span>
                    <span className="font-medium">{t('detail.person', { count: projectMeta.teamSize })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--foreground-muted)] flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {t('detail.totalViews')}
                    </span>
                    <span className="font-medium">{currentProject.view_count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--foreground-muted)] flex items-center gap-2">
                      <File className="w-4 h-4" />
                      {t('detail.files')}
                    </span>
                    <span className="font-medium">{currentProject.artifacts?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--foreground-muted)] flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {t('detail.skillsDetected')}
                    </span>
                    <span className="font-medium">{currentProject.extracted_skills?.length || 0}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
