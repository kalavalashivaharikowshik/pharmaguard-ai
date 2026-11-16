import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

import { PrismaService } from './prisma/prisma.service';
import { ChainService } from './modules/chain/chain.service';
import { CacheService } from './modules/infra/cache.service';
import { QueueService } from './modules/infra/queue.service';
import { SmsService } from './modules/infra/sms.service';
import { GeminiService } from './modules/ai/gemini.service';
import { getApps } from 'firebase-admin/app';

@SkipThrottle()
@Controller()
export class AppController {
  constructor(
    private prisma: PrismaService,
    private chain: ChainService,
    private cache: CacheService,
    private queue: QueueService,
    private sms: SmsService,
    private gemini: GeminiService,
  ) {}

  @Get()
  root() {
    return { name: 'PharmaGuard AI API', status: 'ok', docs: '/api/docs', health: '/health' };
  }

  /** Health check used by Render and the deployment verification steps. */
  @Get('health')
  async health() {
    let database = 'ok';
    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
    } catch {
      database = 'down';
    }
    const blockchain = await this.chain.stats();
    return {
      status: database === 'ok' ? 'ok' : 'degraded',
      time: new Date().toISOString(),
      services: {
        database,
        blockchain: blockchain.enabled ? { network: blockchain.network, contract: blockchain.contractAddress } : 'disabled',
        ai: this.gemini.enabled ? `gemini (${this.gemini.model})` : 'rule-based fallback',
        redis: this.cache.usingRedis && this.queue.usingRedis ? 'connected' : 'not configured (in-memory)',
        sms: this.sms.enabled ? 'twilio' : 'disabled',
        push: getApps().length ? 'firebase' : 'disabled',
        email: process.env.BREVO_API_KEY ? 'brevo' : process.env.SMTP_HOST ? 'smtp' : 'disabled',
        // Base of activation / reset links in emails; must be the live website.
        emailLinks: (process.env.FRONTEND_URL || process.env.CORS_ORIGINS?.split(',')[0] || 'http://localhost:5173').trim().replace(/\/$/, ''),
      },
    };
  }
}
