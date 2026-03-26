// src/modules/auth/auth.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() signdto: SignupDto) {
    return this.authService.signup(signdto);
  }

  @Post('login')
  login(@Body() logindto: LoginDto) {
    return this.authService.login(logindto);
  }
}
