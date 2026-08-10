"use client";

type ProjectLibraryEngineProps = {
  idea: string;
};

export default function ProjectLibraryEngine({
  idea,
}: ProjectLibraryEngineProps) {

  const projects = [
    {
      name: idea || "Untitled Project",
      status: "In Production",
      date: "Today",
    },
    {
      name: "Ancient Egypt Story",
      status: "Completed",
      date: "Yesterday",
    },
    {
      name: "Space Adventure",
      status: "Completed",
      date: "Last Week",
    },
  ];

  return (
    <div className="mt-8 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-6">

      <h3 className="text-2xl font-bold text-white">
        📁 Project Library
      </h3>

      <p className="mt-3 text-gray-400">
        All your AI video projects in one place.
      </p>

      <div className="mt-6 space-y-4">

        {projects.map((project, index) => (

          <div
            key={index}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
          >

            <div>

              <h4 className="text-lg font-bold text-white">
                {project.name}
              </h4>

              <p className="text-sm text-gray-400">
                {project.date}
              </p>

            </div>

            <span className="rounded-full bg-green-500/20 px-4 py-2 text-sm text-green-300">
              {project.status}
            </span>

          </div>

        ))}

      </div>

    </div>
  );

}