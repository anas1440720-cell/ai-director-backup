export type JobStatus =
  | "WAITING"
  | "PROCESSING"
  | "DONE";

export type ProductionJob = {
  id: string;
  name: string;
  status: JobStatus;
};
export async function runProductionQueue(
  jobs: ProductionJob[],
  onUpdate: (jobs: ProductionJob[]) => void
) {
  const updated = [...jobs];

  for (let i = 0; i < updated.length; i++) {

    updated[i] = {
      ...updated[i],
      status: "PROCESSING",
    };

    onUpdate([...updated]);

    await new Promise((resolve) =>
      setTimeout(resolve, 1500)
    );

    updated[i] = {
      ...updated[i],
      status: "DONE",
    };

    onUpdate([...updated]);
  }
}