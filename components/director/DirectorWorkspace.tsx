"use client";

import { useEffect, useRef, useState } from "react";

import StoryEngine from "../engines/StoryEngine";
import CharacterEngine from "../engines/CharacterEngine";
import ProjectAnalyticsEngine from "../engines/ProjectAnalyticsEngine";
import SceneEditorEngine from "../engines/SceneEditorEngine";
import DirectorEditingWorkspace from "./DirectorEditingWorkspace";
import ProductionAssetsGallery from "../engines/ProductionAssetsGallery";
import ProjectsArchive from "../../components/ProjectsArchive";

interface DirectorWorkspaceProps {
  activeTab: string;
  selectedPromptIndex?: number | null;
  onTabChange?: (tab: string) => void;
  idea?: string;
  storyData?: any;
  generatedImages?: string[];
  generatedVideos?: (string | null)[];
  generatedVoiceAudios?: (string | null)[];
  generatedMusicAudios?: (string | null)[];
  generatedSfxAudios?: (string | null)[];
  imagePrompts?: string[];
  videoPrompts?: string[];
  style?: string;
  onImageGenerated?: (index: number, imageUrl: string) => void;
  onVideoGenerated?: (index: number, videoUri: string) => void;
  onVoiceGenerated?: (index: number, audioUrl: string) => void;
}

type Scene = {
  title: string;
  visual: string;
  camera: string;
  voice: string;
  storyPurpose?: string;
  time?: string;
  location?: string;
  characters?: any[];
  action?: string;
  emotion?: string;
  environment?: any;
  lighting?: any;
  composition?: any;
  continuity?: string;
};

const STORAGE_KEY = "ai_director_scenes_backup";

export default function DirectorWorkspace({
  activeTab,
  selectedPromptIndex,
  onTabChange,
  idea = "AI Generated Story",
  storyData,
  generatedImages = [],
  generatedVideos = [],
  generatedVoiceAudios = [],
  generatedMusicAudios = [],
  generatedSfxAudios = [],
  imagePrompts = [],
  videoPrompts = [],
  style = "Realistic",
  onImageGenerated,
  onVideoGenerated,
  onVoiceGenerated,
}: DirectorWorkspaceProps) {
  const [editableScenes, setEditableScenes] = useState<Scene[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return (storyData?.scenes || []).map((scene: any) => ({
      ...scene,
      title: scene.title || "Untitled Scene",
      visual: scene.visual || "",
      camera: scene.camera || "",
      voice: scene.voice || "",
    }));
  });

  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const promptSceneRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [localImagePrompts, setLocalImagePrompts] = useState<string[]>([]);
  const [localVideoPrompts, setLocalVideoPrompts] = useState<string[]>([]);
  const [localVoicePrompts, setLocalVoicePrompts] = useState<string[]>([]);

  const [savedImagePrompts, setSavedImagePrompts] = useState<string[]>([]);
  const [savedVideoPrompts, setSavedVideoPrompts] = useState<string[]>([]);
  const [savedVoicePrompts, setSavedVoicePrompts] = useState<string[]>([]);

  const [sceneTab, setSceneTab] = useState<{ [index: number]: "image" | "video" | "voice" }>({});

  const [savingStatus, setSavingStatus] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (imagePrompts.length > 0 && localImagePrompts.length === 0) {
      setLocalImagePrompts(imagePrompts);
      setSavedImagePrompts(imagePrompts);
    }
  }, [imagePrompts]);

  useEffect(() => {
    if (videoPrompts.length > 0 && localVideoPrompts.length === 0) {
      setLocalVideoPrompts(videoPrompts);
      setSavedVideoPrompts(videoPrompts);
    }
  }, [videoPrompts]);

  useEffect(() => {
    if (editableScenes.length > 0 && localVoicePrompts.length === 0) {
      const initialVoices = editableScenes.map((s) => s.voice || "");
      setLocalVoicePrompts(initialVoices);
      setSavedVoicePrompts(initialVoices);
    }
  }, [editableScenes]);

  useEffect(() => {
    if (editableScenes.length > 0 && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(editableScenes));
    }
  }, [editableScenes]);

  useEffect(() => {
    if (storyData?.scenes && storyData.scenes.length > 0) {
      const newScenes = storyData.scenes.map((scene: any) => ({
        ...scene,
        title: scene.title || "Untitled Scene",
        visual: scene.visual || "",
        camera: scene.camera || "",
        voice: scene.voice || "",
      }));
      setEditableScenes(newScenes);
    }
  }, [storyData]);

  useEffect(() => {
    if (
      activeTab !== "prompts" ||
      selectedPromptIndex === null ||
      selectedPromptIndex === undefined
    ) {
      return;
    }

    const sceneElement = promptSceneRefs.current[selectedPromptIndex];
    if (!sceneElement) return;

    sceneElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeTab, selectedPromptIndex]);

  const openSceneEditor = (index: number) => {
    const scene = editableScenes[index];
    if (!scene) return;
    setEditingScene(scene);
    setEditingIndex(index);
  };

  const closeSceneEditor = () => {
    setEditingScene(null);
    setEditingIndex(null);
  };

  const saveScene = (updatedScene: Partial<Scene>) => {
    if (editingIndex === null) return;

    setEditableScenes((currentScenes) => {
      const updatedScenes = [...currentScenes];
      updatedScenes[editingIndex] = {
        ...updatedScenes[editingIndex],
        ...updatedScene,
      };
      return updatedScenes;
    });

    closeSceneEditor();
  };

  const handleSavePrompt = (index: number, type: "image" | "video" | "voice") => {
    setSavingStatus(`Saved Scene ${index + 1} (${type})`);
    setTimeout(() => setSavingStatus(null), 2500);

    if (type === "image") {
      const updatedSaved = [...savedImagePrompts];
      updatedSaved[index] = localImagePrompts[index];
      setSavedImagePrompts(updatedSaved);
    } else if (type === "video") {
      const updatedSaved = [...savedVideoPrompts];
      updatedSaved[index] = localVideoPrompts[index];
      setSavedVideoPrompts(updatedSaved);
    } else if (type === "voice") {
      const updatedSaved = [...savedVoicePrompts];
      updatedSaved[index] = localVoicePrompts[index];
      setSavedVoicePrompts(updatedSaved);

      const updatedScenes = [...editableScenes];
      if (updatedScenes[index]) {
        updatedScenes[index].voice = localVoicePrompts[index];
        setEditableScenes(updatedScenes);
      }
    }
  };

  const handleRegenerateAsset = async (index: number, type: "image" | "video" | "voice") => {
    const key = `${index}-${type}`;
    setActionLoading(key);

    try {
      if (type === "image") {
        const promptToUse = localImagePrompts[index] || editableScenes[index]?.visual;
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: promptToUse, provider: "cloudflare" }),
        });
        const data = await res.json();
        const newImageUrl = data.imageUrl || data.image;
        if (!data.success && !newImageUrl) {
          throw new Error(data.message || "Failed to regenerate image.");
        }
        if (newImageUrl && onImageGenerated) {
          onImageGenerated(index, newImageUrl);
        }
        alert(`✅ Scene ${index + 1}: Image regenerated and updated successfully!`);
      } else if (type === "video") {
       const promptToUse =
  localVideoPrompts[index] ||
  videoPrompts[index] ||
  editableScenes[index]?.action ||
  editableScenes[index]?.visual ||
  "";
    const currentImg = generatedImages[index];

if (!currentImg) {
  throw new Error(
    `Scene ${index + 1}: generated source image is missing. Video generation was blocked to prevent quota waste.`
  );
}

const sceneDuration = 5;

const res = await fetch("/api/generate-video", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: promptToUse,
    imageUrl: currentImg,
    duration: Math.min(sceneDuration, 4),
    aspectRatio: "9:16",
    sceneIndex: index,
    sceneCount: editableScenes.length,
  }),
});

const data = await res.json();

const newVideoUrl =
  data.videoUri || data.videoUrl;
        if (!data.success && !newVideoUrl) {
          throw new Error(data.message || "Failed to regenerate video.");
        }
        if (newVideoUrl && onVideoGenerated) {
          onVideoGenerated(index, newVideoUrl);
        }
        alert(`✅ Scene ${index + 1}: Video motion synthesized and updated successfully!`);
      } else if (type === "voice") {
        const textToUse = localVoicePrompts[index] || editableScenes[index]?.voice;
        const res = await fetch("/api/generate-voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textToUse }),
        });
        const data = await res.json();
        if (!data.audio) {
          throw new Error(data.message || "Failed to regenerate voice.");
        }
        const voiceUrl = data.audio.startsWith("data:")
          ? data.audio
          : `data:${data.mimeType || "audio/mp3"};base64,${data.audio}`;
        
        if (onVoiceGenerated) {
          onVoiceGenerated(index, voiceUrl);
        }
        alert(`✅ Scene ${index + 1}: Voice narration synthesized and updated successfully!`);
      }
    } catch (error) {
      console.error(error);
      alert(`❌ Error: ${error instanceof Error ? error.message : "Operation failed"}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="mt-8">
      {activeTab === "story" && (
        <div>
          <h2 className="mb-4 text-2xl font-bold text-white">📖 Story Workspace</h2>
          <StoryEngine
            idea={idea}
            style={style}
            goal="Entertainment"
            emotion="Curiosity"
            storyType="Cinematic Story"
            storyData={storyData}
          />
        </div>
      )}

      {activeTab === "characters" && (
        <div>
          <h2 className="mb-4 text-2xl font-bold text-white">🎭 Character Workspace</h2>
          <CharacterEngine
            idea={idea}
            character="Main Character"
            style={style}
            characters={Array.from(
              new Map(
                editableScenes
                  .flatMap((scene) => scene.characters ?? [])
                  .filter((character) => character.name)
                  .map((character) => [character.name, character])
              ).values()
            )}
          />
        </div>
      )}

      {activeTab === "assets" && (
        <ProductionAssetsGallery
          scenes={editableScenes}
          generatedImages={generatedImages}
          generatedVideos={generatedVideos}
        />
      )}

      {activeTab === "prompts" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">🧠 Prompts Studio</h2>
              <p className="mt-1 text-xs text-gray-400">
                Independent scene prompt manager: Edit, Save, and Re-generate specific assets per scene.
              </p>
            </div>
            {savingStatus && (
              <span className="rounded-xl bg-green-500/20 border border-green-500/30 px-3 py-1.5 text-xs font-bold text-green-300">
                {savingStatus}
              </span>
            )}
          </div>

          <div className="space-y-6">
            {editableScenes.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
                <p className="text-xs text-gray-400">No scenes available yet.</p>
              </div>
            ) : (
              editableScenes.map((scene, index) => {
                const defaultImgPrompt = imagePrompts[index] || scene.visual || "";
                const defaultVidPrompt = videoPrompts[index] || "";
                const defaultVoicePrompt = scene.voice || "";

                const currentImgPrompt = localImagePrompts[index] ?? defaultImgPrompt;
                const currentVidPrompt = localVideoPrompts[index] ?? defaultVidPrompt;
                const currentVoicePrompt = localVoicePrompts[index] ?? defaultVoicePrompt;

                const baselineImg = savedImagePrompts[index] ?? defaultImgPrompt;
                const baselineVid = savedVideoPrompts[index] ?? defaultVidPrompt;
                const baselineVoice = savedVoicePrompts[index] ?? defaultVoicePrompt;

                const isImgModified = currentImgPrompt !== baselineImg;
                const isVidModified = currentVidPrompt !== baselineVid;
                const isVoiceModified = currentVoicePrompt !== baselineVoice;

                const currentCardTab = sceneTab[index] || "image";
                const isSelected = selectedPromptIndex === index;

                return (
                  <div
                    key={`${scene.title}-${index}`}
                    ref={(el) => {
                      promptSceneRefs.current[index] = el;
                    }}
                    className={`rounded-3xl border p-5 transition-all duration-500 ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-500/10"
                        : "border-white/10 bg-black/20"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                      <div className="flex items-center gap-4">
                        {generatedImages[index] ? (
                          <img
                            src={generatedImages[index]}
                            alt={`Scene ${index + 1}`}
                            className="h-14 w-20 rounded-xl border border-white/10 object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-20 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-[10px] text-gray-500">
                            No Image
                          </div>
                        )}

                        <div>
                          <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                            Scene {index + 1}
                          </span>
                          <h3 className="text-sm font-bold text-white">{scene.title}</h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setSceneTab({ ...sceneTab, [index]: "image" })}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                            currentCardTab === "image"
                              ? "bg-blue-600 text-white shadow-md"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          🖼️ Image {isImgModified && "•"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSceneTab({ ...sceneTab, [index]: "video" })}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                            currentCardTab === "video"
                              ? "bg-purple-600 text-white shadow-md"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          🎥 Video {isVidModified && "•"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSceneTab({ ...sceneTab, [index]: "voice" })}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                            currentCardTab === "voice"
                              ? "bg-green-600 text-white shadow-md"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          🎙️ Voice {isVoiceModified && "•"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      {currentCardTab === "image" && (
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 animate-fade-in">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-blue-300">🖼️ Image Prompt Directive</span>
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex items-center gap-2 transition-all duration-300 ease-out transform ${
                                  isImgModified
                                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none w-0 overflow-hidden"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleSavePrompt(index, "image")}
                                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-green-500/20 transition-all hover:scale-105 active:scale-95"
                                >
                                  💾 Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...localImagePrompts];
                                    updated[index] = baselineImg;
                                    setLocalImagePrompts(updated);
                                  }}
                                  className="rounded-xl bg-white/10 border border-white/10 px-3 py-1.5 text-[11px] font-bold text-gray-300 transition-all hover:bg-white/25 hover:text-white hover:scale-105 active:scale-95"
                                >
                                  ❌ Cancel
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRegenerateAsset(index, "image")}
                                disabled={actionLoading === `${index}-image`}
                                className="rounded-xl bg-blue-600/90 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                              >
                                {actionLoading === `${index}-image` ? "⏳ Generating..." : "🖼️ Regenerate Image"}
                              </button>
                            </div>
                          </div>
                          <textarea
                            value={currentImgPrompt}
                            onChange={(e) => {
                              const updated = [...localImagePrompts];
                              updated[index] = e.target.value;
                              setLocalImagePrompts(updated);
                            }}
                            rows={3}
                            className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs font-mono text-gray-200 focus:border-cyan-400 focus:outline-none transition"
                          />
                        </div>
                      )}

                      {currentCardTab === "video" && (
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 animate-fade-in">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-purple-300">🎥 Video Motion Directive</span>
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex items-center gap-2 transition-all duration-300 ease-out transform ${
                                  isVidModified
                                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none w-0 overflow-hidden"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleSavePrompt(index, "video")}
                                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-green-500/20 transition-all hover:scale-105 active:scale-95"
                                >
                                  💾 Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...localVideoPrompts];
                                    updated[index] = baselineVid;
                                    setLocalVideoPrompts(updated);
                                  }}
                                  className="rounded-xl bg-white/10 border border-white/10 px-3 py-1.5 text-[11px] font-bold text-gray-300 transition-all hover:bg-white/25 hover:text-white hover:scale-105 active:scale-95"
                                >
                                  ❌ Cancel
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRegenerateAsset(index, "video")}
                                disabled={actionLoading === `${index}-video`}
                                className="rounded-xl bg-purple-600/90 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-purple-500 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                              >
                                {actionLoading === `${index}-video` ? "⏳ Synthesizing..." : "🎥 Regenerate Video"}
                              </button>
                            </div>
                          </div>
                          <textarea
                            value={currentVidPrompt}
                            onChange={(e) => {
                              const updated = [...localVideoPrompts];
                              updated[index] = e.target.value;
                              setLocalVideoPrompts(updated);
                            }}
                            rows={3}
                            className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs font-mono text-gray-200 focus:border-cyan-400 focus:outline-none transition"
                          />
                        </div>
                      )}

                      {currentCardTab === "voice" && (
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 animate-fade-in">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-green-300">🎙️ Voice & Narration Script</span>
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex items-center gap-2 transition-all duration-300 ease-out transform ${
                                  isVoiceModified
                                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none w-0 overflow-hidden"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleSavePrompt(index, "voice")}
                                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-green-500/20 transition-all hover:scale-105 active:scale-95"
                                >
                                  💾 Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...localVoicePrompts];
                                    updated[index] = baselineVoice;
                                    setLocalVoicePrompts(updated);

                                    const updatedScenes = [...editableScenes];
                                    if (updatedScenes[index]) {
                                      updatedScenes[index].voice = baselineVoice;
                                      setEditableScenes(updatedScenes);
                                    }
                                  }}
                                  className="rounded-xl bg-white/10 border border-white/10 px-3 py-1.5 text-[11px] font-bold text-gray-300 transition-all hover:bg-white/25 hover:text-white hover:scale-105 active:scale-95"
                                >
                                  ❌ Cancel
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRegenerateAsset(index, "voice")}
                                disabled={actionLoading === `${index}-voice`}
                                className="rounded-xl bg-green-600/90 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-green-500/20 transition-all hover:bg-green-500 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                              >
                                {actionLoading === `${index}-voice` ? "⏳ Synthesizing..." : "🎙️ Regenerate Voice"}
                              </button>
                            </div>
                          </div>
                          <textarea
                            value={currentVoicePrompt}
                            onChange={(e) => {
                              const updated = [...localVoicePrompts];
                              updated[index] = e.target.value;
                              setLocalVoicePrompts(updated);

                              const updatedScenes = [...editableScenes];
                              if (updatedScenes[index]) {
                                updatedScenes[index].voice = e.target.value;
                                setEditableScenes(updatedScenes);
                              }
                            }}
                            rows={3}
                            className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-gray-200 focus:border-cyan-400 focus:outline-none transition"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === "editing" && (
        <DirectorEditingWorkspace
          scenes={editableScenes}
          generatedImages={generatedImages}
          generatedVideos={generatedVideos}
          generatedVoiceAudios={generatedVoiceAudios}
          generatedMusicAudios={generatedMusicAudios}
          generatedSfxAudios={generatedSfxAudios}
          onTabChange={onTabChange}
        >
          <div />
        </DirectorEditingWorkspace>
      )}

      {activeTab === "project" && (
        <div className="space-y-6">
          <ProjectsArchive onNewProject={() => window.location.reload()} />
          <ProjectAnalyticsEngine
            scenes={editableScenes.length}
            scenesData={editableScenes}
            generatedImages={generatedImages}
            generatedVideos={generatedVideos}
            generatedVoiceAudios={generatedVoiceAudios}
            generatedMusicAudios={generatedMusicAudios}
          />
        </div>
      )}

      {editingScene && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <SceneEditorEngine
              scene={editingScene}
              onSave={saveScene}
              onClose={closeSceneEditor}
            />
          </div>
        </div>
      )}
    </div>
  );
}