"use client";

interface ProjectAnalyticsEngineProps {
  scenes: number;
}

export default function ProjectAnalyticsEngine({
  scenes,
}: ProjectAnalyticsEngineProps) {
  const images = scenes * 2;
  const videos = scenes;
  const voices = scenes;
  const music = 1;
  const duration = scenes * 10;
  const progress = 100;

  return (
    <div className="mt-8 rounded-2xl border border-gray-700 bg-gray-900 p-6">
      <h2 className="text-2xl font-bold mb-6">
        📈 Project Analytics
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="rounded-xl bg-gray-800 p-4">
          <p className="text-gray-400">🎬 Scenes</p>
          <h3 className="text-3xl font-bold">{scenes}</h3>
        </div>

        <div className="rounded-xl bg-gray-800 p-4">
          <p className="text-gray-400">🖼 Images</p>
          <h3 className="text-3xl font-bold">{images}</h3>
        </div>

        <div className="rounded-xl bg-gray-800 p-4">
          <p className="text-gray-400">🎥 Videos</p>
          <h3 className="text-3xl font-bold">{videos}</h3>
        </div>

        <div className="rounded-xl bg-gray-800 p-4">
          <p className="text-gray-400">🎙 Voice Overs</p>
          <h3 className="text-3xl font-bold">{voices}</h3>
        </div>

        <div className="rounded-xl bg-gray-800 p-4">
          <p className="text-gray-400">🎵 Music Tracks</p>
          <h3 className="text-3xl font-bold">{music}</h3>
        </div>

        <div className="rounded-xl bg-gray-800 p-4">
          <p className="text-gray-400">⏱ Duration</p>
          <h3 className="text-3xl font-bold">{duration}s</h3>
        </div>

        <div className="rounded-xl bg-gray-800 p-4">
          <p className="text-gray-400">⭐ Progress</p>
          <h3 className="text-3xl font-bold">{progress}%</h3>
        </div>

      </div>
    </div>
  );
}