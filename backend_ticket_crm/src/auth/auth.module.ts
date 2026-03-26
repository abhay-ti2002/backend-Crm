import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminController } from './admin.controller';
import { User, UserSchema } from '../schemas/userSchema/user.schema';
import { JwtStrategy } from './jwt.strategy';
import { TicketsModule } from '../modules/tickets/tickets.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'SECRET_KEY',
      signOptions: { expiresIn: '1d' },
    }),
    TicketsModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController, AdminController],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule { }
