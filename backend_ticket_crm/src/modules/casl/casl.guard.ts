import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from './casl-ability.factory';
import { CHECK_ABILITY, RequiredRule } from './check-ability.decorator';

@Injectable()
export class CaslGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules =
      this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) || [];

    if (!rules.length) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const ability = this.caslAbilityFactory.defineAbility(user);


    const subject = this.detectSubject(request, rules);

    const hasAccess = rules.every((rule) => {
      // If we have a concrete instance (from body or params), we must tell CASL what type it is
      // so it can match against rules defined for that Class.
      if (subject && typeof subject === 'object' && typeof rule.subject === 'function' && !(subject instanceof (rule.subject as any))) {
        // Create a "fake" instance or hint the type
        const subjectWithContext = Object.assign(Object.create((rule.subject as any).prototype), subject);
        return ability.can(rule.action, subjectWithContext);
      }
      
      return ability.can(rule.action, subject ?? rule.subject);
    });

    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }

    return true;
  }

  /**
   * Try to extract actual resource from request
   */
  private detectSubject(request: any, rules: RequiredRule[]) {
    // Priority 1: if resource already attached (best practice)
    if (request.subject) return request.subject;

    // Priority 2: body (for create/update)
    if (request.body && Object.keys(request.body).length) {
      return request.body;
    }

    // Priority 3: params (for routes like /tickets/:id)
    if (request.params && Object.keys(request.params).length) {
      return request.params;
    }

    // fallback → no object, will use subject type
    return null;
  }
}