export type JobStatus = "WAITING" | "PROCESSING" | "DONE" | "FAILED";

export type ProductionJob = {
  id: string;
  name: string;
  status: JobStatus;
  error?: string;
  action?: () => Promise<void>;
};

export async function runProductionQueue(
  jobs: ProductionJob[],
  onUpdate: (jobs: ProductionJob[]) => void
) {
  const currentJobs = [...jobs];

  for (let i = 0; i < currentJobs.length; i++) {
    currentJobs[i] = {
      ...currentJobs[i],
      status: "PROCESSING",
    };
    onUpdate([...currentJobs]);

    try {
      if (currentJobs[i].action) {
        await currentJobs[i].action!();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      currentJobs[i] = {
        ...currentJobs[i],
        status: "DONE",
      };
    } catch (err) {
      console.error(`Production job ${currentJobs[i].name} failed:`, err);
      currentJobs[i] = {
        ...currentJobs[i],
        status: "FAILED",
        error: err instanceof Error ? err.message : "Execution failed.",
      };
    }

    onUpdate([...currentJobs]);
  }
}