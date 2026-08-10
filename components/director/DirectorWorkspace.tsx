"use client";

import { useEffect, useState } from "react";

import StoryEngine from "../engines/StoryEngine";
import MasterProductionPipeline from "../engines/MasterProductionPipeline";
import CharacterEngine from "../engines/CharacterEngine";
import ProductionAssetsGallery from "../engines/ProductionAssetsGallery";
import AssetStatusEngine from "../engines/AssetStatusEngine";
import ProjectManagerEngine from "../engines/ProjectManagerEngine";
import ProjectLibraryEngine from "../engines/ProjectLibraryEngine";
import ProjectAnalyticsEngine from "../engines/ProjectAnalyticsEngine";
import SceneControlEngine from "../engines/SceneControlEngine";
import ImageGenerationEngine from "../engines/ImageGenerationEngine";
import SceneEditorEngine from "../engines/SceneEditorEngine";
import DirectorEditingWorkspace from "./DirectorEditingWorkspace";
import VideoPromptEngine from "../engines/VideoPromptEngine";
interface DirectorWorkspaceProps {
  activeTab: string;
  idea?: string;
  storyData?: any;
}

type Scene = {
  title: string;
  visual: string;
  camera: string;
  voice: string;
};

export default function DirectorWorkspace({
  activeTab,
  idea = "AI Generated Story",
  storyData,
}: DirectorWorkspaceProps) {
  const [editableScenes, setEditableScenes] = useState<Scene[]>(
    (storyData?.scenes || []).map((scene: any) => ({
      title: scene.title || "Untitled Scene",
      visual: scene.visual || "",
      camera: scene.camera || "",
      voice: scene.voice || "",
    }))
  );

  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setEditableScenes(
      (storyData?.scenes || []).map((scene: any) => ({
        title: scene.title || "Untitled Scene",
        visual: scene.visual || "",
        camera: scene.camera || "",
        voice: scene.voice || "",
      }))
    );
  }, [storyData]);

  const openSceneEditor = (index: number) => {
    const scene = editableScenes[index];

    if (!scene) {
      return;
    }

    setEditingScene(scene);
    setEditingIndex(index);
  };

  const closeSceneEditor = () => {
    setEditingScene(null);
    setEditingIndex(null);
  };

  const saveScene = (updatedScene: Partial<Scene>) => {
    if (editingIndex === null) {
      return;
    }

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

  return (
    <div>
      {activeTab === "story" && (
        <div>
          <h2 className="mb-4 text-2xl font-bold">
            📖 Story Workspace
          </h2>

          <StoryEngine
            idea={idea}
            style="Cinematic"
            goal="Entertainment"
            emotion="Curiosity"
            storyType="Cinematic Story"
            storyData={storyData}
          />
        </div>
      )}

      {activeTab === "characters" && (
        <div>
          <h2 className="mb-4 text-2xl font-bold">
            🎭 Character Workspace
          </h2>

          <CharacterEngine
            idea={idea}
            character="Main Character"
            style="Cinematic"
          />
        </div>
      )}

      {activeTab === "production" && (
        <div>
          <h2 className="mb-4 text-2xl font-bold">
            🎬 Production Workspace
          </h2>
<MasterProductionPipeline
  idea={idea}
  videoType="Cinematic"
  audience="Everyone"
  goal="Entertainment"
  character="Main Character"
  style="Cinematic"
  scenes={editableScenes}
  imagePrompts={editableScenes.map(
    (scene) => "Cinematic image of " + scene.visual
  )}
  videoPrompts={editableScenes.map(
    (scene) => "Cinematic video movement " + scene.visual
  )}
  voiceScripts={editableScenes.map(
    (scene) => scene.voice
  )}
  musicTimeline={editableScenes.map(
    () => "Cinematic soundtrack"
  )}
/>

<div className="mt-8">
  <VideoPromptEngine scenes={editableScenes} />
</div>

<div className="mt-8">
  <SceneControlEngine
    scenes={editableScenes}
    onScenesChange={setEditableScenes}
    onEditScene={openSceneEditor}
  />
</div>
          <div className="mt-8">
            <SceneControlEngine
              scenes={editableScenes}
              onScenesChange={setEditableScenes}
              onEditScene={openSceneEditor}
            />
          </div>
        </div>
      )}

      {activeTab === "assets" && (
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white">
              🖼 Assets Studio
            </h2>

            <p className="mt-2 text-gray-400">
              Manage and generate the assets for every scene
              in your production.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-3xl">🎬</div>

              <div className="mt-3 text-2xl font-bold text-white">
                {editableScenes.length}
              </div>

              <div className="text-sm text-gray-400">
                Scenes
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-3xl">🖼</div>

              <div className="mt-3 text-2xl font-bold text-white">
                {editableScenes.length}
              </div>

              <div className="text-sm text-gray-400">
                Image Assets
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-3xl">🎥</div>

              <div className="mt-3 text-2xl font-bold text-white">
                {editableScenes.length}
              </div>

              <div className="text-sm text-gray-400">
                Video Assets
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-3xl">🎙</div>

              <div className="mt-3 text-2xl font-bold text-white">
                {editableScenes.length}
              </div>

              <div className="text-sm text-gray-400">
                Voice Assets
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
            <h3 className="text-xl font-bold text-white">
              ⚙️ Asset Pipeline
            </h3>

            <p className="mt-1 text-sm text-gray-400">
              Current production asset status.
            </p>

            <div className="mt-5">
              <AssetStatusEngine
                scenes={editableScenes}
                imageReady={true}
                videoReady={true}
                voiceReady={true}
                musicReady={true}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
            <h3 className="mb-5 text-xl font-bold text-white">
              🗂 Production Gallery
            </h3>

            <ProductionAssetsGallery
              scenes={editableScenes}
            />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">
              🎨 Scene Assets
            </h3>

            <p className="mt-1 text-sm text-gray-400">
              Generate visual assets for each scene.
            </p>

            <div className="mt-5 space-y-6">
              {editableScenes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
                  <div className="text-4xl">🖼</div>

                  <p className="mt-3 text-gray-400">
                    No scenes available yet.
                  </p>
                </div>
              ) : (
                editableScenes.map((scene, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                      <div>
                        <h4 className="font-bold text-white">
                          🎬 Scene {index + 1}
                        </h4>

                        <p className="mt-1 text-sm text-gray-400">
                          {scene.title}
                        </p>
                      </div>

                      <span className="rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1 text-xs font-bold text-green-300">
                        READY
                      </span>
                    </div>

                    <div className="grid gap-6 p-5 lg:grid-cols-2">
                      <div>
                        <h4 className="mb-3 font-bold text-gray-300">
                          🎥 Scene Direction
                        </h4>

                        <div className="space-y-4 rounded-xl bg-black/20 p-4">
                          <div>
                            <div className="text-xs text-gray-500">
                              VISUAL
                            </div>

                            <p className="mt-1 text-sm leading-6 text-gray-300">
                              {scene.visual ||
                                "No visual description yet."}
                            </p>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">
                              CAMERA
                            </div>

                            <p className="mt-1 text-sm leading-6 text-gray-300">
                              {scene.camera ||
                                "No camera direction yet."}
                            </p>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">
                              VOICE
                            </div>

                            <p className="mt-1 text-sm leading-6 text-gray-300">
                              {scene.voice ||
                                "No voice script yet."}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-3 font-bold text-gray-300">
                          🖼 Image Generation
                        </h4>

                        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                          <ImageGenerationEngine
                            prompt={
                              scene.visual ||
                              "Cinematic scene"
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "editing" && (
  <DirectorEditingWorkspace scenes={editableScenes}>
          {editableScenes.length === 0 ? (
            <p className="text-gray-400">
              No scenes available yet.
            </p>
          ) : (
            <>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      🎞 Editing Timeline
                    </h3>

                    <p className="mt-1 text-sm text-gray-400">
                      {editableScenes.length} scene
                      {editableScenes.length === 1 ? "" : "s"} ready
                      for editing.
                    </p>
                  </div>

                  <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-300">
                    🎬 EDIT MODE
                  </div>
                </div>

                <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
                  {editableScenes.map((scene, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => openSceneEditor(index)}
                      className="min-w-[180px] rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-400/40 hover:bg-white/10"
                    >
                      <div className="text-xs font-bold text-cyan-300">
                        SCENE {index + 1}
                      </div>

                      <div className="mt-2 truncate font-bold text-white">
                        {scene.title}
                      </div>

                      <div className="mt-2 text-xs text-gray-400">
                        ✏️ Click to edit
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {editableScenes.map((scene, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <div className="text-sm font-bold text-cyan-300">
                          SCENE {index + 1}
                        </div>

                        <h3 className="mt-1 text-xl font-bold text-white">
                          {scene.title}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => openSceneEditor(index)}
                        className="rounded-xl bg-cyan-500 px-5 py-2 font-bold text-black hover:bg-cyan-400"
                      >
                        ✏️ Edit Scene
                      </button>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl bg-black/20 p-4">
                        <div className="text-xs font-bold text-gray-500">
                          🎥 VISUAL
                        </div>

                        <p className="mt-2 text-sm leading-6 text-gray-300">
                          {scene.visual ||
                            "No visual description yet."}
                        </p>
                      </div>

                      <div className="rounded-xl bg-black/20 p-4">
                        <div className="text-xs font-bold text-gray-500">
                          📸 CAMERA
                        </div>

                        <p className="mt-2 text-sm leading-6 text-gray-300">
                          {scene.camera ||
                            "No camera direction yet."}
                        </p>
                      </div>

                      <div className="rounded-xl bg-black/20 p-4">
                        <div className="text-xs font-bold text-gray-500">
                          🎙 VOICE
                        </div>

                        <p className="mt-2 text-sm leading-6 text-gray-300">
                          {scene.voice ||
                            "No voice script yet."}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DirectorEditingWorkspace>
      )}

      {activeTab === "project" && (
        <div>
          <h2 className="mb-6 text-2xl font-bold">
            📁 Project Workspace
          </h2>

          <ProjectManagerEngine
            idea={idea}
            storyData={storyData}
          />

          <div className="mt-6" />

          <ProjectLibraryEngine
            idea={idea}
          />

          <div className="mt-6" />

          <ProjectAnalyticsEngine
            scenes={editableScenes.length}
          />
        </div>
      )}

      {editingScene && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-gray-900 p-6">
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