import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'SECRET_KEY', // use env in production
      ignoreExpiration: false,
    });
  }

  validate(payload: any) {
    //  This object becomes request.user
    return {
      _id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
