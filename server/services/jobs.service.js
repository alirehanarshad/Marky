import { db } from '../database.js';

/**
 * BackgroundJobService
 * Manages asynchronous background jobs (scraping, AI analysis, CRM import, reports)
 * with real-time progress updates, step status, and SQLite persistence.
 */
class BackgroundJobService {
  constructor() {
    this.activeJobs = new Map(); // In-memory cancellation flags and progress
  }

  /**
   * Create and record a new background job
   */
  async createJob({ jobType, payload = {}, userId = 'default_marky_user' }) {
    const jobId = `job_${jobType}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    
    await db.run(
      `INSERT INTO background_jobs (job_id, job_type, status, progress, current_step, payload_json, user_id)
       VALUES (?, ?, 'queued', 0, 'Job queued for execution', ?, ?)`,
      [jobId, jobType, JSON.stringify(payload), userId]
    );

    this.activeJobs.set(jobId, {
      jobId,
      jobType,
      status: 'queued',
      progress: 0,
      currentStep: 'Job queued for execution',
      isCancelled: false
    });

    return jobId;
  }

  /**
   * Update job progress, step, and status
   */
  async updateJob(jobId, { status, progress, currentStep, result, error }) {
    const updates = [];
    const params = [];

    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (progress !== undefined) {
      updates.push('progress = ?');
      params.push(progress);
    }
    if (currentStep !== undefined) {
      updates.push('current_step = ?');
      params.push(currentStep);
    }
    if (result !== undefined) {
      updates.push('result_json = ?');
      params.push(typeof result === 'object' ? JSON.stringify(result) : result);
    }
    if (error !== undefined) {
      updates.push('error_message = ?');
      params.push(error);
    }
    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      updates.push('completed_at = CURRENT_TIMESTAMP');
    }
    updates.push('updated_at = CURRENT_TIMESTAMP');

    params.push(jobId);

    await db.run(
      `UPDATE background_jobs SET ${updates.join(', ')} WHERE job_id = ?`,
      params
    );

    // Update in-memory cache
    const existing = this.activeJobs.get(jobId) || {};
    this.activeJobs.set(jobId, {
      ...existing,
      ...(status && { status }),
      ...(progress !== undefined && { progress }),
      ...(currentStep && { currentStep }),
      ...(error && { error })
    });
  }

  /**
   * Check if a job was cancelled
   */
  isCancelled(jobId) {
    const job = this.activeJobs.get(jobId);
    return Boolean(job && job.isCancelled);
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId) {
    const existing = this.activeJobs.get(jobId);
    if (existing) {
      existing.isCancelled = true;
    }
    await this.updateJob(jobId, {
      status: 'cancelled',
      currentStep: 'Job was cancelled by operator'
    });
    return { success: true, message: `Job ${jobId} cancelled` };
  }

  /**
   * Retrieve job status
   */
  async getJob(jobId) {
    const row = await db.get('SELECT * FROM background_jobs WHERE job_id = ?', [jobId]);
    if (!row) return null;

    let payload = null;
    let result = null;
    try { if (row.payload_json) payload = JSON.parse(row.payload_json); } catch (e) {}
    try { if (row.result_json) result = JSON.parse(row.result_json); } catch (e) {}

    return {
      jobId: row.job_id,
      jobType: row.job_type,
      status: row.status,
      progress: row.progress || 0,
      currentStep: row.current_step || 'In Progress',
      payload,
      result,
      error: row.error_message,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at
    };
  }

  /**
   * Run an asynchronous task worker safely in the background
   */
  runAsync(jobId, workerFn) {
    // Fire and forget, don't await the worker in caller
    (async () => {
      try {
        await this.updateJob(jobId, {
          status: 'running',
          progress: 5,
          currentStep: 'Job started'
        });

        const progressReporter = async (progress, step) => {
          if (this.isCancelled(jobId)) {
            throw new Error('JOB_CANCELLED');
          }
          await this.updateJob(jobId, { progress, currentStep: step });
        };

        const result = await workerFn(progressReporter);

        await this.updateJob(jobId, {
          status: 'completed',
          progress: 100,
          currentStep: 'Completed successfully',
          result
        });
      } catch (err) {
        if (err.message === 'JOB_CANCELLED') {
          console.log(`[JobService] Job ${jobId} cancelled by user`);
          return;
        }
        console.error(`[JobService] Error executing job ${jobId}:`, err);
        await this.updateJob(jobId, {
          status: 'failed',
          error: err.message || 'Unknown execution failure',
          currentStep: `Failed: ${err.message || 'Execution error'}`
        });
      } finally {
        this.activeJobs.delete(jobId);
      }
    })();
  }
}

export const jobService = new BackgroundJobService();
export default jobService;
