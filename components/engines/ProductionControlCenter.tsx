"use client";

type ProductionControlCenterProps = {
  idea: string;
  progress: number;
  status: string;
  imageReady: boolean;
  videoReady: boolean;
  voiceReady: boolean;
  musicReady: boolean;
};

export default function ProductionControlCenter({
  idea,
  progress,
  status,
  imageReady,
  videoReady,
  voiceReady,
  musicReady,
}: ProductionControlCenterProps) {

  return (
    <div className="mt-8 rounded-3xl border border-purple-500/30 bg-purple-500/10 p-6">

      <h3 className="text-2xl font-bold text-white">
        🎬 AI Director Control Center
      </h3>

      <div className="mt-6 space-y-4">

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-gray-400">
            Project
          </p>

          <p className="mt-1 text-xl font-bold text-white">
            {idea}
          </p>
        </div>


        <div className="rounded-xl border border-white/10 bg-white/5 p-4">

          <div className="flex justify-between text-white">
            <span>
              Production Progress
            </span>

            <span>
              {progress}%
            </span>
          </div>


          <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/30">

            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
              style={{
                width: `${progress}%`
              }}
            />

          </div>


          <p className="mt-3 text-gray-400">
            {status}
          </p>

        </div>


        <div className="grid gap-3 md:grid-cols-2">


          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
            🖼 Images:
            <span className="ml-2">
              {imageReady ? "✅ Ready" : "⏳ Waiting"}
            </span>
          </div>


          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
            🎥 Videos:
            <span className="ml-2">
              {videoReady ? "✅ Ready" : "⏳ Waiting"}
            </span>
          </div>


          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
            🎙 Voice:
            <span className="ml-2">
              {voiceReady ? "✅ Ready" : "⏳ Waiting"}
            </span>
          </div>


          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
            🎵 Music:
            <span className="ml-2">
              {musicReady ? "✅ Ready" : "⏳ Waiting"}
            </span>
          </div>


        </div>

      </div>

    </div>
  );
}