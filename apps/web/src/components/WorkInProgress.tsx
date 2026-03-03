type WorkInProgressProps = { className?: string; }

export default function WorkInProgress({ className }: WorkInProgressProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-20 md:py-28 text-center ${className ?? ""}`}
    >
      <span className="text-6xl md:text-7xl mb-6" role="img" aria-label="Construction">
        🚧
      </span>
      <h2 className="text-2xl md:text-3xl font-bold text-heading mb-3">
        Work in Progress
      </h2>
      <p className="text-base md:text-lg text-muted max-w-md">
        This section is under construction. Check back soon!
      </p>
    </div>
  );
}
