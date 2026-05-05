type TechPillProps = {
  label: string;
};

export default function TechPill({ label }: TechPillProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-page-alt px-2.5 py-1 font-mono text-xs text-muted">
      {label}
    </span>
  );
}
