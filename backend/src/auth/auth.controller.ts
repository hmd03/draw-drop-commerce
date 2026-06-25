import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: any) {
    // 실제로는 class-validator를 이용해 dto 타입을 강력하게 검사해야 합니다.
    return await this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: any) {
    return await this.authService.login(dto);
  }
}
