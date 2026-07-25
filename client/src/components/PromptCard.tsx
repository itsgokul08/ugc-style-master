import { useState } from "react";
import { Copy, Check, Wand2 } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  prompt: string;
  loading?: boolean;
  onGenerate: () => void;
  disabled?: boolean;
  disabledReason?: string;
};

export function PromptCard({ title, subtitle, prompt, loading, onGenerate, disabled, disabledReason }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const isEmpty = !prompt && !loading;

  return (
    <div
      className={`flex flex-col rounded-xl border p-4 ${
        isEmpty ? "border-dashed border-white/10 bg-white/[0.02]" : "border-white/10 bg-white/5"
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-100">{title}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        {prompt && (
          <button
            onClick={handleCopy}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-gray-300 hover:bg-white/10"
          >
            {copied ? <Check size={13} className="text-lime-400" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
      <div className="min-h-24 flex-1 text-sm leading-relaxed text-gray-400">
        {loading ? (
          <span className="text-gray-500">Generating...</span>
        ) : prompt ? (
          <p className="whitespace-pre-wrap">{prompt}</p>
        ) : (
          <span className="text-gray-600">{disabled && disabledReason ? disabledReason : "Nothing generated yet"}</span>
        )}
      </div>
      <button
        onClick={onGenerate}
        disabled={disabled || loading}
        className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 py-1.5 text-xs text-gray-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Wand2 size={12} />
        {loading ? "Generating..." : prompt ? "Regenerate" : "Generate"}
      </button>
    </div>
  );
}
