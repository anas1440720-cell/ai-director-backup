"use client";

interface Scene {
title?: string;
visual?: string;
camera?: string;
voice?: string;
}

interface EditingWorkspaceProps {
children: React.ReactNode;
scenes?: Scene[];
}

export default function DirectorEditingWorkspace({
children,
scenes = [],
}: EditingWorkspaceProps) {
return ( <div className="space-y-6"> <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"> <div> <h2 className="text-3xl font-bold text-white">
🎬 Video Editing Studio </h2>

```
      <p className="mt-2 text-gray-400">
        Review, edit and prepare your AI-generated movie.
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-400">
        🎞 Timeline
      </div>

      <div className="rounded-lg border border-purple-400/20 bg-purple-400/10 px-3 py-2 text-xs font-bold text-purple-400">
        🎵 Audio
      </div>

      <div className="rounded-lg border border-green-400/20 bg-green-400/10 px-3 py-2 text-xs font-bold text-green-400">
        🎬 Scenes
      </div>
    </div>
  </div>

  <div className="rounded-xl border border-white/10 bg-black/20 p-5">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-bold text-white">
          🎞 Editing Timeline
        </h3>

        <p className="mt-1 text-sm text-gray-400">
          {scenes.length} scene
          {scenes.length === 1 ? "" : "s"} loaded into the timeline.
        </p>
      </div>

      <span className="rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-400">
        AI Editing
      </span>
    </div>

    {scenes.length === 0 ? (
      <div className="mt-5 flex h-32 items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/20 text-sm text-gray-500">
        🎬 No scenes available
      </div>
    ) : (
      <div className="mt-5 space-y-3">
        {scenes.map((scene, index) => (
          <div
            key={index}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10 font-bold text-cyan-400">
                  {index + 1}
                </div>

                <div>
                  <p className="font-bold text-white">
                    {scene.title || `Scene ${index + 1}`}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Cinematic Scene
                  </p>
                </div>
              </div>

              <div className="text-xs font-bold text-green-400">
                READY
              </div>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/40">
              <div className="h-full w-full rounded-full bg-cyan-400/60" />
            </div>

            <div className="mt-3 grid gap-2 text-xs text-gray-500 md:grid-cols-3">
              <span>🎥 Visual</span>
              <span>📸 Camera</span>
              <span>🎙 Voice</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>

  <div>
    {children}
  </div>

  <div className="grid gap-4 md:grid-cols-3">
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-sm text-gray-400">
        🎥 Video
      </p>

      <p className="mt-2 font-bold text-yellow-400">
        Preparing
      </p>
    </div>

    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-sm text-gray-400">
        🎙 Voice
      </p>

      <p className="mt-2 font-bold text-yellow-400">
        Preparing
      </p>
    </div>

    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-sm text-gray-400">
        🎵 Music
      </p>

      <p className="mt-2 font-bold text-yellow-400">
        Preparing
      </p>
    </div>
  </div>
</div>

);
}