export function Toggle({
  checked,
  onChange,
  accent = "lime",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  accent?: "lime" | "pink";
}) {
  const activeColor = accent === "pink" ? "bg-pink-500" : "bg-lime-400";
  const activeText = accent === "pink" ? "text-pink-400" : "text-lime-400";
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex shrink-0 items-center gap-2"
    >
      <span className={`text-xs font-medium tabular-nums ${checked ? activeText : "text-gray-500"}`}>
        {checked ? "On" : "Off"}
      </span>
      <span
        className={`flex h-6 w-11 items-center rounded-full border p-0.5 transition-colors ${
          checked ? `${activeColor} border-transparent justify-end` : "border-white/20 bg-white/5 justify-start"
        }`}
      >
        <span className="h-5 w-5 shrink-0 rounded-full bg-white shadow" />
      </span>
    </button>
  );
}
