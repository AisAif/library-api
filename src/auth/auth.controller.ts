import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './decorators/public.decorator';
import { UpdateUserDTO } from './dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(201)
  async register(@Body() registerDto: RegisterDto) {
    try {
      await this.authService.register(registerDto);
    } catch (err) {
      throw err;
    }
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Req() req) {
    return { access_token: this.authService.login(req.user) };
  }

  @Get('profile')
  @HttpCode(200)
  profile(@Req() req) {
    return req.user;
  }

  @Patch('profile')
  @HttpCode(200)
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDTO) {
    try {
      const access_token = await this.authService.updateProfile(
        req.user.username,
        updateUserDto,
      );

      return {
        access_token,
      };
    } catch (err) {
      throw err;
    }
  }
}
