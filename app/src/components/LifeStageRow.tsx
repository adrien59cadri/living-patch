import type { LifeStage } from '../types';

interface Props {
  stages: LifeStage[];
}

export function LifeStageRow({ stages }: Props) {
  if (stages.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-4">
      {stages.map((stage, i) => (
        <div key={i} className="flex flex-col items-center gap-1 min-w-16">
          <span className="text-2xl" role="img" aria-label={stage.name}>
            {stage.icon}
          </span>
          <span className="text-xs font-medium text-stone-700 text-center">
            {stage.name}
          </span>
          <span className="text-xs text-stone-400 text-center leading-tight">
            {stage.months.join(', ')}
          </span>
        </div>
      ))}
    </div>
  );
}
