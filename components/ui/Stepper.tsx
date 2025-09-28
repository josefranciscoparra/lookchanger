// Uso: <Stepper steps={[...]} current={0} />
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm" role="list" aria-label="Progreso">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-3">
            <span
              className={[
                "h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center border text-xs sm:text-sm",
                active ? "bg-ink-500 text-white border-ink-500"
                       : done ? "bg-white text-ink-500 border-ink-500"
                              : "bg-white text-text-secondary border-border"
              ].join(" ")}
              aria-current={active ? "step" : undefined}
            >
              {i + 1}
            </span>
            <span className={`text-xs sm:text-sm ${active ? "font-semibold text-ink-500" : "text-text-secondary"} hidden sm:inline`}>
              {label}
            </span>
            {/* Versión móvil más corta */}
            <span className={`text-xs ${active ? "font-semibold text-ink-500" : "text-text-secondary"} sm:hidden`}>
              {label.split(' ')[0]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}