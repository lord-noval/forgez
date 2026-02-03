"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  ExternalLink,
  Clock,
  Star,
  Filter,
  Search,
  Rocket,
  Zap,
  Cpu,
  Leaf,
  ChevronRight,
  GraduationCap,
  Award,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useWorldLabelsI18n } from "@/i18n/use-world-labels";
import { useTranslations } from "next-intl";

// Industry category icons
const industryIcons = {
  all: Star,
  space: Rocket,
  energy: Zap,
  robotics: Cpu,
  software: Leaf,
};

// Mock learning resources data
const mockLearningResources = [
  {
    id: "1",
    title: "Introduction to Machine Learning",
    provider: "Coursera",
    providerLogo: "/logos/coursera.svg",
    description: "Learn the fundamentals of machine learning and neural networks with hands-on projects",
    duration: "4 weeks",
    level: "Beginner",
    industry: "software",
    skills: ["Machine Learning", "Python", "Neural Networks"],
    rating: 4.8,
    enrollments: "250K+",
    url: "https://coursera.org",
    recommended: true,
  },
  {
    id: "2",
    title: "Orbital Mechanics and Space Mission Design",
    provider: "MIT OpenCourseWare",
    providerLogo: "/logos/mit.svg",
    description: "Comprehensive course on orbital mechanics, trajectory design, and space mission planning",
    duration: "12 weeks",
    level: "Advanced",
    industry: "space",
    skills: ["Orbital Mechanics", "Physics", "Mission Design"],
    rating: 4.9,
    enrollments: "50K+",
    url: "https://ocw.mit.edu",
    recommended: true,
  },
  {
    id: "3",
    title: "Industrial Robotics and Automation",
    provider: "edX",
    providerLogo: "/logos/edx.svg",
    description: "Master industrial robotics concepts including kinematics, control systems, and automation",
    duration: "8 weeks",
    level: "Intermediate",
    industry: "robotics",
    skills: ["Robotics", "Control Systems", "Automation", "PLC"],
    rating: 4.7,
    enrollments: "75K+",
    url: "https://edx.org",
    recommended: false,
  },
  {
    id: "4",
    title: "Renewable Energy Systems",
    provider: "Khan Academy",
    providerLogo: "/logos/khan.svg",
    description: "Explore solar, wind, and battery storage technologies for sustainable energy solutions",
    duration: "6 weeks",
    level: "Beginner",
    industry: "energy",
    skills: ["Renewable Energy", "Solar", "Wind Power", "Energy Storage"],
    rating: 4.6,
    enrollments: "120K+",
    url: "https://khanacademy.org",
    recommended: true,
  },
  {
    id: "5",
    title: "Deep Learning Specialization",
    provider: "DeepLearning.AI",
    providerLogo: "/logos/deeplearning.svg",
    description: "Master deep learning fundamentals including CNNs, RNNs, and transformers",
    duration: "5 months",
    level: "Intermediate",
    industry: "software",
    skills: ["Deep Learning", "TensorFlow", "Computer Vision", "NLP"],
    rating: 4.9,
    enrollments: "500K+",
    url: "https://deeplearning.ai",
    recommended: true,
  },
  {
    id: "6",
    title: "Satellite Technology Fundamentals",
    provider: "Brilliant",
    providerLogo: "/logos/brilliant.svg",
    description: "Interactive course on satellite design, communication systems, and space technology",
    duration: "3 weeks",
    level: "Beginner",
    industry: "space",
    skills: ["Satellites", "RF Communication", "Space Systems"],
    rating: 4.7,
    enrollments: "30K+",
    url: "https://brilliant.org",
    recommended: false,
  },
  {
    id: "7",
    title: "Electric Vehicle Engineering",
    provider: "Udacity",
    providerLogo: "/logos/udacity.svg",
    description: "Comprehensive program on EV powertrains, battery technology, and charging infrastructure",
    duration: "4 months",
    level: "Advanced",
    industry: "energy",
    skills: ["Electric Vehicles", "Battery Tech", "Power Electronics"],
    rating: 4.5,
    enrollments: "45K+",
    url: "https://udacity.com",
    recommended: false,
  },
  {
    id: "8",
    title: "ROS2 for Robotics Development",
    provider: "The Construct",
    providerLogo: "/logos/construct.svg",
    description: "Learn Robot Operating System 2 for building autonomous robot applications",
    duration: "10 weeks",
    level: "Intermediate",
    industry: "robotics",
    skills: ["ROS2", "Python", "C++", "Robot Simulation"],
    rating: 4.8,
    enrollments: "25K+",
    url: "https://theconstructsim.com",
    recommended: true,
  },
];

const levelColors: Record<string, string> = {
  Beginner: "bg-green-500/20 text-green-400",
  Intermediate: "bg-yellow-500/20 text-yellow-400",
  Advanced: "bg-red-500/20 text-red-400",
};

export default function LearnPage() {
  const labels = useWorldLabelsI18n();
  const t = useTranslations('learn');
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Industry categories with translations
  const industries = [
    { id: "all", name: t('industries.all'), icon: industryIcons.all },
    { id: "space", name: t('industries.space'), icon: industryIcons.space },
    { id: "energy", name: t('industries.energy'), icon: industryIcons.energy },
    { id: "robotics", name: t('industries.robotics'), icon: industryIcons.robotics },
    { id: "software", name: t('industries.software'), icon: industryIcons.software },
  ];

  // Filter resources
  const filteredResources = mockLearningResources.filter((resource) => {
    const matchesIndustry = selectedIndustry === "all" || resource.industry === selectedIndustry;
    const matchesSearch =
      searchQuery === "" ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesIndustry && matchesSearch;
  });

  const recommendedResources = filteredResources.filter((r) => r.recommended);
  const otherResources = filteredResources.filter((r) => !r.recommended);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">{labels.learn}</h1>
          <p className="text-[var(--foreground-muted)]">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
            <Input
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Industry Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {industries.map((industry) => {
          const Icon = industry.icon;
          const isSelected = selectedIndustry === industry.id;
          return (
            <Button
              key={industry.id}
              variant={isSelected ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedIndustry(industry.id)}
              className="whitespace-nowrap"
            >
              <Icon className="w-4 h-4 mr-2" />
              {industry.name}
            </Button>
          );
        })}
      </div>

      {/* Recommended Section */}
      {recommendedResources.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold">{t('recommended.forYou')}</h2>
            <Badge variant="secondary" className="ml-2">
              {t('recommendations.basedOnSkills')}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:border-[var(--border-hover)] transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={levelColors[resource.level]}>
                            {t(`levels.${resource.level.toLowerCase()}`)}
                          </Badge>
                          <Badge variant="secondary">
                            <Award className="w-3 h-3 mr-1" />
                            {t('recommended.badge')}
                          </Badge>
                        </div>
                        <h3 className="font-semibold group-hover:text-[var(--primary)] transition-colors">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-[var(--foreground-muted)] mt-1">
                          {resource.provider}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-[var(--foreground-muted)] mb-4 line-clamp-2">
                      {resource.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {resource.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {resource.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{resource.skills.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {resource.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          {resource.rating}
                        </span>
                      </div>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
                      >
                        {t('courses.learnMore')}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Resources */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-[var(--foreground-muted)]" />
          <h2 className="text-lg font-semibold">
            {selectedIndustry === "all" ? t('courses.all') : t('courses.byIndustry', { industry: industries.find((i) => i.id === selectedIndustry)?.name ?? '' })}
          </h2>
          <span className="text-sm text-[var(--foreground-muted)]">
            ({t('courses.results', { count: otherResources.length })})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:border-[var(--border-hover)] transition-all group">
                <CardContent className="p-5">
                  <div className="mb-3">
                    <Badge className={`${levelColors[resource.level]} mb-2`}>
                      {t(`levels.${resource.level.toLowerCase()}`)}
                    </Badge>
                    <h3 className="font-semibold text-sm group-hover:text-[var(--primary)] transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-xs text-[var(--foreground-muted)] mt-1">
                      {resource.provider}
                    </p>
                  </div>

                  <p className="text-xs text-[var(--foreground-muted)] mb-3 line-clamp-2">
                    {resource.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {resource.skills.slice(0, 2).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {resource.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      {resource.rating}
                    </span>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary)] hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-[var(--foreground-muted)] mb-4" />
            <h3 className="font-semibold mb-2">{t('empty.noCourses')}</h3>
            <p className="text-sm text-[var(--foreground-muted)] mb-4">
              {t('empty.adjustFilters')}
            </p>
            <Button variant="secondary" onClick={() => { setSelectedIndustry("all"); setSearchQuery(""); }}>
              {t('empty.clearFilters')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Partner Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            {t('partners.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--foreground-muted)] mb-4">
            {t('partners.description')}
          </p>
          <div className="flex flex-wrap gap-4">
            {["Coursera", "edX", "Brilliant", "MIT OpenCourseWare", "Khan Academy", "Udacity"].map((partner) => (
              <Badge key={partner} variant="secondary" className="px-4 py-2">
                {partner}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
