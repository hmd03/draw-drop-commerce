import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import Redis from 'ioredis';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private redisClient!: Redis;
  private readonly logger = new Logger(QueueService.name);

  private readonly QUEUE_KEY = 'commerce:waiting_room';
  private readonly ACTIVE_KEY = 'commerce:active_users';

  private readonly ALLOW_COUNT_PER_SECOND = 10;

  onModuleInit() {
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  async enterQueue(
    userId: string,
  ): Promise<{ position: number; status: string }> {
    const isActive = await this.redisClient.sismember(this.ACTIVE_KEY, userId);
    if (isActive) {
      return { position: 0, status: 'ACTIVE' };
    }

    const timestamp = Date.now();
    await this.redisClient.zadd(this.QUEUE_KEY, timestamp, userId);

    const rank = await this.redisClient.zrank(this.QUEUE_KEY, userId);

    return {
      position: rank !== null ? rank + 1 : 1,
      status: 'WAITING',
    };
  }

  async getQueueStatus(
    userId: string,
  ): Promise<{ position: number; status: string }> {
    const isActive = await this.redisClient.sismember(this.ACTIVE_KEY, userId);
    if (isActive) {
      return { position: 0, status: 'ACTIVE' };
    }

    const rank = await this.redisClient.zrank(this.QUEUE_KEY, userId);
    if (rank === null) {
      return { position: 0, status: 'NOT_IN_QUEUE' };
    }

    return {
      position: rank + 1,
      status: 'WAITING',
    };
  }

  async allowUsers(count: number): Promise<string[]> {
    const users = await this.redisClient.zrange(this.QUEUE_KEY, 0, count - 1);

    if (users.length === 0) return [];

    const pipeline = this.redisClient.pipeline();
    users.forEach((userId) => {
      pipeline.sadd(this.ACTIVE_KEY, userId);
      pipeline.zrem(this.QUEUE_KEY, userId);
    });
    await pipeline.exec();

    return users;
  }

  @Cron(CronExpression.EVERY_SECOND)
  async handleQueuePass() {
    const allowedUsers = await this.allowUsers(this.ALLOW_COUNT_PER_SECOND);

    if (allowedUsers.length > 0) {
      this.logger.log(
        `[대기열 통과] ${allowedUsers.length}명의 유저가 진입했습니다. (누적 DB 부하 방어 성공)`,
      );
    }
  }
}
