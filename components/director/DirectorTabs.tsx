"use client";

interface DirectorTabsProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

const tabs = [
  {
    id: "story",
    title: "📖 Story",
  },
  {
    id: "characters",
    title: "🎭 Characters",
  },
  {
    id: "production",
    title: "🎬 Production",
  },
  {
    id: "assets",
    title: "🖼 Assets",
  },
  {
    id: "editing",
    title: "🎞 Editing",
  },
  {
    id: "project",
    title: "📁 Project",
  },
];

export default function DirectorTabs({
  activeTab,
  onChange,
}: DirectorTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">

      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            rounded-xl
            px-5
            py-3
            font-semibold
            transition
            ${
              activeTab === tab.id
                ? "bg-cyan-500 text-white"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }
          `}
        >
          {tab.title}
        </button>
      ))}

    </div>
  );
}