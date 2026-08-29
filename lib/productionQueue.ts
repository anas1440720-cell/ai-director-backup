export type QueueStatus = "waiting" | "running" | "completed" | "failed";

export type QueueJob = {
  id: string;
  name: string;
  status: QueueStatus;
  progress?: number;
  error?: string;
};

export class ProductionQueue {
  private jobs: QueueJob[] = [];

  private generateId(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  addJob(name: string): QueueJob {
    const job: QueueJob = {
      id: this.generateId(),
      name,
      status: "waiting",
      progress: 0,
    };

    this.jobs.push(job);
    return job;
  }

  startJob(id: string) {
    this.jobs = this.jobs.map((job) =>
      job.id === id ? { ...job, status: "running", progress: 10 } : job
    );
  }

  updateProgress(id: string, progress: number) {
    this.jobs = this.jobs.map((job) =>
      job.id === id ? { ...job, progress: Math.min(100, Math.max(0, progress)) } : job
    );
  }

  completeJob(id: string) {
    this.jobs = this.jobs.map((job) =>
      job.id === id ? { ...job, status: "completed", progress: 100 } : job
    );
  }

  failJob(id: string, error?: string) {
    this.jobs = this.jobs.map((job) =>
      job.id === id ? { ...job, status: "failed", error } : job
    );
  }

  getJobs(): QueueJob[] {
    return [...this.jobs];
  }

  getActiveJob(): QueueJob | undefined {
    return this.jobs.find((j) => j.status === "running");
  }

  isAllCompleted(): boolean {
    return this.jobs.length > 0 && this.jobs.every((j) => j.status === "completed");
  }

  clear() {
    this.jobs = [];
  }
}