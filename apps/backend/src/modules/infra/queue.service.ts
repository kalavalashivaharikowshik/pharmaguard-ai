import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

type Handler = (data: any) => Promise<void>;

/**
 * Background job queue. With REDIS_URL it uses BullMQ (jobs survive restarts
 * and are retried 3 times). Without Redis, jobs run in-process right away, so
 * features keep working in local development.
 */
@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly handlers = new Map<string, Handler>();
  private queue?: Queue;
  private worker?: Worker;

  constructor() {
    const url = process.env.REDIS_URL;
    if (!url) return;

    const connection = () => new Redis(url, { maxRetriesPerRequest: null });
    this.queue = new Queue('pharmaguard-jobs', { connection: connection() as any });
    this.worker = new Worker(
      'pharmaguard-jobs',
      async (job: Job) => {
        const handler = this.handlers.get(job.name);
        if (handler) await handler(job.data);
      },
      { connection: connection() as any, concurrency: 5 },
    );
    this.worker.on('failed', (job, err) => this.logger.warn(`Job ${job?.name} failed: ${err.message}`));
    this.logger.log('BullMQ queue enabled.');
  }

  get usingRedis(): boolean {
    return !!this.queue;
  }

  register(name: string, handler: Handler) {
    this.handlers.set(name, handler);
  }

  async add(name: string, data: unknown): Promise<void> {
    if (this.queue) {
      try {
        await this.queue.add(name, data, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 500,
          removeOnFail: 500,
        });
        return;
      } catch (err) {
        this.logger.warn(`Queue unavailable, running ${name} inline: ${(err as Error).message}`);
      }
    }

    const handler = this.handlers.get(name);
    if (!handler) return;
    // Fire and forget so the HTTP request is not slowed down.
    setImmediate(() => handler(data).catch((err) => this.logger.warn(`Job ${name} failed: ${err.message}`)));
  }

  async onModuleDestroy() {
    await this.worker?.close().catch(() => undefined);
    await this.queue?.close().catch(() => undefined);
  }
}
