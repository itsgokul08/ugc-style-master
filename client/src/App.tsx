import { useState, type ReactNode } from "react";
import { UgcTab } from "./components/UgcTab";
import { ReverseStickTab } from "./components/ReverseStickTab";

type Tab = "ugc" | "reverse";

export default function App() {
  const [tab, setTab] = useState<Tab>("ugc");

  return (
    <div className="min-h-dvh bg-[#0b0c10] text-gray-100">
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(circle at 50% -10%, rgba(163,230,53,0.08), transparent 60%)" }}
      />
      <div className="relative mx-auto max-w-5xl px-4 py-6 md:px-6">
        <header className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-50">UGC Style Master</h1>
          <p className="text-sm text-gray-500">
            {tab === "ugc"
              ? "Generate UGC, character sheet, and environment prompts"
              : "Reverse-engineer a prompt from an existing AI image"}
          </p>
        </header>

        <div className="mb-5 flex gap-1 border-b border-white/10">
          <TabButton active={tab === "ugc"} onClick={() => setTab("ugc")}>
            Generate
          </TabButton>
          <TabButton active={tab === "reverse"} onClick={() => setTab("reverse")}>
            Reverse Stick
          </TabButton>
        </div>

        {tab === "ugc" ? <UgcTab /> : <ReverseStickTab />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        active ? "border-lime-400 text-lime-300" : "border-transparent text-gray-400 hover:text-gray-200"
      }`}
    >
      {children}
    </button>
  );
}
