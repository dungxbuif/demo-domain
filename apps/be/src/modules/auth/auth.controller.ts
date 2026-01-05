import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  AUTH_COOKIES,
  COOKIE_OPTIONS,
} from '@src/common/constants/auth.constants';
import { AppConfigService } from '@src/common/shared/services/app-config.service';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly appConfigService: AppConfigService,
  ) {}

  @Get('login')
  async login(@Res() res: Response) {
    const oauthUrl = this.authService.getOauthUrl();
    return res.redirect(oauthUrl);
  }

  @Post('exchange')
  async exchange(
    @Body() body: { code: string; state: string },
    @Res() res: Response,
  ) {
    try {
      const { user, tokens } = await this.authService.handleOAuthExchange(
        body.code,
        body.state,
      );

      const cookieConfig = this.appConfigService.cookieConfig;

      res.cookie(AUTH_COOKIES.ACCESS_TOKEN, tokens.access_token, {
        ...cookieConfig,
        maxAge: COOKIE_OPTIONS.ACCESS_TOKEN_EXPIRES,
      });
      res.cookie(AUTH_COOKIES.REFRESH_TOKEN, tokens.refresh_token, {
        ...cookieConfig,
        maxAge: COOKIE_OPTIONS.REFRESH_TOKEN_EXPIRES,
      });

      res.json({
        success: true,
        user: { id: user.mezonId, name: user.name, email: user.email },
      });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  @Post('refresh')
  async refresh(@Request() req, @Res() res: Response) {
    try {
      const refreshToken = req.cookies[AUTH_COOKIES.REFRESH_TOKEN];
      const tokens = await this.authService.handleRefreshToken(refreshToken);

      const cookieConfig = this.appConfigService.cookieConfig;

      res.cookie(AUTH_COOKIES.ACCESS_TOKEN, tokens.access_token, {
        ...cookieConfig,
        maxAge: COOKIE_OPTIONS.ACCESS_TOKEN_EXPIRES,
      });

      res.cookie(AUTH_COOKIES.REFRESH_TOKEN, tokens.refresh_token, {
        ...cookieConfig,
        maxAge: COOKIE_OPTIONS.REFRESH_TOKEN_EXPIRES,
      });

      res.json({ success: true });
    } catch (error) {
      res.clearCookie(AUTH_COOKIES.ACCESS_TOKEN);
      res.clearCookie(AUTH_COOKIES.REFRESH_TOKEN);
      res.status(401).json({ success: false, message: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIES.ACCESS_TOKEN);
    res.clearCookie(AUTH_COOKIES.REFRESH_TOKEN);
    return { message: 'Logged out successfully' };
  }
}
