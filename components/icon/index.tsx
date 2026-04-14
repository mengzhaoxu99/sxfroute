"use client";

import {
  ArrowUpRight,
  BarChart2,
  Bot,
  Clapperboard,
  Cloud,
  Code,
  Database,
  GitBranch,
  Globe,
  Heart,
  HelpCircle,
  Key,
  Mail,
  Map,
  Moon,
  Search,
  Zap,
} from "lucide-react";

import { ElementType } from "react";

const iconMap: { [key: string]: ElementType } = {
  ArrowUpRight,
  BarChart2,
  Bot,
  Clapperboard,
  Cloud,
  Code,
  Database,
  GitBranch,
  Globe,
  Heart,
  HelpCircle,
  Key,
  Mail,
  Map,
  Moon,
  Search,
  Zap,
};

export default function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Icon] Unknown icon name: "${name}"`)
    }
    return null;
  }

  return <IconComponent className={className} />;
}
