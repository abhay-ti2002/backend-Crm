import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { defineAbility } from './ability.factory';
import { RequiredRule } from './check-ability.decorator';

@Injectable()
export class CaslGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rules = this.reflector.get<RequiredRule[]>(
      'check_ability',
      context.getHandler(),
    );

    if (!rules) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const ability = defineAbility(user);

    const hasAccess = rules.every(
      (rule) => ability.can(rule.action, rule.subject), // ✅ FIXED
    );

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
