import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // 추가

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // 👇 로그인한 유저(유효한 토큰을 가진 유저)만 이 API를 호출할 수 있게 됩니다!
  @UseGuards(JwtAuthGuard)
  @Post('purchase')
  async purchase(@Request() req) {
    // req.user에는 JwtStrategy의 validate 메서드가 리턴한 유저 정보가 들어있습니다.
    const userId = req.user.id;
    return await this.orderService.purchase(userId);
  }
}
