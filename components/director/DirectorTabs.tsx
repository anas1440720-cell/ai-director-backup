"use client";

interface DirectorTabsProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

const tabs = [
  { id: "story", title: "📖 Story" },
  { id: "characters", title: "🎭 Characters" },
  { id: "assets", title: "🖼️ Assets" },
  { id: "prompts", title: "🧠 Prompts" },
  { id: "editing", title: "🎞️ Editing" },
  { id: "project", title: "📁 Project" },
];

export default function DirectorTabs({
  activeTab,
  onChange,
}: DirectorTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-white/10 pb-4 w-full">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
              isActive
                ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 scale-105"
                : "border border-white/5 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab.title}
          </button>
        );
      })}
    </div>
  );
}