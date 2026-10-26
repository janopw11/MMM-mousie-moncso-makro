interface ProgressBarProps {
  value: number;
  max: number;
  color: string;
}

export function ProgressBar({ value, max, color }: ProgressBarProps) {
  const safeMax = max > 0 ? max : 1;
  const pct = Math.min(100, Math.max(0, (value / safeMax) * 100));
  const isOver = value > max;
  return (
    <div className="progress-bar">
      <div
        className={`progress-bar-fill${isOver ? ' over' : ''}`}
        style={{ width: `${pct}%`, background: isOver ? undefined : color }}
      />
    </div>
  );
}
