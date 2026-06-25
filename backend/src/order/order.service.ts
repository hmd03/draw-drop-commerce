import {
  Injectable,
  OnModuleInit,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class OrderService implements OnModuleInit {
  private redisClient!: Redis;
  private readonly logger = new Logger(OrderService.name);

  // 스니커즈 재고를 관리할 Redis Key
  private readonly STOCK_KEY = 'commerce:stock:sneakers';

  onModuleInit() {
    this.redisClient = new Redis({ host: 'localhost', port: 6379 });

    // 서버 가동 시 초기 재고를 50개로 세팅 (테스트 목적)
    this.redisClient.set(this.STOCK_KEY, 50);
    this.logger.log(`초기 한정판 스니커즈 재고가 50개로 세팅되었습니다.`);
  }

  /**
   * 결제 및 재고 차감 로직
   */
  async purchase(userId: string) {
    // 1. Redis DECR을 이용한 원자적 재고 차감 (동시성 완벽 보장)
    const remainStock = await this.redisClient.decr(this.STOCK_KEY);

    // 2. 재고가 0 미만으로 떨어졌는지 확인 (품절)
    if (remainStock < 0) {
      // 0 미만으로 내려간 숫자를 다시 0으로 보정
      await this.redisClient.incr(this.STOCK_KEY);
      this.logger.warn(`[품절] ${userId}님의 구매 실패 (재고 소진)`);

      throw new BadRequestException('재고가 모두 소진되었습니다.');
    }

    // 3. (가상) DB에 실제 주문 데이터 저장 및 결제 승인 요청
    // 이 단계에서는 Kafka 같은 메시지 큐로 데이터를 보내 비동기로 DB에 저장하는 것이 정석입니다.
    this.logger.log(
      `[구매 성공] ${userId}님 결제 완료! 남은 재고: ${remainStock}개`,
    );

    return {
      success: true,
      message: '🎉 한정판 스니커즈 구매에 성공하셨습니다!',
      remainStock,
    };
  }
}
