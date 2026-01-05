import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AUTH_COOKIES } from '@src/common/constants/auth.constants';
import { AppConfigService } from '@src/common/shared/services/app-config.service';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    appConfigService: AppConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.cookies?.[AUTH_COOKIES.ACCESS_TOKEN];
          console.log('[JwtStrategy] Extracting token from cookie:', {
            hasCookies: !!request?.cookies,
            hasToken: !!token,
            cookieNames: Object.keys(request?.cookies || {}),
          });
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: appConfigService.jwtConfig.secret,
    });
  }

  async validate(payload: any) {
    console.log('[JwtStrategy] Validating payload:', payload);
    const user = await this.authService.validateUser(payload.sub);
    console.log('[JwtStrategy] Found user:', user);
    return {
      id: payload.sub,
      mezonUserId: payload.mezonUserId,
      role: payload.role,
      user,
    };
  }
}
