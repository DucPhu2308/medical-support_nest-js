import { Body, Controller, Get, Post, UseGuards, Request, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from './auth.guard';
import { ActiveAccountDto } from './dtos/active-account.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Controller('/api/auth')
@ApiTags('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('/login')
    @HttpCode(200)
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('/verify')
    async verify(@Body() activeAccountDto: ActiveAccountDto) {
        return this.authService.verify(activeAccountDto);
    }

    @Post('/forgot-password')
    async forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Post('/reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
}
