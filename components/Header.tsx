import { Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/20 border border-blue-400/30">

            <Sparkles className="h-6 w-6 text-blue-400" />

          </div>

          <div>

            <h1 className="text-2xl font-bold tracking-tight">
              AI Director
            </h1>

            <p className="text-xs text-gray-400">
              Turn Ideas Into Cinema
            </p>

          </div>

        </div>

        <button className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-5 py-2 text-sm font-medium text-blue-300 transition hover:bg-blue-500 hover:text-white">
          Login
        </button>

      </div>
    </header>
  );
}