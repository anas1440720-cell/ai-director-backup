"use client";

import { useState } from "react";

type Scene = {
  title: string;
  visual: string;
  camera: string;
  voice: string;
};

type VideoGenerationEngineProps = {
  scenes: Scene[];
};

export default function VideoGenerationEngine({
  scenes,
}: VideoGenerationEngineProps) {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [videoUrls, setVideoUrls] = useState<{ [key: number]: string }>({});

  const handleGenerateVideo = async (scene: Scene, index: number) => {
    setLoadingIndex(index);

    const prompt = `Cinematic camera movement, ${scene.camera}, ${scene.visual}, realistic character motion, smooth animation, dramatic lighting, depth of field, movie quality, ultra realistic, 4K.`;

    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.videoUrl) {
        setVideoUrls((prev) => ({ ...prev, [index]: data.videoUrl }));
      } else {
        alert("تم إرسال الطلب بنجاح، انتظر ربط الـ API الفعلي لتوليد الرابط.");
      }
    } catch (err) {
      console.error("Video generation failed:", err);
      alert("فشل في توليد الفيديو");
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6">
      <h3 className="text-xl font-bold text-white">🎬 Video Generation Engine</h3>
      <p className="mt-2 text-sm text-gray-400">
        توليد مقاطع الفيديو السينمائية لكل مشهد
      </p>

      {scenes.map((scene, index) => (
        <div
          key={index}
          className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white">{scene.title}</h4>
            <button
              onClick={() => handleGenerateVideo(scene, index)}
              disabled={loadingIndex === index}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
            >
              {loadingIndex === index ? "جاري التوليد..." : "توليد الفيديو 🎥"}
            </button>
          </div>

          {videoUrls[index] && (
            <div className="mt-4">
              <video
                src={videoUrls[index]}
                controls
                className="w-full rounded-lg border border-white/10"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}