import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Observable, interval, switchMap } from 'rxjs';
import { QueueService } from './queue.service';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  // 대기열 진입 API
  @Post('enter')
  async enterQueue(@Body('userId') userId: string) {
    return await this.queueService.enterQueue(userId);
  }

  // 자신의 대기 순번 확인 API
  @Get('status')
  async getQueueStatus(@Query('userId') userId: string) {
    return await this.queueService.getQueueStatus(userId);
  }

  // 관리자 기능: 대기 유저 통과시키기 (동작 확인용)
  @Post('allow')
  async allowUsers(@Body('count') count: number) {
    const allowedUsers = await this.queueService.allowUsers(count);
    return {
      message: `${allowedUsers.length}명의 유저가 통과되었습니다.`,
      allowedUsers,
    };
  }

  @Sse('stream')
  streamQueueStatus(@Query('userId') userId: string): Observable<MessageEvent> {
    return interval(1000).pipe(
      switchMap(async () => {
        const status = await this.queueService.getQueueStatus(userId);
        return { data: status };
      }),
    );
  }
}
