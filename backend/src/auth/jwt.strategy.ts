import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Authorization 헤더에서 Bearer 토큰을 추출
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // 만료된 토큰 거부
      secretOrKey: 'your-super-secret-key', // AuthService의 secret과 동일해야 함
    });
  }

  // 토큰이 유효하다면 페이로드(payload)를 해독하여 리턴 (이 값이 req.user에 담깁니다)
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
