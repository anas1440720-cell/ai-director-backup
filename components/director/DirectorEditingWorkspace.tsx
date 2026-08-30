"use client";

import { useEffect, useState, useRef } from "react";

interface Scene {
  title?: string;
  visual?: string;
  camera?: string;
  voice?: string;
  duration?: number;
}

interface EditingWorkspaceProps {
  children: React.ReactNode;
  scenes?: Scene[];
  generatedImages?: string[];
  generatedVideos?: (string | null)[];
  generatedVoiceAudios?: (string | null)[];
  generatedMusicAudios?: (string | null)[];
  generatedSfxAudios?: (string | null)[];
  onTabChange?: (tab: string) => void;
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

const STORAGE_FINAL_VIDEO_KEY = "ai_director_final_video_cache";
const STORAGE_ARCHIVE_KEY = "ai_director_saved_projects";

export default function DirectorEditingWorkspace({
  children,
  scenes = [],
  generatedImages = [],
  generatedVideos = [],
  generatedVoiceAudios = [],
  generatedMusicAudios = [],
  generatedSfxAudios = [],
  onTabChange,
}: EditingWorkspaceProps) {
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_FINAL_VIDEO_KEY);
    }
    return null;
  });

  const [isRenderingFinalVideo, setIsRenderingFinalVideo] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  const [isEnglish, setIsEnglish] = useState(false);
  const [fadeAnim, setFadeAnim] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeAnim(false);
      setTimeout(() => {
        setIsEnglish((prev) => !prev);
        setFadeAnim(true);
      }, 600);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const videoCount = generatedVideos.filter(Boolean).length;
const voiceCount = generatedVoiceAudios.filter(Boolean).length;
const expectedSceneCount = scenes.length;

const allVoicesReady =
  expectedSceneCount === 0 ||
  voiceCount === expectedSceneCount;
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // دالة تحويل الحفظ إلى Base64 لضمان بقائه في الأرشيف للأبد
const saveToArchive = async (blob: Blob) => {
  if (typeof window === "undefined") return;

  try {
    const STORAGE_ARCHIVE_KEY = "ai_director_saved_projects_archive";
    const existing = localStorage.getItem(STORAGE_ARCHIVE_KEY);
    const archiveList = existing ? JSON.parse(existing) : [];

    const newProjectEntry = {
      id: String(Date.now()),
      idea: scenes[0]?.title
        ? `مغامرة: ${scenes[0].title}`
        : (scenes[0]?.visual || "مشروع سينمائي مكتمل"),
      videoUrl: "",
      createdAt: new Date().toLocaleDateString(),
      style: "Cinematic",
      duration: String(
        scenes.reduce((acc, s) => acc + (s.duration || 5), 0)
      ),
    };

    archiveList.unshift(newProjectEntry);

    // لا نخزن الفيديو نفسه داخل localStorage
    localStorage.setItem(
      STORAGE_ARCHIVE_KEY,
      JSON.stringify(archiveList)
    );

    console.log("✅ Project metadata saved to archive.");
    console.log(
      `🎬 Video excluded from localStorage: ${Math.round(
        blob.size / 1024 / 1024
      )} MB`
    );
  } catch (e) {
    console.error("Archive metadata save error:", e);
  }
};

  const renderFinalVideo = async () => {
    setIsRenderingFinalVideo(true);
    setRenderError(null);
if (!allVoicesReady) {
  const message =
    `Voice assets are not ready: ${voiceCount}/${expectedSceneCount} scenes have voice audio.`;

  console.error(`❌ ${message}`);
  setRenderError(message);
  setIsRenderingFinalVideo(false);
  return;
}
    try {
      console.log("🎙️ FINAL RENDER VOICE CHECK:", {
  expectedScenes: scenes.length,
  voiceCount: generatedVoiceAudios.filter(Boolean).length,
  voices: generatedVoiceAudios.map((audio, index) => ({
    scene: index + 1,
    ready: Boolean(audio),
    type: audio ? audio.slice(0, 30) : null,
  })),
});
      console.log("🚀 Sending assets to /api/render-video...");
      
      const response = await fetch("/api/render-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videos: generatedVideos,
          voices: generatedVoiceAudios,
          music: generatedMusicAudios,
          sfx: generatedSfxAudios,
          sceneDurations: scenes.map((s) => s.duration || 5),
          aspectRatio: "9:16",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to render final video on server.");
      }

      const blob = await response.blob();
      const videoObjectUrl = URL.createObjectURL(blob);

      setFinalVideoUrl(videoObjectUrl);
      localStorage.setItem(STORAGE_FINAL_VIDEO_KEY, videoObjectUrl);
      
      // حفظ الفيديو بشكل دائم في الأرشيف
      await saveToArchive(blob);

      alert("✅ تم دمج ورندر الفيديو النهائي بنجاح تام عبر FFmpeg وتم حفظه في الأرشيف للأبد! 🎬🔥");
    } catch (error) {
      console.error("Render final video error:", error);
      setRenderError(error instanceof Error ? error.message : "حدث خطأ أثناء رندر الفيديو النهائي.");
    } finally {
      setIsRenderingFinalVideo(false);
    }
  };

  const handleDownloadWithQuality = (quality: string) => {
    if (!finalVideoUrl) return;
    const a = document.createElement("a");
    a.href = finalVideoUrl;
    a.download = `ai-director-masterpiece-${quality}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setShowDownloadMenu(false);
  };

  const timelineScenes = scenes.map((scene, index) => {
    const duration =
      typeof scene.duration === "number" && scene.duration > 0
        ? scene.duration
        : 5;

    const startTime = scenes
      .slice(0, index)
      .reduce((total, previousScene) => {
        const previousDuration =
          typeof previousScene.duration === "number" &&
          previousScene.duration > 0
            ? previousScene.duration
            : 5;
        return total + previousDuration;
      }, 0);

    const endTime = startTime + duration;

    return {
      scene,
      index,
      duration,
      startTime,
      endTime,
    };
  });

  const totalDuration = timelineScenes.reduce(
    (total, item) => total + item.duration,
    0
  );

  return (
    <div className="space-y-6">
      {/* EDITING HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h2 className="text-3xl font-bold text-white">
            🎬 Video Editing Studio
          </h2>
          <p className="mt-2 text-gray-400">
            Review, arrange and prepare your AI-generated movie.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-300">
            🎞 Timeline ({formatTime(totalDuration)})
          </div>
          <div className="rounded-lg border border-green-400/20 bg-green-400/10 px-3 py-2 text-xs font-bold text-green-300">
            🎬 {scenes.length} Scenes
          </div>
        </div>
      </div>

      {/* 💡 NOTICE BANNER */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 backdrop-blur-md shadow-lg">
        <div className="flex items-start gap-3 w-full lg:w-auto">
          <span className="text-2xl animate-pulse mt-0.5">💡</span>
          <div className="w-full">
            <div
              className={`transition-all duration-700 ${
                fadeAnim ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
              }`}
            >
              <h4 className="text-xs font-bold text-white">
                {isEnglish ? "Want to edit or regenerate any scene?" : "هل ترغب في تعديل أو إعادة توليد أي مشهد؟"}
              </h4>
              <p className="text-[11px] text-cyan-200/80 mt-1 leading-relaxed">
                {isEnglish
                  ? "Instantly jump to the Prompts Studio to customize image prompts, video motions, or voiceovers for any scene."
                  : "يمكنك الانتقال الفوري إلى قسم البرومبتات لتعديل نصوص الصور، الفيديوهات، أو التعليق الصوتي لكل مشهد بكل سهولة."}
              </p>
            </div>
          </div>
        </div>

        {onTabChange && (
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-white/10">
            <button
              type="button"
              onClick={() => onTabChange("prompts")}
              className="w-full lg:w-auto shrink-0 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-extrabold text-black transition hover:bg-cyan-400 hover:scale-105 shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🧠</span>
              <span>Open Prompts Studio</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>

      {/* SCENES GRID WORKSPACE */}
      <div className="rounded-xl border border-white/10 bg-black/20 p-5">
        {scenes.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/20 text-sm text-gray-500">
            🎬 No scenes available
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {timelineScenes.map(({ scene, index, duration, startTime, endTime }) => {
              const videoReady = Boolean(generatedVideos[index]);

              return (
                <div key={`${scene.title || "scene"}-${index}`} className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-4 shadow-md space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 font-bold text-cyan-400 text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm truncate max-w-[180px]">
                            {scene.title || `Scene ${index + 1}`}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {formatTime(startTime)} → {formatTime(endTime)} · {duration}s
                          </p>
                        </div>
                      </div>

                      <div className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${videoReady ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"}`}>
                        {videoReady ? "READY" : "PROCESSING"}
                      </div>
                    </div>

                    {/* مرئيات المشهد (صورة وفيديو) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      {generatedImages[index] ? (
                        <div className="flex flex-col items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/40 p-1.5">
                          <span className="text-[10px] text-gray-400 mb-1 font-semibold">🖼️ Keyframe</span>
                          <img
                            src={generatedImages[index]}
                            alt={scene.title || `Scene ${index + 1}`}
                            className="h-[160px] w-full object-contain rounded-md"
                          />
                        </div>
                      ) : (
                        <div className="flex h-[160px] items-center justify-center rounded-lg border border-dashed border-white/10 bg-black/30 text-xs text-gray-500">
                          No Image
                        </div>
                      )}

                      {generatedVideos[index] ? (
                        <div className="flex flex-col items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/40 p-1.5">
                          <span className="text-[10px] text-gray-400 mb-1 font-semibold">🎥 Video Render</span>
                          <video 
                            src={generatedVideos[index] ?? ""} 
                            controls 
                            playsInline 
                            preload="metadata" 
                            className="h-[160px] w-full object-contain rounded-md" 
                          />
                        </div>
                      ) : (
                        <div className="flex h-[160px] items-center justify-center rounded-lg border border-dashed border-white/10 bg-black/30 text-xs text-gray-500">
                          Processing Video...
                        </div>
                      )}
                    </div>

                    {/* 🎧 أدوات المعاينة والتشغيل الصوتي (Voiceover, Music, SFX) */}
                    <div className="mt-4 border-t border-white/10 pt-3 space-y-2">
                      <span className="text-[11px] font-bold text-cyan-300 block">🎧 Scene Audio & Voice Control Center</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                        {/* التعليق الصوتي Voiceover */}
                        <div className="rounded-lg bg-black/30 p-2 border border-white/5 flex flex-col justify-between">
                          <span className="text-gray-400 font-semibold mb-1">🎙️ Voiceover</span>
                          {generatedVoiceAudios[index] ? (
                            <audio src={generatedVoiceAudios[index]!} controls className="w-full h-7" />
                          ) : (
                            <span className="text-gray-600 italic">No voice</span>
                          )}
                        </div>

                        {/* الموسيقى Music */}
                        <div className="rounded-lg bg-black/30 p-2 border border-white/5 flex flex-col justify-between">
                          <span className="text-gray-400 font-semibold mb-1">🎵 Music</span>
                          {generatedMusicAudios[index] ? (
                            <audio src={generatedMusicAudios[index]!} controls className="w-full h-7" />
                          ) : (
                            <span className="text-gray-600 italic">No music</span>
                          )}
                        </div>

                        {/* المؤثرات الصوتية SFX */}
                        <div className="rounded-lg bg-black/30 p-2 border border-white/5 flex flex-col justify-between">
                          <span className="text-gray-400 font-semibold mb-1">🔊 SFX</span>
                          {generatedSfxAudios[index] ? (
                            <audio src={generatedSfxAudios[index]!} controls className="w-full h-7" />
                          ) : (
                            <span className="text-gray-600 italic">No SFX</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FINAL VIDEO RENDER */}
      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-bold text-white">Final Video</h3>
            <p className="mt-1 text-sm text-gray-400">
              Combine all generated scene videos and audio into one final movie.
            </p>
          </div>

          <button
            type="button"
            onClick={renderFinalVideo}
            disabled={isRenderingFinalVideo || videoCount === 0}
            className="rounded-2xl border border-cyan-400/30 bg-cyan-500/20 px-6 py-3.5 text-xs font-extrabold text-cyan-300 shadow-xl backdrop-blur-md transition-all duration-300 ease-out hover:bg-cyan-500 hover:text-black hover:border-cyan-400 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-cyan-500/20 disabled:hover:text-cyan-300 flex items-center justify-center gap-2"
          >
            {isRenderingFinalVideo ? (
              <>
                <span className="animate-spin text-sm">⏳</span>
                <span className="animate-pulse">Rendering Masterpiece...</span>
              </>
            ) : (
              <>
                <span>🎬</span>
                <span>Render Final Video</span>
              </>
            )}
          </button>
        </div>

        {renderError && (
          <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
            {renderError}
          </div>
        )}

        {finalVideoUrl && (
          <div className="mt-6 w-full">
            <div className="relative group w-full flex justify-center bg-black/60 rounded-xl border border-white/10 p-2 shadow-2xl">
              <video
                src={finalVideoUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full max-h-[520px] object-contain rounded-lg"
              />

              <div className="absolute top-4 right-4 z-10" ref={downloadMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  title="تحميل الفيديو النهائي"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/75 backdrop-blur-md border border-white/25 text-cyan-400 shadow-xl transition hover:bg-black hover:text-cyan-300"
                >
                  📥
                </button>

                {showDownloadMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/15 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-xl">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 mb-1">
                      اختر دقة التحميل
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadWithQuality("4K-Ultra")}
                      className="w-full text-right px-3 py-2 text-xs font-semibold text-white rounded-lg transition hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center justify-between"
                    >
                      <span>🔥 4K Ultra HD</span>
                      <span className="text-[10px] text-gray-400">الأعلى</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadWithQuality("1080p-FHD")}
                      className="w-full text-right px-3 py-2 text-xs font-semibold text-white rounded-lg transition hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center justify-between"
                    >
                      <span>⚡ 1080p Full HD</span>
                      <span className="text-[10px] text-gray-400">ممتاز</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadWithQuality("720p-HD")}
                      className="w-full text-right px-3 py-2 text-xs font-semibold text-white rounded-lg transition hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center justify-between"
                    >
                      <span>📱 720p HD</span>
                      <span className="text-[10px] text-gray-400">سريع</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div>{children}</div>
    </div>
  );
}