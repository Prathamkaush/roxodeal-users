export function RoxodealLoader({
  label = "Getting your marketplace ready...",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`rx-brand-loader${compact ? " compact" : ""}`}
      role="status"
      aria-label={`Roxodeal: ${label}`}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="rx-loader-emblem" aria-hidden="true">
        <span className="rx-loader-orbit outer" />
        <span className="rx-loader-orbit inner" />
        <span className="rx-loader-logo">
          <img src="/roxodeal-mark.svg" width={56} height={56} alt="" />
        </span>
        <span className="rx-loader-satellite">
          <i />
        </span>
      </div>
      <span className="rx-loader-wordmark" aria-hidden="true">
        Roxo<span>deal</span>
      </span>
      <p>{label}</p>
      <span className="rx-loader-track" aria-hidden="true">
        <i />
      </span>
    </div>
  );
}
