export type QueueStatus =
  | "waiting"
  | "running"
  | "completed"
  | "failed";

export type QueueJob = {
  id: string;
  name: string;
  status: QueueStatus;
};

export class ProductionQueue {
  private jobs: QueueJob[] = [];

  addJob(name: string) {
    const job: QueueJob = {
      id: crypto.randomUUID(),
      name,
      status: "waiting",
    };

    this.jobs.push(job);

    return job;
  }

  startJob(id: string) {
    this.jobs = this.jobs.map((job) =>
      job.id === id
        ? { ...job, status: "running" }
        : job
    );
  }

  completeJob(id: string) {
    this.jobs = this.jobs.map((job) =>
      job.id === id
        ? { ...job, status: "completed" }
        : job
    );
  }

  failJob(id: string) {
    this.jobs = this.jobs.map((job) =>
      job.id === id
        ? { ...job, status: "failed" }
        : job
    );
  }

  getJobs() {
    return this.jobs;
  }

  clear() {
    this.jobs = [];
  }
}