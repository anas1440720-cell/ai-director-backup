"use client";

import { useEffect, useState } from "react";
import AIDirector from "./AIDirector";

const MASTER_INSPIRATION_IDEAS = [
  "حكاية تاريخية ملحمية في بغداد القديمة عن تاجر يكتشف سراً غامضاً",
  "A futuristic cyberpunk detective navigating neon-lit rain streets",
  "مغامرة خيالية في الفضاء لاستكشاف كوكب مهجور مليء بالآثار القديمة",
  "رحلة درامية مؤثرة عبر الصحراء الكبرى للبحث عن واحة مفقودة",
  "An ancient samurai defending a hidden mountain village from shadow assassins",
  "قصة غموض مشوقة في قطار سريع منتصف الليل نحو أسرار مظلمة",
  "فارس عربي شجاع يواجه قوى خفية لإنقاذ مملكته من العصر المظلم",
  "A cyberpunk hacker uncovering a conspiracy inside a megacity's core",
  "ملحمة بحرية لقرصان سابق يخوض رحلة أخيرة خلف كنز أسطوري",
  "قصة خيال علمي عن أول محطة بشرية تستقبل إشارة من مجرة بعيدة",
];

export default function Hero() {
  const [idea, setIdea] = useState("");
  const [started, setStarted] = useState(false);
  const [resumeSession, setResumeSession] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [activeInspirations, setActiveInspirations] = useState<string[]>([]);
  const [isRotating, setIsRotating] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const shuffleInspirations = () => {
    setIsRotating(true);
    setIsFading(true);

    setTimeout(() => {
      const shuffled = [...MASTER_INSPIRATION_IDEAS].sort(() => 0.5 - Math.random());
      setActiveInspirations(shuffled.slice(0, 3));
      setIsFading(false);
    }, 250);

    setTimeout(() => {
      setIsRotating(false);
    }, 600);
  };

  useEffect(() => {
    setIsHydrated(true);
    shuffleInspirations();
  }, []);

  const handleStart = () => {
  if (!idea.trim()) {
    setErrorMsg("يرجى كتابة فكرة القصة أو وصف الفيديو أولاً للبدء.");
    setTimeout(() => setErrorMsg(""), 3500);
    return;
  }

  setErrorMsg("");

  // Start this idea as a completely fresh AI Director session
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("ai_director_session_state");
  }

  setStarted(true);
};

  if (!isHydrated) return null;

  return (
    <main className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden bg-[#050816] px-6 pt-24 pb-16">
      {/* Background Cinematic Glows */}
      <div className="pointer-events-none absolute left-1/2 top-24 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-10 top-32 h-[300px] w-[300px] rounded-full bg-purple-600/10 blur-[100px]" />

      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
        {/* Main Title - يختفي بعد بدء المشروع */}
        {!started && (
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Direct your next{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                masterpiece
              </span>
            </h1>
            <p className="mt-3 text-sm text-gray-400 sm:text-base">
              Autonomous multi-modal orchestration for cinematic stories, scenes, voices, and motions.
            </p>
          </div>
        )}

        {/* Input Card & Dynamic Inspiration - يبقى ظاهراً طوال فترة العمل ولا يختفي إلا بالكامل */}
        {!started ? (
          <div className="space-y-4 text-left">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="اكتب فكرة القصة أو وصف الفيديو بالتفصيل..."
                rows={4}
                className="w-full resize-none bg-transparent text-sm sm:text-base text-white outline-none placeholder:text-gray-500 leading-relaxed"
              />

              {errorMsg && (
                <p className="mt-2 text-xs font-semibold text-red-400 text-center">
                  ⚠️ {errorMsg}
                </p>
              )}

              <div className="mt-4 flex justify-center border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={handleStart}
                  className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 text-xs sm:text-sm font-extrabold text-black shadow-lg shadow-cyan-500/25 transition hover:from-cyan-400 hover:to-blue-500 hover:scale-105 cursor-pointer"
                >
                  ✨ Start Directing
                </button>
              </div>
            </div>

            {/* الأفكار المقترحة */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-400">💡 Dynamic Inspiration Ideas:</span>
                <button
                  type="button"
                  onClick={shuffleInspirations}
                  className="group rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold text-cyan-300 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500 hover:text-black flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span className={`inline-block transition-transform duration-500 ${isRotating ? "rotate-180" : "group-hover:rotate-45"}`}>
                    🔄
                  </span>
                  <span>More Ideas</span>
                </button>
              </div>

              <div className={`flex flex-wrap items-center gap-2 transition-opacity duration-300 ${isFading ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                {activeInspirations.map((insp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setIdea(insp)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] text-gray-300 transition-all duration-300 hover:border-cyan-400/60 hover:bg-cyan-500/10 hover:text-white hover:scale-105 cursor-pointer shadow-sm"
                  >
                    {insp}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* صندوق الوصف المصغر والجاهز أثناء رحلة العمل والإنتاج */
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl text-left shadow-lg">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>📝 Active Director Concept:</span>
              <span className="text-cyan-400 font-semibold">Running Production</span>
            </div>
            <p className="text-sm font-medium text-white italic">"{idea}"</p>
          </div>
        )}

        {/* Mounted AI Director Orchestrator */}
        {started && (
          <div className="text-left">
            <AIDirector
  idea={idea}
  onBackToIdea={() => {
    setStarted(false);
  }}
/>
          </div>
        )}
      </div>
    </main>
  );
}