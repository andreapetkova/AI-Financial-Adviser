import { AlertTriangle, Lightbulb, Info } from 'lucide-react';
import type { Insight } from '@/types';

const INSIGHT_CONFIG = {
  warning: {
    Icon: AlertTriangle,
    iconClass: 'text-amber-400',
    borderClass: 'border-amber-200 bg-amber-500/10',
    labelClass: 'text-amber-300 bg-amber-500/15',
    label: 'Warning',
  },
  saving: {
    Icon: Lightbulb,
    iconClass: 'text-emerald-400',
    borderClass: 'border-emerald-200 bg-emerald-500/10',
    labelClass: 'text-emerald-300 bg-emerald-500/15',
    label: 'Saving Tip',
  },
  info: {
    Icon: Info,
    iconClass: 'text-blue-400',
    borderClass: 'border-blue-200 bg-blue-500/10',
    labelClass: 'text-blue-300 bg-blue-500/15',
    label: 'Info',
  },
} as const;

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const { Icon, iconClass, borderClass, labelClass, label } = INSIGHT_CONFIG[insight.type];

  return (
    <div className={`rounded-lg border p-4 ${borderClass}`}>
      <div className="flex gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClass}`} />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${labelClass}`}>
              {label}
            </span>
          </div>
          <p className="text-sm text-foreground/80">{insight.message}</p>
        </div>
      </div>
    </div>
  );
}
