import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthSuccessResponseDto } from './dto/auth-success-response.dto';

// Cookie name shared between login (set), logout (clear), and JwtAuthGuard (read).
export const AUTH_COOKIE = 'cv-auth';

// 7-day session matching the default JWT expiry.
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1_000;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({
    summary: 'Admin login',
    description:
      'Validates credentials and sets an httpOnly JWT cookie. ' +
      'Limited to 5 attempts per 10 minutes per IP.',
  })
  @ApiOkResponse({ type: AuthSuccessResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiTooManyRequestsResponse({ description: 'Too many login attempts — try again later' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSuccessResponseDto> {
    const token = await this.authService.login(dto.email, dto.password);
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: COOKIE_MAX_AGE_MS,
    });

    return { ok: true };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('cv-auth')
  @ApiOperation({ summary: 'Admin logout — clears auth cookie' })
  @ApiOkResponse({ type: AuthSuccessResponseDto })
  logout(@Res({ passthrough: true }) res: Response): AuthSuccessResponseDto {
    res.clearCookie(AUTH_COOKIE, { path: '/' });
    return { ok: true };
  }
}
