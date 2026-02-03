"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Compass,
  Rocket,
  Zap,
  Cpu,
  Code2,
  ChevronRight,
  Star,
  Users,
  MapPin,
  TrendingUp,
  Award,
  Briefcase,
  GraduationCap,
  ArrowRight,
  Lightbulb,
  Target,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWorldLabelsI18n } from "@/i18n/use-world-labels";
import { useTranslations } from "next-intl";

// Industries icons and colors
const industryConfig = {
  space: { icon: Rocket, color: "#6366f1" },
  energy: { icon: Zap, color: "#22c55e" },
  robotics: { icon: Cpu, color: "#f59e0b" },
  software: { icon: Code2, color: "#8b5cf6" },
};

// Mock career paths data
const mockCareerPaths = {
  space: [
    {
      id: "1",
      title: "Aerospace Engineer",
      level: "Mid",
      salary: "$95K - $140K",
      growth: "+8%",
      description: "Design and develop aircraft, spacecraft, and missiles",
      requiredSkills: ["Physics", "CAD", "Materials Science", "Aerodynamics"],
      matchScore: 78,
    },
    {
      id: "2",
      title: "Satellite Systems Engineer",
      level: "Senior",
      salary: "$120K - $180K",
      growth: "+12%",
      description: "Design and operate satellite communication and navigation systems",
      requiredSkills: ["RF Engineering", "Orbital Mechanics", "Signal Processing"],
      matchScore: 65,
    },
    {
      id: "3",
      title: "Mission Operations Specialist",
      level: "Entry",
      salary: "$70K - $100K",
      growth: "+15%",
      description: "Monitor and control spacecraft missions from ground stations",
      requiredSkills: ["Data Analysis", "Communication", "Problem Solving"],
      matchScore: 82,
    },
  ],
  energy: [
    {
      id: "4",
      title: "Solar Energy Engineer",
      level: "Mid",
      salary: "$80K - $120K",
      growth: "+22%",
      description: "Design and optimize solar power systems and installations",
      requiredSkills: ["Electrical Engineering", "PV Systems", "Grid Integration"],
      matchScore: 71,
    },
    {
      id: "5",
      title: "Battery Systems Engineer",
      level: "Senior",
      salary: "$110K - $160K",
      growth: "+25%",
      description: "Develop energy storage solutions for EVs and grid applications",
      requiredSkills: ["Electrochemistry", "Materials Science", "Testing"],
      matchScore: 58,
    },
  ],
  robotics: [
    {
      id: "6",
      title: "Robotics Software Engineer",
      level: "Mid",
      salary: "$100K - $150K",
      growth: "+18%",
      description: "Develop software for autonomous robotic systems",
      requiredSkills: ["ROS", "Python", "C++", "Computer Vision"],
      matchScore: 85,
    },
    {
      id: "7",
      title: "Automation Engineer",
      level: "Entry",
      salary: "$75K - $110K",
      growth: "+14%",
      description: "Design and implement industrial automation solutions",
      requiredSkills: ["PLC Programming", "Industrial Networks", "Control Systems"],
      matchScore: 72,
    },
  ],
  software: [
    {
      id: "8",
      title: "Machine Learning Engineer",
      level: "Mid",
      salary: "$120K - $180K",
      growth: "+35%",
      description: "Build and deploy machine learning models at scale",
      requiredSkills: ["Python", "TensorFlow", "MLOps", "Statistics"],
      matchScore: 88,
    },
    {
      id: "9",
      title: "Full Stack Developer",
      level: "Entry",
      salary: "$80K - $120K",
      growth: "+20%",
      description: "Build complete web applications from frontend to backend",
      requiredSkills: ["JavaScript", "React", "Node.js", "Databases"],
      matchScore: 92,
    },
    {
      id: "10",
      title: "AI Research Scientist",
      level: "Senior",
      salary: "$150K - $250K",
      growth: "+30%",
      description: "Advance the state of artificial intelligence through research",
      requiredSkills: ["Deep Learning", "Research", "Mathematics", "Publishing"],
      matchScore: 45,
    },
  ],
};

// Mock career examples (real people testimonials)
const mockCareerExamples = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    role: "Lead Propulsion Engineer",
    company: "SpaceX",
    industry: "space",
    image: null,
    quote: "Starting with a physics degree, I worked my way up through hands-on projects and constant learning.",
    path: ["Physics BSc", "Aerospace MSc", "Junior Engineer", "Senior Engineer", "Lead Engineer"],
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    role: "Robotics Team Lead",
    company: "Boston Dynamics",
    industry: "robotics",
    image: null,
    quote: "Building robots in my garage as a kid led me to a career making machines that can walk and dance.",
    path: ["Mechanical Engineering", "ROS Developer", "Controls Engineer", "Team Lead"],
  },
  {
    id: "3",
    name: "Emma Okonkwo",
    role: "AI Research Scientist",
    company: "DeepMind",
    industry: "software",
    image: null,
    quote: "Curiosity about how humans learn led me to create AI systems that learn in similar ways.",
    path: ["Computer Science", "PhD in ML", "Research Fellow", "Research Scientist"],
  },
  {
    id: "4",
    name: "Thomas Virtanen",
    role: "Senior Battery Engineer",
    company: "Northvolt",
    industry: "energy",
    image: null,
    quote: "The transition to sustainable energy is the challenge of our generation. I'm proud to contribute.",
    path: ["Chemistry", "Materials Science PhD", "R&D Engineer", "Senior Engineer"],
  },
];

export default function CompassPage() {
  const labels = useWorldLabelsI18n();
  const t = useTranslations('compass');
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  // Industries with translations
  const industries = Object.entries(industryConfig).map(([id, config]) => ({
    id,
    name: t(`industries.${id}.name`),
    description: t(`industries.${id}.description`),
    ...config,
  }));

  const activeIndustry = industries.find((i) => i.id === selectedIndustry);
  const careerPaths = selectedIndustry ? mockCareerPaths[selectedIndustry as keyof typeof mockCareerPaths] || [] : [];
  const careerExamples = selectedIndustry
    ? mockCareerExamples.filter((e) => e.industry === selectedIndustry)
    : mockCareerExamples;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">{labels.compass}</h1>
          <p className="text-[var(--foreground-muted)]">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/skills/bank">
            <Button variant="secondary">
              <Target className="w-4 h-4 mr-2" />
              {t('actions.viewMySkills')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Industry Selection */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5" />
          {t('industries.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {industries.map((industry, index) => {
            const Icon = industry.icon;
            const isSelected = selectedIndustry === industry.id;
            return (
              <motion.button
                key={industry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedIndustry(isSelected ? null : industry.id)}
                className={`text-left p-6 rounded-xl border transition-all ${
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--primary-muted)]"
                    : "border-[var(--border)] hover:border-[var(--border-hover)] bg-[var(--background-secondary)]"
                }`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${industry.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: industry.color }} />
                </div>
                <h3 className="font-semibold mb-1">{industry.name}</h3>
                <p className="text-sm text-[var(--foreground-muted)] line-clamp-2">
                  {industry.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Career Paths for Selected Industry */}
      {selectedIndustry && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              {t('careerPaths.title', { industry: activeIndustry?.name ?? '' })}
            </h2>
            <Link href={`/careers?industry=${selectedIndustry}`}>
              <Button variant="ghost" size="sm">
                {t('actions.viewJobs')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {careerPaths.map((career, index) => (
              <motion.div
                key={career.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:border-[var(--border-hover)] transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{career.title}</h3>
                        <p className="text-sm text-[var(--foreground-muted)]">{t('careerPaths.level', { level: career.level })}</p>
                      </div>
                      <Badge
                        className={
                          career.matchScore >= 80
                            ? "bg-green-500/20 text-green-400"
                            : career.matchScore >= 60
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-gray-500/20 text-gray-400"
                        }
                      >
                        {t('careerPaths.match', { score: career.matchScore })}
                      </Badge>
                    </div>

                    <p className="text-sm text-[var(--foreground-muted)] mb-4">
                      {career.description}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--foreground-muted)]">{t('careerPaths.salaryRange')}</span>
                        <span className="font-medium">{career.salary}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--foreground-muted)]">{t('careerPaths.jobGrowth')}</span>
                        <span className="font-medium text-[var(--success)]">{career.growth}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-[var(--foreground-muted)] mb-2">{t('careerPaths.requiredSkills')}</p>
                      <div className="flex flex-wrap gap-1">
                        {career.requiredSkills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {career.requiredSkills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{career.requiredSkills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--foreground-muted)] mb-2">{t('careerPaths.yourMatch')}</p>
                      <Progress value={career.matchScore} max={100} size="sm" variant={career.matchScore >= 80 ? "success" : "default"} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Career Examples / Testimonials */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          {t('careerJourneys.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {careerExamples.map((example, index) => {
            const industry = industries.find((i) => i.id === example.industry);
            return (
              <motion.div
                key={example.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: industry?.color || "#6366f1" }}
                      >
                        {example.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <h3 className="font-semibold">{example.name}</h3>
                        <p className="text-sm text-[var(--foreground-muted)]">{example.role}</p>
                        <p className="text-sm text-[var(--primary)]">{example.company}</p>
                      </div>
                    </div>

                    <blockquote className="text-sm italic text-[var(--foreground-muted)] mb-4 border-l-2 border-[var(--primary)] pl-3">
                      &ldquo;{example.quote}&rdquo;
                    </blockquote>

                    <div>
                      <p className="text-xs text-[var(--foreground-muted)] mb-2">{t('careerJourneys.careerPath')}</p>
                      <div className="flex flex-wrap items-center gap-1">
                        {example.path.map((step, i) => (
                          <div key={i} className="flex items-center">
                            <Badge variant="secondary" className="text-xs">
                              {step}
                            </Badge>
                            {i < example.path.length - 1 && (
                              <ArrowRight className="w-3 h-3 mx-1 text-[var(--foreground-subtle)]" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Skill Gap Analysis CTA */}
      <Card className="bg-gradient-to-r from-[var(--primary-muted)] to-[var(--secondary-muted)] border-[var(--primary)]">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('cta.title')}</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {t('cta.description')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/portfolio/new">
                <Button>{t('actions.addProject')}</Button>
              </Link>
              <Link href="/learn">
                <Button variant="secondary">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  {t('actions.learnNewSkills')}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
