"use client";

interface ProjectAnalyticsEngineProps {
  scenes?: number;
  scenesData?: any[];
  generatedImages?: string[];
  generatedVideos?: (string | null)[];
  generatedVoiceAudios?: (string | null)[];
  generatedMusicAudios?: (string | null)[];
  progress?: number;
}

export default function ProjectAnalyticsEngine({
  scenes = 0,
  scenesData = [],
  generatedImages = [],
  generatedVideos = [],
  generatedVoiceAudios = [],
  generatedMusicAudios = [],
  progress = 100,
}: ProjectAnalyticsEngineProps) {
  // حساب الأصول الفعلية المولدة بنجاح
  const imagesCount = generatedImages.filter(Boolean).length;
  const videosCount = generatedVideos.filter(Boolean).length;
  const voicesCount = generatedVoiceAudios.filter(Boolean).length;
  const musicCount = generatedMusicAudios.filter(Boolean).length;

  // حساب وقت التشغيل الفعلي من مدة المشاهد أو الافتراضي
  const totalDuration = scenesData.length > 0 
    ? scenesData.reduce((total, s) => total + (Number(s.duration) || 5), 0)
    : scenes * 5;

  const stats = [
    { label: "Scenes", value: scenes, icon: "🎬", color: "text-cyan-400" },
    { label: "Keyframe Images", value: imagesCount, icon: "🖼️", color: "text-blue-400" },
    { label: "Video Renders", value: videosCount, icon: "🎥", color: "text-purple-400" },
    { label: "Voiceovers", value: voicesCount, icon: "🎙️", color: "text-emerald-400" },
    { label: "Soundtrack", value: musicCount, icon: "🎵", color: "text-pink-400" },
    { label: "Est. Runtime", value: `${totalDuration}s`, icon: "⏱️", color: "text-amber-400" },
    { label: "Pipeline Status", value: `${progress}%`, icon: "⚡", color: "text-green-400" },
  ];

  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white">📈 Project Production Metrics</h3>
          <p className="mt-1 text-xs text-gray-400">
            Real-time asset accounting and production workload distribution.
          </p>
        </div>
        <span className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
          Analytics Live
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-white/5 bg-black/20 p-4 transition hover:border-white/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{stat.label}</span>
              <span className="text-base">{stat.icon}</span>
            </div>
            <p className={`mt-2 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}